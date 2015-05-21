import {global} from 'angular2/src/facade/lang';

export function makeDecorator(annotationCls) {
  return function(... args) {
    var Reflect = global.Reflect;
    if (!(Reflect && Reflect.getMetadata)) {
      throw 'reflect-metadata shim is required when using class decorators';
    }
    var annotationInstance = Object.create(annotationCls.prototype);
    annotationCls.apply(annotationInstance, args);
    return function(cls) {
      var annotations = Reflect.getMetadata('annotations', cls);
      annotations = annotations || [];
      annotations.push(annotationInstance);
      Reflect.defineMetadata('annotations', annotations, cls);
      return cls;
    }
  }
}

export function makeParamDecorator(annotationCls): any {
  return function(... args) {
    var Reflect = global.Reflect;
    if (!(Reflect && Reflect.getMetadata)) {
      throw 'reflect-metadata shim is required when using parameter decorators';
    }
    var annotationInstance = Object.create(annotationCls.prototype);
    annotationCls.apply(annotationInstance, args);
    return function(cls, unusedKey, index) {
      var parameters: Array<Array<any>> = Reflect.getMetadata('parameters', cls);
      parameters = parameters || [];

      // there might be gaps if some in between parameters do not have annotations.
      // we pad with nulls.
      while (parameters.length <= index) {
        parameters.push(null);
      }

      parameters[index] = parameters[index] || [];
      var annotationsForParam: Array<any> = parameters[index];
      annotationsForParam.push(annotationInstance);

      Reflect.defineMetadata('parameters', parameters, cls);
      return cls;
    }
  }
}
