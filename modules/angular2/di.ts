/**
 * @module
 * @public
 * @description
 * The `di` module provides dependency injection container services.
 */

export * from './src/di/annotations';
export * from './src/di/decorators';
export * from './src/di/forward_ref';
export {resolveBindings, Injector} from './src/di/injector';
export {Binding, ResolvedBinding, Dependency, bind} from './src/di/binding';
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

// HACK: workaround for Traceur behavior.
// It expects all transpiled modules to contain this marker.
// TODO: remove this when we no longer use traceur
export var __esModule = true;
