/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Pipe, Type, resolveForwardRef} from '@angular/core';

import {ListWrapper} from './facade/collection';
import {stringify} from './facade/lang';
import {CompilerInjectable} from './injectable';
import {ReflectorReader, reflector} from './private_import_core';

function _isPipeMetadata(type: any): boolean {
  return type instanceof Pipe;
}

/**
 * Resolve a `Type` for {@link Pipe}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
@CompilerInjectable()
export class PipeResolver {
  constructor(private _reflector: ReflectorReader = reflector) {}

  isPipe(type: Type<any>) {
    const typeMetadata = this._reflector.annotations(resolveForwardRef(type));
    return typeMetadata && typeMetadata.some(_isPipeMetadata);
  }

  /**
   * Return {@link Pipe} for a given `Type`.
   */
  resolve(type: Type<any>, throwIfNotFound = true): Pipe {
    const metas = this._reflector.annotations(resolveForwardRef(type));
    if (metas) {
      const annotation = ListWrapper.findLast(metas, _isPipeMetadata);
      if (annotation) {
        return annotation;
      }
    }
    if (throwIfNotFound) {
      throw new Error(`No Pipe decorator found on ${stringify(type)}`);
    }
    return null;
  }
}
