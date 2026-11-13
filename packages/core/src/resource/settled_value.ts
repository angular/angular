/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal} from '../render3/reactivity/api';
import {computed} from '../render3/reactivity/computed';
import {Resource} from './api';

/**
 * Returns a signal of a resource's value only while its status is `resolved` or `local`.
 *
 * Returns `undefined` while the resource is idle, loading, reloading, or in an error state.
 * Unlike `hasValue()`, this waits for loading to finish even when the resource holds a previous value.
 *
 * @param source The resource to read.
 * @returns A signal of the settled value, or `undefined` while unavailable.
 * @see [Resource composition](guide/signals/resource#resource-composition-with-snapshots)
 * @publicApi 22.3
 */
export function settledResourceValue<T>(source: Resource<T>): Signal<T | undefined> {
  return computed(() => {
    const snapshot = source.snapshot();
    return snapshot.status === 'resolved' || snapshot.status === 'local'
      ? snapshot.value
      : undefined;
  });
}
