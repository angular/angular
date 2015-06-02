/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />

import {Map, List, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {ResolvedBinding, Binding, BindingBuilder, bind} from './binding';
import {
  AbstractBindingError,
  NoBindingError,
  AsyncBindingError,
  CyclicDependencyError,
  InstantiationError,
  InvalidBindingError
} from './exceptions';
import {FunctionWrapper, Type, isPresent, isBlank, CONST_EXPR} from 'angular2/src/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {Key} from './key';
import {resolveForwardRef} from './forward_ref';

const _constructing = CONST_EXPR(new Object());
const _notFound = CONST_EXPR(new Object());

class _Waiting {
  constructor(public promise: Promise<any>) {}
}

function _isWaiting(obj): boolean {
  return obj instanceof _Waiting;
}

/**
 * A dependency injection container used for resolving dependencies.
 *
 * An `Injector` is a replacement for a `new` operator, which can automatically resolve the
 * constructor dependencies.
 * In typical use, application code asks for the dependencies in the constructor and they are
 * resolved by the `Injector`.
 *
 * ## Example:
 *
 * Suppose that we want to inject an `Engine` into class `Car`, we would define it like this:
 *
 * ```javascript
 * class Engine {
 * }
 *
 * class Car {
 *   constructor(@Inject(Engine) engine) {
 *   }
 * }
 *
 * ```
 *
 * Next we need to write the code that creates and instantiates the `Injector`. We then ask for the
 * `root` object, `Car`, so that the `Injector` can recursively build all of that object's
 *dependencies.
 *
 * ```javascript
 * main() {
 *   var injector = Injector.resolveAndCreate([Car, Engine]);
 *
 *   // Get a reference to the `root` object, which will recursively instantiate the tree.
 *   var car = injector.get(Car);
 * }
 * ```
 * Notice that we don't use the `new` operator because we explicitly want to have the `Injector`
 * resolve all of the object's dependencies automatically.
 *
 * @exportedAs angular2/di
 */
export class Injector {
  private _instances: List<any>;
  private _asyncStrategy: _AsyncInjectorStrategy;
  private _syncStrategy: _SyncInjectorStrategy;

  /**
   * Turns a list of binding definitions into an internal resolved list of resolved bindings.
   *
   * A resolution is a process of flattening multiple nested lists and converting individual
   * bindings into a list of {@link ResolvedBinding}s. The resolution can be cached by `resolve`
   * for the {@link Injector} for performance-sensitive code.
   *
   * @param `bindings` can be a list of `Type`, {@link Binding}, {@link ResolvedBinding}, or a
   * recursive list of more bindings.
   *
   * The returned list is sparse, indexed by `id` for the {@link Key}. It is generally not useful to
   *application code
   * other than for passing it to {@link Injector} functions that require resolved binding lists,
   *such as
   * `fromResolvedBindings` and `createChildFromResolved`.
   */
  static resolve(bindings: List<Type | Binding | List<any>>): List<ResolvedBinding> {
    var resolvedBindings = resolveBindings(bindings);
    var flatten = _flattenBindings(resolvedBindings, MapWrapper.create());
    return _createListOfBindings(flatten);
  }

  /**
   * Resolves bindings and creates an injector based on those bindings. This function is slower than
   * the corresponding `fromResolvedBindings` because it needs to resolve bindings first. See
   *`resolve`
   * for the {@link Injector}.
   *
   * Prefer `fromResolvedBindings` in performance-critical code that creates lots of injectors.
   *
   * @param `bindings` can be a list of `Type`, {@link Binding}, {@link ResolvedBinding}, or a
   *recursive list of more
   * bindings.
   * @param `defaultBindings` Setting to true will auto-create bindings.
   */
  static resolveAndCreate(bindings: List<Type | Binding | List<any>>,
                          {defaultBindings = false}: any = {}): Injector {
    return new Injector(Injector.resolve(bindings), null, defaultBindings);
  }

  /**
   * Creates an injector from previously resolved bindings. This bypasses resolution and flattening.
   * This API is the recommended way to construct injectors in performance-sensitive parts.
   *
   * @param `bindings` A sparse list of {@link ResolvedBinding}s. See `resolve` for the
   * {@link Injector}.
   * @param `defaultBindings` Setting to true will auto-create bindings.
   */
  static fromResolvedBindings(bindings: List<ResolvedBinding>,
                              {defaultBindings = false}: any = {}): Injector {
    return new Injector(bindings, null, defaultBindings);
  }

  /**
   * @param `bindings` A sparse list of {@link ResolvedBinding}s. See `resolve` for the
   * {@link Injector}.
   * @param `parent` Parent Injector or `null` if root Injector.
   * @param `defaultBindings` Setting to true will auto-create bindings. (Only use with root
   * injector.)
   */
  constructor(private _bindings: List<ResolvedBinding>, private _parent: Injector,
              private _defaultBindings: boolean) {
    this._instances = this._createInstances();
    this._asyncStrategy = new _AsyncInjectorStrategy(this);
    this._syncStrategy = new _SyncInjectorStrategy(this);
  }

  /**
   * Direct parent of this injector.
   */
  get parent(): Injector { return this._parent; }

  /**
   * Retrieves an instance from the injector.
   *
   * @param `token`: usually the `Type` of an object. (Same as the token used while setting up a
   *binding).
   * @returns an instance represented by the token. Throws if not found.
   */
  get(token) { return this._getByKey(Key.get(token), false, false, false); }


  /**
   * Retrieves an instance from the injector.
   *
   * @param `token`: usually a `Type`. (Same as the token used while setting up a binding).
   * @returns an instance represented by the token. Returns `null` if not found.
   */
  getOptional(token) { return this._getByKey(Key.get(token), false, false, true); }

  /**
   * Retrieves an instance from the injector asynchronously. Used with asynchronous bindings.
   *
   * @param `token`: usually a `Type`. (Same as token used while setting up a binding).
   * @returns a `Promise` which resolves to the instance represented by the token.
   */
  asyncGet(token): Promise<any> { return this._getByKey(Key.get(token), true, false, false); }

  /**
   * Creates a child injector and loads a new set of bindings into it.
   *
   * A resolution is a process of flattening multiple nested lists and converting individual
   * bindings into a list of {@link ResolvedBinding}s. The resolution can be cached by `resolve`
   * for the {@link Injector} for performance-sensitive code.
   *
   * @param `bindings` can be a list of `Type`, {@link Binding}, {@link ResolvedBinding}, or a
   * recursive list of more bindings.
   *
   */
  resolveAndCreateChild(bindings: List<Type | Binding | List<any>>): Injector {
    return new Injector(Injector.resolve(bindings), this, false);
  }

  /**
   * Creates a child injector and loads a new set of {@link ResolvedBinding}s into it.
   *
   * @param `bindings`: A sparse list of {@link ResolvedBinding}s.
   * See `resolve` for the {@link Injector}.
   * @returns a new child {@link Injector}.
   */
  createChildFromResolved(bindings: List<ResolvedBinding>): Injector {
    return new Injector(bindings, this, false);
  }

  _createInstances(): List<any> { return ListWrapper.createFixedSize(Key.numberOfKeys + 1); }

  _getByKey(key: Key, returnPromise: boolean, returnLazy: boolean, optional: boolean) {
    if (returnLazy) {
      return () => this._getByKey(key, returnPromise, false, optional);
    }

    var strategy = returnPromise ? this._asyncStrategy : this._syncStrategy;

    var instance = strategy.readFromCache(key);
    if (instance !== _notFound) return instance;

    instance = strategy.instantiate(key);
    if (instance !== _notFound) return instance;

    if (isPresent(this._parent)) {
      return this._parent._getByKey(key, returnPromise, returnLazy, optional);
    }

    if (optional) {
      return null;
    } else {
      throw new NoBindingError(key);
    }
  }

  _resolveDependencies(key: Key, binding: ResolvedBinding, forceAsync: boolean): List<any> {
    try {
      var getDependency = d => this._getByKey(d.key, forceAsync || d.asPromise, d.lazy, d.optional);
      return ListWrapper.map(binding.dependencies, getDependency);
    } catch (e) {
      this._clear(key);
      if (e instanceof AbstractBindingError) e.addKey(key);
      throw e;
    }
  }

  _getInstance(key: Key) {
    if (this._instances.length <= key.id) return null;
    return ListWrapper.get(this._instances, key.id);
  }

  _setInstance(key: Key, obj): void { ListWrapper.set(this._instances, key.id, obj); }

  _getBinding(key: Key) {
    var binding = this._bindings.length <= key.id ? null : ListWrapper.get(this._bindings, key.id);

    if (isBlank(binding) && this._defaultBindings) {
      var token: any = key.token;
      return bind(key.token).toClass(token).resolve();
    } else {
      return binding;
    }
  }

  _markAsConstructing(key: Key): void { this._setInstance(key, _constructing); }

  _clear(key: Key): void { this._setInstance(key, null); }
}

interface _InjectorStrategy {
  readFromCache(key: Key);
  instantiate(key: Key);
}

class _SyncInjectorStrategy implements _InjectorStrategy {
  constructor(private _injector: Injector) {}

  readFromCache(key: Key) {
    if (key.token === Injector) {
      return this._injector;
    }

    var instance = this._injector._getInstance(key);

    if (instance === _constructing) {
      throw new CyclicDependencyError(key);
    } else if (isPresent(instance) && !_isWaiting(instance)) {
      return instance;
    } else {
      return _notFound;
    }
  }

  instantiate(key: Key) {
    var binding = this._injector._getBinding(key);
    if (isBlank(binding)) return _notFound;

    if (binding.providedAsPromise) throw new AsyncBindingError(key);

    // add a marker so we can detect cyclic dependencies
    this._injector._markAsConstructing(key);

    var deps = this._injector._resolveDependencies(key, binding, false);
    return this._createInstance(key, binding, deps);
  }

  _createInstance(key: Key, binding: ResolvedBinding, deps: List<any>) {
    try {
      var instance = FunctionWrapper.apply(binding.factory, deps);
      this._injector._setInstance(key, instance);
      return instance;
    } catch (e) {
      this._injector._clear(key);
      throw new InstantiationError(e, key);
    }
  }
}

class _AsyncInjectorStrategy implements _InjectorStrategy {
  constructor(private _injector: Injector) {}

  readFromCache(key: Key) {
    if (key.token === Injector) {
      return PromiseWrapper.resolve(this._injector);
    }

    var instance = this._injector._getInstance(key);

    if (instance === _constructing) {
      throw new CyclicDependencyError(key);
    } else if (_isWaiting(instance)) {
      return instance.promise;
    } else if (isPresent(instance)) {
      return PromiseWrapper.resolve(instance);
    } else {
      return _notFound;
    }
  }

  instantiate(key: Key) /* Promise?? */ {
    var binding = this._injector._getBinding(key);
    if (isBlank(binding)) return _notFound;

    // add a marker so we can detect cyclic dependencies
    this._injector._markAsConstructing(key);

    var deps = this._injector._resolveDependencies(key, binding, true);
    var depsPromise = PromiseWrapper.all(deps);

    var promise = PromiseWrapper.then(depsPromise, null, (e, s) => this._errorHandler(key, e, s))
                      .then(deps => this._findOrCreate(key, binding, deps))
                      .then(instance => this._cacheInstance(key, instance));

    this._injector._setInstance(key, new _Waiting(promise));
    return promise;
  }

  _errorHandler(key: Key, e, stack): Promise<any> {
    if (e instanceof AbstractBindingError) e.addKey(key);
    return PromiseWrapper.reject(e, stack);
  }

  _findOrCreate(key: Key, binding: ResolvedBinding, deps: List<any>) {
    try {
      var instance = this._injector._getInstance(key);
      if (!_isWaiting(instance)) return instance;
      return FunctionWrapper.apply(binding.factory, deps);
    } catch (e) {
      this._injector._clear(key);
      throw new InstantiationError(e, key);
    }
  }

  _cacheInstance(key, instance) {
    this._injector._setInstance(key, instance);
    return instance
  }
}

export function resolveBindings(bindings: List<Type | Binding | List<any>>): List<ResolvedBinding> {
  var resolvedList = ListWrapper.createFixedSize(bindings.length);
  for (var i = 0; i < bindings.length; i++) {
    var unresolved = resolveForwardRef(bindings[i]);
    var resolved;
    if (unresolved instanceof ResolvedBinding) {
      resolved = unresolved;  // ha-ha! I'm easily amused
    } else if (unresolved instanceof Type) {
      resolved = bind(unresolved).toClass(unresolved).resolve();
    } else if (unresolved instanceof Binding) {
      resolved = unresolved.resolve();
    } else if (unresolved instanceof List) {
      resolved = resolveBindings(unresolved);
    } else if (unresolved instanceof BindingBuilder) {
      throw new InvalidBindingError(unresolved.token);
    } else {
      throw new InvalidBindingError(unresolved);
    }
    resolvedList[i] = resolved;
  }
  return resolvedList;
}

function flattenBindings(bindings: List<ResolvedBinding>): List<ResolvedBinding> {
  var map = _flattenBindings(bindings, MapWrapper.create());
  var res = ListWrapper.create();
  MapWrapper.forEach(map, (binding, keyId) => ListWrapper.push(res, binding));
  return res;
}

function _createListOfBindings(
    flattenedBindings: Map<number, ResolvedBinding>): List<ResolvedBinding> {
  var bindings = ListWrapper.createFixedSize(Key.numberOfKeys + 1);
  MapWrapper.forEach(flattenedBindings, (v, keyId) => bindings[keyId] = v);
  return bindings;
}

function _flattenBindings(bindings: List<ResolvedBinding | List<any>>,
                          res: Map<number, ResolvedBinding>): Map<number, ResolvedBinding> {
  ListWrapper.forEach(bindings, function(b) {
    if (b instanceof ResolvedBinding) {
      MapWrapper.set(res, b.key.id, b);
    } else if (b instanceof List) {
      _flattenBindings(b, res);
    }
  });
  return res;
}
