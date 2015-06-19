/**
 * @module
 * @public
 * @description
 * The `di` module provides dependency injection container services.
 */

export {
  InjectAnnotation,
  InjectPromiseAnnotation,
  InjectLazyAnnotation,
  OptionalAnnotation,
  InjectableAnnotation,
  DependencyAnnotation
} from './src/di/annotations';

export {Inject, InjectPromise, InjectLazy, Optional, Injectable} from './src/di/decorators';
export {forwardRef, resolveForwardRef, ForwardRefFn} from './src/di/forward_ref';
export {resolveBindings, Injector} from './src/di/injector';
export {Binding, BindingBuilder, ResolvedBinding, Dependency, bind} from './src/di/binding';
export {Key, KeyRegistry, TypeLiteral} from './src/di/key';
export {
  NoBindingError,
  AbstractBindingError,
  AsyncBindingError,
  CyclicDependencyError,
  InstantiationError,
  InvalidBindingError,
  NoAnnotationError
} from './src/di/exceptions';
export {OpaqueToken} from './src/di/opaque_token';
