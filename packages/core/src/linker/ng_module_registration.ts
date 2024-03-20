/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {Type} from '../interface/type';
import {NgModuleType} from '../metadata/ng_module_def';
import {getNgModuleDef} from '../render3/definition';
import {stringify} from '../util/stringify';

/**
 * Map of module-id to the corresponding NgModule.
 */
const modules = new Map<string, NgModuleType>();

/**
 * Whether to check for duplicate NgModule registrations.
 *
 * This can be disabled for testing.
 */
let checkForDuplicateNgModules = true;

function assertSameOrNotExisting(id: string, type: Type<any>|null, incoming: Type<any>): void {
  if (type && type !== incoming && checkForDuplicateNgModules) {
    throw new Error(
        `Duplicate module registered for ${id} - ${stringify(type)} vs ${stringify(type.name)}`);
  }
}

/**
 * Adds the given NgModule type to Angular's NgModule registry.
 *
 * This is generated as a side-effect of NgModule compilation. Note that the `id` is passed in
 * explicitly and not read from the NgModule definition. This is for two reasons: it avoids a
 * megamorphic read, and in JIT there's a chicken-and-egg problem where the NgModule may not be
 * fully resolved when it's registered.
 *
 * @codeGenApi
 */
export function registerNgModuleType(ngModuleType: NgModuleType, id: string): void {
  const existing = modules.get(id) || null;
  assertSameOrNotExisting(id, existing, ngModuleType);
  modules.set(id, ngModuleType);
}

export function clearModulesForTest(): void {
  modules.clear();
}

export function getRegisteredNgModuleType(id: string): NgModuleType|undefined {
  return modules.get(id);
}

/**
 * Control whether the NgModule registration system enforces that each NgModule type registered has
 * a unique id.
 *
 * This is useful for testing as the NgModule registry cannot be properly reset between tests with
 * Angular's current API.
 */
export function setAllowDuplicateNgModuleIdsForTest(allowDuplicates: boolean): void {
  checkForDuplicateNgModules = !allowDuplicates;
}
