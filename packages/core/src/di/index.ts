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

export * from './metadata.js';
export {InjectFlags} from './interface/injector.js';
export {ɵɵdefineInjectable, defineInjectable, ɵɵdefineInjector, InjectableType, InjectorType} from './interface/defs.js';
export {forwardRef, resolveForwardRef, ForwardRefFn} from './forward_ref.js';
export {Injectable, InjectableDecorator, InjectableProvider} from './injectable.js';
export {Injector} from './injector.js';
export {EnvironmentInjector} from './r3_injector.js';
export {importProvidersFrom} from './provider_collection.js';
export {INJECTOR_INITIALIZER} from './initializer_token.js';
export {ProviderToken} from './provider_token.js';
export {ɵɵinject, inject, ɵɵinvalidFactoryDep} from './injector_compatibility.js';
export {INJECTOR} from './injector_token.js';
export {ReflectiveInjector} from './reflective_injector.js';
export {ClassProvider, ClassSansProvider, ConstructorProvider, ConstructorSansProvider, ExistingProvider, ExistingSansProvider, FactoryProvider, FactorySansProvider, Provider, StaticClassProvider, StaticClassSansProvider, StaticProvider, TypeProvider, ValueProvider, ValueSansProvider} from './interface/provider.js';
export {ResolvedReflectiveFactory, ResolvedReflectiveProvider} from './reflective_provider.js';
export {ReflectiveKey} from './reflective_key.js';
export {InjectionToken} from './injection_token.js';
