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

let moduleFactories = new Map<string, NgModuleFactory<any>>();

/**
 * Registers a loaded module. Should only be called from generated NgModuleFactory code.
 * @experimental
 */
export function registerModuleFactory(id: string, factory: NgModuleFactory<any>) {
  const existing = moduleFactories.get(id);
  if (existing) {
    throw new Error(`Duplicate module registered for ${id
                    } - ${existing.moduleType.name} vs ${factory.moduleType.name}`);
  }
  moduleFactories.set(id, factory);
}

export function clearModulesForTest() {
  moduleFactories = new Map<string, NgModuleFactory<any>>();
}

/**
 * Returns the NgModuleFactory with the given id, if it exists and has been loaded.
 * Factories for modules that do not specify an `id` cannot be retrieved. Throws if the module
 * cannot be found.
 * @experimental
 */
export function getModuleFactory(id: string): NgModuleFactory<any> {
  const factory = moduleFactories.get(id);
  if (!factory) throw new Error(`No module with ID ${id} loaded`);
  return factory;
}
