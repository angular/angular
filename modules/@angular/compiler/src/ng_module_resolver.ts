/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgModuleMetadata} from '@angular/core';

import {ReflectorReader, reflector} from '../core_private';
import {BaseException} from '../src/facade/exceptions';
import {Type, isBlank, isPresent, stringify} from '../src/facade/lang';

function _isNgModuleMetadata(obj: any): obj is NgModuleMetadata {
  return obj instanceof NgModuleMetadata;
}

/**
 * Resolves types to {@link NgModuleMetadata}.
 */
@Injectable()
export class NgModuleResolver {
  constructor(private _reflector: ReflectorReader = reflector) {}

  resolve(type: Type, throwIfNotFound = true): NgModuleMetadata {
    const ngModuleMeta: NgModuleMetadata =
        this._reflector.annotations(type).find(_isNgModuleMetadata);

    if (isPresent(ngModuleMeta)) {
      return ngModuleMeta;
    } else {
      if (throwIfNotFound) {
        throw new BaseException(`No NgModule metadata found for '${stringify(type)}'.`);
      }
      return null;
    }
  }
}
