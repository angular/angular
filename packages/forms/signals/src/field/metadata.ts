/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  computed,
  runInInjectionContext,
  untracked,
  ɵRuntimeError as RuntimeError,
} from '@angular/core';
import {MetadataKey} from '../api/rules/metadata';
import {SignalFormsErrorCode} from '../errors';
import type {FieldNode} from './node';

/**
 * Tracks custom metadata associated with a `FieldNode`.
 */
export class FieldMetadataState {
  /** A map of all `MetadataKey` that have been defined for this field. */
  private readonly metadata = new Map<MetadataKey<unknown, unknown, unknown>, unknown>();

  constructor(private readonly node: FieldNode) {
    // Force eager creation of managed keys,
    // as managed keys have a `create` function that needs to run during construction.
    for (const key of this.node.logicNode.logic.getMetadataKeys()) {
      if (key.create) {
        const logic = this.node.logicNode.logic.getMetadata(key);
        const result = untracked(() =>
          runInInjectionContext(this.node.structure.injector, () =>
            key.create!(computed(() => logic.compute(this.node.context))),
          ),
        );
        this.metadata.set(key, result);
      }
    }
  }

  /** Gets the value of an `MetadataKey` for the field. */
  get<T>(key: MetadataKey<T, unknown, unknown>): T | undefined {
    // We create non-managed metadata lazily, the first time they are accessed.
    if (this.has(key)) {
      if (!this.metadata.has(key)) {
        if (key.create) {
          throw new RuntimeError(
            SignalFormsErrorCode.MANAGED_METADATA_LAZY_CREATION,
            ngDevMode && 'Managed metadata cannot be created lazily',
          );
        }
        const logic = this.node.logicNode.logic.getMetadata(key);
        this.metadata.set(
          key,
          computed(() => logic.compute(this.node.context)),
        );
      }
    }
    return this.metadata.get(key) as T | undefined;
  }

  /** Checks whether the current metadata state has the given metadata key. */
  has(key: MetadataKey<any, any, any>): boolean {
    // Metadata keys get added to the map lazily, on first access,
    // so we can't rely on checking presence in the metadata map.
    // Instead we check if there is any logic for the given metadata key.
    return this.node.logicNode.logic.hasMetadata(key);
  }
}
