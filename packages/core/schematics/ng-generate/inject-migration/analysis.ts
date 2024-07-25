/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {getAngularDecorators} from '../../utils/ng_decorators';

/** Names of decorators that enable DI on a class declaration. */
const DECORATORS_SUPPORTING_DI = new Set([
  'Component',
  'Directive',
  'Pipe',
  'NgModule',
  'Injectable',
]);

/**
 * Detects the classes within a file that are likely using DI.
 * @param sourceFile File in which to search for classes.
 * @param localTypeChecker Type checker scoped to the specific file.
 */
export function detectClassesUsingDI(sourceFile: ts.SourceFile, localTypeChecker: ts.TypeChecker) {
  const results: {
    node: ts.ClassDeclaration;
    constructor: ts.ConstructorDeclaration;
    superCall: ts.CallExpression | null;
  }[] = [];

  sourceFile.forEachChild(function walk(node) {
    if (ts.isClassDeclaration(node)) {
      const decorators = getAngularDecorators(localTypeChecker, ts.getDecorators(node) || []);
      const supportsDI = decorators.some((dec) => DECORATORS_SUPPORTING_DI.has(dec.name));
      const constructorNode = node.members.find(
        (member) =>
          ts.isConstructorDeclaration(member) &&
          member.body != null &&
          member.parameters.length > 0,
      ) as ts.ConstructorDeclaration | undefined;

      if (supportsDI && constructorNode) {
        results.push({
          node,
          constructor: constructorNode,
          superCall: node.heritageClauses ? findSuperCall(constructorNode) : null,
        });
      }
    }

    node.forEachChild(walk);
  });

  return results;
}

/**
 * Returns the parameters of a function that aren't used within its body.
 * @param declaration Function in which to search for unused parameters.
 * @param localTypeChecker Type checker scoped to the file in which the function was declared.
 */
export function getConstructorUnusedParameters(
  declaration: ts.ConstructorDeclaration,
  localTypeChecker: ts.TypeChecker,
): Set<ts.Declaration> {
  const accessedTopLevelParameters = new Set<ts.Declaration>();
  const topLevelParameters = new Set<ts.Declaration>();
  const topLevelParameterNames = new Set<string>();
  const unusedParams = new Set<ts.Declaration>();

  // Prepare the parameters for quicker checks further down.
  for (const param of declaration.parameters) {
    if (ts.isIdentifier(param.name)) {
      topLevelParameters.add(param);
      topLevelParameterNames.add(param.name.text);
    }
  }

  if (!declaration.body) {
    return topLevelParameters;
  }

  declaration.body.forEachChild(function walk(node) {
    if (!ts.isIdentifier(node) || !topLevelParameterNames.has(node.text)) {
      node.forEachChild(walk);
      return;
    }

    // Don't consider `this.<name>` accesses as being references to
    // parameters since they'll be moved to property declarations.
    if (
      ts.isPropertyAccessExpression(node.parent) &&
      node.parent.expression.kind === ts.SyntaxKind.ThisKeyword &&
      node.parent.name === node
    ) {
      return;
    }

    localTypeChecker.getSymbolAtLocation(node)?.declarations?.forEach((decl) => {
      if (ts.isParameter(decl) && topLevelParameters.has(decl)) {
        accessedTopLevelParameters.add(decl);
      }
      if (ts.isShorthandPropertyAssignment(decl)) {
        const symbol = localTypeChecker.getShorthandAssignmentValueSymbol(decl);
        if (symbol && symbol.valueDeclaration && ts.isParameter(symbol.valueDeclaration)) {
          accessedTopLevelParameters.add(symbol.valueDeclaration);
        }
      }
    });
  });

  for (const param of topLevelParameters) {
    if (!accessedTopLevelParameters.has(param)) {
      unusedParams.add(param);
    }
  }
  return unusedParams;
}

/**
 * Determines which parameters of a function declaration are used within its `super` call.
 * @param declaration Function whose parameters to search for.
 * @param superCall `super()` call within the function.
 * @param localTypeChecker Type checker scoped to the file in which the function is declared.
 */
export function getSuperParameters(
  declaration: ts.FunctionLikeDeclaration,
  superCall: ts.CallExpression,
  localTypeChecker: ts.TypeChecker,
): Set<ts.ParameterDeclaration> {
  const usedParams = new Set<ts.ParameterDeclaration>();
  const topLevelParameters = new Set<ts.ParameterDeclaration>();
  const topLevelParameterNames = new Set<string>();

  // Prepare the parameters for quicker checks further down.
  for (const param of declaration.parameters) {
    if (ts.isIdentifier(param.name)) {
      topLevelParameters.add(param);
      topLevelParameterNames.add(param.name.text);
    }
  }

  superCall.forEachChild(function walk(node) {
    if (ts.isIdentifier(node) && topLevelParameterNames.has(node.text)) {
      localTypeChecker.getSymbolAtLocation(node)?.declarations?.forEach((decl) => {
        if (ts.isParameter(decl) && topLevelParameters.has(decl)) {
          usedParams.add(decl);
        }
      });
    } else {
      node.forEachChild(walk);
    }
  });

  return usedParams;
}

/**
 * Gets the indentation text of a node. Can be used to
 * output text with the same level of indentation.
 * @param node Node for which to get the indentation level.
 */
export function getNodeIndentation(node: ts.Node): string {
  const fullText = node.getFullText();
  const end = fullText.indexOf(node.getText());
  let result = '';

  for (let i = end - 1; i > -1; i--) {
    // Note: LF line endings are `\n` while CRLF are `\r\n`. This logic should cover both, because
    // we start from the beginning of the node and go backwards so will always hit `\n` first.
    if (fullText[i] !== '\n') {
      result = fullText[i] + result;
    } else {
      break;
    }
  }

  return result;
}

/** Checks whether a parameter node declares a property on its class. */
export function parameterDeclaresProperty(node: ts.ParameterDeclaration): boolean {
  return !!node.modifiers?.some(
    ({kind}) =>
      kind === ts.SyntaxKind.PublicKeyword ||
      kind === ts.SyntaxKind.PrivateKeyword ||
      kind === ts.SyntaxKind.ProtectedKeyword ||
      kind === ts.SyntaxKind.ReadonlyKeyword,
  );
}

/** Checks whether a type node is nullable. */
export function isNullableType(node: ts.TypeNode): boolean {
  // Apparently `foo: null` is `Parameter<TypeNode<NullKeyword>>`,
  // while `foo: undefined` is `Parameter<UndefinedKeyword>`...
  if (node.kind === ts.SyntaxKind.UndefinedKeyword || node.kind === ts.SyntaxKind.VoidKeyword) {
    return true;
  }

  if (ts.isLiteralTypeNode(node)) {
    return node.literal.kind === ts.SyntaxKind.NullKeyword;
  }

  if (ts.isUnionTypeNode(node)) {
    return node.types.some(isNullableType);
  }

  return false;
}

/** Checks whether a type node has generic arguments. */
export function hasGenerics(node: ts.TypeNode): boolean {
  if (ts.isTypeReferenceNode(node)) {
    return node.typeArguments != null && node.typeArguments.length > 0;
  }

  if (ts.isUnionTypeNode(node)) {
    return node.types.some(hasGenerics);
  }

  return false;
}

/** Finds a `super` call inside of a specific node. */
function findSuperCall(root: ts.Node): ts.CallExpression | null {
  let result: ts.CallExpression | null = null;

  root.forEachChild(function find(node) {
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.SuperKeyword) {
      result = node;
    } else if (result === null) {
      node.forEachChild(find);
    }
  });

  return result;
}
