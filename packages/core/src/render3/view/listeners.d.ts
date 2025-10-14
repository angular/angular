/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { TNode } from '../interfaces/node';
import { type LView, type TView } from '../interfaces/view';
import type { GlobalTargetResolver, Renderer } from '../interfaces/renderer';
import { type EventCallback, type WrappedEventCallback } from '../../event_delegation_utils';
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
export declare function wrapListener(tNode: TNode, lView: LView<{} | null>, listenerFn: EventCallback): WrappedEventCallback;
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
export declare function listenToDomEvent(tNode: TNode, tView: TView, lView: LView<{} | null>, eventTargetResolver: GlobalTargetResolver | undefined, renderer: Renderer, eventName: string, originalListener: EventCallback, wrappedListener: WrappedEventCallback): boolean;
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
export declare function storeListenerCleanup(indexOrTargetGetter: number | ((lView: LView) => EventTarget), tView: TView, lView: LView, eventName: string, listenerFn: WrappedEventCallback, cleanup: (() => void) | {
    unsubscribe: () => void;
}, isOutput: boolean): void;
