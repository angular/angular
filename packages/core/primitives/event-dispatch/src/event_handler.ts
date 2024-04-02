/**
 * @license
 * SPDX-License-Identifier: MIT
 */

/**
 * Information about a registered event handler, which can be used to
 * deregister the event handler.
 */
export interface EventHandlerInfo {
  eventType: string;

  handler: (event: Event) => void;

  capture: boolean;
}
