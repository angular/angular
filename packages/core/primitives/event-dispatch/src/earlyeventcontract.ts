/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createEventInfoFromParameters, EventInfo} from './event_info';

export declare interface EarlyJsactionDataContainer {
  _ejsa?: EarlyJsactionData;
  _ejsas?: {[appId: string]: EarlyJsactionData | undefined};
}

declare global {
  interface Window {
    _ejsa?: EarlyJsactionData;
    _ejsas?: {[appId: string]: EarlyJsactionData | undefined};
  }
}

/**
 * Defines the early jsaction data types.
 */
export declare interface EarlyJsactionData {
  /** List used to keep track of the early JSAction event types. */
  et: string[];

  /** List used to keep track of the early JSAction capture event types. */
  etc: string[];

  /** Early JSAction handler for all events. */
  h: (event: Event) => void;

  /** Dispatcher handler. Initializes to populating `q`. */
  d: (eventInfo: EventInfo) => void;

  /** List used to push `EventInfo` objects if the dispatcher is not registered. */
  q: EventInfo[];

  /** Container for listening to events. */
  c: HTMLElement;
}

/**
 * EarlyEventContract intercepts events in the bubbling phase at the
 * boundary of the document body. This mapping will be passed to the
 * late-loaded EventContract.
 */
export class EarlyEventContract {
  constructor(
    private readonly dataContainer: EarlyJsactionDataContainer = window,
    container = window.document.documentElement,
  ) {
    dataContainer._ejsa = createEarlyJsactionData(container);
  }

  /**
   * Installs a list of event types for container .
   */
  addEvents(types: string[], capture?: boolean) {
    addEvents(this.dataContainer._ejsa!, types, capture);
  }
}

/** Creates an `EarlyJsactionData` object. */
export function createEarlyJsactionData(container: HTMLElement) {
  const q: EventInfo[] = [];
  const d = (eventInfo: EventInfo) => {
    q.push(eventInfo);
  };
  const h = (event: Event) => {
    d(
      createEventInfoFromParameters(
        event.type,
        event,
        event.target as Element,
        container,
        Date.now(),
      ),
    );
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
export function addEvents(
  earlyJsactionData: EarlyJsactionData,
  types: string[],
  capture?: boolean,
) {
  for (let i = 0; i < types.length; i++) {
    const eventType = types[i];
    const eventTypes = capture ? earlyJsactionData.etc : earlyJsactionData.et;
    eventTypes.push(eventType);
    earlyJsactionData.c.addEventListener(eventType, earlyJsactionData.h, capture);
  }
}

/** Get the queued `EventInfo` objects that were dispatched before a dispatcher was registered. */
export function getQueuedEventInfos(earlyJsactionData: EarlyJsactionData | undefined) {
  return earlyJsactionData?.q ?? [];
}

/** Register a different dispatcher function on the `EarlyJsactionData`. */
export function registerDispatcher(
  earlyJsactionData: EarlyJsactionData | undefined,
  dispatcher: (eventInfo: EventInfo) => void,
) {
  if (!earlyJsactionData) {
    return;
  }
  earlyJsactionData.d = dispatcher;
}

/** Removes all event listener handlers. */
export function removeAllEventListeners(earlyJsactionData: EarlyJsactionData | undefined) {
  if (!earlyJsactionData) {
    return;
  }
  removeEventListeners(earlyJsactionData.c, earlyJsactionData.et, earlyJsactionData.h);
  removeEventListeners(earlyJsactionData.c, earlyJsactionData.etc, earlyJsactionData.h, true);
}

function removeEventListeners(
  container: HTMLElement,
  eventTypes: string[],
  earlyEventHandler: (e: Event) => void,
  capture?: boolean,
) {
  for (let i = 0; i < eventTypes.length; i++) {
    container.removeEventListener(eventTypes[i], earlyEventHandler, /* useCapture */ capture);
  }
}
