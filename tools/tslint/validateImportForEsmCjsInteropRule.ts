/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuleFailure, WalkContext} from 'tslint/lib';
import {AbstractRule} from 'tslint/lib/rules';
import ts from 'typescript';

const noNamedExportsError =
  'Named import is not allowed. The module does not expose named exports when ' +
  'imported in an ES module. Use a default import instead.';

const noDefaultExportError =
  'Default import is not allowed. The module does not expose a default export at ' +
  'runtime. Use a named import instead.';

interface RuleOptions {
  /**
   * List of modules without any named exports that NodeJS can statically detect when the
   * CommonJS module is imported from ESM. Node only exposes named exports which are
   * statically discoverable: https://nodejs.org/api/esm.html#esm_import_statements.
   */
  noNamedExports?: string[];
  /**
   * List of modules which appear to have named exports in the typings but do
   * not have any at runtime due to NodeJS not being able to discover these
   * through static analysis: https://nodejs.org/api/esm.html#esm_import_statements.
   * */
  noDefaultExport?: string[];
  /**
   * List of modules which are always incompatible. The rule allows for a custom
   * message to be provided when it discovers an import to such a module.
   */
  incompatibleModules?: Record<string, string>;
}

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
    const options = this.getOptions().ruleArguments[0];
    return this.applyWithFunction(sourceFile, (ctx) => visitNode(sourceFile, ctx, options));
  }
}

function visitNode(node: ts.Node, ctx: WalkContext, options: RuleOptions) {
  if (options.incompatibleModules && ts.isImportDeclaration(node)) {
    const specifier = node.moduleSpecifier as ts.StringLiteral;
    const failureMsg = options.incompatibleModules[specifier.text];

    if (failureMsg !== undefined) {
      ctx.addFailureAtNode(node, failureMsg);
      return;
    }
  }

  if (options.noNamedExports && isNamedImportToDisallowedModule(node, options.noNamedExports)) {
    ctx.addFailureAtNode(node, noNamedExportsError);
  }

  if (options.noDefaultExport && isDefaultImportToDisallowedModule(node, options.noDefaultExport)) {
    ctx.addFailureAtNode(node, noDefaultExportError);
  }

  ts.forEachChild(node, (n) => visitNode(n, ctx, options));
}

function isNamedImportToDisallowedModule(node: ts.Node, disallowed: string[]): boolean {
  if (!ts.isImportDeclaration(node) || node.importClause === undefined) {
    return false;
  }
  const specifier = node.moduleSpecifier as ts.StringLiteral;
  return !!node.importClause.namedBindings && disallowed.includes(specifier.text);
}

function isDefaultImportToDisallowedModule(node: ts.Node, disallowed: string[]) {
  if (!ts.isImportDeclaration(node) || node.importClause === undefined) {
    return false;
  }
  const specifier = node.moduleSpecifier as ts.StringLiteral;

  return node.importClause.name !== undefined && disallowed.includes(specifier.text);
}
