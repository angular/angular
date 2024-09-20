/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Restriction} from './restriction';
import {
  addEvents,
  createEarlyJsactionData,
  getQueuedEventInfos,
  registerDispatcher,
  removeAllEventListeners,
} from './earlyeventcontract';
import {EventInfo} from './event_info';

/** Creates an `EarlyJsactionData`, adds events to it, and populates it on the window. */
export function bootstrapGlobalEarlyEventContract(
  bubbleEventTypes: string[],
  captureEventTypes: string[],
) {
  const earlyJsactionData = createEarlyJsactionData(window.document.documentElement);
  addEvents(earlyJsactionData, bubbleEventTypes);
  addEvents(earlyJsactionData, captureEventTypes, /* capture= */ true);
  window._ejsa = earlyJsactionData;
}

/** Get the queued `EventInfo` objects that were dispatched before a dispatcher was registered. */
export function getGlobalQueuedEventInfos() {
  return getQueuedEventInfos(window._ejsa);
}

/** Registers a dispatcher function on the `EarlyJsactionData` present on the window. */
export function registerGlobalDispatcher(
  restriction: Restriction,
  dispatcher: (eventInfo: EventInfo) => void,
) {
  registerDispatcher(window._ejsa, dispatcher);
}

/** Removes all event listener handlers. */
export function removeAllGlobalEventListeners() {
  removeAllEventListeners(window._ejsa);
}

/** Removes the global early event contract. */
export function clearGlobalEarlyEventContract() {
  window._ejsa = undefined;
}
