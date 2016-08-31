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

let deferreds: {[k: string]: NgModuleFactory<any>} = {};

/**
 * Registers a loaded module. Should only be called from generated NgModuleFactory code.
 * @experimental
 */
export function registerLoadedModule(loadToken: string, factory: NgModuleFactory<any>) {
  let existing = deferreds[loadToken];
  if (existing) {
    throw new Error(`Duplicate module registered for ${loadToken
                    } - ${existing.moduleType.name} vs ${factory.moduleType.name}`);
  }
  deferreds[loadToken] = factory;
}

export function clearModulesForTest() {
  deferreds = {};
}

/**
 * Returns a promise that will be resolved once the module for the given loadToken is loaded.
 * Only one promise can be created per module to be resolved.
 * @experimental
 */
export function getNgModule(loadToken: string): NgModuleFactory<any> {
  if (!deferreds[loadToken]) throw new Error(`Module ${loadToken} not loaded`);
  return deferreds[loadToken];
}
