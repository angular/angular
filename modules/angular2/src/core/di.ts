/**
 * @module
 * @description
 * The `di` module provides dependency injection container services.
 */

export {
  InjectMetadata,
  OptionalMetadata,
  InjectableMetadata,
  SelfMetadata,
  HostMetadata,
  SkipSelfMetadata,
  DependencyMetadata
} from './di/metadata';

// we have to reexport * because Dart and TS export two different sets of types
export * from './di/decorators';

export {forwardRef, resolveForwardRef, ForwardRefFn} from './di/forward_ref';
export {Injector} from './di/injector';
export {
  Binding,
  BindingBuilder,
  ResolvedBinding,
  ResolvedFactory,
  Dependency,
  bind
} from './di/binding';
export {Key, TypeLiteral} from './di/key';
export {
  NoBindingError,
  AbstractBindingError,
  CyclicDependencyError,
  InstantiationError,
  InvalidBindingError,
  NoAnnotationError,
  OutOfBoundsError
} from './di/exceptions';
export {OpaqueToken} from './di/opaque_token';
