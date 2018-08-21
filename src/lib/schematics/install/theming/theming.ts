/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalize} from '@angular-devkit/core';
import {SchematicsException, Tree} from '@angular-devkit/schematics';
import {InsertChange} from '@schematics/angular/utility/change';
import {getWorkspace, WorkspaceProject, WorkspaceSchema} from '@schematics/angular/utility/config';
import {join} from 'path';
import {getProjectFromWorkspace} from '../../utils/get-project';
import {getProjectStyleFile} from '../../utils/project-style-file';
import {Schema} from '../schema';
import {createCustomTheme} from './custom-theme';


/** Add pre-built styles to the main project style file. */
export function addThemeToAppStyles(options: Schema): (host: Tree) => Tree {
  return function(host: Tree): Tree {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    const themeName = options.theme || 'indigo-pink';

    // Because the build setup for the Angular CLI can be changed so dramatically, we can't know
    // where to generate anything if the project is not using the default config for build and test.
    assertDefaultBuildersConfigured(project);

    if (themeName === 'custom') {
      insertCustomTheme(project, options.project, host, workspace);
    } else {
      insertPrebuiltTheme(project, host, themeName, workspace, options.project);
    }

    return host;
  };
}

/**
 * Insert a custom theme to project style file. If no valid style file could be found, a new
 * Scss file for the custom theme will be created.
 */
function insertCustomTheme(project: WorkspaceProject, projectName: string, host: Tree,
                           workspace: WorkspaceSchema) {

  const stylesPath = getProjectStyleFile(project, 'scss');
  const themeContent = createCustomTheme(projectName);

  if (!stylesPath) {
    // Normalize the path through the devkit utilities because we want to avoid having
    // unnecessary path segments and windows backslash delimiters.
    const customThemePath = normalize(join(project.sourceRoot, 'custom-theme.scss'));

    host.create(customThemePath, themeContent);
    addStyleToTarget(project.architect['build'], host, customThemePath, workspace);
    return;
  }

  const insertion = new InsertChange(stylesPath, 0, themeContent);
  const recorder = host.beginUpdate(stylesPath);

  recorder.insertLeft(insertion.pos, insertion.toAdd);
  host.commitUpdate(recorder);
}

/** Insert a pre-built theme into the angular.json file. */
function insertPrebuiltTheme(project: WorkspaceProject, host: Tree, theme: string,
                             workspace: WorkspaceSchema, projectName: string) {

  // Path needs to be always relative to the `package.json` or workspace root.
  const themePath =  `./node_modules/@angular/material/prebuilt-themes/${theme}.css`;

  if (project.architect) {
    addStyleToTarget(project.architect['build'], host, themePath, workspace);
    addStyleToTarget(project.architect['test'], host, themePath, workspace);
  } else {
    throw new SchematicsException(`${projectName} does not have an architect configuration`);
  }
}

/** Adds a style entry to the given target. */
function addStyleToTarget(target: any, host: Tree, asset: string, workspace: WorkspaceSchema) {
  // We can't assume that any of these properties are defined, so safely add them as we go
  // if necessary.
  if (!target.options) {
    target.options = {styles: [asset]};
  } else if (!target.options.styles) {
    target.options.styles = [asset];
  } else {
    const existingStyles = target.options.styles.map(s => typeof s === 'string' ? s : s.input);
    const hasGivenTheme = existingStyles.find(s => s.includes(asset));
    const hasOtherTheme = existingStyles.find(s => s.includes('material/prebuilt'));

    if (!hasGivenTheme && !hasOtherTheme) {
      target.options.styles.unshift(asset);
    }
  }

  host.overwrite('angular.json', JSON.stringify(workspace, null, 2));
}

/** Throws if the project is not using the default Angular devkit builders. */
function assertDefaultBuildersConfigured(project: WorkspaceProject) {
  const defaultBuilder = '@angular-devkit/build-angular:browser';
  const defaultTestBuilder = '@angular-devkit/build-angular:karma';

  const hasDefaultBuilders = project.architect &&
      project.architect['build'] &&
      project.architect['build']['builder'] === defaultBuilder &&
      project.architect['test'] &&
      project.architect['test']['builder'] === defaultTestBuilder;

  if (!hasDefaultBuilders) {
    throw new SchematicsException(
      'Your project is not using the default builders for build and test. The Angular Material ' +
      'schematics can only be used if the original builders from the Angular CLI are configured.');
  }
}
