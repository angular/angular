import ts from 'typescript';
import * as Lint from 'tslint';
import * as tsutils from 'tsutils';

/**
 * Rule that enforces that we use `const enum` rather than a plain `enum`.
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {
  override visitEnumDeclaration(node: ts.EnumDeclaration) {
    if (!tsutils.hasModifier(node.modifiers, ts.SyntaxKind.ConstKeyword)) {
      this.addFailureAtNode(node.name, 'Enums should be declared as `const enum`.');
    }

    super.visitEnumDeclaration(node);
  }
}
