import {Type} from 'facade/lang';
import {Inject} from './annotations';

export class Reflector {
  factoryFor(type:Type) {
    return (args) => new type(...args);
  }

  convertToFactory(factoryFunction:Function) {
    return (args) => factoryFunction(...args);
  }

  dependencies(type:Type) {
    var p = type.parameters;
    if (p == undefined) return [];
    return type.parameters.map((p) => this._extractToken(p));
  }

  _extractToken(annotations) {
    var type, inject;
    for (var paramAnnotation of annotations) {
      if (isFunction(paramAnnotation)) {
        type = paramAnnotation;

      } else if (paramAnnotation instanceof Inject) {
        inject = paramAnnotation.token;
      }
    }
    return inject != undefined ? inject : type;
  }
}

function isFunction(value) {
  return typeof value === 'function';
}
