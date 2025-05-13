/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuntimeError, RuntimeErrorCode} from '../errors';
import {Type} from '../interface/type';
import {getComponentDef} from '../render3/def_getters';
import {getFactoryDef} from '../render3/definition_factory';
import {throwCyclicDependencyError, throwInvalidProviderError} from '../render3/errors_di';
import {stringifyForError} from '../render3/util/stringify_utils';
import {deepForEach} from '../util/array_utils';
import {EMPTY_ARRAY} from '../util/empty';
import {getClosureSafeProperty} from '../util/property';
import {stringify} from '../util/stringify';

import {resolveForwardRef} from './forward_ref';
import {ENVIRONMENT_INITIALIZER} from './initializer_token';
import {ɵɵinject as inject} from './injector_compatibility';
import {getInjectorDef, InjectorType, InjectorTypeWithProviders} from './interface/defs';
import {
  ClassProvider,
  ConstructorProvider,
  EnvironmentProviders,
  ExistingProvider,
  FactoryProvider,
  InternalEnvironmentProviders,
  isEnvironmentProviders,
  ModuleWithProviders,
  Provider,
  StaticClassProvider,
  TypeProvider,
  ValueProvider,
} from './interface/provider';
import {INJECTOR_DEF_TYPES} from './internal_tokens';

/**
 * Wrap an array of `Provider`s into `EnvironmentProviders`, preventing them from being accidentally
 * referenced in `@Component` in a component injector.
 *
 * @publicApi
 */
export function makeEnvironmentProviders(
  providers: (Provider | EnvironmentProviders)[],
): EnvironmentProviders {
  return {
    ɵproviders: providers,
  } as unknown as EnvironmentProviders;
}

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
export function provideEnvironmentInitializer(initializerFn: () => void): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: initializerFn,
    },
  ]);
}

/**
 * A source of providers for the `importProvidersFrom` function.
 *
 * @publicApi
 */
export type ImportProvidersSource =
  | Type<unknown>
  | ModuleWithProviders<unknown>
  | Array<ImportProvidersSource>;

type WalkProviderTreeVisitor = (
  provider: SingleProvider,
  container: Type<unknown> | InjectorType<unknown>,
) => void;

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
export function importProvidersFrom(...sources: ImportProvidersSource[]): EnvironmentProviders {
  return {
    ɵproviders: internalImportProvidersFrom(true, sources),
    ɵfromNgModule: true,
  } as InternalEnvironmentProviders;
}

export function internalImportProvidersFrom(
  checkForStandaloneCmp: boolean,
  ...sources: ImportProvidersSource[]
): Provider[] {
  const providersOut: SingleProvider[] = [];
  const dedup = new Set<Type<unknown>>(); // already seen types
  let injectorTypesWithProviders: InjectorTypeWithProviders<unknown>[] | undefined;

  const collectProviders: WalkProviderTreeVisitor = (provider) => {
    providersOut.push(provider);
  };

  deepForEach(sources, (source) => {
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && checkForStandaloneCmp) {
      const cmpDef = getComponentDef(source);
      if (cmpDef?.standalone) {
        throw new RuntimeError(
          RuntimeErrorCode.IMPORT_PROVIDERS_FROM_STANDALONE,
          `Importing providers supports NgModule or ModuleWithProviders but got a standalone component "${stringifyForError(
            source,
          )}"`,
        );
      }
    }

    // Narrow `source` to access the internal type analogue for `ModuleWithProviders`.
    const internalSource = source as Type<unknown> | InjectorTypeWithProviders<unknown>;
    if (walkProviderTree(internalSource, collectProviders, [], dedup)) {
      injectorTypesWithProviders ||= [];
      injectorTypesWithProviders.push(internalSource);
    }
  });
  // Collect all providers from `ModuleWithProviders` types.
  if (injectorTypesWithProviders !== undefined) {
    processInjectorTypesWithProviders(injectorTypesWithProviders, collectProviders);
  }

  return providersOut;
}

/**
 * Collects all providers from the list of `ModuleWithProviders` and appends them to the provided
 * array.
 */
function processInjectorTypesWithProviders(
  typesWithProviders: InjectorTypeWithProviders<unknown>[],
  visitor: WalkProviderTreeVisitor,
): void {
  for (let i = 0; i < typesWithProviders.length; i++) {
    const {ngModule, providers} = typesWithProviders[i];
    deepForEachProvider(
      providers! as Array<Provider | InternalEnvironmentProviders>,
      (provider) => {
        ngDevMode && validateProvider(provider, providers || EMPTY_ARRAY, ngModule);
        visitor(provider, ngModule);
      },
    );
  }
}

/**
 * Internal type for a single provider in a deep provider array.
 */
export type SingleProvider =
  | TypeProvider
  | ValueProvider
  | ClassProvider
  | ConstructorProvider
  | ExistingProvider
  | FactoryProvider
  | StaticClassProvider;

/**
 * The logic visits an `InjectorType`, an `InjectorTypeWithProviders`, or a standalone
 * `ComponentType`, and all of its transitive providers and collects providers.
 *
 * If an `InjectorTypeWithProviders` that declares providers besides the type is specified,
 * the function will return "true" to indicate that the providers of the type definition need
 * to be processed. This allows us to process providers of injector types after all imports of
 * an injector definition are processed. (following View Engine semantics: see FW-1349)
 */
export function walkProviderTree(
  container: Type<unknown> | InjectorTypeWithProviders<unknown>,
  visitor: WalkProviderTreeVisitor,
  parents: Type<unknown>[],
  dedup: Set<Type<unknown>>,
): container is InjectorTypeWithProviders<unknown> {
  container = resolveForwardRef(container);
  if (!container) return false;

  // The actual type which had the definition. Usually `container`, but may be an unwrapped type
  // from `InjectorTypeWithProviders`.
  let defType: Type<unknown> | null = null;

  let injDef = getInjectorDef(container);
  const cmpDef = !injDef && getComponentDef(container);
  if (!injDef && !cmpDef) {
    // `container` is not an injector type or a component type. It might be:
    //  * An `InjectorTypeWithProviders` that wraps an injector type.
    //  * A standalone directive or pipe that got pulled in from a standalone component's
    //    dependencies.
    // Try to unwrap it as an `InjectorTypeWithProviders` first.
    const ngModule: Type<unknown> | undefined = (container as InjectorTypeWithProviders<any>)
      .ngModule as Type<unknown> | undefined;
    injDef = getInjectorDef(ngModule);
    if (injDef) {
      defType = ngModule!;
    } else {
      // Not a component or injector type, so ignore it.
      return false;
    }
  } else if (cmpDef && !cmpDef.standalone) {
    return false;
  } else {
    defType = container as Type<unknown>;
  }

  // Check for circular dependencies.
  if (ngDevMode && parents.indexOf(defType) !== -1) {
    const defName = stringify(defType);
    const path = parents.map(stringify);
    throwCyclicDependencyError(defName, path);
  }

  // Check for multiple imports of the same module
  const isDuplicate = dedup.has(defType);

  if (cmpDef) {
    if (isDuplicate) {
      // This component definition has already been processed.
      return false;
    }
    dedup.add(defType);

    if (cmpDef.dependencies) {
      const deps =
        typeof cmpDef.dependencies === 'function' ? cmpDef.dependencies() : cmpDef.dependencies;
      for (const dep of deps) {
        walkProviderTree(dep, visitor, parents, dedup);
      }
    }
  } else if (injDef) {
    // First, include providers from any imports.
    if (injDef.imports != null && !isDuplicate) {
      // Before processing defType's imports, add it to the set of parents. This way, if it ends
      // up deeply importing itself, this can be detected.
      ngDevMode && parents.push(defType);
      // Add it to the set of dedups. This way we can detect multiple imports of the same module
      dedup.add(defType);

      let importTypesWithProviders: InjectorTypeWithProviders<any>[] | undefined;
      try {
        deepForEach(injDef.imports, (imported) => {
          if (walkProviderTree(imported, visitor, parents, dedup)) {
            importTypesWithProviders ||= [];
            // If the processed import is an injector type with providers, we store it in the
            // list of import types with providers, so that we can process those afterwards.
            importTypesWithProviders.push(imported);
          }
        });
      } finally {
        // Remove it from the parents set when finished.
        ngDevMode && parents.pop();
      }

      // Imports which are declared with providers (TypeWithProviders) need to be processed
      // after all imported modules are processed. This is similar to how View Engine
      // processes/merges module imports in the metadata resolver. See: FW-1349.
      if (importTypesWithProviders !== undefined) {
        processInjectorTypesWithProviders(importTypesWithProviders, visitor);
      }
    }

    if (!isDuplicate) {
      // Track the InjectorType and add a provider for it.
      // It's important that this is done after the def's imports.
      const factory = getFactoryDef(defType) || (() => new defType!());

      // Append extra providers to make more info available for consumers (to retrieve an injector
      // type), as well as internally (to calculate an injection scope correctly and eagerly
      // instantiate a `defType` when an injector is created).

      // Provider to create `defType` using its factory.
      visitor({provide: defType, useFactory: factory, deps: EMPTY_ARRAY}, defType);

      // Make this `defType` available to an internal logic that calculates injector scope.
      visitor({provide: INJECTOR_DEF_TYPES, useValue: defType, multi: true}, defType);

      // Provider to eagerly instantiate `defType` via `INJECTOR_INITIALIZER`.
      visitor(
        {provide: ENVIRONMENT_INITIALIZER, useValue: () => inject(defType!), multi: true},
        defType,
      );
    }

    // Next, include providers listed on the definition itself.
    const defProviders = injDef.providers as Array<SingleProvider | InternalEnvironmentProviders>;
    if (defProviders != null && !isDuplicate) {
      const injectorType = container as InjectorType<any>;
      deepForEachProvider(defProviders, (provider) => {
        ngDevMode && validateProvider(provider as SingleProvider, defProviders, injectorType);
        visitor(provider, injectorType);
      });
    }
  } else {
    // Should not happen, but just in case.
    return false;
  }

  return (
    defType !== container && (container as InjectorTypeWithProviders<any>).providers !== undefined
  );
}

function validateProvider(
  provider: SingleProvider,
  providers: Array<SingleProvider | InternalEnvironmentProviders>,
  containerType: Type<unknown>,
): void {
  if (
    isTypeProvider(provider) ||
    isValueProvider(provider) ||
    isFactoryProvider(provider) ||
    isExistingProvider(provider)
  ) {
    return;
  }

  // Here we expect the provider to be a `useClass` provider (by elimination).
  const classRef = resolveForwardRef(
    provider && ((provider as StaticClassProvider | ClassProvider).useClass || provider.provide),
  );
  if (!classRef) {
    throwInvalidProviderError(containerType, providers, provider);
  }
}

function deepForEachProvider(
  providers: Array<Provider | InternalEnvironmentProviders>,
  fn: (provider: SingleProvider) => void,
): void {
  for (let provider of providers) {
    if (isEnvironmentProviders(provider)) {
      provider = provider.ɵproviders;
    }
    if (Array.isArray(provider)) {
      deepForEachProvider(provider, fn);
    } else {
      fn(provider);
    }
  }
}

export const USE_VALUE: string = getClosureSafeProperty<ValueProvider>({
  provide: String,
  useValue: getClosureSafeProperty,
});

export function isValueProvider(value: SingleProvider): value is ValueProvider {
  return value !== null && typeof value == 'object' && USE_VALUE in value;
}

export function isExistingProvider(value: SingleProvider): value is ExistingProvider {
  return !!(value && (value as ExistingProvider).useExisting);
}

export function isFactoryProvider(value: SingleProvider): value is FactoryProvider {
  return !!(value && (value as FactoryProvider).useFactory);
}

export function isTypeProvider(value: SingleProvider): value is TypeProvider {
  return typeof value === 'function';
}

export function isClassProvider(value: SingleProvider): value is ClassProvider {
  return !!(value as StaticClassProvider | ClassProvider).useClass;
}
