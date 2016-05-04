/** Exception thrown when a ComponentPortal is attached to a DomPortalHost without an origin. */
export class MdComponentPortalAttachedToDomWithoutOriginError extends Error {
  constructor() {
      super(
          'A ComponentPortal must have an origin set when attached to a DomPortalHost ' +
          'because the DOM element is not part of the Angular application context.');
  }
}

/** Exception thrown when attmepting to attach a null portal to a host. */
export class MdNullPortalError extends Error {
  constructor() {
      super('Must provide a portal to attach');
  }
}

/** Exception thrown when attmepting to attach a portal to a host that is already attached. */
export class MdPortalAlreadyAttachedError extends Error {
  constructor() {
      super('Host already has a portal attached');
  }
}

/** Exception thrown when attmepting to attach a portal to an already-disposed host. */
export class MdPortalHostAlreadyDisposedError extends Error {
  constructor() {
      super('This PortalHost has already been disposed');
  }
}

/** Exception thrown when attmepting to attach an unknown portal type. */
export class MdUnknownPortalTypeErron extends Error {
  constructor() {
      super(
        'Attempting to attach an unknown Portal type. ' +
        'BasePortalHost accepts either a ComponentPortal or a TemplatePortal.');
  }
}

/** Exception thrown when attmepting to attach a portal to a null host. */
export class MdNullPortalHostError extends Error {
  constructor() {
      super('Attmepting to attach a portal to a null PortalHost');
  }
}

/** Exception thrown when attmepting to detach a portal that is not attached. */
export class MdNoPortalAttachedErron extends Error {
  constructor() {
      super('Attmepting to detach a portal that is not attached to a host');
  }
}
