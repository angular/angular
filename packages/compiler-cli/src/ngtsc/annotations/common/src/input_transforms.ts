/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {outputAst} from '@angular/compiler';

import {ClassPropertyMapping, InputMapping} from '../../../metadata';
import {CompileResult} from '../../../transform';

/** Generates additional fields to be added to a class that has inputs with transform functions. */
export function compileInputTransformFields(inputs: ClassPropertyMapping<InputMapping>):
    CompileResult[] {
  const extraFields: CompileResult[] = [];

  for (const input of inputs) {
    if (input.transform) {
      extraFields.push({
        name: `ngAcceptInputType_${input.classPropertyName}`,
        type: outputAst.transplantedType(input.transform.type),
        statements: [],
        initializer: null
      });
    }
  }

  return extraFields;
}
