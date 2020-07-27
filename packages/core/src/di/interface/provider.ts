/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
 * Configures the `Injector` to return a literal value for a token.
 *
 * The following creates an `Injector` instance that provides a string value.
 *
 * {@example core/di/ts/provider_spec.ts region='ValueProvider'}
 *
 * The following creates an `Injector` instance that provides multiple literal string values.
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 *
 * @publicApi
 */
export interface ValueProvider extends ValueSansProvider {
  /**
   * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
   */
  provide: any;

  /**
   * When true, the `Injector` returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * Configures the `Injector` to return an instance of a given class for a token.
 * Base for `StaticClassProvider` decorator.
 *
 * @publicApi
 */
export interface StaticClassSansProvider {
  /**
   * An optional class to instantiate for the token. By default, the `provide`
   * class is instantiated.
   */
  useClass: Type<any>;

  /**
   * A list of tokens to be resolved by the injector. The listed values
   * are passed as arguments to the `useClass` constructor.
   */
  deps: any[];
}

/**
 * Configures the `Injector` to return an instance of a given class for a token.
 *
 * The following creates an `Injector` instance that provides the "Square" class.
 *
 * {@example core/di/ts/provider_spec.ts region='StaticClassProvider'}
 *
 * Note that following two providers are not equal:
 *
 * {@example core/di/ts/provider_spec.ts region='StaticClassProviderDifference'}
 *
 * The following creates an `Injector` instance that provides multiple literal string values.
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 * @publicApi
 */
export interface StaticClassProvider extends StaticClassSansProvider {
  /**
   * An injection token, typically an instance of `Type` or `InjectionToken`.
   */
  provide: any;

  /**
   * When true, the `Injector` returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * Configures the `Injector` to return an instance of a token.
 *
 * The following configures a service to be provided by the injector for the NgModule "SomeModule".
 *
 * ```ts
 * @Injectable(SomeModule, {deps: []})
 * class MyService {}
 * ```
 *
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
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
 * The following creates an `Injector` instance that provides the "Square" class.
 *
 * {@example core/di/ts/provider_spec.ts region='ConstructorProvider'}
 *
 * The following creates an `Injector` instance that provides multiple literal string values.
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 *
 * @publicApi
 */
export interface ConstructorProvider extends ConstructorSansProvider {
  /**
   * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
   */
  provide: Type<any>;

  /**
   * When true, the `Injector` returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * Configures the `Injector` to return the value of another existing token.
 *
 * @see `ExistingProvider`
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 *
 * @publicApi
 */
export interface ExistingSansProvider {
  /**
   * Existing token to return. Equivalent to `injector.get(useExisting)`.
   */
  useExisting: any;
}

/**
 * Configures the `Injector` to return a value of an existing token.
 *
 * The following creates an `Injector` instance that provides a child class
 * by using the existing token for its parent class.
 *
 * {@example core/di/ts/provider_spec.ts region='ExistingProvider'}
 *
 * The following creates an `Injector` instance that provides multiple literal string values.
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 *
 * @publicApi
 */
export interface ExistingProvider extends ExistingSansProvider {
  /**
   * An injection token, typically an instance of `Type` or `InjectionToken`.
   */
  provide: any;

  /**
   * When true, the `Injector` returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * Configures the `Injector` to return a value by invoking a `useFactory` function.
 *
 * @see `FactoryProvider`
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 *
 * @publicApi
 */
export interface FactorySansProvider {
  /**
   * A function to invoke to create a value for this token. The function is invoked with
   * resolved values of dependency tokens provided in the `deps` field.
   */
  useFactory: Function;

  /**
   * A set of dependency tokens to be resolved by the injector. The listed values are
   * passed as arguments to the `useFactory()` function.
   */
  deps?: any[];
}

/**
 * Configures the `Injector` to return a value by invoking a `useFactory()` function.
 *
 * The following creates an `Injector` instance that provides a value using a factory function.
 *
 * {@example core/di/ts/provider_spec.ts region='FactoryProvider'}
 *
 * The following shows how dependencies can be marked as optional.
 *
 * {@example core/di/ts/provider_spec.ts region='FactoryProviderOptionalDeps'}
 *
 * The following creates an `Injector` instance that provides multiple literal string values.
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 *
 * @publicApi
 */
export interface FactoryProvider extends FactorySansProvider {
  /**
   * An injection token, typically an instance of `Type` or `InjectionToken`.
   */
  provide: any;

  /**
   * When true, the `Injector` returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * Describes how an `Injector` should be configured as static (that is, without reflection).
 * A static provider provides tokens to an injector for various types of dependencies.
 *
 * @see [Injector.create()](/api/core/Injector#create).
 * @see ["Dependency Injection Guide"](guide/dependency-injection-providers).
 *
 * @publicApi
 */
export type StaticProvider =
    ValueProvider|ExistingProvider|StaticClassProvider|ConstructorProvider|FactoryProvider|any[];


/**
 * Configures the `Injector` to return an instance of a given type when that type is used as the token.
 *
 * Create an instance by invoking the `new` operator and supplying additional arguments.
 * The following shows how you can use a short form of `TypeProvider`.
 *
 * {@example core/di/ts/provider_spec.ts region='TypeProvider'}
 *
 * @see ["Dependency Injection Guide"](guide/dependency-injection)
 *
 * @publicApi
 */
export interface TypeProvider extends Type<any> {}

/**
 * Configures the `Injector` to return a value by invoking a `useClass` function.
 * Base for `ClassProvider` decorator.
 *
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
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
 *
 * The following creates an `Injector` instance that provides the "Square" class.
 *
 * {@example core/di/ts/provider_spec.ts region='ClassProvider'}
 *
 * Note that following two providers are not equal:
 *
 * {@example core/di/ts/provider_spec.ts region='ClassProviderDifference'}
 *
 * The following creates an `Injector` instance that provides multiple literal string values.
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 *
 * @publicApi
 */
export interface ClassProvider extends ClassSansProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
   */
  provide: any;

  /**
   * When true, the `Injector` returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * Describes how the `Injector` should be configured.
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 *
 * @see `StaticProvider`
 *
 * @publicApi
 */
export type Provider = TypeProvider|ValueProvider|ClassProvider|ConstructorProvider|
    ExistingProvider|FactoryProvider|any[];

/**
 * Describes a function that is used to process provider lists (such as provider
 * overrides).
 */
export type ProcessProvidersFunction = (providers: Provider[]) => Provider[];
