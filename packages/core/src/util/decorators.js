/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {noSideEffects} from './closure';
export const ANNOTATIONS = '__annotations__';
export const PARAMETERS = '__parameters__';
export const PROP_METADATA = '__prop__metadata__';
/**
 * @suppress {globalThis}
 */
export function makeDecorator(name, props, parentClass, additionalProcessing, typeFn) {
  return noSideEffects(() => {
    const metaCtor = makeMetadataCtor(props);
    function DecoratorFactory(...args) {
      if (this instanceof DecoratorFactory) {
        metaCtor.call(this, ...args);
        return this;
      }
      const annotationInstance = new DecoratorFactory(...args);
      return function TypeDecorator(cls) {
        if (typeFn) typeFn(cls, ...args);
        // Use of Object.defineProperty is important since it creates non-enumerable property which
        // prevents the property is copied during subclassing.
        const annotations = cls.hasOwnProperty(ANNOTATIONS)
          ? cls[ANNOTATIONS]
          : Object.defineProperty(cls, ANNOTATIONS, {value: []})[ANNOTATIONS];
        annotations.push(annotationInstance);
        if (additionalProcessing) additionalProcessing(cls);
        return cls;
      };
    }
    if (parentClass) {
      DecoratorFactory.prototype = Object.create(parentClass.prototype);
    }
    DecoratorFactory.prototype.ngMetadataName = name;
    DecoratorFactory.annotationCls = DecoratorFactory;
    return DecoratorFactory;
  });
}
function makeMetadataCtor(props) {
  return function ctor(...args) {
    if (props) {
      const values = props(...args);
      for (const propName in values) {
        this[propName] = values[propName];
      }
    }
  };
}
export function makeParamDecorator(name, props, parentClass) {
  return noSideEffects(() => {
    const metaCtor = makeMetadataCtor(props);
    function ParamDecoratorFactory(...args) {
      if (this instanceof ParamDecoratorFactory) {
        metaCtor.apply(this, args);
        return this;
      }
      const annotationInstance = new ParamDecoratorFactory(...args);
      ParamDecorator.annotation = annotationInstance;
      return ParamDecorator;
      function ParamDecorator(cls, unusedKey, index) {
        // Use of Object.defineProperty is important since it creates non-enumerable property which
        // prevents the property is copied during subclassing.
        const parameters = cls.hasOwnProperty(PARAMETERS)
          ? cls[PARAMETERS]
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
    ParamDecoratorFactory.annotationCls = ParamDecoratorFactory;
    return ParamDecoratorFactory;
  });
}
export function makePropDecorator(name, props, parentClass, additionalProcessing) {
  return noSideEffects(() => {
    const metaCtor = makeMetadataCtor(props);
    function PropDecoratorFactory(...args) {
      if (this instanceof PropDecoratorFactory) {
        metaCtor.apply(this, args);
        return this;
      }
      const decoratorInstance = new PropDecoratorFactory(...args);
      function PropDecorator(target, name) {
        // target is undefined with standard decorators. This case is not supported and will throw
        // if this decorator is used in JIT mode with standard decorators.
        if (target === undefined) {
          throw new Error('Standard Angular field decorators are not supported in JIT mode.');
        }
        const constructor = target.constructor;
        // Use of Object.defineProperty is important because it creates a non-enumerable property
        // which prevents the property from being copied during subclassing.
        const meta = constructor.hasOwnProperty(PROP_METADATA)
          ? constructor[PROP_METADATA]
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
    PropDecoratorFactory.annotationCls = PropDecoratorFactory;
    return PropDecoratorFactory;
  });
}
//# sourceMappingURL=decorators.js.map
