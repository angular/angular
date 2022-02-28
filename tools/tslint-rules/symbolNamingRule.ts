import ts from 'typescript';
import * as Lint from 'tslint';

/** Lint rule that checks the names of classes and interfaces against a pattern. */
export class Rule extends Lint.Rules.AbstractRule {
  /** Pattern that we should validate against. */
  private _pattern: RegExp;

  constructor(options: Lint.IOptions) {
    super(options);
    this._pattern = new RegExp(options.ruleArguments[0] || '.*');
  }

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, checkSourceFile, this._pattern);
  }
}

function checkSourceFile(context: Lint.WalkContext<RegExp>) {
  context.sourceFile.forEachChild(function walk(node) {
    if (
      (ts.isClassDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node)) &&
      node.name &&
      !context.options.test(node.name.text)
    ) {
      context.addFailureAtNode(node.name, `Symbol name must match pattern ${context.options}`);
    }

    node.forEachChild(walk);
  });
}
