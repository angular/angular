/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';

export function getClosureSafeProperty<T>(objWithPropertyToExtract: T): string {
  for (let key in objWithPropertyToExtract) {
    if (objWithPropertyToExtract[key] === getClosureSafeProperty as any) {
      return key;
    }
  }
  throw Error('Could not find renamed property on target object.');
}

/**
 * Sets properties on a target object from a source object, but only if
 * the property doesn't already exist on the target object.
 * @param target The target to set properties on
 * @param source The source of the property keys and values to set
 */
export function fillProperties(target: {[key: string]: string}, source: {[key: string]: string}) {
  for (const key in source) {
    if (source.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
}

/**
 * Detects whether inherited static properties of a type are considered "own" properties of the
 * superclass. If this is `false`, then `hasOwnProperty` cannot be trusted to reliably distinguish
 * between inherited and defined properties on a subclass.
 */
const canTrustHasOwnProperty = (function() {
  class Base {}
  // Use bracket access here to set the property, avoiding issues with renaming/minification.
  (Base as any)['p'] = true;
  class Child extends Base {}
  // If 'p' shows up as an own property of Child, then hasOwnProperty is not to be trusted.
  return !Child.hasOwnProperty('p');
});

/**
 * Check whether a given `Type` has an own property of a certain name.
 *
 * In principle this is the same as a `hasOwnProperty` check, but this function safeguards against
 * the unreliability of that check with downleveled TypeScript code in IE10. See the implementation
 * comments for details.
 *
 * This function should only be used in cases where the expected value of the property is different
 * between superclasses and subclasses. It will not return accurate results in browsers like IE10 if
 * checking a property where the values are the same.
 */
export function typeHasOwnPropertySafe<T extends Type<any>, N extends string>(
    type: T & {[key in N]?: unknown}, name: N): type is T&{[key in N]: unknown} {
  // In browsers such as IE10 which don't have `Object.setPrototypeOf` (or where it's polyfilled),
  // inheritance of static properties is done by copying the properties from the parent to the child
  // class. Therefore, it's not safe to use `hasOwnProperty` if `Object.setPrototypeOf` is not
  // present, as static properties on a type will always be own properties, regardless of whether
  // they were defined directly or inherited.
  if (canTrustHasOwnProperty) {
    return type.hasOwnProperty(name);
  } else {
    // `hasOwnProperty` is unreliable. We determine whether a class has its own static property by
    // taking the property from the parent constructor and checking whether it's the same as the
    // subclass property. We can't use `hasOwnProperty` here because it doesn't work correctly in
    // IE10 for static fields that are defined by TS. See
    // https://github.com/angular/angular/pull/28439#issuecomment-459349218.
    //
    // Note that this approach leads to a false negative if the property was defined on the subclass
    // but has an identical value to the same property defined on the superclass. In Ivy however,
    // the properties we define on types are always unique objects, so we don't hit this corner
    // case.
    const parentPrototype = type.prototype ? Object.getPrototypeOf(type.prototype) : null;
    const parentConstructor: Type<any>&{[key in N]?: unknown} =
        parentPrototype ? parentPrototype.constructor : null;

    return type[name] !== undefined &&
        (!parentConstructor || parentConstructor[name] !== type[name]);
  }
}
