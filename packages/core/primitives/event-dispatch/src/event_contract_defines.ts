/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @define Support for accessible click actions.  This flag can be overridden in
 * a build rule.
 */
export const A11Y_CLICK_SUPPORT = false;

/**
 * @define Support for the non-bubbling mouseenter and mouseleave events.  This
 * flag can be overridden in a build rule.
 */
export const MOUSE_SPECIAL_SUPPORT = false;

/**
 * @define Support for custom events, which are type EventType.CUSTOM. These are
 * native DOM events with an additional type field and an optional payload.
 */
export const CUSTOM_EVENT_SUPPORT = false;
