/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * The `di` module provides dependency injection container services.
 */

export * from './metadata';
export {InjectFlags} from './interface/injector';
export {ɵɵdefineInjectable, defineInjectable, ɵɵdefineInjector, InjectableType, InjectorType} from './interface/defs';
export {forwardRef, resolveForwardRef, ForwardRefFn} from './forward_ref';
export {Injectable, InjectableDecorator, InjectableProvider} from './injectable';
export {Injector} from './injector';
export {ProviderToken} from './provider_token';
export {ɵɵinject, inject, ɵɵinvalidFactoryDep} from './injector_compatibility';
export {INJECTOR} from './injector_token';
export {ReflectiveInjector} from './reflective_injector';
export {ClassProvider, ClassSansProvider, ConstructorProvider, ConstructorSansProvider, ExistingProvider, ExistingSansProvider, FactoryProvider, FactorySansProvider, Provider, StaticClassProvider, StaticClassSansProvider, StaticProvider, TypeProvider, ValueProvider, ValueSansProvider} from './interface/provider';
export {ResolvedReflectiveFactory, ResolvedReflectiveProvider} from './reflective_provider';
export {ReflectiveKey} from './reflective_key';
export {InjectionToken} from './injection_token';
