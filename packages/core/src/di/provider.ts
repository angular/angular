/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../type';

/**
 * Configures the `Injector` to return a value for a token.
 *
 * For more details, see the [Dependency Injection Guide](guide/dependency-injection).
 *
 * @example
 * This example shows how to define a provider that matches this interface:
 *
 * <code-example path="core/di/ts/provider_spec.ts" region="ValueSansProvider"></code-example>
 *
 * @usageNotes
 *
 * ```
 * @Injectable(SomeModule, {useValue: 'someValue'})
 * class SomeClass {}
 * ```
 *
 * @experimental
 */
export interface ValueSansProvider {
  /**
   * The value to inject.
   */
  useValue: any;
}

/**
 * Configures the `Injector` to return a value for a token.
 *
 * For more details, see the [Dependency Injection Guide](guide/dependency-injection).
 *
 * @example
 * This example shows how to define a provider that matches this interface:
 *
 * <code-example path="core/di/ts/provider_spec.ts" region="ValueProvider"></code-example>
 *
 * @usageNotes
 *
 * ```
 * const provider: ValueProvider = {provide: 'someToken', useValue: 'someValue'};
 * ```
 */
export interface ValueProvider extends ValueSansProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
   */
  provide: any;

  /**
   * If true, then injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   *
   * @example
   * This example shows how to define a multiple valued provider:
   *
   * <code-example path="core/di/ts/provider_spec.ts" region="MultiProviderAspect"></code-example>
   */
  multi?: boolean;
}

/**
 * Configures the `Injector` to return an instance of `useClass` for a token.
 *
 * For more details, see the [Dependency Injection Guide](guide/dependency-injection).
 *
 * @example
 * This example shows how to define a provider that matches this interface:
 *
 * <code-example path="core/di/ts/provider_spec.ts" region="StaticClassSansProvider"></code-example>
 *
 * @usageNotes
 *
 * ```
 * @Injectable(SomeModule, {useClass: MyService, deps: []})
 * class MyService {}
 * ```
 *
 * @experimental
 */
export interface StaticClassSansProvider {
  /**
   * An optional class to instantiate for the `token`. (If not provided `provide` is assumed to be a
   * class to instantiate)
   */
  useClass: Type<any>;

  /**
   * A list of `token`s which need to be resolved by the injector. The list of values is then
   * used as arguments to the `useClass` constructor.
   */
  deps: any[];
}

/**
 * Configures the `Injector` to return an instance of `useClass` for a token.
 *
 * For more details, see the [Dependency Injection Guide](/guide/dependency-injection).
 *
 * @example
 * This example shows how to define a provider that matches this interface:
 *
 * <code-example path="core/di/ts/provider_spec.ts" region="StaticClassProvider"></code-example>
 *
 * @example
 * Note that following two providers are not equal:
 *
 * <code-example path="core/di/ts/provider_spec.ts" region="StaticClassProviderDifference"></code-example>
 *
 * @usageNotes
 *
 * ```
 * @Injectable()
 * class MyService {}
 *
 * const provider: ClassProvider = {provide: 'someToken', useClass: MyService, deps: []};
 * ```
 */
export interface StaticClassProvider extends StaticClassSansProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
   */
  provide: any;

  /**
   * If true, then injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   *
   * @example
   * This example shows how to define a multiple valued provider:
   *
   * <code-example path="core/di/ts/provider_spec.ts" region="MultiProviderAspect"></code-example>
   */
  multi?: boolean;
}

/**
 * @usageNotes
 * ```
 * @Injectable(SomeModule, {deps: []})
 * class MyService {}
 * ```
 *
 * @description
 * Configures the `Injector` to return an instance of a token.
 *
 * For more details, see the [Dependency Injection Guide](/guide/dependency-injection).
 *
 * @example
 * This example shows how to define a provider that matches this interface:
 *
 * <code-example path="core/di/ts/provider_spec.ts" region="ConstructorSansProvider"></code-example>
 *
 * @experimental
 */
export interface ConstructorSansProvider {
  /**
   * A list of `token`s which need to be resolved by the injector. The list of values is then
   * used as arguments to the `useClass` constructor.
   */
  deps?: any[];
}

/**
 * Configures the `Injector` to return an instance of a token.
 *
 * For more details, see the [Dependency Injection Guide](guide/dependency-injection).
 *
 * @example
 * This example shows how to define a provider that matches this interface:
 *
 * <code-example path="core/di/ts/provider_spec.ts" region="ConstructorProvider"></code-example>
 *
 * @usageNotes
 *
 * ```
 * @Injectable()
 * class MyService {}
 *
 * const provider: ClassProvider = {provide: MyClass, deps: []};
 * ```
 */
export interface ConstructorProvider extends ConstructorSansProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
   */
  provide: Type<any>;

  /**
   * If true, then injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   *
   * @example
   * This example shows how to define a multiple valued provider:
   *
   * <code-example path="core/di/ts/provider_spec.ts" region="MultiProviderAspect"></code-example>
   */
  multi?: boolean;
}

/**
 * Configures the `Injector` to return a value of another `useExisting` token.
 *
 * For more details, see the [Dependency Injection Guide](guide/dependency-injection).
 *
 * @example
 * This example shows how to define a provider that matches this interface:
 *
 * <code-example path="core/di/ts/provider_spec.ts" region="ExistingSansProvider"></code-example>
 *
 * @usageNotes
 *
 * ```
 * @Injectable(SomeModule, {useExisting: 'someOtherToken'})
 * class SomeClass {}
 * ```
 */
export interface ExistingSansProvider {
  /**
   * Existing `token` to return. (equivalent to `injector.get(useExisting)`)
   */
  useExisting: any;
}

/**
 * Configures the `Injector` to return a value of another `useExisting` token.
 *
 * For more details, see the [Dependency Injection Guide](guide/dependency-injection).
 *
 * @example
 * This example shows how to define a provider that matches this interface:
 *
 * <code-example path="core/di/ts/provider_spec.ts" region="ExistingProvider"></code-example>
 *
 * @usageNotes
 *
 * ```
 * const provider: ExistingProvider = {provide: 'someToken', useExisting: 'someOtherToken'};
 * ```
 */
export interface ExistingProvider extends ExistingSansProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
   */
  provide: any;

  /**
   * If true, then injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   *
   * @example
   * This example shows how to define a multiple valued provider:
   *
   * <code-example path="core/di/ts/provider_spec.ts" region="MultiProviderAspect"></code-example>
   */
  multi?: boolean;
}

/**
 * Configures the `Injector` to return a value by invoking a `useFactory` function.
 *
 * For more details, see the [Dependency Injection Guide](guide/dependency-injection).
 *
 * @example
 * This example shows how to define a provider that matches this interface:
 *
 * <code-example path="core/di/ts/provider_spec.ts" region="FactorySansProvider"></code-example>
 *
 * @usageNotes
 *
 * ```
 * function serviceFactory() { ... }
 *
 * @Injectable(SomeModule, {useFactory: serviceFactory, deps: []})
 * class SomeClass {}
 * ```
 *
 * @experimental
 */
export interface FactorySansProvider {
  /**
   * A function to invoke to create a value for this `token`. The function is invoked with
   * resolved values of `token`s in the `deps` field.
   */
  useFactory: Function;

  /**
   * A list of `token`s which need to be resolved by the injector. The list of values is then
   * used as arguments to the `useFactory` function.
   */
  deps?: any[];
}

/**
 * Configures the `Injector` to return a value by invoking a `useFactory` function.
 *
 * For more details, see the [Dependency Injection Guide](guide/dependency-injection).
 *
 * @example
 * This example shows how to define a provider that matches this interface:
 *
 * <code-example path="core/di/ts/provider_spec.ts" region="FactoryProvider"></code-example>
 *
 *
 * @example
 * Dependencies can also be marked as optional:
 *
 * <code-example path="core/di/ts/provider_spec.ts" region="FactoryProviderOptionalDeps"></code-example>
 *
 * @usageNotes
 *
 * ```
 * function serviceFactory() { ... }
 *
 * const provider: FactoryProvider = {provide: 'someToken', useFactory: serviceFactory, deps: []};
 * ```
 *
 */
export interface FactoryProvider extends FactorySansProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
   */
  provide: any;

  /**
   * If true, then injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   *
   * @example
   * This example shows how to define a multiple valued provider:
   *
   * <code-example path="core/di/ts/provider_spec.ts" region="MultiProviderAspect"></code-example>
   */
  multi?: boolean;
}

/**
 * Describes how the `Injector` should be configured in a static way (Without reflection).
 *
 * For more details, see the [Dependency Injection Guide](guide/dependency-injection).
 *
 * See `ValueProvider`, `ExistingProvider`, `FactoryProvider`.
 */
export type StaticProvider = ValueProvider | ExistingProvider | StaticClassProvider |
    ConstructorProvider | FactoryProvider | any[];


/**
 * Configures the `Injector` to return an instance of `Type` when `Type' is used as the token.
 *
 * Create an instance by invoking the `new` operator and supplying additional arguments.
 * This form is a short form of `TypeProvider`;
 *
 * For more details, see the [Dependency Injection Guide](guide/dependency-injection).
 *
 * @example
 * This example shows how to define a provider that matches this interface:
 *
 * <code-example path="core/di/ts/provider_spec.ts" region="TypeProvider"></code-example>
 *
 * @usageNotes
 *
 * ```
 * @Injectable()
 * class MyService {}
 *
 * const provider: TypeProvider = MyService;
 * ```
 */
export interface TypeProvider extends Type<any> {}

/**
 * Configures the `Injector` to return a value by invoking a `useClass` function.
 *
 * For more details, see the [Dependency Injection Guide](guide/dependency-injection).
 *
 * @example
 * This example shows how to define a provider that matches this interface:
 *
 * <code-example path="core/di/ts/provider_spec.ts" region="ClassSansProvider"></code-example>
 *
 * @usageNotes
 *
 * ```
 * class SomeClassImpl {}
 *
 * @Injectable(SomeModule, {useClass: SomeClassImpl})
 * class SomeClass {}
 * ```
 *
 * @experimental
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
 * For more details, see the [Dependency Injection Guide](guide/dependency-injection).
 *
 * @example
 * This example shows how to define a provider that matches this interface:
 *
 * <code-example path="core/di/ts/provider_spec.ts" region="ClassProvider"></code-example>
 *
 *
 * @example
 * Note that following two providers are not equal:
 * This example shows how to define a provider that matches this interface:
 *
 * <code-example path="core/di/ts/provider_spec.ts" region="ClassProviderDifference"></code-example>
 *
 * @usageNotes
 *
 * ```
 * @Injectable()
 * class MyService {}
 *
 * const provider: ClassProvider = {provide: 'someToken', useClass: MyService};
 * ```
 */
export interface ClassProvider extends ClassSansProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
   */
  provide: any;

  /**
   * If true, then injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   *
   * @example
   * This example shows how to define a provider that matches this interface:
   *
   * <code-example path="core/di/ts/provider_spec.ts" region="MultiProviderAspect"></code-example>
   */
  multi?: boolean;
}

/**
 * Describes how the `Injector` should be configured.
 *
 * For more details, see the [Dependency Injection Guide](guide/dependency-injection).
 *
 * See `TypeProvider`, `ClassProvider`, `StaticProvider`.
 */
export type Provider =
    TypeProvider | ValueProvider | ClassProvider | ExistingProvider | FactoryProvider | any[];
