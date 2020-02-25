/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import * as ng from './types';

export interface DiagnosticMessage {
  message: string;
  kind: keyof typeof ts.DiagnosticCategory;
}

export const Diagnostic: {[name: string]: DiagnosticMessage} = {
  directive_not_in_module: {
    message:
        `%1 '%2' is not included in a module and will not be available inside a template. Consider adding it to a NgModule declaration.`,
    kind: 'Suggestion',
  },

  missing_template_and_templateurl: {
    message: `Component '%1' must have a template or templateUrl`,
    kind: 'Error',
  },

  both_template_and_templateurl: {
    message: `Component '%1' must not have both template and templateUrl`,
    kind: 'Error',
  },

  invalid_templateurl: {
    message: `URL does not point to a valid file`,
    kind: 'Error',
  },

  template_context_missing_member: {
    message: `The template context of '%1' does not define %2.\n` +
        `If the context type is a base type or 'any', consider refining it to a more specific type.`,
    kind: 'Suggestion',
  },

  callable_expression_expected_method_call: {
    message: 'Unexpected callable expression. Expected a method call',
    kind: 'Warning',
  },

  call_target_not_callable: {
    message: 'Call target is not callable',
    kind: 'Error',
  },

  expression_might_be_null: {
    message: 'The expression might be null',
    kind: 'Error',
  },

  expected_a_number_type: {
    message: 'Expected a number type',
    kind: 'Error',
  },

  expected_a_string_or_number_type: {
    message: 'Expected operands to be a string or number type',
    kind: 'Error',
  },

  expected_operands_of_similar_type_or_any: {
    message: 'Expected operands to be of similar type or any',
    kind: 'Error',
  },

  unrecognized_operator: {
    message: 'Unrecognized operator %1',
    kind: 'Error',
  },

  unrecognized_primitive: {
    message: 'Unrecognized primitive %1',
    kind: 'Error',
  },

  no_pipe_found: {
    message: 'No pipe of name %1 found',
    kind: 'Error',
  },

  // TODO: Consider a better error message here.
  unable_to_resolve_compatible_call_signature: {
    message: 'Unable to resolve compatible call signature',
    kind: 'Error',
  },

  unable_to_resolve_signature: {
    message: 'Unable to resolve signature for call of %1',
    kind: 'Error',
  },

  could_not_resolve_type: {
    message: `Could not resolve the type of '%1'`,
    kind: 'Error',
  },

  identifier_not_callable: {
    message: `'%1' is not callable`,
    kind: 'Error',
  },

  identifier_possibly_undefined: {
    message:
        `'%1' is possibly undefined. Consider using the safe navigation operator (%2) or non-null assertion operator (%3).`,
    kind: 'Suggestion',
  },

  identifier_not_defined_in_app_context: {
    message:
        `Identifier '%1' is not defined. The component declaration, template variable declarations, and element references do not contain such a member`,
    kind: 'Error',
  },

  identifier_not_defined_on_receiver: {
    message: `Identifier '%1' is not defined. '%2' does not contain such a member`,
    kind: 'Error',
  },

  identifier_is_private: {
    message: `Identifier '%1' refers to a private member of %2`,
    kind: 'Warning',
  },
};

export function createDiagnostic(
    span: ng.Span, dm: DiagnosticMessage, ...formatArgs: string[]): ng.Diagnostic {
  const formattedMessage =
      dm.message.replace(/%(\d+)/g, (_, index: string) => formatArgs[+index - 1]);
  return {
    kind: ts.DiagnosticCategory[dm.kind],
    message: formattedMessage, span,
  };
}
