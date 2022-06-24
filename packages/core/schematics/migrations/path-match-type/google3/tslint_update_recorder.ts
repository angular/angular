/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure} from 'tslint';
import ts from 'typescript';

import {UpdateRecorder} from '../update_recorder';

export class TslintUpdateRecorder implements UpdateRecorder {
  failures: RuleFailure[] = [];

  constructor(
      private ruleName: string, private sourceFile: ts.SourceFile, private printer: ts.Printer) {}

  updateNode(
      oldNode: ts.VariableDeclaration, newNode: ts.VariableDeclaration, sourceFile: ts.SourceFile) {
    const newText =
        ': ' + this.printer.printNode(ts.EmitHint.Unspecified, newNode.type!, sourceFile);
    this.failures.push(new RuleFailure(
        this.sourceFile, oldNode.name.getEnd(), 0, 'Must use explicit `Route`/`Routes` type.',
        this.ruleName, new Replacement(oldNode.name.getEnd(), 0, newText)));
  }

  /** Adds the specified import to the source file at the given position */
  addNewImport(start: number, importText: string) {
    this.failures.push(new RuleFailure(
        this.sourceFile, start, 0, `Source file needs to have import: "${importText}"`,
        this.ruleName, Replacement.appendText(start, importText)));
  }

  /** Updates existing named imports to the given new named imports. */
  updateExistingImport(namedBindings: ts.NamedImports, newNamedBindings: string): void {
    this.failures.push(new RuleFailure(
        this.sourceFile, namedBindings.getStart(), 0,
        `Import needs to be updated to import symbols: "${newNamedBindings}"`, this.ruleName,
        new Replacement(namedBindings.getStart(), namedBindings.getWidth(), newNamedBindings)));
  }

  commitUpdate() {}
}
