import * as ts from 'typescript';
import * as Lint from 'tslint';

/**
 * Rule that catches cases where `classList` is used in a way
 * that won't work in all browsers that we support.
 */
export class Rule extends Lint.Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

class Walker extends Lint.ProgramAwareRuleWalker {
  visitPropertyAccessExpression(propertyAccess: ts.PropertyAccessExpression) {
    const parent = propertyAccess.parent;

    // We only care about property accesses inside of calls.
    if (!ts.isCallExpression(parent)) {
      return;
    }

    // We only care about these method names.
    const name = propertyAccess.name.text;
    if (name !== 'add' && name !== 'remove' && name !== 'toggle' && name !== 'replace') {
      return;
    }

    const symbol = this.getTypeChecker().getTypeAtLocation(propertyAccess.expression).symbol;

    if (symbol && symbol.name === 'DOMTokenList') {
      const args = parent.arguments;

      if (name === 'replace') {
        this.addFailureAtNode(propertyAccess,
            'This method is not supported in iOS Safari. Use `add` and `remove` instead.');
      } else if (args.length > 1 || (args.length === 1 && ts.isSpreadElement(args[0]))) {
        this.addFailureAtNode(propertyAccess,
            'Passing in multiple arguments into this method is not supported in some browsers. ' +
            'Use the single argument signature instead.');
      }
    }

    super.visitPropertyAccessExpression(propertyAccess);
  }
}
