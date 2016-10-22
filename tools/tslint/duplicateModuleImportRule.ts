/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {RuleWalker} from 'tslint/lib/language/walker';
import {RuleFailure} from 'tslint/lib/lint';
import {AbstractRule} from 'tslint/lib/rules';
import * as ts from 'typescript';

export class Rule extends AbstractRule {
  public static FAILURE_STRING = 'duplicate module import';

  public apply(sourceFile: ts.SourceFile): RuleFailure[] {
    const typedefWalker = new ModuleImportWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(typedefWalker);
  }
}

class ModuleImportWalker extends RuleWalker {
  importModulesSeen: string[] = [];

  protected visitImportDeclaration(node: ts.ImportDeclaration): void {
    this.visitModuleSpecifier(node.moduleSpecifier);
    super.visitImportDeclaration(node);
  }

  protected visitImportEqualsDeclaration(node: ts.ImportEqualsDeclaration): void {
    this.visitModuleSpecifier(node.moduleReference);
    super.visitImportEqualsDeclaration(node);
  }

  private visitModuleSpecifier(moduleSpecifier: ts.Node) {
    var text = moduleSpecifier.getText();
    if (this.importModulesSeen.indexOf(text) >= 0) {
      let failure =
          this.createFailure(moduleSpecifier.getEnd(), 1, 'Duplicate imports from module ' + text);
      this.addFailure(failure);
    }
    this.importModulesSeen.push(text);
  }
}
