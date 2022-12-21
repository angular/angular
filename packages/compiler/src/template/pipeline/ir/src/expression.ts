/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import type {ParseSourceSpan} from '../../../../parse_util';

import {ExpressionKind} from './enums';

/**
 * An `o.Expression` subtype representing a logical expression in the intermediate representation.
 */
export type Expression = LexicalReadExpr;

/**
 * Transformer type which converts IR expressions into general `o.Expression`s (which may be an
 * identity transformation).
 */
export type ExpressionTransform = (expr: Expression) => o.Expression;

/**
 * Check whether a given `o.Expression` is a logical IR expression type.
 */
export function isIrExpression(expr: o.Expression): boolean {
  return expr instanceof ExpressionBase;
}

/**
 * Base type used for all logical IR expressions.
 */
export abstract class ExpressionBase extends o.Expression {
  abstract readonly kind: ExpressionKind;

  constructor(sourceSpan: ParseSourceSpan|null = null) {
    super(null, sourceSpan);
  }

  /**
   * Run the transformer against any nested expressions which may be present in this IR expression
   * subtype.
   */
  abstract transformInternalExpressions(transform: ExpressionTransform): void;
}

/**
 * Logical expression representing a lexical read of a variable name.
 */
export class LexicalReadExpr extends ExpressionBase {
  readonly kind = ExpressionKind.LexicalRead;

  constructor(readonly name: string) {
    super();
  }

  override visitExpression(visitor: o.ExpressionVisitor, context: any): void {}

  override isEquivalent(): boolean {
    return false;
  }

  override isConstant(): boolean {
    return false;
  }

  override transformInternalExpressions(): void {}
}
