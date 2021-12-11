/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import ts from 'typescript';

import {anySymbolName, findControlClassUsages, findFormBuilderCalls, getAnyImport, getControlClassImports, getFormBuilderImport, MigratableNode} from '../typed-forms/util';

/** TSLint rule for Typed Forms migration. */
export class Rule extends Rules.TypedRule {
  override applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const typeChecker = program.getTypeChecker();

    const controlClassImports = getControlClassImports(sourceFile);
    const formBuilderImport = getFormBuilderImport(sourceFile);

    const failures: RuleFailure[] = [];

    // If no relevant classes are imported, we can exit early.
    if (controlClassImports.length === 0 && formBuilderImport !== null) return failures;

    // For each control class, migrate all of its uses.
    for (const importSpecifier of controlClassImports) {
      const usages = findControlClassUsages(sourceFile, typeChecker, importSpecifier);
      for (const node of usages) {
        failures.push(this.getNodeFailure(node, sourceFile));
      }
    }

    // For each FormBuilder method, migrate all of its uses.
    const nodes = findFormBuilderCalls(sourceFile, typeChecker, formBuilderImport);
    for (const n of nodes) {
      failures.push(this.getNodeFailure(n, sourceFile));
    }

    // Add the any symbol used by the migrated calls.
    if (getAnyImport(sourceFile) !== null) {
      const firstValidFormsImport =
          [...controlClassImports, formBuilderImport].sort().filter(i => i)[0]!;
      failures.push(this.getImportFailure(firstValidFormsImport, sourceFile));
    }

    return failures;
  }

  private getNodeFailure(node: MigratableNode, sourceFile: ts.SourceFile): RuleFailure {
    return new RuleFailure(
        sourceFile, node.node.getStart(), node.node.getEnd(),
        'Typed Forms requires a generic be provided for this identifier.', this.ruleName,
        new Replacement(
            node.node.getStart(), node.node.getWidth(), node.node.getText() + node.generic));
  }

  private getImportFailure(importd: ts.ImportSpecifier, sourceFile: ts.SourceFile): RuleFailure {
    return new RuleFailure(
        sourceFile, importd.getStart(), importd.getEnd(),
        `Typed Forms requires ${anySymbolName} to be imported.`, this.ruleName,
        new Replacement(
            importd.getStart(), importd.getWidth(), `${anySymbolName}, ` + importd.getText()));
  }
}
