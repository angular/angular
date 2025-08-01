/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {setActiveConsumer} from '@angular/core/primitives/signals';

import {NotificationSource} from '../../change_detection/scheduling/zoneless_scheduling';
import type {TNode} from '../interfaces/node';
import {isComponentHost, isDirectiveHost} from '../interfaces/type_checks';
import {CLEANUP, CONTEXT, FLAGS, LViewFlags, type LView, type TView} from '../interfaces/view';
import {
  getComponentLViewByIndex,
  getNativeByTNode,
  getOrCreateLViewCleanup,
  getOrCreateTViewCleanup,
  unwrapRNode,
} from '../util/view_utils';
import {profiler} from '../profiler';
import {ProfilerEvent} from '../profiler_types';
import {markViewDirty} from '../instructions/mark_view_dirty';
import type {RElement} from '../interfaces/renderer_dom';
import type {GlobalTargetResolver, Renderer} from '../interfaces/renderer';
import {assertNotSame} from '../../util/assert';
import {handleUncaughtError} from '../instructions/shared';
import {
  type EventCallback,
  stashEventListenerImpl,
  type WrappedEventCallback,
} from '../../event_delegation_utils';

/**
 * Wraps an event listener with a function that marks ancestors dirty and prevents default behavior,
 * if applicable.
 *
 * @param tNode The TNode associated with this listener
 * @param lView The LView that contains this listener
 * @param listenerFn The listener function to call
 * @param wrapWithPreventDefault Whether or not to prevent default behavior
 * (the procedural renderer does this already, so in those cases, we should skip)
 */
export function wrapListener(
  tNode: TNode,
  lView: LView<{} | null>,
  listenerFn: EventCallback,
): WrappedEventCallback {
  // Note: we are performing most of the work in the listener function itself
  // to optimize listener registration.
  return function wrapListenerIn_markDirtyAndPreventDefault(event: any) {
    // In order to be backwards compatible with View Engine, events on component host nodes
    // must also mark the component view itself dirty (i.e. the view that it owns).
    const startView = isComponentHost(tNode) ? getComponentLViewByIndex(tNode.index, lView) : lView;
    if (lView[FLAGS] & LViewFlags.BoundListenersMarkForCheck) {
      markViewDirty(startView, NotificationSource.Listener);
    }

    const context = lView[CONTEXT];
    let result = executeListenerWithErrorHandling(lView, context, listenerFn, event);
    // A just-invoked listener function might have coalesced listeners so we need to check for
    // their presence and invoke as needed.
    let nextListenerFn = (<any>wrapListenerIn_markDirtyAndPreventDefault).__ngNextListenerFn__;
    while (nextListenerFn) {
      // We should prevent default if any of the listeners explicitly return false
      result = executeListenerWithErrorHandling(lView, context, nextListenerFn, event) && result;
      nextListenerFn = (<any>nextListenerFn).__ngNextListenerFn__;
    }

    return result;
  } as WrappedEventCallback;
}

function executeListenerWithErrorHandling(
  lView: LView,
  context: {} | null,
  listenerFn: EventCallback,
  e: any,
): boolean {
  const prevConsumer = setActiveConsumer(null);
  try {
    profiler(ProfilerEvent.OutputStart, context, listenerFn);
    // Only explicitly returning false from a listener should preventDefault
    return listenerFn(e) !== false;
  } catch (error) {
    handleUncaughtError(lView, error);
    return false;
  } finally {
    profiler(ProfilerEvent.OutputEnd, context, listenerFn);
    setActiveConsumer(prevConsumer);
  }
}

/**
 * Listen to a DOM event on a specific node.
 * @param tNode TNode on which to listen.
 * @param tView TView in which the node is placed.
 * @param lView LView in which the node instance is placed.
 * @param eventTargetResolver Resolver for global event targets.
 * @param renderer Renderer to use for listening to the event.
 * @param eventName Name of the event.
 * @param originalListener Original listener as it was created by the compiler. Necessary for event
 *   coalescing.
 * @param wrappedListener Listener wrapped with additional logic like marking for check and error
 *   handling.
 * @returns Boolean indicating whether the event was bound or was coalesced into an existing
 *   listener.
 */
export function listenToDomEvent(
  tNode: TNode,
  tView: TView,
  lView: LView<{} | null>,
  eventTargetResolver: GlobalTargetResolver | undefined,
  renderer: Renderer,
  eventName: string,
  originalListener: EventCallback,
  wrappedListener: WrappedEventCallback,
): boolean {
  ngDevMode &&
    assertNotSame(
      wrappedListener,
      originalListener,
      'Expected wrapped and original listeners to be different.',
    );

  const isTNodeDirectiveHost = isDirectiveHost(tNode);
  let hasCoalesced = false;

  // In order to match current behavior, native DOM event listeners must be added for all
  // events (including outputs).
  // There might be cases where multiple directives on the same element try to register an event
  // handler function for the same event. In this situation we want to avoid registration of
  // several native listeners as each registration would be intercepted by NgZone and
  // trigger change detection. This would mean that a single user action would result in several
  // change detections being invoked. To avoid this situation we want to have only one call to
  // native handler registration (for the same element and same type of event).
  //
  // In order to have just one native event handler in presence of multiple handler functions,
  // we just register a first handler function as a native event listener and then chain
  // (coalesce) other handler functions on top of the first native handler function.
  let existingListener: any = null;
  // Please note that the coalescing described here doesn't happen for events specifying an
  // alternative target (ex. (document:click)) - this is to keep backward compatibility with the
  // view engine.
  // Also, we don't have to search for existing listeners if there are no directives
  // matching on a given node as we can't register multiple event handlers for the same event in
  // a template (this would mean having duplicate attributes).
  if (!eventTargetResolver && isTNodeDirectiveHost) {
    existingListener = findExistingListener(tView, lView, eventName, tNode.index);
  }
  if (existingListener !== null) {
    // Attach a new listener to coalesced listeners list, maintaining the order in which
    // listeners are registered. For performance reasons, we keep a reference to the last
    // listener in that list (in `__ngLastListenerFn__` field), so we can avoid going through
    // the entire set each time we need to add a new listener.
    const lastListenerFn = existingListener.__ngLastListenerFn__ || existingListener;
    lastListenerFn.__ngNextListenerFn__ = originalListener;
    existingListener.__ngLastListenerFn__ = originalListener;
    hasCoalesced = true;
  } else {
    const native = getNativeByTNode(tNode, lView) as RElement;
    const target = eventTargetResolver ? eventTargetResolver(native) : native;

    stashEventListenerImpl(lView, target, eventName, wrappedListener);

    const cleanupFn = renderer.listen(target as RElement, eventName, wrappedListener);
    const idxOrTargetGetter = eventTargetResolver
      ? (_lView: LView) => eventTargetResolver(unwrapRNode(_lView[tNode.index]))
      : tNode.index;

    storeListenerCleanup(
      idxOrTargetGetter,
      tView,
      lView,
      eventName,
      wrappedListener,
      cleanupFn,
      false,
    );
  }
  return hasCoalesced;
}

/**
 * A utility function that checks if a given element has already an event handler registered for an
 * event with a specified name. The TView.cleanup data structure is used to find out which events
 * are registered for a given element.
 */
function findExistingListener(
  tView: TView,
  lView: LView,
  eventName: string,
  tNodeIndex: number,
): EventCallback | null {
  const tCleanup = tView.cleanup;
  if (tCleanup != null) {
    for (let i = 0; i < tCleanup.length - 1; i += 2) {
      const cleanupEventName = tCleanup[i];
      if (cleanupEventName === eventName && tCleanup[i + 1] === tNodeIndex) {
        // We have found a matching event name on the same node but it might not have been
        // registered yet, so we must explicitly verify entries in the LView cleanup data
        // structures.
        const lCleanup = lView[CLEANUP];
        const listenerIdxInLCleanup = tCleanup[i + 2];
        return lCleanup && lCleanup.length > listenerIdxInLCleanup
          ? lCleanup[listenerIdxInLCleanup]
          : null;
      }
      // TView.cleanup can have a mix of 4-elements entries (for event handler cleanups) or
      // 2-element entries (for directive and queries destroy hooks). As such we can encounter
      // blocks of 4 or 2 items in the tView.cleanup and this is why we iterate over 2 elements
      // first and jump another 2 elements if we detect listeners cleanup (4 elements). Also check
      // documentation of TView.cleanup for more details of this data structure layout.
      if (typeof cleanupEventName === 'string') {
        i += 2;
      }
    }
  }
  return null;
}

/**
 * Stores a cleanup function for an event listener.
 * @param indexOrTargetGetter Either the index of the TNode on which the event is bound or a
 *  function that when invoked will return the event target.
 * @param tView TView in which the event is bound.
 * @param lView LView in which the event is bound.
 * @param eventName Name of the event.
 * @param listenerFn Final callback of the event.
 * @param cleanup Function to invoke during cleanup.
 * @param isOutput Whether this is an output listener or a native DOM listener.
 */
export function storeListenerCleanup(
  indexOrTargetGetter: number | ((lView: LView) => EventTarget),
  tView: TView,
  lView: LView,
  eventName: string,
  listenerFn: WrappedEventCallback,
  cleanup: (() => void) | {unsubscribe: () => void},
  isOutput: boolean,
) {
  const tCleanup = tView.firstCreatePass ? getOrCreateTViewCleanup(tView) : null;
  const lCleanup = getOrCreateLViewCleanup(lView);
  const index = lCleanup.length;
  lCleanup.push(listenerFn, cleanup);
  tCleanup &&
    tCleanup.push(eventName, indexOrTargetGetter, index, (index + 1) * (isOutput ? -1 : 1));
}
