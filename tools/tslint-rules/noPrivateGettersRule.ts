import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as tsutils from 'tsutils';

/**
 * Rule that doesn't allow private getters.
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {
  visitGetAccessor(getter: ts.GetAccessorDeclaration) {
    // Check whether the getter is private.
    if (!getter.modifiers || !getter.modifiers.find(m => m.kind === ts.SyntaxKind.PrivateKeyword)) {
      return super.visitGetAccessor(getter);
    }

    // Check that it's inside a class.
    if (!getter.parent || !tsutils.isClassDeclaration(getter.parent)) {
      return super.visitGetAccessor(getter);
    }

    const getterName = getter.name.getText();
    const setter = getter.parent.members.find(member => {
      return tsutils.isSetAccessorDeclaration(member) && member.name.getText() === getterName;
    }) as ts.SetAccessorDeclaration | undefined;

    // Only log a failure if it doesn't have a corresponding setter.
    if (!setter) {
      this.addFailureAtNode(getter, 'Private setters generate unnecessary ' +
                                    'code. Use a function instead.');
    }

    return super.visitGetAccessor(getter);
  }
}
