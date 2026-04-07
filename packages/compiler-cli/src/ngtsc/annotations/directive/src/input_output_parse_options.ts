/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../../diagnostics';
import {reflectObjectLiteral} from '../../../reflection';

/**
 * Parses and validates input and output initializer function options.
 *
 * This currently only parses the `alias` option and returns it. The other
 * options for signal inputs are runtime constructs that aren't relevant at
 * compile time.
 */
export function parseAndValidateInputAndOutputOptions(optionsNode: ts.Expression): {
  alias: string | undefined;
} {
  if (!ts.isObjectLiteralExpression(optionsNode)) {
    throw new FatalDiagnosticError(
      ErrorCode.VALUE_HAS_WRONG_TYPE,
      optionsNode,
      'Argument needs to be an object literal that is statically analyzable.',
    );
  }

  const options = reflectObjectLiteral(optionsNode);
  let alias: string | undefined = undefined;

  if (options.has('alias')) {
    const aliasExpr = options.get('alias')!;
    if (!ts.isStringLiteralLike(aliasExpr)) {
      throw new FatalDiagnosticError(
        ErrorCode.VALUE_HAS_WRONG_TYPE,
        aliasExpr,
        'Alias needs to be a string that is statically analyzable.',
      );
    }

    alias = aliasExpr.text;
  }

  return {alias};
}
