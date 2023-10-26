/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {REACTIVE_NODE, ReactiveNode} from '@angular/core/primitives/signals';

import {LView, REACTIVE_TEMPLATE_CONSUMER} from './interfaces/view';
import {markAncestorsForTraversal} from './util/view_utils';

let freeConsumers: ReactiveLViewConsumer[] = [];
export interface ReactiveLViewConsumer extends ReactiveNode {
  lView: LView|null;
  slot: typeof REACTIVE_TEMPLATE_CONSUMER;
}

/**
 * Create a new template consumer pointing at the specified LView.
 * Sometimes, a previously created consumer may be reused, in order to save on allocations. In that
 * case, the LView will be updated.
 */
export function getOrBorrowReactiveLViewConsumer(lView: LView): ReactiveLViewConsumer {
  return lView[REACTIVE_TEMPLATE_CONSUMER] ?? borrowReactiveLViewConsumer(lView);
}

function borrowReactiveLViewConsumer(lView: LView): ReactiveLViewConsumer {
  const consumer: ReactiveLViewConsumer =
      freeConsumers.pop() ?? Object.create(REACTIVE_LVIEW_CONSUMER_NODE);
  consumer.lView = lView;
  return consumer;
}

export function maybeReturnReactiveLViewConsumer(consumer: ReactiveLViewConsumer): void {
  if (consumer.lView![REACTIVE_TEMPLATE_CONSUMER] === consumer) {
    // The consumer got committed.
    return;
  }
  consumer.lView = null;
  freeConsumers.push(consumer);
}

const REACTIVE_LVIEW_CONSUMER_NODE: Omit<ReactiveLViewConsumer, 'lView'|'slot'> = {
  ...REACTIVE_NODE,
  consumerIsAlwaysLive: true,
  consumerMarkedDirty: (node: ReactiveLViewConsumer) => {
    markAncestorsForTraversal(node.lView!);
  },
  consumerOnSignalRead(this: ReactiveLViewConsumer): void {
    this.lView![REACTIVE_TEMPLATE_CONSUMER] = this;
  },
};
