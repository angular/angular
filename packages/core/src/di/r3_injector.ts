/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '../util/ng_dev_mode';

import {OnDestroy} from '../interface/lifecycle_hooks';
import {AbstractType, Type} from '../interface/type';
import {FactoryFn, getFactoryDef} from '../render3/definition_factory';
import {throwCyclicDependencyError, throwInvalidProviderError, throwMixedMultiProviderError} from '../render3/errors_di';
import {deepForEach, newArray} from '../util/array_utils';
import {EMPTY_ARRAY} from '../util/empty';
import {stringify} from '../util/stringify';

import {resolveForwardRef} from './forward_ref';
import {InjectionToken} from './injection_token';
import {Injector} from './injector';
import {catchInjectorError, injectArgs, NG_TEMP_TOKEN_PATH, setCurrentInjector, THROW_IF_NOT_FOUND, USE_VALUE, ɵɵinject} from './injector_compatibility';
import {INJECTOR} from './injector_token';
import {getInheritedInjectableDef, getInjectableDef, getInjectorDef, InjectorType, InjectorTypeWithProviders, ɵɵInjectableDef} from './interface/defs';
import {InjectFlags} from './interface/injector';
import {ClassProvider, ConstructorProvider, ExistingProvider, FactoryProvider, StaticClassProvider, StaticProvider, TypeProvider, ValueProvider} from './interface/provider';
import {NullInjector} from './null_injector';
import {INJECTOR_SCOPE} from './scope';



/**
 * Internal type for a single provider in a deep provider array.
 */
type SingleProvider = TypeProvider|ValueProvider|ClassProvider|ConstructorProvider|ExistingProvider|
    FactoryProvider|StaticClassProvider;

/**
 * Marker which indicates that a value has not yet been created from the factory function.
 */
const NOT_YET = {};

/**
 * Marker which indicates that the factory function for a token is in the process of being called.
 *
 * If the injector is asked to inject a token with its value set to CIRCULAR, that indicates
 * injection of a dependency has recursively attempted to inject the original token, and there is
 * a circular dependency among the providers.
 */
const CIRCULAR = {};

/**
 * A lazily initialized NullInjector.
 */
let NULL_INJECTOR: Injector|undefined = undefined;

function getNullInjector(): Injector {
  if (NULL_INJECTOR === undefined) {
    NULL_INJECTOR = new NullInjector();
  }
  return NULL_INJECTOR;
}

/**
 * An entry in the injector which tracks information about the given token, including a possible
 * current value.
 */
interface Record<T> {
  factory: (() => T)|undefined;
  value: T|{};
  multi: any[]|undefined;
}

/**
 * Create a new `Injector` which is configured using a `defType` of `InjectorType<any>`s.
 *
 * @publicApi
 */
export function createInjector(
    defType: /* InjectorType<any> */ any, parent: Injector|null = null,
    additionalProviders: StaticProvider[]|null = null, name?: string): Injector {
  const injector =
      createInjectorWithoutInjectorInstances(defType, parent, additionalProviders, name);
  injector._resolveInjectorDefTypes();
  return injector;
}

/**
 * Creates a new injector without eagerly resolving its injector types. Can be used in places
 * where resolving the injector types immediately can lead to an infinite loop. The injector types
 * should be resolved at a later point by calling `_resolveInjectorDefTypes`.
 */
export function createInjectorWithoutInjectorInstances(
    defType: /* InjectorType<any> */ any, parent: Injector|null = null,
    additionalProviders: StaticProvider[]|null = null, name?: string): R3Injector {
  return new R3Injector(defType, additionalProviders, parent || getNullInjector(), name);
}

export class R3Injector {
  /**
   * Map of tokens to records which contain the instances of those tokens.
   * - `null` value implies that we don't have the record. Used by tree-shakable injectors
   * to prevent further searches.
   */
  private records = new Map<Type<any>|AbstractType<any>|InjectionToken<any>, Record<any>|null>();

  /**
   * The transitive set of `InjectorType`s which define this injector.
   */
  private injectorDefTypes = new Set<InjectorType<any>>();

  /**
   * Set of values instantiated by this injector which contain `ngOnDestroy` lifecycle hooks.
   */
  private onDestroy = new Set<OnDestroy>();

  /**
   * Flag indicating this injector provides the APP_ROOT_SCOPE token, and thus counts as the
   * root scope.
   */
  private readonly scope: 'root'|'platform'|null;

  readonly source: string|null;

  /**
   * Flag indicating that this injector was previously destroyed.
   */
  get destroyed(): boolean {
    return this._destroyed;
  }
  private _destroyed = false;

  constructor(
      def: InjectorType<any>, additionalProviders: StaticProvider[]|null, readonly parent: Injector,
      source: string|null = null) {
    const dedupStack: InjectorType<any>[] = [];

    // Start off by creating Records for every provider declared in every InjectorType
    // included transitively in additional providers then do the same for `def`. This order is
    // important because `def` may include providers that override ones in additionalProviders.
    additionalProviders &&
        deepForEach(
            additionalProviders,
            provider => this.processProvider(provider, def, additionalProviders));

    deepForEach([def], injectorDef => this.processInjectorType(injectorDef, [], dedupStack));

    // Make sure the INJECTOR token provides this injector.
    this.records.set(INJECTOR, makeRecord(undefined, this));

    // Detect whether this injector has the APP_ROOT_SCOPE token and thus should provide
    // any injectable scoped to APP_ROOT_SCOPE.
    const record = this.records.get(INJECTOR_SCOPE);
    this.scope = record != null ? record.value : null;

    // Source name, used for debugging
    this.source = source || (typeof def === 'object' ? null : stringify(def));
  }

  /**
   * Destroy the injector and release references to every instance or provider associated with it.
   *
   * Also calls the `OnDestroy` lifecycle hooks of every instance that was created for which a
   * hook was found.
   */
  destroy(): void {
    this.assertNotDestroyed();

    // Set destroyed = true first, in case lifecycle hooks re-enter destroy().
    this._destroyed = true;
    try {
      // Call all the lifecycle hooks.
      this.onDestroy.forEach(service => service.ngOnDestroy());
    } finally {
      // Release all references.
      this.records.clear();
      this.onDestroy.clear();
      this.injectorDefTypes.clear();
    }
  }

  get<T>(
      token: Type<T>|AbstractType<T>|InjectionToken<T>, notFoundValue: any = THROW_IF_NOT_FOUND,
      flags = InjectFlags.Default): T {
    this.assertNotDestroyed();
    // Set the injection context.
    const previousInjector = setCurrentInjector(this);
    try {
      // Check for the SkipSelf flag.
      if (!(flags & InjectFlags.SkipSelf)) {
        // SkipSelf isn't set, check if the record belongs to this injector.
        let record: Record<T>|undefined|null = this.records.get(token);
        if (record === undefined) {
          // No record, but maybe the token is scoped to this injector. Look for an injectable
          // def with a scope matching this injector.
          const def = couldBeInjectableType(token) && getInjectableDef(token);
          if (def && this.injectableDefInScope(def)) {
            // Found an injectable def and it's scoped to this injector. Pretend as if it was here
            // all along.
            record = makeRecord(injectableDefOrInjectorDefFactory(token), NOT_YET);
          } else {
            record = null;
          }
          this.records.set(token, record);
        }
        // If a record was found, get the instance for it and return it.
        if (record != null /* NOT null || undefined */) {
          return this.hydrate(token, record);
        }
      }

      // Select the next injector based on the Self flag - if self is set, the next injector is
      // the NullInjector, otherwise it's the parent.
      const nextInjector = !(flags & InjectFlags.Self) ? this.parent : getNullInjector();
      // Set the notFoundValue based on the Optional flag - if optional is set and notFoundValue
      // is undefined, the value is null, otherwise it's the notFoundValue.
      notFoundValue = (flags & InjectFlags.Optional) && notFoundValue === THROW_IF_NOT_FOUND ?
          null :
          notFoundValue;
      return nextInjector.get(token, notFoundValue);
    } catch (e) {
      if (e.name === 'NullInjectorError') {
        const path: any[] = e[NG_TEMP_TOKEN_PATH] = e[NG_TEMP_TOKEN_PATH] || [];
        path.unshift(stringify(token));
        if (previousInjector) {
          // We still have a parent injector, keep throwing
          throw e;
        } else {
          // Format & throw the final error message when we don't have any previous injector
          return catchInjectorError(e, token, 'R3InjectorError', this.source);
        }
      } else {
        throw e;
      }
    } finally {
      // Lastly, clean up the state by restoring the previous injector.
      setCurrentInjector(previousInjector);
    }
  }

  /** @internal */
  _resolveInjectorDefTypes() {
    this.injectorDefTypes.forEach(defType => this.get(defType));
  }

  toString() {
    const tokens = <string[]>[], records = this.records;
    records.forEach((v, token) => tokens.push(stringify(token)));
    return `R3Injector[${tokens.join(', ')}]`;
  }

  private assertNotDestroyed(): void {
    if (this._destroyed) {
      throw new Error('Injector has already been destroyed.');
    }
  }

  /**
   * Add an `InjectorType` or `InjectorTypeWithProviders` and all of its transitive providers
   * to this injector.
   *
   * If an `InjectorTypeWithProviders` that declares providers besides the type is specified,
   * the function will return "true" to indicate that the providers of the type definition need
   * to be processed. This allows us to process providers of injector types after all imports of
   * an injector definition are processed. (following View Engine semantics: see FW-1349)
   */
  private processInjectorType(
      defOrWrappedDef: InjectorType<any>|InjectorTypeWithProviders<any>,
      parents: InjectorType<any>[],
      dedupStack: InjectorType<any>[]): defOrWrappedDef is InjectorTypeWithProviders<any> {
    defOrWrappedDef = resolveForwardRef(defOrWrappedDef);
    if (!defOrWrappedDef) return false;

    // Either the defOrWrappedDef is an InjectorType (with injector def) or an
    // InjectorDefTypeWithProviders (aka ModuleWithProviders). Detecting either is a megamorphic
    // read, so care is taken to only do the read once.

    // First attempt to read the injector def (`ɵinj`).
    let def = getInjectorDef(defOrWrappedDef);

    // If that's not present, then attempt to read ngModule from the InjectorDefTypeWithProviders.
    const ngModule =
        (def == null) && (defOrWrappedDef as InjectorTypeWithProviders<any>).ngModule || undefined;

    // Determine the InjectorType. In the case where `defOrWrappedDef` is an `InjectorType`,
    // then this is easy. In the case of an InjectorDefTypeWithProviders, then the definition type
    // is the `ngModule`.
    const defType: InjectorType<any> =
        (ngModule === undefined) ? (defOrWrappedDef as InjectorType<any>) : ngModule;

    // Check for circular dependencies.
    if (ngDevMode && parents.indexOf(defType) !== -1) {
      const defName = stringify(defType);
      const path = parents.map(stringify);
      throwCyclicDependencyError(defName, path);
    }

    // Check for multiple imports of the same module
    const isDuplicate = dedupStack.indexOf(defType) !== -1;

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
      dedupStack.push(defType);

      let importTypesWithProviders: (InjectorTypeWithProviders<any>[])|undefined;
      try {
        deepForEach(def.imports, imported => {
          if (this.processInjectorType(imported, parents, dedupStack)) {
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
          deepForEach(
              providers!,
              provider => this.processProvider(provider, ngModule, providers || EMPTY_ARRAY));
        }
      }
    }
    // Track the InjectorType and add a provider for it. It's important that this is done after the
    // def's imports.
    this.injectorDefTypes.add(defType);
    const factory = getFactoryDef(defType) || (() => new defType());
    this.records.set(defType, makeRecord(factory, NOT_YET));

    // Next, include providers listed on the definition itself.
    const defProviders = def.providers;
    if (defProviders != null && !isDuplicate) {
      const injectorType = defOrWrappedDef as InjectorType<any>;
      deepForEach(
          defProviders, provider => this.processProvider(provider, injectorType, defProviders));
    }

    return (
        ngModule !== undefined &&
        (defOrWrappedDef as InjectorTypeWithProviders<any>).providers !== undefined);
  }

  /**
   * Process a `SingleProvider` and add it.
   */
  private processProvider(
      provider: SingleProvider, ngModuleType: InjectorType<any>, providers: any[]): void {
    // Determine the token from the provider. Either it's its own token, or has a {provide: ...}
    // property.
    provider = resolveForwardRef(provider);
    let token: any =
        isTypeProvider(provider) ? provider : resolveForwardRef(provider && provider.provide);

    // Construct a `Record` for the provider.
    const record = providerToRecord(provider, ngModuleType, providers);

    if (!isTypeProvider(provider) && provider.multi === true) {
      // If the provider indicates that it's a multi-provider, process it specially.
      // First check whether it's been defined already.
      let multiRecord = this.records.get(token);
      if (multiRecord) {
        // It has. Throw a nice error if
        if (ngDevMode && multiRecord.multi === undefined) {
          throwMixedMultiProviderError();
        }
      } else {
        multiRecord = makeRecord(undefined, NOT_YET, true);
        multiRecord.factory = () => injectArgs(multiRecord!.multi!);
        this.records.set(token, multiRecord);
      }
      token = provider;
      multiRecord.multi!.push(provider);
    } else {
      const existing = this.records.get(token);
      if (ngDevMode && existing && existing.multi !== undefined) {
        throwMixedMultiProviderError();
      }
    }
    this.records.set(token, record);
  }

  private hydrate<T>(token: Type<T>|AbstractType<T>|InjectionToken<T>, record: Record<T>): T {
    if (ngDevMode && record.value === CIRCULAR) {
      throwCyclicDependencyError(stringify(token));
    } else if (record.value === NOT_YET) {
      record.value = CIRCULAR;
      record.value = record.factory!();
    }
    if (typeof record.value === 'object' && record.value && hasOnDestroy(record.value)) {
      this.onDestroy.add(record.value);
    }
    return record.value as T;
  }

  private injectableDefInScope(def: ɵɵInjectableDef<any>): boolean {
    if (!def.providedIn) {
      return false;
    } else if (typeof def.providedIn === 'string') {
      return def.providedIn === 'any' || (def.providedIn === this.scope);
    } else {
      return this.injectorDefTypes.has(def.providedIn);
    }
  }
}

function injectableDefOrInjectorDefFactory(token: Type<any>|AbstractType<any>|
                                           InjectionToken<any>): FactoryFn<any> {
  // Most tokens will have an injectable def directly on them, which specifies a factory directly.
  const injectableDef = getInjectableDef(token);
  const factory = injectableDef !== null ? injectableDef.factory : getFactoryDef(token);

  if (factory !== null) {
    return factory;
  }

  // InjectionTokens should have an injectable def (ɵprov) and thus should be handled above.
  // If it's missing that, it's an error.
  if (token instanceof InjectionToken) {
    throw new Error(`Token ${stringify(token)} is missing a ɵprov definition.`);
  }

  // Undecorated types can sometimes be created if they have no constructor arguments.
  if (token instanceof Function) {
    return getUndecoratedInjectableFactory(token);
  }

  // There was no way to resolve a factory for this token.
  throw new Error('unreachable');
}

function getUndecoratedInjectableFactory(token: Function) {
  // If the token has parameters then it has dependencies that we cannot resolve implicitly.
  const paramLength = token.length;
  if (paramLength > 0) {
    const args: string[] = newArray(paramLength, '?');
    throw new Error(`Can't resolve all parameters for ${stringify(token)}: (${args.join(', ')}).`);
  }

  // The constructor function appears to have no parameters.
  // This might be because it inherits from a super-class. In which case, use an injectable
  // def from an ancestor if there is one.
  // Otherwise this really is a simple class with no dependencies, so return a factory that
  // just instantiates the zero-arg constructor.
  const inheritedInjectableDef = getInheritedInjectableDef(token);
  if (inheritedInjectableDef !== null) {
    return () => inheritedInjectableDef.factory(token as Type<any>);
  } else {
    return () => new (token as Type<any>)();
  }
}

function providerToRecord(
    provider: SingleProvider, ngModuleType: InjectorType<any>, providers: any[]): Record<any> {
  if (isValueProvider(provider)) {
    return makeRecord(undefined, provider.useValue);
  } else {
    const factory: (() => any)|undefined = providerToFactory(provider, ngModuleType, providers);
    return makeRecord(factory, NOT_YET);
  }
}

/**
 * Converts a `SingleProvider` into a factory function.
 *
 * @param provider provider to convert to factory
 */
export function providerToFactory(
    provider: SingleProvider, ngModuleType?: InjectorType<any>, providers?: any[]): () => any {
  let factory: (() => any)|undefined = undefined;
  if (isTypeProvider(provider)) {
    const unwrappedProvider = resolveForwardRef(provider);
    return getFactoryDef(unwrappedProvider) || injectableDefOrInjectorDefFactory(unwrappedProvider);
  } else {
    if (isValueProvider(provider)) {
      factory = () => resolveForwardRef(provider.useValue);
    } else if (isFactoryProvider(provider)) {
      factory = () => provider.useFactory(...injectArgs(provider.deps || []));
    } else if (isExistingProvider(provider)) {
      factory = () => ɵɵinject(resolveForwardRef(provider.useExisting));
    } else {
      const classRef = resolveForwardRef(
          provider &&
          ((provider as StaticClassProvider | ClassProvider).useClass || provider.provide));
      if (ngDevMode && !classRef) {
        throwInvalidProviderError(ngModuleType, providers, provider);
      }
      if (hasDeps(provider)) {
        factory = () => new (classRef)(...injectArgs(provider.deps));
      } else {
        return getFactoryDef(classRef) || injectableDefOrInjectorDefFactory(classRef);
      }
    }
  }
  return factory;
}

function makeRecord<T>(
    factory: (() => T)|undefined, value: T|{}, multi: boolean = false): Record<T> {
  return {
    factory: factory,
    value: value,
    multi: multi ? [] : undefined,
  };
}

function isValueProvider(value: SingleProvider): value is ValueProvider {
  return value !== null && typeof value == 'object' && USE_VALUE in value;
}

function isExistingProvider(value: SingleProvider): value is ExistingProvider {
  return !!(value && (value as ExistingProvider).useExisting);
}

function isFactoryProvider(value: SingleProvider): value is FactoryProvider {
  return !!(value && (value as FactoryProvider).useFactory);
}

export function isTypeProvider(value: SingleProvider): value is TypeProvider {
  return typeof value === 'function';
}

export function isClassProvider(value: SingleProvider): value is ClassProvider {
  return !!(value as StaticClassProvider | ClassProvider).useClass;
}

function hasDeps(value: ClassProvider|ConstructorProvider|
                 StaticClassProvider): value is ClassProvider&{deps: any[]} {
  return !!(value as any).deps;
}

function hasOnDestroy(value: any): value is OnDestroy {
  return value !== null && typeof value === 'object' &&
      typeof (value as OnDestroy).ngOnDestroy === 'function';
}

function couldBeInjectableType(value: any): value is Type<any>|AbstractType<any>|
    InjectionToken<any> {
  return (typeof value === 'function') ||
      (typeof value === 'object' && value instanceof InjectionToken);
}
