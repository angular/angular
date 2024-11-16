/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Restriction} from './restriction';
import {
  EarlyJsactionDataContainer,
  addEvents,
  createEarlyJsactionData,
  getQueuedEventInfos,
  registerDispatcher,
  removeAllEventListeners,
} from './earlyeventcontract';
import {EventInfo} from './event_info';

/**
 * Creates an `EarlyJsactionData`, adds events to it, and populates it on a nested object on
 * the window.
 */
export function bootstrapAppScopedEarlyEventContract(
  container: HTMLElement,
  appId: string,
  bubbleEventTypes: string[],
  captureEventTypes: string[],
  dataContainer: EarlyJsactionDataContainer = window,
) {
  const earlyJsactionData = createEarlyJsactionData(container);
  if (!dataContainer._ejsas) {
    dataContainer._ejsas = {};
  }
  dataContainer._ejsas[appId] = earlyJsactionData;
  addEvents(earlyJsactionData, bubbleEventTypes);
  addEvents(earlyJsactionData, captureEventTypes, /* capture= */ true);
}

/** Get the queued `EventInfo` objects that were dispatched before a dispatcher was registered. */
export function getAppScopedQueuedEventInfos(
  appId: string,
  dataContainer: EarlyJsactionDataContainer = window,
) {
  return getQueuedEventInfos(dataContainer._ejsas?.[appId]);
}

/**
 * Registers a dispatcher function on the `EarlyJsactionData` present on the nested object on the
 * window.
 */
export function registerAppScopedDispatcher(
  restriction: Restriction,
  appId: string,
  dispatcher: (eventInfo: EventInfo) => void,
  dataContainer: EarlyJsactionDataContainer = window,
) {
  registerDispatcher(dataContainer._ejsas?.[appId], dispatcher);
}

/** Removes all event listener handlers. */
export function removeAllAppScopedEventListeners(
  appId: string,
  dataContainer: EarlyJsactionDataContainer = window,
) {
  removeAllEventListeners(dataContainer._ejsas?.[appId]);
}

/** Clear the early event contract. */
export function clearAppScopedEarlyEventContract(
  appId: string,
  dataContainer: EarlyJsactionDataContainer = window,
) {
  if (!dataContainer._ejsas) {
    return;
  }
  dataContainer._ejsas[appId] = undefined;
}
