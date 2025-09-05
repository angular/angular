/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuleFailure} from 'tslint';
import {TypedRule} from 'tslint/lib/rules';
import ts from 'typescript';

/**
 * Rule that detects duplicate enum values.
 *
 * This is useful to prevent collisons on ErrorCodes.
 *
 * ```ts
 * enum E {
 *   A = 1,
 *   B = 1, // Wrong!
 * }
 * ```
 */
export class Rule extends TypedRule {
  override applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const checker = program.getTypeChecker();

    return this.applyWithFunction(sourceFile, (ctx) => {
      ts.forEachChild(sourceFile, function walk(node) {
        if (ts.isEnumDeclaration(node)) {
          const seenValues = new Map<string | number, ts.Node>();
          for (const member of node.members) {
            const value = checker.getConstantValue(member);
            if (value !== undefined) {
              if (seenValues.has(value)) {
                ctx.addFailureAtNode(
                  member,
                  `Enum member has a duplicate value '${value}'. First occurrence is on line ${
                    sourceFile.getLineAndCharacterOfPosition(seenValues.get(value)!.getStart())
                      .line + 1
                  }.`,
                );
              } else {
                seenValues.set(value, member);
              }
            }
          }
        }
        ts.forEachChild(node, walk);
      });
    });
  }
}
