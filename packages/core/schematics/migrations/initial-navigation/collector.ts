/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {isExtraOptions, isRouterModuleForRoot} from './util';


/** The property name for the options that need to be migrated */
const INITIAL_NAVIGATION = 'initialNavigation';

/**
 * Visitor that walks through specified TypeScript nodes and collects all
 * found ExtraOptions#InitialNavigation assignments.
 */
export class InitialNavigationCollector {
  public assignments: Set<ts.PropertyAssignment> = new Set();

  constructor(private readonly typeChecker: ts.TypeChecker) {}

  visitNode(node: ts.Node) {
    let extraOptionsLiteral: ts.ObjectLiteralExpression|null = null;
    if (isRouterModuleForRoot(this.typeChecker, node) && node.arguments.length > 0) {
      if (node.arguments.length === 1) {
        return;
      }

      if (ts.isObjectLiteralExpression(node.arguments[1])) {
        extraOptionsLiteral = node.arguments[1] as ts.ObjectLiteralExpression;
      } else if (ts.isIdentifier(node.arguments[1])) {
        extraOptionsLiteral =
            this.getLiteralNeedingMigrationFromIdentifier(node.arguments[1] as ts.Identifier);
      }
    } else if (ts.isVariableDeclaration(node)) {
      extraOptionsLiteral = this.getLiteralNeedingMigration(node);
    }

    if (extraOptionsLiteral !== null) {
      this.visitExtraOptionsLiteral(extraOptionsLiteral);
    } else {
      // no match found, continue iteration
      ts.forEachChild(node, n => this.visitNode(n));
    }
  }

  visitExtraOptionsLiteral(extraOptionsLiteral: ts.ObjectLiteralExpression) {
    for (const prop of extraOptionsLiteral.properties) {
      if (ts.isPropertyAssignment(prop) &&
          (ts.isIdentifier(prop.name) || ts.isStringLiteralLike(prop.name))) {
        if (prop.name.text === INITIAL_NAVIGATION && isValidInitialNavigationValue(prop)) {
          this.assignments.add(prop);
        }
      } else if (ts.isSpreadAssignment(prop) && ts.isIdentifier(prop.expression)) {
        const literalFromSpreadAssignment =
            this.getLiteralNeedingMigrationFromIdentifier(prop.expression);
        if (literalFromSpreadAssignment !== null) {
          this.visitExtraOptionsLiteral(literalFromSpreadAssignment);
        }
      }
    }
  }

  private getLiteralNeedingMigrationFromIdentifier(id: ts.Identifier): ts.ObjectLiteralExpression
      |null {
    const symbolForIdentifier = this.typeChecker.getSymbolAtLocation(id);
    if (symbolForIdentifier === undefined) {
      return null;
    }

    if (symbolForIdentifier.declarations.length === 0) {
      return null;
    }

    const declarationNode = symbolForIdentifier.declarations[0];
    if (!ts.isVariableDeclaration(declarationNode) || declarationNode.initializer === undefined ||
        !ts.isObjectLiteralExpression(declarationNode.initializer)) {
      return null;
    }

    return declarationNode.initializer;
  }

  private getLiteralNeedingMigration(node: ts.VariableDeclaration): ts.ObjectLiteralExpression
      |null {
    if (node.initializer === undefined) {
      return null;
    }

    // declaration could be `x: ExtraOptions = {}` or `x = {} as ExtraOptions`
    if (ts.isAsExpression(node.initializer) &&
        ts.isObjectLiteralExpression(node.initializer.expression) &&
        isExtraOptions(this.typeChecker, node.initializer.type)) {
      return node.initializer.expression;
    } else if (
        node.type !== undefined && ts.isObjectLiteralExpression(node.initializer) &&
        isExtraOptions(this.typeChecker, node.type)) {
      return node.initializer;
    }

    return null;
  }
}

/**
 * Check whether the value assigned to an `initialNavigation` assignment
 * conforms to the expected types for ExtraOptions#InitialNavigation
 * @param node the property assignment to check
 */
function isValidInitialNavigationValue(node: ts.PropertyAssignment): boolean {
  return ts.isStringLiteralLike(node.initializer) ||
      node.initializer.kind === ts.SyntaxKind.FalseKeyword ||
      node.initializer.kind === ts.SyntaxKind.TrueKeyword;
}
