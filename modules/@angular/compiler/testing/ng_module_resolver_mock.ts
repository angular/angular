/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModuleResolver} from '@angular/compiler';
import {Compiler, Injectable, Injector, NgModuleMetadata, Type} from '@angular/core';

import {Map} from './facade/collection';

@Injectable()
export class MockNgModuleResolver extends NgModuleResolver {
  private _ngModules = new Map<Type<any>, NgModuleMetadata>();

  constructor(private _injector: Injector) { super(); }

  private get _compiler(): Compiler { return this._injector.get(Compiler); }

  private _clearCacheFor(component: Type<any>) { this._compiler.clearCacheFor(component); }

  /**
   * Overrides the {@link NgModuleMetadata} for a module.
   */
  setNgModule(type: Type<any>, metadata: NgModuleMetadata): void {
    this._ngModules.set(type, metadata);
    this._clearCacheFor(type);
  }

  /**
   * Returns the {@link NgModuleMetadata} for a module:
   * - Set the {@link NgModuleMetadata} to the overridden view when it exists or fallback to the
   * default
   * `NgModuleResolver`, see `setNgModule`.
   */
  resolve(type: Type<any>, throwIfNotFound = true): NgModuleMetadata {
    var metadata = this._ngModules.get(type);
    if (!metadata) {
      metadata = super.resolve(type, throwIfNotFound);
    }
    return metadata;
  }
}
