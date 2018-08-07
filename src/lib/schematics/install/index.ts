/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  chain,
  noop,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {InsertChange} from '@schematics/angular/utility/change';
import {getWorkspace} from '@schematics/angular/utility/config';
import {materialVersion, requiredAngularVersion} from './version-names';
import {addModuleImportToRootModule, getStylesPath} from '../utils/ast';
import {getProjectFromWorkspace} from '../utils/get-project';
import {addHeadLink} from '../utils/html';
import {addPackageToPackageJson, getPackageVersionFromPackageJson} from '../utils/package';
import {Schema} from './schema';
import {addThemeToAppStyles} from './theming';
import * as parse5 from 'parse5';

/**
 * Scaffolds the basics of a Angular Material application, this includes:
 *  - Add Packages to package.json
 *  - Adds pre-built themes to styles.ext
 *  - Adds Browser Animation to app.module
 */
export default function(options: Schema): Rule {
  if (!parse5) {
    throw new SchematicsException('Parse5 is required but could not be found! Please install ' +
      '"parse5" manually in order to continue.');
  }

  return chain([
    options && options.skipPackageJson ? noop() : addMaterialToPackageJson(),
    addThemeToAppStyles(options),
    addAnimationRootConfig(options),
    addFontsToIndex(options),
    addBodyMarginToStyles(options),
  ]);
}

/** Add material, cdk, animations to package.json if not already present. */
function addMaterialToPackageJson() {
  return (host: Tree, context: SchematicContext) => {
    // Version tag of the `@angular/core` dependency that has been loaded from the `package.json`
    // of the CLI project. This tag should be preferred because all Angular dependencies should
    // have the same version tag if possible.
    const ngCoreVersionTag = getPackageVersionFromPackageJson(host, '@angular/core');

    addPackageToPackageJson(host, 'dependencies', '@angular/cdk', materialVersion);
    addPackageToPackageJson(host, 'dependencies', '@angular/material', materialVersion);
    addPackageToPackageJson(host, 'dependencies', '@angular/animations',
        ngCoreVersionTag || requiredAngularVersion);

    context.addTask(new NodePackageInstallTask());

    return host;
  };
}

/** Add browser animation module to app.module */
function addAnimationRootConfig(options: Schema) {
  return (host: Tree) => {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    addModuleImportToRootModule(
        host,
        'BrowserAnimationsModule',
        '@angular/platform-browser/animations',
        project);

    return host;
  };
}

/** Adds fonts to the index.ext file */
function addFontsToIndex(options: Schema) {
  return (host: Tree) => {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    const fonts = [
      'https://fonts.googleapis.com/css?family=Roboto:300,400,500',
      'https://fonts.googleapis.com/icon?family=Material+Icons',
    ];

    fonts.forEach(f => addHeadLink(host, project, `\n<link href="${f}" rel="stylesheet">`));
    return host;
  };
}

/** Add 0 margin to body in styles.ext */
function addBodyMarginToStyles(options: Schema) {
  return (host: Tree) => {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    const stylesPath = getStylesPath(project);

    const buffer = host.read(stylesPath);
    if (buffer) {
      const src = buffer.toString();
      const insertion = new InsertChange(stylesPath, src.length,
        `\nhtml, body { height: 100%; }\nbody { margin: 0; font-family: 'Roboto', sans-serif; }\n`);
      const recorder = host.beginUpdate(stylesPath);
      recorder.insertLeft(insertion.pos, insertion.toAdd);
      host.commitUpdate(recorder);
    } else {
      console.warn(`Skipped body reset; could not find file: ${stylesPath}`);
    }
  };
}
