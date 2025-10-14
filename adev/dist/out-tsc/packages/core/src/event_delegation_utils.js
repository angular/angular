/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Attribute} from '../primitives/event-dispatch';
import {APP_ID} from './application/application_tokens';
import {InjectionToken} from './di';
import {INJECTOR} from './render3/interfaces/view';
export const DEFER_BLOCK_SSR_ID_ATTRIBUTE = 'ngb';
export function setJSActionAttributes(nativeElement, eventTypes, parentDeferBlockId = null) {
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
export const sharedStashFunction = (rEl, eventType, listenerFn) => {
  const el = rEl;
  const eventListenerMap = el.__jsaction_fns ?? new Map();
  const eventListeners = eventListenerMap.get(eventType) ?? [];
  eventListeners.push(listenerFn);
  eventListenerMap.set(eventType, eventListeners);
  el.__jsaction_fns = eventListenerMap;
};
export const sharedMapFunction = (rEl, jsActionMap) => {
  const el = rEl;
  let blockName = el.getAttribute(DEFER_BLOCK_SSR_ID_ATTRIBUTE) ?? '';
  const blockSet = jsActionMap.get(blockName) ?? new Set();
  if (!blockSet.has(el)) {
    blockSet.add(el);
  }
  jsActionMap.set(blockName, blockSet);
};
export function removeListenersFromBlocks(blockNames, jsActionMap) {
  if (blockNames.length > 0) {
    let blockList = [];
    for (let blockName of blockNames) {
      if (jsActionMap.has(blockName)) {
        blockList = [...blockList, ...jsActionMap.get(blockName)];
      }
    }
    const replayList = new Set(blockList);
    replayList.forEach(removeListeners);
  }
}
export const removeListeners = (el) => {
  el.removeAttribute(Attribute.JSACTION);
  el.removeAttribute(DEFER_BLOCK_SSR_ID_ATTRIBUTE);
  el.__jsaction_fns = undefined;
};
export const JSACTION_EVENT_CONTRACT = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'EVENT_CONTRACT_DETAILS' : '',
  {
    providedIn: 'root',
    factory: () => ({}),
  },
);
export function invokeListeners(event, currentTarget) {
  const handlerFns = currentTarget?.__jsaction_fns?.get(event.type);
  if (!handlerFns || !currentTarget?.isConnected) {
    return;
  }
  for (const handler of handlerFns) {
    handler(event);
  }
}
const stashEventListeners = new Map();
/**
 * Registers a stashing function for a specific application ID.
 *
 * @param appId The unique identifier for the application instance.
 * @param fn The stashing function to associate with this app ID.
 * @returns A cleanup function that removes the stashing function when called.
 */
export function setStashFn(appId, fn) {
  stashEventListeners.set(appId, fn);
  return () => stashEventListeners.delete(appId);
}
/**
 * Indicates whether the stashing code was added, prevents adding it multiple times.
 */
let isStashEventListenerImplEnabled = false;
let _stashEventListenerImpl = (lView, target, eventName, wrappedListener) => {};
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
export function stashEventListenerImpl(lView, target, eventName, wrappedListener) {
  _stashEventListenerImpl(lView, target, eventName, wrappedListener);
}
/**
 * Enables the event listener stashing logic in a tree-shakable way.
 *
 * This function lazily sets the implementation of `_stashEventListenerImpl`
 * so that it becomes active only when `withEventReplay` is invoked. This ensures
 * that the stashing logic is excluded from production builds unless needed.
 */
export function enableStashEventListenerImpl() {
  if (!isStashEventListenerImplEnabled) {
    _stashEventListenerImpl = (lView, target, eventName, wrappedListener) => {
      const appId = lView[INJECTOR].get(APP_ID);
      const stashEventListener = stashEventListeners.get(appId);
      stashEventListener?.(target, eventName, wrappedListener);
    };
    isStashEventListenerImplEnabled = true;
  }
}
//# sourceMappingURL=event_delegation_utils.js.map
