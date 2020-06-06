/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {isNavigationExtras, isRouterModuleForRoot} from './util';


/**
 * Visitor that walks through specified TypeScript nodes and collects all
 * found ExtraOptions#RelativeLinkResolution assignments.
 */
export class RelativeLinkResolutionCollector {
  readonly forRootCalls: ts.CallExpression[] = [];
  readonly navigationExtrasLiterals: ts.ObjectLiteralExpression[] = [];

  constructor(private readonly typeChecker: ts.TypeChecker) {}

  visitNode(node: ts.Node) {
    if (isRouterModuleForRoot(this.typeChecker, node)) {
      if (node.arguments.length === 1) {
        // only has routes. need to add {initialNavigation: 'legacy'}
        this.forRootCalls.push(node);
        return;
      }
      const arg = node.arguments[1];
      if (ts.isObjectLiteralExpression(arg)) {
        this.forRootCalls.push(node);
        return;
      }
    } else if (ts.isVariableDeclaration(node) && node.initializer !== undefined) {
      // declaration could be `x: NavigationExtras = {}` or `x = {} as NavigationExtras`
      if (ts.isAsExpression(node.initializer) &&
          ts.isObjectLiteralExpression(node.initializer.expression) &&
          isNavigationExtras(this.typeChecker, node.initializer.type)) {
        this.navigationExtrasLiterals.push(node.initializer.expression);
        return;
      } else if (
          node.type !== undefined && ts.isObjectLiteralExpression(node.initializer) &&
          isNavigationExtras(this.typeChecker, node.type)) {
        this.navigationExtrasLiterals.push(node.initializer);
        return;
      }
    }

    ts.forEachChild(node, n => this.visitNode(n));
  }
}
