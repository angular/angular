/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { EventContract } from '../primitives/event-dispatch';
import { InjectionToken } from './di';
import type { RElement, RNode } from './render3/interfaces/renderer_dom';
import { type LView } from './render3/interfaces/view';
export declare const DEFER_BLOCK_SSR_ID_ATTRIBUTE = "ngb";
declare global {
    interface Element {
        __jsaction_fns: Map<string, Function[]> | undefined;
    }
}
export declare function setJSActionAttributes(nativeElement: Element, eventTypes: string[], parentDeferBlockId?: string | null): void;
export declare const sharedStashFunction: (rEl: RElement, eventType: string, listenerFn: Function) => void;
export declare const sharedMapFunction: (rEl: RElement, jsActionMap: Map<string, Set<Element>>) => void;
export declare function removeListenersFromBlocks(blockNames: string[], jsActionMap: Map<string, Set<Element>>): void;
export declare const removeListeners: (el: Element) => void;
export interface EventContractDetails {
    instance?: EventContract;
}
export declare const JSACTION_EVENT_CONTRACT: InjectionToken<EventContractDetails>;
export declare function invokeListeners(event: Event, currentTarget: Element | null): void;
/** Shorthand for an event listener callback function to reduce duplication. */
export type EventCallback = (event?: any) => any;
/** Utility type used to make it harder to swap a wrapped and unwrapped callback. */
export type WrappedEventCallback = EventCallback & {
    __wrapped: boolean;
};
/**
 * Represents a signature of a function that disables event replay feature
 * for server-side rendered applications. This function is overridden with
 * an actual implementation when the event replay feature is enabled via
 * `withEventReplay()` call.
 */
type StashEventListener = (el: RNode, eventName: string, listenerFn: EventCallback) => void;
/**
 * Registers a stashing function for a specific application ID.
 *
 * @param appId The unique identifier for the application instance.
 * @param fn The stashing function to associate with this app ID.
 * @returns A cleanup function that removes the stashing function when called.
 */
export declare function setStashFn(appId: string, fn: StashEventListener): () => boolean;
/**
 * Optionally stashes an event listener for later replay during hydration.
 *
 * This function delegates to an internal `_stashEventListenerImpl`, which may
 * be a no-op unless the event replay feature is enabled. When active, this
 * allows capturing event listener metadata before hydration completes, so that
 * user interactions during SSR can be replayed.
 *
 * @param lView The logical view (LView) where the listener is being registered.
 * @param target The DOM element or event target the listener is attached to.
 * @param eventName The name of the event being listened for (e.g., 'click').
 * @param wrappedListener The event handler that was registered.
 */
export declare function stashEventListenerImpl(lView: LView, target: RElement | EventTarget, eventName: string, wrappedListener: WrappedEventCallback): void;
/**
 * Enables the event listener stashing logic in a tree-shakable way.
 *
 * This function lazily sets the implementation of `_stashEventListenerImpl`
 * so that it becomes active only when `withEventReplay` is invoked. This ensures
 * that the stashing logic is excluded from production builds unless needed.
 */
export declare function enableStashEventListenerImpl(): void;
export {};
