/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, Pipe, Type, resolveForwardRef} from '@angular/core';

import {isPresent, stringify} from './facade/lang';
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
@Injectable()
export class PipeResolver {
  constructor(private _reflector: ReflectorReader = reflector) {}

  /**
   * Return {@link Pipe} for a given `Type`.
   */
  resolve(type: Type<any>, throwIfNotFound = true): Pipe {
    var metas = this._reflector.annotations(resolveForwardRef(type));
    if (isPresent(metas)) {
      var annotation = metas.find(_isPipeMetadata);
      if (isPresent(annotation)) {
        return annotation;
      }
    }
    if (throwIfNotFound) {
      throw new Error(`No Pipe decorator found on ${stringify(type)}`);
    }
    return null;
  }
}
