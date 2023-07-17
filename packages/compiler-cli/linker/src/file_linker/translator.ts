/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '@angular/compiler';

import {AstFactory, Context, ExpressionTranslatorVisitor, ImportGenerator, TranslatorOptions} from '../../../src/ngtsc/translator';

/**
 * Generic translator helper class, which exposes methods for translating expressions and
 * statements.
 */
export class Translator<TStatement, TExpression> {
  constructor(private factory: AstFactory<TStatement, TExpression>) {}

  /**
   * Translate the given output AST in the context of an expression.
   */
  translateExpression(
      expression: o.Expression, imports: ImportGenerator<TExpression>,
      options: TranslatorOptions<TExpression> = {}): TExpression {
    return expression.visitExpression(
        new ExpressionTranslatorVisitor<TStatement, TExpression>(this.factory, imports, options),
        new Context(false));
  }

  /**
   * Translate the given output AST in the context of a statement.
   */
  translateStatement(
      statement: o.Statement, imports: ImportGenerator<TExpression>,
      options: TranslatorOptions<TExpression> = {}): TStatement {
    return statement.visitStatement(
        new ExpressionTranslatorVisitor<TStatement, TExpression>(this.factory, imports, options),
        new Context(true));
  }
}
