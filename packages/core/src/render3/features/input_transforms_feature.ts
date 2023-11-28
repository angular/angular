/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Mutable} from '../../interface/type';
import {DirectiveDef, InputTransformFunction} from '../interfaces/definition';

/**
 * Decorates the directive definition with support for input transform functions.
 *
 * If the directive uses inheritance, the feature should be included before the
 * `InheritDefinitionFeature` to ensure that the `inputTransforms` field is populated.
 *
 * @codeGenApi
 */
export function ɵɵInputTransformsFeature<T>(definition: DirectiveDef<T>): void {
  const inputs = definition.inputConfig;
  const inputTransforms: Record<string, InputTransformFunction> = {};

  for (const minifiedKey in inputs) {
    if (inputs.hasOwnProperty(minifiedKey)) {
      // Note: the private names are used for the keys, rather than the public ones, because public
      // names can be re-aliased in host directives which would invalidate the lookup.
      const value = inputs[minifiedKey];
      if (Array.isArray(value) && value[3]) {
        inputTransforms[minifiedKey] = value[3];
      }
    }
  }

  (definition as Mutable<DirectiveDef<T>, 'inputTransforms'>).inputTransforms = inputTransforms;
}
