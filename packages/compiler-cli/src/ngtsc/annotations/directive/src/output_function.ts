/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../../diagnostics';
import {ImportedSymbolsTracker} from '../../../imports';
import {InputOrOutput} from '../../../metadata';
import {ClassMember, ClassMemberAccessLevel, ReflectionHost} from '../../../reflection';

import {validateAccessOfInitializerApiMember} from './initializer_function_access';
import {InitializerApiFunction, tryParseInitializerApi} from './initializer_functions';
import {parseAndValidateInputAndOutputOptions} from './input_output_parse_options';

// Outputs are accessed from parents, via the `listener` instruction.
// Conceptually, the fields need to be publicly readable, but in practice,
// accessing `protected` or `private` members works at runtime, so we can allow
// such outputs that may not want to expose the `OutputRef` as part of the
// component API, programmatically.
// Note: `private` is omitted intentionally as this would be a conceptual confusion point.
const allowedAccessLevels = [
  ClassMemberAccessLevel.PublicWritable,
  ClassMemberAccessLevel.PublicReadonly,
  ClassMemberAccessLevel.Protected,
];

/** Possible functions that can declare an output. */
export const OUTPUT_INITIALIZER_FNS: InitializerApiFunction[] = [
  {
    functionName: 'output',
    owningModule: '@angular/core',
    allowedAccessLevels,
  },
  {
    functionName: 'outputFromObservable',
    owningModule: '@angular/core/rxjs-interop',
    allowedAccessLevels,
  },
];

/**
 * Attempts to parse a signal output class member. Returns the parsed
 * input mapping if possible.
 */
export function tryParseInitializerBasedOutput(
  member: Pick<ClassMember, 'name' | 'value' | 'accessLevel'>,
  reflector: ReflectionHost,
  importTracker: ImportedSymbolsTracker,
): {call: ts.CallExpression; metadata: InputOrOutput} | null {
  if (member.value === null) {
    return null;
  }

  const output = tryParseInitializerApi(
    OUTPUT_INITIALIZER_FNS,
    member.value,
    reflector,
    importTracker,
  );
  if (output === null) {
    return null;
  }
  if (output.isRequired) {
    throw new FatalDiagnosticError(
      ErrorCode.INITIALIZER_API_NO_REQUIRED_FUNCTION,
      output.call,
      `Output does not support ".required()".`,
    );
  }

  validateAccessOfInitializerApiMember(output, member);

  // Options are the first parameter for `output()`, while for
  // the interop `outputFromObservable()` they are the second argument.
  const optionsNode = (
    output.api.functionName === 'output' ? output.call.arguments[0] : output.call.arguments[1]
  ) as ts.Expression | undefined;
  const options =
    optionsNode !== undefined ? parseAndValidateInputAndOutputOptions(optionsNode) : null;
  const classPropertyName = member.name;

  return {
    call: output.call,
    metadata: {
      // Outputs are not signal-based.
      isSignal: false,
      classPropertyName,
      bindingPropertyName: options?.alias ?? classPropertyName,
    },
  };
}
