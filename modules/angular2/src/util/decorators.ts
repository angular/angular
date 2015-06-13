import {global, Type, isFunction, stringify} from 'angular2/src/facade/lang';

export interface ClassDefinition {
  extends?: Type;
  constructor: (Function | Array<any>);
}

export interface TypeDecorator {
  (cls: any): any;
  annotations: Array<any>;
  Class(obj: ClassDefinition): Type;
}

function extractAnnotation(annotation: any) {
  if (isFunction(annotation) && annotation.hasOwnProperty('annotation')) {
    // it is a decorator, extract annotation
    annotation = annotation.annotation;
  }
  return annotation;
}

function applyParams(fnOrArray: (Function | Array<any>), key: string): Function {
  if (fnOrArray === Object || fnOrArray === String || fnOrArray === Function ||
      fnOrArray === Number || fnOrArray === Array) {
    throw new Error(`Can not use native ${stringify(fnOrArray)} as constructor`);
  }
  if (isFunction(fnOrArray)) {
    return <Function>fnOrArray;
  } else if (fnOrArray instanceof Array) {
    var annotations: Array<any> = fnOrArray;
    var fn: Function = fnOrArray[fnOrArray.length - 1];
    if (!isFunction(fn)) {
      throw new Error(
          `Last position of Class method array must be Function in key ${key} was '${stringify(fn)}'`);
    }
    var annoLength = annotations.length - 1;
    if (annoLength != fn.length) {
      throw new Error(
          `Number of annotations (${annoLength}) does not match number of arguments (${fn.length}) in the function: ${stringify(fn)}`);
    }
    var paramsAnnotations: Array<Array<any>> = [];
    for (var i = 0, ii = annotations.length - 1; i < ii; i++) {
      var paramAnnotations: Array<any> = [];
      paramsAnnotations.push(paramAnnotations);
      var annotation = annotations[i];
      if (annotation instanceof Array) {
        for (var j = 0; j < annotation.length; j++) {
          paramAnnotations.push(extractAnnotation(annotation[j]));
        }
      } else if (isFunction(annotation)) {
        paramAnnotations.push(extractAnnotation(annotation));
      } else {
        paramAnnotations.push(annotation);
      }
    }
    Reflect.defineMetadata('parameters', paramsAnnotations, fn);
    return fn;
  } else {
    throw new Error(
        `Only Function or Array is supported in Class definition for key '${key}' is '${stringify(fnOrArray)}'`);
  }
}

export function Class(clsDef: ClassDefinition): Type {
  var constructor = applyParams(
      clsDef.hasOwnProperty('constructor') ? clsDef.constructor : undefined, 'constructor');
  var proto = constructor.prototype;
  if (clsDef.hasOwnProperty('extends')) {
    if (isFunction(clsDef.extends)) {
      (<Function>constructor).prototype = proto =
          Object.create((<Function>clsDef.extends).prototype);
    } else {
      throw new Error(
          `Class definition 'extends' property must be a constructor function was: ${stringify(clsDef.extends)}`);
    }
  }
  for (var key in clsDef) {
    if (key != 'extends' && key != 'prototype' && clsDef.hasOwnProperty(key)) {
      proto[key] = applyParams(clsDef[key], key);
    }
  }
  return <Type>constructor;
}

var Reflect = global.Reflect;
if (!(Reflect && Reflect.getMetadata)) {
  throw 'reflect-metadata shim is required when using class decorators';
}

export function makeDecorator(annotationCls, chainFn: (fn: Function) => void = null): (...args) =>
    (cls: any) => any {
  function DecoratorFactory(objOrType): (cls: any) => any {
    var annotationInstance = new (<any>annotationCls)(objOrType);
    if (this instanceof annotationCls) {
      return annotationInstance;
    } else {
      var chainAnnotation = isFunction(this) && this.annotations instanceof Array ?
                                                                                this.annotations :
                                                                                [];
      chainAnnotation.push(annotationInstance);
      var TypeDecorator: TypeDecorator = <TypeDecorator>function TypeDecorator(cls) {
        var annotations = Reflect.getMetadata('annotations', cls);
        annotations = annotations || [];
        annotations.push(annotationInstance);
        Reflect.defineMetadata('annotations', annotations, cls);
        return cls;
      };
      TypeDecorator.annotations = chainAnnotation;
      TypeDecorator.Class = Class;
      if (chainFn) chainFn(TypeDecorator);
      return TypeDecorator;
    }
  }
  DecoratorFactory.prototype = Object.create(annotationCls.prototype);
  return DecoratorFactory;
}

export function makeParamDecorator(annotationCls): any {
  function ParamDecoratorFactory(...args) {
    var annotationInstance = Object.create(annotationCls.prototype);
    annotationCls.apply(annotationInstance, args);
    if (this instanceof annotationCls) {
      return annotationInstance;
    } else {
      function ParamDecorator(cls, unusedKey, index) {
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

      (<any>ParamDecorator).annotation = annotationInstance;
      return ParamDecorator;
    }
  }
  ParamDecoratorFactory.prototype = Object.create(annotationCls.prototype);
  return ParamDecoratorFactory;
}
