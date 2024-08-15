/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// tslint:disable:no-duplicate-imports
import {
  EventContract,
  EventContractContainer,
  EventDispatcher,
  isEarlyEventType,
  getActionCache,
  registerDispatcher,
} from '@angular/core/primitives/event-dispatch';
import {Attribute} from '@angular/core/primitives/event-dispatch';
import {Injectable, InjectionToken, Injector, inject} from './di';
import {RElement} from './render3/interfaces/renderer_dom';
import {
  BLOCK_ELEMENT_MAP,
  EVENT_REPLAY_ENABLED_DEFAULT,
  IS_EVENT_REPLAY_ENABLED,
} from './hydration/tokens';
import {OnDestroy} from './interface/lifecycle_hooks';

export const BLOCKNAME_ATTRIBUTE = 'ngb';

declare global {
  interface Element {
    __jsaction_fns: Map<string, Function[]> | undefined;
  }
}

export function invokeRegisteredDelegationListeners(event: Event) {
  const handlerFns = (event.currentTarget as Element)?.__jsaction_fns?.get(event.type);
  if (!handlerFns) {
    return;
  }
  for (const handler of handlerFns) {
    handler(event);
  }
}

export function setJSActionAttributes(
  nativeElement: Element,
  eventTypes: string[],
  parentDeferBlockId: string | null = null,
) {
  if (!eventTypes.length || nativeElement.nodeType !== Node.ELEMENT_NODE) {
    return;
  }
  const existingAttr = nativeElement.getAttribute(Attribute.JSACTION);
  // we need to dedupe in cases where hydrate triggers are used as it's possible that
  // someone may have added an event binding to the root node that matches what the
  // hydrate trigger adds.
  const parts = eventTypes
    .filter((et) => !existingAttr?.match(et))
    .reduce((prev, curr) => prev + curr + ':;', '');
  //  This is required to be a module accessor to appease security tests on setAttribute.
  nativeElement.setAttribute(Attribute.JSACTION, `${existingAttr ?? ''}${parts}`);

  const blockName = parentDeferBlockId ?? '';
  if (blockName !== '' && parts.length > 0) {
    nativeElement.setAttribute(BLOCKNAME_ATTRIBUTE, blockName);
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
  let blockName = rEl.getAttribute(BLOCKNAME_ATTRIBUTE) ?? '';
  const el = rEl as unknown as Element;
  const blockSet = jsActionMap.get(blockName) ?? new Set<Element>();
  if (!blockSet.has(el)) {
    blockSet.add(el);
  }
  jsActionMap.set(blockName, blockSet);
};

export function removeListenersFromBlocks(blockNames: string[], injector: Injector) {
  let blockList: Element[] = [];
  const jsActionMap = injector.get(BLOCK_ELEMENT_MAP);
  for (let blockName of blockNames) {
    if (jsActionMap.has(blockName)) {
      blockList = [...blockList, ...jsActionMap.get(blockName)!];
    }
  }
  const replayList = new Set(blockList);
  replayList.forEach(removeListeners);
}

export const removeListeners = (el: Element) => {
  el.removeAttribute(Attribute.JSACTION);
  el.removeAttribute(BLOCKNAME_ATTRIBUTE);
  el.__jsaction_fns = undefined;
};

export interface EventContractDetails {
  instance?: EventContract;
}

export const JSACTION_EVENT_CONTRACT = new InjectionToken<EventContractDetails>(
  ngDevMode ? 'EVENT_CONTRACT_DETAILS' : '',
  {
    providedIn: 'root',
    factory: () => ({}),
  },
);

export const GLOBAL_EVENT_DELEGATION = new InjectionToken<GlobalEventDelegation>(
  ngDevMode ? 'GLOBAL_EVENT_DELEGATION' : '',
);

/**
 * This class is the delegate for `EventDelegationPlugin`. It represents the
 * noop version of this class, with the enabled version set when
 * `provideGlobalEventDelegation` is called.
 */
@Injectable()
export class GlobalEventDelegation implements OnDestroy {
  private eventContractDetails = inject(JSACTION_EVENT_CONTRACT);

  ngOnDestroy() {
    this.eventContractDetails.instance?.cleanUp();
  }

  supports(eventType: string): boolean {
    return isEarlyEventType(eventType);
  }

  addEventListener(element: HTMLElement, eventType: string, handler: Function): Function {
    // Note: contrary to the type, Window and Document can be passed in
    // as well.
    if (element.nodeType === Node.ELEMENT_NODE) {
      this.eventContractDetails.instance!.addEvent(eventType);
      getActionCache(element)[eventType] = '';
      sharedStashFunction(element, eventType, handler);
    } else {
      element.addEventListener(eventType, handler as EventListener);
    }
    return () => this.removeEventListener(element, eventType, handler);
  }

  removeEventListener(element: HTMLElement, eventType: string, callback: Function): void {
    if (element.nodeType === Node.ELEMENT_NODE) {
      getActionCache(element)[eventType] = undefined;
    } else {
      element.removeEventListener(eventType, callback as EventListener);
    }
  }
}

export const initGlobalEventDelegation = (
  eventContractDetails: EventContractDetails,
  injector: Injector,
) => {
  if (injector.get(IS_EVENT_REPLAY_ENABLED, EVENT_REPLAY_ENABLED_DEFAULT)) {
    return;
  }
  const eventContract = (eventContractDetails.instance = new EventContract(
    new EventContractContainer(document.body),
  ));
  const dispatcher = new EventDispatcher(
    invokeRegisteredDelegationListeners,
    /** clickModSupport */ false,
  );
  registerDispatcher(eventContract, dispatcher);
};
