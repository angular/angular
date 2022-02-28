import * as Lint from 'tslint';
import ts from 'typescript';

/** Rule that enforces that ternary expressions aren't being nested. */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(
      sourceFile,
      context => {
        (function walk(node: ts.Node) {
          if (!ts.isConditionalExpression(node)) {
            ts.forEachChild(node, walk);
          } else if (hasNestedTernary(node)) {
            context.addFailureAtNode(node, 'Nested ternary expression are not allowed.');
          }
        })(context.sourceFile);
      },
      this.getOptions().ruleArguments,
    );
  }
}

/** Checks whether a ternary expression has another ternary inside of it. */
function hasNestedTernary(rootNode: ts.ConditionalExpression): boolean {
  let hasNestedTernaryDescendant = false;

  // Start from the immediate children of the root node.
  rootNode.forEachChild(function walk(node: ts.Node) {
    // Stop checking if we've hit a ternary. Also note that we don't descend
    // into call expressions, because it's valid to have a ternary expression
    // inside of a callback which is one of the arguments of a ternary.
    if (ts.isConditionalExpression(node)) {
      hasNestedTernaryDescendant = true;
    } else if (!ts.isCallExpression(node)) {
      node.forEachChild(walk);
    }
  });

  return hasNestedTernaryDescendant;
}
