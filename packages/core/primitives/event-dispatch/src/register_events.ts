/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EarlyEventContract, EarlyJsactionDataContainer} from './earlyeventcontract';

export type EventContractTracker<T> = {[key: string]: {[appId: string]: T}};

/**
 * Provides a factory function for bootstrapping an event contract on a
 * specified object (by default, exposed on the `window`).
 * @param field The property on the object that the event contract will be placed on.
 * @param container The container that listens to events
 * @param appId A given identifier for an application. If there are multiple apps on the page
 *              then this is how contracts can be initialized for each one.
 * @param eventTypes An array of event names that should be listened to.
 * @param captureEventTypes An array of event names that should be listened to with capture.
 * @param earlyJsactionTracker The object that should receive the event contract.
 */
export function bootstrapEarlyEventContract(
  field: string,
  container: HTMLElement,
  appId: string,
  eventTypes?: string[],
  captureEventTypes?: string[],
  earlyJsactionTracker: EventContractTracker<EarlyJsactionDataContainer> = window as unknown as EventContractTracker<EarlyJsactionDataContainer>,
) {
  if (!earlyJsactionTracker[field]) {
    earlyJsactionTracker[field] = {};
  }
  earlyJsactionTracker[field][appId] = {};
  const eventContract = new EarlyEventContract(earlyJsactionTracker[field][appId], container);
  if (eventTypes) eventContract.addEvents(eventTypes);
  if (captureEventTypes) eventContract.addEvents(captureEventTypes, true);
}
