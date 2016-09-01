/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModuleFactory} from './ng_module_factory';

/**
 * Used to load ng module factories.
 * @stable
 */
export abstract class NgModuleFactoryLoader {
  abstract load(path: string): Promise<NgModuleFactory<any>>;
}

let deferreds: {[id: string]: NgModuleFactory<any>} = {};

/**
 * Registers a loaded module. Should only be called from generated NgModuleFactory code.
 * @experimental
 */
export function registerLoadedModule(id: string, factory: NgModuleFactory<any>) {
  let existing = deferreds[id];
  if (existing) {
    throw new Error(`Duplicate module registered for ${id
                    } - ${existing.moduleType.name} vs ${factory.moduleType.name}`);
  }
  deferreds[id] = factory;
}

export function clearModulesForTest() {
  deferreds = {};
}

/**
 * Returns the NgModuleFactory with the given id, if it exists and has been loaded.
 * Modules that do not specify an `id` cannot be retrieved. Returns `null` if no such module exists (yet).
 * @experimental
 */
export function getNgModule(id: string): NgModuleFactory<any> {
  if (!deferreds[id]) throw new Error(`Module ${id} not loaded`);
  return deferreds[id];
}
