import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as tsutils from 'tsutils';

/**
 * Rule that enforces that property setters are declared after getters.
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {
  visitGetAccessor(getter: ts.GetAccessorDeclaration) {
    if (getter.parent && tsutils.isClassDeclaration(getter.parent)) {
      const getterName = getter.name.getText();
      const setter = getter.parent.members.find(member => {
        return tsutils.isSetAccessorDeclaration(member) && member.name.getText() === getterName;
      }) as ts.SetAccessorDeclaration | undefined;

      if (setter && setter.pos < getter.pos) {
        this.addFailureAtNode(setter, 'Setters must be declared after getters.');
      }
    }

    super.visitGetAccessor(getter);
  }
}
