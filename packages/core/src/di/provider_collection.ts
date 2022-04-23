/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {getComponentDef} from '../render3/definition';
import {getFactoryDef} from '../render3/definition_factory';
import {throwCyclicDependencyError, throwInvalidProviderError} from '../render3/errors_di';
import {deepForEach} from '../util/array_utils';
import {getClosureSafeProperty} from '../util/property';
import {stringify} from '../util/stringify';
import {EMPTY_ARRAY} from '../view';

import {resolveForwardRef} from './forward_ref';
import {INJECTOR_INITIALIZER} from './initializer_token';
import {ɵɵinject as inject} from './injector_compatibility';
import {getInjectorDef, InjectorType, InjectorTypeWithProviders} from './interface/defs';
import {ClassProvider, ConstructorProvider, ExistingProvider, FactoryProvider, Provider, StaticClassProvider, TypeProvider, ValueProvider} from './interface/provider';
import {INJECTOR_DEF_TYPES} from './internal_tokens';

/**
 * Collects providers from all NgModules and standalone components, including transitively imported
 * ones.
 *
 * @returns The list of collected providers from the specified list of types.
 * @publicApi
 */
export function importProvidersFrom(...types: Array<Type<unknown>>): Provider[] {
  const providers: SingleProvider[] = [];
  deepForEach(types, type => walkProviderTree(type, providers, [], new Set()));
  return providers;
}

/**
 * Internal type for a single provider in a deep provider array.
 */
export type SingleProvider = TypeProvider|ValueProvider|ClassProvider|ConstructorProvider|
    ExistingProvider|FactoryProvider|StaticClassProvider;

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
    container: Type<unknown>|InjectorTypeWithProviders<unknown>, providersOut: SingleProvider[],
    parents: Type<unknown>[],
    dedup: Set<Type<unknown>>): container is InjectorTypeWithProviders<unknown> {
  container = resolveForwardRef(container);
  if (!container) return false;

  // The actual type which had the definition. Usually `container`, but may be an unwrapped type
  // from `InjectorTypeWithProviders`.
  let defType: Type<unknown>|null = null;

  let injDef = getInjectorDef(container);
  const cmpDef = !injDef && getComponentDef(container);
  if (!injDef && !cmpDef) {
    // `container` is not an injector type or a component type. It might be:
    //  * An `InjectorTypeWithProviders` that wraps an injector type.
    //  * A standalone directive or pipe that got pulled in from a standalone component's
    //    dependencies.
    // Try to unwrap it as an `InjectorTypeWithProviders` first.
    const ngModule: Type<unknown>|undefined =
        (container as InjectorTypeWithProviders<any>).ngModule as Type<unknown>| undefined;
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
        walkProviderTree(dep, providersOut, parents, dedup);
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

      let importTypesWithProviders: (InjectorTypeWithProviders<any>[])|undefined;
      try {
        deepForEach(injDef.imports, imported => {
          if (walkProviderTree(imported, providersOut, parents, dedup)) {
            if (importTypesWithProviders === undefined) importTypesWithProviders = [];
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
        for (let i = 0; i < importTypesWithProviders.length; i++) {
          const {ngModule, providers} = importTypesWithProviders[i];
          deepForEach(providers!, provider => {
            validateProvider(provider, providers || EMPTY_ARRAY, ngModule);
            providersOut.push(provider);
          });
        }
      }
    }
    // Track the InjectorType and add a provider for it.
    // It's important that this is done after the def's imports.
    const factory = getFactoryDef(defType) || (() => new defType!());

    // Provider to create `defType` using its factory.
    providersOut.push({
      provide: defType,
      useFactory: factory,
      deps: EMPTY_ARRAY,
    });

    providersOut.push({
      provide: INJECTOR_DEF_TYPES,
      useValue: defType,
      multi: true,
    });

    // Provider to eagerly instantiate `defType` via `INJECTOR_INITIALIZER`.
    providersOut.push({
      provide: INJECTOR_INITIALIZER,
      useValue: () => inject(defType!),
      multi: true,
    });

    // Next, include providers listed on the definition itself.
    const defProviders = injDef.providers;
    if (defProviders != null && !isDuplicate) {
      const injectorType = container as InjectorType<any>;
      deepForEach(defProviders, provider => {
        // TODO: fix cast
        validateProvider(provider, defProviders as any[], injectorType);
        providersOut.push(provider);
      });
    }
  } else {
    // Should not happen, but just in case.
    return false;
  }

  return (
      defType !== container &&
      (container as InjectorTypeWithProviders<any>).providers !== undefined);
}

function validateProvider(
    provider: SingleProvider, providers: SingleProvider[], containerType: Type<unknown>): void {
  if (isTypeProvider(provider) || isValueProvider(provider) || isFactoryProvider(provider) ||
      isExistingProvider(provider)) {
    return;
  }

  // Here we expect the provider to be a `useClass` provider (by elimination).
  const classRef = resolveForwardRef(
      provider && ((provider as StaticClassProvider | ClassProvider).useClass || provider.provide));
  if (ngDevMode && !classRef) {
    throwInvalidProviderError(containerType, providers, provider);
  }
}

export const USE_VALUE =
    getClosureSafeProperty<ValueProvider>({provide: String, useValue: getClosureSafeProperty});

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
