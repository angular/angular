/**
 * @module
 * @public
 * @description
 * The `di` module provides dependency injection container services.
 */

export {
  InjectAnnotation,
  OptionalAnnotation,
  InjectableAnnotation,
  DependencyAnnotation,
  VisibilityAnnotation,
  SelfAnnotation,
  ParentAnnotation,
  AncestorAnnotation,
  UnboundedAnnotation
} from './src/di/annotations';

export {
  Inject,
  Optional,
  Injectable,
  Visibility,
  Self,
  Parent,
  Ancestor,
  Unbounded
} from './src/di/decorators';
export {self} from './src/di/annotations_impl';
export {forwardRef, resolveForwardRef, ForwardRefFn} from './src/di/forward_ref';
export {
  resolveBindings,
  Injector,
  ProtoInjector,
  PUBLIC_AND_PRIVATE,
  PUBLIC,
  PRIVATE,
  undefinedValue,
  InjectorInlineStrategy,
  InjectorDynamicStrategy
} from './src/di/injector';
export {Binding, BindingBuilder, ResolvedBinding, Dependency, bind} from './src/di/binding';
export {Key, KeyRegistry, TypeLiteral} from './src/di/key';
export {
  NoBindingError,
  AbstractBindingError,
  AsyncBindingError,
  CyclicDependencyError,
  InstantiationError,
  InvalidBindingError,
  NoAnnotationError,
  OutOfBoundsError
} from './src/di/exceptions';
export {OpaqueToken} from './src/di/opaque_token';
