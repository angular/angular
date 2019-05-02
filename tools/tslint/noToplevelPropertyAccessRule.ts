/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {IRuleMetadata, RuleFailure, WalkContext} from 'tslint/lib';
import {AbstractRule} from 'tslint/lib/rules';
import * as ts from 'typescript';

export class Rule extends AbstractRule {
  public static FAILURE_STRING = 'Avoid toplevel property access.';
  public static metadata: IRuleMetadata = {
    ruleName: 'no-toplevel-property-access',
    description: 'Bans the use of toplevel property access.',
    rationale: 'Toplevel property access prevents effecting tree shaking.',
    options: null,
    optionsDescription: 'Not configurable.',
    type: 'functionality',
    typescriptOnly: false,
  };

  public apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

function walk(ctx: WalkContext<void>) {
  return ts.forEachChild(ctx.sourceFile, function cb(node: ts.Node): void {
    // Stop recursing into this branch if it's a definition construct.
    // These are function expression, function declaration, class, or arrow function (lambda).
    // The body of these constructs will not execute when loading the module, so we don't
    // need to mark function calls inside them as pure.
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) ||
        ts.isClassDeclaration(node) || ts.isClassExpression(node) || ts.isArrowFunction(node) ||
        ts.isMethodDeclaration(node) || ts.isInterfaceDeclaration(node)) {
      return;
    }

    // Fail any property access found.
    if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
      ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
    }

    return ts.forEachChild(node, cb);
  });
}
