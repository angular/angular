/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ImportedSymbolsTracker} from '../../../imports';
import {ModelMapping} from '../../../metadata';
import {ClassMember, ReflectionHost} from '../../../reflection';

import {tryParseInitializerApiMember} from './initializer_functions';
import {parseAndValidateInputAndOutputOptions} from './input_output_parse_options';

/**
 * Attempts to parse a model class member. Returns the parsed model mapping if possible.
 */
export function tryParseSignalModelMapping(
    member: Pick<ClassMember, 'name'|'value'>, reflector: ReflectionHost,
    importTracker: ImportedSymbolsTracker): ModelMapping|null {
  const model = tryParseInitializerApiMember(
      [{functionName: 'model', owningModule: '@angular/core'}], member, reflector, importTracker);
  if (model === null) {
    return null;
  }

  const optionsNode =
      (model.isRequired ? model.call.arguments[0] : model.call.arguments[1]) as ts.Expression |
      undefined;
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
    }
  };
}
