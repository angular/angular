/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '../interface/type';

import {noSideEffects} from './closure';

/**
 * An interface implemented by all Angular type decorators, which allows them to be used as
 * decorators as well as Angular syntax.
 *
 * ```ts
 * @ng.Component({...})
 * class MyClass {...}
 * ```
 *
 * @publicApi
 */
export interface TypeDecorator {
  /**
   * Invoke as decorator.
   */
  <T extends Type<any>>(type: T): T;

  // Make TypeDecorator assignable to built-in ParameterDecorator type.
  // ParameterDecorator is declared in lib.d.ts as a `declare type`
  // so we cannot declare this interface as a subtype.
  // see https://github.com/angular/angular/issues/3379#issuecomment-126169417
  (target: Object, propertyKey?: string | symbol, parameterIndex?: number): void;
  // Standard (non-experimental) Decorator signature that avoids direct usage of
  // any TS 5.0+ specific types.
  (target: unknown, context: unknown): void;
}

export const ANNOTATIONS = '__annotations__';
export const PARAMETERS = '__parameters__';
export const PROP_METADATA = '__prop__metadata__';

/**
 * @suppress {globalThis}
 */
export function makeDecorator<T>(
  name: string,
  props?: (...args: any[]) => any,
  parentClass?: any,
  additionalProcessing?: (type: Type<T>) => void,
  typeFn?: (type: Type<T>, ...args: any[]) => void,
): {new (...args: any[]): any; (...args: any[]): any; (...args: any[]): (cls: any) => any} {
  return noSideEffects(() => {
    const metaCtor = makeMetadataCtor(props);

    function DecoratorFactory(
      this: unknown | typeof DecoratorFactory,
      ...args: any[]
    ): (cls: Type<T>) => any {
      if (this instanceof DecoratorFactory) {
        metaCtor.call(this, ...args);
        return this as typeof DecoratorFactory;
      }

      const annotationInstance = new (DecoratorFactory as any)(...args);
      return function TypeDecorator(cls: Type<T>) {
        if (typeFn) typeFn(cls, ...args);
        // Use of Object.defineProperty is important since it creates non-enumerable property which
        // prevents the property is copied during subclassing.
        const annotations = cls.hasOwnProperty(ANNOTATIONS)
          ? (cls as any)[ANNOTATIONS]
          : (Object.defineProperty(cls, ANNOTATIONS, {value: []}) as any)[ANNOTATIONS];
        annotations.push(annotationInstance);

        if (additionalProcessing) additionalProcessing(cls);

        return cls;
      };
    }

    if (parentClass) {
      DecoratorFactory.prototype = Object.create(parentClass.prototype);
    }

    DecoratorFactory.prototype.ngMetadataName = name;
    (DecoratorFactory as any).annotationCls = DecoratorFactory;
    return DecoratorFactory as any;
  });
}

function makeMetadataCtor(props?: (...args: any[]) => any): any {
  return function ctor(this: any, ...args: any[]) {
    if (props) {
      const values = props(...args);
      for (const propName in values) {
        this[propName] = values[propName];
      }
    }
  };
}

export function makeParamDecorator(
  name: string,
  props?: (...args: any[]) => any,
  parentClass?: any,
): any {
  return noSideEffects(() => {
    const metaCtor = makeMetadataCtor(props);
    function ParamDecoratorFactory(
      this: unknown | typeof ParamDecoratorFactory,
      ...args: any[]
    ): any {
      if (this instanceof ParamDecoratorFactory) {
        metaCtor.apply(this, args);
        return this;
      }
      const annotationInstance = new (<any>ParamDecoratorFactory)(...args);

      (<any>ParamDecorator).annotation = annotationInstance;
      return ParamDecorator;

      function ParamDecorator(cls: any, unusedKey: any, index: number): any {
        // Use of Object.defineProperty is important since it creates non-enumerable property which
        // prevents the property is copied during subclassing.
        const parameters = cls.hasOwnProperty(PARAMETERS)
          ? (cls as any)[PARAMETERS]
          : Object.defineProperty(cls, PARAMETERS, {value: []})[PARAMETERS];

        // there might be gaps if some in between parameters do not have annotations.
        // we pad with nulls.
        while (parameters.length <= index) {
          parameters.push(null);
        }

        (parameters[index] = parameters[index] || []).push(annotationInstance);
        return cls;
      }
    }
    if (parentClass) {
      ParamDecoratorFactory.prototype = Object.create(parentClass.prototype);
    }
    ParamDecoratorFactory.prototype.ngMetadataName = name;
    (<any>ParamDecoratorFactory).annotationCls = ParamDecoratorFactory;
    return ParamDecoratorFactory;
  });
}

export function makePropDecorator(
  name: string,
  props?: (...args: any[]) => any,
  parentClass?: any,
  additionalProcessing?: (target: any, name: string, ...args: any[]) => void,
): any {
  return noSideEffects(() => {
    const metaCtor = makeMetadataCtor(props);

    function PropDecoratorFactory(
      this: unknown | typeof PropDecoratorFactory,
      ...args: any[]
    ): any {
      if (this instanceof PropDecoratorFactory) {
        metaCtor.apply(this, args);
        return this;
      }

      const decoratorInstance = new (<any>PropDecoratorFactory)(...args);

      function PropDecorator(target: any, name: string) {
        // target is undefined with standard decorators. This case is not supported and will throw
        // if this decorator is used in JIT mode with standard decorators.
        if (target === undefined) {
          throw new Error('Standard Angular field decorators are not supported in JIT mode.');
        }

        const constructor = target.constructor;
        // Use of Object.defineProperty is important because it creates a non-enumerable property
        // which prevents the property from being copied during subclassing.
        const meta = constructor.hasOwnProperty(PROP_METADATA)
          ? (constructor as any)[PROP_METADATA]
          : Object.defineProperty(constructor, PROP_METADATA, {value: {}})[PROP_METADATA];
        meta[name] = (meta.hasOwnProperty(name) && meta[name]) || [];
        meta[name].unshift(decoratorInstance);

        if (additionalProcessing) additionalProcessing(target, name, ...args);
      }

      return PropDecorator;
    }

    if (parentClass) {
      PropDecoratorFactory.prototype = Object.create(parentClass.prototype);
    }

    PropDecoratorFactory.prototype.ngMetadataName = name;
    (<any>PropDecoratorFactory).annotationCls = PropDecoratorFactory;
    return PropDecoratorFactory;
  });
}
