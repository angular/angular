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
  const existingArg =
    configPosition >= node.arguments.length ? null : node.arguments[configPosition];

  // Do nothing if the existing parameter isn't statically analyzable or already has a `debugName`.
  if (
    existingArg !== null &&
    (!ts.isObjectLiteralExpression(existingArg) ||
      existingArg.properties.some(
        (prop) =>
          ts.isPropertyAssignment(prop) &&
          ts.isIdentifier(prop.name) &&
          prop.name.text === 'debugName',
      ))
  ) {
    return node;
  }

  const debugNameProperty = ts.factory.createPropertyAssignment(
    'debugName',
    ts.factory.createStringLiteral(debugName),
  );

  let newArgs: ts.Expression[];

  if (existingArg !== null) {
    // If there's an existing object literal already, we transform it as follows:
    // `signal(0, {equal})` becomes `signal(0, { ...(ngDevMode ? {debugName: "n"} : {}), equal })`.
    // During minification the spread will be removed since it's pointing to an empty object.
    const transformedArg = ts.factory.createObjectLiteralExpression([
      ts.factory.createSpreadAssignment(
        createNgDevModeConditional(
          ts.factory.createObjectLiteralExpression([debugNameProperty]),
          ts.factory.createObjectLiteralExpression(),
        ),
      ),
      ...existingArg.properties,
    ]);

    newArgs = node.arguments.map((arg) => (arg === existingArg ? transformedArg : arg));
  } else {
    // If there's no existing argument, we transform it as follows:
    // `input(0)` becomes `input(0, ...(ngDevMode ? [{debugName: "n"}] : []))`
    // Spreading into an empty literal allows for the array to be dropped during minification.
    const spreadArgs: ts.Expression[] = [];

    // If we're adding an argument, but the function requires a first argument (e.g. `input()`),
    // we have to add `undefined` before the debug literal.
    if (hasNoArgs && !isRequired) {
      spreadArgs.push(ts.factory.createIdentifier('undefined'));
    }

    spreadArgs.push(ts.factory.createObjectLiteralExpression([debugNameProperty]));

    newArgs = [
      ...node.arguments,
      ts.factory.createSpreadElement(
        createNgDevModeConditional(
          ts.factory.createArrayLiteralExpression(spreadArgs),
          ts.factory.createArrayLiteralExpression(),
        ),
      ),
    ];
  }

  return ts.factory.updateCallExpression(node, node.expression, node.typeArguments, newArgs);
}

/**
 * Creates an expression in the form of `(ngDevMode ? <devModeExpression> : <prodModeExpression>)`.
 */
function createNgDevModeConditional(
  devModeExpression: ts.Expression,
  prodModeExpression: ts.Expression,
): ts.ParenthesizedExpression {
  return ts.factory.createParenthesizedExpression(
    ts.factory.createConditionalExpression(
      ts.factory.createIdentifier('ngDevMode'),
      undefined,
      devModeExpression,
      undefined,
      prodModeExpression,
    ),
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
