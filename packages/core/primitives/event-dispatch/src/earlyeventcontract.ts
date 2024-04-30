/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createEventInfoFromParameters, EventInfo} from './event_info';

declare global {
  interface Window {
    _ejsa?: EarlyJsactionData;
  }
}

/**
 * Defines the early jsaction data types.
 */
export declare interface EarlyJsactionData {
  // List used to keep track of the early JSAction event types.
  et: string[];

  // List used to keep track of the JSAction events if using earlyeventcontract.
  q: EventInfo[];

  // Early Jsaction handler
  h: (event: Event) => void;

  // Container for listening to events
  c: HTMLElement;
}

/**
 * EarlyEventContract intercepts events in the bubbling phase at the
 * boundary of the document body. This mapping will be passed to the
 * late-loaded EventContract.
 */
export class EarlyEventContract {
  constructor(
    private readonly container: Window = window,
    private readonly documentElement = window.document.documentElement,
  ) {
    this.container._ejsa = {
      c: documentElement,
      q: [],
      et: [],
      h: (event: Event) => {
        const eventInfo = createEventInfoFromParameters(
          event.type,
          event,
          event.target as Element,
          window.document.documentElement,
          Date.now(),
        );
        this.container._ejsa!.q.push(eventInfo);
      },
    };
  }

  /**
   * Installs a list of event types for documentElement.
   */
  addEvents(types: string[]) {
    for (let idx = 0; idx < types.length; idx++) {
      const eventType = types[idx];
      this.container._ejsa!.et.push(eventType);
      this.documentElement.addEventListener(eventType, this.container._ejsa!.h);
    }
  }
}
