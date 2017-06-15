/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Throws an exception for the case when menu trigger doesn't have a valid md-menu instance
 * @docs-private
 */
export function throwMdMenuMissingError() {
  throw Error(`md-menu-trigger: must pass in an md-menu instance.

    Example:
      <md-menu #menu="mdMenu"></md-menu>
      <button [mdMenuTriggerFor]="menu"></button>`);
}

/**
 * Throws an exception for the case when menu's x-position value isn't valid.
 * In other words, it doesn't match 'before' or 'after'.
 * @docs-private
 */
export function throwMdMenuInvalidPositionX() {
  throw Error(`x-position value must be either 'before' or after'.
      Example: <md-menu x-position="before" #menu="mdMenu"></md-menu>`);
}

/**
 * Throws an exception for the case when menu's y-position value isn't valid.
 * In other words, it doesn't match 'above' or 'below'.
 * @docs-private
 */
export function throwMdMenuInvalidPositionY() {
  throw Error(`y-position value must be either 'above' or below'.
      Example: <md-menu y-position="above" #menu="mdMenu"></md-menu>`);
}
