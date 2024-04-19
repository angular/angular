/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventContractContainer} from './event_contract_container';
import {EventContract} from './eventcontract';

/**
 * Provides a factory function for bootstrapping an event contract on a
 * window object.
 * @param field The property on the window that the event contract will be placed on.
 * @param container The container that listens to events
 * @param appId A given identifier for an application. If there are multiple apps on the page
 *              then this is how contracts can be initialized for each one.
 */
export function bootstrapEventContract(
  field: string,
  container: Element,
  appId: string,
  events: string[],
) {
  const contractContainer = new EventContractContainer(container);
  // tslint:disable-next-line:no-any
  const anyWindow = window as any;
  if (!anyWindow[field]) {
    anyWindow[field] = {};
  }
  const eventContract = new EventContract(contractContainer, /* stopPropagation */ false);
  anyWindow[field][appId] = eventContract;
  for (const ev of events) {
    eventContract.addEvent(ev);
  }
}

export function cleanup() {
  (globalThis as any).__ngEventContracts__ = undefined;
}
