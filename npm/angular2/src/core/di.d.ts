/**
 * @module
 * @description
 * The `di` module provides dependency injection container services.
 */
export { InjectMetadata, OptionalMetadata, InjectableMetadata, SelfMetadata, HostMetadata, SkipSelfMetadata, DependencyMetadata } from './di/metadata';
export * from './di/decorators';
export { forwardRef, resolveForwardRef, ForwardRefFn } from './di/forward_ref';
export { Injector } from './di/injector';
export { ReflectiveInjector } from './di/reflective_injector';
export { Binding, ProviderBuilder, bind, Provider, provide } from './di/provider';
export { ResolvedReflectiveBinding, ResolvedReflectiveFactory, ReflectiveDependency, ResolvedReflectiveProvider } from './di/reflective_provider';
export { ReflectiveKey } from './di/reflective_key';
export { NoProviderError, AbstractProviderError, CyclicDependencyError, InstantiationError, InvalidProviderError, NoAnnotationError, OutOfBoundsError } from './di/reflective_exceptions';
export { OpaqueToken } from './di/opaque_token';
