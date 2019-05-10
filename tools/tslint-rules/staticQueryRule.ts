import * as ts from 'typescript';
import * as Lint from 'tslint';

/**
 * Rule which enforces that all queries are explicitly marked as static or non-static.
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {
  visitPropertyDeclaration(node: ts.PropertyDeclaration) {
    const childQueryDecorator = node.decorators && node.decorators.find(decorator => {
      const expression = (decorator.expression as ts.CallExpression);
      const name = expression && expression.expression.getText();
      return name === 'ViewChild' || name === 'ContentChild';
    });

    if (childQueryDecorator) {
      const options = (childQueryDecorator.expression as ts.CallExpression).arguments[1];

      if (!options || !ts.isObjectLiteralExpression(options) ||
          !this._getObjectProperty(options, 'static')) {
        this.addFailureAtNode(childQueryDecorator,
                              'Queries have to explicitly set the `static` option.');
      }
    }

    super.visitPropertyDeclaration(node);
  }

  /** Gets the node of an object property by name. */
  private _getObjectProperty(node: ts.ObjectLiteralExpression, name: string) {
    return node.properties.find(property => (property.name as ts.Identifier).getText() === name);
  }
}
