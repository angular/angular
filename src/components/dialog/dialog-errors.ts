import {MdError} from '@angular2-material/core/errors/error';

/** Exception thrown when a ComponentPortal is attached to a DomPortalHost without an origin. */
export class MdDialogContentAlreadyAttachedError extends MdError {
  constructor() {
      super('Attempting to attach dialog content after content is already attached');
  }
}
