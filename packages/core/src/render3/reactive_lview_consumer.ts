/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Consumer, nextReactiveId, setActiveConsumer} from '../signals/src/graph';
import {newWeakRef, WeakRef} from '../signals/src/weak_ref';
import {assertDefined, assertEqual} from '../util/assert';

import {ComponentTemplate, HostBindingsFunction, RenderFlags} from './interfaces/definition';
import {LView, REACTIVE_HOST_BINDING_CONSUMER, REACTIVE_TEMPLATE_CONSUMER} from './interfaces/view';
import {markViewDirty} from './util/view_utils';

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

export class ReactiveLViewConsumer implements Consumer {
  readonly id = nextReactiveId();
  readonly ref = newWeakRef(this);
  readonly producers = new Map();
  trackingVersion = 0;
  private _lView: LView|null = null;

  set lView(lView: LView) {
    NG_DEV_MODE && assertEqual(this._lView, null, 'Consumer already associated with a view.');
    this._lView = lView;
  }

  notify() {
    NG_DEV_MODE &&
        assertDefined(
            this._lView,
            'Updating a signal during template or host binding execution is not allowed.');
    markViewDirty(this._lView!);
  }

  runInContext(
      fn: HostBindingsFunction<unknown>|ComponentTemplate<unknown>, rf: RenderFlags,
      ctx: unknown): void {
    const prevConsumer = setActiveConsumer(this);
    this.trackingVersion++;
    try {
      fn(rf, ctx);
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }

  destroy(): void {
    // Incrementing the version means that every producer which tries to update this consumer will
    // consider its record stale, and not notify.
    this.trackingVersion++;
  }
}

let currentConsumer = new ReactiveLViewConsumer();

/**
 * Create a new template consumer pointing at the specified LView.
 * Sometimes, a previously created consumer may be reused, in order to save on allocations. In that
 * case, the LView will be updated.
 */
export function getReactiveLViewConsumer(
    lView: LView, slot: typeof REACTIVE_TEMPLATE_CONSUMER|typeof REACTIVE_HOST_BINDING_CONSUMER):
    ReactiveLViewConsumer {
  return lView[slot] ?? currentConsumer;
}

/**
 * Assigns the `currentTemplateContext` to its LView's `REACTIVE_CONSUMER` slot if there are tracked
 * producers.
 *
 * The presence of producers means that a signal was read while the consumer was the active
 * consumer.
 *
 * If no producers are present, we do not assign the current template context. This also means we
 * can just reuse the template context for the next LView.
 */
export function commitLViewConsumerIfHasProducers(
    lView: LView,
    slot: typeof REACTIVE_TEMPLATE_CONSUMER|typeof REACTIVE_HOST_BINDING_CONSUMER): void {
  if (currentConsumer.producers.size === 0) {
    return;
  }

  lView[slot] = currentConsumer;
  currentConsumer.lView = lView;
  currentConsumer = new ReactiveLViewConsumer();
}
