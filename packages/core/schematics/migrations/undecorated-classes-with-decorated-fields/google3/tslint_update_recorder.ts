/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure} from 'tslint';
import * as ts from 'typescript';

import {UpdateRecorder} from '../update_recorder';

export class TslintUpdateRecorder implements UpdateRecorder {
  failures: RuleFailure[] = [];

  constructor(private ruleName: string, private sourceFile: ts.SourceFile) {}

  addClassTodo(node: ts.ClassDeclaration, message: string) {
    this.failures.push(new RuleFailure(
        this.sourceFile, node.getStart(), 0, message, this.ruleName,
        Replacement.appendText(node.getStart(), `// TODO: ${message}`)));
  }

  /** Adds the specified decorator to the given class declaration. */
  addClassDecorator(node: ts.ClassDeclaration, decoratorText: string) {
    // Adding a decorator should be the last replacement. Replacements/rule failures
    // are handled in reverse and in case a decorator and import are inserted at
    // the start of the file, the class decorator should come after the import.
    this.failures.unshift(new RuleFailure(
        this.sourceFile, node.getStart(), 0,
        `Class needs to be decorated with ` +
            `"${decoratorText}" because it uses Angular features.`,
        this.ruleName, Replacement.appendText(node.getStart(), `${decoratorText}\n`)));
  }

  /** Adds the specified import to the source file at the given position */
  addNewImport(start: number, importText: string) {
    this.failures.push(new RuleFailure(
        this.sourceFile, start, 0, `Source file needs to have import: "${importText}"`,
        this.ruleName, Replacement.appendText(start, importText)));
  }

  /** Updates existing named imports to the given new named imports. */
  updateExistingImport(namedBindings: ts.NamedImports, newNamedBindings: string): void {
    const fix = [
      Replacement.deleteText(namedBindings.getStart(), namedBindings.getWidth()),
      Replacement.appendText(namedBindings.getStart(), newNamedBindings),
    ];
    this.failures.push(new RuleFailure(
        this.sourceFile, namedBindings.getStart(), namedBindings.getEnd(),
        `Import needs to be updated to import symbols: "${newNamedBindings}"`, this.ruleName, fix));
  }

  commitUpdate() {}
}
