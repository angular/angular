import {Type} from 'facade/lang';
import {List, MapWrapper, ListWrapper} from 'facade/collection';
import {Reflector} from 'facade/di/reflector';
import {Key} from './key';

export class Binding {
  constructor(key:Key, factory:Function, dependencies:List, async) {
    this.key = key;
    this.factory = factory;
    this.dependencies = dependencies;
    this.async = async;
  }
}

export function bind(token):BindingBuilder {
  return new BindingBuilder(token);
}

export class BindingBuilder {
  constructor(token) {
    this.token = token;
    this.reflector = new Reflector();
  }

  toClass(type:Type):Binding {
    return new Binding(
      Key.get(this.token),
      this.reflector.factoryFor(type),
      this._wrapKeys(this.reflector.dependencies(type)),
      false
    );
  }

  toValue(value):Binding {
    return new Binding(
      Key.get(this.token),
      (_) => value,
      [],
      false
    );
  }

  toFactory(dependencies:List, factoryFunction:Function):Binding {
    return new Binding(
      Key.get(this.token),
      this.reflector.convertToFactory(factoryFunction),
      this._wrapKeys(dependencies),
      false
    );
  }

  toAsyncFactory(dependencies:List, factoryFunction:Function):Binding {
    return new Binding(
      Key.get(this.token),
      this.reflector.convertToFactory(factoryFunction),
      this._wrapKeys(dependencies),
      true
    );
  }

  _wrapKeys(deps:List) {
    return ListWrapper.map(deps, (t) => Key.get(t));
  }
}