import {
  Type,
  isBlank,
  isPresent,
  CONST,
  CONST_EXPR,
  stringify,
  isArray,
  isType,
  isFunction,
  normalizeBool
} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {reflector} from 'angular2/src/core/reflection/reflection';
import {Key} from './key';
import {
  InjectMetadata,
  InjectableMetadata,
  OptionalMetadata,
  SelfMetadata,
  HostMetadata,
  SkipSelfMetadata,
  DependencyMetadata
} from './metadata';
import {
  NoAnnotationError,
  MixingMultiProvidersWithRegularProvidersError,
  InvalidProviderError
} from './exceptions';
import {resolveForwardRef} from './forward_ref';

/**
 * `Dependency` is used by the framework to extend DI.
 * This is internal to Angular and should not be used directly.
 */
export class Dependency {
  constructor(public key: Key, public optional: boolean, public lowerBoundVisibility: any,
              public upperBoundVisibility: any, public properties: any[]) {}

  static fromKey(key: Key): Dependency { return new Dependency(key, false, null, null, []); }
}

const _EMPTY_LIST = CONST_EXPR([]);

/**
 * Describes how the {@link Injector} should instantiate a given token.
 *
 * See {@link provide}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/GNAyj6K6PfYg2NBzgwZ5?p%3Dpreview&p=preview))
 *
 * ```javascript
 * var injector = Injector.resolveAndCreate([
 *   new Provider("message", { useValue: 'Hello' })
 * ]);
 *
 * expect(injector.get("message")).toEqual('Hello');
 * ```
 */
@CONST()
export class Provider {
  /**
   * Token used when retrieving this provider. Usually, it is a type {@link Type}.
   */
  token;

  /**
   * Binds a DI token to an implementation class.
   *
   * ### Example ([live demo](http://plnkr.co/edit/RSTG86qgmoxCyj9SWPwY?p=preview))
   *
   * Because `useExisting` and `useClass` are often confused, the example contains
   * both use cases for easy comparison.
   *
   * ```typescript
   * class Vehicle {}
   *
   * class Car extends Vehicle {}
   *
   * var injectorClass = Injector.resolveAndCreate([
   *   Car,
   *   new Provider(Vehicle, { useClass: Car })
   * ]);
   * var injectorAlias = Injector.resolveAndCreate([
   *   Car,
   *   new Provider(Vehicle, { useExisting: Car })
   * ]);
   *
   * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
   * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
   *
   * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
   * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
   * ```
   */
  useClass: Type;

  /**
   * Binds a DI token to a value.
   *
   * ### Example ([live demo](http://plnkr.co/edit/UFVsMVQIDe7l4waWziES?p=preview))
   *
   * ```javascript
   * var injector = Injector.resolveAndCreate([
   *   new Provider("message", { useValue: 'Hello' })
   * ]);
   *
   * expect(injector.get("message")).toEqual('Hello');
   * ```
   */
  useValue;

  /**
   * Binds a DI token to an existing token.
   *
   * {@link Injector} returns the same instance as if the provided token was used.
   * This is in contrast to `useClass` where a separate instance of `useClass` is returned.
   *
   * ### Example ([live demo](http://plnkr.co/edit/QsatsOJJ6P8T2fMe9gr8?p=preview))
   *
   * Because `useExisting` and `useClass` are often confused the example contains
   * both use cases for easy comparison.
   *
   * ```typescript
   * class Vehicle {}
   *
   * class Car extends Vehicle {}
   *
   * var injectorAlias = Injector.resolveAndCreate([
   *   Car,
   *   new Provider(Vehicle, { useExisting: Car })
   * ]);
   * var injectorClass = Injector.resolveAndCreate([
   *   Car,
   *   new Provider(Vehicle, { useClass: Car })
   * ]);
   *
   * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
   * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
   *
   * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
   * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
   * ```
   */
  useExisting;

  /**
   * Binds a DI token to a function which computes the value.
   *
   * ### Example ([live demo](http://plnkr.co/edit/Scoxy0pJNqKGAPZY1VVC?p=preview))
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   new Provider(Number, { useFactory: () => { return 1+2; }}),
   *   new Provider(String, { useFactory: (value) => { return "Value: " + value; },
   *                       deps: [Number] })
   * ]);
   *
   * expect(injector.get(Number)).toEqual(3);
   * expect(injector.get(String)).toEqual('Value: 3');
   * ```
   *
   * Used in conjunction with dependencies.
   */
  useFactory: Function;

  /**
   * Specifies a set of dependencies
   * (as `token`s) which should be injected into the factory function.
   *
   * ### Example ([live demo](http://plnkr.co/edit/Scoxy0pJNqKGAPZY1VVC?p=preview))
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   new Provider(Number, { useFactory: () => { return 1+2; }}),
   *   new Provider(String, { useFactory: (value) => { return "Value: " + value; },
   *                       deps: [Number] })
   * ]);
   *
   * expect(injector.get(Number)).toEqual(3);
   * expect(injector.get(String)).toEqual('Value: 3');
   * ```
   *
   * Used in conjunction with `useFactory`.
   */
  dependencies: Object[];

  /** @internal */
  _multi: boolean;

  constructor(token, {useClass, useValue, useExisting, useFactory, deps, multi}: {
    useClass?: Type,
    useValue?: any,
    useExisting?: any,
    useFactory?: Function,
    deps?: Object[],
    multi?: boolean
  }) {
    this.token = token;
    this.useClass = useClass;
    this.useValue = useValue;
    this.useExisting = useExisting;
    this.useFactory = useFactory;
    this.dependencies = deps;
    this._multi = multi;
  }

  // TODO: Provide a full working example after alpha38 is released.
  /**
   * Creates multiple providers matching the same token (a multi-provider).
   *
   * Multi-providers are used for creating pluggable service, where the system comes
   * with some default providers, and the user can register additional providers.
   * The combination of the default providers and the additional providers will be
   * used to drive the behavior of the system.
   *
   * ### Example
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   new Provider("Strings", { useValue: "String1", multi: true}),
   *   new Provider("Strings", { useValue: "String2", multi: true})
   * ]);
   *
   * expect(injector.get("Strings")).toEqual(["String1", "String2"]);
   * ```
   *
   * Multi-providers and regular providers cannot be mixed. The following
   * will throw an exception:
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   new Provider("Strings", { useValue: "String1", multi: true }),
   *   new Provider("Strings", { useValue: "String2"})
   * ]);
   * ```
   */
  get multi(): boolean { return normalizeBool(this._multi); }
}

/**
 * See {@link Provider} instead.
 *
 * @deprecated
 */
@CONST()
export class Binding extends Provider {
  constructor(token, {toClass, toValue, toAlias, toFactory, deps, multi}: {
    toClass?: Type,
    toValue?: any,
    toAlias?: any,
    toFactory: Function, deps?: Object[], multi?: boolean
  }) {
    super(token, {
      useClass: toClass,
      useValue: toValue,
      useExisting: toAlias,
      useFactory: toFactory,
      deps: deps,
      multi: multi
    });
  }

  /**
   * @deprecated
   */
  get toClass() { return this.useClass; }

  /**
   * @deprecated
   */
  get toAlias() { return this.useExisting; }

  /**
   * @deprecated
   */
  get toFactory() { return this.useFactory; }

  /**
   * @deprecated
   */
  get toValue() { return this.useValue; }
}

/**
 * An internal resolved representation of a {@link Provider} used by the {@link Injector}.
 *
 * It is usually created automatically by `Injector.resolveAndCreate`.
 *
 * It can be created manually, as follows:
 *
 * ### Example ([live demo](http://plnkr.co/edit/RfEnhh8kUEI0G3qsnIeT?p%3Dpreview&p=preview))
 *
 * ```typescript
 * var resolvedProviders = Injector.resolve([new Provider('message', {useValue: 'Hello'})]);
 * var injector = Injector.fromResolvedProviders(resolvedProviders);
 *
 * expect(injector.get('message')).toEqual('Hello');
 * ```
 */
export interface ResolvedProvider {
  /**
   * A key, usually a `Type`.
   */
  key: Key;

  /**
   * Factory function which can return an instance of an object represented by a key.
   */
  resolvedFactories: ResolvedFactory[];

  /**
   * Indicates if the provider is a multi-provider or a regular provider.
   */
  multiProvider: boolean;
}

/**
 * See {@link ResolvedProvider} instead.
 *
 * @deprecated
 */
export interface ResolvedBinding extends ResolvedProvider {}

export class ResolvedProvider_ implements ResolvedBinding {
  constructor(public key: Key, public resolvedFactories: ResolvedFactory[],
              public multiProvider: boolean) {}

  get resolvedFactory(): ResolvedFactory { return this.resolvedFactories[0]; }
}

/**
 * An internal resolved representation of a factory function created by resolving {@link Provider}.
 */
export class ResolvedFactory {
  constructor(
      /**
       * Factory function which can return an instance of an object represented by a key.
       */
      public factory: Function,

      /**
       * Arguments (dependencies) to the `factory` function.
       */
      public dependencies: Dependency[]) {}
}

/**
 * Creates a {@link Provider}.
 *
 * To construct a {@link Provider}, bind a `token` to either a class, a value, a factory function,
 * or
 * to an existing `token`.
 * See {@link ProviderBuilder} for more details.
 *
 * The `token` is most commonly a class or {@link angular2/di/OpaqueToken}.
 *
 * @deprecated
 */
export function bind(token): ProviderBuilder {
  return new ProviderBuilder(token);
}

/**
 * Creates a {@link Provider}.
 *
 * See {@link Provider} for more details.
 *
 * <!-- TODO: improve the docs -->
 */
export function provide(token, {useClass, useValue, useExisting, useFactory, deps, multi}: {
  useClass?: Type,
  useValue?: any,
  useExisting?: any,
  useFactory?: Function,
  deps?: Object[],
  multi?: boolean
}): Provider {
  return new Provider(token, {
    useClass: useClass,
    useValue: useValue,
    useExisting: useExisting,
    useFactory: useFactory,
    deps: deps,
    multi: multi
  });
}

/**
 * Helper class for the {@link bind} function.
 */
export class ProviderBuilder {
  constructor(public token) {}

  /**
   * Binds a DI token to a class.
   *
   * ### Example ([live demo](http://plnkr.co/edit/ZpBCSYqv6e2ud5KXLdxQ?p=preview))
   *
   * Because `toAlias` and `toClass` are often confused, the example contains
   * both use cases for easy comparison.
   *
   * ```typescript
   * class Vehicle {}
   *
   * class Car extends Vehicle {}
   *
   * var injectorClass = Injector.resolveAndCreate([
   *   Car,
   *   provide(Vehicle, {useClass: Car})
   * ]);
   * var injectorAlias = Injector.resolveAndCreate([
   *   Car,
   *   provide(Vehicle, {useExisting: Car})
   * ]);
   *
   * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
   * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
   *
   * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
   * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
   * ```
   */
  toClass(type: Type): Provider {
    if (!isType(type)) {
      throw new BaseException(
          `Trying to create a class provider but "${stringify(type)}" is not a class!`);
    }
    return new Provider(this.token, {useClass: type});
  }

  /**
   * Binds a DI token to a value.
   *
   * ### Example ([live demo](http://plnkr.co/edit/G024PFHmDL0cJFgfZK8O?p=preview))
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   provide('message', {useValue: 'Hello'})
   * ]);
   *
   * expect(injector.get('message')).toEqual('Hello');
   * ```
   */
  toValue(value: any): Provider { return new Provider(this.token, {useValue: value}); }

  /**
   * Binds a DI token to an existing token.
   *
   * Angular will return the same instance as if the provided token was used. (This is
   * in contrast to `useClass` where a separate instance of `useClass` will be returned.)
   *
   * ### Example ([live demo](http://plnkr.co/edit/uBaoF2pN5cfc5AfZapNw?p=preview))
   *
   * Because `toAlias` and `toClass` are often confused, the example contains
   * both use cases for easy comparison.
   *
   * ```typescript
   * class Vehicle {}
   *
   * class Car extends Vehicle {}
   *
   * var injectorAlias = Injector.resolveAndCreate([
   *   Car,
   *   provide(Vehicle, {useExisting: Car})
   * ]);
   * var injectorClass = Injector.resolveAndCreate([
   *   Car,
   *   provide(Vehicle, {useClass: Car})
   * ]);
   *
   * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
   * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
   *
   * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
   * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
   * ```
   */
  toAlias(aliasToken: /*Type*/ any): Provider {
    if (isBlank(aliasToken)) {
      throw new BaseException(`Can not alias ${stringify(this.token)} to a blank value!`);
    }
    return new Provider(this.token, {useExisting: aliasToken});
  }

  /**
   * Binds a DI token to a function which computes the value.
   *
   * ### Example ([live demo](http://plnkr.co/edit/OejNIfTT3zb1iBxaIYOb?p=preview))
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   provide(Number, {useFactory: () => { return 1+2; }}),
   *   provide(String, {useFactory: (v) => { return "Value: " + v; }, deps: [Number]})
   * ]);
   *
   * expect(injector.get(Number)).toEqual(3);
   * expect(injector.get(String)).toEqual('Value: 3');
   * ```
   */
  toFactory(factory: Function, dependencies?: any[]): Provider {
    if (!isFunction(factory)) {
      throw new BaseException(
          `Trying to create a factory provider but "${stringify(factory)}" is not a function!`);
    }
    return new Provider(this.token, {useFactory: factory, deps: dependencies});
  }
}

/**
 * Resolve a single provider.
 */
export function resolveFactory(provider: Provider): ResolvedFactory {
  var factoryFn: Function;
  var resolvedDeps: Dependency[];
  if (isPresent(provider.useClass)) {
    var useClass = resolveForwardRef(provider.useClass);
    factoryFn = reflector.factory(useClass);
    resolvedDeps = _dependenciesFor(useClass);
  } else if (isPresent(provider.useExisting)) {
    factoryFn = (aliasInstance) => aliasInstance;
    resolvedDeps = [Dependency.fromKey(Key.get(provider.useExisting))];
  } else if (isPresent(provider.useFactory)) {
    factoryFn = provider.useFactory;
    resolvedDeps = _constructDependencies(provider.useFactory, provider.dependencies);
  } else {
    factoryFn = () => provider.useValue;
    resolvedDeps = _EMPTY_LIST;
  }
  return new ResolvedFactory(factoryFn, resolvedDeps);
}

/**
 * Converts the {@link Provider} into {@link ResolvedProvider}.
 *
 * {@link Injector} internally only uses {@link ResolvedProvider}, {@link Provider} contains
 * convenience provider syntax.
 */
export function resolveProvider(provider: Provider): ResolvedProvider {
  return new ResolvedProvider_(Key.get(provider.token), [resolveFactory(provider)], provider.multi);
}

/**
 * Resolve a list of Providers.
 */
export function resolveProviders(providers: Array<Type | Provider | any[]>): ResolvedProvider[] {
  var normalized = _normalizeProviders(providers, []);
  var resolved = normalized.map(resolveProvider);
  return MapWrapper.values(mergeResolvedProviders(resolved, new Map<number, ResolvedProvider>()));
}

/**
 * Merges a list of ResolvedProviders into a list where
 * each key is contained exactly once and multi providers
 * have been merged.
 */
export function mergeResolvedProviders(
    providers: ResolvedProvider[],
    normalizedProvidersMap: Map<number, ResolvedProvider>): Map<number, ResolvedProvider> {
  for (var i = 0; i < providers.length; i++) {
    var provider = providers[i];
    var existing = normalizedProvidersMap.get(provider.key.id);
    if (isPresent(existing)) {
      if (provider.multiProvider !== existing.multiProvider) {
        throw new MixingMultiProvidersWithRegularProvidersError(existing, provider);
      }
      if (provider.multiProvider) {
        for (var j = 0; j < provider.resolvedFactories.length; j++) {
          existing.resolvedFactories.push(provider.resolvedFactories[j]);
        }
      } else {
        normalizedProvidersMap.set(provider.key.id, provider);
      }
    } else {
      var resolvedProvider;
      if (provider.multiProvider) {
        resolvedProvider = new ResolvedProvider_(
            provider.key, ListWrapper.clone(provider.resolvedFactories), provider.multiProvider);
      } else {
        resolvedProvider = provider;
      }
      normalizedProvidersMap.set(provider.key.id, resolvedProvider);
    }
  }
  return normalizedProvidersMap;
}

function _normalizeProviders(providers: Array<Type | Provider | ProviderBuilder | any[]>,
                             res: Provider[]): Provider[] {
  providers.forEach(b => {
    if (b instanceof Type) {
      res.push(provide(b, {useClass: b}));

    } else if (b instanceof Provider) {
      res.push(b);

    } else if (b instanceof Array) {
      _normalizeProviders(b, res);

    } else if (b instanceof ProviderBuilder) {
      throw new InvalidProviderError(b.token);

    } else {
      throw new InvalidProviderError(b);
    }
  });

  return res;
}

function _constructDependencies(factoryFunction: Function, dependencies: any[]): Dependency[] {
  if (isBlank(dependencies)) {
    return _dependenciesFor(factoryFunction);
  } else {
    var params: any[][] = dependencies.map(t => [t]);
    return dependencies.map(t => _extractToken(factoryFunction, t, params));
  }
}

function _dependenciesFor(typeOrFunc): Dependency[] {
  var params: any[][] = reflector.parameters(typeOrFunc);
  if (isBlank(params)) return [];
  if (params.some(isBlank)) {
    throw new NoAnnotationError(typeOrFunc, params);
  }
  return params.map((p: any[]) => _extractToken(typeOrFunc, p, params));
}

function _extractToken(typeOrFunc, metadata /*any[] | any*/, params: any[][]): Dependency {
  var depProps = [];
  var token = null;
  var optional = false;

  if (!isArray(metadata)) {
    if (metadata instanceof InjectMetadata) {
      return _createDependency(metadata.token, optional, null, null, depProps);
    } else {
      return _createDependency(metadata, optional, null, null, depProps);
    }
  }

  var lowerBoundVisibility = null;
  var upperBoundVisibility = null;

  for (var i = 0; i < metadata.length; ++i) {
    var paramMetadata = metadata[i];

    if (paramMetadata instanceof Type) {
      token = paramMetadata;

    } else if (paramMetadata instanceof InjectMetadata) {
      token = paramMetadata.token;

    } else if (paramMetadata instanceof OptionalMetadata) {
      optional = true;

    } else if (paramMetadata instanceof SelfMetadata) {
      upperBoundVisibility = paramMetadata;

    } else if (paramMetadata instanceof HostMetadata) {
      upperBoundVisibility = paramMetadata;

    } else if (paramMetadata instanceof SkipSelfMetadata) {
      lowerBoundVisibility = paramMetadata;

    } else if (paramMetadata instanceof DependencyMetadata) {
      if (isPresent(paramMetadata.token)) {
        token = paramMetadata.token;
      }
      depProps.push(paramMetadata);
    }
  }

  token = resolveForwardRef(token);

  if (isPresent(token)) {
    return _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps);
  } else {
    throw new NoAnnotationError(typeOrFunc, params);
  }
}

function _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility,
                           depProps): Dependency {
  return new Dependency(Key.get(token), optional, lowerBoundVisibility, upperBoundVisibility,
                        depProps);
}
