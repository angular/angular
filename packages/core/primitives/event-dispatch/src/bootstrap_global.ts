/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BUBBLE_EVENT_TYPES, CAPTURE_EVENT_TYPES} from './event_type';
import {Restriction} from './restriction';
import {addEvents, createEarlyJsactionData} from './earlyeventcontract';
import {EventInfo} from './event_info';

/** Creates an `EarlyJsactionData`, adds events to it, and populates it on the window. */
export function bootstrapGlobalEarlyEventContract() {
  const earlyJsactionData = createEarlyJsactionData(window.document.documentElement);
  addEvents(earlyJsactionData, BUBBLE_EVENT_TYPES);
  addEvents(earlyJsactionData, CAPTURE_EVENT_TYPES, /* capture= */ true);
  window._ejsa = earlyJsactionData;
}

/** Registers a dispatcher function on the `EarlyJsactionData` present on the window. */
export function registerGlobalDispatcher(
  restriction: Restriction,
  dispatcher: (eventInfo: EventInfo) => void,
) {
  window._ejsa!.d = dispatcher;
}
