import {Type, isBlank, isPresent} from 'angular2/src/facade/lang';
import {List, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {reflector} from 'angular2/src/reflection/reflection';
import {Key} from './key';
import {Inject, InjectLazy, InjectPromise, Optional, DependencyAnnotation} from './annotations';
import {NoAnnotationError} from './exceptions';

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

  toAlias(aliasToken):Binding {
    return new Binding(
      Key.get(this.token),
      (aliasInstance) => aliasInstance,
      [Dependency.fromKey(Key.get(aliasToken))],
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
      ListWrapper.map(dependencies, (t) => Dependency.fromKey(Key.get(t)));
  }
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
