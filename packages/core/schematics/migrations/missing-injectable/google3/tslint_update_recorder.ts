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

  addClassDecorator(node: ts.ClassDeclaration, decoratorText: string, className: string) {
    // Adding a decorator should be the last replacement. Replacements/rule failures
    // are handled in reverse and in case a decorator and import are inserted at
    // the start of the file, the class decorator should come after the import.
    this.failures.unshift(new RuleFailure(
        this.sourceFile, node.getStart(), 0,
        `Class needs to be decorated with ` +
            `"${decoratorText}" because it has been provided by "${className}".`,
        this.ruleName, Replacement.appendText(node.getStart(), `${decoratorText}\n`)));
  }

  addNewImport(start: number, importText: string) {
    this.failures.push(new RuleFailure(
        this.sourceFile, start, 0, `Source file needs to have import: "${importText}"`,
        this.ruleName, Replacement.appendText(start, importText)));
  }

  updateExistingImport(namedBindings: ts.NamedImports, newNamedBindings: string): void {
    const fix = [
      Replacement.deleteText(namedBindings.getStart(), namedBindings.getWidth()),
      Replacement.appendText(namedBindings.getStart(), newNamedBindings),
    ];
    this.failures.push(new RuleFailure(
        this.sourceFile, namedBindings.getStart(), namedBindings.getEnd(),
        `Import needs to be updated to import symbols: "${newNamedBindings}"`, this.ruleName, fix));
  }

  replaceDecorator(decorator: ts.Node, newText: string, className: string): void {
    const fix = [
      Replacement.deleteText(decorator.getStart(), decorator.getWidth()),
      Replacement.appendText(decorator.getStart(), newText),
    ];
    this.failures.push(new RuleFailure(
        this.sourceFile, decorator.getStart(), decorator.getEnd(),
        `Decorator needs to be replaced with "${newText}" because it has been provided ` +
            `by "${className}"`,
        this.ruleName, fix));
  }


  updateObjectLiteral(node: ts.ObjectLiteralExpression, newText: string): void {
    this.failures.push(new RuleFailure(
        this.sourceFile, node.getStart(), node.getEnd(),
        `Object literal needs to be updated to: ${newText}`, this.ruleName,
        Replacement.replaceFromTo(node.getStart(), node.getEnd(), newText)));
  }

  commitUpdate() {}
}
