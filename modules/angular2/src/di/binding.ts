import {Type, isBlank, isPresent, CONST, BaseException, stringify} from 'angular2/src/facade/lang';
import {List, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {reflector} from 'angular2/src/reflection/reflection';
import {Key} from './key';
import {
  Inject,
  InjectLazy,
  InjectPromise,
  Optional,
  DependencyAnnotation
} from './annotations_impl';
import {NoAnnotationError} from './exceptions';
import {resolveForwardRef} from './forward_ref';

/**
 * @private
 */
export class Dependency {
  constructor(public key: Key, public asPromise: boolean, public lazy: boolean,
              public optional: boolean, public properties: List<any>) {}

  static fromKey(key: Key) { return new Dependency(key, false, false, false, []); }
}

var _EMPTY_LIST = [];  // TODO: make const when supported

/**
 * Describes how the {@link Injector} should instantiate a given token.
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
 *
 * @exportedAs angular2/di
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
   * Binds a key to a function which computes the value asynchronously.
   *
   * ## Example
   *
   * ```javascript
   * var injector = Injector.resolveAndCreate([
   *   new Binding(Number, { toAsyncFactory: () => {
   *     return new Promise((resolve) => resolve(1 + 2));
   *   }}),
   *   new Binding(String, { toFactory: (value) => { return "Value: " + value; },
   *                         dependencies: [Number]})
   * ]);
   *
   * injector.asyncGet(Number).then((v) => expect(v).toBe(3));
   * injector.asyncGet(String).then((v) => expect(v).toBe('Value: 3'));
   * ```
   *
   * The interesting thing to note is that event though `Number` has an async factory, the `String`
   * factory function takes the resolved value. This shows that the {@link Injector} delays
   *executing the
   *`String` factory
   * until after the `Number` is resolved. This can only be done if the `token` is retrieved using
   * the `asyncGet` API in the {@link Injector}.
   *
   */
  toAsyncFactory: Function;

  /**
   * Used in conjunction with `toFactory` or `toAsyncFactory` and specifies a set of dependencies
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
  dependencies: List<any>;

  constructor(token, {toClass, toValue, toAlias, toFactory, toAsyncFactory, deps}: {
    toClass?: Type,
    toValue?: any,
    toAlias?: any,
    toFactory?: Function,
    toAsyncFactory?: Function,
    deps?: List<any>
  }) {
    this.token = token;
    this.toClass = toClass;
    this.toValue = toValue;
    this.toAlias = toAlias;
    this.toFactory = toFactory;
    this.toAsyncFactory = toAsyncFactory;
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
    var isAsync = false;
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
    } else if (isPresent(this.toAsyncFactory)) {
      factoryFn = this.toAsyncFactory;
      resolvedDeps = _constructDependencies(this.toAsyncFactory, this.dependencies);
      isAsync = true;
    } else {
      factoryFn = () => this.toValue;
      resolvedDeps = _EMPTY_LIST;
    }

    return new ResolvedBinding(Key.get(this.token), factoryFn, resolvedDeps, isAsync);
  }
}

/**
 * An internal resolved representation of a {@link Binding} used by the {@link Injector}.
 *
 * A {@link Binding} is resolved when it has a factory function. Binding to a class, alias, or
 * value, are just convenience methods, as {@link Injector} only operates on calling factory
 * functions.
 *
 * @exportedAs angular2/di
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
      public dependencies: List<Dependency>,

      /**
       * Specifies whether the `factory` function returns a `Promise`.
       */
      public providedAsPromise: boolean) {}
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
 *
 * @exportedAs angular2/di
 */
export function bind(token): BindingBuilder {
  return new BindingBuilder(token);
}

/**
 * Helper class for the {@link bind} function.
 *
 * @exportedAs angular2/di
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
  toValue(value): Binding { return new Binding(this.token, {toValue: value}); }

  /**
   * Binds a key to the alias for an existing key.
   *
   * An alias means that we will return the same instance as if the alias token was used. (This is
   * in contrast to `toClass` where a separet instance of `toClass` will be returned.)
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
  toAlias(aliasToken): Binding {
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
  toFactory(factoryFunction: Function, dependencies?: List<any>): Binding {
    return new Binding(this.token, {toFactory: factoryFunction, deps: dependencies});
  }

  /**
   * Binds a key to a function which computes the value asynchronously.
   *
   * ## Example
   *
   * ```javascript
   * var injector = Injector.resolveAndCreate([
   *   bind(Number).toAsyncFactory(() => {
   *     return new Promise((resolve) => resolve(1 + 2));
   *   }),
   *   bind(String).toFactory((v) => { return "Value: " + v; }, [Number])
   * ]);
   *
   * injector.asyncGet(Number).then((v) => expect(v).toBe(3));
   * injector.asyncGet(String).then((v) => expect(v).toBe('Value: 3'));
   * ```
   *
   * The interesting thing to note is that event though `Number` has an async factory, the `String`
   * factory function takes the resolved value. This shows that the {@link Injector} delays
   * executing of the `String` factory
   * until after the `Number` is resolved. This can only be done if the `token` is retrieved using
   * the `asyncGet` API in the {@link Injector}.
   */
  toAsyncFactory(factoryFunction: Function, dependencies?: List<any>): Binding {
    return new Binding(this.token, {toAsyncFactory: factoryFunction, deps: dependencies});
  }
}

function _constructDependencies(factoryFunction: Function,
                                dependencies: List<any>): List<Dependency> {
  if (isBlank(dependencies)) {
    return _dependenciesFor(factoryFunction);
  } else {
    var params: List<List<any>> = ListWrapper.map(dependencies, (t) => [t]);
    return ListWrapper.map(dependencies, (t) => _extractToken(factoryFunction, t, params));
  }
}

function _dependenciesFor(typeOrFunc): List<Dependency> {
  var params = reflector.parameters(typeOrFunc);
  if (isBlank(params)) return [];
  if (ListWrapper.any(params, (p) => isBlank(p))) {
    throw new NoAnnotationError(typeOrFunc, params);
  }
  return ListWrapper.map(params, (p: List<any>) => _extractToken(typeOrFunc, p, params));
}

function _extractToken(typeOrFunc, annotations /*List<any> | any*/,
                       params: List<List<any>>): Dependency {
  var depProps = [];
  var token = null;
  var optional = false;
  var lazy = false;
  var asPromise = false;

  if (!ListWrapper.isList(annotations)) {
    return _createDependency(annotations, asPromise, lazy, optional, depProps);
  }

  for (var i = 0; i < annotations.length; ++i) {
    var paramAnnotation = annotations[i];

    if (paramAnnotation instanceof Type) {
      token = paramAnnotation;

    } else if (paramAnnotation instanceof Inject) {
      token = paramAnnotation.token;

    } else if (paramAnnotation instanceof InjectPromise) {
      token = paramAnnotation.token;
      asPromise = true;

    } else if (paramAnnotation instanceof InjectLazy) {
      token = paramAnnotation.token;
      lazy = true;

    } else if (paramAnnotation instanceof Optional) {
      optional = true;

    } else if (paramAnnotation instanceof DependencyAnnotation) {
      if (isPresent(paramAnnotation.token)) {
        token = paramAnnotation.token;
      }
      ListWrapper.push(depProps, paramAnnotation);
    }
  }

  token = resolveForwardRef(token);

  if (isPresent(token)) {
    return _createDependency(token, asPromise, lazy, optional, depProps);
  } else {
    throw new NoAnnotationError(typeOrFunc, params);
  }
}

function _createDependency(token, asPromise, lazy, optional, depProps): Dependency {
  return new Dependency(Key.get(token), asPromise, lazy, optional, depProps);
}
