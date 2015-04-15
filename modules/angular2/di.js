/**
 * @module
 * @public
 * @description
 * This is a description
 */

export {Inject, InjectPromise, InjectLazy, Injectable, Optional, DependencyAnnotation} from './src/di/annotations';
export {Injector} from './src/di/injector';
export {Binding, ResolvedBinding, Dependency, bind} from './src/di/binding';
export {Key, KeyRegistry} from './src/di/key';
export {KeyMetadataError, NoProviderError, ProviderError, AsyncBindingError, CyclicDependencyError,
  InstantiationError, InvalidBindingError, NoAnnotationError} from './src/di/exceptions';
export {OpaqueToken} from './src/di/opaque_token';
