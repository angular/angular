import {Map, List, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {ResolvedBinding, Binding, BindingBuilder, bind} from './binding';
import {ProviderError, NoProviderError, AsyncBindingError, CyclicDependencyError,
  InstantiationError, InvalidBindingError} from './exceptions';
import {FunctionWrapper, Type, isPresent, isBlank} from 'angular2/src/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {Key} from './key';

var _constructing = new Object();
var _notFound = new Object();

class _Waiting {
  promise:Promise;
  constructor(promise:Promise) {
    this.promise = promise;
  }
}
function _isWaiting(obj):boolean {
  return obj instanceof _Waiting;
}


/**
 * A dependency injection container used for resolving dependencies.
 *
 * An `Injector` is a replacement for a `new` operator, which can automatically resolve the constructor dependencies.
 * In typical use, application code asks for the dependencies in the constructor and they are resolved by the
 * `Injector`.
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
 * 	constructor(@Inject(Engine) engine) {
 * 	}
 * }
 *
 * ```
 * 
 * Next we need to write the code that creates and instantiates the `Injector`. We then ask for the `root` object, 
 * `Car`, so that the `Injector` can recursively build all of that object's dependencies. 
 *
 * ```javascript
 * main() {
 *   var injector = Injector.resolveAndCreate([Car, Engine]);
 *
 *   // Get a reference to the `root` object, which will recursively instantiate the tree.
 *   var car = injector.get(Car);
 * }
 * ```
 * Notice that we don't use the `new` operator because we explicitly want to have the `Injector` resolve all of the 
 * object's dependencies automatically.
 *
 * @exportedAs angular2/di
 */
export class Injector {
  _bindings:List;
  _instances:List;
  _parent:Injector;
  _defaultBindings:boolean;
  _asyncStrategy: _AsyncInjectorStrategy;
  _syncStrategy:_SyncInjectorStrategy;

  /**
   * Turns a list of binding definitions into internal resolved list of resolved bindings.
   *
   * A resolution is a process of flattening multiple nested lists and converting individual bindings into a 
   * list of [ResolvedBinding]s. The resolution can be cached for performance sensitive code.
   * 
   * @param [bindings] can be a list of [Type], [Binding], [ResolvedBinding], or a recursive list of more bindings.
   *
   * The returned list is sparse, indexed by [Key.id]. It is generally not useful to application code other than for
   * passing it to [Injector] functions that require resolved binding lists, such as [fromResolvedBindings] and
   * [createChildFromResolved].
   */
  static resolve(bindings:List/*<ResolvedBinding|Binding|Type|List>*/):List<ResolvedBinding> {
    var resolvedBindings = _resolveBindings(bindings);
    var flatten = _flattenBindings(resolvedBindings, MapWrapper.create());
    return _createListOfBindings(flatten);
  }

  /**
   * Resolves bindings and creates an injector based on those bindings. This function is slower than the
   * corresponding [fromResolvedBindings] because it needs to resolve bindings first. See [Injector.resolve].
   * 
   * Prefer [fromResolvedBindings] in performance-critical code that creates lots of injectors.
   *
   * @param [bindings] can be a list of [Type], [Binding], [ResolvedBinding], or a recursive list of more bindings.
   * @param [defaultBindings] Setting to true will auto-create bindings.
   */
  static resolveAndCreate(bindings:List/*<ResolvedBinding|Binding|Type|List>*/, {defaultBindings=false}={}) {
    return new Injector(Injector.resolve(bindings), null, defaultBindings);
  }

  /**
   * Creates an injector from previously resolved bindings. This bypasses resolution and flattening. This API is
   * recommended way to construct injectors in performance-sensitive parts.
   *
   * @param [bindings] A sparse list of [ResolvedBinding]s. See [Injector.resolve].
   * @param [defaultBindings] Setting to true will auto-create bindings.
   */
  static fromResolvedBindings(bindings:List<ResolvedBinding>, {defaultBindings=false}={}) {
    return new Injector(bindings, null, defaultBindings);
  }

  /**
   * @param [bindings] A sparse list of [ResolvedBinding]s. See [Injector.resolve].
   * @param [parent] Parent Injector or `null` if root injector.
   * @param [defaultBindings] Setting to true will auto-create bindings. (Only use with root injector.)
   */
  constructor(bindings:List<ResolvedBinding>, parent:Injector, defaultBindings:boolean) {
    this._bindings = bindings;
    this._instances = this._createInstances();
    this._parent = parent;
    this._defaultBindings = defaultBindings;
    this._asyncStrategy = new _AsyncInjectorStrategy(this);
    this._syncStrategy = new _SyncInjectorStrategy(this);
  }

  /**
   * Used to retrieve an instance from the injector. 
   * 
   * @param [token] usually the [Type] of object. (Same as token used while setting up a binding).
   * @returns an instance represented by the token. Throws if not found.
   */
  get(token) {
    
    return this._getByKey(Key.get(token), false, false, false);
  }


  /**
   * Used to retrieve an instance from the injector. 
   * 
   * @param [token] usually the [Type] of object. (Same as token used while setting up a binding).
   * @returns an instance represented by the token. Returns `null` if not found.
   */
  getOptional(token) {
    return this._getByKey(Key.get(token), false, false, true);
  }

  /**
   * Used to retrieve an instance from the injector asynchronously. Used with asynchronous bindings. 
   * 
   * @param [token] usually the [Type] of object. (Same as token used while setting up a binding).
   * @returns a [Promise] which resolves to the instance represented by the token.
   */
  asyncGet(token):Promise {
    return this._getByKey(Key.get(token), true, false, false);
  }

  /**
   * Create a child injector and load a new set of bindings into it. 
   * 
   * A resolution is a process of flattening multiple nested and converting individual bindings into a 
   * list of [ResolvedBinding]s. The resolution can be cached [Injector.resolve] for performance sensitive
   * code.
   * 
   * See: [Injector.resolve].
   * 
   * @param [bindings] can be a list of [Type], [Binding], [ResolvedBinding], or a recursive list of more bindings.
   * @returns a new child `Injector`.
   */
  resolveAndCreateChild(bindings:List/*<ResolvedBinding|Binding|Type|List>*/):Injector {
    return new Injector(Injector.resolve(bindings), this, false);
  }

  /**
   * Create a child injector and load a new set of [ResolvedBinding] into it. 
   * 
   * @param [bindings] A sparse list of [ResolvedBinding]s. See [Injector.resolve].
   * @returns a new child `Injector`.
   */
  createChildFromResolved(bindings:List<ResolvedBinding>):Injector {
    return new Injector(bindings, this, false);
  }

  _createInstances():List {
    return ListWrapper.createFixedSize(Key.numberOfKeys + 1);
  }

  _getByKey(key:Key, returnPromise:boolean, returnLazy:boolean, optional:boolean) {
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
      throw new NoProviderError(key);
    }
  }

  _resolveDependencies(key:Key, binding:ResolvedBinding, forceAsync:boolean):List {
    try {
      var getDependency = d => this._getByKey(d.key, forceAsync || d.asPromise, d.lazy, d.optional);
      return ListWrapper.map(binding.dependencies, getDependency);
    } catch (e) {
      this._clear(key);
      if (e instanceof ProviderError) e.addKey(key);
      throw e;
    }
  }

  _getInstance(key:Key) {
    if (this._instances.length <= key.id) return null;
    return ListWrapper.get(this._instances, key.id);
  }

  _setInstance(key:Key, obj) {
    ListWrapper.set(this._instances, key.id, obj);
  }

  _getBinding(key:Key) {
    var binding = this._bindings.length <= key.id ?
      null :
      ListWrapper.get(this._bindings, key.id);

    if (isBlank(binding) && this._defaultBindings) {
      return bind(key.token).toClass(key.token).resolve();
    } else {
      return binding;
    }
  }

  _markAsConstructing(key:Key) {
    this._setInstance(key, _constructing);
  }

  _clear(key:Key) {
    this._setInstance(key, null);
  }
}


class _SyncInjectorStrategy {
  injector:Injector;
  constructor(injector:Injector) {
    this.injector = injector;
  }

  readFromCache(key:Key) {
    if (key.token === Injector) {
      return this.injector;
    }

    var instance = this.injector._getInstance(key);

    if (instance === _constructing) {
      throw new CyclicDependencyError(key);
    } else if (isPresent(instance) && !_isWaiting(instance)) {
      return instance;
    } else {
      return _notFound;
    }
  }

  instantiate(key:Key) {
    var binding = this.injector._getBinding(key);
    if (isBlank(binding)) return _notFound;

    if (binding.providedAsPromise) throw new AsyncBindingError(key);

    //add a marker so we can detect cyclic dependencies
    this.injector._markAsConstructing(key);

    var deps = this.injector._resolveDependencies(key, binding, false);
    return this._createInstance(key, binding, deps);
  }

  _createInstance(key:Key, binding:ResolvedBinding, deps:List) {
    try {
      var instance = FunctionWrapper.apply(binding.factory, deps);
      this.injector._setInstance(key, instance);
      return instance;
    } catch (e) {
      this.injector._clear(key);
      throw new InstantiationError(e, key);
    }
  }
}


class _AsyncInjectorStrategy {
  injector:Injector;
  constructor(injector:Injector) {
    this.injector = injector;
  }

  readFromCache(key:Key) {
    if (key.token === Injector) {
      return PromiseWrapper.resolve(this.injector);
    }

    var instance = this.injector._getInstance(key);

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

  instantiate(key:Key) {
    var binding = this.injector._getBinding(key);
    if (isBlank(binding)) return _notFound;

    //add a marker so we can detect cyclic dependencies
    this.injector._markAsConstructing(key);

    var deps = this.injector._resolveDependencies(key, binding, true);
    var depsPromise = PromiseWrapper.all(deps);

    var promise = PromiseWrapper
      .then(depsPromise, null, (e) => this._errorHandler(key, e))
      .then(deps => this._findOrCreate(key, binding, deps))
      .then(instance => this._cacheInstance(key, instance));

    this.injector._setInstance(key, new _Waiting(promise));
    return promise;
  }

  _errorHandler(key:Key, e):Promise {
    if (e instanceof ProviderError) e.addKey(key);
    return PromiseWrapper.reject(e);
  }

  _findOrCreate(key:Key, binding:ResolvedBinding, deps:List) {
    try {
      var instance = this.injector._getInstance(key);
      if (!_isWaiting(instance)) return instance;
      return FunctionWrapper.apply(binding.factory, deps);
    } catch (e) {
      this.injector._clear(key);
      throw new InstantiationError(e, key);
    }
  }

  _cacheInstance(key, instance) {
    this.injector._setInstance(key, instance);
    return instance
  }
}

function _resolveBindings(bindings:List): List {
  var resolvedList = ListWrapper.createFixedSize(bindings.length);
  for (var i = 0; i < bindings.length; i++) {
    var unresolved = bindings[i];
    var resolved;
    if (unresolved instanceof ResolvedBinding) {
      resolved = unresolved;  // ha-ha! I'm easily amused
    } else if (unresolved instanceof Type) {
      resolved = bind(unresolved).toClass(unresolved).resolve();
    } else if (unresolved instanceof Binding) {
      resolved = unresolved.resolve();
    } else if (unresolved instanceof List) {
      resolved = _resolveBindings(unresolved);
    } else if (unresolved instanceof BindingBuilder) {
      throw new InvalidBindingError(unresolved.token);
    } else {
      throw new InvalidBindingError(unresolved);
    }
    resolvedList[i] = resolved;
  }
  return resolvedList;
}

function _createListOfBindings(flattenedBindings):List {
  var bindings = ListWrapper.createFixedSize(Key.numberOfKeys + 1);
  MapWrapper.forEach(flattenedBindings, (v, keyId) => bindings[keyId] = v);
  return bindings;
}

function _flattenBindings(bindings:List, res:Map) {
  ListWrapper.forEach(bindings, function (b) {
    if (b instanceof ResolvedBinding) {
      MapWrapper.set(res, b.key.id, b);
    } else if (b instanceof List) {
      _flattenBindings(b, res);
    }
  });
  return res;
}
