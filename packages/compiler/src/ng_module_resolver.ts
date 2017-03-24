/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule, Type, ɵReflectorReader, ɵreflector, ɵstringify as stringify} from '@angular/core';
import {findLast} from './directive_resolver';
import {CompilerInjectable} from './injectable';

function _isNgModuleMetadata(obj: any): obj is NgModule {
  return obj instanceof NgModule;
}

/**
 * Resolves types to {@link NgModule}.
 */
@CompilerInjectable()
export class NgModuleResolver {
  constructor(private _reflector: ɵReflectorReader = ɵreflector) {}

  isNgModule(type: any) { return this._reflector.annotations(type).some(_isNgModuleMetadata); }

  resolve(type: Type<any>, throwIfNotFound = true): NgModule|null {
    const ngModuleMeta: NgModule = findLast(this._reflector.annotations(type), _isNgModuleMetadata);

    if (ngModuleMeta) {
      return ngModuleMeta;
    } else {
      if (throwIfNotFound) {
        throw new Error(`No NgModule metadata found for '${stringify(type)}'.`);
      }
      return null;
    }
  }
}
