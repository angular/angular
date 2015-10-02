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
} from 'angular2/src/core/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';
import {MapWrapper, ListWrapper} from 'angular2/src/core/facade/collection';
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
  MixingMultiBindingsWithRegularBindings,
  InvalidBindingError
} from './exceptions';
import {resolveForwardRef} from './forward_ref';

export class Dependency {
  constructor(public key: Key, public optional: boolean, public lowerBoundVisibility: any,
              public upperBoundVisibility: any, public properties: any[]) {}

  static fromKey(key: Key): Dependency { return new Dependency(key, false, null, null, []); }
}

const _EMPTY_LIST = CONST_EXPR([]);

/**
 * Describes how the {@link Injector} should instantiate a given token.
 *
 * See {@link bind}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/GNAyj6K6PfYg2NBzgwZ5?p%3Dpreview&p=preview))
 *
 * ```javascript
 * var injector = Injector.resolveAndCreate([
 *   new Binding("message", { toValue: 'Hello' })
 * ]);
 *
 * expect(injector.get("message")).toEqual('Hello');
 * ```
 */
@CONST()
export class Binding {
  /**
   * Token used when retrieving this binding. Usually, it is a type {@link `Type`}.
   */
  token;

  /**
   * Binds a DI token to an implementation class.
   *
   * ### Example ([live demo](http://plnkr.co/edit/RSTG86qgmoxCyj9SWPwY?p=preview))
   *
   * Because `toAlias` and `toClass` are often confused, the example contains both use cases for
   * easy
   * comparison.
   *
   * ```typescript
   * class Vehicle {}
   *
   * class Car extends Vehicle {}
   *
   * var injectorClass = Injector.resolveAndCreate([
   *   Car,
   *   new Binding(Vehicle, { toClass: Car })
   * ]);
   * var injectorAlias = Injector.resolveAndCreate([
   *   Car,
   *   new Binding(Vehicle, { toAlias: Car })
   * ]);
   *
   * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
   * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
   *
   * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
   * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
   * ```
   */
  toClass: Type;

  /**
   * Binds a DI token to a value.
   *
   * ### Example ([live demo](http://plnkr.co/edit/UFVsMVQIDe7l4waWziES?p=preview))
   *
   * ```javascript
   * var injector = Injector.resolveAndCreate([
   *   new Binding("message", { toValue: 'Hello' })
   * ]);
   *
   * expect(injector.get("message")).toEqual('Hello');
   * ```
   */
  toValue;

  /**
   * Binds a DI token as an alias for an existing token.
   *
   * An alias means that {@link Injector} returns the same instance as if the alias token was used.
   * This is in contrast to `toClass` where a separate instance of `toClass` is returned.
   *
   * ### Example ([live demo](http://plnkr.co/edit/QsatsOJJ6P8T2fMe9gr8?p=preview))
   *
   * Because `toAlias` and `toClass` are often confused the example contains both use cases for easy
   * comparison.
   *
   * ```typescript
   * class Vehicle {}
   *
   * class Car extends Vehicle {}
   *
   * var injectorAlias = Injector.resolveAndCreate([
   *   Car,
   *   new Binding(Vehicle, { toAlias: Car })
   * ]);
   * var injectorClass = Injector.resolveAndCreate([
   *   Car,
   *   new Binding(Vehicle, { toClass: Car })
   * ]);
   *
   * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
   * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
   *
   * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
   * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
   * ```
   */
  toAlias;

  /**
   * Binds a DI token to a function which computes the value.
   *
   * ### Example ([live demo](http://plnkr.co/edit/Scoxy0pJNqKGAPZY1VVC?p=preview))
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   new Binding(Number, { toFactory: () => { return 1+2; }}),
   *   new Binding(String, { toFactory: (value) => { return "Value: " + value; },
   *                       deps: [Number] })
   * ]);
   *
   * expect(injector.get(Number)).toEqual(3);
   * expect(injector.get(String)).toEqual('Value: 3');
   * ```
   *
   * Used in conjuction with dependencies.
   */
  toFactory: Function;

  /**
   * Specifies a set of dependencies
   * (as `token`s) which should be injected into the factory function.
   *
   * ### Example ([live demo](http://plnkr.co/edit/Scoxy0pJNqKGAPZY1VVC?p=preview))
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   new Binding(Number, { toFactory: () => { return 1+2; }}),
   *   new Binding(String, { toFactory: (value) => { return "Value: " + value; },
   *                       deps: [Number] })
   * ]);
   *
   * expect(injector.get(Number)).toEqual(3);
   * expect(injector.get(String)).toEqual('Value: 3');
   * ```
   *
   * Used in conjunction with `toFactory`.
   */
  dependencies: Object[];

  _multi: boolean;

  constructor(token, {toClass, toValue, toAlias, toFactory, deps, multi}: {
    toClass?: Type,
    toValue?: any,
    toAlias?: any,
    toFactory?: Function,
    deps?: Object[],
    multi?: boolean
  }) {
    this.token = token;
    this.toClass = toClass;
    this.toValue = toValue;
    this.toAlias = toAlias;
    this.toFactory = toFactory;
    this.dependencies = deps;
    this._multi = multi;
  }

  // TODO: Provide a full working example after alpha38 is released.
  /**
   * Creates multiple bindings matching the same token (a multi-binding).
   *
   * Multi-bindings are used for creating pluggable service, where the system comes
   * with some default bindings, and the user can register additonal bindings.
   * The combination of the default bindings and the additional bindings will be
   * used to drive the behavior of the system.
   *
   * ### Example
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   new Binding("Strings", { toValue: "String1", multi: true}),
   *   new Binding("Strings", { toValue: "String2", multi: true})
   * ]);
   *
   * expect(injector.get("Strings")).toEqual(["String1", "String2"]);
   * ```
   *
   * Multi-bindings and regular bindings cannot be mixed. The following
   * will throw an exception:
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   new Binding("Strings", { toValue: "String1", multi: true }),
   *   new Binding("Strings", { toValue: "String2"})
   * ]);
   * ```
   */
  get multi(): boolean { return normalizeBool(this._multi); }
}


/**
 * An internal resolved representation of a {@link Binding} used by the {@link Injector}.
 *
 * It is usually created automatically by `Injector.resolveAndCreate`.
 *
 * It can be created manually, as follows:
 *
 * ### Example ([live demo](http://plnkr.co/edit/RfEnhh8kUEI0G3qsnIeT?p%3Dpreview&p=preview))
 *
 * ```typescript
 * var resolvedBindings = Injector.resolve([new Binding('message', {toValue: 'Hello'})]);
 * var injector = Injector.fromResolvedBindings(resolvedBindings);
 *
 * expect(injector.get('message')).toEqual('Hello');
 * ```
 */
export interface ResolvedBinding {
  /**
   * A key, usually a `Type`.
   */
  key: Key;

  /**
   * Factory function which can return an instance of an object represented by a key.
   */
  resolvedFactories: ResolvedFactory[];

  /**
   * Indicates if the binding is a multi-binding or a regular binding.
   */
  multiBinding: boolean;
}

export class ResolvedBinding_ implements ResolvedBinding {
  constructor(public key: Key, public resolvedFactories: ResolvedFactory[],
              public multiBinding: boolean) {}

  get resolvedFactory(): ResolvedFactory { return this.resolvedFactories[0]; }
}

/**
 * An internal resolved representation of a factory function created by resolving {@link Binding}.
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
 * Creates a {@link Binding}.
 *
 * To construct a {@link Binding}, bind a `token` to either a class, a value, a factory function, or
 * to an alias to another `token`.
 * See {@link BindingBuilder} for more details.
 *
 * The `token` is most commonly a class or {@link angular2/di/OpaqueToken}.
 */
export function bind(token): BindingBuilder {
  return new BindingBuilder(token);
}

/**
 * Helper class for the {@link bind} function.
 */
export class BindingBuilder {
  constructor(public token) {}

  /**
   * Binds a DI token to a class.
   *
   * ### Example ([live demo](http://plnkr.co/edit/ZpBCSYqv6e2ud5KXLdxQ?p=preview))
   *
   * Because `toAlias` and `toClass` are often confused, the example contains both use cases for
   * easy comparison.
   *
   * ```typescript
   * class Vehicle {}
   *
   * class Car extends Vehicle {}
   *
   * var injectorClass = Injector.resolveAndCreate([
   *   Car,
   *   bind(Vehicle).toClass(Car)
   * ]);
   * var injectorAlias = Injector.resolveAndCreate([
   *   Car,
   *   bind(Vehicle).toAlias(Car)
   * ]);
   *
   * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
   * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
   *
   * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
   * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
   * ```
   */
  toClass(type: Type): Binding {
    if (!isType(type)) {
      throw new BaseException(
          `Trying to create a class binding but "${stringify(type)}" is not a class!`);
    }
    return new Binding(this.token, {toClass: type});
  }

  /**
   * Binds a DI token to a value.
   *
   * ### Example ([live demo](http://plnkr.co/edit/G024PFHmDL0cJFgfZK8O?p=preview))
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   bind('message').toValue('Hello')
   * ]);
   *
   * expect(injector.get('message')).toEqual('Hello');
   * ```
   */
  toValue(value: any): Binding { return new Binding(this.token, {toValue: value}); }

  /**
   * Binds a DI token as an alias for an existing token.
   *
   * An alias means that we will return the same instance as if the alias token was used. (This is
   * in contrast to `toClass` where a separate instance of `toClass` will be returned.)
   *
   * ### Example ([live demo](http://plnkr.co/edit/uBaoF2pN5cfc5AfZapNw?p=preview))
   *
   * Because `toAlias` and `toClass` are often confused, the example contains both use cases for
   * easy
   * comparison.
   *
   * ```typescript
   * class Vehicle {}
   *
   * class Car extends Vehicle {}
   *
   * var injectorAlias = Injector.resolveAndCreate([
   *   Car,
   *   bind(Vehicle).toAlias(Car)
   * ]);
   * var injectorClass = Injector.resolveAndCreate([
   *   Car,
   *   bind(Vehicle).toClass(Car)
   * ]);
   *
   * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
   * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
   *
   * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
   * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
   * ```
   */
  toAlias(aliasToken: /*Type*/ any): Binding {
    if (isBlank(aliasToken)) {
      throw new BaseException(`Can not alias ${stringify(this.token)} to a blank value!`);
    }
    return new Binding(this.token, {toAlias: aliasToken});
  }

  /**
   * Binds a DI token to a function which computes the value.
   *
   * ### Example ([live demo](http://plnkr.co/edit/OejNIfTT3zb1iBxaIYOb?p=preview))
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   bind(Number).toFactory(() => { return 1+2; }),
   *   bind(String).toFactory((v) => { return "Value: " + v; }, [Number])
   * ]);
   *
   * expect(injector.get(Number)).toEqual(3);
   * expect(injector.get(String)).toEqual('Value: 3');
   * ```
   */
  toFactory(factory: Function, dependencies?: any[]): Binding {
    if (!isFunction(factory)) {
      throw new BaseException(
          `Trying to create a factory binding but "${stringify(factory)}" is not a function!`);
    }
    return new Binding(this.token, {toFactory: factory, deps: dependencies});
  }
}

/**
 * Resolve a single binding.
 */
export function resolveFactory(binding: Binding): ResolvedFactory {
  var factoryFn: Function;
  var resolvedDeps;
  if (isPresent(binding.toClass)) {
    var toClass = resolveForwardRef(binding.toClass);
    factoryFn = reflector.factory(toClass);
    resolvedDeps = _dependenciesFor(toClass);
  } else if (isPresent(binding.toAlias)) {
    factoryFn = (aliasInstance) => aliasInstance;
    resolvedDeps = [Dependency.fromKey(Key.get(binding.toAlias))];
  } else if (isPresent(binding.toFactory)) {
    factoryFn = binding.toFactory;
    resolvedDeps = _constructDependencies(binding.toFactory, binding.dependencies);
  } else {
    factoryFn = () => binding.toValue;
    resolvedDeps = _EMPTY_LIST;
  }
  return new ResolvedFactory(factoryFn, resolvedDeps);
}

/**
 * Converts the {@link Binding} into {@link ResolvedBinding}.
 *
 * {@link Injector} internally only uses {@link ResolvedBinding}, {@link Binding} contains
 * convenience binding syntax.
 */
export function resolveBinding(binding: Binding): ResolvedBinding {
  return new ResolvedBinding_(Key.get(binding.token), [resolveFactory(binding)], false);
}

/**
 * Resolve a list of Bindings.
 */
export function resolveBindings(bindings: Array<Type | Binding | any[]>): ResolvedBinding[] {
  var normalized = _createListOfBindings(
      _normalizeBindings(bindings, new Map<number, _NormalizedBinding | _NormalizedBinding[]>()));
  return normalized.map(b => {
    if (b instanceof _NormalizedBinding) {
      return new ResolvedBinding_(b.key, [b.resolvedFactory], false);

    } else {
      var arr = <_NormalizedBinding[]>b;
      return new ResolvedBinding_(arr[0].key, arr.map(_ => _.resolvedFactory), true);
    }
  });
}

/**
 * The algorithm works as follows:
 *
 * [Binding] -> [_NormalizedBinding|[_NormalizedBinding]] -> [ResolvedBinding]
 *
 * _NormalizedBinding is essentially a resolved binding before it was grouped by key.
 */
class _NormalizedBinding {
  constructor(public key: Key, public resolvedFactory: ResolvedFactory) {}
}

function _createListOfBindings(flattenedBindings: Map<number, any>): any[] {
  return MapWrapper.values(flattenedBindings);
}

function _normalizeBindings(bindings: Array<Type | Binding | BindingBuilder | any[]>,
                            res: Map<number, _NormalizedBinding | _NormalizedBinding[]>):
    Map<number, _NormalizedBinding | _NormalizedBinding[]> {
  bindings.forEach(b => {
    if (b instanceof Type) {
      _normalizeBinding(bind(b).toClass(b), res);

    } else if (b instanceof Binding) {
      _normalizeBinding(b, res);

    } else if (b instanceof Array) {
      _normalizeBindings(b, res);

    } else if (b instanceof BindingBuilder) {
      throw new InvalidBindingError(b.token);

    } else {
      throw new InvalidBindingError(b);
    }
  });

  return res;
}

function _normalizeBinding(b: Binding, res: Map<number, _NormalizedBinding | _NormalizedBinding[]>):
    void {
  var key = Key.get(b.token);
  var factory = resolveFactory(b);
  var normalized = new _NormalizedBinding(key, factory);

  if (b.multi) {
    var existingBinding = res.get(key.id);

    if (existingBinding instanceof Array) {
      existingBinding.push(normalized);

    } else if (isBlank(existingBinding)) {
      res.set(key.id, [normalized]);

    } else {
      throw new MixingMultiBindingsWithRegularBindings(existingBinding, b);
    }

  } else {
    var existingBinding = res.get(key.id);

    if (existingBinding instanceof Array) {
      throw new MixingMultiBindingsWithRegularBindings(existingBinding, b);
    }

    res.set(key.id, normalized);
  }
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
  var params = reflector.parameters(typeOrFunc);
  if (isBlank(params)) return [];
  if (ListWrapper.any(params, (p) => isBlank(p))) {
    throw new NoAnnotationError(typeOrFunc, params);
  }
  return params.map((p: any[]) => _extractToken(typeOrFunc, p, params));
}

function _extractToken(typeOrFunc, metadata /*any[] | any*/, params: any[][]): Dependency {
  var depProps = [];
  var token = null;
  var optional = false;

  if (!isArray(metadata)) {
    return _createDependency(metadata, optional, null, null, depProps);
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

function _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps):
    Dependency {
  return new Dependency(Key.get(token), optional, lowerBoundVisibility, upperBoundVisibility,
                        depProps);
}
