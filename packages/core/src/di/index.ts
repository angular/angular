/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @module
 * @description
 * The `di` module provides dependency injection container services.
 */

export {assertInInjectionContext, runInInjectionContext} from './contextual';
export {forwardRef, ForwardRefFn, resolveForwardRef} from './forward_ref';
export {HostAttributeToken} from './host_attribute_token';
export {HOST_TAG_NAME} from './host_tag_name_token';
export {ENVIRONMENT_INITIALIZER} from './initializer_token';
export {injectAsync, InjectAsyncOptions, onIdle, PrefetchTrigger} from './inject_async';
export {Injectable, InjectableDecorator, InjectableProvider} from './injectable';
export {InjectionToken} from './injection_token';
export {DestroyableInjector, Injector} from './injector';
export {inject, ɵɵinject, ɵɵinvalidFactoryDep} from './injector_compatibility';
export {INJECTOR} from './injector_token';
export {InjectableType, InjectorType, ɵɵdefineInjectable, ɵɵdefineInjector} from './interface/defs';
export {InjectOptions} from './interface/injector';
export {
  ClassProvider,
  ClassSansProvider,
  ConstructorProvider,
  ConstructorSansProvider,
  EnvironmentProviders,
  ExistingProvider,
  ExistingSansProvider,
  FactoryProvider,
  FactorySansProvider,
  ModuleWithProviders,
  Provider,
  StaticClassProvider,
  StaticClassSansProvider,
  StaticProvider,
  TypeProvider,
  ValueProvider,
  ValueSansProvider,
} from './interface/provider';
export {ɵɵdefineService} from './interface/service';
export * from './metadata';
export {
  importProvidersFrom,
  ImportProvidersSource,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from './provider_collection';
export {ProviderToken} from './provider_token';
export {EnvironmentInjector, R3Injector as ɵR3Injector} from './r3_injector';
export {Service, ServiceDecorator} from './service';
