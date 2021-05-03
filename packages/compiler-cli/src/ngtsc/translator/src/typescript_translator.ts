/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '@angular/compiler';
import * as ts from 'typescript';

import {ImportGenerator} from './api/import_generator';
import {Context} from './context';
import {ExpressionTranslatorVisitor, TranslatorOptions} from './translator';
import {TypeScriptAstFactory} from './typescript_ast_factory';

export function translateExpression(
    expression: o.Expression, imports: ImportGenerator<ts.Expression>,
    options: TranslatorOptions<ts.Expression> = {}): ts.Expression {
  return expression.visitExpression(
      new ExpressionTranslatorVisitor<ts.Statement, ts.Expression>(
          new TypeScriptAstFactory(options.annotateForClosureCompiler === true), imports, options),
      new Context(false));
}

export function translateStatement(
    statement: o.Statement, imports: ImportGenerator<ts.Expression>,
    options: TranslatorOptions<ts.Expression> = {}): ts.Statement {
  return statement.visitStatement(
      new ExpressionTranslatorVisitor<ts.Statement, ts.Expression>(
          new TypeScriptAstFactory(options.annotateForClosureCompiler === true), imports, options),
      new Context(true));
}
