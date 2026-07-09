/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Used to identify what type the comment is. */
export enum CommentTriviaType {
  DIAGNOSTIC = 'D',
  EXPRESSION_TYPE_IDENTIFIER = 'T',
}

/** Identifies what the TCB expression is for (for example, a directive declaration). */
export enum ExpressionIdentifier {
  DIRECTIVE = 'DIR',
  HOST_DIRECTIVE = 'HOSTDIR',
  COMPONENT_COMPLETION = 'COMPCOMP',
  EVENT_PARAMETER = 'EP',
  VARIABLE_AS_EXPRESSION = 'VAE',
}
