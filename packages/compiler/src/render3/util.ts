/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {escapeIdentifier} from '../output/abstract_emitter';
import * as o from '../output/output_ast';

import {ParseError, ParseSourceSpan} from '../parse_util';

import * as t from './r3_ast';
import {Identifiers} from './r3_identifiers';

/**
 * Pattern to group a string into leading whitespace, non whitespace, and trailing whitespace.
 * Useful for getting the variable name span when a span can contain leading and trailing space.
 */
const CHARACTERS_IN_SURROUNDING_WHITESPACE_PATTERN = /(\s*)(\S+)(\s*)/;

/** Regex that includes unsafe characters in an object literal property name. */
const UNSAFE_OBJECT_KEY_NAME_REGEXP = /[-.]/;

/** Pattern used to validate a JavaScript identifier. */
export const IDENTIFIER_PATTERN = /^[$A-Z_][0-9A-Z_$]*$/i;

/** Pattern used to identify a `let` parameter. */
export const LET_PATTERN = /^let\s+([\S\s]*)/;

/**
 * Parses the `let` parameter of a `@for` or `@error` block.
 *
 * @param sourceSpan The source span of the entire `let` parameter.
 * @param expression The expression string of the `let` parameter, e.g., `"foo = $implicit, bar = $index"`.
 * @param span The source span of the expression string.
 * @param context The variable context to append parsed variables to.
 * @param errors The array of parsing errors to append to.
 * @param messagePrefix The prefix to use in error messages (e.g. '@for loop').
 * @param defaultImplicitVariableName An optional default variable name to use if no value is provided.
 */
export function parseLetParameters(
  sourceSpan: ParseSourceSpan,
  expression: string,
  span: ParseSourceSpan,
  context: t.Variable[],
  errors: ParseError[],
  validateLet: (name: string, variableName: string, sourceSpan: ParseSourceSpan) => void,
  messagePrefix: string,
  defaultImplicitVariableName?: string,
): void {
  const parts = expression.split(',');
  let startSpan = span.start;
  for (const part of parts) {
    const expressionParts = part.split('=');
    const name = expressionParts[0].trim();
    let variableName =
      expressionParts.length === 2
        ? expressionParts[1].trim()
        : (defaultImplicitVariableName ?? '');

    if (name.length === 0 || variableName.length === 0) {
      errors.push(
        new ParseError(
          sourceSpan,
          `Invalid ${messagePrefix} "let" parameter. Parameter should match the pattern "<name> = <variable name>"`,
        ),
      );
    } else {
      validateLet(name, variableName, sourceSpan);

      const [, keyLeadingWhitespace, keyName] =
        expressionParts[0].match(CHARACTERS_IN_SURROUNDING_WHITESPACE_PATTERN) ?? [];
      const keySpan =
        keyLeadingWhitespace !== undefined
          ? new ParseSourceSpan(
              /* strip leading spaces */
              startSpan.moveBy(keyLeadingWhitespace.length),
              /* advance to end of the variable name */
              startSpan.moveBy(keyLeadingWhitespace.length + keyName.length),
            )
          : span;

      let valueSpan: ParseSourceSpan | undefined = undefined;
      if (expressionParts.length === 2) {
        const [, valueLeadingWhitespace, implicit] =
          expressionParts[1].match(CHARACTERS_IN_SURROUNDING_WHITESPACE_PATTERN) ?? [];
        valueSpan =
          valueLeadingWhitespace !== undefined
            ? new ParseSourceSpan(
                startSpan.moveBy(expressionParts[0].length + 1 + valueLeadingWhitespace.length),
                startSpan.moveBy(
                  expressionParts[0].length + 1 + valueLeadingWhitespace.length + implicit.length,
                ),
              )
            : undefined;
      }
      const variableSpan = new ParseSourceSpan(keySpan.start, valueSpan?.end ?? keySpan.end);
      context.push(new t.Variable(name, variableName, variableSpan, keySpan, valueSpan));
    }
    startSpan = startSpan.moveBy(part.length + 1 /* add 1 to move past the comma */);
  }
}

export function typeWithParameters(type: o.Expression, numParams: number): o.ExpressionType {
  if (numParams === 0) {
    return o.expressionType(type);
  }
  const params: o.Type[] = [];
  for (let i = 0; i < numParams; i++) {
    params.push(o.DYNAMIC_TYPE);
  }
  return o.expressionType(type, undefined, params);
}

export interface R3Reference {
  value: o.Expression;
  type: o.Expression;
}

/**
 * Result of compilation of a render3 code unit, e.g. component, directive, pipe, etc.
 */
export interface R3CompiledExpression {
  expression: o.Expression;
  type: o.Type;
  statements: o.Statement[];
}

export function getSafePropertyAccessString(accessor: string, name: string): string {
  const escapedName = escapeIdentifier(name, false);
  return escapedName !== name ? `${accessor}[${escapedName}]` : `${accessor}.${name}`;
}

export function jitOnlyGuardedExpression(expr: o.Expression): o.Expression {
  return guardedExpression('ngJitMode', expr);
}

export function devOnlyGuardedExpression(expr: o.Expression): o.Expression {
  return guardedExpression('ngDevMode', expr);
}

function guardedExpression(guard: string, expr: o.Expression): o.Expression {
  const guardExpr = new o.ExternalExpr({name: guard, moduleName: null});
  const guardNotDefined = new o.BinaryOperatorExpr(
    o.BinaryOperator.Identical,
    new o.TypeofExpr(guardExpr),
    o.literal('undefined'),
  );
  const guardUndefinedOrTrue = new o.BinaryOperatorExpr(
    o.BinaryOperator.Or,
    guardNotDefined,
    guardExpr,
    /* type */ undefined,
    /* sourceSpan */ undefined,
  );
  return new o.BinaryOperatorExpr(o.BinaryOperator.And, guardUndefinedOrTrue, expr);
}

export function wrapReference(value: any): R3Reference {
  const wrapped = new o.WrappedNodeExpr(value);
  return {value: wrapped, type: wrapped};
}

export function refsToArray(refs: R3Reference[], shouldForwardDeclare: boolean): o.Expression {
  const values = o.literalArr(refs.map((ref) => ref.value));
  return shouldForwardDeclare ? o.arrowFn([], values) : values;
}

export function tsIgnoreComment(): o.LeadingComment {
  return o.leadingComment('@ts-ignore', true, true);
}

export function isUnsafeObjectKey(key: string): boolean {
  return UNSAFE_OBJECT_KEY_NAME_REGEXP.test(key);
}

/**
 * Describes an expression that may have been wrapped in a `forwardRef()` guard.
 *
 * This is used when describing expressions that can refer to types that may eagerly reference types
 * that have not yet been defined.
 */
export interface MaybeForwardRefExpression<T extends o.Expression = o.Expression> {
  /**
   * The unwrapped expression.
   */
  expression: T;
  /**
   * Specified whether the `expression` contains a reference to something that has not yet been
   * defined, and whether the expression is still wrapped in a `forwardRef()` call.
   *
   * If this value is `ForwardRefHandling.None` then the `expression` is safe to use as-is.
   *
   * Otherwise the `expression` was wrapped in a call to `forwardRef()` and must not be eagerly
   * evaluated. Instead it must be wrapped in a function closure that will be evaluated lazily to
   * allow the definition of the expression to be evaluated first.
   *
   * In full AOT compilation it can be safe to unwrap the `forwardRef()` call up front if the
   * expression will actually be evaluated lazily inside a function call after the value of
   * `expression` has been defined.
   *
   * But in other cases, such as partial AOT compilation or JIT compilation the expression will be
   * evaluated eagerly in top level code so will need to continue to be wrapped in a `forwardRef()`
   * call.
   *
   */
  forwardRef: ForwardRefHandling;
}

export function createMayBeForwardRefExpression<T extends o.Expression>(
  expression: T,
  forwardRef: ForwardRefHandling,
): MaybeForwardRefExpression<T> {
  return {expression, forwardRef};
}

/**
 * Convert a `MaybeForwardRefExpression` to an `Expression`, possibly wrapping its expression in a
 * `forwardRef()` call.
 *
 * If `MaybeForwardRefExpression.forwardRef` is `ForwardRefHandling.Unwrapped` then the expression
 * was originally wrapped in a `forwardRef()` call to prevent the value from being eagerly evaluated
 * in the code.
 *
 * See `packages/compiler-cli/src/ngtsc/annotations/src/injectable.ts` and
 * `packages/compiler/src/jit_compiler_facade.ts` for more information.
 */
export function convertFromMaybeForwardRefExpression({
  expression,
  forwardRef,
}: MaybeForwardRefExpression): o.Expression {
  switch (forwardRef) {
    case ForwardRefHandling.None:
    case ForwardRefHandling.Wrapped:
      return expression;
    case ForwardRefHandling.Unwrapped:
      return generateForwardRef(expression);
  }
}

/**
 * Generate an expression that has the given `expr` wrapped in the following form:
 *
 * ```ts
 * forwardRef(() => expr)
 * ```
 */
export function generateForwardRef(expr: o.Expression): o.Expression {
  return o.importExpr(Identifiers.forwardRef).callFn([o.arrowFn([], expr)]);
}

/**
 * Specifies how a forward ref has been handled in a MaybeForwardRefExpression
 */
export const enum ForwardRefHandling {
  /** The expression was not wrapped in a `forwardRef()` call in the first place. */
  None,
  /** The expression is still wrapped in a `forwardRef()` call. */
  Wrapped,
  /** The expression was wrapped in a `forwardRef()` call but has since been unwrapped. */
  Unwrapped,
}
