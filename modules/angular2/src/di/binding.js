import {Type, isBlank, isPresent, CONST} from 'angular2/src/facade/lang';
import {List, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {reflector} from 'angular2/src/reflection/reflection';
import {Key} from './key';
import {Inject, InjectLazy, InjectPromise, Optional, DependencyAnnotation} from './annotations';
import {NoAnnotationError} from './exceptions';

/**
 * @private
 */
export class Dependency {
  key:Key;
  asPromise:boolean;
  lazy:boolean;
  optional:boolean;
  properties:List;

  constructor(key:Key, asPromise:boolean, lazy:boolean, optional:boolean, properties:List) {
    this.key = key;
    this.asPromise = asPromise;
    this.lazy = lazy;
    this.optional = optional;
    this.properties = properties;
  }

  static fromKey(key:Key) {
    return new Dependency(key, false, false, false, []);
  }
}

var _EMPTY_LIST = [];  // TODO: make const when supported

/**
 * Describes how the [Injector] should instantiate a given token.
 *
 * See [bind].
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
export class Binding {

  /**
   * Token used when retriving this binding. Usually the [Type].
   */
  token;

  /**
   * Bind an interface to an implementation / subclass.
   *
   * ## Example
   *
   * Becuse `toAlias` and `toClass` are often confused the example contains both use cases for easy comparison.
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
  toClass:Type;

  /**
   * Bind a key to a value.
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
   * Bind a key to an alias of an existing key.
   *
   * An alias means that we will return the same instance as if the alias token was used. (This is in contrast to
   * `toClass` where a separet instance of `toClass` will be returned.)
   *
   * ## Example
   *
   * Becuse `toAlias` and `toClass` are often confused the example contains both use cases for easy comparison.
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

   * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
   * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
   * ```
   */
  toAlias;

  /**
   * Bind a key to a function which computes the value.
   *
   * ## Example
   *
   * ```javascript
   * var injector = Injector.resolveAndCreate([
   *   new Binding(Number, { toFactory: () => { return 1+2; }}),
   *   new Binding(String, { toFactory: (value) => { return "Value: " + value; },
   *                         dependencies: [String] })
   * ]);
   *
   * expect(injector.get(Number)).toEqual(3);
   * expect(injector.get(String)).toEqual('Value: 3');
   * ```
   */
  toFactory:Function;

  /**
   * Bind a key to a function which computes the value asynchronously.
   *
   * ## Example
   *
   * ```javascript
   * var injector = Injector.resolveAndCreate([
   *   new Binding(Number, { toAsyncFactory: () => {
   *     return new Promise((resolve) => resolve(1 + 2));
   *   }}),
   *   new Binding(String, { toFactory: (value) => { return "Value: " + value; },
   *                         dependencies: [String]})
   * ]);
   *
   * injector.asyncGet(Number).then((v) => expect(v).toBe(3));
   * injector.asyncGet(String).then((v) => expect(v).toBe('Value: 3'));
   * ```
   *
   * The interesting thing to note is that event thougt `Numeber` has an async factory, the `String` factory
   * function takes the resolved value. This shows that the [Injector] delays executing of the `String` factory
   * until after the `Number` is resolved. This can only be done if the `token` is retrive
   */
  toAsyncFactory:Function;

  /**
   * Used in conjunction with `toFactory` or `toAsyncFactory` and specifies the `token`s which should be injected
   * into the factory function.
   *
   * ## Example
   *
   * ```javascript
   * var injector = Injector.resolveAndCreate([
   *   new Binding(Number, { toFactory: () => { return 1+2; }}),
   *   new Binding(String, { toFactory: (value) => { return "Value: " + value; },
   *                         dependencies: [String] })
   * ]);
   *
   * expect(injector.get(Number)).toEqual(3);
   * expect(injector.get(String)).toEqual('Value: 3');
   * ```
   */
  dependencies:List;

  @CONST()
  constructor(
      token,
      {
        toClass,
        toValue,
        toAlias,
        toFactory,
        toAsyncFactory,
        deps
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
   * 
   */
  resolve(): ResolvedBinding {
    var factoryFn:Function;
    var resolvedDeps;
    var isAsync = false;
    if (isPresent(this.toClass)) {
      factoryFn = reflector.factory(this.toClass);
      resolvedDeps = _dependenciesFor(this.toClass);
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

    return new ResolvedBinding(
      Key.get(this.token),
      factoryFn,
      resolvedDeps,
      isAsync
    );
  }
}

/**
 * An internal resolved representaion of a [Binding] used by [Injector].
 * 
 * A [Binding] is resolved when it has a factory fonction. Binding to a class, alias, or value, are just convenience
 * methods, as [Injector] only operates on calling factory functions. 
 */
export class ResolvedBinding {
  /**
   * A key, usually a [Type].
   */
  key:Key;
  
  /**
   * Factory function which can return an instance of [key].
   */
  factory:Function;
  
  /**
   * Arguments (dependencies) to the [factory] function.
   */
  dependencies:List<Dependency>;
  
  /**
   * Specifies if the [factory] function returns an [Promise]
   */
  providedAsPromise:boolean;

  constructor(key:Key, factory:Function, dependencies:List<Dependency>, providedAsPromise:boolean) {
    this.key = key;
    this.factory = factory;
    this.dependencies = dependencies;
    this.providedAsPromise = providedAsPromise;
  }
}

/**
 * Provides fluent API for imperative construction of [Binding] objects. (JavaScript only.)
 *
 * @exportedAs angular2/di
 */
export function bind(token):BindingBuilder {
  return new BindingBuilder(token);
}

/**
 * Helper class for [bind] function.
 * @exportedAs angular2/di
 */
export class BindingBuilder {
  token;

  constructor(token) {
    this.token = token;
  }

  /**
   * Bind an interface to an implementation / subclass.
   *
   * ## Example
   *
   * Becuse `toAlias` and `toClass` are often confused the example contains both use cases for easy comparison.
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
  toClass(type:Type):Binding {
    return new Binding(this.token, {toClass: type});
  }

  /**
   * Bind a key to a value.
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
  toValue(value):Binding {
    return new Binding(this.token, {toValue: value});
  }

  /**
   * Bind a key to an alias of an existing key.
   *
   * An alias means that we will return the same instance as if the alias token was used. (This is in contrast to
   * `toClass` where a separet instance of `toClass` will be returned.)
   *
   * ## Example
   *
   * Becuse `toAlias` and `toClass` are often confused the example contains both use cases for easy comparison.
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

   * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
   * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
   * ```
   */
  toAlias(aliasToken):Binding {
    return new Binding(this.token, {toAlias: aliasToken});
  }

  /**
   * Bind a key to a function which computes the value.
   *
   * ## Example
   *
   * ```javascript
   * var injector = Injector.resolveAndCreate([
   *   bind(Number).toFactory(() => { return 1+2; }}),
   *   bind(String).toFactory((v) => { return "Value: " + v; }, [String] })
   * ]);
   *
   * expect(injector.get(Number)).toEqual(3);
   * expect(injector.get(String)).toEqual('Value: 3');
   * ```
   */
  toFactory(factoryFunction:Function, dependencies:List = null):Binding {
    return new Binding(this.token, {
      toFactory: factoryFunction,
      deps: dependencies
    });
  }

  /**
   * Bind a key to a function which computes the value asynchronously.
   *
   * ## Example
   *
   * ```javascript
   * var injector = Injector.resolveAndCreate([
   *   bind(Number).toAsyncFactory(() => {
   *     return new Promise((resolve) => resolve(1 + 2));
   *   }),
   *   bind(String).toFactory((v) => { return "Value: " + v; }, [String])
   * ]);
   *
   * injector.asyncGet(Number).then((v) => expect(v).toBe(3));
   * injector.asyncGet(String).then((v) => expect(v).toBe('Value: 3'));
   * ```
   *
   * The interesting thing to note is that event thougt `Numeber` has an async factory, the `String` factory
   * function takes the resolved value. This shows that the [Injector] delays executing of the `String` factory
   * until after the `Number` is resolved. This can only be done if the `token` is retrive
   */
  toAsyncFactory(factoryFunction:Function, dependencies:List = null):Binding {
    return new Binding(this.token, {
      toAsyncFactory: factoryFunction,
      deps: dependencies
    });
  }
}

function _constructDependencies(factoryFunction:Function, dependencies:List) {
  return isBlank(dependencies) ?
    _dependenciesFor(factoryFunction) :
    ListWrapper.map(dependencies, (t) => Dependency.fromKey(Key.get(t)));
}

function _dependenciesFor(typeOrFunc):List {
  var params = reflector.parameters(typeOrFunc);
  if (isBlank(params)) return [];
  if (ListWrapper.any(params, (p) => isBlank(p))) throw new NoAnnotationError(typeOrFunc);
  return ListWrapper.map(params, (p) => _extractToken(typeOrFunc, p));
}

function _extractToken(typeOrFunc, annotations) {
  var depProps = [];
  var token = null;
  var optional = false;
  var lazy = false;
  var asPromise = false;

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

  if (isPresent(token)) {
    return _createDependency(token, asPromise, lazy, optional, depProps);
  } else {
    throw new NoAnnotationError(typeOrFunc);
  }
}

function _createDependency(token, asPromise, lazy, optional, depProps):Dependency {
  return new Dependency(Key.get(token), asPromise, lazy, optional, depProps);
}
