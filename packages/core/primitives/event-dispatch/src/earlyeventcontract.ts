/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createEventInfoFromParameters, EventInfo} from './event_info';

export declare interface EarlyJsactionDataContainer {
  _ejsa?: EarlyJsactionData;
}

/**
 * Defines the early jsaction data types.
 */
export declare interface EarlyJsactionData {
  /** List used to keep track of the early JSAction event types. */
  et: string[];

  /** List used to keep track of capture event types. */
  etc: string[];

  /** List used to keep track of the JSAction events if using earlyeventcontract. */
  q: EventInfo[];

  /** Early Jsaction handler. */
  h: (event: Event) => void;

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
    private readonly replaySink: EarlyJsactionDataContainer = window as EarlyJsactionDataContainer,
    private readonly container = window.document.documentElement,
  ) {
    replaySink._ejsa = {
      c: container,
      q: [],
      et: [],
      etc: [],
      h: (event: Event) => {
        const eventInfo = createEventInfoFromParameters(
          event.type,
          event,
          event.target as Element,
          container,
          Date.now(),
        );
        replaySink._ejsa!.q.push(eventInfo);
      },
    };
  }

  /**
   * Installs a list of event types for container .
   */
  addEvents(types: string[], capture?: boolean) {
    const replaySink = this.replaySink._ejsa!;
    for (let idx = 0; idx < types.length; idx++) {
      const eventType = types[idx];
      const eventTypes = capture ? replaySink.etc : replaySink.et;
      eventTypes.push(eventType);
      this.container.addEventListener(eventType, replaySink.h, capture);
    }
  }
}
