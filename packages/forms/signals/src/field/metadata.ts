/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, runInInjectionContext, untracked, type Signal} from '@angular/core';
import {MetadataKey} from '../api/metadata';
import type {FieldNode} from './node';

/**
 * Tracks custom metadata associated with a `FieldNode`.
 */
export class FieldMetadataState {
  /** A map of all `MetadataKey` that have been defined for this field. */
  private readonly metadata = new Map<MetadataKey<unknown, unknown, unknown>, unknown>();

  constructor(private readonly node: FieldNode) {}

  /** Gets the value of an `MetadataKey` for the field. */
  get<T>(key: MetadataKey<T, unknown, unknown>): T {
    // Metadata comes with an initial value, and are considered to exist for every field.
    // If no logic explicitly contributes values for the metadata, it is just considered to be the
    // initial value. Therefore if the user asks for metadata for a field, we just create its
    // computed on the fly.
    if (!this.metadata.has(key)) {
      const logic = this.node.logicNode.logic.getMetadata(key);
      let result = computed(() => logic.compute(this.node.context)) as T;
      if (key.wrap) {
        result = untracked(() =>
          runInInjectionContext(this.node.structure.injector, () =>
            key.wrap!(result as Signal<unknown>),
          ),
        );
      }
      this.metadata.set(key, result);
    }
    return this.metadata.get(key)! as T;
  }

  /** Checks whether the current metadata state has the given metadata key. */
  has(key: MetadataKey<any, any, any>): boolean {
    // Metadata keys get added to the map lazily, on first access,
    // so we can't rely on checking presence in the metadata map.
    // Instead we check if there is any logic for the given metadata key.
    return this.node.logicNode.logic.hasMetadata(key);
  }
}
