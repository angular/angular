library angular2.src.core.di.provider;

import "package:angular2/src/facade/lang.dart"
    show
        Type,
        isBlank,
        isPresent,
        stringify,
        isArray,
        isType,
        isFunction,
        normalizeBool;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/facade/collection.dart"
    show MapWrapper, ListWrapper;
import "package:angular2/src/core/reflection/reflection.dart" show reflector;
import "key.dart" show Key;
import "metadata.dart"
    show
        InjectMetadata,
        InjectableMetadata,
        OptionalMetadata,
        SelfMetadata,
        HostMetadata,
        SkipSelfMetadata,
        DependencyMetadata;
import "exceptions.dart"
    show
        NoAnnotationError,
        MixingMultiProvidersWithRegularProvidersError,
        InvalidProviderError;
import "forward_ref.dart" show resolveForwardRef;

class Dependency {
  Key key;
  bool optional;
  dynamic lowerBoundVisibility;
  dynamic upperBoundVisibility;
  List<dynamic> properties;
  Dependency(this.key, this.optional, this.lowerBoundVisibility,
      this.upperBoundVisibility, this.properties) {}
  static Dependency fromKey(Key key) {
    return new Dependency(key, false, null, null, []);
  }
}

const _EMPTY_LIST = const [];

/**
 * Describes how the [Injector] should instantiate a given token.
 *
 * See [provide].
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
class Provider {
  /**
   * Token used when retrieving this provider. Usually, it is a type [Type].
   */
  final token;
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
  final Type useClass;
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
  final useValue;
  /**
   * Binds a DI token to an existing token.
   *
   * [Injector] returns the same instance as if the provided token was used.
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
  final useExisting;
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
   * Used in conjuction with dependencies.
   */
  final Function useFactory;
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
  final List<Object> dependencies;
  /** @internal */
  final bool _multi;
  const Provider(token,
      {useClass, useValue, useExisting, useFactory, deps, multi})
      : token = token,
        useClass = useClass,
        useValue = useValue,
        useExisting = useExisting,
        useFactory = useFactory,
        dependencies = deps,
        _multi = multi;
  // TODO: Provide a full working example after alpha38 is released.

  /**
   * Creates multiple providers matching the same token (a multi-provider).
   *
   * Multi-providers are used for creating pluggable service, where the system comes
   * with some default providers, and the user can register additonal providers.
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
  bool get multi {
    return normalizeBool(this._multi);
  }
}

/**
 * @deprecated
 */
class Binding extends Provider {
  const Binding(token, {toClass, toValue, toAlias, toFactory, deps, multi})
      : super(token,
            useClass: toClass,
            useValue: toValue,
            useExisting: toAlias,
            useFactory: toFactory,
            deps: deps,
            multi: multi);
  /**
   * @deprecated
   */
  get toClass {
    return this.useClass;
  }

  /**
   * @deprecated
   */
  get toAlias {
    return this.useExisting;
  }

  /**
   * @deprecated
   */
  get toFactory {
    return this.useFactory;
  }

  /**
   * @deprecated
   */
  get toValue {
    return this.useValue;
  }
}

/**
 * An internal resolved representation of a [Provider] used by the [Injector].
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
abstract class ResolvedProvider {
  /**
   * A key, usually a `Type`.
   */
  Key key;
  /**
   * Factory function which can return an instance of an object represented by a key.
   */
  List<ResolvedFactory> resolvedFactories;
  /**
   * Indicates if the provider is a multi-provider or a regular provider.
   */
  bool multiProvider;
}

/**
 * @deprecated
 */
abstract class ResolvedBinding implements ResolvedProvider {}

class ResolvedProvider_ implements ResolvedBinding {
  Key key;
  List<ResolvedFactory> resolvedFactories;
  bool multiProvider;
  ResolvedProvider_(this.key, this.resolvedFactories, this.multiProvider) {}
  ResolvedFactory get resolvedFactory {
    return this.resolvedFactories[0];
  }
}

/**
 * An internal resolved representation of a factory function created by resolving [Provider].
 */
class ResolvedFactory {
  Function factory;
  List<Dependency> dependencies;
  ResolvedFactory(
      /**
       * Factory function which can return an instance of an object represented by a key.
       */
      this.factory,
      /**
       * Arguments (dependencies) to the `factory` function.
       */
      this.dependencies) {}
}

/**
 * @deprecated
 * Creates a [Provider].
 *
 * To construct a [Provider], bind a `token` to either a class, a value, a factory function,
 * or
 * to an existing `token`.
 * See [ProviderBuilder] for more details.
 *
 * The `token` is most commonly a class or [angular2/di/OpaqueToken].
 */
ProviderBuilder bind(token) {
  return new ProviderBuilder(token);
}

/**
 * Creates a [Provider].
 *
 * See [Provider] for more details.
 *
 * <!-- TODO: improve the docs -->
 */
Provider provide(token,
    {useClass, useValue, useExisting, useFactory, deps, multi}) {
  return new Provider(token,
      useClass: useClass,
      useValue: useValue,
      useExisting: useExisting,
      useFactory: useFactory,
      deps: deps,
      multi: multi);
}

/**
 * Helper class for the [bind] function.
 */
class ProviderBuilder {
  var token;
  ProviderBuilder(this.token) {}
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
  Provider toClass(Type type) {
    if (!isType(type)) {
      throw new BaseException(
          '''Trying to create a class provider but "${ stringify ( type )}" is not a class!''');
    }
    return new Provider(this.token, useClass: type);
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
  Provider toValue(dynamic value) {
    return new Provider(this.token, useValue: value);
  }

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
  Provider toAlias(dynamic aliasToken) {
    if (isBlank(aliasToken)) {
      throw new BaseException(
          '''Can not alias ${ stringify ( this . token )} to a blank value!''');
    }
    return new Provider(this.token, useExisting: aliasToken);
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
  Provider toFactory(Function factory, [List<dynamic> dependencies]) {
    if (!isFunction(factory)) {
      throw new BaseException(
          '''Trying to create a factory provider but "${ stringify ( factory )}" is not a function!''');
    }
    return new Provider(this.token, useFactory: factory, deps: dependencies);
  }
}

/**
 * Resolve a single provider.
 */
ResolvedFactory resolveFactory(Provider provider) {
  Function factoryFn;
  var resolvedDeps;
  if (isPresent(provider.useClass)) {
    var useClass = resolveForwardRef(provider.useClass);
    factoryFn = reflector.factory(useClass);
    resolvedDeps = _dependenciesFor(useClass);
  } else if (isPresent(provider.useExisting)) {
    factoryFn = (aliasInstance) => aliasInstance;
    resolvedDeps = [Dependency.fromKey(Key.get(provider.useExisting))];
  } else if (isPresent(provider.useFactory)) {
    factoryFn = provider.useFactory;
    resolvedDeps =
        _constructDependencies(provider.useFactory, provider.dependencies);
  } else {
    factoryFn = () => provider.useValue;
    resolvedDeps = _EMPTY_LIST;
  }
  return new ResolvedFactory(factoryFn, resolvedDeps);
}

/**
 * Converts the [Provider] into [ResolvedProvider].
 *
 * [Injector] internally only uses [ResolvedProvider], [Provider] contains
 * convenience provider syntax.
 */
ResolvedProvider resolveProvider(Provider provider) {
  return new ResolvedProvider_(
      Key.get(provider.token), [resolveFactory(provider)], false);
}

/**
 * Resolve a list of Providers.
 */
List<ResolvedProvider> resolveProviders(
    List<dynamic /* Type | Provider | List < dynamic > */ > providers) {
  var normalized = _createListOfProviders(_normalizeProviders(
      providers,
      new Map<num,
          dynamic /* _NormalizedProvider | List < _NormalizedProvider > */ >()));
  return normalized.map((b) {
    if (b is _NormalizedProvider) {
      return new ResolvedProvider_(b.key, [b.resolvedFactory], false);
    } else {
      var arr = (b as List<_NormalizedProvider>);
      return new ResolvedProvider_(
          arr[0].key, arr.map((_) => _.resolvedFactory).toList(), true);
    }
  }).toList();
}

/**
 * The algorithm works as follows:
 *
 * [Provider] -> [_NormalizedProvider|[_NormalizedProvider]] -> [ResolvedProvider]
 *
 * _NormalizedProvider is essentially a resolved provider before it was grouped by key.
 */
class _NormalizedProvider {
  Key key;
  ResolvedFactory resolvedFactory;
  _NormalizedProvider(this.key, this.resolvedFactory) {}
}

List<dynamic> _createListOfProviders(Map<num, dynamic> flattenedProviders) {
  return MapWrapper.values(flattenedProviders);
}

Map<num,
    dynamic /* _NormalizedProvider | List < _NormalizedProvider > */ > _normalizeProviders(
    List<
        dynamic /* Type | Provider | ProviderBuilder | List < dynamic > */ > providers,
    Map<num,
        dynamic /* _NormalizedProvider | List < _NormalizedProvider > */ > res) {
  providers.forEach((b) {
    if (b is Type) {
      _normalizeProvider(provide(b, useClass: b), res);
    } else if (b is Provider) {
      _normalizeProvider(b, res);
    } else if (b is List) {
      _normalizeProviders(b, res);
    } else if (b is ProviderBuilder) {
      throw new InvalidProviderError(b.token);
    } else {
      throw new InvalidProviderError(b);
    }
  });
  return res;
}

void _normalizeProvider(
    Provider b,
    Map<num,
        dynamic /* _NormalizedProvider | List < _NormalizedProvider > */ > res) {
  var key = Key.get(b.token);
  var factory = resolveFactory(b);
  var normalized = new _NormalizedProvider(key, factory);
  if (b.multi) {
    var existingProvider = res[key.id];
    if (existingProvider is List) {
      existingProvider.add(normalized);
    } else if (isBlank(existingProvider)) {
      res[key.id] = [normalized];
    } else {
      throw new MixingMultiProvidersWithRegularProvidersError(
          existingProvider, b);
    }
  } else {
    var existingProvider = res[key.id];
    if (existingProvider is List) {
      throw new MixingMultiProvidersWithRegularProvidersError(
          existingProvider, b);
    }
    res[key.id] = normalized;
  }
}

List<Dependency> _constructDependencies(
    Function factoryFunction, List<dynamic> dependencies) {
  if (isBlank(dependencies)) {
    return _dependenciesFor(factoryFunction);
  } else {
    List<List<dynamic>> params = dependencies.map((t) => [t]).toList();
    return dependencies
        .map((t) => _extractToken(factoryFunction, t, params))
        .toList();
  }
}

List<Dependency> _dependenciesFor(typeOrFunc) {
  var params = reflector.parameters(typeOrFunc);
  if (isBlank(params)) return [];
  if (params.any(isBlank)) {
    throw new NoAnnotationError(typeOrFunc, params);
  }
  return params
      .map((List<dynamic> p) => _extractToken(typeOrFunc, p, params))
      .toList();
}

Dependency _extractToken(typeOrFunc, metadata, List<List<dynamic>> params) {
  var depProps = [];
  var token = null;
  var optional = false;
  if (!isArray(metadata)) {
    if (metadata is InjectMetadata) {
      return _createDependency(metadata.token, optional, null, null, depProps);
    } else {
      return _createDependency(metadata, optional, null, null, depProps);
    }
  }
  var lowerBoundVisibility = null;
  var upperBoundVisibility = null;
  for (var i = 0; i < metadata.length; ++i) {
    var paramMetadata = metadata[i];
    if (paramMetadata is Type) {
      token = paramMetadata;
    } else if (paramMetadata is InjectMetadata) {
      token = paramMetadata.token;
    } else if (paramMetadata is OptionalMetadata) {
      optional = true;
    } else if (paramMetadata is SelfMetadata) {
      upperBoundVisibility = paramMetadata;
    } else if (paramMetadata is HostMetadata) {
      upperBoundVisibility = paramMetadata;
    } else if (paramMetadata is SkipSelfMetadata) {
      lowerBoundVisibility = paramMetadata;
    } else if (paramMetadata is DependencyMetadata) {
      if (isPresent(paramMetadata.token)) {
        token = paramMetadata.token;
      }
      depProps.add(paramMetadata);
    }
  }
  token = resolveForwardRef(token);
  if (isPresent(token)) {
    return _createDependency(
        token, optional, lowerBoundVisibility, upperBoundVisibility, depProps);
  } else {
    throw new NoAnnotationError(typeOrFunc, params);
  }
}

Dependency _createDependency(
    token, optional, lowerBoundVisibility, upperBoundVisibility, depProps) {
  return new Dependency(Key.get(token), optional, lowerBoundVisibility,
      upperBoundVisibility, depProps);
}
