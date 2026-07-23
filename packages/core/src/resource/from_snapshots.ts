/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Resource, ResourceSnapshot} from './api';
import {isSignal, Signal} from '../render3/reactivity/api';
import {computed} from '../render3/reactivity/computed';
import {ResourceValueError} from './resource';

/**
 * Creates a `Resource` driven by a source of `ResourceSnapshot`s.
 *
 * @see [Resource composition with snapshots](guide/signals/resource#resource-composition-with-snapshots)
 *
 * @experimental
 */
export function resourceFromSnapshots<T>(source: () => ResourceSnapshot<T>): Resource<T> {
  return new SnapshotResource(isSignal(source) ? source : computed(source));
}

class SnapshotResource<T> implements Resource<T> {
  constructor(readonly snapshot: Signal<ResourceSnapshot<T>>) {}

  private get state(): ResourceSnapshot<T> {
    return this.snapshot();
  }

  readonly value = computed(() => {
    if (this.state.status === 'error') {
      throw new ResourceValueError(this.state.error);
    }
    return this.state.value;
  });
  readonly status = computed(() => this.state.status);
  readonly error = computed(() => (this.state.status === 'error' ? this.state.error : undefined));
  readonly isLoading = computed(
    () => this.state.status === 'loading' || this.state.status === 'reloading',
  );

  private isValueDefined = computed(
    () => this.state.status !== 'error' && this.state.value !== undefined,
  );

  hasValue(this: T extends undefined ? this : never): this is Resource<Exclude<T, undefined>>;
  hasValue(): boolean;
  hasValue(): boolean {
    return this.isValueDefined();
  }
}
