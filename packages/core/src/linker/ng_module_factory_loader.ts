/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {NgModuleFactory as R3NgModuleFactory, NgModuleType} from '../render3/ng_module_ref';
import {stringify} from '../util/stringify';

import {NgModuleFactory} from './ng_module_factory';


/**
 * Used to load ng module factories.
 *
 * @publicApi
 */
export abstract class NgModuleFactoryLoader {
  abstract load(path: string): Promise<NgModuleFactory<any>>;
}

/**
 * Map of module-id to the corresponding NgModule.
 * - In pre Ivy we track NgModuleFactory,
 * - In post Ivy we track the NgModuleType
 */
const modules = new Map<string, NgModuleFactory<any>|NgModuleType>();

/**
 * Registers a loaded module. Should only be called from generated NgModuleFactory code.
 * @publicApi
 */
export function registerModuleFactory(id: string, factory: NgModuleFactory<any>) {
  const existing = modules.get(id) as NgModuleFactory<any>;
  assertSameOrNotExisting(id, existing && existing.moduleType, factory.moduleType);
  modules.set(id, factory);
}

function assertSameOrNotExisting(id: string, type: Type<any>| null, incoming: Type<any>): void {
  if (type && type !== incoming) {
    throw new Error(
        `Duplicate module registered for ${id} - ${stringify(type)} vs ${stringify(type.name)}`);
  }
}

export function registerNgModuleType(id: string, ngModuleType: NgModuleType) {
  const existing = modules.get(id) as NgModuleType | null;
  assertSameOrNotExisting(id, existing, ngModuleType);
  modules.set(id, ngModuleType);
}

export function clearModulesForTest(): void {
  modules.clear();
}

export function getModuleFactory__PRE_R3__(id: string): NgModuleFactory<any> {
  const factory = modules.get(id) as NgModuleFactory<any>| null;
  if (!factory) throw noModuleError(id);
  return factory;
}

export function getModuleFactory__POST_R3__(id: string): NgModuleFactory<any> {
  const type = modules.get(id) as NgModuleType | null;
  if (!type) throw noModuleError(id);
  return new R3NgModuleFactory(type);
}

/**
 * Returns the NgModuleFactory with the given id, if it exists and has been loaded.
 * Factories for modules that do not specify an `id` cannot be retrieved. Throws if the module
 * cannot be found.
 * @publicApi
 */
export const getModuleFactory: (id: string) => NgModuleFactory<any> = getModuleFactory__PRE_R3__;

function noModuleError(id: string, ): Error {
  return new Error(`No module with ID ${id} loaded`);
}
