/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @define Controls the use of event.path logic for the dom
 * walking in createEventInfo_.
 */
export const USE_EVENT_PATH = false;

/**
 * @define Support for jsnamespace attribute.  This flag can be overridden in a
 * build rule to trim down the EventContract's binary size.
 */
export const JSNAMESPACE_SUPPORT = true;

/**
 * @define Handles a11y click casting in the dispatcher rather than
 * the event contract. When enabled, it will enable
 * EventContract.A11Y_CLICK_SUPPORT as well as both are required for this
 * functionality.
 */
export const A11Y_SUPPORT_IN_DISPATCHER = false;

/**
 * @define Support for accessible click actions.  This flag can be overridden in
 * a build rule.
 */
const A11Y_CLICK_SUPPORT_FLAG_ENABLED = false;

/**
 * Enables a11y click casting when either A11Y_CLICK_SUPPORT_FLAG_ENABLED or
 * A11Y_SUPPORT_IN_DISPATCHER.
 */
export const A11Y_CLICK_SUPPORT = A11Y_CLICK_SUPPORT_FLAG_ENABLED || A11Y_SUPPORT_IN_DISPATCHER;

/**
 * @define Support for the non-bubbling mouseenter and mouseleave events.  This
 * flag can be overridden in a build rule.
 */
export const MOUSE_SPECIAL_SUPPORT = false;

/**
 * @define Call stopPropagation on handled events. When integrating with
 * non-jsaction event handler based code, you will likely want to turn this flag
 * off. While most event handlers will continue to work, jsaction binds focus
 * and blur events in the capture phase and thus with stopPropagation, none of
 * your non-jsaction-handlers will ever see it.
 */
export const STOP_PROPAGATION = true;

/**
 * @define Support for custom events, which are type EventType.CUSTOM. These are
 * native DOM events with an additional type field and an optional payload.
 */
export const CUSTOM_EVENT_SUPPORT = false;
