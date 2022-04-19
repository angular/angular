/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
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
 * Collects providers from all NgModules, including transitively imported ones.
 *
 * @returns The list of collected providers from the specified list of NgModules.
 * @publicApi
 */
export function importProvidersFrom(...injectorTypes: Array<Type<unknown>>): Provider[] {
  const providers: SingleProvider[] = [];
  deepForEach(
      injectorTypes,
      injectorDef => walkProviderTree(injectorDef as InjectorType<any>, providers, [], new Set()));
  return providers;
}

/**
 * Internal type for a single provider in a deep provider array.
 */
export type SingleProvider = TypeProvider|ValueProvider|ClassProvider|ConstructorProvider|
    ExistingProvider|FactoryProvider|StaticClassProvider;

/**
 * The logic visits an `InjectorType` or `InjectorTypeWithProviders` and all of its transitive
 * providers and invokes specified callbacks when:
 * - an injector type is visited (typically an NgModule)
 * - a provider is visited
 *
 * If an `InjectorTypeWithProviders` that declares providers besides the type is specified,
 * the function will return "true" to indicate that the providers of the type definition need
 * to be processed. This allows us to process providers of injector types after all imports of
 * an injector definition are processed. (following View Engine semantics: see FW-1349)
 */
export function walkProviderTree(
    container: InjectorType<unknown>|InjectorTypeWithProviders<unknown>,
    providersOut: SingleProvider[], parents: InjectorType<unknown>[],
    dedup: Set<Type<unknown>>): container is InjectorTypeWithProviders<unknown> {
  container = resolveForwardRef(container);
  if (!container) return false;

  // Either the defOrWrappedDef is an InjectorType (with injector def) or an
  // InjectorDefTypeWithProviders (aka ModuleWithProviders). Detecting either is a megamorphic
  // read, so care is taken to only do the read once.

  // First attempt to read the injector def (`ɵinj`).
  let def = getInjectorDef(container);

  // If that's not present, then attempt to read ngModule from the InjectorDefTypeWithProviders.
  const ngModule =
      (def == null) && (container as InjectorTypeWithProviders<any>).ngModule || undefined;

  // Determine the InjectorType. In the case where `defOrWrappedDef` is an `InjectorType`,
  // then this is easy. In the case of an InjectorDefTypeWithProviders, then the definition type
  // is the `ngModule`.
  const defType: InjectorType<any> =
      (ngModule === undefined) ? (container as InjectorType<any>) : ngModule;

  // Check for circular dependencies.
  if (ngDevMode && parents.indexOf(defType) !== -1) {
    const defName = stringify(defType);
    const path = parents.map(stringify);
    throwCyclicDependencyError(defName, path);
  }

  // Check for multiple imports of the same module
  const isDuplicate = dedup.has(defType);

  // Finally, if defOrWrappedType was an `InjectorDefTypeWithProviders`, then the actual
  // `InjectorDef` is on its `ngModule`.
  if (ngModule !== undefined) {
    def = getInjectorDef(ngModule);
  }

  // If no definition was found, it might be from exports. Remove it.
  if (def == null) {
    return false;
  }

  // Add providers in the same way that @NgModule resolution did:

  // First, include providers from any imports.
  if (def.imports != null && !isDuplicate) {
    // Before processing defType's imports, add it to the set of parents. This way, if it ends
    // up deeply importing itself, this can be detected.
    ngDevMode && parents.push(defType);
    // Add it to the set of dedups. This way we can detect multiple imports of the same module
    dedup.add(defType);

    let importTypesWithProviders: (InjectorTypeWithProviders<any>[])|undefined;
    try {
      deepForEach(def.imports, imported => {
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
  const factory = getFactoryDef(defType) || (() => new defType());

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
    useValue: () => inject(defType),
    multi: true,
  });

  // Next, include providers listed on the definition itself.
  const defProviders = def.providers;
  if (defProviders != null && !isDuplicate) {
    const injectorType = container as InjectorType<any>;
    deepForEach(defProviders, provider => {
      // TODO: fix cast
      validateProvider(provider, defProviders as any[], injectorType);
      providersOut.push(provider);
    });
  }

  return (
      ngModule !== undefined &&
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
