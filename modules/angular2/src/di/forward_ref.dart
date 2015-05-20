library angular2.di.forward_ref;

typedef dynamic ForwardRefFn();

/**
 * Dart does not have the forward ref problem, so this function is a noop.
 */
forwardRef(ForwardRefFn forwardRefFn) => forwardRefFn();

/**
 * Lazily retrieve the reference value.
 *
 * See: {@link forwardRef}
 *
 * @exportedAs angular2/di
 */
resolveForwardRef(type) => type;
