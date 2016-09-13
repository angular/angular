/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {global, isFunction, stringify} from '../facade/lang';
import {Type} from '../type';

var _nextClassId = 0;

/**
 * Declares the interface to be used with {@link Class}.
 *
 * @stable
 */
export interface ClassDefinition {
  /**
   * Optional argument for specifying the superclass.
   */
  extends?: Type<any>;

  /**
   * Required constructor function for a class.
   *
   * The function may be optionally wrapped in an `Array`, in which case additional parameter
   * annotations may be specified.
   * The number of arguments and the number of parameter annotations must match.
   *
   * See {@link Class} for example of usage.
   */
  constructor: Function|any[];

  /**
   * Other methods on the class. Note that values should have type 'Function' but TS requires
   * all properties to have a narrower type than the index signature.
   */
  [x: string]: Type<any>|Function|any[];
}

/**
 * An interface implemented by all Angular type decorators, which allows them to be used as ES7
 * decorators as well as
 * Angular DSL syntax.
 *
 * DSL syntax:
 *
 * ```
 * var MyClass = ng
 *   .Component({...})
 *   .Class({...});
 * ```
 *
 * ES7 syntax:
 *
 * ```
 * @ng.Component({...})
 * class MyClass {...}
 * ```
 * @stable
 */
export interface TypeDecorator {
  /**
   * Invoke as ES7 decorator.
   */
  <T extends Type<any>>(type: T): T;

  // Make TypeDecorator assignable to built-in ParameterDecorator type.
  // ParameterDecorator is declared in lib.d.ts as a `declare type`
  // so we cannot declare this interface as a subtype.
  // see https://github.com/angular/angular/issues/3379#issuecomment-126169417
  (target: Object, propertyKey?: string|symbol, parameterIndex?: number): void;

  /**
   * Storage for the accumulated annotations so far used by the DSL syntax.
   *
   * Used by {@link Class} to annotate the generated class.
   */
  annotations: any[];

  /**
   * Generate a class from the definition and annotate it with {@link TypeDecorator#annotations}.
   */
  Class(obj: ClassDefinition): Type<any>;
}

function extractAnnotation(annotation: any): any {
  if (isFunction(annotation) && annotation.hasOwnProperty('annotation')) {
    // it is a decorator, extract annotation
    annotation = annotation.annotation;
  }
  return annotation;
}

function applyParams(fnOrArray: (Function | any[]), key: string): Function {
  if (fnOrArray === Object || fnOrArray === String || fnOrArray === Function ||
      fnOrArray === Number || fnOrArray === Array) {
    throw new Error(`Can not use native ${stringify(fnOrArray)} as constructor`);
  }
  if (isFunction(fnOrArray)) {
    return <Function>fnOrArray;
  } else if (fnOrArray instanceof Array) {
    const annotations: any[] = fnOrArray;
    const annoLength = annotations.length - 1;
    const fn: Function = fnOrArray[annoLength];
    if (!isFunction(fn)) {
      throw new Error(
          `Last position of Class method array must be Function in key ${key} was '${stringify(fn)}'`);
    }
    if (annoLength != fn.length) {
      throw new Error(
          `Number of annotations (${annoLength}) does not match number of arguments (${fn.length}) in the function: ${stringify(fn)}`);
    }
    const paramsAnnotations: any[][] = [];
    for (let i = 0, ii = annotations.length - 1; i < ii; i++) {
      const paramAnnotations: any[] = [];
      paramsAnnotations.push(paramAnnotations);
      const annotation = annotations[i];
      if (annotation instanceof Array) {
        for (let j = 0; j < annotation.length; j++) {
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

/**
 * Provides a way for expressing ES6 classes with parameter annotations in ES5.
 *
 * ## Basic Example
 *
 * ```
 * var Greeter = ng.Class({
 *   constructor: function(name) {
 *     this.name = name;
 *   },
 *
 *   greet: function() {
 *     alert('Hello ' + this.name + '!');
 *   }
 * });
 * ```
 *
 * is equivalent to ES6:
 *
 * ```
 * class Greeter {
 *   constructor(name) {
 *     this.name = name;
 *   }
 *
 *   greet() {
 *     alert('Hello ' + this.name + '!');
 *   }
 * }
 * ```
 *
 * or equivalent to ES5:
 *
 * ```
 * var Greeter = function (name) {
 *   this.name = name;
 * }
 *
 * Greeter.prototype.greet = function () {
 *   alert('Hello ' + this.name + '!');
 * }
 * ```
 *
 * ### Example with parameter annotations
 *
 * ```
 * var MyService = ng.Class({
 *   constructor: [String, [new Query(), QueryList], function(name, queryList) {
 *     ...
 *   }]
 * });
 * ```
 *
 * is equivalent to ES6:
 *
 * ```
 * class MyService {
 *   constructor(name: string, @Query() queryList: QueryList) {
 *     ...
 *   }
 * }
 * ```
 *
 * ### Example with inheritance
 *
 * ```
 * var Shape = ng.Class({
 *   constructor: (color) {
 *     this.color = color;
 *   }
 * });
 *
 * var Square = ng.Class({
 *   extends: Shape,
 *   constructor: function(color, size) {
 *     Shape.call(this, color);
 *     this.size = size;
 *   }
 * });
 * ```
 * @stable
 */
export function Class(clsDef: ClassDefinition): Type<any> {
  const constructor = applyParams(
      clsDef.hasOwnProperty('constructor') ? clsDef.constructor : undefined, 'constructor');
  let proto = constructor.prototype;
  if (clsDef.hasOwnProperty('extends')) {
    if (isFunction(clsDef.extends)) {
      (<Function>constructor).prototype = proto =
          Object.create((<Function>clsDef.extends).prototype);
    } else {
      throw new Error(
          `Class definition 'extends' property must be a constructor function was: ${stringify(clsDef.extends)}`);
    }
  }
  for (let key in clsDef) {
    if (key != 'extends' && key != 'prototype' && clsDef.hasOwnProperty(key)) {
      proto[key] = applyParams(<any>clsDef[key], key);
    }
  }

  if (this && this.annotations instanceof Array) {
    Reflect.defineMetadata('annotations', this.annotations, constructor);
  }

  const constructorName = constructor['name'];
  if (!constructorName || constructorName === 'constructor') {
    (constructor as any)['overriddenName'] = `class${_nextClassId++}`;
  }

  return <Type<any>>constructor;
}

var Reflect = global.Reflect;

export function makeDecorator(
    name: string, props: {[key: string]: any}, parentClass?: any,
    chainFn: (fn: Function) => void = null): (...args: any[]) => (cls: any) => any {
  const metaCtor = makeMetadataCtor([props]);

  function DecoratorFactory(objOrType: any): (cls: any) => any {
    if (!(Reflect && Reflect.getMetadata)) {
      throw 'reflect-metadata shim is required when using class decorators';
    }

    if (this instanceof DecoratorFactory) {
      metaCtor.call(this, objOrType);
      return this;
    } else {
      const annotationInstance = new (<any>DecoratorFactory)(objOrType);
      const chainAnnotation =
          isFunction(this) && this.annotations instanceof Array ? this.annotations : [];
      chainAnnotation.push(annotationInstance);
      const TypeDecorator: TypeDecorator = <TypeDecorator>function TypeDecorator(cls: Type<any>) {
        const annotations = Reflect.getOwnMetadata('annotations', cls) || [];
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
  if (parentClass) {
    DecoratorFactory.prototype = Object.create(parentClass.prototype);
  }
  DecoratorFactory.prototype.toString = () => `@${name}`;
  (<any>DecoratorFactory).annotationCls = DecoratorFactory;
  return DecoratorFactory;
}

function makeMetadataCtor(props: ([string, any] | {[key: string]: any})[]): any {
  function ctor(...args: any[]) {
    props.forEach((prop, i) => {
      const argVal = args[i];
      if (Array.isArray(prop)) {
        // plain parameter
        const val = !argVal || argVal === undefined ? prop[1] : argVal;
        this[prop[0]] = val;
      } else {
        for (let propName in prop) {
          const val = !argVal || argVal[propName] === undefined ? prop[propName] : argVal[propName];
          this[propName] = val;
        }
      }
    });
  }
  return ctor;
}

export function makeParamDecorator(
    name: string, props: ([string, any] | {[key: string]: any})[], parentClass?: any): any {
  const metaCtor = makeMetadataCtor(props);
  function ParamDecoratorFactory(...args: any[]): any {
    if (this instanceof ParamDecoratorFactory) {
      metaCtor.apply(this, args);
      return this;
    }
    const annotationInstance = new (<any>ParamDecoratorFactory)(...args);

    (<any>ParamDecorator).annotation = annotationInstance;
    return ParamDecorator;

    function ParamDecorator(cls: any, unusedKey: any, index: number): any {
      const parameters: any[][] = Reflect.getMetadata('parameters', cls) || [];

      // there might be gaps if some in between parameters do not have annotations.
      // we pad with nulls.
      while (parameters.length <= index) {
        parameters.push(null);
      }

      parameters[index] = parameters[index] || [];
      var annotationsForParam: any[] = parameters[index];
      annotationsForParam.push(annotationInstance);

      Reflect.defineMetadata('parameters', parameters, cls);
      return cls;
    }
  }
  if (parentClass) {
    ParamDecoratorFactory.prototype = Object.create(parentClass.prototype);
  }
  ParamDecoratorFactory.prototype.toString = () => `@${name}`;
  (<any>ParamDecoratorFactory).annotationCls = ParamDecoratorFactory;
  return ParamDecoratorFactory;
}

export function makePropDecorator(
    name: string, props: ([string, any] | {[key: string]: any})[], parentClass?: any): any {
  const metaCtor = makeMetadataCtor(props);
  function PropDecoratorFactory(...args: any[]): any {
    if (this instanceof PropDecoratorFactory) {
      metaCtor.apply(this, args);
      return this;
    } else {
      var decoratorInstance = new (<any>PropDecoratorFactory)(...args);
      return function PropDecorator(target: any, name: string) {
        const meta = Reflect.getOwnMetadata('propMetadata', target.constructor) || {};
        meta[name] = meta[name] || [];
        meta[name].unshift(decoratorInstance);
        Reflect.defineMetadata('propMetadata', meta, target.constructor);
      };
    }
  }
  if (parentClass) {
    PropDecoratorFactory.prototype = Object.create(parentClass.prototype);
  }
  PropDecoratorFactory.prototype.toString = () => `@${name}`;
  (<any>PropDecoratorFactory).annotationCls = PropDecoratorFactory;
  return PropDecoratorFactory;
}
