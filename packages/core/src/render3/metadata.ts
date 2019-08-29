/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {noSideEffects} from '../util/closure';

interface TypeWithMetadata extends Type<any> {
  decorators?: any[];
  ctorParameters?: () => any[];
  propDecorators?: {[field: string]: any};
}

/**
 * Adds decorator, constructor, and property metadata to a given type via static metadata fields
 * on the type.
 *
 * These metadata fields can later be read with Angular's `ReflectionCapabilities` API.
 *
 * Calls to `setClassMetadata` can be marked as pure, resulting in the metadata assignments being
 * tree-shaken away during production builds.
 */
export function setClassMetadata(
    type: Type<any>, decorators: any[] | null, ctorParameters: (() => any[]) | null,
    propDecorators: {[field: string]: any} | null): void {
  return noSideEffects(() => {
    const clazz = type as TypeWithMetadata;

    // We determine whether a class has its own metadata by taking the metadata from the parent
    // constructor and checking whether it's the same as the subclass metadata below. We can't use
    // `hasOwnProperty` here because it doesn't work correctly in IE10 for static fields that are
    // defined by TS. See https://github.com/angular/angular/pull/28439#issuecomment-459349218.
    const parentPrototype = clazz.prototype ? Object.getPrototypeOf(clazz.prototype) : null;
    const parentConstructor: TypeWithMetadata|null = parentPrototype && parentPrototype.constructor;

    if (decorators !== null) {
      if (clazz.decorators !== undefined &&
          (!parentConstructor || parentConstructor.decorators !== clazz.decorators)) {
        clazz.decorators.push(...decorators);
      } else {
        clazz.decorators = decorators;
      }
    }
    if (ctorParameters !== null) {
      // Rather than merging, clobber the existing parameters. If other projects exist which use
      // tsickle-style annotations and reflect over them in the same way, this could cause issues,
      // but that is vanishingly unlikely.
      clazz.ctorParameters = ctorParameters;
    }
    if (propDecorators !== null) {
      // The property decorator objects are merged as it is possible different fields have different
      // decorator types. Decorators on individual fields are not merged, as it's also incredibly
      // unlikely that a field will be decorated both with an Angular decorator and a non-Angular
      // decorator that's also been downleveled.
      if (clazz.propDecorators !== undefined &&
          (!parentConstructor || parentConstructor.propDecorators !== clazz.propDecorators)) {
        clazz.propDecorators = {...clazz.propDecorators, ...propDecorators};
      } else {
        clazz.propDecorators = propDecorators;
      }
    }
  }) as never;
}
