/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {getAngularDecorators} from '../../utils/ng_decorators';
import {getNamedImports} from '../../utils/typescript/imports';

/** Names of decorators that enable DI on a class declaration. */
const DECORATORS_SUPPORTING_DI = new Set([
  'Component',
  'Directive',
  'Pipe',
  'NgModule',
  'Injectable',
]);

/** Names of symbols used for DI on parameters. */
export const DI_PARAM_SYMBOLS = new Set([
  'Inject',
  'Attribute',
  'Optional',
  'SkipSelf',
  'Self',
  'Host',
  'forwardRef',
]);

/**
 * Finds the necessary information for the `inject` migration in a file.
 * @param sourceFile File which to analyze.
 * @param localTypeChecker Type checker scoped to the specific file.
 */
export function analyzeFile(sourceFile: ts.SourceFile, localTypeChecker: ts.TypeChecker) {
  const coreSpecifiers = getNamedImports(sourceFile, '@angular/core');

  // Exit early if there are no Angular imports.
  if (coreSpecifiers === null || coreSpecifiers.elements.length === 0) {
    return null;
  }

  const classes: {
    node: ts.ClassDeclaration;
    constructor: ts.ConstructorDeclaration;
    superCall: ts.CallExpression | null;
  }[] = [];
  const nonDecoratorReferences: Record<string, number | undefined> = {};
  const importsToSpecifiers = coreSpecifiers.elements.reduce((map, specifier) => {
    const symbolName = (specifier.propertyName || specifier.name).text;
    if (DI_PARAM_SYMBOLS.has(symbolName)) {
      map.set(symbolName, specifier);
    }
    return map;
  }, new Map<string, ts.ImportSpecifier>());

  sourceFile.forEachChild(function walk(node) {
    // Skip import declarations since they can throw off the identifier
    // could below and we don't care about them in this migration.
    if (ts.isImportDeclaration(node)) {
      return;
    }

    // Only visit the initializer of parameters, because we won't exclude
    // their decorators from the identifier counting result below.
    if (ts.isParameter(node)) {
      if (node.initializer) {
        walk(node.initializer);
      }
      return;
    }

    if (ts.isIdentifier(node) && importsToSpecifiers.size > 0) {
      let symbol: ts.Symbol | undefined;

      for (const [name, specifier] of importsToSpecifiers) {
        const localName = (specifier.propertyName || specifier.name).text;

        // Quick exit if the two symbols don't match up.
        if (localName === node.text) {
          if (!symbol) {
            symbol = localTypeChecker.getSymbolAtLocation(node);

            // If the symbol couldn't be resolved the first time, it won't be resolved the next
            // time either. Stop the loop since we won't be able to get an accurate result.
            if (!symbol || !symbol.declarations) {
              break;
            } else if (symbol.declarations.some((decl) => decl === specifier)) {
              nonDecoratorReferences[name] = (nonDecoratorReferences[name] || 0) + 1;
            }
          }
        }
      }
    } else if (ts.isClassDeclaration(node)) {
      const decorators = getAngularDecorators(localTypeChecker, ts.getDecorators(node) || []);
      const supportsDI = decorators.some((dec) => DECORATORS_SUPPORTING_DI.has(dec.name));
      const constructorNode = node.members.find(
        (member) =>
          ts.isConstructorDeclaration(member) &&
          member.body != null &&
          member.parameters.length > 0,
      ) as ts.ConstructorDeclaration | undefined;

      if (supportsDI && constructorNode) {
        classes.push({
          node,
          constructor: constructorNode,
          superCall: node.heritageClauses ? findSuperCall(constructorNode) : null,
        });
      }
    }

    node.forEachChild(walk);
  });

  return {classes, nonDecoratorReferences};
}

/**
 * Returns the parameters of a function that aren't used within its body.
 * @param declaration Function in which to search for unused parameters.
 * @param localTypeChecker Type checker scoped to the file in which the function was declared.
 * @param removedStatements Statements that were already removed from the constructor.
 */
export function getConstructorUnusedParameters(
  declaration: ts.ConstructorDeclaration,
  localTypeChecker: ts.TypeChecker,
  removedStatements: Set<ts.Statement> | null,
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
    // Don't descend into statements that were removed already.
    if (removedStatements && ts.isStatement(node) && removedStatements.has(node)) {
      return;
    }

    if (!ts.isIdentifier(node) || !topLevelParameterNames.has(node.text)) {
      node.forEachChild(walk);
      return;
    }

    // Don't consider `this.<name>` accesses as being references to
    // parameters since they'll be moved to property declarations.
    if (isAccessedViaThis(node)) {
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

/** Checks whether an identifier is accessed through `this`, e.g. `this.<some identifier>`. */
export function isAccessedViaThis(node: ts.Identifier): boolean {
  return (
    ts.isPropertyAccessExpression(node.parent) &&
    node.parent.expression.kind === ts.SyntaxKind.ThisKeyword &&
    node.parent.name === node
  );
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
