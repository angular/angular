/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, runInInjectionContext, Signal, untracked} from '@angular/core';
import {AggregateMetadataKey, MetadataKey} from '../api/metadata';
import type {FieldNode} from './node';
import {cast} from './util';

/**
 * Tracks custom metadata associated with a `FieldNode`.
 */
export class FieldMetadataState {
  /** A map of all `MetadataKey` and `AggregateMetadataKey` that have been defined for this field. */
  private readonly metadata = new Map<
    MetadataKey<unknown> | AggregateMetadataKey<unknown, unknown>,
    unknown
  >();

  constructor(private readonly node: FieldNode) {
    // Field nodes (and thus their metadata state) are created in a linkedSignal in order to mirror
    // the structure of the model data. We need to run the metadata factories untracked so that they
    // do not cause recomputation of the linkedSignal.
    untracked(() =>
      // Metadata factories are run in the form's injection context so they can create resources
      // and inject DI dependencies.
      runInInjectionContext(this.node.structure.injector, () => {
        for (const [key, factory] of this.node.logicNode.logic.getMetadataFactoryEntries()) {
          this.metadata.set(key, factory(this.node.context));
        }
      }),
    );
  }

  /** Gets the value of a `MetadataKey` or `AggregateMetadataKey` for the field. */
  get<T>(key: MetadataKey<T> | AggregateMetadataKey<T, unknown>): T | undefined | Signal<T> {
    if (key instanceof MetadataKey) {
      return this.metadata.get(key) as T | undefined;
    }
    // Aggregate metadata comes with an initial value, and are considered to exist for every field.
    // If no logic explicitly contributes values for the metadata, it is just considered to be the
    // initial value. Therefore if the user asks for aggregate metadata for a field,
    // we just create its computed on the fly.
    cast<AggregateMetadataKey<unknown, unknown>>(key);
    if (!this.metadata.has(key)) {
      const logic = this.node.logicNode.logic.getAggregateMetadata(key);
      const result = computed(() => logic.compute(this.node.context));
      this.metadata.set(key, result);
    }
    return this.metadata.get(key)! as Signal<T>;
  }

  /** Checks whether the current metadata state has the given metadata key. */
  has(key: MetadataKey<any> | AggregateMetadataKey<any, any>): boolean {
    if (key instanceof AggregateMetadataKey) {
      // For aggregate metadata keys, they get added to the map lazily, on first access, so we can't
      // rely on checking presence in the metadata map. Instead we check if there is any logic for
      // the given metadata key.
      return this.node.logicNode.logic.hasAggregateMetadata(key);
    } else {
      // Non-aggregate metadata gets added to our metadata map on construction, so we can just
      // refer to their presence in the map.
      return this.metadata.has(key);
    }
  }
}
