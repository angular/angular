/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {NgModuleFactory as R3NgModuleFactory} from '../render3/ng_module_ref';
import {getRegisteredNgModuleType} from './ng_module_registration';
/**
 * Returns the NgModuleFactory with the given id (specified using [@NgModule.id
 * field](api/core/NgModule#id)), if it exists and has been loaded. Factories for NgModules that do
 * not specify an `id` cannot be retrieved. Throws if an NgModule cannot be found.
 * @publicApi
 * @deprecated Use `getNgModuleById` instead.
 */
export function getModuleFactory(id) {
  const type = getRegisteredNgModuleType(id);
  if (!type) throw noModuleError(id);
  return new R3NgModuleFactory(type);
}
/**
 * Returns the NgModule class with the given id (specified using [@NgModule.id
 * field](api/core/NgModule#id)), if it exists and has been loaded. Classes for NgModules that do
 * not specify an `id` cannot be retrieved. Throws if an NgModule cannot be found.
 * @publicApi
 */
export function getNgModuleById(id) {
  const type = getRegisteredNgModuleType(id);
  if (!type) throw noModuleError(id);
  return type;
}
function noModuleError(id) {
  return new Error(`No module with ID ${id} loaded`);
}
//# sourceMappingURL=ng_module_factory_loader.js.map
