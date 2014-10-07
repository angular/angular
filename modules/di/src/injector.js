import {Map, List, MapWrapper, ListWrapper} from 'facade/collection';
import {Binding, BindingBuilder, bind} from './binding';
import {ProviderError, NoProviderError, InvalidBindingError,
  AsyncBindingError, CyclicDependencyError, InstantiationError} from './exceptions';
import {Type, isPresent, isBlank, bool} from 'facade/lang';
import {Future, FutureWrapper} from 'facade/async';
import {Key} from './key';

var _constructing = new Object();

class _Waiting {
  constructor(future:Future) {
    this.future = future;
  }
}
function _isWaiting(obj):bool {
  return obj instanceof _Waiting;
}


export class Injector {
  constructor(bindings:List) {
    var flatten = _flattenBindings(bindings);
    this._bindings = this._createListOfBindings(flatten);
    this._instances = this._createInstances();
    this._parent = null; //TODO: vsavkin make a parameter

    this._asyncStrategy = new _AsyncInjectorStrategy(this);
    this._syncStrategy = new _SyncInjectorStrategy(this);
  }

  get(token) {
    return this.getByKey(Key.get(token));
  }

  asyncGet(token) {
    return this.asyncGetByKey(Key.get(token));
  }

  getByKey(key:Key) {
    return this._getByKey(key, false, false);
  }

  asyncGetByKey(key:Key) {
    return this._getByKey(key, true, false);
  }

  createChild(bindings:List):Injector {
    var inj = new Injector(bindings);
    inj._parent = this; //TODO: vsavkin: change it when optional parameters are working
    return inj;
  }


  _createListOfBindings(flattenBindings):List {
    var bindings = ListWrapper.createFixedSize(Key.numberOfKeys() + 1);
    MapWrapper.forEach(flattenBindings, (keyId, v) => bindings[keyId] = v);
    return bindings;
  }

  _createInstances():List {
    return ListWrapper.createFixedSize(Key.numberOfKeys() + 1);
  }

  _getByKey(key:Key, returnFuture:bool, returnLazy:bool) {
    if (returnLazy) {
      return () => this._getByKey(key, returnFuture, false);
    }

    var strategy = returnFuture ? this._asyncStrategy : this._syncStrategy;

    var instance = strategy.readFromCache(key);
    if (isPresent(instance)) return instance;

    instance = strategy.instantiate(key);
    if (isPresent(instance)) return instance;

    if (isPresent(this._parent)) {
      return this._parent._getByKey(key, returnFuture, returnLazy);
    }
    throw new NoProviderError(key);
  }

  _getInstance(key:Key) {
    if (this._instances.length <= key.id) return null;
    return ListWrapper.get(this._instances, key.id);
  }

  _setInstance(key:Key, obj) {
    ListWrapper.set(this._instances, key.id, obj);
  }

  _getBinding(key:Key) {
    if (this._bindings.length <= key.id) return null;
    return ListWrapper.get(this._bindings, key.id);
  }
}


class _SyncInjectorStrategy {
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

    if (binding.providedAsFuture) throw new AsyncBindingError(key);

    //add a marker so we can detect cyclic dependencies
    this.injector._setInstance(key, _constructing);

    var deps = this._resolveDependencies(key, binding);
    return this._createInstance(key, binding, deps);
  }

  _resolveDependencies(key:Key, binding:Binding) {
    try {
      var getDependency = d => this.injector._getByKey(d.key, d.asFuture, d.lazy);
      return ListWrapper.map(binding.dependencies, getDependency);
    } catch (e) {
      this.injector._setInstance(key, null);
      if (e instanceof ProviderError) e.addKey(key);
      throw e;
    }
  }

  _createInstance(key:Key, binding:Binding, deps:List) {
    try {
      var instance = binding.factory(deps);
      this.injector._setInstance(key, instance);
      return instance;
    } catch (e) {
      throw new InstantiationError(e, key);
    }
  }
}


class _AsyncInjectorStrategy {
  constructor(injector:Injector) {
    this.injector = injector;
  }

  readFromCache(key:Key) {
    if (key.token === Injector) {
      return FutureWrapper.value(this.injector);
    }

    var instance = this.injector._getInstance(key);

    if (instance === _constructing) {
      throw new CyclicDependencyError(key);
    } else if (_isWaiting(instance)) {
      return instance.future;
    } else if (isPresent(instance)) {
      return FutureWrapper.value(instance);
    } else {
      return null;
    }
  }

  instantiate(key:Key) {
    var binding = this.injector._getBinding(key);
    if (isBlank(binding)) return null;

    //add a marker so we can detect cyclic dependencies
    this.injector._setInstance(key, _constructing);

    var deps = this._resolveDependencies(key, binding);
    var depsFuture = FutureWrapper.wait(deps);

    var future = FutureWrapper.catchError(depsFuture, (e) => this._errorHandler(key, e)).
      then(deps => this._findOrCreate(key, binding, deps)).
      then(instance => this._cacheInstance(key, instance));

    this.injector._setInstance(key, new _Waiting(future));
    return future;
  }

  _resolveDependencies(key:Key, binding:Binding):List {
    try {
      var getDependency = d => this.injector._getByKey(d.key, true, d.lazy);
      return ListWrapper.map(binding.dependencies, getDependency);
    } catch (e) {
      this.injector._setInstance(key, null);
      if (e instanceof ProviderError) e.addKey(key);
      throw e;
    }
  }

  _errorHandler(key:Key, e):Future {
    if (e instanceof ProviderError) e.addKey(key);
    return FutureWrapper.error(e);
  }

  _findOrCreate(key:Key, binding:Binding, deps:List) {
    try {
      var instance = this.injector._getInstance(key);
      if (!_isWaiting(instance)) return instance;
      return binding.factory(deps);
    } catch (e) {
      throw new InstantiationError(e, key);
    }
  }

  _cacheInstance(key, instance) {
    this.injector._setInstance(key, instance);
    return instance
  }
}


function _flattenBindings(bindings:List) {
  var res = {};
  ListWrapper.forEach(bindings, function (b) {
    if (b instanceof Binding) {
      MapWrapper.set(res, b.key.id, b);

    } else if (b instanceof Type) {
      var s = bind(b).toClass(b);
      MapWrapper.set(res, s.key.id, s);

    } else if (b instanceof BindingBuilder) {
      throw new InvalidBindingError(b.token);

    } else {
      throw new InvalidBindingError(b);
    }
  });
  return res;
}
