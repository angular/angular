import {Type, isPresent} from 'facade/lang';
import {List} from 'facade/collection';
import {Inject, InjectPromise, InjectLazy, DependencyAnnotation} from './annotations';
import {Key} from './key';
import {Dependency} from './binding';
import {NoAnnotationError} from './exceptions';

class Reflector {
  factoryFor(type:Type):Function {
    var length = type.parameters ? type.parameters.length : 0;
    switch (length) {
      case 0: return () =>
        new type();
      case 1: return (a1) =>
        new type(a1);
      case 2: return (a1, a2) =>
        new type(a1, a2);
      case 3: return (a1, a2, a3) =>
        new type(a1, a2, a3);
      case 4: return (a1, a2, a3, a4) =>
        new type(a1, a2, a3, a4);
      case 5: return (a1, a2, a3, a4, a5) =>
        new type(a1, a2, a3, a4, a5);
      case 6: return (a1, a2, a3, a4, a5, a6) =>
        new type(a1, a2, a3, a4, a5, a6);
      case 7: return (a1, a2, a3, a4, a5, a6, a7) =>
        new type(a1, a2, a3, a4, a5, a6, a7);
      case 8: return (a1, a2, a3, a4, a5, a6, a7, a8) =>
        new type(a1, a2, a3, a4, a5, a6, a7, a8);
      case 9: return (a1, a2, a3, a4, a5, a6, a7, a8, a9) =>
        new type(a1, a2, a3, a4, a5, a6, a7, a8, a9);
      case 10: return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) =>
        new type(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    };

    throw "Factory cannot take more than 10 arguments";
  }

  invoke(factory:Function, args:List) {
    return factory(...args);
  }

  dependencies(typeOrFunc):List {
    var p = typeOrFunc.parameters;
    if (p == undefined && typeOrFunc.length == 0) return [];
    if (p == undefined) throw new NoAnnotationError(typeOrFunc);
    return typeOrFunc.parameters.map((p) => this._extractToken(typeOrFunc, p));
  }

  _extractToken(typeOrFunc, annotations) {
    var type;
    var depProps = [];

    for (var paramAnnotation of annotations) {
      if (paramAnnotation instanceof Type) {
        type = paramAnnotation;

      } else if (paramAnnotation instanceof Inject) {
        return this._createDependency(paramAnnotation.token, false, false, []);

      } else if (paramAnnotation instanceof InjectPromise) {
        return this._createDependency(paramAnnotation.token, true, false, []);

      } else if (paramAnnotation instanceof InjectLazy) {
        return this._createDependency(paramAnnotation.token, false, true, []);

      } else if (paramAnnotation instanceof DependencyAnnotation) {
        depProps.push(paramAnnotation);
      }
    }

    if (isPresent(type)) {
      return this._createDependency(type, false, false, depProps);
    } else {
      throw new NoAnnotationError(typeOrFunc);
    }
  }

  _createDependency(token, asPromise, lazy, depProps):Dependency {
    return new Dependency(Key.get(token), asPromise, lazy, depProps);
  }
}

export var reflector:Reflector = new Reflector();
