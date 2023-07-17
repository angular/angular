/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReactiveNode, setActiveConsumer} from '../signals';
import {assertDefined, assertEqual} from '../util/assert';

import {markViewDirty} from './instructions/mark_view_dirty';
import {ComponentTemplate, HostBindingsFunction, RenderFlags} from './interfaces/definition';
import {LView, REACTIVE_HOST_BINDING_CONSUMER, REACTIVE_TEMPLATE_CONSUMER} from './interfaces/view';

export class ReactiveLViewConsumer extends ReactiveNode {
  protected override consumerAllowSignalWrites = false;
  private _lView: LView|null = null;

  set lView(lView: LView) {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
        assertEqual(this._lView, null, 'Consumer already associated with a view.');
    this._lView = lView;
  }

  protected override onConsumerDependencyMayHaveChanged() {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
        assertDefined(
            this._lView,
            'Updating a signal during template or host binding execution is not allowed.');
    markViewDirty(this._lView!);
  }

  protected override onProducerUpdateValueVersion(): void {
    // This type doesn't implement the producer side of a `ReactiveNode`.
  }

  get hasReadASignal(): boolean {
    return this.hasProducers;
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

let currentConsumer: ReactiveLViewConsumer|null = null;

function getOrCreateCurrentLViewConsumer() {
  currentConsumer ??= new ReactiveLViewConsumer();
  return currentConsumer;
}

/**
 * Create a new template consumer pointing at the specified LView.
 * Sometimes, a previously created consumer may be reused, in order to save on allocations. In that
 * case, the LView will be updated.
 */
export function getReactiveLViewConsumer(
    lView: LView, slot: typeof REACTIVE_TEMPLATE_CONSUMER|typeof REACTIVE_HOST_BINDING_CONSUMER):
    ReactiveLViewConsumer {
  return lView[slot] ?? getOrCreateCurrentLViewConsumer();
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
  const consumer = getOrCreateCurrentLViewConsumer();
  if (!consumer.hasReadASignal) {
    return;
  }

  lView[slot] = currentConsumer;
  consumer.lView = lView;
  currentConsumer = new ReactiveLViewConsumer();
}
