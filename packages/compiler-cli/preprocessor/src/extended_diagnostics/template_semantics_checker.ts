/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Binary,
  BoundTarget,
  ImplicitReceiver,
  OutOfBandDiagnosticCategory,
  PropertyRead,
  RecursiveAstVisitor,
  TcbDirectiveMetadata,
  ThisReceiver,
  TmplAstBoundEvent,
  TmplAstNode,
  TmplAstRecursiveVisitor,
  TmplAstVariable,
  TypeCheckId,
  Unary,
  unwrapWriteTarget,
} from '@angular/compiler';
import type {Diagnostic} from '../diagnostic.js';
import type {TcbTargetInput} from '../tcb.js';

/**
 * Interface to verify the semantics of component templates.
 *
 * Mirrors `TemplateSemanticsChecker` in
 * `ngtsc/typecheck/template_semantics/api/api.ts`.
 */
export interface TemplateSemanticsChecker {
  getDiagnosticsForComponent(
    typeCheckId: TypeCheckId,
    component: TcbTargetInput,
    boundTarget: BoundTarget<TcbDirectiveMetadata>,
  ): Diagnostic[];
}

/**
 * Mirrors `TemplateSemanticsCheckerImpl` in
 * `ngtsc/typecheck/template_semantics/src/template_semantics_checker.ts`.
 *
 * TODO: Implement `checkForIllegalWriteInTwoWayBinding` in `ExpressionsSemanticsVisitor`, which
 * requires `ts.TypeChecker` (`isSignalReference`) to determine whether a template variable or
 * `@let` declaration used in a two-way binding holds a `Signal`.
 */
export class TemplateSemanticsCheckerImpl implements TemplateSemanticsChecker {
  getDiagnosticsForComponent(
    typeCheckId: TypeCheckId,
    component: TcbTargetInput,
    boundTarget: BoundTarget<TcbDirectiveMetadata>,
  ): Diagnostic[] {
    return TemplateSemanticsVisitor.visit(typeCheckId, boundTarget, component.templateNodes);
  }
}

/** Visitor that verifies the semantics of a template. */
class TemplateSemanticsVisitor extends TmplAstRecursiveVisitor {
  private constructor(private readonly expressionVisitor: ExpressionsSemanticsVisitor) {
    super();
  }

  static visit(
    typeCheckId: TypeCheckId,
    boundTarget: BoundTarget<TcbDirectiveMetadata>,
    nodes: TmplAstNode[],
  ): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const expressionVisitor = new ExpressionsSemanticsVisitor(
      typeCheckId,
      boundTarget,
      diagnostics,
    );
    const templateVisitor = new TemplateSemanticsVisitor(expressionVisitor);
    for (const node of nodes) {
      node.visit(templateVisitor);
    }
    return diagnostics;
  }

  override visitBoundEvent(event: TmplAstBoundEvent): void {
    super.visitBoundEvent(event);
    event.handler.visit(this.expressionVisitor, event);
  }
}

/** Visitor that verifies the semantics of the expressions within a template. */
class ExpressionsSemanticsVisitor extends RecursiveAstVisitor {
  constructor(
    private readonly typeCheckId: TypeCheckId,
    private readonly boundTarget: BoundTarget<TcbDirectiveMetadata>,
    private readonly diagnostics: Diagnostic[],
  ) {
    super();
  }

  override visitBinary(ast: Binary, context: TmplAstNode): void {
    if (Binary.isAssignmentOperation(ast.operation) && ast.left instanceof PropertyRead) {
      this.checkForIllegalWriteInEventBinding(ast.left, context);
    }

    // Always recurse since the right-hand side may contain other writes (e.g. `prop = y++`).
    super.visitBinary(ast, context);
  }

  override visitUnary(ast: Unary, context: TmplAstNode): void {
    if (Unary.isUpdateOperation(ast.operator)) {
      // The target of an update operator can be wrapped in parentheses or a non-null assertion
      // (e.g. `(value)++` or `value!++`), neither of which affect what is being written to.
      const target = unwrapWriteTarget(ast.expr);

      if (target instanceof PropertyRead) {
        this.checkForIllegalWriteInEventBinding(target, context);
      }
    }

    super.visitUnary(ast, context);
  }

  private checkForIllegalWriteInEventBinding(ast: PropertyRead, context: TmplAstNode): void {
    if (
      !(context instanceof TmplAstBoundEvent) ||
      !(ast.receiver instanceof ImplicitReceiver || ast.receiver instanceof ThisReceiver)
    ) {
      return;
    }

    const target = this.boundTarget.getExpressionTarget(ast);
    if (target instanceof TmplAstVariable) {
      const errorMessage = `Cannot use variable '${target.name}' as the left-hand side of an assignment expression. Template variables are read-only.`;
      const span = target.valueSpan || target.sourceSpan;
      this.diagnostics.push({
        typeCheckId: this.typeCheckId,
        category: OutOfBandDiagnosticCategory.Error,
        code: 8005,
        message: errorMessage,
        start: context.handlerSpan.start.offset,
        end: context.handlerSpan.end.offset,
        relatedInformation: [
          {
            message: `'${target.name}' is declared here.`,
            start: span.start.offset,
            end: span.end.offset,
          },
        ],
      });
    }
  }
}
