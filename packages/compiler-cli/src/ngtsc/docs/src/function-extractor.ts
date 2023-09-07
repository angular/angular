/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EntryType, FunctionEntry, ParameterEntry} from '@angular/compiler-cli/src/ngtsc/docs/src/entities';
import ts from 'typescript';

/** Extracts docs for a function, including class method declarations. */
export function extractFunction(fn: ts.FunctionDeclaration|ts.MethodDeclaration): FunctionEntry {
  return {
    params: extractAllParams(fn.parameters),
    // We know that the function has a name here because we would have skipped it
    // already before getting to this point if it was anonymous.
    name: fn.name!.getText(),
    returnType: 'TODO',
    entryType: EntryType.function,
  };
}

/** Extracts doc info for a collection of function parameters. */
function extractAllParams(params: ts.NodeArray<ts.ParameterDeclaration>): ParameterEntry[] {
  // TODO: handle var args
  return params.map(param => ({
                      name: param.name.getText(),
                      description: 'TODO',
                      type: 'TODO',
                      isOptional: !!(param.questionToken || param.initializer),
                    }));
}
