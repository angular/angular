/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {REACTIVE_NODE, ReactiveNode} from '@angular/core/primitives/signals';

import {LView, REACTIVE_HOST_BINDING_CONSUMER, REACTIVE_TEMPLATE_CONSUMER} from './interfaces/view';
import {markViewDirtyFromSignal} from './util/view_utils';

let currentConsumer: ReactiveLViewConsumer|null = null;
export interface ReactiveLViewConsumer extends ReactiveNode {
  lView: LView;
  slot: typeof REACTIVE_TEMPLATE_CONSUMER|typeof REACTIVE_HOST_BINDING_CONSUMER;
}

/**
 * Create a new template consumer pointing at the specified LView.
 * Sometimes, a previously created consumer may be reused, in order to save on allocations. In that
 * case, the LView will be updated.
 */
export function getReactiveLViewConsumer(
    lView: LView, slot: typeof REACTIVE_TEMPLATE_CONSUMER|typeof REACTIVE_HOST_BINDING_CONSUMER):
    ReactiveLViewConsumer {
  return lView[slot] ?? getOrCreateCurrentLViewConsumer(lView, slot);
}

const REACTIVE_LVIEW_CONSUMER_NODE: Omit<ReactiveLViewConsumer, 'lView'|'slot'> = {
  ...REACTIVE_NODE,
  consumerIsAlwaysLive: true,
  consumerMarkedDirty: (node: ReactiveLViewConsumer) => {
    markViewDirtyFromSignal(node.lView);
  },
  consumerOnSignalRead(this: ReactiveLViewConsumer): void {
    if (currentConsumer !== this) {
      return;
    }
    this.lView[this.slot] = currentConsumer;
    currentConsumer = null;
  },
};

function createLViewConsumer(): ReactiveLViewConsumer {
  return Object.create(REACTIVE_LVIEW_CONSUMER_NODE);
}

function getOrCreateCurrentLViewConsumer(
    lView: LView, slot: typeof REACTIVE_TEMPLATE_CONSUMER|typeof REACTIVE_HOST_BINDING_CONSUMER) {
  currentConsumer ??= createLViewConsumer();
  currentConsumer.lView = lView;
  currentConsumer.slot = slot;
  return currentConsumer;
}
