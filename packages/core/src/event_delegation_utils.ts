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
  isSupportedEvent,
  registerDispatcher,
} from '@angular/core/primitives/event-dispatch';
import {Attribute} from '@angular/core/primitives/event-dispatch';
import {Injectable, InjectionToken, Injector, inject} from './di';
import {RElement} from './render3/interfaces/renderer_dom';
import {EVENT_REPLAY_ENABLED_DEFAULT, IS_EVENT_REPLAY_ENABLED} from './hydration/tokens';

declare global {
  interface Element {
    __jsaction_fns: Map<string, Function[]> | undefined;
  }
}

export function invokeRegisteredListeners(event: Event) {
  const handlerFns = (event.currentTarget as Element)?.__jsaction_fns?.get(event.type);
  if (!handlerFns) {
    return;
  }
  for (const handler of handlerFns) {
    handler(event);
  }
}

export function setJSActionAttributes(nativeElement: Element, eventTypes: string[]) {
  if (!eventTypes.length) {
    return;
  }
  const parts = eventTypes.reduce((prev, curr) => prev + curr + ':;', '');
  const existingAttr = nativeElement.getAttribute(Attribute.JSACTION);
  nativeElement.setAttribute(Attribute.JSACTION, `${existingAttr ?? ''}${parts}`);
}

export function setJSActionAttribute(nativeElement: Element, eventType: string) {
  const existingAttr = nativeElement.getAttribute(Attribute.JSACTION);
  //  This is required to be a module accessor to appease security tests on setAttribute.
  nativeElement.setAttribute(Attribute.JSACTION, `${existingAttr ?? ''}${eventType}:;`);
}

export const sharedStashFunction = (rEl: RElement, eventType: string, listenerFn: () => void) => {
  const el = rEl as unknown as Element;
  const eventListenerMap = el.__jsaction_fns ?? new Map();
  const eventListeners = eventListenerMap.get(eventType) ?? [];
  eventListeners.push(listenerFn);
  eventListenerMap.set(eventType, eventListeners);
  el.__jsaction_fns = eventListenerMap;
};

export const removeListeners = (el: Element) => {
  el.removeAttribute(Attribute.JSACTION);
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
export class GlobalEventDelegation {
  private eventContractDetails = inject(JSACTION_EVENT_CONTRACT);

  supports(eventName: string): boolean {
    return isSupportedEvent(eventName);
  }

  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    this.eventContractDetails.instance!.addEvent(eventName);
    setJSActionAttribute(element, eventName);
    return () => this.removeEventListener(element, eventName, handler);
  }

  removeEventListener(element: HTMLElement, eventName: string, callback: Function): void {
    const newJsactionAttribute = element
      .getAttribute(Attribute.JSACTION)
      ?.split(';')
      .filter((s) => s === eventName + ':')
      .join(';');
    element.setAttribute(Attribute.JSACTION, newJsactionAttribute ?? '');
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
    /* useActionResolver= */ false,
  ));
  const dispatcher = new EventDispatcher(invokeRegisteredListeners);
  registerDispatcher(eventContract, dispatcher);
};
