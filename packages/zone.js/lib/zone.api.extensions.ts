/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Additional `EventTarget` methods added by `Zone.js`.
 *
 * 1. removeAllListeners, remove all event listeners of the given event name.
 * 2. eventListeners, get all event listeners of the given event name.
 */
interface EventTarget {
  /**
   *
   * Remove all event listeners by name for this event target.
   *
   * This method is optional because it may not be available if you use `noop zone` when
   * bootstrapping Angular application or disable the `EventTarget` monkey patch by `zone.js`.
   *
   * If the `eventName` is provided, will remove event listeners of that name.
   * If the `eventName` is not provided, will remove all event listeners associated with
   * `EventTarget`.
   *
   * @param eventName the name of the event, such as `click`. This parameter is optional.
   */
  removeAllListeners?(eventName?: string): void;
  /**
   *
   * Retrieve all event listeners by name.
   *
   * This method is optional because it may not be available if you use `noop zone` when
   * bootstrapping Angular application or disable the `EventTarget` monkey patch by `zone.js`.
   *
   * If the `eventName` is provided, will return an array of event handlers or event listener
   * objects of the given event.
   * If the `eventName` is not provided, will return all listeners.
   *
   * @param eventName the name of the event, such as click. This parameter is optional.
   */
  eventListeners?(eventName?: string): EventListenerOrEventListenerObject[];
}
