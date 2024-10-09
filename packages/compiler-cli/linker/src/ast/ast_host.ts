/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * An abstraction for getting information from an AST while being agnostic to the underlying AST
 * implementation.
 */
export interface AstHost<TExpression> {
  /**
   * Get the name of the symbol represented by the given expression node, or `null` if it is not a
   * symbol.
   */
  getSymbolName(node: TExpression): string | null;

  /**
   * Return `true` if the given expression is a string literal, or false otherwise.
   */
  isStringLiteral(node: TExpression): boolean;
  /**
   * Parse the string value from the given expression, or throw if it is not a string literal.
   */
  parseStringLiteral(str: TExpression): string;

  /**
   * Return `true` if the given expression is a numeric literal, or false otherwise.
   */
  isNumericLiteral(node: TExpression): boolean;
  /**
   * Parse the numeric value from the given expression, or throw if it is not a numeric literal.
   */
  parseNumericLiteral(num: TExpression): number;

  /**
   * Return `true` if the given expression can be considered a boolean literal, or false otherwise.
   *
   * Note that this should also cover the special case of some minified code where `true` and
   * `false` are replaced by `!0` and `!1` respectively.
   */
  isBooleanLiteral(node: TExpression): boolean;
  /**
   * Parse the boolean value from the given expression, or throw if it is not a boolean literal.
   *
   * Note that this should also cover the special case of some minified code where `true` and
   * `false` are replaced by `!0` and `!1` respectively.
   */
  parseBooleanLiteral(bool: TExpression): boolean;

  /**
   * Returns `true` if the value corresponds to `null`.
   */
  isNull(node: TExpression): boolean;

  /**
   * Return `true` if the given expression is an array literal, or false otherwise.
   */
  isArrayLiteral(node: TExpression): boolean;
  /**
   * Parse an array of expressions from the given expression, or throw if it is not an array
   * literal.
   */
  parseArrayLiteral(array: TExpression): TExpression[];

  /**
   * Return `true` if the given expression is an object literal, or false otherwise.
   */
  isObjectLiteral(node: TExpression): boolean;
  /**
   * Parse the given expression into a map of object property names to property expressions, or
   * throw if it is not an object literal.
   */
  parseObjectLiteral(obj: TExpression): Map<string, TExpression>;

  /**
   * Return `true` if the given expression is a function, or false otherwise.
   */
  isFunctionExpression(node: TExpression): boolean;
  /**
   * Compute the "value" of a function expression by parsing its body for a single `return`
   * statement, extracting the returned expression, or throw if it is not possible.
   */
  parseReturnValue(fn: TExpression): TExpression;

  /**
   * Returns the parameter expressions for the function, or throw if it is not a function.
   */
  parseParameters(fn: TExpression): TExpression[];

  /**
   * Return true if the given expression is a call expression, or false otherwise.
   */
  isCallExpression(node: TExpression): boolean;
  /**
   * Returns the expression that is called in the provided call expression, or throw if it is not
   * a call expression.
   */
  parseCallee(call: TExpression): TExpression;
  /**
   * Returns the argument expressions for the provided call expression, or throw if it is not
   * a call expression.
   */
  parseArguments(call: TExpression): TExpression[];

  /**
   * Compute the location range of the expression in the source file, to be used for source-mapping.
   */
  getRange(node: TExpression): Range;
}

/**
 * The location of the start and end of an expression in the original source file.
 */
export interface Range {
  /** 0-based character position of the range start in the source file text. */
  startPos: number;
  /** 0-based line index of the range start in the source file text. */
  startLine: number;
  /** 0-based column position of the range start in the source file text. */
  startCol: number;
  /** 0-based character position of the range end in the source file text. */
  endPos: number;
}
