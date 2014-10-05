import {Map, List, MapWrapper, ListWrapper} from 'facade/collection';
import {Binding, BindingBuilder, bind} from './binding';
import {ProviderError, NoProviderError, InvalidBindingError, AsyncBindingError} from './exceptions';
import {Type, isPresent, isBlank} from 'facade/lang';
import {Future, FutureWrapper} from 'facade/async';
import {Key} from './key';

export class Injector {
  constructor(bindings:List) {
    var flatten = _flattenBindings(bindings);
    this._bindings = this._createListOfBindings(flatten);
    this._instances = this._createInstances();
    this._parent = null; //TODO: vsavkin make a parameter
  }

  _createListOfBindings(flattenBindings):List {
    var bindings = ListWrapper.createFixedSize(Key.numberOfKeys() + 1);
    MapWrapper.forEach(flattenBindings, (keyId, v) => bindings[keyId] = v);
    return bindings;
  }

  _createInstances():List {
    return ListWrapper.createFixedSize(Key.numberOfKeys() + 1);
  }

  get(token) {
    return this.getByKey(Key.get(token));
  }

  asyncGet(token) {
    return this.asyncGetByKey(Key.get(token));
  }

  getByKey(key:Key) {
    return this._getByKey(key, false);
  }

  asyncGetByKey(key:Key) {
    return this._getByKey(key, true);
  }

  _getByKey(key:Key, returnFuture) {
    var keyId = key.id;
    if (key.token === Injector) return this._injector(returnFuture);

    var instance = this._get(this._instances, keyId);
    if (isPresent(instance)) return instance;

    var binding = this._get(this._bindings, keyId);
    if (isPresent(binding)) {
      return this._instantiate(key, binding, returnFuture);
    }
    if (isPresent(this._parent)) {
      return this._parent._getByKey(key, returnFuture);
    }

    throw new NoProviderError(key);
  }

  createChild(bindings:List):Injector {
    var inj = new Injector(bindings);
    inj._parent = this; //TODO: vsavkin: change it when optional parameters are working
    return inj;
  }

  _injector(returnFuture){
    return returnFuture ? FutureWrapper.value(this) : this;
  }

  _get(list:List, index){
    if (list.length <= index) return null;
    return ListWrapper.get(list, index);
  }

  _instantiate(key:Key, binding:Binding, returnFuture) {
    if (binding.providedAsFuture && !returnFuture) {
      throw new AsyncBindingError(key);
    }

    if (returnFuture) {
      return this._instantiateAsync(key, binding);
    } else {
      return this._instantiateSync(key, binding);
    }
  }

  _instantiateSync(key:Key, binding:Binding) {
    try {
      var deps = ListWrapper.map(binding.dependencies, d => this._getByKey(d.key, d.asFuture));
      var instance = binding.factory(deps);
      ListWrapper.set(this._instances, key.id, instance);
      return instance;
    } catch (e) {
      if (e instanceof ProviderError) e.addKey(key);
      throw e;
    }
  }

  _instantiateAsync(key:Key, binding:Binding):Future {
    var instances = this._createInstances();
    var futures = ListWrapper.map(binding.dependencies, d => this._getByKey(d.key, true));
    return FutureWrapper.wait(futures).
      then(binding.factory).
      catch(function(e) {
        console.log('sdfsdfsd', e)
        //e.addKey(key)
        //return e;
      }).
      then(function(instance) {
        ListWrapper.set(instances, key.id, instance);
        return instance
      });
  }
}

function _flattenBindings(bindings:List) {
  var res = {};
  ListWrapper.forEach(bindings, function (b){
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
