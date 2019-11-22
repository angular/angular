/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalize, logging} from '@angular-devkit/core';
import {WorkspaceProject, WorkspaceSchema} from '@angular-devkit/core/src/experimental/workspace';
import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {
  addBodyClass,
  defaultTargetBuilders,
  getProjectFromWorkspace,
  getProjectStyleFile,
  getProjectTargetOptions,
  getProjectIndexFiles,
} from '@angular/cdk/schematics';
import {InsertChange} from '@schematics/angular/utility/change';
import {getWorkspace} from '@schematics/angular/utility/config';
import {join} from 'path';
import {Schema} from '../schema';
import {createCustomTheme} from './create-custom-theme';

/** Path segment that can be found in paths that refer to a prebuilt theme. */
const prebuiltThemePathSegment = '@angular/material/prebuilt-themes';

/** Default file name of the custom theme that can be generated. */
const defaultCustomThemeFilename = 'custom-theme.scss';

/** Add pre-built styles to the main project style file. */
export function addThemeToAppStyles(options: Schema): Rule {
  return function(host: Tree, context: SchematicContext): Tree {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    const themeName = options.theme || 'indigo-pink';

    if (themeName === 'custom') {
      insertCustomTheme(project, options.project, host, workspace, context.logger);
    } else {
      insertPrebuiltTheme(project, host, themeName, workspace, context.logger);
    }

    return host;
  };
}

/** Adds the global typography class to the body element. */
export function addTypographyClass(options: Schema): (host: Tree) => Tree {
  return function(host: Tree): Tree {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    const projectIndexFiles = getProjectIndexFiles(project);

    if (!projectIndexFiles.length) {
      throw new SchematicsException('No project index HTML file could be found.');
    }

    projectIndexFiles.forEach(indexFilePath => addBodyClass(host, indexFilePath, 'mat-typography'));

    return host;
  };
}

/**
 * Insert a custom theme to project style file. If no valid style file could be found, a new
 * Scss file for the custom theme will be created.
 */
function insertCustomTheme(project: WorkspaceProject, projectName: string, host: Tree,
                           workspace: WorkspaceSchema, logger: logging.LoggerApi) {

  const stylesPath = getProjectStyleFile(project, 'scss');
  const themeContent = createCustomTheme(projectName);

  if (!stylesPath) {
    if (!project.sourceRoot) {
      throw new SchematicsException(`Could not find source root for project: "${projectName}". ` +
        `Please make sure that the "sourceRoot" property is set in the workspace config.`);
    }

    // Normalize the path through the devkit utilities because we want to avoid having
    // unnecessary path segments and windows backslash delimiters.
    const customThemePath = normalize(join(project.sourceRoot, defaultCustomThemeFilename));

    if (host.exists(customThemePath)) {
      logger.warn(`Cannot create a custom Angular Material theme because
          ${customThemePath} already exists. Skipping custom theme generation.`);
      return;
    }

    host.create(customThemePath, themeContent);
    addThemeStyleToTarget(project, 'build', host, customThemePath, workspace, logger);
    return;
  }

  const insertion = new InsertChange(stylesPath, 0, themeContent);
  const recorder = host.beginUpdate(stylesPath);

  recorder.insertLeft(insertion.pos, insertion.toAdd);
  host.commitUpdate(recorder);
}

/** Insert a pre-built theme into the angular.json file. */
function insertPrebuiltTheme(project: WorkspaceProject, host: Tree, theme: string,
                             workspace: WorkspaceSchema, logger: logging.LoggerApi) {

  // Path needs to be always relative to the `package.json` or workspace root.
  const themePath =  `./node_modules/@angular/material/prebuilt-themes/${theme}.css`;

  addThemeStyleToTarget(project, 'build', host, themePath, workspace, logger);
  addThemeStyleToTarget(project, 'test', host, themePath, workspace, logger);
}

/** Adds a theming style entry to the given project target options. */
function addThemeStyleToTarget(project: WorkspaceProject, targetName: 'test' | 'build', host: Tree,
                               assetPath: string, workspace: WorkspaceSchema,
                               logger: logging.LoggerApi) {
  // Do not update the builder options in case the target does not use the default CLI builder.
  if (!validateDefaultTargetBuilder(project, targetName, logger)) {
    return;
  }

  const targetOptions = getProjectTargetOptions(project, targetName);

  if (!targetOptions.styles) {
    targetOptions.styles = [assetPath];
  } else {
    const existingStyles = targetOptions.styles.map(s => typeof s === 'string' ? s : s.input);

    for (let [index, stylePath] of existingStyles.entries()) {
      // If the given asset is already specified in the styles, we don't need to do anything.
      if (stylePath === assetPath) {
        return;
      }

      // In case a prebuilt theme is already set up, we can safely replace the theme with the new
      // theme file. If a custom theme is set up, we are not able to safely replace the custom
      // theme because these files can contain custom styles, while prebuilt themes are
      // always packaged and considered replaceable.
      if (stylePath.includes(defaultCustomThemeFilename)) {
        logger.error(`Could not add the selected theme to the CLI project ` +
            `configuration because there is already a custom theme file referenced.`);
        logger.info(`Please manually add the following style file to your configuration:`);
        logger.info(`    ${assetPath}`);
        return;
      } else if (stylePath.includes(prebuiltThemePathSegment)) {
        targetOptions.styles.splice(index, 1);
      }
    }

    targetOptions.styles.unshift(assetPath);
  }

  host.overwrite('angular.json', JSON.stringify(workspace, null, 2));
}

/**
 * Validates that the specified project target is configured with the default builders which are
 * provided by the Angular CLI. If the configured builder does not match the default builder,
 * this function can either throw or just show a warning.
 */
function validateDefaultTargetBuilder(project: WorkspaceProject, targetName: 'build' | 'test',
                                      logger: logging.LoggerApi) {
  const defaultBuilder = defaultTargetBuilders[targetName];
  const targetConfig = project.architect && project.architect[targetName] ||
                       project.targets && project.targets[targetName];
  const isDefaultBuilder = targetConfig && targetConfig['builder'] === defaultBuilder;

  // Because the build setup for the Angular CLI can be customized by developers, we can't know
  // where to put the theme file in the workspace configuration if custom builders are being
  // used. In case the builder has been changed for the "build" target, we throw an error and
  // exit because setting up a theme is a primary goal of `ng-add`. Otherwise if just the "test"
  // builder has been changed, we warn because a theme is not mandatory for running tests
  // with Material. See: https://github.com/angular/components/issues/14176
  if (!isDefaultBuilder && targetName === 'build') {
    throw new SchematicsException(`Your project is not using the default builders for ` +
      `"${targetName}". The Angular Material schematics cannot add a theme to the workspace ` +
      `configuration if the builder has been changed.`);
  } else if (!isDefaultBuilder) {
    // for non-build targets we gracefully report the error without actually aborting the
    // setup schematic. This is because a theme is not mandatory for running tests.
    logger.warn(`Your project is not using the default builders for "${targetName}". This ` +
      `means that we cannot add the configured theme to the "${targetName}" target.`);
  }

  return isDefaultBuilder;
}
