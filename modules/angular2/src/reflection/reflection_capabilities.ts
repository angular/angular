import {Type, isPresent, global} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {GetterFn, SetterFn, MethodFn} from './types';

// HACK: workaround for Traceur behavior.
// It expects all transpiled modules to contain this marker.
// TODO: remove this when we no longer use traceur
export var __esModule = true;

export class ReflectionCapabilities {
  factory(type: Type): Function {
    switch (type.length) {
      case 0:
        return function() { return new type(); };
      case 1:
        return function(a1) { return new type(a1); };
      case 2:
        return function(a1, a2) { return new type(a1, a2); };
      case 3:
        return function(a1, a2, a3) { return new type(a1, a2, a3); };
      case 4:
        return function(a1, a2, a3, a4) { return new type(a1, a2, a3, a4); };
      case 5:
        return function(a1, a2, a3, a4, a5) { return new type(a1, a2, a3, a4, a5); };
      case 6:
        return function(a1, a2, a3, a4, a5, a6) { return new type(a1, a2, a3, a4, a5, a6); };
      case 7:
        return function(a1, a2, a3, a4, a5, a6, a7) {
          return new type(a1, a2, a3, a4, a5, a6, a7);
        };
      case 8:
        return function(a1, a2, a3, a4, a5, a6, a7, a8) {
          return new type(a1, a2, a3, a4, a5, a6, a7, a8);
        };
      case 9:
        return function(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
          return new type(a1, a2, a3, a4, a5, a6, a7, a8, a9);
        };
      case 10:
        return function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
          return new type(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
        };
    };

    throw new Error("Factory cannot take more than 10 arguments");
  }

  _zipTypesAndAnnotaions(paramTypes, paramAnnotations): List<List<any>> {
    var result = ListWrapper.createFixedSize(paramTypes.length);
    for (var i = 0; i < result.length; i++) {
      // TS outputs Object for parameters without types, while Traceur omits
      // the annotations. For now we preserve the Traceur behavior to aid
      // migration, but this can be revisited.
      if (paramTypes[i] != Object) {
        result[i] = [paramTypes[i]];
      } else {
        result[i] = [];
      }
      if (isPresent(paramAnnotations) && isPresent(paramAnnotations[i])) {
        result[i] = result[i].concat(paramAnnotations[i]);
      }
    }
    return result;
  }

  parameters(typeOfFunc): List<List<any>> {
    // Prefer the direct API.
    if (isPresent(typeOfFunc.parameters)) {
      return typeOfFunc.parameters;
    }
    if (isPresent(global.Reflect) && isPresent(global.Reflect.getMetadata)) {
      var paramAnnotations = global.Reflect.getMetadata('parameters', typeOfFunc);
      var paramTypes = global.Reflect.getMetadata('design:paramtypes', typeOfFunc);
      if (isPresent(paramTypes) || isPresent(paramAnnotations)) {
        return this._zipTypesAndAnnotaions(paramTypes, paramAnnotations);
      }
    }
    return ListWrapper.createFixedSize(typeOfFunc.length);
  }

  annotations(typeOfFunc): List<any> {
    // Prefer the direct API.
    if (isPresent(typeOfFunc.annotations)) {
      return typeOfFunc.annotations;
    }
    if (isPresent(global.Reflect) && isPresent(global.Reflect.getMetadata)) {
      var annotations = global.Reflect.getMetadata('annotations', typeOfFunc);
      if (isPresent(annotations)) return annotations;
    }
    return [];
  }

  getter(name: string): GetterFn { return new Function('o', 'return o.' + name + ';'); }

  setter(name: string): SetterFn { return new Function('o', 'v', 'return o.' + name + ' = v;'); }

  method(name: string): MethodFn {
    let functionBody = `if (!o.${name}) throw new Error('"${name}" is undefined');
        return o.${name}.apply(o, args);`;
    return new Function('o', 'args', functionBody);
  }
}
