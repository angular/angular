import {FIELD, Type, isBlank, isPresent} from 'angular2/src/facade/lang';
import {List, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {reflector} from 'angular2/src/reflection/reflection';
import {Key} from './key';
import {Inject, InjectLazy, InjectPromise, DependencyAnnotation} from './annotations';
import {NoAnnotationError} from './exceptions';

export class Dependency {
  key:Key;
  asPromise:boolean;
  lazy:boolean;
  properties:List;
  constructor(key:Key, asPromise:boolean, lazy:boolean, properties:List) {
    this.key = key;
    this.asPromise = asPromise;
    this.lazy = lazy;
    this.properties = properties;
  }
}

export class Binding {
  key:Key;
  factory:Function;
  dependencies:List;
  providedAsPromise:boolean;

  constructor(key:Key, factory:Function, dependencies:List, providedAsPromise:boolean) {
    this.key = key;
    this.factory = factory;
    this.dependencies = dependencies;
    this.providedAsPromise = providedAsPromise;
  }
}

export function bind(token):BindingBuilder {
  return new BindingBuilder(token);
}

export class BindingBuilder {
  token;
  constructor(token) {
    this.token = token;
  }

  toClass(type:Type):Binding {
    return new Binding(
      Key.get(this.token),
      reflector.factory(type),
      _dependenciesFor(type),
      false
    );
  }

  toValue(value):Binding {
    return new Binding(
      Key.get(this.token),
      () => value,
      [],
      false
    );
  }

  toFactory(factoryFunction:Function, dependencies:List = null):Binding {
    return new Binding(
      Key.get(this.token),
      factoryFunction,
      this._constructDependencies(factoryFunction, dependencies),
      false
    );
  }

  toAsyncFactory(factoryFunction:Function, dependencies:List = null):Binding {
    return new Binding(
      Key.get(this.token),
      factoryFunction,
      this._constructDependencies(factoryFunction, dependencies),
      true
    );
  }

  _constructDependencies(factoryFunction:Function, dependencies:List) {
    return isBlank(dependencies) ?
      _dependenciesFor(factoryFunction) :
      ListWrapper.map(dependencies, (t) => new Dependency(Key.get(t), false, false, []));
  }
}

function _dependenciesFor(typeOrFunc):List {
  var params = reflector.parameters(typeOrFunc);
  if (isBlank(params)) return [];
  if (ListWrapper.any(params, (p) => isBlank(p))) throw new NoAnnotationError(typeOrFunc);
  return ListWrapper.map(params, (p) => _extractToken(typeOrFunc, p));
}

function _extractToken(typeOrFunc, annotations) {
  var type;
  var depProps = [];

  for (var i = 0; i < annotations.length; ++i) {
    var paramAnnotation = annotations[i];

    if (paramAnnotation instanceof Type) {
      type = paramAnnotation;

    } else if (paramAnnotation instanceof Inject) {
      return _createDependency(paramAnnotation.token, false, false, []);

    } else if (paramAnnotation instanceof InjectPromise) {
      return _createDependency(paramAnnotation.token, true, false, []);

    } else if (paramAnnotation instanceof InjectLazy) {
      return _createDependency(paramAnnotation.token, false, true, []);

    } else if (paramAnnotation instanceof DependencyAnnotation) {
      ListWrapper.push(depProps, paramAnnotation);
    }
  }

  if (isPresent(type)) {
    return _createDependency(type, false, false, depProps);
  } else {
    throw new NoAnnotationError(typeOrFunc);
  }
}

function _createDependency(token, asPromise, lazy, depProps):Dependency {
  return new Dependency(Key.get(token), asPromise, lazy, depProps);
}
