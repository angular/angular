/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {Injector} from '../di';
import {AfterRenderRef} from '../render3/after_render/api';
import {afterEveryRender} from '../render3/after_render/hooks';
import {assertLContainer, assertLView} from '../render3/assert';
import {CONTAINER_HEADER_OFFSET} from '../render3/interfaces/container';
import {TNode} from '../render3/interfaces/node';
import {isDestroyed} from '../render3/interfaces/type_checks';
import {HEADER_OFFSET, INJECTOR, LView} from '../render3/interfaces/view';
import {
  getNativeByIndex,
  removeLViewOnDestroy,
  storeLViewOnDestroy,
  walkUpViews,
} from '../render3/util/view_utils';
import {assertElement, assertEqual} from '../util/assert';
import {NgZone} from '../zone';
import {storeTriggerCleanupFn} from './cleanup';

import {
  DEFER_BLOCK_STATE,
  DeferBlockInternalState,
  DeferBlockState,
  TriggerType,
} from './interfaces';
import {getLDeferBlockDetails} from './utils';

/** Configuration object used to register passive and capturing events. */
const eventListenerOptions: AddEventListenerOptions = {
  passive: true,
  capture: true,
};

/** Keeps track of the currently-registered `on hover` triggers. */
const hoverTriggers = new WeakMap<Element, DeferEventEntry>();

/** Keeps track of the currently-registered `on interaction` triggers. */
const interactionTriggers = new WeakMap<Element, DeferEventEntry>();

/** Currently-registered `viewport` triggers. */
const viewportTriggers = new WeakMap<Element, DeferEventEntry>();

/** Names of the events considered as interaction events. */
export const interactionEventNames = ['click', 'keydown'] as const;

/** Names of the events considered as hover events. */
export const hoverEventNames = ['mouseenter', 'mouseover', 'focusin'] as const;

/** `IntersectionObserver` used to observe `viewport` triggers. */
let intersectionObserver: IntersectionObserver | null = null;

/** Number of elements currently observed with `viewport` triggers. */
let observedViewportElements = 0;

/** Object keeping track of registered callbacks for a deferred block trigger. */
class DeferEventEntry {
  callbacks = new Set<VoidFunction>();

  listener = () => {
    for (const callback of this.callbacks) {
      callback();
    }
  };
}

/**
 * Registers an interaction trigger.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger is interacted with.
 */
export function onInteraction(trigger: Element, callback: VoidFunction): VoidFunction {
  let entry = interactionTriggers.get(trigger);

  // If this is the first entry for this element, add the listeners.
  if (!entry) {
    // Note that managing events centrally like this lends itself well to using global
    // event delegation. It currently does delegation at the element level, rather than the
    // document level, because:
    // 1. Global delegation is the most effective when there are a lot of events being registered
    // at the same time. Deferred blocks are unlikely to be used in such a way.
    // 2. Matching events to their target isn't free. For each `click` and `keydown` event we
    // would have look through all the triggers and check if the target either is the element
    // itself or it's contained within the element. Given that `click` and `keydown` are some
    // of the most common events, this may end up introducing a lot of runtime overhead.
    // 3. We're still registering only two events per element, no matter how many deferred blocks
    // are referencing it.
    entry = new DeferEventEntry();
    interactionTriggers.set(trigger, entry);

    for (const name of interactionEventNames) {
      trigger.addEventListener(name, entry!.listener, eventListenerOptions);
    }
  }

  entry.callbacks.add(callback);

  return () => {
    const {callbacks, listener} = entry!;
    callbacks.delete(callback);

    if (callbacks.size === 0) {
      interactionTriggers.delete(trigger);

      for (const name of interactionEventNames) {
        trigger.removeEventListener(name, listener, eventListenerOptions);
      }
    }
  };
}

/**
 * Registers a hover trigger.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger is hovered over.
 */
export function onHover(trigger: Element, callback: VoidFunction): VoidFunction {
  let entry = hoverTriggers.get(trigger);

  // If this is the first entry for this element, add the listener.
  if (!entry) {
    entry = new DeferEventEntry();
    hoverTriggers.set(trigger, entry);

    for (const name of hoverEventNames) {
      trigger.addEventListener(name, entry!.listener, eventListenerOptions);
    }
  }

  entry.callbacks.add(callback);

  return () => {
    const {callbacks, listener} = entry!;
    callbacks.delete(callback);

    if (callbacks.size === 0) {
      for (const name of hoverEventNames) {
        trigger.removeEventListener(name, listener, eventListenerOptions);
      }
      hoverTriggers.delete(trigger);
    }
  };
}

/**
 * Registers a viewport trigger.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger comes into the viewport.
 * @param injector Injector that can be used by the trigger to resolve DI tokens.
 */
export function onViewport(
  trigger: Element,
  callback: VoidFunction,
  injector: Injector,
): VoidFunction {
  const ngZone = injector.get(NgZone);
  let entry = viewportTriggers.get(trigger);

  intersectionObserver =
    intersectionObserver ||
    ngZone.runOutsideAngular(() => {
      return new IntersectionObserver((entries) => {
        for (const current of entries) {
          // Only invoke the callbacks if the specific element is intersecting.
          if (current.isIntersecting && viewportTriggers.has(current.target)) {
            ngZone.run(viewportTriggers.get(current.target)!.listener);
          }
        }
      });
    });

  if (!entry) {
    entry = new DeferEventEntry();
    ngZone.runOutsideAngular(() => intersectionObserver!.observe(trigger));
    viewportTriggers.set(trigger, entry);
    observedViewportElements++;
  }

  entry.callbacks.add(callback);

  return () => {
    // It's possible that a different cleanup callback fully removed this element already.
    if (!viewportTriggers.has(trigger)) {
      return;
    }

    entry!.callbacks.delete(callback);

    if (entry!.callbacks.size === 0) {
      intersectionObserver?.unobserve(trigger);
      viewportTriggers.delete(trigger);
      observedViewportElements--;
    }

    if (observedViewportElements === 0) {
      intersectionObserver?.disconnect();
      intersectionObserver = null;
    }
  };
}

/**
 * Helper function to get the LView in which a deferred block's trigger is rendered.
 * @param deferredHostLView LView in which the deferred block is defined.
 * @param deferredTNode TNode defining the deferred block.
 * @param walkUpTimes Number of times to go up in the view hierarchy to find the trigger's view.
 *   A negative value means that the trigger is inside the block's placeholder, while an undefined
 *   value means that the trigger is in the same LView as the deferred block.
 */
export function getTriggerLView(
  deferredHostLView: LView,
  deferredTNode: TNode,
  walkUpTimes: number | undefined,
): LView | null {
  // The trigger is in the same view, we don't need to traverse.
  if (walkUpTimes == null) {
    return deferredHostLView;
  }

  // A positive value or zero means that the trigger is in a parent view.
  if (walkUpTimes >= 0) {
    return walkUpViews(walkUpTimes, deferredHostLView);
  }

  // If the value is negative, it means that the trigger is inside the placeholder.
  const deferredContainer = deferredHostLView[deferredTNode.index];
  ngDevMode && assertLContainer(deferredContainer);
  const triggerLView = deferredContainer[CONTAINER_HEADER_OFFSET] ?? null;

  // We need to null check, because the placeholder might not have been rendered yet.
  if (ngDevMode && triggerLView !== null) {
    const lDetails = getLDeferBlockDetails(deferredHostLView, deferredTNode);
    const renderedState = lDetails[DEFER_BLOCK_STATE];
    assertEqual(
      renderedState,
      DeferBlockState.Placeholder,
      'Expected a placeholder to be rendered in this defer block.',
    );
    assertLView(triggerLView);
  }

  return triggerLView;
}

/**
 * Gets the element that a deferred block's trigger is pointing to.
 * @param triggerLView LView in which the trigger is defined.
 * @param triggerIndex Index at which the trigger element should've been rendered.
 */
export function getTriggerElement(triggerLView: LView, triggerIndex: number): Element {
  const element = getNativeByIndex(HEADER_OFFSET + triggerIndex, triggerLView);
  ngDevMode && assertElement(element);
  return element as Element;
}

/**
 * Registers a DOM-node based trigger.
 * @param initialLView LView in which the defer block is rendered.
 * @param tNode TNode representing the defer block.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to go up/down in the view hierarchy to find the trigger.
 * @param registerFn Function that will register the DOM events.
 * @param callback Callback to be invoked when the trigger receives the event that should render
 *     the deferred block.
 * @param type Trigger type to distinguish between regular and prefetch triggers.
 */
export function registerDomTrigger(
  initialLView: LView,
  tNode: TNode,
  triggerIndex: number,
  walkUpTimes: number | undefined,
  registerFn: (element: Element, callback: VoidFunction, injector: Injector) => VoidFunction,
  callback: VoidFunction,
  type: TriggerType,
) {
  const injector = initialLView[INJECTOR];
  const zone = injector.get(NgZone);
  let poll: AfterRenderRef;
  function pollDomTrigger() {
    // If the initial view was destroyed, we don't need to do anything.
    if (isDestroyed(initialLView)) {
      poll.destroy();
      return;
    }

    const lDetails = getLDeferBlockDetails(initialLView, tNode);
    const renderedState = lDetails[DEFER_BLOCK_STATE];

    // If the block was loaded before the trigger was resolved, we don't need to do anything.
    if (
      renderedState !== DeferBlockInternalState.Initial &&
      renderedState !== DeferBlockState.Placeholder
    ) {
      poll.destroy();
      return;
    }

    const triggerLView = getTriggerLView(initialLView, tNode, walkUpTimes);

    // Keep polling until we resolve the trigger's LView.
    if (!triggerLView) {
      // Keep polling.
      return;
    }

    poll.destroy();

    // It's possible that the trigger's view was destroyed before we resolved the trigger element.
    if (isDestroyed(triggerLView)) {
      return;
    }

    const element = getTriggerElement(triggerLView, triggerIndex);
    const cleanup = registerFn(
      element,
      () => {
        // `pollDomTrigger` runs outside the zone (because of `afterNextRender`) and registers its
        // listeners outside the zone, so we jump back into the zone prior to running the callback.
        zone.run(() => {
          if (initialLView !== triggerLView) {
            removeLViewOnDestroy(triggerLView, cleanup);
          }
          callback();
        });
      },
      injector,
    );

    // The trigger and deferred block might be in different LViews.
    // For the main LView the cleanup would happen as a part of
    // `storeTriggerCleanupFn` logic. For trigger LView we register
    // a cleanup function there to remove event handlers in case an
    // LView gets destroyed before a trigger is invoked.
    if (initialLView !== triggerLView) {
      storeLViewOnDestroy(triggerLView, cleanup);
    }

    storeTriggerCleanupFn(type, lDetails, cleanup);
  }

  // Begin polling for the trigger.
  poll = afterEveryRender({read: pollDomTrigger}, {injector});
}
