/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileReflector} from './compile_reflector';
import {createPipe, Pipe, Type} from './core';
import {findLast} from './directive_resolver';
import {resolveForwardRef, stringify} from './util';

/**
 * Resolve a `Type` for {@link Pipe}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
export class PipeResolver {
  constructor(private _reflector: CompileReflector) {}

  isPipe(type: Type) {
    const typeMetadata = this._reflector.annotations(resolveForwardRef(type));
    return typeMetadata && typeMetadata.some(createPipe.isTypeOf);
  }

  /**
   * Return {@link Pipe} for a given `Type`.
   */
  resolve(type: Type, throwIfNotFound = true): Pipe|null {
    const metas = this._reflector.annotations(resolveForwardRef(type));
    if (metas) {
      const annotation = findLast(metas, createPipe.isTypeOf);
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
