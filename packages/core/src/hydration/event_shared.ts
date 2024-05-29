/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EarlyJsactionDataContainer} from '@angular/core/primitives/event-dispatch';
import {JSACTION} from '@angular/core/primitives/event-dispatch/src/attribute';
import {RElement} from '../render3/interfaces/renderer_dom';

const JSACTION_ATTRIBUTE = 'jsaction';

declare global {
  var ngContracts: {[key: string]: EarlyJsactionDataContainer};
  interface Element {
    __jsaction_fns: Map<string, Function[]> | undefined;
  }
}

export function handleEvent(event: Event) {
  const handlerFns = (event.currentTarget as Element)?.__jsaction_fns?.get(event.type);
  if (!handlerFns) {
    return;
  }
  for (const handler of handlerFns) {
    handler(event);
  }
}

export function setJSActionAttribute(nativeElement: Element, eventTypes: string[]) {
  const parts = eventTypes.map((event) => `${event}:`);
  if (parts.length > 0) {
    nativeElement.setAttribute(
      JSACTION_ATTRIBUTE,
      `${nativeElement.getAttribute(JSACTION) ?? ''}${parts.join(';')}`,
    );
  }
}

export const sharedStashFunction = (rEl: RElement, eventName: string, listenerFn: VoidFunction) => {
  const el = rEl as unknown as Element;
  const eventMap = el.__jsaction_fns || (el.__jsaction_fns = new Map());
  if (!eventMap.has(eventName)) {
    eventMap.set(eventName, []);
  }
  eventMap.get(eventName)!.push(listenerFn);
};
