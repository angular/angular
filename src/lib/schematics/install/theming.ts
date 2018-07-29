/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicsException, Tree} from '@angular-devkit/schematics';
import {InsertChange} from '@schematics/angular/utility/change';
import {getWorkspace, WorkspaceProject, WorkspaceSchema} from '@schematics/angular/utility/config';
import {getStylesPath} from '../utils/ast';
import {getProjectFromWorkspace} from '../utils/get-project';
import {createCustomTheme} from './custom-theme';
import {Schema} from './schema';


/** Add pre-built styles to the main project style file. */
export function addThemeToAppStyles(options: Schema): (host: Tree) => Tree {
  return function(host: Tree): Tree {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    // Because the build setup for the Angular CLI can be changed so dramatically, we can't know
    // where to generate anything if the project is not using the default config for build and test.
    assertDefaultProjectConfig(project);

    const themeName = options.theme || 'indigo-pink';
    if (themeName === 'custom') {
      insertCustomTheme(project, options.project, host);
    } else {
      insertPrebuiltTheme(project, host, themeName, workspace, options.project);
    }

    return host;
  };
}

/** Insert a custom theme to styles.scss file. */
function insertCustomTheme(project: WorkspaceProject, projectName: string, host: Tree) {
  const stylesPath = getStylesPath(project);
  const buffer = host.read(stylesPath);

  if (buffer) {
    const insertion = new InsertChange(stylesPath, 0, createCustomTheme(projectName));
    const recorder = host.beginUpdate(stylesPath);
    recorder.insertLeft(insertion.pos, insertion.toAdd);
    host.commitUpdate(recorder);
  } else {
    console.warn(`Skipped custom theme; could not find file: ${stylesPath}`);
  }
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

/** Throws if the project is not using the default build and test config. */
function assertDefaultProjectConfig(project: WorkspaceProject) {
  if (!isProjectUsingDefaultConfig(project)) {
    throw new SchematicsException('Your project is not using the default configuration for ' +
     'build and test. The Angular Material schematics can only be used with the default ' +
     'configuration');
  }
}

/** Gets whether the Angular CLI project is using the default build configuration. */
function isProjectUsingDefaultConfig(project: WorkspaceProject) {
  const defaultBuilder = '@angular-devkit/build-angular:browser';
  const defaultTestBuilder = '@angular-devkit/build-angular:karma';

  return project.architect &&
      project.architect['build'] &&
      project.architect['build']['builder'] === defaultBuilder &&
      project.architect['test'] &&
      project.architect['test']['builder'] === defaultTestBuilder;
}
