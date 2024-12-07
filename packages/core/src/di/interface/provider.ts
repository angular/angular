/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '../../interface/type';

/**
 * Configures the `Injector` to return a value for a token.
 * Base for `ValueProvider` decorator.
 *
 * @publicApi
 */
export interface ValueSansProvider {
  /**
   * The value to inject.
   */
  useValue: any;
}

/**
 * Configures the `Injector` to return a value for a token.
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example core/di/ts/provider_spec.ts region='ValueProvider'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
export interface ValueProvider extends ValueSansProvider {
  /**
   * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
   */
  provide: any;

  /**
   * When true, injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * Configures the `Injector` to return an instance of `useClass` for a token.
 * Base for `StaticClassProvider` decorator.
 *
 * @publicApi
 */
export interface StaticClassSansProvider {
  /**
   * An optional class to instantiate for the `token`. By default, the `provide`
   * class is instantiated.
   */
  useClass: Type<any>;

  /**
   * A list of `token`s to be resolved by the injector. The list of values is then
   * used as arguments to the `useClass` constructor.
   */
  deps: any[];
}

/**
 * Configures the `Injector` to return an instance of `useClass` for a token.
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='StaticClassProvider'}
 *
 * Note that following two providers are not equal:
 *
 * {@example core/di/ts/provider_spec.ts region='StaticClassProviderDifference'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
export interface StaticClassProvider extends StaticClassSansProvider {
  /**
   * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
   */
  provide: any;

  /**
   * When true, injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * Configures the `Injector` to return an instance of a token.
 *
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @usageNotes
 *
 * ```ts
 * @Injectable(SomeModule, {deps: []})
 * class MyService {}
 * ```
 *
 * @publicApi
 */
export interface ConstructorSansProvider {
  /**
   * A list of `token`s to be resolved by the injector.
   */
  deps?: any[];
}

/**
 * Configures the `Injector` to return an instance of a token.
 *
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='ConstructorProvider'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
export interface ConstructorProvider extends ConstructorSansProvider {
  /**
   * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
   */
  provide: Type<any>;

  /**
   * When true, injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * Configures the `Injector` to return a value of another `useExisting` token.
 *
 * @see {@link ExistingProvider}
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @publicApi
 */
export interface ExistingSansProvider {
  /**
   * Existing `token` to return. (Equivalent to `injector.get(useExisting)`)
   */
  useExisting: any;
}

/**
 * Configures the `Injector` to return a value of another `useExisting` token.
 *
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='ExistingProvider'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
export interface ExistingProvider extends ExistingSansProvider {
  /**
   * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
   */
  provide: any;

  /**
   * When true, injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * Configures the `Injector` to return a value by invoking a `useFactory` function.
 *
 * @see {@link FactoryProvider}
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @publicApi
 */
export interface FactorySansProvider {
  /**
   * A function to invoke to create a value for this `token`. The function is invoked with
   * resolved values of `token`s in the `deps` field.
   */
  useFactory: Function;

  /**
   * A list of `token`s to be resolved by the injector. The list of values is then
   * used as arguments to the `useFactory` function.
   */
  deps?: any[];
}

/**
 * Configures the `Injector` to return a value by invoking a `useFactory` function.
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='FactoryProvider'}
 *
 * Dependencies can also be marked as optional:
 *
 * {@example core/di/ts/provider_spec.ts region='FactoryProviderOptionalDeps'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
export interface FactoryProvider extends FactorySansProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
   */
  provide: any;

  /**
   * When true, injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * Describes how an `Injector` should be configured as static (that is, without reflection).
 * A static provider provides tokens to an injector for various types of dependencies.
 *
 * @see {@link Injector.create()}
 * @see [Dependency Injection Guide](guide/di/dependency-injection-providers).
 *
 * @publicApi
 */
export type StaticProvider =
  | ValueProvider
  | ExistingProvider
  | StaticClassProvider
  | ConstructorProvider
  | FactoryProvider
  | any[];

/**
 * Configures the `Injector` to return an instance of `Type` when `Type' is used as the token.
 *
 * Create an instance by invoking the `new` operator and supplying additional arguments.
 * This form is a short form of `TypeProvider`;
 *
 * For more details, see the ["Dependency Injection Guide"](guide/di/dependency-injection.
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='TypeProvider'}
 *
 * @publicApi
 */
export interface TypeProvider extends Type<any> {}

/**
 * Configures the `Injector` to return a value by invoking a `useClass` function.
 * Base for `ClassProvider` decorator.
 *
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @publicApi
 */
export interface ClassSansProvider {
  /**
   * Class to instantiate for the `token`.
   */
  useClass: Type<any>;
}

/**
 * Configures the `Injector` to return an instance of `useClass` for a token.
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='ClassProvider'}
 *
 * Note that following two providers are not equal:
 *
 * {@example core/di/ts/provider_spec.ts region='ClassProviderDifference'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
export interface ClassProvider extends ClassSansProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
   */
  provide: any;

  /**
   * When true, injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * Describes how the `Injector` should be configured.
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @see {@link StaticProvider}
 *
 * @publicApi
 */
export type Provider =
  | TypeProvider
  | ValueProvider
  | ClassProvider
  | ConstructorProvider
  | ExistingProvider
  | FactoryProvider
  | any[];

/**
 * Encapsulated `Provider`s that are only accepted during creation of an `EnvironmentInjector` (e.g.
 * in an `NgModule`).
 *
 * Using this wrapper type prevents providers which are only designed to work in
 * application/environment injectors from being accidentally included in
 * `@Component.providers` and ending up in a component injector.
 *
 * This wrapper type prevents access to the `Provider`s inside.
 *
 * @see {@link makeEnvironmentProviders}
 * @see {@link importProvidersFrom}
 *
 * @publicApi
 */
export type EnvironmentProviders = {
  ɵbrand: 'EnvironmentProviders';
};

export interface InternalEnvironmentProviders extends EnvironmentProviders {
  ɵproviders: (Provider | EnvironmentProviders)[];

  /**
   * If present, indicates that the `EnvironmentProviders` were derived from NgModule providers.
   *
   * This is used to produce clearer error messages.
   */
  ɵfromNgModule?: true;
}

export function isEnvironmentProviders(
  value: Provider | EnvironmentProviders | InternalEnvironmentProviders,
): value is InternalEnvironmentProviders {
  return value && !!(value as InternalEnvironmentProviders).ɵproviders;
}

/**
 * Describes a function that is used to process provider lists (such as provider
 * overrides).
 */
export type ProcessProvidersFunction = (providers: Provider[]) => Provider[];

/**
 * A wrapper around an NgModule that associates it with providers
 * Usage without a generic type is deprecated.
 *
 * @publicApi
 */
export interface ModuleWithProviders<T> {
  ngModule: Type<T>;
  providers?: Array<Provider | EnvironmentProviders>;
}

/**
 * Providers that were imported from NgModules via the `importProvidersFrom` function.
 *
 * These providers are meant for use in an application injector (or other environment injectors) and
 * should not be used in component injectors.
 *
 * This type cannot be directly implemented. It's returned from the `importProvidersFrom` function
 * and serves to prevent the extracted NgModule providers from being used in the wrong contexts.
 *
 * @see {@link importProvidersFrom}
 *
 * @publicApi
 * @deprecated replaced by `EnvironmentProviders`
 */
export type ImportedNgModuleProviders = EnvironmentProviders;
