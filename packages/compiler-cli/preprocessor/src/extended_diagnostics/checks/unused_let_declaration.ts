/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, ASTWithSource, TmplAstLetDeclaration, TmplAstNode} from '@angular/compiler';
import type {Diagnostic} from '../../diagnostic.js';
import type {TcbTargetInput} from '../../tcb.js';
import {
  formatExtendedError,
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
} from '../api.js';

interface ClassAnalysis {
  allLetDeclarations: Set<TmplAstLetDeclaration>;
  usedLetDeclarations: Set<TmplAstLetDeclaration>;
}

/**
 * Ensures that all `@let` declarations in a template are used.
 *
 * Mirrors `UnusedLetDeclarationCheck` in
 * `ngtsc/typecheck/extended/checks/unused_let_declaration/index.ts`.
 */
class UnusedLetDeclarationCheck extends TemplateCheckWithVisitor<8112> {
  override code = 8112 as const;
  private analysis = new Map<TcbTargetInput, ClassAnalysis>();

  override run(
    ctx: TemplateContext<8112>,
    component: TcbTargetInput,
    template: TmplAstNode[],
  ): Diagnostic[] {
    super.run(ctx, component, template);

    const diagnostics: Diagnostic[] = [];
    const {allLetDeclarations, usedLetDeclarations} = this.getAnalysis(component);

    for (const decl of allLetDeclarations) {
      if (!usedLetDeclarations.has(decl)) {
        diagnostics.push(
          ctx.makeTemplateDiagnostic(
            decl.sourceSpan,
            formatExtendedError(8112, `@let ${decl.name} is declared but its value is never read.`),
          ),
        );
      }
    }

    this.analysis.clear();
    return diagnostics;
  }

  override visitNode(
    ctx: TemplateContext<8112>,
    component: TcbTargetInput,
    node: TmplAstNode | AST,
  ): Diagnostic[] {
    if (node instanceof TmplAstLetDeclaration) {
      this.getAnalysis(component).allLetDeclarations.add(node);
    } else if (node instanceof AST) {
      const unwrappedNode = node instanceof ASTWithSource ? node.ast : node;
      const target = ctx.boundTarget.getExpressionTarget(unwrappedNode);

      if (target !== null && target instanceof TmplAstLetDeclaration) {
        this.getAnalysis(component).usedLetDeclarations.add(target);
      }
    }

    return [];
  }

  private getAnalysis(component: TcbTargetInput): ClassAnalysis {
    if (!this.analysis.has(component)) {
      this.analysis.set(component, {
        allLetDeclarations: new Set(),
        usedLetDeclarations: new Set(),
      });
    }
    return this.analysis.get(component)!;
  }
}

export const factory: TemplateCheckFactory<8112, 'unusedLetDeclaration'> = {
  code: 8112,
  name: 'unusedLetDeclaration',
  create: () => new UnusedLetDeclarationCheck(),
};
