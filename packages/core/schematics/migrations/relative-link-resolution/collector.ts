/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {isExtraOptions, isRouterModuleForRoot} from './util';


/**
 * Visitor that walks through specified TypeScript nodes and collects all
 * found ExtraOptions#RelativeLinkResolution assignments.
 */
export class RelativeLinkResolutionCollector {
  readonly forRootCalls: ts.CallExpression[] = [];
  readonly extraOptionsLiterals: ts.ObjectLiteralExpression[] = [];

  constructor(private readonly typeChecker: ts.TypeChecker) {}

  visitNode(node: ts.Node) {
    let forRootCall: ts.CallExpression|null = null;
    let literal: ts.ObjectLiteralExpression|null = null;
    if (isRouterModuleForRoot(this.typeChecker, node) && node.arguments.length > 0) {
      if (node.arguments.length === 1) {
        forRootCall = node;
      } else if (ts.isObjectLiteralExpression(node.arguments[1])) {
        literal = node.arguments[1] as ts.ObjectLiteralExpression;
      } else if (ts.isIdentifier(node.arguments[1])) {
        literal = this.getLiteralNeedingMigrationFromIdentifier(node.arguments[1] as ts.Identifier);
      }
    } else if (ts.isVariableDeclaration(node)) {
      literal = this.getLiteralNeedingMigration(node);
    }

    if (literal !== null) {
      this.extraOptionsLiterals.push(literal);
    } else if (forRootCall !== null) {
      this.forRootCalls.push(forRootCall);
    } else {
      // no match found, continue iteration
      ts.forEachChild(node, n => this.visitNode(n));
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
