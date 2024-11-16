/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ImportedSymbolsTracker} from '../../../imports';
import {ModelMapping} from '../../../metadata';
import {ClassMember, ClassMemberAccessLevel, ReflectionHost} from '../../../reflection';

import {validateAccessOfInitializerApiMember} from './initializer_function_access';
import {InitializerApiFunction, tryParseInitializerApi} from './initializer_functions';
import {parseAndValidateInputAndOutputOptions} from './input_output_parse_options';

/** Represents a function that can declare a model. */
export const MODEL_INITIALIZER_FN: InitializerApiFunction = {
  functionName: 'model',
  owningModule: '@angular/core',
  // Inputs are accessed from parents, via the `property` instruction.
  // Conceptually, the fields need to be publicly readable, but in practice,
  // accessing `protected` or `private` members works at runtime, so we can allow
  // cases where the input is intentionally not part of the public API, programmatically.
  allowedAccessLevels: [
    ClassMemberAccessLevel.PublicWritable,
    ClassMemberAccessLevel.PublicReadonly,
    ClassMemberAccessLevel.Protected,
  ],
};

/**
 * Attempts to parse a model class member. Returns the parsed model mapping if possible.
 */
export function tryParseSignalModelMapping(
  member: Pick<ClassMember, 'name' | 'value' | 'accessLevel'>,
  reflector: ReflectionHost,
  importTracker: ImportedSymbolsTracker,
): ModelMapping | null {
  if (member.value === null) {
    return null;
  }

  const model = tryParseInitializerApi(
    [MODEL_INITIALIZER_FN],
    member.value,
    reflector,
    importTracker,
  );
  if (model === null) {
    return null;
  }

  validateAccessOfInitializerApiMember(model, member);

  const optionsNode = (model.isRequired ? model.call.arguments[0] : model.call.arguments[1]) as
    | ts.Expression
    | undefined;
  const options =
    optionsNode !== undefined ? parseAndValidateInputAndOutputOptions(optionsNode) : null;
  const classPropertyName = member.name;
  const bindingPropertyName = options?.alias ?? classPropertyName;

  return {
    call: model.call,
    input: {
      isSignal: true,
      transform: null,
      classPropertyName,
      bindingPropertyName,
      required: model.isRequired,
    },
    output: {
      isSignal: false,
      classPropertyName,
      bindingPropertyName: bindingPropertyName + 'Change',
    },
  };
}
