/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

function insertDebugNameIntoCallExpression(
  node: ts.CallExpression,
  debugName: string,
): ts.CallExpression {
  const isRequired = isRequiredSignalFunction(node.expression);
  const hasNoArgs = node.arguments.length === 0;
  const configPosition = hasNoArgs || isSignalWithObjectOnlyDefinition(node) || isRequired ? 0 : 1;
  const nodeArgs = node.arguments;
  const existingArg = configPosition >= nodeArgs.length ? null : nodeArgs[configPosition];

  // We can't transform the call if the existing argument isn't an object literal
  // (e.g. `signal(0, someVar)`) or it already has a `debugName`.
  if (
    existingArg &&
    (!ts.isObjectLiteralExpression(existingArg) ||
      existingArg?.properties.some((prop) => {
        return (
          ts.isPropertyAssignment(prop) &&
          ts.isIdentifier(prop.name) &&
          prop.name.text === 'debugName'
        );
      }))
  ) {
    return node;
  }

  const args = Array.from(nodeArgs);
  const debugNameProperty = ts.factory.createPropertyAssignment(
    'debugName',
    ts.factory.createStringLiteral(debugName),
  );

  if (existingArg !== null) {
    // If an object literal already exists, we replace it with an expression like:
    // `ngDevMode ? { propA, propB, debugName: 'foo' } : { propA, propB }`.
    // This allows us to drop the `debugName` in production without having to spread expressions.
    args[configPosition] = getNgDevModeConditional(
      ts.factory.createObjectLiteralExpression([...existingArg.properties, debugNameProperty]),
      existingArg,
    );
  } else {
    // If the first argument is required, we need to pass `undefined`.
    if (hasNoArgs && !isRequired) {
      args.push(ts.factory.createIdentifier('undefined'));
    }

    // If there is no argument at the position, we create an expression like:
    // `ngDevMode ? { debugName: 'foo' } : undefined`. It allows us to avoid
    // allocating objects and spreads in production mode.
    args.push(
      getNgDevModeConditional(
        ts.factory.createObjectLiteralExpression([debugNameProperty]),
        ts.factory.createIdentifier('undefined'),
      ),
    );
  }

  return ts.factory.updateCallExpression(
    node,
    node.expression,
    node.typeArguments,
    ts.factory.createNodeArray(args),
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

/** Gets an expression in the form of `ngDevMode ? <dev mode value> : <prod mode value>`. */
function getNgDevModeConditional(
  devModeValue: ts.Expression,
  prodModeValue: ts.Expression,
): ts.Expression {
  return ts.factory.createConditionalExpression(
    ts.factory.createIdentifier('ngDevMode'),
    undefined,
    devModeValue,
    undefined,
    prodModeValue,
  );
}

type PackageName = 'core' | 'common';

const signalFunctions: ReadonlyMap<string, PackageName> = new Map([
  ['signal', 'core'],
  ['computed', 'core'],
  ['linkedSignal', 'core'],
  ['input', 'core'],
  ['model', 'core'],
  ['viewChild', 'core'],
  ['viewChildren', 'core'],
  ['contentChild', 'core'],
  ['contentChildren', 'core'],
  ['effect', 'core'],
  ['resource', 'core'],
  ['httpResource', 'common'],
]);

/**
 *
 * Determines if a node is an expression that references an @angular/core imported symbol.
 * Ex:
 * ```ts
 * import { signal } from '@angular/core';
 * const mySignal = signal(123); // expressionIsUsingAngularImportedSymbol === true
 * ```
 */
function expressionIsUsingAngularImportedSymbol(
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
  const packageName = signalFunctions.get(expression.getText());
  return (
    specifier !== undefined &&
    packageName !== undefined &&
    (specifier === `@angular/${packageName}` || specifier.startsWith(`@angular/${packageName}/`))
  );
}

function isSignalFunction(expression: ts.Identifier): boolean {
  const text = expression.text;

  return signalFunctions.has(text);
}

function isRequiredSignalFunction(expression: ts.Expression): boolean {
  // Check for a property access expression that uses the 'required' property
  if (
    ts.isPropertyAccessExpression(expression) &&
    ts.isIdentifier(expression.name) &&
    ts.isIdentifier(expression.expression)
  ) {
    const accessName = expression.name.text;
    if (accessName === 'required') {
      return true;
    }
  }

  return false;
}

function transformVariableDeclaration(
  program: ts.Program,
  node: ts.VariableDeclaration,
): ts.VariableDeclaration {
  if (!node.initializer || !ts.isCallExpression(node.initializer)) return node;

  const expression = node.initializer.expression;
  if (ts.isPropertyAccessExpression(expression)) {
    if (!expressionIsUsingAngularImportedSymbol(program, expression.expression)) {
      return node;
    }
  } else if (!expressionIsUsingAngularImportedSymbol(program, expression)) {
    return node;
  }

  try {
    // may throw if the node does not have a source file. Ignore this case for now
    const nodeText = node.name.getText();

    return ts.factory.updateVariableDeclaration(
      node,
      node.name,
      node.exclamationToken,
      node.type,
      insertDebugNameIntoCallExpression(node.initializer, nodeText),
    );
  } catch {
    return node;
  }
}

function transformPropertyAssignment(
  program: ts.Program,
  node: ts.ExpressionStatement & {
    expression: ts.BinaryExpression & {
      right: ts.CallExpression;
      left: ts.PropertyAccessExpression;
    };
  },
): ts.ExpressionStatement {
  const expression = node.expression.right.expression;
  if (ts.isPropertyAccessExpression(expression)) {
    if (!expressionIsUsingAngularImportedSymbol(program, expression.expression)) {
      return node;
    }
  } else if (!expressionIsUsingAngularImportedSymbol(program, expression)) {
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
    if (!expressionIsUsingAngularImportedSymbol(program, expression.expression)) {
      return node;
    }
  } else if (!expressionIsUsingAngularImportedSymbol(program, expression)) {
    return node;
  }

  try {
    // may throw if the node does not have a source file. Ignore this case for now.
    const nodeText = node.name.getText();
    return ts.factory.updatePropertyDeclaration(
      node,
      node.modifiers,
      node.name,
      node.questionToken,
      node.type,
      insertDebugNameIntoCallExpression(node.initializer, nodeText),
    );
  } catch {
    return node;
  }
}

/**
 * The function determines whether the target signal has an object-only definition, that includes
 * both the computation logic and the options (unlike other signal-based primitives), or not.
 * Ex: `linkedSignal` with computation, `resource`
 */
function isSignalWithObjectOnlyDefinition(callExpression: ts.CallExpression): boolean {
  const callExpressionText = callExpression.expression.getText();
  const nodeArgs = Array.from(callExpression.arguments);

  const isLinkedSignal = callExpressionText === 'linkedSignal';
  const isComputationLinkedSignal =
    isLinkedSignal && nodeArgs[0].kind === ts.SyntaxKind.ObjectLiteralExpression;

  const isResource = callExpressionText === 'resource';

  return isComputationLinkedSignal || isResource;
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
 * # Variable declaration
 * ```ts
 * const mySignal = signal('Hello World');
 * ```
 *
 * becomes
 * ```
 * const  mySignal = signal('Hello World', ...(ngDevMode ? [{ debugName: "mySignal" }] : []));
 * ```
 *
 * # Property assignment
 * ```ts
 * class MyClass {
 *  mySignal: Signal<string>;
 *  constructor() {
 *    this.mySignal = signal('Hello World');
 *  }
 * }
 * ```
 * becomes
 * ```ts
 * class MyClass {
 *  mySignal: Signal<string>;
 *  constructor() {
 *   this.mySignal = signal(...(ngDevMode ? ['Hello World', { debugName: "mySignal" }] : ['Hello World']));
 *  }
 * }
 * ```
 *
 * # Property declaration
 * ```ts
 * class MyClass {
 *   mySignal = signal('Hello World');
 * }
 * ```
 * becomes
 * ```ts
 * class MyClass {
 *  mySignal = signal(...(ngDevMode ? ['Hello World', { debugName: "mySignal" }] : ['Hello World']));
 * }
 * ```
 *
 */
export function signalMetadataTransform(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) =>
    (rootNode: ts.SourceFile): ts.SourceFile => {
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

      return ts.visitNode(rootNode, visit) as ts.SourceFile;
    };
}
