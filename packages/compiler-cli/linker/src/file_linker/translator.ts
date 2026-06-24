/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '@angular/compiler';
import {
  ExpressionTranslatorVisitor,
  TranslatorOptions,
} from '../../../src/ngtsc/translator/src/translator';
import {Context} from '../../../src/ngtsc/translator/src/context';
import {ImportGenerator} from '../../../src/ngtsc/translator/src/api/import_generator';
import {AstFactory} from '../../../src/ngtsc/translator/src/api/ast_factory';

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
    expression: o.Expression,
    imports: ImportGenerator<null, TExpression>,
    options: TranslatorOptions<TExpression> = {},
  ): TExpression {
    return expression.visitExpression(
      new ExpressionTranslatorVisitor<null, TStatement, TExpression>(
        this.factory,
        imports,
        null,
        options,
      ),
      new Context(false),
    );
  }

  /**
   * Translate the given output AST in the context of a statement.
   */
  translateStatement(
    statement: o.Statement,
    imports: ImportGenerator<null, TExpression>,
    options: TranslatorOptions<TExpression> = {},
  ): TStatement {
    return statement.visitStatement(
      new ExpressionTranslatorVisitor<null, TStatement, TExpression>(
        this.factory,
        imports,
        null,
        options,
      ),
      new Context(true),
    );
  }
}
