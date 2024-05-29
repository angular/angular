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
  registerDispatcher,
} from '@angular/core/primitives/event-dispatch';
import * as Attributes from '@angular/core/primitives/event-dispatch';
import {Injectable, Injector} from './di';
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

export function setJSActionAttribute(nativeElement: Element, eventTypes: string[]) {
  if (!eventTypes.length) {
    return;
  }
  const parts = eventTypes.reduce((prev, curr) => prev + curr + ':;', '');
  const existingAttr = nativeElement.getAttribute(Attributes.JSACTION);
  //  This is required to be a module accessor to appease security tests on setAttribute.
  nativeElement.setAttribute(Attributes.JSACTION, `${existingAttr ?? ''}${parts}`);
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
  el.removeAttribute(Attributes.JSACTION);
  el.__jsaction_fns = undefined;
};

@Injectable({providedIn: 'root'})
export class GlobalEventDelegation {
  eventContract!: EventContract;
  addEvent(el: Element, eventName: string) {
    if (this.eventContract) {
      this.eventContract.addEvent(eventName);
      setJSActionAttribute(el, [eventName]);
      return true;
    }
    return false;
  }
}

export const initGlobalEventDelegation = (
  eventDelegation: GlobalEventDelegation,
  injector: Injector,
) => {
  if (injector.get(IS_EVENT_REPLAY_ENABLED, EVENT_REPLAY_ENABLED_DEFAULT)) {
    return;
  }
  eventDelegation.eventContract = new EventContract(new EventContractContainer(document.body));
  const dispatcher = new EventDispatcher(invokeRegisteredListeners);
  registerDispatcher(eventDelegation.eventContract, dispatcher);
};
