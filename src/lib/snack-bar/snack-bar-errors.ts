import {MdError} from '../core';

/**
 * Error that is thrown when attempting to attach a snack bar that is already attached.
 * @docs-private
 */
export class MdSnackBarContentAlreadyAttached extends MdError {
  constructor() {
    super('Attempting to attach snack bar content after content is already attached');
  }
}
