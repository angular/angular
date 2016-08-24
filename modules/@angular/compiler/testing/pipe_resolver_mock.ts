/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PipeResolver} from '@angular/compiler';
import {Compiler, Injectable, Injector, PipeMetadata, Type} from '@angular/core';

import {Map} from './facade/collection';

@Injectable()
export class MockPipeResolver extends PipeResolver {
  private _pipes = new Map<Type<any>, PipeMetadata>();

  constructor(private _injector: Injector) { super(); }

  private get _compiler(): Compiler { return this._injector.get(Compiler); }

  private _clearCacheFor(pipe: Type<any>) { this._compiler.clearCacheFor(pipe); }

  /**
   * Overrides the {@link PipeMetadata} for a pipe.
   */
  setPipe(type: Type<any>, metadata: PipeMetadata): void {
    this._pipes.set(type, metadata);
    this._clearCacheFor(type);
  }

  /**
   * Returns the {@link PipeMetadata} for a pipe:
   * - Set the {@link PipeMetadata} to the overridden view when it exists or fallback to the
   * default
   * `PipeResolver`, see `setPipe`.
   */
  resolve(type: Type<any>, throwIfNotFound = true): PipeMetadata {
    var metadata = this._pipes.get(type);
    if (!metadata) {
      metadata = super.resolve(type, throwIfNotFound);
    }
    return metadata;
  }
}
