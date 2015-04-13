import {Type, isBlank, isPresent, CONST} from 'angular2/src/facade/lang';
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

var _EMPTY_LIST = [];  // TODO: make const when supported

/**
 * Declaration of a dependency binding.
 */
export class Binding {
  token;
  toClass:Type;
  toValue;
  toAlias;
  toFactory:Function;
  toAsyncFactory:Function;
  dependencies:List;

  @CONST()
  constructor(
      token,
      {
        toClass,
        toValue,
        toAlias,
        toFactory,
        toAsyncFactory,
        deps
      }) {
    this.token = token;
    this.toClass = toClass;
    this.toValue = toValue;
    this.toAlias = toAlias;
    this.toFactory = toFactory;
    this.toAsyncFactory = toAsyncFactory;
    this.dependencies = deps;
  }

  resolve(): ResolvedBinding {
    var factoryFn:Function;
    var resolvedDeps;
    var isAsync = false;
    if (isPresent(this.toClass)) {
      factoryFn = reflector.factory(this.toClass);
      resolvedDeps = _dependenciesFor(this.toClass);
    } else if (isPresent(this.toAlias)) {
      factoryFn = (aliasInstance) => aliasInstance;
      resolvedDeps = [Dependency.fromKey(Key.get(this.toAlias))];
    } else if (isPresent(this.toFactory)) {
      factoryFn = this.toFactory;
      resolvedDeps = _constructDependencies(this.toFactory, this.dependencies);
    } else if (isPresent(this.toAsyncFactory)) {
      factoryFn = this.toAsyncFactory;
      resolvedDeps = _constructDependencies(this.toAsyncFactory, this.dependencies);
      isAsync = true;
    } else {
      factoryFn = () => this.toValue;
      resolvedDeps = _EMPTY_LIST;
    }

    return new ResolvedBinding(
      Key.get(this.token),
      factoryFn,
      resolvedDeps,
      isAsync
    );
  }
}

/// Dependency binding with resolved keys and dependencies.
export class ResolvedBinding {
  key:Key;
  factory:Function;
  dependencies:List<Dependency>;
  providedAsPromise:boolean;

  constructor(key:Key, factory:Function, dependencies:List<Dependency>, providedAsPromise:boolean) {
    this.key = key;
    this.factory = factory;
    this.dependencies = dependencies;
    this.providedAsPromise = providedAsPromise;
  }
}

/**
 * Provides fluent API for imperative construction of [Binding] objects.
 */
export function bind(token):BindingBuilder {
  return new BindingBuilder(token);
}

/**
 * Helper class for [bind] function.
 */
export class BindingBuilder {
  token;

  constructor(token) {
    this.token = token;
  }

  toClass(type:Type):Binding {
    return new Binding(this.token, {toClass: type});
  }

  toValue(value):Binding {
    return new Binding(this.token, {toValue: value});
  }

  toAlias(aliasToken):Binding {
    return new Binding(this.token, {toAlias: aliasToken});
  }

  toFactory(factoryFunction:Function, dependencies:List = null):Binding {
    return new Binding(this.token, {
      toFactory: factoryFunction,
      deps: dependencies
    });
  }

  toAsyncFactory(factoryFunction:Function, dependencies:List = null):Binding {
    return new Binding(this.token, {
      toAsyncFactory: factoryFunction,
      deps: dependencies
    });
  }
}

function _constructDependencies(factoryFunction:Function, dependencies:List) {
  return isBlank(dependencies) ?
    _dependenciesFor(factoryFunction) :
    ListWrapper.map(dependencies, (t) => Dependency.fromKey(Key.get(t)));
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
