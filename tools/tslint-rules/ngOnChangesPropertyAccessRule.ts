import ts from 'typescript';
import * as Lint from 'tslint';

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
  override visitMethodDeclaration(method: ts.MethodDeclaration) {
    // Walk through all of the `ngOnChanges` methods that have at least one parameter.
    if (method.name.getText() !== 'ngOnChanges' || !method.parameters.length || !method.body) {
      return;
    }

    const walkChildren = (node: ts.Node) => {
      // Walk through all the nodes and look for property access expressions
      // (e.g. `changes.something`). Note that this is different from element access
      // expressions which look like `changes['something']`.
      if (ts.isPropertyAccessExpression(node) && this._isSimpleChangesAccess(method, node)) {
        const expressionName = node.expression.getText();
        const propName = node.name.getText();

        this.addFailureAtNode(
          node,
          'Accessing properties of SimpleChanges objects directly ' +
            'is not allowed. Use index access instead (e.g. ' +
            `${expressionName}.${propName} should be ` +
            `${expressionName}['${propName}']).`,
        );
      }

      // Don't walk calls to `hasOwnProperty` since they can be used for null checking.
      if (
        !ts.isCallExpression(node) ||
        !ts.isPropertyAccessExpression(node.expression) ||
        !ts.isIdentifier(node.expression.name) ||
        node.expression.name.text !== 'hasOwnProperty'
      ) {
        node.forEachChild(walkChildren);
      }
    };

    method.body.forEachChild(walkChildren);
    super.visitMethodDeclaration(method);
  }

  /** Checks whether a property access is operating on a `SimpleChanges` object. */
  private _isSimpleChangesAccess(method: ts.MethodDeclaration, node: ts.PropertyAccessExpression) {
    const changesParam = method.parameters[0];
    const changesName =
      changesParam && ts.isParameter(changesParam) && ts.isIdentifier(changesParam.name)
        ? changesParam.name.text
        : null;
    const receiverName = ts.isIdentifier(node.expression) ? node.expression.text : null;

    // Try to resolve based on the name. This should be quicker and more robust since it doesn't
    // require the type checker to be present and to have been configured correctly. Note that
    // we filter out property accesses inside of other property accesses since we only want to
    // look at top-level ones so that we don't flag something like `foo.bar.changes`.
    if (
      changesName &&
      receiverName &&
      changesName === receiverName &&
      !ts.isPropertyAccessExpression(node.parent)
    ) {
      return true;
    }

    // Fall back to trying to resolve using the type checker.
    const symbol = this.getTypeChecker().getTypeAtLocation(node.expression).symbol;
    return symbol != null && symbol.name === 'SimpleChanges';
  }
}
