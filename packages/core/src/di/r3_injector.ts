/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OnDestroy} from '../interface/lifecycle_hooks';
import {Type} from '../interface/type';
import {stringify} from '../util/stringify';

import {resolveForwardRef} from './forward_ref';
import {InjectionToken} from './injection_token';
import {INJECTOR, Injector, NullInjector, THROW_IF_NOT_FOUND, USE_VALUE} from './injector';
import {inject, injectArgs, setCurrentInjector} from './injector_compatibility';
import {InjectableDef, InjectableType, InjectorType, InjectorTypeWithProviders, getInjectableDef, getInjectorDef} from './interface/defs';
import {InjectFlags} from './interface/injector';
import {ClassProvider, ConstructorProvider, ExistingProvider, FactoryProvider, StaticClassProvider, StaticProvider, TypeProvider, ValueProvider} from './interface/provider';
import {APP_ROOT} from './scope';



/**
 * Internal type for a single provider in a deep provider array.
 */
type SingleProvider = TypeProvider | ValueProvider | ClassProvider | ConstructorProvider |
    ExistingProvider | FactoryProvider | StaticClassProvider;

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

const EMPTY_ARRAY = [] as any[];

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
    defType: /* InjectorType<any> */ any, parent: Injector | null = null,
    additionalProviders: StaticProvider[] | null = null): Injector {
  parent = parent || getNullInjector();
  return new R3Injector(defType, additionalProviders, parent);
}

export class R3Injector {
  /**
   * Map of tokens to records which contain the instances of those tokens.
   */
  private records = new Map<Type<any>|InjectionToken<any>, Record<any>>();

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
  private readonly isRootInjector: boolean;

  /**
   * Flag indicating that this injector was previously destroyed.
   */
  get destroyed(): boolean { return this._destroyed; }
  private _destroyed = false;

  constructor(
      def: InjectorType<any>, additionalProviders: StaticProvider[]|null,
      readonly parent: Injector) {
    // Start off by creating Records for every provider declared in every InjectorType
    // included transitively in `def`.
    const dedupStack: InjectorType<any>[] = [];
    deepForEach([def], injectorDef => this.processInjectorType(injectorDef, [], dedupStack));

    additionalProviders && deepForEach(
                               additionalProviders, provider => this.processProvider(
                                                        provider, def, additionalProviders));


    // Make sure the INJECTOR token provides this injector.
    this.records.set(INJECTOR, makeRecord(undefined, this));

    // Detect whether this injector has the APP_ROOT_SCOPE token and thus should provide
    // any injectable scoped to APP_ROOT_SCOPE.
    this.isRootInjector = this.records.has(APP_ROOT);

    // Eagerly instantiate the InjectorType classes themselves.
    this.injectorDefTypes.forEach(defType => this.get(defType));
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
      token: Type<T>|InjectionToken<T>, notFoundValue: any = THROW_IF_NOT_FOUND,
      flags = InjectFlags.Default): T {
    this.assertNotDestroyed();
    // Set the injection context.
    const previousInjector = setCurrentInjector(this);
    try {
      // Check for the SkipSelf flag.
      if (!(flags & InjectFlags.SkipSelf)) {
        // SkipSelf isn't set, check if the record belongs to this injector.
        let record: Record<T>|undefined = this.records.get(token);
        if (record === undefined) {
          // No record, but maybe the token is scoped to this injector. Look for an ngInjectableDef
          // with a scope matching this injector.
          const def = couldBeInjectableType(token) && getInjectableDef(token);
          if (def && this.injectableDefInScope(def)) {
            // Found an ngInjectableDef and it's scoped to this injector. Pretend as if it was here
            // all along.
            record = makeRecord(injectableDefOrInjectorDefFactory(token), NOT_YET);
            this.records.set(token, record);
          }
        }
        // If a record was found, get the instance for it and return it.
        if (record !== undefined) {
          return this.hydrate(token, record);
        }
      }

      // Select the next injector based on the Self flag - if self is set, the next injector is
      // the NullInjector, otherwise it's the parent.
      const nextInjector = !(flags & InjectFlags.Self) ? this.parent : getNullInjector();
      return nextInjector.get(token, notFoundValue);
    } finally {
      // Lastly, clean up the state by restoring the previous injector.
      setCurrentInjector(previousInjector);
    }
  }

  private assertNotDestroyed(): void {
    if (this._destroyed) {
      throw new Error('Injector has already been destroyed.');
    }
  }

  /**
   * Add an `InjectorType` or `InjectorDefTypeWithProviders` and all of its transitive providers
   * to this injector.
   */
  private processInjectorType(
      defOrWrappedDef: InjectorType<any>|InjectorTypeWithProviders<any>,
      parents: InjectorType<any>[], dedupStack: InjectorType<any>[]) {
    defOrWrappedDef = resolveForwardRef(defOrWrappedDef);
    if (!defOrWrappedDef) return;

    // Either the defOrWrappedDef is an InjectorType (with ngInjectorDef) or an
    // InjectorDefTypeWithProviders (aka ModuleWithProviders). Detecting either is a megamorphic
    // read, so care is taken to only do the read once.

    // First attempt to read the ngInjectorDef.
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
      throw new Error(
          `Circular dependency in DI detected for type ${defName}. Dependency path: ${parents.map(defType => stringify(defType)).join(' > ')} > ${defName}.`);
    }

    // Check for multiple imports of the same module
    const isDuplicate = dedupStack.indexOf(defType) !== -1;

    // If defOrWrappedType was an InjectorDefTypeWithProviders, then .providers may hold some
    // extra providers.
    const providers =
        (ngModule !== undefined) && (defOrWrappedDef as InjectorTypeWithProviders<any>).providers ||
        EMPTY_ARRAY;

    // Finally, if defOrWrappedType was an `InjectorDefTypeWithProviders`, then the actual
    // `InjectorDef` is on its `ngModule`.
    if (ngModule !== undefined) {
      def = getInjectorDef(ngModule);
    }

    // If no definition was found, it might be from exports. Remove it.
    if (def == null) {
      return;
    }

    // Track the InjectorType and add a provider for it.
    this.injectorDefTypes.add(defType);
    this.records.set(defType, makeRecord(def.factory, NOT_YET));

    // Add providers in the same way that @NgModule resolution did:

    // First, include providers from any imports.
    if (def.imports != null && !isDuplicate) {
      // Before processing defType's imports, add it to the set of parents. This way, if it ends
      // up deeply importing itself, this can be detected.
      ngDevMode && parents.push(defType);
      // Add it to the set of dedups. This way we can detect multiple imports of the same module
      dedupStack.push(defType);

      try {
        deepForEach(
            def.imports, imported => this.processInjectorType(imported, parents, dedupStack));
      } finally {
        // Remove it from the parents set when finished.
        ngDevMode && parents.pop();
      }
    }

    // Next, include providers listed on the definition itself.
    const defProviders = def.providers;
    if (defProviders != null && !isDuplicate) {
      const injectorType = defOrWrappedDef as InjectorType<any>;
      deepForEach(
          defProviders, provider => this.processProvider(provider, injectorType, defProviders));
    }

    // Finally, include providers from an InjectorDefTypeWithProviders if there was one.
    const ngModuleType = (defOrWrappedDef as InjectorTypeWithProviders<any>).ngModule;
    deepForEach(providers, provider => this.processProvider(provider, ngModuleType, providers));
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
        if (multiRecord.multi === undefined) {
          throw new Error(`Mixed multi-provider for ${token}.`);
        }
      } else {
        multiRecord = makeRecord(undefined, NOT_YET, true);
        multiRecord.factory = () => injectArgs(multiRecord !.multi !);
        this.records.set(token, multiRecord);
      }
      token = provider;
      multiRecord.multi !.push(provider);
    } else {
      const existing = this.records.get(token);
      if (existing && existing.multi !== undefined) {
        throw new Error(`Mixed multi-provider for ${stringify(token)}`);
      }
    }
    this.records.set(token, record);
  }

  private hydrate<T>(token: Type<T>|InjectionToken<T>, record: Record<T>): T {
    if (record.value === CIRCULAR) {
      throw new Error(`Cannot instantiate cyclic dependency! ${stringify(token)}`);
    } else if (record.value === NOT_YET) {
      record.value = CIRCULAR;
      record.value = record.factory !();
    }
    if (typeof record.value === 'object' && record.value && hasOnDestroy(record.value)) {
      this.onDestroy.add(record.value);
    }
    return record.value as T;
  }

  private injectableDefInScope(def: InjectableDef<any>): boolean {
    if (!def.providedIn) {
      return false;
    } else if (typeof def.providedIn === 'string') {
      return def.providedIn === 'any' || (def.providedIn === 'root' && this.isRootInjector);
    } else {
      return this.injectorDefTypes.has(def.providedIn);
    }
  }
}

function injectableDefOrInjectorDefFactory(token: Type<any>| InjectionToken<any>): () => any {
  const injectableDef = getInjectableDef(token as InjectableType<any>);
  if (injectableDef === null) {
    const injectorDef = getInjectorDef(token as InjectorType<any>);
    if (injectorDef !== null) {
      return injectorDef.factory;
    } else if (token instanceof InjectionToken) {
      throw new Error(`Token ${stringify(token)} is missing an ngInjectableDef definition.`);
    } else if (token instanceof Function) {
      const paramLength = token.length;
      if (paramLength > 0) {
        const args: string[] = new Array(paramLength).fill('?');
        throw new Error(
            `Can't resolve all parameters for ${stringify(token)}: (${args.join(', ')}).`);
      }
      return () => new (token as Type<any>)();
    }
    throw new Error('unreachable');
  }
  return injectableDef.factory;
}

function providerToRecord(
    provider: SingleProvider, ngModuleType: InjectorType<any>, providers: any[]): Record<any> {
  let factory: (() => any)|undefined = providerToFactory(provider, ngModuleType, providers);
  if (isValueProvider(provider)) {
    return makeRecord(undefined, provider.useValue);
  } else {
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
    return injectableDefOrInjectorDefFactory(resolveForwardRef(provider));
  } else {
    if (isValueProvider(provider)) {
      factory = () => resolveForwardRef(provider.useValue);
    } else if (isExistingProvider(provider)) {
      factory = () => inject(resolveForwardRef(provider.useExisting));
    } else if (isFactoryProvider(provider)) {
      factory = () => provider.useFactory(...injectArgs(provider.deps || []));
    } else {
      const classRef = resolveForwardRef(
          provider &&
          ((provider as StaticClassProvider | ClassProvider).useClass || provider.provide));
      if (!classRef) {
        let ngModuleDetail = '';
        if (ngModuleType && providers) {
          const providerDetail = providers.map(v => v == provider ? '?' + provider + '?' : '...');
          ngModuleDetail =
              ` - only instances of Provider and Type are allowed, got: [${providerDetail.join(', ')}]`;
        }
        throw new Error(
            `Invalid provider for the NgModule '${stringify(ngModuleType)}'` + ngModuleDetail);
      }
      if (hasDeps(provider)) {
        factory = () => new (classRef)(...injectArgs(provider.deps));
      } else {
        return injectableDefOrInjectorDefFactory(classRef);
      }
    }
  }
  return factory;
}

function makeRecord<T>(
    factory: (() => T) | undefined, value: T | {}, multi: boolean = false): Record<T> {
  return {
    factory: factory,
    value: value,
    multi: multi ? [] : undefined,
  };
}

function deepForEach<T>(input: (T | any[])[], fn: (value: T) => void): void {
  input.forEach(value => Array.isArray(value) ? deepForEach(value, fn) : fn(value));
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

function hasDeps(value: ClassProvider | ConstructorProvider | StaticClassProvider):
    value is ClassProvider&{deps: any[]} {
  return !!(value as any).deps;
}

function hasOnDestroy(value: any): value is OnDestroy {
  return value !== null && typeof value === 'object' &&
      typeof(value as OnDestroy).ngOnDestroy === 'function';
}

function couldBeInjectableType(value: any): value is Type<any>|InjectionToken<any> {
  return (typeof value === 'function') ||
      (typeof value === 'object' && value instanceof InjectionToken);
}
