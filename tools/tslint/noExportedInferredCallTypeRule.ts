/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Replacement, RuleFailure} from 'tslint/lib';
import {AbstractRule, TypedRule} from 'tslint/lib/rules';
import {Rule as TypedefRule} from 'tslint/lib/rules/typedefRule';
import ts from 'typescript';

/**
 * Rule that ensures ("best effort") that exported constants are having
 * an explicit type if they would otherwise rely on a synthetically inserted
 * type that is inferred from a function call. E.g.
 *
 * ```ts
 * export const myLoader = createImageLoader(); // Wrong!
 * export const myLoader: ImageLoader<X> = createImageLoader(); // Correct!
 * ```
 */
export class Rule extends TypedRule {
  override applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const checker = program.getTypeChecker();

    return this.applyWithFunction(sourceFile, (ctx) => {
      for (const st of sourceFile.statements) {
        if (
          !ts.isVariableStatement(st) ||
          !(st.modifiers ?? []).some((s) => s.kind === ts.SyntaxKind.ExportKeyword)
        ) {
          continue;
        }

        for (const decl of st.declarationList.declarations) {
          if (
            decl.initializer !== undefined &&
            ts.isCallExpression(decl.initializer) &&
            decl.type === undefined
          ) {
            const inferredType = checker.getTypeAtLocation(decl.name);
            const typeStr = checker.typeToString(inferredType, decl);

            ctx.addFailureAtNode(
              decl,
              'No explicit type. Inferred types can cause unexpected issues. ' +
                'Please add an explicit type.',
              Replacement.appendText(decl.name.end, `: ${typeStr}`),
            );
          }
        }
      }
    });
  }
}
