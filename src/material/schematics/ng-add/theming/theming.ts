/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalize, logging} from '@angular-devkit/core';
import {ProjectDefinition} from '@angular-devkit/core/src/workspace';
import {
  chain,
  noop,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import {
  addBodyClass,
  defaultTargetBuilders,
  getProjectFromWorkspace,
  getProjectStyleFile,
  getProjectTargetOptions,
  getProjectIndexFiles,
} from '@angular/cdk/schematics';
import {InsertChange} from '@schematics/angular/utility/change';
import {getWorkspace, updateWorkspace} from '@schematics/angular/utility/workspace';
import {join} from 'path';
import {Schema} from '../schema';
import {createCustomTheme} from './create-custom-theme';

/** Path segment that can be found in paths that refer to a prebuilt theme. */
const prebuiltThemePathSegment = '@angular/material/prebuilt-themes';

/** Default file name of the custom theme that can be generated. */
const defaultCustomThemeFilename = 'custom-theme.scss';

/** Add pre-built styles to the main project style file. */
export function addThemeToAppStyles(options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const themeName = options.theme || 'indigo-pink';
    return themeName === 'custom'
      ? insertCustomTheme(options.project, host, context.logger)
      : insertPrebuiltTheme(options.project, themeName, context.logger);
  };
}

/** Adds the global typography class to the body element. */
export function addTypographyClass(options: Schema): Rule {
  return async (host: Tree) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    const projectIndexFiles = getProjectIndexFiles(project);

    if (!projectIndexFiles.length) {
      throw new SchematicsException('No project index HTML file could be found.');
    }

    if (options.typography) {
      projectIndexFiles.forEach(path => addBodyClass(host, path, 'mat-typography'));
    }
  };
}

/**
 * Insert a custom theme to project style file. If no valid style file could be found, a new
 * Scss file for the custom theme will be created.
 */
async function insertCustomTheme(
  projectName: string,
  host: Tree,
  logger: logging.LoggerApi,
): Promise<Rule> {
  const workspace = await getWorkspace(host);
  const project = getProjectFromWorkspace(workspace, projectName);
  const stylesPath = getProjectStyleFile(project, 'scss');
  const themeContent = createCustomTheme(projectName);

  if (!stylesPath) {
    if (!project.sourceRoot) {
      throw new SchematicsException(
        `Could not find source root for project: "${projectName}". ` +
          `Please make sure that the "sourceRoot" property is set in the workspace config.`,
      );
    }

    // Normalize the path through the devkit utilities because we want to avoid having
    // unnecessary path segments and windows backslash delimiters.
    const customThemePath = normalize(join(project.sourceRoot, defaultCustomThemeFilename));

    if (host.exists(customThemePath)) {
      logger.warn(`Cannot create a custom Angular Material theme because
          ${customThemePath} already exists. Skipping custom theme generation.`);
      return noop();
    }

    host.create(customThemePath, themeContent);
    return addThemeStyleToTarget(projectName, 'build', customThemePath, logger);
  }

  const insertion = new InsertChange(stylesPath, 0, themeContent);
  const recorder = host.beginUpdate(stylesPath);

  recorder.insertLeft(insertion.pos, insertion.toAdd);
  host.commitUpdate(recorder);
  return noop();
}

/** Insert a pre-built theme into the angular.json file. */
function insertPrebuiltTheme(project: string, theme: string, logger: logging.LoggerApi): Rule {
  // Path needs to be always relative to the `package.json` or workspace root.
  const themePath = `./node_modules/@angular/material/prebuilt-themes/${theme}.css`;

  return chain([
    addThemeStyleToTarget(project, 'build', themePath, logger),
    addThemeStyleToTarget(project, 'test', themePath, logger),
  ]);
}

/** Adds a theming style entry to the given project target options. */
function addThemeStyleToTarget(
  projectName: string,
  targetName: 'test' | 'build',
  assetPath: string,
  logger: logging.LoggerApi,
): Rule {
  return updateWorkspace(workspace => {
    const project = getProjectFromWorkspace(workspace, projectName);

    // Do not update the builder options in case the target does not use the default CLI builder.
    if (!validateDefaultTargetBuilder(project, targetName, logger)) {
      return;
    }

    const targetOptions = getProjectTargetOptions(project, targetName);
    const styles = targetOptions.styles as (string | {input: string})[];

    if (!styles) {
      targetOptions.styles = [assetPath];
    } else {
      const existingStyles = styles.map(s => (typeof s === 'string' ? s : s.input));

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
          logger.error(
            `Could not add the selected theme to the CLI project ` +
              `configuration because there is already a custom theme file referenced.`,
          );
          logger.info(`Please manually add the following style file to your configuration:`);
          logger.info(`    ${assetPath}`);
          return;
        } else if (stylePath.includes(prebuiltThemePathSegment)) {
          styles.splice(index, 1);
        }
      }

      styles.unshift(assetPath);
    }
  });
}

/**
 * Validates that the specified project target is configured with the default builders which are
 * provided by the Angular CLI. If the configured builder does not match the default builder,
 * this function can either throw or just show a warning.
 */
function validateDefaultTargetBuilder(
  project: ProjectDefinition,
  targetName: 'build' | 'test',
  logger: logging.LoggerApi,
) {
  const defaultBuilder = defaultTargetBuilders[targetName];
  const targetConfig = project.targets && project.targets.get(targetName);
  const isDefaultBuilder = targetConfig && targetConfig['builder'] === defaultBuilder;

  // Because the build setup for the Angular CLI can be customized by developers, we can't know
  // where to put the theme file in the workspace configuration if custom builders are being
  // used. In case the builder has been changed for the "build" target, we throw an error and
  // exit because setting up a theme is a primary goal of `ng-add`. Otherwise if just the "test"
  // builder has been changed, we warn because a theme is not mandatory for running tests
  // with Material. See: https://github.com/angular/components/issues/14176
  if (!isDefaultBuilder && targetName === 'build') {
    throw new SchematicsException(
      `Your project is not using the default builders for ` +
        `"${targetName}". The Angular Material schematics cannot add a theme to the workspace ` +
        `configuration if the builder has been changed.`,
    );
  } else if (!isDefaultBuilder) {
    // for non-build targets we gracefully report the error without actually aborting the
    // setup schematic. This is because a theme is not mandatory for running tests.
    logger.warn(
      `Your project is not using the default builders for "${targetName}". This ` +
        `means that we cannot add the configured theme to the "${targetName}" target.`,
    );
  }

  return isDefaultBuilder;
}
