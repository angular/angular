import {
  ArrayLiteralExpression,
  CallExpression,
  isCallExpression,
  NodeArray,
  ObjectLiteralExpression,
  PropertyAssignment,
  StringLiteral,
  SyntaxKind,
} from 'dgeni-packages/node_modules/typescript';
import {CategorizedClassDoc} from './dgeni-definitions';

/**
 * Determines the component or directive metadata from the specified Dgeni class doc. The resolved
 * directive metadata will be stored in a Map.
 *
 * Currently only string literal assignments and array literal assignments are supported. Other
 * value types are not necessary because they are not needed for any user-facing documentation.
 *
 * ```ts
 * @Component({
 *   inputs: ["red", "blue"],
 *   exportAs: "test"
 * })
 * export class MyComponent {}
 * ```
 */
export function getDirectiveMetadata(classDoc: CategorizedClassDoc): Map<string, any> | null {
  const declaration = classDoc.symbol.valueDeclaration;

  if (!declaration || !declaration.decorators) {
    return null;
  }

  const expression = declaration.decorators
    .filter(decorator => decorator.expression && isCallExpression(decorator.expression))
    .map(decorator => decorator.expression as CallExpression)
    .find(callExpression => callExpression.expression.getText() === 'Component' ||
                            callExpression.expression.getText() === 'Directive');

  if (!expression) {
    return null;
  }

  // The argument length of the CallExpression needs to be exactly one, because it's the single
  // JSON object in the @Component/@Directive decorator.
  if (expression.arguments.length !== 1) {
    return null;
  }

  const objectExpression = expression.arguments[0] as ObjectLiteralExpression;
  const resultMetadata = new Map<string, any>();

  (objectExpression.properties as NodeArray<PropertyAssignment>).forEach(prop => {
    // Support ArrayLiteralExpression assignments in the directive metadata.
    if (prop.initializer.kind === SyntaxKind.ArrayLiteralExpression) {
      const arrayData = (prop.initializer as ArrayLiteralExpression).elements
          .map(literal => (literal as StringLiteral).text);

      resultMetadata.set(prop.name.getText(), arrayData);
    }

    // Support normal StringLiteral and NoSubstitutionTemplateLiteral assignments
    if (prop.initializer.kind === SyntaxKind.StringLiteral ||
        prop.initializer.kind === SyntaxKind.NoSubstitutionTemplateLiteral) {
      resultMetadata.set(prop.name.getText(), (prop.initializer as StringLiteral).text);
    }
  });

  return resultMetadata;
}
