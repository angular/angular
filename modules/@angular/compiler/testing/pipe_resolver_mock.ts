/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, Injectable, Injector, PipeMetadata, Type} from '@angular/core';

import {PipeResolver} from '../index';
import {Map} from '../src/facade/collection';

@Injectable()
export class MockPipeResolver extends PipeResolver {
  private _pipes = new Map<Type, PipeMetadata>();

  constructor(private _injector: Injector) { super(); }

  private get _compiler(): Compiler { return this._injector.get(Compiler); }

  private _clearCacheFor(pipe: Type) { this._compiler.clearCacheFor(pipe); }

  /**
   * Overrides the {@link PipeMetadata} for a pipe.
   */
  setPipe(type: Type, metadata: PipeMetadata): void {
    this._pipes.set(type, metadata);
    this._clearCacheFor(type);
  }

  /**
   * Returns the {@link PipeMetadata} for a pipe:
   * - Set the {@link PipeMetadata} to the overridden view when it exists or fallback to the
   * default
   * `PipeResolver`, see `setPipe`.
   */
  resolve(type: Type, throwIfNotFound = true): PipeMetadata {
    var metadata = this._pipes.get(type);
    if (!metadata) {
      metadata = super.resolve(type, throwIfNotFound);
    }
    return metadata;
  }
}
