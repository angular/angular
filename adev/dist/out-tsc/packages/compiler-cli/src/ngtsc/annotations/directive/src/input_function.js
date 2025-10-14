/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ClassMemberAccessLevel} from '../../../reflection';
import {validateAccessOfInitializerApiMember} from './initializer_function_access';
import {tryParseInitializerApi} from './initializer_functions';
import {parseAndValidateInputAndOutputOptions} from './input_output_parse_options';
/** Represents a function that can declare an input. */
export const INPUT_INITIALIZER_FN = {
  functionName: 'input',
  owningModule: '@angular/core',
  // Inputs are accessed from parents, via the `property` instruction.
  // Conceptually, the fields need to be publicly readable, but in practice,
  // accessing `protected` or `private` members works at runtime, so we can allow
  // cases where the input is intentionally not part of the public API, programmatically.
  // Note: `private` is omitted intentionally as this would be a conceptual confusion point.
  allowedAccessLevels: [
    ClassMemberAccessLevel.PublicWritable,
    ClassMemberAccessLevel.PublicReadonly,
    ClassMemberAccessLevel.Protected,
  ],
};
/**
 * Attempts to parse a signal input class member. Returns the parsed
 * input mapping if possible.
 */
export function tryParseSignalInputMapping(member, reflector, importTracker) {
  if (member.value === null) {
    return null;
  }
  const signalInput = tryParseInitializerApi(
    [INPUT_INITIALIZER_FN],
    member.value,
    reflector,
    importTracker,
  );
  if (signalInput === null) {
    return null;
  }
  validateAccessOfInitializerApiMember(signalInput, member);
  const optionsNode = signalInput.isRequired
    ? signalInput.call.arguments[0]
    : signalInput.call.arguments[1];
  const options =
    optionsNode !== undefined ? parseAndValidateInputAndOutputOptions(optionsNode) : null;
  const classPropertyName = member.name;
  return {
    isSignal: true,
    classPropertyName,
    bindingPropertyName: options?.alias ?? classPropertyName,
    required: signalInput.isRequired,
    // Signal inputs do not capture complex transform metadata.
    // See more details in the `transform` type of `InputMapping`.
    transform: null,
  };
}
//# sourceMappingURL=input_function.js.map
