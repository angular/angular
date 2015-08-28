import {
  Type,
  isBlank,
  isPresent,
  CONST,
  CONST_EXPR,
  BaseException,
  stringify,
  isArray
} from 'angular2/src/core/facade/lang';
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
import {NoAnnotationError} from './exceptions';
import {resolveForwardRef} from './forward_ref';

/**
 * @private
 */
export class Dependency {
  constructor(public key: Key, public optional: boolean, public lowerBoundVisibility: any,
              public upperBoundVisibility: any, public properties: any[]) {}

  static fromKey(key: Key): Dependency { return new Dependency(key, false, null, null, []); }
}

const _EMPTY_LIST = CONST_EXPR([]);

/**
 * Describes how_ the {@link Injector} should instantiate a given token.
 *
 * See {@link bind}.
 *
 * ## Example
 *
 * ```javascript
 * var injector = Injector.resolveAndCreate([
 *   new Binding(String, { toValue: 'Hello' })
 * ]);
 *
 * expect(injector.get(String)).toEqual('Hello');
 * ```
 */
@CONST()
export class Binding {
  /**
   * Token used when retrieving this binding. Usually the `Type`.
   */
  token;

  /**
   * Binds an interface to an implementation / subclass.
   *
   * ## Example
   *
   * Becuse `toAlias` and `toClass` are often confused, the example contains both use cases for easy
   * comparison.
   *
   * ```javascript
   *
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
   * Binds a key to a value.
   *
   * ## Example
   *
   * ```javascript
   * var injector = Injector.resolveAndCreate([
   *   new Binding(String, { toValue: 'Hello' })
   * ]);
   *
   * expect(injector.get(String)).toEqual('Hello');
   * ```
   */
  toValue;

  /**
   * Binds a key to the alias for an existing key.
   *
   * An alias means that {@link Injector} returns the same instance as if the alias token was used.
   * This is in contrast to `toClass` where a separate instance of `toClass` is returned.
   *
   * ## Example
   *
   * Becuse `toAlias` and `toClass` are often confused the example contains both use cases for easy
   * comparison.
   *
   * ```javascript
   *
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
   * Binds a key to a function which computes the value.
   *
   * ## Example
   *
   * ```javascript
   * var injector = Injector.resolveAndCreate([
   *   new Binding(Number, { toFactory: () => { return 1+2; }}),
   *   new Binding(String, { toFactory: (value) => { return "Value: " + value; },
   *                         dependencies: [Number] })
   * ]);
   *
   * expect(injector.get(Number)).toEqual(3);
   * expect(injector.get(String)).toEqual('Value: 3');
   * ```
   */
  toFactory: Function;

  /**
   * Used in conjunction with `toFactory` and specifies a set of dependencies
   * (as `token`s) which should be injected into the factory function.
   *
   * ## Example
   *
   * ```javascript
   * var injector = Injector.resolveAndCreate([
   *   new Binding(Number, { toFactory: () => { return 1+2; }}),
   *   new Binding(String, { toFactory: (value) => { return "Value: " + value; },
   *                         dependencies: [Number] })
   * ]);
   *
   * expect(injector.get(Number)).toEqual(3);
   * expect(injector.get(String)).toEqual('Value: 3');
   * ```
   */
  dependencies: any[];

  constructor(
      token,
      {toClass, toValue, toAlias, toFactory, deps}:
          {toClass?: Type, toValue?: any, toAlias?: any, toFactory?: Function, deps?: any[]}) {
    this.token = token;
    this.toClass = toClass;
    this.toValue = toValue;
    this.toAlias = toAlias;
    this.toFactory = toFactory;
    this.dependencies = deps;
  }

  /**
   * Converts the {@link Binding} into {@link ResolvedBinding}.
   *
   * {@link Injector} internally only uses {@link ResolvedBinding}, {@link Binding} contains
   * convenience binding syntax.
   */
  resolve(): ResolvedBinding {
    var factoryFn: Function;
    var resolvedDeps;
    if (isPresent(this.toClass)) {
      var toClass = resolveForwardRef(this.toClass);
      factoryFn = reflector.factory(toClass);
      resolvedDeps = _dependenciesFor(toClass);
    } else if (isPresent(this.toAlias)) {
      factoryFn = (aliasInstance) => aliasInstance;
      resolvedDeps = [Dependency.fromKey(Key.get(this.toAlias))];
    } else if (isPresent(this.toFactory)) {
      factoryFn = this.toFactory;
      resolvedDeps = _constructDependencies(this.toFactory, this.dependencies);
    } else {
      factoryFn = () => this.toValue;
      resolvedDeps = _EMPTY_LIST;
    }

    return new ResolvedBinding(Key.get(this.token), factoryFn, resolvedDeps);
  }
}

/**
 * An internal resolved representation of a {@link Binding} used by the {@link Injector}.
 *
 * A {@link Binding} is resolved when it has a factory function. Binding to a class, alias, or
 * value, are just convenience methods, as {@link Injector} only operates on calling factory
 * functions.
 */
export class ResolvedBinding {
  constructor(
      /**
       * A key, usually a `Type`.
       */
      public key: Key,

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
 * Provides an API for imperatively constructing {@link Binding}s.
 *
 * This is only relevant for JavaScript. See {@link BindingBuilder}.
 *
 * ## Example
 *
 * ```javascript
 * bind(MyInterface).toClass(MyClass)
 *
 * ```
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
   * Binds an interface to an implementation / subclass.
   *
   * ## Example
   *
   * Because `toAlias` and `toClass` are often confused, the example contains both use cases for
   * easy comparison.
   *
   * ```javascript
   *
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
  toClass(type: Type): Binding { return new Binding(this.token, {toClass: type}); }

  /**
   * Binds a key to a value.
   *
   * ## Example
   *
   * ```javascript
   * var injector = Injector.resolveAndCreate([
   *   bind(String).toValue('Hello')
   * ]);
   *
   * expect(injector.get(String)).toEqual('Hello');
   * ```
   */
  toValue(value: any): Binding { return new Binding(this.token, {toValue: value}); }

  /**
   * Binds a key to the alias for an existing key.
   *
   * An alias means that we will return the same instance as if the alias token was used. (This is
   * in contrast to `toClass` where a separate instance of `toClass` will be returned.)
   *
   * ## Example
   *
   * Becuse `toAlias` and `toClass` are often confused, the example contains both use cases for easy
   * comparison.
   *
   * ```javascript
   *
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
   * Binds a key to a function which computes the value.
   *
   * ## Example
   *
   * ```javascript
   * var injector = Injector.resolveAndCreate([
   *   bind(Number).toFactory(() => { return 1+2; }),
   *   bind(String).toFactory((v) => { return "Value: " + v; }, [Number])
   * ]);
   *
   * expect(injector.get(Number)).toEqual(3);
   * expect(injector.get(String)).toEqual('Value: 3');
   * ```
   */
  toFactory(factoryFunction: Function, dependencies?: any[]): Binding {
    return new Binding(this.token, {toFactory: factoryFunction, deps: dependencies});
  }
}

function _constructDependencies(factoryFunction: Function, dependencies: any[]): Dependency[] {
  if (isBlank(dependencies)) {
    return _dependenciesFor(factoryFunction);
  } else {
    var params: any[][] = ListWrapper.map(dependencies, (t) => [t]);
    return ListWrapper.map(dependencies, (t) => _extractToken(factoryFunction, t, params));
  }
}

function _dependenciesFor(typeOrFunc): Dependency[] {
  var params = reflector.parameters(typeOrFunc);
  if (isBlank(params)) return [];
  if (ListWrapper.any(params, (p) => isBlank(p))) {
    throw new NoAnnotationError(typeOrFunc, params);
  }
  return ListWrapper.map(params, (p: any[]) => _extractToken(typeOrFunc, p, params));
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
