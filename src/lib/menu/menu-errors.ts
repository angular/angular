import {MdError} from '../core';

/**
 * Exception thrown when menu trigger doesn't have a valid md-menu instance
 * @docs-private
 */
export class MdMenuMissingError extends MdError {
  constructor() {
    super(`md-menu-trigger: must pass in an md-menu instance.

    Example:
      <md-menu #menu="mdMenu"></md-menu>
      <button [mdMenuTriggerFor]="menu"></button>
    `);
  }
}

/**
 * Exception thrown when menu's x-position value isn't valid.
 * In other words, it doesn't match 'before' or 'after'.
 * @docs-private
 */
export class MdMenuInvalidPositionX extends MdError {
  constructor() {
    super(`x-position value must be either 'before' or after'.
      Example: <md-menu x-position="before" #menu="mdMenu"></md-menu>
    `);
  }
}

/**
 * Exception thrown when menu's y-position value isn't valid.
 * In other words, it doesn't match 'above' or 'below'.
 * @docs-private
 */
export class MdMenuInvalidPositionY extends MdError {
  constructor() {
    super(`y-position value must be either 'above' or below'.
      Example: <md-menu y-position="above" #menu="mdMenu"></md-menu>
    `);
  }
}
