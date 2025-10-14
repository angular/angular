/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Type } from '../interface/type';
import { InjectorType, InjectorTypeWithProviders } from './interface/defs';
import { ClassProvider, ConstructorProvider, EnvironmentProviders, ExistingProvider, FactoryProvider, ModuleWithProviders, Provider, StaticClassProvider, TypeProvider, ValueProvider } from './interface/provider';
/**
 * Wrap an array of `Provider`s into `EnvironmentProviders`, preventing them from being accidentally
 * referenced in `@Component` in a component injector.
 *
 * @publicApi
 */
export declare function makeEnvironmentProviders(providers: (Provider | EnvironmentProviders)[]): EnvironmentProviders;
/**
 * @description
 * This function is used to provide initialization functions that will be executed upon construction
 * of an environment injector.
 *
 * Note that the provided initializer is run in the injection context.
 *
 * Previously, this was achieved using the `ENVIRONMENT_INITIALIZER` token which is now deprecated.
 *
 * @see {@link ENVIRONMENT_INITIALIZER}
 *
 * @usageNotes
 * The following example illustrates how to configure an initialization function using
 * `provideEnvironmentInitializer()`
 * ```ts
 * createEnvironmentInjector(
 *   [
 *     provideEnvironmentInitializer(() => {
 *       console.log('environment initialized');
 *     }),
 *   ],
 *   parentInjector
 * );
 * ```
 *
 * @publicApi
 */
export declare function provideEnvironmentInitializer(initializerFn: () => void): EnvironmentProviders;
/**
 * A source of providers for the `importProvidersFrom` function.
 *
 * @publicApi
 */
export type ImportProvidersSource = Type<unknown> | ModuleWithProviders<unknown> | Array<ImportProvidersSource>;
type WalkProviderTreeVisitor = (provider: SingleProvider, container: Type<unknown> | InjectorType<unknown>) => void;
/**
 * Collects providers from all NgModules and standalone components, including transitively imported
 * ones.
 *
 * Providers extracted via `importProvidersFrom` are only usable in an application injector or
 * another environment injector (such as a route injector). They should not be used in component
 * providers.
 *
 * More information about standalone components can be found in [this
 * guide](guide/components/importing).
 *
 * @usageNotes
 * The results of the `importProvidersFrom` call can be used in the `bootstrapApplication` call:
 *
 * ```ts
 * await bootstrapApplication(RootComponent, {
 *   providers: [
 *     importProvidersFrom(NgModuleOne, NgModuleTwo)
 *   ]
 * });
 * ```
 *
 * You can also use the `importProvidersFrom` results in the `providers` field of a route, when a
 * standalone component is used:
 *
 * ```ts
 * export const ROUTES: Route[] = [
 *   {
 *     path: 'foo',
 *     providers: [
 *       importProvidersFrom(NgModuleOne, NgModuleTwo)
 *     ],
 *     component: YourStandaloneComponent
 *   }
 * ];
 * ```
 *
 * @returns Collected providers from the specified list of types.
 * @publicApi
 */
export declare function importProvidersFrom(...sources: ImportProvidersSource[]): EnvironmentProviders;
export declare function internalImportProvidersFrom(checkForStandaloneCmp: boolean, ...sources: ImportProvidersSource[]): Provider[];
/**
 * Internal type for a single provider in a deep provider array.
 */
export type SingleProvider = TypeProvider | ValueProvider | ClassProvider | ConstructorProvider | ExistingProvider | FactoryProvider | StaticClassProvider;
/**
 * The logic visits an `InjectorType`, an `InjectorTypeWithProviders`, or a standalone
 * `ComponentType`, and all of its transitive providers and collects providers.
 *
 * If an `InjectorTypeWithProviders` that declares providers besides the type is specified,
 * the function will return "true" to indicate that the providers of the type definition need
 * to be processed. This allows us to process providers of injector types after all imports of
 * an injector definition are processed. (following View Engine semantics: see FW-1349)
 */
export declare function walkProviderTree(container: Type<unknown> | InjectorTypeWithProviders<unknown>, visitor: WalkProviderTreeVisitor, parents: Type<unknown>[], dedup: Set<Type<unknown>>): container is InjectorTypeWithProviders<unknown>;
export declare const USE_VALUE: string;
export declare function isValueProvider(value: SingleProvider): value is ValueProvider;
export declare function isExistingProvider(value: SingleProvider): value is ExistingProvider;
export declare function isFactoryProvider(value: SingleProvider): value is FactoryProvider;
export declare function isTypeProvider(value: SingleProvider): value is TypeProvider;
export declare function isClassProvider(value: SingleProvider): value is ClassProvider;
export {};
