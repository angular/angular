/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {createEventInfoFromParameters} from './event_info';
/**
 * EarlyEventContract intercepts events in the bubbling phase at the
 * boundary of the document body. This mapping will be passed to the
 * late-loaded EventContract.
 */
export class EarlyEventContract {
  constructor(dataContainer = window, container = window.document.documentElement) {
    this.dataContainer = dataContainer;
    dataContainer._ejsa = createEarlyJsactionData(container);
  }
  /**
   * Installs a list of event types for container .
   */
  addEvents(types, capture) {
    addEvents(this.dataContainer._ejsa, types, capture);
  }
}
/** Creates an `EarlyJsactionData` object. */
export function createEarlyJsactionData(container) {
  const q = [];
  const d = (eventInfo) => {
    q.push(eventInfo);
  };
  const h = (event) => {
    d(createEventInfoFromParameters(event.type, event, event.target, container, Date.now()));
  };
  return {
    c: container,
    q,
    et: [],
    etc: [],
    d,
    h,
  };
}
/** Add all the events to the container stored in the `EarlyJsactionData`. */
export function addEvents(earlyJsactionData, types, capture) {
  for (let i = 0; i < types.length; i++) {
    const eventType = types[i];
    const eventTypes = capture ? earlyJsactionData.etc : earlyJsactionData.et;
    eventTypes.push(eventType);
    earlyJsactionData.c.addEventListener(eventType, earlyJsactionData.h, capture);
  }
}
/** Get the queued `EventInfo` objects that were dispatched before a dispatcher was registered. */
export function getQueuedEventInfos(earlyJsactionData) {
  return earlyJsactionData?.q ?? [];
}
/** Register a different dispatcher function on the `EarlyJsactionData`. */
export function registerDispatcher(earlyJsactionData, dispatcher) {
  if (!earlyJsactionData) {
    return;
  }
  earlyJsactionData.d = dispatcher;
}
/** Removes all event listener handlers. */
export function removeAllEventListeners(earlyJsactionData) {
  if (!earlyJsactionData) {
    return;
  }
  removeEventListeners(earlyJsactionData.c, earlyJsactionData.et, earlyJsactionData.h);
  removeEventListeners(earlyJsactionData.c, earlyJsactionData.etc, earlyJsactionData.h, true);
}
function removeEventListeners(container, eventTypes, earlyEventHandler, capture) {
  for (let i = 0; i < eventTypes.length; i++) {
    container.removeEventListener(eventTypes[i], earlyEventHandler, /* useCapture */ capture);
  }
}
//# sourceMappingURL=earlyeventcontract.js.map
