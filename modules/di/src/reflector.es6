import {Type, isPresent} from 'facade/lang';
import {List} from 'facade/collection';
import {Inject, InjectFuture, InjectLazy} from './annotations';
import {Key} from './key';
import {Dependency} from './binding';
import {NoAnnotationError} from './exceptions';

class Reflector {
  factoryFor(type:Type):Function {
    return (args) => new type(...args);
  }

  convertToFactory(factoryFunction:Function):Function {
    return (args) => factoryFunction(...args);
  }

  dependencies(typeOrFunc):List {
    var p = typeOrFunc.parameters;
    if (p == undefined && typeOrFunc.length == 0) return [];
    if (p == undefined) throw new NoAnnotationError(typeOrFunc);
    return typeOrFunc.parameters.map((p) => this._extractToken(typeOrFunc, p));
  }

  _extractToken(typeOrFunc, annotations) {
    var type;

    for (var paramAnnotation of annotations) {
      if (paramAnnotation instanceof Type) {
        type = paramAnnotation;

      } else if (paramAnnotation instanceof Inject) {
        return this._createDependency(paramAnnotation.token, false, false);

      } else if (paramAnnotation instanceof InjectFuture) {
        return this._createDependency(paramAnnotation.token, true, false);

      } else if (paramAnnotation instanceof InjectLazy) {
        return this._createDependency(paramAnnotation.token, false, true);
      }
    }

    if (isPresent(type)) {
      return this._createDependency(type, false, false);
    } else {
      throw new NoAnnotationError(typeOrFunc);
    }
  }

  _createDependency(token, asFuture, lazy):Dependency {
    return new Dependency(Key.get(token), asFuture, lazy);
  }
}

export var reflector:Reflector = new Reflector();
