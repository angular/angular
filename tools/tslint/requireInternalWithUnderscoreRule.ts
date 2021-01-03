/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuleFailure} from 'tslint/lib';
import {RuleWalker} from 'tslint/lib/language/walker';
import {AbstractRule} from 'tslint/lib/rules';
import * as ts from 'typescript';

export class Rule extends AbstractRule {
  public apply(sourceFile: ts.SourceFile): RuleFailure[] {
    const typedefWalker = new TypedefWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(typedefWalker);
  }
}

class TypedefWalker extends RuleWalker {
  protected visitPropertyDeclaration(node: ts.PropertyDeclaration): void {
    this.assertInternalAnnotationPresent(node);
    super.visitPropertyDeclaration(node);
  }

  public visitMethodDeclaration(node: ts.MethodDeclaration): void {
    this.assertInternalAnnotationPresent(node);
    super.visitMethodDeclaration(node);
  }

  private hasInternalAnnotation(range: ts.CommentRange): boolean {
    const text = this.getSourceFile().text;
    const comment = text.substring(range.pos, range.end);
    return comment.indexOf('@internal') >= 0;
  }

  private assertInternalAnnotationPresent(node: ts.NamedDeclaration) {
    if (node.name && node.name.getText().charAt(0) !== '_') return;
    if (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Private) return;

    const ranges = ts.getLeadingCommentRanges(this.getSourceFile().text, node.pos);
    if (ranges) {
      for (let i = 0; i < ranges.length; i++) {
        if (this.hasInternalAnnotation(ranges[i])) return;
      }
    }
    this.addFailure(this.createFailure(
        node.getStart(), node.getWidth(),
        `module-private member ${node.name.getText()} must be annotated @internal`));
  }
}
