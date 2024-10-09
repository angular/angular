/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {outputAst} from '@angular/compiler';

import {ClassPropertyMapping, InputMapping} from '../../../metadata';
import {CompileResult} from '../../../transform';

/** Generates additional fields to be added to a class that has inputs with transform functions. */
export function compileInputTransformFields(
  inputs: ClassPropertyMapping<InputMapping>,
): CompileResult[] {
  const extraFields: CompileResult[] = [];

  for (const input of inputs) {
    // Note: Signal inputs capture their transform `WriteT` as part of the `InputSignal`.
    // Such inputs will not have a `transform` captured and not generate coercion members.

    if (input.transform) {
      extraFields.push({
        name: `ngAcceptInputType_${input.classPropertyName}`,
        type: outputAst.transplantedType(input.transform.type),
        statements: [],
        initializer: null,
        deferrableImports: null,
      });
    }
  }

  return extraFields;
}
