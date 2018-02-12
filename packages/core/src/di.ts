/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * The `di` module provides dependency injection container services.
 */

export * from './di/metadata';
export {defineInjectable, Injectable, InjectableDecorator, InjectableProvider, InjectableType} from './di/injectable';

export {forwardRef, resolveForwardRef, ForwardRefFn} from './di/forward_ref';

export {InjectFlags, Injector} from './di/injector';
export {ReflectiveInjector} from './di/reflective_injector';
export {StaticProvider, ValueProvider, ExistingProvider, FactoryProvider, Provider, TypeProvider, ClassProvider} from './di/provider';
export {ResolvedReflectiveFactory, ResolvedReflectiveProvider} from './di/reflective_provider';
export {ReflectiveKey} from './di/reflective_key';
export {InjectionToken} from './di/injection_token';
export {APP_ROOT_SCOPE} from './di/scope';
