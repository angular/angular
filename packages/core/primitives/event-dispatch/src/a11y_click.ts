/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as eventLib from './event';
import * as eventInfoLib from './event_info';
import {EventType} from './event_type';

/**
 * Update `EventInfo` to be `eventType = 'click'` and sets `a11yClickKey` if it
 * is a a11y click.
 */
export function updateEventInfoForA11yClick(eventInfo: eventInfoLib.EventInfo) {
  if (!eventLib.isActionKeyEvent(eventInfoLib.getEvent(eventInfo))) {
    return;
  }
  eventInfoLib.setA11yClickKey(eventInfo, true);
  // A 'click' triggered by a DOM keypress should be mapped to the 'click'
  // jsaction.
  eventInfoLib.setEventType(eventInfo, EventType.CLICK);
}

/**
 * Call `preventDefault` on an a11y click if it is space key or to prevent the
 * browser's default action for native HTML controls.
 */
export function preventDefaultForA11yClick(eventInfo: eventInfoLib.EventInfo) {
  if (
    !eventInfoLib.getA11yClickKey(eventInfo) ||
    (!eventLib.isSpaceKeyEvent(eventInfoLib.getEvent(eventInfo)) &&
      !eventLib.shouldCallPreventDefaultOnNativeHtmlControl(eventInfoLib.getEvent(eventInfo)))
  ) {
    return;
  }
  eventLib.preventDefault(eventInfoLib.getEvent(eventInfo));
}

/**
 * Sets the `action` to `clickonly` for a click event that is not an a11y click
 * and if there is not already a click action.
 */
export function populateClickOnlyAction(
  actionElement: Element,
  eventInfo: eventInfoLib.EventInfo,
  actionMap: {[key: string]: string | undefined},
) {
  if (
    // If there's already an action, don't attempt to set a CLICKONLY
    eventInfoLib.getAction(eventInfo) ||
    // Only attempt CLICKONLY if the type is CLICK
    eventInfoLib.getEventType(eventInfo) !== EventType.CLICK ||
    // a11y clicks are never CLICKONLY
    eventInfoLib.getA11yClickKey(eventInfo) ||
    actionMap[EventType.CLICKONLY] === undefined
  ) {
    return;
  }
  eventInfoLib.setEventType(eventInfo, EventType.CLICKONLY);
  eventInfoLib.setAction(eventInfo, actionMap[EventType.CLICKONLY]!, actionElement);
}
