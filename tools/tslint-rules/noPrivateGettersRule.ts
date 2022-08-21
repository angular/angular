import ts from 'typescript';
import * as Lint from 'tslint';

/**
 * Rule that doesn't allow private getters.
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {
  /**
   * Members whose name matches this pattern will be considered
   * private, even if they don't have the private modifier.
   */
  private _pattern: RegExp | null;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);
    this._pattern = options.ruleArguments.length ? new RegExp(options.ruleArguments[0]) : null;
  }

  override visitGetAccessor(getter: ts.GetAccessorDeclaration) {
    const getterName = getter.name.getText();
    const matchesPattern = !this._pattern || this._pattern.test(getterName);
    const isPrivate = getter.modifiers?.some(modifier => {
      return modifier.kind === ts.SyntaxKind.PrivateKeyword;
    });

    // Verify that the getter either matches the configured or is private and it's part of a class.
    if (
      (!matchesPattern && !isPrivate) ||
      !getter.parent ||
      !ts.isClassDeclaration(getter.parent)
    ) {
      return super.visitGetAccessor(getter);
    }

    const setter = getter.parent.members.find(member => {
      return ts.isSetAccessorDeclaration(member) && member.name.getText() === getterName;
    }) as ts.SetAccessorDeclaration | undefined;

    // Only log a failure if it doesn't have a corresponding setter.
    if (!setter) {
      this.addFailureAtNode(
        getter.name,
        'Private getters generate unnecessary ' + 'code. Use a function instead.',
      );
    }

    return super.visitGetAccessor(getter);
  }
}
