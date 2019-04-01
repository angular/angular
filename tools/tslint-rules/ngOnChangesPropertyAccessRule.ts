import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as tsutils from 'tsutils';

/**
 * Rule that catches cases where a property of a `SimpleChanges` object is accessed directly,
 * rather than through a literal. Accessing properties of `SimpleChanges` directly can break
 * when using Closure's property renaming.
 */
export class Rule extends Lint.Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

class Walker extends Lint.ProgramAwareRuleWalker {
  visitMethodDeclaration(method: ts.MethodDeclaration) {
    // Walk through all of the `ngOnChanges` methods that have at least one parameter.
    if (method.name.getText() !== 'ngOnChanges' || !method.parameters.length || !method.body) {
      return;
    }

    const walkChildren = (node: ts.Node) => {
      // Walk through all the nodes and look for property access expressions
      // (e.g. `changes.something`). Note that this is different from element access
      // expressions which look like `changes['something']`.
      if (tsutils.isPropertyAccessExpression(node)) {
        const symbol = this.getTypeChecker().getTypeAtLocation(node.expression).symbol;

        // Add a failure if we're trying to access a property on a SimpleChanges object
        // directly, because it can cause issues with Closure's property renaming.
        if (symbol && symbol.name === 'SimpleChanges') {
          const expressionName = node.expression.getText();
          const propName = node.name.getText();

          this.addFailureAtNode(node, 'Accessing properties of SimpleChanges objects directly ' +
                                      'is not allowed. Use index access instead (e.g. ' +
                                      `${expressionName}.${propName} should be ` +
                                      `${expressionName}['${propName}']).`);
        }
      }

      // Don't walk the property accesses inside of call expressions. This prevents us
      // from flagging cases like `changes.hasOwnProperty('something')` incorrectly.
      if (!tsutils.isCallExpression(node)) {
        node.forEachChild(walkChildren);
      }
    };

    method.body.forEachChild(walkChildren);
    super.visitMethodDeclaration(method);
  }
}
