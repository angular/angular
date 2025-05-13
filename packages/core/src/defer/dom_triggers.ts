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
import {Observer, getViewportTriggers, onViewport} from '../../primitives/defer/src/triggers';
import {
  DEFER_BLOCK_STATE,
  DeferBlockInternalState,
  DeferBlockState,
  TriggerType,
} from './interfaces';
import {getLDeferBlockDetails} from './utils';

/**
 * Wrapper for onViewport trigger with angular specific Injector for resolving NgZone instance
 * and creating an IntersectionObserver which can run outside of Angular zone.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger comes into the viewport.
 * @param injector Injector that can be used by the trigger to resolve DI tokens.
 */
export function onViewportWrapper(trigger: Element, callback: VoidFunction, injector: Injector) {
  const angularInjectorObserver = new AngularIntersectionObserver(injector);
  return onViewport(trigger, callback, angularInjectorObserver);
}

class AngularIntersectionObserver implements Observer{
  private intersectionObserver: IntersectionObserver;
  private ngZone: NgZone;
  constructor(injector: Injector) {
    this.ngZone = injector.get(NgZone);
    this.intersectionObserver = this.ngZone.runOutsideAngular(() => {
      return new IntersectionObserver((entries) => {
        for (const current of entries) {
          if (current.isIntersecting && getViewportTriggers().has(current.target)) {
            this.ngZone.run(getViewportTriggers().get(current.target)!.listener)
          }
        }
      })
    })
  }

  observe(target: Element) {
    this.ngZone.runOutsideAngular(() => this.intersectionObserver.observe(target));
  }

  unobserve(target: Element) {
    this.intersectionObserver.unobserve(target);
  }

  disconnect() {
    this.intersectionObserver.disconnect();
  }
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
