import {MdError} from '../errors/error';

/** Exception thrown when attempting to attach a null portal to a host. */
export class MdNullPortalError extends MdError {
  constructor() {
      super('Must provide a portal to attach');
  }
}

/** Exception thrown when attempting to attach a portal to a host that is already attached. */
export class MdPortalAlreadyAttachedError extends MdError {
  constructor() {
      super('Host already has a portal attached');
  }
}

/** Exception thrown when attempting to attach a portal to an already-disposed host. */
export class MdPortalHostAlreadyDisposedError extends MdError {
  constructor() {
      super('This PortalHost has already been disposed');
  }
}

/** Exception thrown when attempting to attach an unknown portal type. */
export class MdUnknownPortalTypeError extends MdError {
  constructor() {
      super(
        'Attempting to attach an unknown Portal type. ' +
        'BasePortalHost accepts either a ComponentPortal or a TemplatePortal.');
  }
}

/** Exception thrown when attempting to attach a portal to a null host. */
export class MdNullPortalHostError extends MdError {
  constructor() {
      super('Attempting to attach a portal to a null PortalHost');
  }
}

/** Exception thrown when attempting to detach a portal that is not attached. */
export class MdNoPortalAttachedError extends MdError {
  constructor() {
      super('Attempting to detach a portal that is not attached to a host');
  }
}
