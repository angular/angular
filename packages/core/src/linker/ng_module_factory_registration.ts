/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {NgModuleType} from '../render3/ng_module_ref';
import {stringify} from '../util/stringify';

import {NgModuleFactory} from './ng_module_factory';


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

export function registerNgModuleType(ngModuleType: NgModuleType) {
  if (ngModuleType.ngModuleDef.id !== null) {
    const id = ngModuleType.ngModuleDef.id;
    const existing = modules.get(id) as NgModuleType | null;
    assertSameOrNotExisting(id, existing, ngModuleType);
    modules.set(id, ngModuleType);
  }

  let imports = ngModuleType.ngModuleDef.imports;
  if (imports instanceof Function) {
    imports = imports();
  }
  if (imports) {
    imports.forEach(i => registerNgModuleType(i as NgModuleType));
  }
}

export function clearModulesForTest(): void {
  modules.clear();
}

export function getRegisteredNgModuleType(id: string) {
  return modules.get(id);
}
