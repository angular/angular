/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 *
 * Information about a registered event handler, which can be used to
 * deregister the event handler.
 */
export interface EventHandlerInfo {
  eventType: string;

  handler: (event: Event) => void;

  capture: boolean;

  passive?: boolean;
}
