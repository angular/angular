import {FIELD, Type, isBlank} from 'facade/lang';
import {List, MapWrapper, ListWrapper} from 'facade/collection';
import {reflector} from './reflector';
import {Key} from './key';

export class Dependency {
  @FIELD('final key:Key')
  @FIELD('final asFuture:bool')
  @FIELD('final lazy:bool')
  constructor(key:Key, asFuture:boolean, lazy:boolean) {
    this.key = key;
    this.asFuture = asFuture;
    this.lazy = lazy;
  }
}

export class Binding {
  constructor(key:Key, factory:Function, dependencies:List, providedAsFuture:boolean) {
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
  }

  toClass(type:Type):Binding {
    return new Binding(
      Key.get(this.token),
      reflector.factoryFor(type),
      reflector.dependencies(type),
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

  toFactory(factoryFunction:Function, dependencies:List = null):Binding {
    return new Binding(
      Key.get(this.token),
      reflector.convertToFactory(factoryFunction),
      this._constructDependencies(factoryFunction, dependencies),
      false
    );
  }

  toAsyncFactory(factoryFunction:Function, dependencies:List = null):Binding {
    return new Binding(
      Key.get(this.token),
      reflector.convertToFactory(factoryFunction),
      this._constructDependencies(factoryFunction, dependencies),
      true
    );
  }

  _constructDependencies(factoryFunction:Function, dependencies:List) {
    return isBlank(dependencies) ?
      reflector.dependencies(factoryFunction) :
      ListWrapper.map(dependencies, (t) => new Dependency(Key.get(t), false, false));
  }
}
