/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed, Signal} from '@angular/core';
import type {MetadataKey} from '../api/metadata';
import type {FieldNode} from './node';
import {cast} from './util';

/**
 * Tracks `metadata` associated with a `FieldNode`.
 */
export class FieldMetadataState {
  private readonly metadataMap = new Map<MetadataKey<unknown>, Signal<unknown>>();

  constructor(private readonly node: FieldNode) {}

  get<M>(key: MetadataKey<M>): Signal<M> {
    cast<MetadataKey<unknown>>(key);
    if (!this.metadataMap.has(key)) {
      const logic = this.node.logic.getMetadata(key);
      const result = computed(() => logic.compute(this.node.context));
      this.metadataMap.set(key, result);
    }
    return this.metadataMap.get(key)! as Signal<M>;
  }
}
