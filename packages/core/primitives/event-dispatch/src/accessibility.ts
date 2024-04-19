/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Defines special EventInfo and Event properties used when
 * A11Y_SUPPORT_IN_DISPATCHER is enabled.
 */
export enum Attribute {
  /**
   * An event-type set when the event contract detects a KEYDOWN event but
   * doesn't know if the key press can be treated like a click. The dispatcher
   * will use this event-type to parse the keypress and handle it accordingly.
   */
  MAYBE_CLICK_EVENT_TYPE = 'maybe_click',

  /**
   * A property added to a dispatched event that had the MAYBE_CLICK_EVENTTYPE
   * event-type but could not be used as a click. The dispatcher sets this
   * property for non-global dispatches before it retriggers the event and it
   * signifies that the event contract should not dispatch this event globally.
   */
  SKIP_GLOBAL_DISPATCH = 'a11ysgd',

  /**
   * A property added to a dispatched event that had the MAYBE_CLICK_EVENTTYPE
   * event-type but could not be used as a click. The dispatcher sets this
   * property before it retriggers the event and it signifies that the event
   * contract should not look at CLICK actions for KEYDOWN events.
   */
  SKIP_A11Y_CHECK = 'a11ysc',
}

declare global {
  interface Event {
    [Attribute.MAYBE_CLICK_EVENT_TYPE]?: boolean;
    [Attribute.SKIP_GLOBAL_DISPATCH]?: boolean;
    [Attribute.SKIP_A11Y_CHECK]?: boolean;
  }
}
