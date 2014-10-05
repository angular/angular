import {Type} from 'facade/lang';
import {List, MapWrapper, ListWrapper} from 'facade/collection';
import {Reflector} from './reflector';
import {Key, Dependency} from './key';

export class Binding {
  constructor(key:Key, factory:Function, dependencies:List, providedAsFuture) {
    this.key = key;
    this.factory = factory;
    this.dependencies = dependencies;
    this.providedAsFuture = providedAsFuture;
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
      this.reflector.dependencies(type),
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
      this._constructDependencies(dependencies),
      false
    );
  }

  toAsyncFactory(dependencies:List, factoryFunction:Function):Binding {
    return new Binding(
      Key.get(this.token),
      this.reflector.convertToFactory(factoryFunction),
      this._constructDependencies(dependencies),
      true
    );
  }

  _constructDependencies(deps:List) {
    return ListWrapper.map(deps, (t) => new Dependency(Key.get(t), false));
  }
}