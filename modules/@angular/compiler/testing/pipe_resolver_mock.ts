/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PipeResolver} from '@angular/compiler';
import {Compiler, Injectable, Injector, Pipe, Type} from '@angular/core';

@Injectable()
export class MockPipeResolver extends PipeResolver {
  private _pipes = new Map<Type<any>, Pipe>();

  constructor(private _injector: Injector) { super(); }

  private get _compiler(): Compiler { return this._injector.get(Compiler); }

  private _clearCacheFor(pipe: Type<any>) { this._compiler.clearCacheFor(pipe); }

  /**
   * Overrides the {@link Pipe} for a pipe.
   */
  setPipe(type: Type<any>, metadata: Pipe): void {
    this._pipes.set(type, metadata);
    this._clearCacheFor(type);
  }

  /**
   * Returns the {@link Pipe} for a pipe:
   * - Set the {@link Pipe} to the overridden view when it exists or fallback to the
   * default
   * `PipeResolver`, see `setPipe`.
   */
  resolve(type: Type<any>, throwIfNotFound = true): Pipe {
    var metadata = this._pipes.get(type);
    if (!metadata) {
      metadata = super.resolve(type, throwIfNotFound);
    }
    return metadata;
  }
}
