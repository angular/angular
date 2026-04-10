/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// tslint:disable:no-duplicate-imports
import type {EventContract} from '../primitives/event-dispatch';
import {Attribute, EventPhase} from '../primitives/event-dispatch';
import {APP_ID} from './application/application_tokens';
import {InjectionToken} from './di';
import type {RElement, RNode} from './render3/interfaces/renderer_dom';
import {INJECTOR, type LView} from './render3/interfaces/view';

export const DEFER_BLOCK_SSR_ID_ATTRIBUTE = 'ngb';

/**
 * A symbol used to track which event types have been replayed on a given element via
 * `invokeListeners`. This prevents the native DOM listener (registered by the `listener`
 * instruction in templates) from also firing for an event that was already handled by
 * the event-replay mechanism, which would cause the handler to be called twice.
 */
const REPLAYED_EVENTS_KEY: unique symbol = /* @__PURE__ */ Symbol('ngReplayedEvents');

declare global {
  interface Element {
    __jsaction_fns: Map<string, Function[]> | undefined;
    [REPLAYED_EVENTS_KEY]?: Map<string, number>;
  }
}

export function setJSActionAttributes(
  nativeElement: Element,
  eventTypes: string[],
  parentDeferBlockId: string | null = null,
) {
  // jsaction attributes specifically should be applied to elements and not comment nodes.
  // Comment nodes also have no setAttribute function. So this avoids errors.
  if (eventTypes.length === 0 || nativeElement.nodeType !== Node.ELEMENT_NODE) {
    return;
  }
  const existingAttr = nativeElement.getAttribute(Attribute.JSACTION);
  // we dedupe cases where hydrate triggers are used as it's possible that
  // someone may have added an event binding to the root node that matches what the
  // hydrate trigger adds.
  const parts = eventTypes.reduce((prev, curr) => {
    // if there is no existing attribute OR it's not in the existing one, we need to add it
    return (existingAttr?.indexOf(curr) ?? -1) === -1 ? prev + curr + ':;' : prev;
  }, '');
  //  This is required to be a module accessor to appease security tests on setAttribute.
  nativeElement.setAttribute(Attribute.JSACTION, `${existingAttr ?? ''}${parts}`);

  const blockName = parentDeferBlockId ?? '';
  if (blockName !== '' && parts.length > 0) {
    nativeElement.setAttribute(DEFER_BLOCK_SSR_ID_ATTRIBUTE, blockName);
  }
}

export const sharedStashFunction = (rEl: RElement, eventType: string, listenerFn: Function) => {
  const el = rEl as unknown as Element;
  const eventListenerMap = el.__jsaction_fns ?? new Map();
  const eventListeners = eventListenerMap.get(eventType) ?? [];
  eventListeners.push(listenerFn);
  eventListenerMap.set(eventType, eventListeners);
  el.__jsaction_fns = eventListenerMap;
};

export const sharedMapFunction = (rEl: RElement, jsActionMap: Map<string, Set<Element>>) => {
  const el = rEl as unknown as Element;
  let blockName = el.getAttribute(DEFER_BLOCK_SSR_ID_ATTRIBUTE) ?? '';
  const blockSet = jsActionMap.get(blockName) ?? new Set<Element>();
  if (!blockSet.has(el)) {
    blockSet.add(el);
  }
  jsActionMap.set(blockName, blockSet);
};

export function removeListenersFromBlocks(
  blockNames: string[],
  jsActionMap: Map<string, Set<Element>>,
) {
  if (blockNames.length > 0) {
    let blockList: Element[] = [];
    for (let blockName of blockNames) {
      if (jsActionMap.has(blockName)) {
        blockList = [...blockList, ...jsActionMap.get(blockName)!];
      }
    }
    const replayList = new Set(blockList);
    replayList.forEach(removeListeners);
  }
}

export const removeListeners = (el: Element) => {
  el.removeAttribute(Attribute.JSACTION);
  el.removeAttribute(DEFER_BLOCK_SSR_ID_ATTRIBUTE);
  el.__jsaction_fns = undefined;
};

export interface EventContractDetails {
  instance?: EventContract;
}

export const JSACTION_EVENT_CONTRACT = new InjectionToken<EventContractDetails>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'EVENT_CONTRACT_DETAILS' : '',
  {
    factory: () => ({}),
  },
);

export function invokeListeners(event: Event, currentTarget: Element | null) {
  const handlerFns = currentTarget?.__jsaction_fns?.get(event.type);
  if (!handlerFns || !currentTarget?.isConnected) {
    return;
  }
  // Track that we're about to replay this event so the native DOM listener can detect
  // it was already handled and skip itself.
  const replayedEvents = currentTarget[REPLAYED_EVENTS_KEY] ?? new Map<string, number>();
  replayedEvents.set(event.type, (replayedEvents.get(event.type) ?? 0) + 1);
  currentTarget[REPLAYED_EVENTS_KEY] = replayedEvents;
  for (const handler of handlerFns) {
    handler(event);
  }
}

// Elements whose resources load independently and can fire `load`/`error` on their own
// after hydration. Other elements (div, span, etc.) only get events from user interaction,
// so they don't need this treatment.
const AUTO_LOAD_ELEMENTS = /^(IMG|IFRAME|SCRIPT|LINK|OBJECT|EMBED|INPUT)$/;

// Guards against calling enableSkipNativeListenerImpl more than once.
let isSkipNativeListenerImplEnabled = false;

let _shouldSkipNativeListenerImpl: (event: Event) => boolean = () => false;

/**
 * Returns whether the native DOM listener should be skipped for this event because
 * `invokeListeners` already called it during replay.
 *
 * Defaults to `() => false` so that terser/esbuild can inline the constant and drop
 * the branch in apps that don't use event replay. The real implementation is swapped
 * in by `enableSkipNativeListenerImpl` when `withEventReplay()` is configured.
 */
export function shouldSkipNativeListener(event: Event): boolean {
  return _shouldSkipNativeListenerImpl(event);
}

/**
 * Installs the real `shouldSkipNativeListener` implementation. Called by `withEventReplay()`
 * so the logic is only included in bundles that actually need event replay.
 */
export function enableSkipNativeListenerImpl(): void {
  if (!isSkipNativeListenerImplEnabled) {
    _shouldSkipNativeListenerImpl = (event: Event): boolean => {
      // The replay invocation arrives with eventPhase === EventPhase.REPLAY — let it through.
      // We only want to suppress the native DOM listener that fires afterwards.
      if (event.eventPhase === EventPhase.REPLAY) return false;

      const target = (event.currentTarget ?? event.target) as Element | null;
      // Only relevant for elements that load resources on their own. For everything else
      // (div, button, etc.) the native listener should always fire normally.
      if (!target || !AUTO_LOAD_ELEMENTS.test(target.tagName)) {
        return false;
      }

      const map = target[REPLAYED_EVENTS_KEY];
      const count = map?.get(event.type);
      if (!count) return false;

      count <= 1 ? map!.delete(event.type) : map!.set(event.type, count - 1);
      return true;
    };

    isSkipNativeListenerImplEnabled = true;
  }
}

/** Shorthand for an event listener callback function to reduce duplication. */
export type EventCallback = (event?: any) => any;

/** Utility type used to make it harder to swap a wrapped and unwrapped callback. */
export type WrappedEventCallback = EventCallback & {__wrapped: boolean};

/**
 * Represents a signature of a function that disables event replay feature
 * for server-side rendered applications. This function is overridden with
 * an actual implementation when the event replay feature is enabled via
 * `withEventReplay()` call.
 */
type StashEventListener = (el: RNode, eventName: string, listenerFn: EventCallback) => void;

const stashEventListeners = new Map<string, StashEventListener>();

/**
 * Registers a stashing function for a specific application ID.
 *
 * @param appId The unique identifier for the application instance.
 * @param fn The stashing function to associate with this app ID.
 * @returns A cleanup function that removes the stashing function when called.
 */
export function setStashFn(appId: string, fn: StashEventListener) {
  stashEventListeners.set(appId, fn);
  return () => stashEventListeners.delete(appId);
}

/**
 * Indicates whether the stashing code was added, prevents adding it multiple times.
 */
let isStashEventListenerImplEnabled = false;

let _stashEventListenerImpl = (
  lView: LView,
  target: RElement | EventTarget,
  eventName: string,
  wrappedListener: WrappedEventCallback,
) => {};

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
export function stashEventListenerImpl(
  lView: LView,
  target: RElement | EventTarget,
  eventName: string,
  wrappedListener: WrappedEventCallback,
): void {
  _stashEventListenerImpl(lView, target, eventName, wrappedListener);
}

/**
 * Enables the event listener stashing logic in a tree-shakable way.
 *
 * This function lazily sets the implementation of `_stashEventListenerImpl`
 * so that it becomes active only when `withEventReplay` is invoked. This ensures
 * that the stashing logic is excluded from production builds unless needed.
 */
export function enableStashEventListenerImpl(): void {
  if (!isStashEventListenerImplEnabled) {
    _stashEventListenerImpl = (
      lView: LView,
      target: RElement | EventTarget,
      eventName: string,
      wrappedListener: EventCallback,
    ) => {
      const appId = lView[INJECTOR].get(APP_ID);
      const stashEventListener = stashEventListeners.get(appId);
      stashEventListener?.(target as RElement, eventName, wrappedListener);
    };

    isStashEventListenerImplEnabled = true;
  }
}
