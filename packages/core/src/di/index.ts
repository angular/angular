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

export * from './metadata';
export {assertInInjectionContext, runInInjectionContext} from './contextual';
export {InjectFlags} from './interface/injector';
export {
  ɵɵdefineInjectable,
  defineInjectable,
  ɵɵdefineInjector,
  InjectableType,
  InjectorType,
} from './interface/defs';
export {forwardRef, resolveForwardRef, ForwardRefFn} from './forward_ref';
export {Injectable, InjectableDecorator, InjectableProvider} from './injectable';
export {Injector} from './injector';
export {EnvironmentInjector} from './r3_injector';
export {
  importProvidersFrom,
  ImportProvidersSource,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from './provider_collection';
export {ENVIRONMENT_INITIALIZER} from './initializer_token';
export {ProviderToken} from './provider_token';
export {ɵɵinject, inject, ɵɵinvalidFactoryDep} from './injector_compatibility';
export {InjectOptions} from './interface/injector';
export {INJECTOR} from './injector_token';
export {
  ClassProvider,
  ModuleWithProviders,
  ClassSansProvider,
  ImportedNgModuleProviders,
  ConstructorProvider,
  EnvironmentProviders,
  ConstructorSansProvider,
  ExistingProvider,
  ExistingSansProvider,
  FactoryProvider,
  FactorySansProvider,
  Provider,
  StaticClassProvider,
  StaticClassSansProvider,
  StaticProvider,
  TypeProvider,
  ValueProvider,
  ValueSansProvider,
} from './interface/provider';
export {InjectionToken} from './injection_token';
export {HostAttributeToken} from './host_attribute_token';
export {HOST_TAG_NAME} from './host_tag_name_token';
export {R3Injector as ɵR3Injector} from './r3_injector';
