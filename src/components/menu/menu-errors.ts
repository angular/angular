import {MdError} from '@angular2-material/core/errors/error';

/**
 * Exception thrown when menu trigger doesn't have a valid md-menu instance
 */
export class MdMenuMissingError extends MdError {
  constructor() {
    super(`md-menu-trigger: must pass in an md-menu instance.

    Example:
      <md-menu #menu="mdMenu"></md-menu>
      <button [md-menu-trigger-for]="menu"></button>
    `);
  }
}
