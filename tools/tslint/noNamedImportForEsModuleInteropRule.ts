/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuleFailure, WalkContext} from 'tslint/lib';
import {AbstractRule} from 'tslint/lib/rules';
import ts from 'typescript';

const FAILURE_MESSAGE =
    'Named import is not allowed. The module does not expose named exports when ' +
    'imported in an ES module. Use a default import instead.';

// TODO(devversion): move this rule into dev-infra.

/**
 * Rule that blocks named imports from being used for certain configured module
 * specifiers. This is helpful for enforcing an ESM-compatible interop with CommonJS
 * modules which do not expose named bindings at runtime.
 *
 * For example, consider the `typescript` module. It does not statically expose named
 * exports even though the type definition suggests it. An import like the following
 * will break at runtime when the `typescript` CommonJS module is imported inside an ESM.
 *
 * ```
 * import * as ts from 'typescript';
 * console.log(ts.SyntaxKind.CallExpression); // `SyntaxKind is undefined`.
 * ```
 *
 * More details here: https://nodejs.org/api/esm.html#esm_import_statements.
 */
export class Rule extends AbstractRule {
  override apply(sourceFile: ts.SourceFile): RuleFailure[] {
    const modulesToBlock = this.getOptions().ruleArguments;
    return this.applyWithFunction(sourceFile, (ctx) => visitNode(sourceFile, ctx, modulesToBlock));
  }
}

function visitNode(node: ts.Node, ctx: WalkContext, modulesToBlock: string[]) {
  if (isNamedImportToBlock(node, modulesToBlock)) {
    ctx.addFailureAtNode(node, FAILURE_MESSAGE);
    return;
  }

  ts.forEachChild(node, (node) => visitNode(node, ctx, modulesToBlock));
}

function isNamedImportToBlock(node: ts.Node, modulesToBlock: string[]): boolean {
  if (!ts.isImportDeclaration(node) || node.importClause === undefined) {
    return false;
  }
  const specifier = node.moduleSpecifier as ts.StringLiteral;
  return !!node.importClause.namedBindings && modulesToBlock.includes(specifier.text);
}
