/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '@angular/compiler';
import ts from 'typescript';

import {ImportGenerator} from './api/import_generator';
import {Context} from './context';
import {ExpressionTranslatorVisitor, TranslatorOptions} from './translator';
import {TypeScriptAstFactory} from './typescript_ast_factory';

export function translateExpression(
  contextFile: ts.SourceFile,
  expression: o.Expression,
  imports: ImportGenerator<ts.SourceFile, ts.Expression>,
  options: TranslatorOptions<ts.Expression> = {},
): ts.Expression {
  return expression.visitExpression(
    new ExpressionTranslatorVisitor<ts.SourceFile, ts.Statement, ts.Expression>(
      new TypeScriptAstFactory(options.annotateForClosureCompiler === true),
      imports,
      contextFile,
      options,
    ),
    new Context(false),
  );
}

export function translateStatement(
  contextFile: ts.SourceFile,
  statement: o.Statement,
  imports: ImportGenerator<ts.SourceFile, ts.Expression>,
  options: TranslatorOptions<ts.Expression> = {},
): ts.Statement {
  return statement.visitStatement(
    new ExpressionTranslatorVisitor<ts.SourceFile, ts.Statement, ts.Expression>(
      new TypeScriptAstFactory(options.annotateForClosureCompiler === true),
      imports,
      contextFile,
      options,
    ),
    new Context(true),
  );
}
