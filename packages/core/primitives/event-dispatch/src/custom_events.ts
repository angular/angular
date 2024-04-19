/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventType} from './/event_type';

// We use '_type' for the event contract, which lives in a separate
// compilation unit.
declare interface UnrenamedCustomEventDetail {
  _type: string;
}

/** The detail interface provided for custom events. */
export interface CustomEventDetail<T> {
  type: string;
  data?: T;
  triggeringEvent?: Event;
}

/**
 * Create a custom event with the specified data.
 * @param type The type of the action, e.g., 'submit'.
 * @param data An optional data payload.
 * @param triggeringEvent The event that triggers this custom event. This can be
 *     accessed from the custom event's action flow like so:
 *     actionFlow.event().detail.triggeringEvent.
 * @return The new custom event.
 */
export function createCustomEvent<T>(type: string, data?: T, triggeringEvent?: Event): Event {
  let event: CustomEvent<CustomEventDetail<T> & UnrenamedCustomEventDetail>;
  const unrenamedDetail: UnrenamedCustomEventDetail = {
    '_type': type,
  };
  const renamedDetail: CustomEventDetail<T> = {
    type,
    data,
    triggeringEvent,
  };
  const detail = {...unrenamedDetail, ...renamedDetail};
  try {
    // We don't use the CustomEvent constructor directly since it isn't
    // supported in IE 9 or 10 and initCustomEvent below works just fine.
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(EventType.CUSTOM, true, false, detail);
  } catch (e) {
    // If custom events aren't supported, fall back to custom-named HTMLEvent.
    // Fallback used by Android Gingerbread, FF4-5.

    // Hack to emulate `CustomEvent`, `HTMLEvents` doesn't satisfy `CustomEvent`
    // type.
    // tslint:disable-next-line:no-any
    event = document.createEvent('HTMLEvents') as any;
    event.initEvent(EventType.CUSTOM, true, false);
    // Hack to emulate `CustomEvent`, `detail` is readonly on `CustomEvent`.
    // tslint:disable-next-line:no-any
    (event as any)['detail'] = detail;
  }

  return event;
}

/**
 * Fires a custom event with an optional payload. Only intended to be consumed
 * by jsaction itself. Supported in Firefox 6+, IE 9+, and all Chrome versions.
 *
 * @param target The target element.
 * @param type The type of the action, e.g., 'submit'.
 * @param data An optional data payload.
 * @param triggeringEvent An optional data for the Event triggered this custom
 *     event.
 */
export function fireCustomEvent<T>(
  target: Element,
  type: string,
  data?: T,
  triggeringEvent?: Event,
) {
  const event = createCustomEvent(type, data, triggeringEvent);
  target.dispatchEvent(event);
}
