import {Map, List, MapWrapper, ListWrapper} from 'facade/src/collection';
import {Binding, BindingBuilder, bind} from './binding';
import {ProviderError, NoProviderError, InvalidBindingError,
  AsyncBindingError, CyclicDependencyError, InstantiationError} from './exceptions';
import {FunctionWrapper, Type, isPresent, isBlank} from 'facade/src/lang';
import {Promise, PromiseWrapper} from 'facade/src/async';
import {Key} from './key';

var _constructing = new Object();

class _Waiting {
  promise:Promise;
  constructor(promise:Promise) {
    this.promise = promise;
  }
}
function _isWaiting(obj):boolean {
  return obj instanceof _Waiting;
}


export class Injector {
  _bindings:List;
  _instances:List;
  _parent:Injector;
  _defaultBindings:boolean;
  _asyncStrategy: _AsyncInjectorStrategy;
  _syncStrategy:_SyncInjectorStrategy;
  constructor(bindings:List, {parent=null, defaultBindings=false}={}) {
    var flatten = _flattenBindings(bindings, MapWrapper.create());
    this._bindings = this._createListOfBindings(flatten);
    this._instances = this._createInstances();
    this._parent = parent;
    this._defaultBindings = defaultBindings;

    this._asyncStrategy = new _AsyncInjectorStrategy(this);
    this._syncStrategy = new _SyncInjectorStrategy(this);
  }

  get(token) {
    return this._getByKey(Key.get(token), false, false);
  }

  asyncGet(token) {
    return this._getByKey(Key.get(token), true, false);
  }

  createChild(bindings:List):Injector {
    return new Injector(bindings, {parent: this});
  }


  _createListOfBindings(flattenBindings):List {
    var bindings = ListWrapper.createFixedSize(Key.numberOfKeys + 1);
    MapWrapper.forEach(flattenBindings, (v, keyId) => bindings[keyId] = v);
    return bindings;
  }

  _createInstances():List {
    return ListWrapper.createFixedSize(Key.numberOfKeys + 1);
  }

  _getByKey(key:Key, returnPromise:boolean, returnLazy:boolean) {
    if (returnLazy) {
      return () => this._getByKey(key, returnPromise, false);
    }

    var strategy = returnPromise ? this._asyncStrategy : this._syncStrategy;

    var instance = strategy.readFromCache(key);
    if (isPresent(instance)) return instance;

    instance = strategy.instantiate(key);
    if (isPresent(instance)) return instance;

    if (isPresent(this._parent)) {
      return this._parent._getByKey(key, returnPromise, returnLazy);
    }
    throw new NoProviderError(key);
  }

  _resolveDependencies(key:Key, binding:Binding, forceAsync:boolean):List {
    try {
      var getDependency = d => this._getByKey(d.key, forceAsync || d.asPromise, d.lazy);
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
      return bind(key.token).toClass(key.token);
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
      return null;
    }
  }

  instantiate(key:Key) {
    var binding = this.injector._getBinding(key);
    if (isBlank(binding)) return null;

    if (binding.providedAsPromise) throw new AsyncBindingError(key);

    //add a marker so we can detect cyclic dependencies
    this.injector._markAsConstructing(key);

    var deps = this.injector._resolveDependencies(key, binding, false);
    return this._createInstance(key, binding, deps);
  }

  _createInstance(key:Key, binding:Binding, deps:List) {
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
      return null;
    }
  }

  instantiate(key:Key) {
    var binding = this.injector._getBinding(key);
    if (isBlank(binding)) return null;

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

  _findOrCreate(key:Key, binding:Binding, deps:List) {
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


function _flattenBindings(bindings:List, res:Map) {
  ListWrapper.forEach(bindings, function (b) {
    if (b instanceof Binding) {
      MapWrapper.set(res, b.key.id, b);

    } else if (b instanceof Type) {
      var s = bind(b).toClass(b);
      MapWrapper.set(res, s.key.id, s);

    } else if (b instanceof List) {
      _flattenBindings(b, res);

    } else if (b instanceof BindingBuilder) {
      throw new InvalidBindingError(b.token);

    } else {
      throw new InvalidBindingError(b);
    }
  });
  return res;
}
