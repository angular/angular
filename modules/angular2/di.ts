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
} from './src/core/di/metadata';

// we have to reexport * because Dart and TS export two different sets of types
export * from './src/core/di/decorators';

export {forwardRef, resolveForwardRef, ForwardRefFn} from './src/core/di/forward_ref';
export {
  Injector,
  ProtoInjector,
  BindingWithVisibility,
  DependencyProvider,
  Visibility,
  UNDEFINED
} from './src/core/di/injector';
export {Binding, BindingBuilder, ResolvedBinding, Dependency, bind} from './src/core/di/binding';
export {Key, KeyRegistry, TypeLiteral} from './src/core/di/key';
export {
  NoBindingError,
  AbstractBindingError,
  CyclicDependencyError,
  InstantiationError,
  InvalidBindingError,
  NoAnnotationError,
  OutOfBoundsError
} from './src/core/di/exceptions';
export {OpaqueToken} from './src/core/di/opaque_token';
