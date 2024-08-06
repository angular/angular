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
import {EVENT_REPLAY_ENABLED_DEFAULT, IS_EVENT_REPLAY_ENABLED} from './hydration/tokens';
import {OnDestroy} from './interface/lifecycle_hooks';

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

export const sharedStashFunction = (rEl: RElement, eventType: string, listenerFn: Function) => {
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
export class GlobalEventDelegation implements OnDestroy {
  private eventContractDetails = inject(JSACTION_EVENT_CONTRACT);

  ngOnDestroy() {
    this.eventContractDetails.instance?.cleanUp();
  }

  supports(eventType: string): boolean {
    return isEarlyEventType(eventType);
  }

  addEventListener(
    element: HTMLElement | Window | Document,
    eventType: string,
    handler: Function,
  ): Function {
    if (element instanceof HTMLElement) {
      this.eventContractDetails.instance!.addEvent(eventType);
      getActionCache(element)[eventType] = '';
      sharedStashFunction(element, eventType, handler);
    } else {
      element.addEventListener(eventType, handler as EventListener);
    }
    return () => this.removeEventListener(element, eventType, handler);
  }

  removeEventListener(
    element: HTMLElement | Window | Document,
    eventType: string,
    callback: Function,
  ): void {
    if (element instanceof HTMLElement) {
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
  const dispatcher = new EventDispatcher(invokeRegisteredListeners, /** clickModSupport */ false);
  registerDispatcher(eventContract, dispatcher);
};
