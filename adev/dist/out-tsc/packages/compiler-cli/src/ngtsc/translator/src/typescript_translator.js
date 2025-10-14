/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Context} from './context';
import {ExpressionTranslatorVisitor} from './translator';
import {TypeScriptAstFactory} from './typescript_ast_factory';
export function translateExpression(contextFile, expression, imports, options = {}) {
  return expression.visitExpression(
    new ExpressionTranslatorVisitor(
      new TypeScriptAstFactory(options.annotateForClosureCompiler === true),
      imports,
      contextFile,
      options,
    ),
    new Context(false),
  );
}
export function translateStatement(contextFile, statement, imports, options = {}) {
  return statement.visitStatement(
    new ExpressionTranslatorVisitor(
      new TypeScriptAstFactory(options.annotateForClosureCompiler === true),
      imports,
      contextFile,
      options,
    ),
    new Context(true),
  );
}
//# sourceMappingURL=typescript_translator.js.map
