/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {HelperFunction} from './helpers';

/** A call expression that is based on a property access. */
type PropertyAccessCallExpression = ts.CallExpression&{expression: ts.PropertyAccessExpression};

/**
 * Migrates a function call expression from `Renderer` to `Renderer2`.
 * Returns null if the expression should be dropped.
 */
export function migrateExpression(node: ts.CallExpression, typeChecker: ts.TypeChecker):
    {node: ts.Node|null, requiredHelpers?: HelperFunction[]} {
  if (isPropertyAccessCallExpression(node)) {
    switch (node.expression.name.getText()) {
      case 'setElementProperty':
        return {node: renameMethodCall(node, 'setProperty')};
      case 'setText':
        return {node: renameMethodCall(node, 'setValue')};
      case 'listenGlobal':
        return {node: renameMethodCall(node, 'listen')};
      case 'selectRootElement':
        return {node: migrateSelectRootElement(node)};
      case 'setElementClass':
        return {node: migrateSetElementClass(node)};
      case 'setElementStyle':
        return {node: migrateSetElementStyle(node, typeChecker)};
      case 'invokeElementMethod':
        return {node: migrateInvokeElementMethod(node)};
      case 'setBindingDebugInfo':
        return {node: null};
      case 'createViewRoot':
        return {node: migrateCreateViewRoot(node)};
      case 'setElementAttribute':
        return {
          node: switchToHelperCall(node, HelperFunction.setElementAttribute, node.arguments),
          requiredHelpers: [
            HelperFunction.any, HelperFunction.splitNamespace, HelperFunction.setElementAttribute
          ]
        };
      case 'createElement':
        return {
          node: switchToHelperCall(node, HelperFunction.createElement, node.arguments.slice(0, 2)),
          requiredHelpers:
              [HelperFunction.any, HelperFunction.splitNamespace, HelperFunction.createElement]
        };
      case 'createText':
        return {
          node: switchToHelperCall(node, HelperFunction.createText, node.arguments.slice(0, 2)),
          requiredHelpers: [HelperFunction.any, HelperFunction.createText]
        };
      case 'createTemplateAnchor':
        return {
          node: switchToHelperCall(
              node, HelperFunction.createTemplateAnchor, node.arguments.slice(0, 1)),
          requiredHelpers: [HelperFunction.any, HelperFunction.createTemplateAnchor]
        };
      case 'projectNodes':
        return {
          node: switchToHelperCall(node, HelperFunction.projectNodes, node.arguments),
          requiredHelpers: [HelperFunction.any, HelperFunction.projectNodes]
        };
      case 'animate':
        return {
          node: migrateAnimateCall(),
          requiredHelpers: [HelperFunction.any, HelperFunction.animate]
        };
      case 'destroyView':
        return {
          node: switchToHelperCall(node, HelperFunction.destroyView, [node.arguments[1]]),
          requiredHelpers: [HelperFunction.any, HelperFunction.destroyView]
        };
      case 'detachView':
        return {
          node: switchToHelperCall(node, HelperFunction.detachView, [node.arguments[0]]),
          requiredHelpers: [HelperFunction.any, HelperFunction.detachView]
        };
      case 'attachViewAfter':
        return {
          node: switchToHelperCall(node, HelperFunction.attachViewAfter, node.arguments),
          requiredHelpers: [HelperFunction.any, HelperFunction.attachViewAfter]
        };
    }
  }

  return {node};
}

/** Checks whether a node is a PropertyAccessExpression. */
function isPropertyAccessCallExpression(node: ts.Node): node is PropertyAccessCallExpression {
  return ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression);
}

/** Renames a method call while keeping all of the parameters in place. */
function renameMethodCall(node: PropertyAccessCallExpression, newName: string): ts.CallExpression {
  const newExpression = ts.updatePropertyAccess(
      node.expression, node.expression.expression, ts.createIdentifier(newName));

  return ts.updateCall(node, newExpression, node.typeArguments, node.arguments);
}

/**
 * Migrates a `selectRootElement` call by removing the last argument which is no longer supported.
 */
function migrateSelectRootElement(node: ts.CallExpression): ts.Node {
  // The only thing we need to do is to drop the last argument
  // (`debugInfo`), if the consumer was passing it in.
  if (node.arguments.length > 1) {
    return ts.updateCall(node, node.expression, node.typeArguments, [node.arguments[0]]);
  }

  return node;
}

/**
 * Migrates a call to `setElementClass` either to a call to `addClass` or `removeClass`, or
 * to an expression like `isAdd ? addClass(el, className) : removeClass(el, className)`.
 */
function migrateSetElementClass(node: PropertyAccessCallExpression): ts.Node {
  // Clone so we don't mutate by accident. Note that we assume that
  // the user's code is providing all three required arguments.
  const outputMethodArgs = node.arguments.slice();
  const isAddArgument = outputMethodArgs.pop()!;
  const createRendererCall = (isAdd: boolean) => {
    const innerExpression = node.expression.expression;
    const topExpression =
        ts.createPropertyAccess(innerExpression, isAdd ? 'addClass' : 'removeClass');
    return ts.createCall(topExpression, [], node.arguments.slice(0, 2));
  };

  // If the call has the `isAdd` argument as a literal boolean, we can map it directly to
  // `addClass` or `removeClass`. Note that we can't use the type checker here, because it
  // won't tell us whether the value resolves to true or false.
  if (isAddArgument.kind === ts.SyntaxKind.TrueKeyword ||
      isAddArgument.kind === ts.SyntaxKind.FalseKeyword) {
    return createRendererCall(isAddArgument.kind === ts.SyntaxKind.TrueKeyword);
  }

  // Otherwise create a ternary on the variable.
  return ts.createConditional(isAddArgument, createRendererCall(true), createRendererCall(false));
}

/**
 * Migrates a call to `setElementStyle` call either to a call to
 * `setStyle` or `removeStyle`. or to an expression like
 * `value == null ? removeStyle(el, key) : setStyle(el, key, value)`.
 */
function migrateSetElementStyle(
    node: PropertyAccessCallExpression, typeChecker: ts.TypeChecker): ts.Node {
  const args = node.arguments;
  const addMethodName = 'setStyle';
  const removeMethodName = 'removeStyle';
  const lastArgType = args[2] ?
      typeChecker.typeToString(
          typeChecker.getTypeAtLocation(args[2]), node, ts.TypeFormatFlags.AddUndefined) :
      null;

  // Note that for a literal null, TS considers it a `NullKeyword`,
  // whereas a literal `undefined` is just an Identifier.
  if (args.length === 2 || lastArgType === 'null' || lastArgType === 'undefined') {
    // If we've got a call with two arguments, or one with three arguments where the last one is
    // `undefined` or `null`, we can safely switch to a `removeStyle` call.
    const innerExpression = node.expression.expression;
    const topExpression = ts.createPropertyAccess(innerExpression, removeMethodName);
    return ts.createCall(topExpression, [], args.slice(0, 2));
  } else if (args.length === 3) {
    // We need the checks for string literals, because the type of something
    // like `"blue"` is the literal `blue`, not `string`.
    if (lastArgType === 'string' || lastArgType === 'number' || ts.isStringLiteral(args[2]) ||
        ts.isNoSubstitutionTemplateLiteral(args[2]) || ts.isNumericLiteral(args[2])) {
      // If we've got three arguments and the last one is a string literal or a number, we
      // can safely rename to `setStyle`.
      return renameMethodCall(node, addMethodName);
    } else {
      // Otherwise migrate to a ternary that looks like:
      // `value == null ? removeStyle(el, key) : setStyle(el, key, value)`
      const condition = ts.createBinary(args[2], ts.SyntaxKind.EqualsEqualsToken, ts.createNull());
      const whenNullCall = renameMethodCall(
          ts.createCall(node.expression, [], args.slice(0, 2)) as PropertyAccessCallExpression,
          removeMethodName);
      return ts.createConditional(condition, whenNullCall, renameMethodCall(node, addMethodName));
    }
  }

  return node;
}

/**
 * Migrates a call to `invokeElementMethod(target, method, [arg1, arg2])` either to
 * `target.method(arg1, arg2)` or `(target as any)[method].apply(target, [arg1, arg2])`.
 */
function migrateInvokeElementMethod(node: ts.CallExpression): ts.Node {
  const [target, name, args] = node.arguments;
  const isNameStatic = ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name);
  const isArgsStatic = !args || ts.isArrayLiteralExpression(args);

  if (isNameStatic && isArgsStatic) {
    // If the name is a static string and the arguments are an array literal,
    // we can safely convert the node into a call expression.
    const expression = ts.createPropertyAccess(
        target, (name as ts.StringLiteral | ts.NoSubstitutionTemplateLiteral).text);
    const callArguments = args ? (args as ts.ArrayLiteralExpression).elements : [];
    return ts.createCall(expression, [], callArguments);
  } else {
    // Otherwise create an expression in the form of `(target as any)[name].apply(target, args)`.
    const asExpression = ts.createParen(
        ts.createAsExpression(target, ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)));
    const elementAccess = ts.createElementAccess(asExpression, name);
    const applyExpression = ts.createPropertyAccess(elementAccess, 'apply');
    return ts.createCall(applyExpression, [], args ? [target, args] : [target]);
  }
}

/** Migrates a call to `createViewRoot` to whatever node was passed in as the first argument. */
function migrateCreateViewRoot(node: ts.CallExpression): ts.Node {
  return node.arguments[0];
}

/** Migrates a call to `migrate` a direct call to the helper. */
function migrateAnimateCall() {
  return ts.createCall(ts.createIdentifier(HelperFunction.animate), [], []);
}

/**
 * Switches out a call to the `Renderer` to a call to one of our helper functions.
 * Most of the helpers accept an instance of `Renderer2` as the first argument and all
 * subsequent arguments differ.
 * @param node Node of the original method call.
 * @param helper Name of the helper with which to replace the original call.
 * @param args Arguments that should be passed into the helper after the renderer argument.
 */
function switchToHelperCall(
    node: PropertyAccessCallExpression, helper: HelperFunction,
    args: ts.Expression[]|ts.NodeArray<ts.Expression>): ts.Node {
  return ts.createCall(ts.createIdentifier(helper), [], [node.expression.expression, ...args]);
}
