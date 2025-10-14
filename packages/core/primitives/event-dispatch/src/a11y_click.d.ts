/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as eventInfoLib from './event_info';
/**
 * Update `EventInfo` to be `eventType = 'click'` and sets `a11yClickKey` if it
 * is a a11y click.
 */
export declare function updateEventInfoForA11yClick(eventInfo: eventInfoLib.EventInfo): void;
/**
 * Call `preventDefault` on an a11y click if it is space key or to prevent the
 * browser's default action for native HTML controls.
 */
export declare function preventDefaultForA11yClick(eventInfo: eventInfoLib.EventInfo): void;
/**
 * Sets the `action` to `clickonly` for a click event that is not an a11y click
 * and if there is not already a click action.
 */
export declare function populateClickOnlyAction(actionElement: Element, eventInfo: eventInfoLib.EventInfo, actionMap: {
    [key: string]: string | undefined;
}): void;
