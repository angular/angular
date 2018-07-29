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
 * Scaffolds a new table component.
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
    options.skipImport ? noop() : addFormModulesToModule(options)
  ]);
}

/**
 * Adds the required modules to the relative module.
 */
function addFormModulesToModule(options: Schema) {
  return (host: Tree) => {
    const modulePath = findModuleFromOptions(host, options);
    addModuleImportToModule(host, modulePath, 'MatInputModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatButtonModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatSelectModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatRadioModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatCardModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'ReactiveFormsModule', '@angular/forms');
    return host;
  };
}
