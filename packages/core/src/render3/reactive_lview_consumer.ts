/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {REACTIVE_NODE, ReactiveNode} from '../signals';
import {assertDefined, assertEqual} from '../util/assert';

import {markViewDirty} from './instructions/mark_view_dirty';
import {LView, REACTIVE_HOST_BINDING_CONSUMER, REACTIVE_TEMPLATE_CONSUMER} from './interfaces/view';

let currentConsumer: ReactiveLViewConsumer|null = null;
export interface ReactiveLViewConsumer extends ReactiveNode {
  lView: LView|null;
}

export function setLViewForConsumer(node: ReactiveLViewConsumer, lView: LView): void {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
      assertEqual(node.lView, null, 'Consumer already associated with a view.');
  node.lView = lView;
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
  if (!consumer.producerNode?.length) {
    return;
  }

  lView[slot] = currentConsumer;
  consumer.lView = lView;
  currentConsumer = createLViewConsumer();
}

const REACTIVE_LVIEW_CONSUMER_NODE: ReactiveLViewConsumer = {
  ...REACTIVE_NODE,
  consumerIsAlwaysLive: true,
  consumerMarkedDirty: (node: ReactiveLViewConsumer) => {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
        assertDefined(
            node.lView,
            'Updating a signal during template or host binding execution is not allowed.');
    markViewDirty(node.lView!);
  },
  lView: null,
};

function createLViewConsumer(): ReactiveLViewConsumer {
  return Object.create(REACTIVE_LVIEW_CONSUMER_NODE);
}

function getOrCreateCurrentLViewConsumer() {
  currentConsumer ??= createLViewConsumer();
  return currentConsumer;
}
