/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {chain, noop, Rule, Tree} from '@angular-devkit/schematics';
import {
  addModuleImportToRootModule,
  getProjectFromWorkspace,
  getProjectMainFile,
  getProjectStyleFile,
  hasNgModuleImport,
} from '@angular/cdk/schematics';
import {red, bold, italic} from 'chalk';
import {getWorkspace} from '@schematics/angular/utility/config';
import {getAppModulePath} from '@schematics/angular/utility/ng-ast-utils';
import {addFontsToIndex} from './fonts/material-fonts';
import {addHammerJsToMain} from './gestures/hammerjs-import';
import {Schema} from './schema';
import {addThemeToAppStyles} from './theming/theming';

/** Name of the Angular module that enables Angular browser animations. */
const browserAnimationsModuleName = 'BrowserAnimationsModule';

/** Name of the module that switches Angular animations to a noop implementation. */
const noopAnimationsModuleName = 'NoopAnimationsModule';

/**
 * Scaffolds the basics of a Angular Material application, this includes:
 *  - Add Packages to package.json
 *  - Adds pre-built themes to styles.ext
 *  - Adds Browser Animation to app.module
 */
export default function(options: Schema): Rule {
  return chain([
    options && options.gestures ? addHammerJsToMain(options) : noop(),
    addAnimationsModule(options),
    addThemeToAppStyles(options),
    addFontsToIndex(options),
    addMaterialAppStyles(options),
  ]);
}

/**
 * Adds an animation module to the root module of the specified project. In case the "animations"
 * option is set to false, we still add the `NoopAnimationsModule` because otherwise various
 * components of Angular Material will throw an exception.
 */
function addAnimationsModule(options: Schema) {
  return (host: Tree) => {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    const appModulePath = getAppModulePath(host, getProjectMainFile(project));

    if (options.animations) {
      // In case the project explicitly uses the NoopAnimationsModule, we should print a warning
      // message that makes the user aware of the fact that we won't automatically set up
      // animations. If we would add the BrowserAnimationsModule while the NoopAnimationsModule
      // is already configured, we would cause unexpected behavior and runtime exceptions.
      if (hasNgModuleImport(host, appModulePath, noopAnimationsModuleName)) {
        return console.warn(red(`Could not set up "${bold(browserAnimationsModuleName)}" ` +
            `because "${bold(noopAnimationsModuleName)}" is already imported. Please manually ` +
            `set up browser animations.`));
      }

      addModuleImportToRootModule(host, browserAnimationsModuleName,
          '@angular/platform-browser/animations', project);
    } else if (!hasNgModuleImport(host, appModulePath, browserAnimationsModuleName)) {
      // Do not add the NoopAnimationsModule module if the project already explicitly uses
      // the BrowserAnimationsModule.
      addModuleImportToRootModule(host, noopAnimationsModuleName,
        '@angular/platform-browser/animations', project);
    }

    return host;
  };
}

/**
 * Adds custom Material styles to the project style file. The custom CSS sets up the Roboto font
 * and reset the default browser body margin.
 */
function addMaterialAppStyles(options: Schema) {
  return (host: Tree) => {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    const styleFilePath = getProjectStyleFile(project);

    if (!styleFilePath) {
      console.warn(red(`Could not find the default style file for this project.`));
      console.warn(red(`Please consider manually setting up the Roboto font in your CSS.`));
      return;
    }

    const buffer = host.read(styleFilePath);

    if (!buffer) {
      console.warn(red(`Could not read the default style file within the project ` +
        `(${italic(styleFilePath)})`));
      console.warn(red(`Please consider manually setting up the Robot font.`));
      return;
    }

    const htmlContent = buffer.toString();
    const insertion = '\n' +
      `html, body { height: 100%; }\n` +
      `body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }\n`;

    if (htmlContent.includes(insertion)) {
      return;
    }

    const recorder = host.beginUpdate(styleFilePath);

    recorder.insertLeft(htmlContent.length, insertion);
    host.commitUpdate(recorder);
  };
}
