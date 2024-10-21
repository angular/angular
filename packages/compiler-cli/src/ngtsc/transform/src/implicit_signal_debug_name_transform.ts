import ts from 'typescript';

function insertDebugNameIntoExistingConfigObject(
  callExpression: ts.CallExpression,
  debugName: string,
  configPosition: number,
): ts.CallExpression {
  const nodeArgs = Array.from(callExpression.arguments);
  const existingArgument = nodeArgs[configPosition];
  if (!ts.isObjectLiteralExpression(existingArgument)) {
    // We shouldn't hit this case since this function is only called after this check is already done,
    // but in case this function is reused somewhere else, we rerun the check inside this function.
    return callExpression;
  }

  const properties = Array.from(existingArgument.properties);

  const debugNameExists = properties.some(
    (prop) =>
      ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'debugName',
  );

  if (debugNameExists) {
    return callExpression;
  }

  // We prepend instead of appending so that we don't overwrite an existing debugName Property
  // `{ foo: 'bar' }` -> `{ debugName: 'myDebugName', foo: 'bar' }`
  properties.unshift(
    ts.factory.createPropertyAssignment('debugName', ts.factory.createStringLiteral(debugName)),
  );

  // Create conditional to tree shake `debugName` on `ngDevMode`.
  // `(ngDevMode ? [{ debugName: 'myDebugName', foo: 'bar' }] : [{foo: 'bar'}])`
  const conditionalExpression = ts.factory.createParenthesizedExpression(
    ts.factory.createConditionalExpression(
      ts.factory.createIdentifier('ngDevMode'),
      undefined,
      ts.factory.createArrayLiteralExpression([
        ts.factory.createObjectLiteralExpression(properties),
      ]),
      undefined,
      ts.factory.createArrayLiteralExpression([
        ts.factory.createObjectLiteralExpression(existingArgument.properties),
      ]),
    ),
  );

  // `...(ngDevMode ? [{ debugName: 'myDebugName', foo: 'bar' }] : [{foo: 'bar'}])`
  const spreadElement = ts.factory.createSpreadElement(conditionalExpression);

  // Replace the existing config object with the new config object
  nodeArgs[configPosition] = spreadElement;

  return ts.factory.updateCallExpression(
    callExpression,
    callExpression.expression,
    callExpression.typeArguments,
    ts.factory.createNodeArray(nodeArgs),
  );
}

function insertDebugNameIntoCallExpression(
  callExpression: ts.CallExpression,
  debugName: string,
): ts.CallExpression {
  const configPosition = getConfigArgPosition(callExpression.expression);

  if (callExpression.arguments[configPosition] !== undefined) {
    // Do nothing if an identifier is used as the config object
    // Ex -
    // const defaultObject = { equals: () => false };
    // signal(123, defaultObject)
    if (ts.isIdentifier(callExpression.arguments[configPosition])) {
      return callExpression;
    }

    if (ts.isObjectLiteralExpression(callExpression.arguments[configPosition])) {
      return insertDebugNameIntoExistingConfigObject(callExpression, debugName, configPosition);
    }
  }

  const conditionalExpression = ts.factory.createParenthesizedExpression(
    ts.factory.createConditionalExpression(
      ts.factory.createIdentifier('ngDevMode'),
      undefined,
      ts.factory.createArrayLiteralExpression([
        ts.factory.createObjectLiteralExpression([
          ts.factory.createPropertyAssignment(
            'debugName',
            ts.factory.createStringLiteral(debugName),
          ),
        ]),
      ]),
      undefined,
      ts.factory.createArrayLiteralExpression(),
    ),
  );

  const spreadElement = ts.factory.createSpreadElement(conditionalExpression);

  const newArgs = [...callExpression.arguments];
  if (newArgs.length > configPosition) {
    newArgs[configPosition] = spreadElement;
  } else {
    newArgs.push(spreadElement);
  }

  return ts.factory.updateCallExpression(
    callExpression,
    callExpression.expression,
    callExpression.typeArguments,
    ts.factory.createNodeArray(newArgs),
  );
}

/**
 *
 * Determines if the node is a variable declaration with a call expression initializer.
 * Ex:
 * ```ts
 * const mySignal = signal(123);
 * ```
 */
function isVariableDeclarationCase(
  node: ts.Node,
): node is ts.VariableDeclaration & {initializer: ts.CallExpression} {
  if (!ts.isVariableDeclaration(node)) {
    return false;
  }

  if (!node.initializer || !ts.isCallExpression(node.initializer)) {
    return false;
  }

  let expression = node.initializer.expression;
  if (ts.isPropertyAccessExpression(expression)) {
    expression = expression.expression;
  }

  return ts.isIdentifier(expression) && isSignalFunction(expression);
}

/**
 *
 * Determines if the node is a property assignment with a call expression initializer.
 *
 * Ex:
 * ```ts
 * class MyClass {
 *   mySignal: Signal<number>;
 *   constructor() {
 *    this.mySignal = signal(123);
 *   }
 * }
 * ```
 */
function isPropertyAssignmentCase(node: ts.Node): node is ts.ExpressionStatement & {
  expression: ts.BinaryExpression & {right: ts.CallExpression; left: ts.PropertyAccessExpression};
} {
  if (!ts.isExpressionStatement(node)) {
    return false;
  }
  if (!ts.isBinaryExpression(node.expression)) {
    return false;
  }

  const binaryExpression = node.expression;
  if (binaryExpression.operatorToken.kind !== ts.SyntaxKind.EqualsToken) {
    return false;
  }
  if (!ts.isCallExpression(binaryExpression.right)) {
    return false;
  }
  if (!ts.isPropertyAccessExpression(binaryExpression.left)) {
    return false;
  }

  let expression = binaryExpression.right.expression;
  if (ts.isPropertyAccessExpression(expression)) {
    expression = expression.expression;
  }

  return ts.isIdentifier(expression) && isSignalFunction(expression);
}

/**
 *
 * Determines if the node is a property declaration with a call expression initializer.
 *
 * Ex:
 * ```ts
 * class MyClass {
 *   mySignal: Signal<number> = signal(123);
 * }
 * ```
 */
function isPropertyDeclarationCase(
  node: ts.Node,
): node is ts.PropertyDeclaration & {initializer: ts.CallExpression} {
  if (!ts.isPropertyDeclaration(node)) {
    return false;
  }

  if (!(node.initializer && ts.isCallExpression(node.initializer))) {
    return false;
  }

  let expression = node.initializer.expression;

  if (ts.isPropertyAccessExpression(expression)) {
    expression = expression.expression;
  }

  return ts.isIdentifier(expression) && isSignalFunction(expression);
}

/**
 *
 * Determines if a node is an expression that references an @angular/core imported symbol.
 * Ex:
 * ```ts
 * import { signal } from '@angular/core';
 * const mySignal = signal(123); // expressionIsUsingAngularImportedSymbol === true
 * ```
 */
function expressionIsUsingAngularCoreImportedSymbol(
  program: ts.Program,
  expression: ts.Expression,
): boolean {
  const symbol = program.getTypeChecker().getSymbolAtLocation(expression);
  if (symbol === undefined) {
    return false;
  }

  const declarations = symbol.declarations;
  if (declarations === undefined || declarations.length === 0) {
    return false;
  }

  // climb up the tree from the import specifier to the import declaration
  const importSpecifier = declarations[0];
  if (!ts.isImportSpecifier(importSpecifier)) {
    return false;
  }

  const namedImports = importSpecifier.parent;
  if (!ts.isNamedImports(namedImports)) {
    return false;
  }

  const importsClause = namedImports.parent;
  if (!ts.isImportClause(importsClause)) {
    return false;
  }

  const importDeclaration = importsClause.parent;
  if (
    !ts.isImportDeclaration(importDeclaration) ||
    !ts.isStringLiteral(importDeclaration.moduleSpecifier)
  ) {
    return false;
  }

  const specifier = importDeclaration.moduleSpecifier.text;
  return (
    specifier !== undefined &&
    (specifier === '@angular/core' || specifier.includes('@angular/core/'))
  );
}

const signalFunctions: ReadonlySet<string> = new Set([
  'signal',
  'computed',
  'input',
  'model',
  'viewChild',
  'viewChildren',
  'contentChild',
  'contentChildren',
  'effect',
]);

function isSignalFunction(expression: ts.Identifier): boolean {
  const text = expression.text;

  return signalFunctions.has(text);
}

function getConfigArgPosition(expression: ts.Expression): number {
  // Check for a property access expression that uses the 'required' property
  if (
    ts.isPropertyAccessExpression(expression) &&
    ts.isIdentifier(expression.name) &&
    ts.isIdentifier(expression.expression)
  ) {
    const accessName = expression.name.text;
    const propertyName = expression.expression.text;

    if (accessName === 'required' && (propertyName === 'input' || propertyName === 'model')) {
      return 0;
    }
  }

  // All signal functions have a config object as the second argument
  return 1;
}

function transformVariableDeclaration(
  program: ts.Program,
  node: ts.VariableDeclaration,
): ts.VariableDeclaration {
  if (!node.initializer || !ts.isCallExpression(node.initializer)) return node;

  const expression = node.initializer.expression;
  if (ts.isPropertyAccessExpression(expression)) {
    if (!expressionIsUsingAngularCoreImportedSymbol(program, expression.expression)) {
      return node;
    }
  } else if (!expressionIsUsingAngularCoreImportedSymbol(program, expression)) {
    return node;
  }

  return ts.factory.updateVariableDeclaration(
    node,
    node.name,
    node.exclamationToken,
    node.type,
    insertDebugNameIntoCallExpression(node.initializer, node.name.getText()),
  );
}

function transformPropertyAssignment(
  program: ts.Program,
  node: ts.ExpressionStatement & {
    expression: ts.BinaryExpression & {right: ts.CallExpression; left: ts.PropertyAccessExpression};
  },
): ts.ExpressionStatement {
  const expression = node.expression.right.expression;
  if (ts.isPropertyAccessExpression(expression)) {
    if (!expressionIsUsingAngularCoreImportedSymbol(program, expression.expression)) {
      return node;
    }
  } else if (!expressionIsUsingAngularCoreImportedSymbol(program, expression)) {
    return node;
  }

  return ts.factory.updateExpressionStatement(
    node,
    ts.factory.createBinaryExpression(
      node.expression.left,
      node.expression.operatorToken,
      insertDebugNameIntoCallExpression(node.expression.right, node.expression.left.name.text),
    ),
  );
}

function transformPropertyDeclaration(
  program: ts.Program,
  node: ts.PropertyDeclaration,
): ts.PropertyDeclaration {
  if (!node.initializer || !ts.isCallExpression(node.initializer)) return node;

  const expression = node.initializer.expression;
  if (ts.isPropertyAccessExpression(expression)) {
    if (!expressionIsUsingAngularCoreImportedSymbol(program, expression.expression)) {
      return node;
    }
  } else if (!expressionIsUsingAngularCoreImportedSymbol(program, expression)) {
    return node;
  }

  return ts.factory.updatePropertyDeclaration(
    node,
    node.modifiers,
    node.name,
    node.questionToken,
    node.type,
    insertDebugNameIntoCallExpression(node.initializer, node.name.getText()),
  );
}

/**
 *
 * This transformer adds a debugName property to the config object of signal functions like
 * signal, computed, effect, etc.
 *
 * The debugName property is added conditionally based on the value of ngDevMode. This is done
 * to avoid adding the debugName property in production builds.
 *
 * Ex:
 * ```ts
 * import {signal} from '@angular/core';
 * const mySignal = signal('Hello World');
 * ```
 *
 * is transformed to:
 * ```ts
 * import {signal} from '@angular/core';
 * const mySignal = signal('Hello World', ...(ngDevMode ? [{ debugName: "mySignal" }] : []));
 * ```
 *
 * The transformer supports the following cases:
 *
 * - Variable declaration
 * ```ts
 * const mySignal = signal('Hello World');
 * ```
 *
 * - Property assignment
 * ```ts
 * class MyClass {
 *  mySignal: Signal<string>;
 *  constructor() {
 *    this.mySignal = signal('Hello World');
 *  }
 * }
 * ```
 *
 * - Property declaration
 * ```ts
 * class MyClass {
 *   mySignal: Signal<string> = signal('Hello World');
 * }
 * ```
 *
 * Transform steps:
 *
 * 1. Check if the node is an expression that uses an Angular imported symbol
 * 2. Check if the node is a variable declaration, property assignment, or property declaration
 * 3. Insert the debugName property into the config object of the signal function
 *
 */
export function signalMetadataTransform(
  program: ts.Program,
): (context: ts.TransformationContext) => (rootNode: ts.Node) => ts.Node | undefined {
  return (context: ts.TransformationContext) => (rootNode: ts.Node) => {
    const visit: ts.Visitor = (node) => {
      if (isVariableDeclarationCase(node)) {
        return transformVariableDeclaration(program, node);
      }

      if (isPropertyAssignmentCase(node)) {
        return transformPropertyAssignment(program, node);
      }

      if (isPropertyDeclarationCase(node)) {
        return transformPropertyDeclaration(program, node);
      }

      return ts.visitEachChild(node, visit, context);
    };

    return ts.visitNode(rootNode, visit);
  };
}
