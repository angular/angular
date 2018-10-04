/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {chain, noop, Rule, Tree} from '@angular-devkit/schematics';
import {addModuleImportToModule, buildComponent, findModuleFromOptions} from '../../utils';
import {Schema} from './schema';

/** Scaffolds a new Angular component that uses the Drag and Drop module. */
export default function(options: Schema): Rule {
  return chain([
    buildComponent({...options}, {
      template: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.html',
      stylesheet: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.__styleext__',
    }),
    options.skipImport ? noop() : addDragDropModulesToModule(options)
  ]);
}

/** Adds the required modules to the main module of the CLI project. */
function addDragDropModulesToModule(options: Schema) {
  return (host: Tree) => {
    const modulePath = findModuleFromOptions(host, options)!;

    addModuleImportToModule(host, modulePath, 'DragDropModule', '@angular/cdk/drag-drop');
    return host;
  };
}
