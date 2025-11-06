/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {REACTIVE_NODE, type ReactiveNode} from '../../primitives/signals';
import type {ChangeDetectionScheduler} from '../change_detection/scheduling/zoneless_scheduling';
import {assertDefined} from '../util/assert';

import {
  ENVIRONMENT,
  type LView,
  REACTIVE_TEMPLATE_CONSUMER,
  TVIEW,
  type TView,
  TViewType,
} from './interfaces/view';
import {getLViewParent, markAncestorsForTraversal, markViewForRefresh} from './util/view_utils';

/**
 * Pool of free reactive consumers, scoped per `ChangeDetectionScheduler`.
 *
 * Using a WeakMap ensures that when an application (and its `ChangeDetectionScheduler`) is destroyed,
 * the associated consumer pool is automatically garbage collected. This prevents memory leaks
 * in scenarios where multiple Angular applications are created and destroyed in the same
 * JavaScript context (e.g., SSR, micro-frontends, HMR).
 *
 * Each `ChangeDetectionScheduler` maintains its own pool, so multiple concurrent applications
 * don't interfere with each other's consumer recycling.
 */
const freeConsumers = new WeakMap<ChangeDetectionScheduler, ReactiveNode[]>();
export interface ReactiveLViewConsumer extends ReactiveNode {
  lView: LView | null;
}

/**
 * Create a new template consumer pointing at the specified LView.
 * Sometimes, a previously created consumer may be reused, in order to save on allocations. In that
 * case, the LView will be updated.
 */
export function getOrBorrowReactiveLViewConsumer(lView: LView): ReactiveLViewConsumer {
  return lView[REACTIVE_TEMPLATE_CONSUMER] ?? borrowReactiveLViewConsumer(lView);
}

/**
 * Borrows a reactive consumer from the pool associated with the environment's `ChangeDetectionScheduler`.
 * If no free consumers are available in the pool, creates a new one.
 *
 * @param lView The LView that needs a reactive consumer
 * @returns A reactive consumer (either recycled from the pool or newly created)
 */
function borrowReactiveLViewConsumer(lView: LView): ReactiveLViewConsumer {
  const scheduler = lView[ENVIRONMENT].changeDetectionScheduler;

  if (!scheduler) {
    // No scheduler available - create consumer without pooling.
    const consumer = Object.create(REACTIVE_LVIEW_CONSUMER_NODE);
    consumer.lView = lView;
    return consumer;
  }

  const pool = freeConsumers.get(scheduler) ?? [];
  const consumer = pool.pop() ?? Object.create(REACTIVE_LVIEW_CONSUMER_NODE);
  consumer.lView = lView;
  return consumer;
}

/**
 * Returns a reactive consumer to the pool for future reuse, if it hasn't been committed.
 *
 * Consumers are only returned to the pool if they weren't committed (i.e., they didn't
 * actually track any signals). This function also ensures that the consumer is returned
 * to the correct pool based on its associated `ChangeDetectionScheduler`.
 *
 * @param consumer The reactive consumer to potentially return to the pool
 */
export function maybeReturnReactiveLViewConsumer(consumer: ReactiveLViewConsumer): void {
  if (consumer.lView![REACTIVE_TEMPLATE_CONSUMER] === consumer) {
    // The consumer got committed.
    return;
  }

  const scheduler = consumer.lView![ENVIRONMENT].changeDetectionScheduler!;
  if (!scheduler) {
    // If there's no scheduler, we can't return it to a pool, so let it be GC'd.
    return;
  }

  consumer.lView = null;

  const pool = freeConsumers.get(scheduler) ?? [];
  pool.push(consumer);
  freeConsumers.set(scheduler, pool);
}

export const REACTIVE_LVIEW_CONSUMER_NODE: Omit<ReactiveLViewConsumer, 'lView'> = {
  ...REACTIVE_NODE,
  consumerIsAlwaysLive: true,
  kind: 'template',
  consumerMarkedDirty: (node: ReactiveLViewConsumer) => {
    markAncestorsForTraversal(node.lView!);
  },
  consumerOnSignalRead(this: ReactiveLViewConsumer): void {
    this.lView![REACTIVE_TEMPLATE_CONSUMER] = this;
  },
};

/**
 * Creates a temporary consumer for use with `LView`s that should not have consumers.
 * If the LView already has a consumer, returns the existing one instead.
 *
 * This is necessary because some APIs may cause change detection directly on an LView
 * that we do not want to have a consumer (Embedded views today). As a result, there
 * would be no active consumer from running change detection on its host component
 * and any signals in the LView template would be untracked. Instead, we create
 * this temporary consumer that marks the first parent that _should_ have a consumer
 * for refresh. Once change detection runs as part of that refresh, we throw away
 * this consumer because its signals will then be tracked by the parent's consumer.
 */
export function getOrCreateTemporaryConsumer(lView: LView): ReactiveLViewConsumer {
  const consumer = lView[REACTIVE_TEMPLATE_CONSUMER] ?? Object.create(TEMPORARY_CONSUMER_NODE);
  consumer.lView = lView;
  return consumer;
}

export const TEMPORARY_CONSUMER_NODE: ReactiveNode = {
  ...REACTIVE_NODE,
  consumerIsAlwaysLive: true,
  kind: 'template',
  consumerMarkedDirty: (node: ReactiveLViewConsumer) => {
    let parent = getLViewParent(node.lView!);
    while (parent && !viewShouldHaveReactiveConsumer(parent[TVIEW])) {
      parent = getLViewParent(parent);
    }
    if (!parent) {
      // If we can't find an appropriate parent that should have a consumer, we
      // don't have a way of appropriately refreshing this LView as part of application synchronization.
      return;
    }

    markViewForRefresh(parent);
  },
  consumerOnSignalRead(this: ReactiveLViewConsumer): void {
    this.lView![REACTIVE_TEMPLATE_CONSUMER] = this;
  },
};

/**
 * Indicates if the view should get its own reactive consumer node.
 *
 * In the current design, all embedded views share a consumer with the component view. This allows
 * us to refresh at the component level rather than at a per-view level. In addition, root views get
 * their own reactive node because root component will have a host view that executes the
 * component's host bindings. This needs to be tracked in a consumer as well.
 *
 * To get a more granular change detection than per-component, all we would just need to update the
 * condition here so that a given view gets a reactive consumer which can become dirty independently
 * from its parent component. For example embedded views for signal components could be created with
 * a new type "SignalEmbeddedView" and the condition here wouldn't even need updating in order to
 * get granular per-view change detection for signal components.
 */
export function viewShouldHaveReactiveConsumer(tView: TView) {
  return tView.type !== TViewType.Embedded;
}

export function isReactiveLViewConsumer(node: ReactiveNode): node is ReactiveLViewConsumer {
  return node.kind === 'template';
}
