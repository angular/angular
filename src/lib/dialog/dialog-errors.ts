import {MdError} from '../core';

/**
 * Exception thrown when a ComponentPortal is attached to a DomPortalHost without an origin.
 * @docs-private
 */
export class MdDialogContentAlreadyAttachedError extends MdError {
  constructor() {
      super('Attempting to attach dialog content after content is already attached');
  }
}
