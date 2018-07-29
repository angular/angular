/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {chain, Rule, noop, Tree} from '@angular-devkit/schematics';
import {buildComponent} from '../utils/build-component';
import {Schema} from './schema';
import {addModuleImportToModule, findModuleFromOptions} from '../utils/ast';

/**
 * Scaffolds a new navigation component.
 * Internally it bootstraps the base component schematic
 */
export default function(options: Schema): Rule {
  return chain([
    buildComponent({...options}, {
      template: options.inlineTemplate &&
      './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.html',
      stylesheet: options.inlineStyle &&
      './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.__styleext__',
    }),
    options.skipImport ? noop() : addNavModulesToModule(options)
  ]);
}

/**
 * Adds the required modules to the relative module.
 */
function addNavModulesToModule(options: Schema) {
  return (host: Tree) => {
    const modulePath = findModuleFromOptions(host, options);
    addModuleImportToModule(host, modulePath, 'LayoutModule', '@angular/cdk/layout');
    addModuleImportToModule(host, modulePath, 'MatToolbarModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatButtonModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatSidenavModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatIconModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatListModule', '@angular/material');
    return host;
  };
}
