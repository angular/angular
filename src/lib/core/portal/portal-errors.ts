/**
 * Throws an exception when attempting to attach a null portal to a host.
 * @docs-private
 */
export function throwNullPortalError() {
  throw new Error('Must provide a portal to attach');
}

/**
 * Throws an exception when attempting to attach a portal to a host that is already attached.
 * @docs-private
 */
export function throwPortalAlreadyAttachedError() {
  throw new Error('Host already has a portal attached');
}

/**
 * Throws an exception when attempting to attach a portal to an already-disposed host.
 * @docs-private
 */
export function throwPortalHostAlreadyDisposedError() {
  throw new Error('This PortalHost has already been disposed');
}

/**
 * Throws an exception when attempting to attach an unknown portal type.
 * @docs-private
 */
export function throwUnknownPortalTypeError() {
  throw new Error('Attempting to attach an unknown Portal type. BasePortalHost accepts either' +
                  'a ComponentPortal or a TemplatePortal.');
}

/**
 * Throws an exception when attempting to attach a portal to a null host.
 * @docs-private
 */
export function throwNullPortalHostError() {
  throw new Error('Attempting to attach a portal to a null PortalHost');
}

/**
 * Throws an exception when attempting to detach a portal that is not attached.
 * @docs-privatew
 */
export function throwNoPortalAttachedError() {
  throw new Error('Attempting to detach a portal that is not attached to a host');
}
