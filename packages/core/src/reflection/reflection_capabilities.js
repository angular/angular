/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {isType, Type} from '../interface/type';
import {newArray} from '../util/array_utils';
import {ANNOTATIONS, PARAMETERS, PROP_METADATA} from '../util/decorators';
import {global} from '../util/global';
/*
 * #########################
 * Attention: These Regular expressions have to hold even if the code is minified!
 * ##########################
 */
/**
 * Regular expression that detects pass-through constructors for ES5 output. This Regex
 * intends to capture the common delegation pattern emitted by TypeScript and Babel. Also
 * it intends to capture the pattern where existing constructors have been downleveled from
 * ES2015 to ES5 using TypeScript w/ downlevel iteration. e.g.
 *
 * ```ts
 *   function MyClass() {
 *     var _this = _super.apply(this, arguments) || this;
 * ```
 *
 * downleveled to ES5 with `downlevelIteration` for TypeScript < 4.2:
 * ```ts
 *   function MyClass() {
 *     var _this = _super.apply(this, __spread(arguments)) || this;
 * ```
 *
 * or downleveled to ES5 with `downlevelIteration` for TypeScript >= 4.2:
 * ```ts
 *   function MyClass() {
 *     var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
 * ```
 *
 * More details can be found in: https://github.com/angular/angular/issues/38453.
 */
export const ES5_DELEGATE_CTOR =
  /^function\s+\S+\(\)\s*{[\s\S]+\.apply\(this,\s*(arguments|(?:[^()]+\(\[\],)?[^()]+\(arguments\).*)\)/;
/** Regular expression that detects ES2015 classes which extend from other classes. */
export const ES2015_INHERITED_CLASS = /^class\s+[A-Za-z\d$_]*\s*extends\s+[^{]+{/;
/**
 * Regular expression that detects ES2015 classes which extend from other classes and
 * have an explicit constructor defined.
 */
export const ES2015_INHERITED_CLASS_WITH_CTOR =
  /^class\s+[A-Za-z\d$_]*\s*extends\s+[^{]+{[\s\S]*constructor\s*\(/;
/**
 * Regular expression that detects ES2015 classes which extend from other classes
 * and inherit a constructor.
 */
export const ES2015_INHERITED_CLASS_WITH_DELEGATE_CTOR =
  /^class\s+[A-Za-z\d$_]*\s*extends\s+[^{]+{[\s\S]*constructor\s*\(\)\s*{[^}]*super\(\.\.\.arguments\)/;
/**
 * Determine whether a stringified type is a class which delegates its constructor
 * to its parent.
 *
 * This is not trivial since compiled code can actually contain a constructor function
 * even if the original source code did not. For instance, when the child class contains
 * an initialized instance property.
 */
export function isDelegateCtor(typeStr) {
  return (
    ES5_DELEGATE_CTOR.test(typeStr) ||
    ES2015_INHERITED_CLASS_WITH_DELEGATE_CTOR.test(typeStr) ||
    (ES2015_INHERITED_CLASS.test(typeStr) && !ES2015_INHERITED_CLASS_WITH_CTOR.test(typeStr))
  );
}
export class ReflectionCapabilities {
  constructor(reflect) {
    this._reflect = reflect || global['Reflect'];
  }
  factory(t) {
    return (...args) => new t(...args);
  }
  /** @internal */
  _zipTypesAndAnnotations(paramTypes, paramAnnotations) {
    let result;
    if (typeof paramTypes === 'undefined') {
      result = newArray(paramAnnotations.length);
    } else {
      result = newArray(paramTypes.length);
    }
    for (let i = 0; i < result.length; i++) {
      // TS outputs Object for parameters without types, while Traceur omits
      // the annotations. For now we preserve the Traceur behavior to aid
      // migration, but this can be revisited.
      if (typeof paramTypes === 'undefined') {
        result[i] = [];
      } else if (paramTypes[i] && paramTypes[i] != Object) {
        result[i] = [paramTypes[i]];
      } else {
        result[i] = [];
      }
      if (paramAnnotations && paramAnnotations[i] != null) {
        result[i] = result[i].concat(paramAnnotations[i]);
      }
    }
    return result;
  }
  _ownParameters(type, parentCtor) {
    const typeStr = type.toString();
    // If we have no decorators, we only have function.length as metadata.
    // In that case, to detect whether a child class declared an own constructor or not,
    // we need to look inside of that constructor to check whether it is
    // just calling the parent.
    // This also helps to work around for https://github.com/Microsoft/TypeScript/issues/12439
    // that sets 'design:paramtypes' to []
    // if a class inherits from another class but has no ctor declared itself.
    if (isDelegateCtor(typeStr)) {
      return null;
    }
    // Prefer the direct API.
    if (type.parameters && type.parameters !== parentCtor.parameters) {
      return type.parameters;
    }
    // API of tsickle for lowering decorators to properties on the class.
    const tsickleCtorParams = type.ctorParameters;
    if (tsickleCtorParams && tsickleCtorParams !== parentCtor.ctorParameters) {
      // Newer tsickle uses a function closure
      // Retain the non-function case for compatibility with older tsickle
      const ctorParameters =
        typeof tsickleCtorParams === 'function' ? tsickleCtorParams() : tsickleCtorParams;
      const paramTypes = ctorParameters.map((ctorParam) => ctorParam && ctorParam.type);
      const paramAnnotations = ctorParameters.map(
        (ctorParam) => ctorParam && convertTsickleDecoratorIntoMetadata(ctorParam.decorators),
      );
      return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
    }
    // API for metadata created by invoking the decorators.
    const paramAnnotations = type.hasOwnProperty(PARAMETERS) && type[PARAMETERS];
    const paramTypes =
      this._reflect &&
      this._reflect.getOwnMetadata &&
      this._reflect.getOwnMetadata('design:paramtypes', type);
    if (paramTypes || paramAnnotations) {
      return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
    }
    // If a class has no decorators, at least create metadata
    // based on function.length.
    // Note: We know that this is a real constructor as we checked
    // the content of the constructor above.
    return newArray(type.length);
  }
  parameters(type) {
    // Note: only report metadata if we have at least one class decorator
    // to stay in sync with the static reflector.
    if (!isType(type)) {
      return [];
    }
    const parentCtor = getParentCtor(type);
    let parameters = this._ownParameters(type, parentCtor);
    if (!parameters && parentCtor !== Object) {
      parameters = this.parameters(parentCtor);
    }
    return parameters || [];
  }
  _ownAnnotations(typeOrFunc, parentCtor) {
    // Prefer the direct API.
    if (typeOrFunc.annotations && typeOrFunc.annotations !== parentCtor.annotations) {
      let annotations = typeOrFunc.annotations;
      if (typeof annotations === 'function' && annotations.annotations) {
        annotations = annotations.annotations;
      }
      return annotations;
    }
    // API of tsickle for lowering decorators to properties on the class.
    if (typeOrFunc.decorators && typeOrFunc.decorators !== parentCtor.decorators) {
      return convertTsickleDecoratorIntoMetadata(typeOrFunc.decorators);
    }
    // API for metadata created by invoking the decorators.
    if (typeOrFunc.hasOwnProperty(ANNOTATIONS)) {
      return typeOrFunc[ANNOTATIONS];
    }
    return null;
  }
  annotations(typeOrFunc) {
    if (!isType(typeOrFunc)) {
      return [];
    }
    const parentCtor = getParentCtor(typeOrFunc);
    const ownAnnotations = this._ownAnnotations(typeOrFunc, parentCtor) || [];
    const parentAnnotations = parentCtor !== Object ? this.annotations(parentCtor) : [];
    return parentAnnotations.concat(ownAnnotations);
  }
  _ownPropMetadata(typeOrFunc, parentCtor) {
    // Prefer the direct API.
    if (typeOrFunc.propMetadata && typeOrFunc.propMetadata !== parentCtor.propMetadata) {
      let propMetadata = typeOrFunc.propMetadata;
      if (typeof propMetadata === 'function' && propMetadata.propMetadata) {
        propMetadata = propMetadata.propMetadata;
      }
      return propMetadata;
    }
    // API of tsickle for lowering decorators to properties on the class.
    if (typeOrFunc.propDecorators && typeOrFunc.propDecorators !== parentCtor.propDecorators) {
      const propDecorators = typeOrFunc.propDecorators;
      const propMetadata = {};
      Object.keys(propDecorators).forEach((prop) => {
        propMetadata[prop] = convertTsickleDecoratorIntoMetadata(propDecorators[prop]);
      });
      return propMetadata;
    }
    // API for metadata created by invoking the decorators.
    if (typeOrFunc.hasOwnProperty(PROP_METADATA)) {
      return typeOrFunc[PROP_METADATA];
    }
    return null;
  }
  propMetadata(typeOrFunc) {
    if (!isType(typeOrFunc)) {
      return {};
    }
    const parentCtor = getParentCtor(typeOrFunc);
    const propMetadata = {};
    if (parentCtor !== Object) {
      const parentPropMetadata = this.propMetadata(parentCtor);
      Object.keys(parentPropMetadata).forEach((propName) => {
        propMetadata[propName] = parentPropMetadata[propName];
      });
    }
    const ownPropMetadata = this._ownPropMetadata(typeOrFunc, parentCtor);
    if (ownPropMetadata) {
      Object.keys(ownPropMetadata).forEach((propName) => {
        const decorators = [];
        if (propMetadata.hasOwnProperty(propName)) {
          decorators.push(...propMetadata[propName]);
        }
        decorators.push(...ownPropMetadata[propName]);
        propMetadata[propName] = decorators;
      });
    }
    return propMetadata;
  }
  ownPropMetadata(typeOrFunc) {
    if (!isType(typeOrFunc)) {
      return {};
    }
    return this._ownPropMetadata(typeOrFunc, getParentCtor(typeOrFunc)) || {};
  }
  hasLifecycleHook(type, lcProperty) {
    return type instanceof Type && lcProperty in type.prototype;
  }
}
function convertTsickleDecoratorIntoMetadata(decoratorInvocations) {
  if (!decoratorInvocations) {
    return [];
  }
  return decoratorInvocations.map((decoratorInvocation) => {
    const decoratorType = decoratorInvocation.type;
    const annotationCls = decoratorType.annotationCls;
    const annotationArgs = decoratorInvocation.args ? decoratorInvocation.args : [];
    return new annotationCls(...annotationArgs);
  });
}
function getParentCtor(ctor) {
  const parentProto = ctor.prototype ? Object.getPrototypeOf(ctor.prototype) : null;
  const parentCtor = parentProto ? parentProto.constructor : null;
  // Note: We always use `Object` as the null value
  // to simplify checking later on.
  return parentCtor || Object;
}
//# sourceMappingURL=reflection_capabilities.js.map
