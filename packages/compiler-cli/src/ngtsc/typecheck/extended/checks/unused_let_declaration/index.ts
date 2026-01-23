/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, ASTWithSource, TmplAstLetDeclaration, TmplAstNode} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

interface ClassAnalysis {
  allLetDeclarations: Set<TmplAstLetDeclaration>;
  usedLetDeclarations: Set<TmplAstLetDeclaration>;
}

/**
 * Ensures that all `@let` declarations in a template are used.
 */
class UnusedLetDeclarationCheck extends TemplateCheckWithVisitor<ErrorCode.UNUSED_LET_DECLARATION> {
  override code = ErrorCode.UNUSED_LET_DECLARATION as const;
  private analysis = new Map<ts.ClassDeclaration, ClassAnalysis>();

  override run(
    ctx: TemplateContext<ErrorCode.UNUSED_LET_DECLARATION>,
    component: ts.ClassDeclaration,
    template: TmplAstNode[],
  ): NgTemplateDiagnostic<ErrorCode.UNUSED_LET_DECLARATION>[] {
    super.run(ctx, component, template);

    const diagnostics: NgTemplateDiagnostic<ErrorCode.UNUSED_LET_DECLARATION>[] = [];
    const {allLetDeclarations, usedLetDeclarations} = this.getAnalysis(component);

    for (const decl of allLetDeclarations) {
      if (!usedLetDeclarations.has(decl)) {
        diagnostics.push(
          ctx.makeTemplateDiagnostic(
            decl.sourceSpan,
            `@let ${decl.name} is declared but its value is never read.`,
          ),
        );
      }
    }

    this.analysis.clear();
    return diagnostics;
  }

  override visitNode(
    ctx: TemplateContext<ErrorCode.UNUSED_LET_DECLARATION>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.UNUSED_LET_DECLARATION>[] {
    if (node instanceof TmplAstLetDeclaration) {
      this.getAnalysis(component).allLetDeclarations.add(node);
    } else if (node instanceof AST) {
      const unwrappedNode = node instanceof ASTWithSource ? node.ast : node;
      const target = ctx.templateTypeChecker.getExpressionTarget(unwrappedNode, component);

      if (target !== null && target instanceof TmplAstLetDeclaration) {
        this.getAnalysis(component).usedLetDeclarations.add(target);
      }
    }

    return [];
  }

  private getAnalysis(node: ts.ClassDeclaration): ClassAnalysis {
    if (!this.analysis.has(node)) {
      this.analysis.set(node, {allLetDeclarations: new Set(), usedLetDeclarations: new Set()});
    }
    return this.analysis.get(node)!;
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.UNUSED_LET_DECLARATION,
  ExtendedTemplateDiagnosticName.UNUSED_LET_DECLARATION
> = {
  code: ErrorCode.UNUSED_LET_DECLARATION,
  name: ExtendedTemplateDiagnosticName.UNUSED_LET_DECLARATION,
  create: () => new UnusedLetDeclarationCheck(),
};
