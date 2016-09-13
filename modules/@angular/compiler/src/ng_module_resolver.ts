/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgModule, Type} from '@angular/core';

import {isPresent, stringify} from './facade/lang';
import {ReflectorReader, reflector} from './private_import_core';

function _isNgModuleMetadata(obj: any): obj is NgModule {
  return obj instanceof NgModule;
}

/**
 * Resolves types to {@link NgModule}.
 */
@Injectable()
export class NgModuleResolver {
  constructor(private _reflector: ReflectorReader = reflector) {}

  resolve(type: Type<any>, throwIfNotFound = true): NgModule {
    const ngModuleMeta: NgModule = this._reflector.annotations(type).find(_isNgModuleMetadata);

    if (isPresent(ngModuleMeta)) {
      return ngModuleMeta;
    } else {
      if (throwIfNotFound) {
        throw new Error(`No NgModule metadata found for '${stringify(type)}'.`);
      }
      return null;
    }
  }
}
