/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileReflector, core, NgModuleResolver} from '@angular/compiler';

export class MockNgModuleResolver extends NgModuleResolver {
  private _ngModules = new Map<core.Type, core.NgModule>();

  constructor(reflector: CompileReflector) {
    super(reflector);
  }

  /**
   * Overrides the {@link NgModule} for a module.
   */
  setNgModule(type: core.Type, metadata: core.NgModule): void {
    this._ngModules.set(type, metadata);
  }

  /**
   * Returns the {@link NgModule} for a module:
   * - Set the {@link NgModule} to the overridden view when it exists or fallback to the
   * default
   * `NgModuleResolver`, see `setNgModule`.
   */
  override resolve(type: core.Type, throwIfNotFound = true): core.NgModule {
    return this._ngModules.get(type) || super.resolve(type, throwIfNotFound)!;
  }
}
