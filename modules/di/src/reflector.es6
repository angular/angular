import {Type, isPresent} from 'facade/lang';
import {List} from 'facade/collection';
import {Inject, InjectFuture, InjectLazy} from './annotations';
import {Dependency, Key} from './key';
import {NoAnnotationError} from './exceptions';

class Reflector {
  factoryFor(type:Type):Function {
    return (args) => new type(...args);
  }

  convertToFactory(factoryFunction:Function):Function {
    return (args) => factoryFunction(...args);
  }

  dependencies(type:Type):List {
    var p = type.parameters;
    if (p == undefined && type.length == 0) return [];
    if (p == undefined) throw new NoAnnotationError(type);
    return type.parameters.map((p) => this._extractToken(type, p));
  }

  _extractToken(constructedType:Type, annotations) {
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
      throw new NoAnnotationError(constructedType);
    }
  }

  _createDependency(token, asFuture, lazy):Dependency {
    return new Dependency(Key.get(token), asFuture, lazy);
  }
}

export var reflector:Reflector = new Reflector();