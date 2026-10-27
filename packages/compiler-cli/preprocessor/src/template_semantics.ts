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
  ThisReceiver,
  TmplAstBoundEvent,
  TmplAstNode,
  TmplAstRecursiveVisitor,
  TmplAstVariable,
  TypeCheckId,
  Unary,
  unwrapWriteTarget,
  type TcbDirectiveMetadata,
} from '@angular/compiler';
import {Diagnostic} from './diagnostic.js';

/** `ErrorCode.WRITE_TO_READ_ONLY_VARIABLE`. */
const WRITE_TO_READ_ONLY_VARIABLE = 8005;

/**
 * Verifies the semantics of a component's template, reporting the diagnostics of ngtsc's
 * `TemplateSemanticsCheckerImpl`:
 * https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/typecheck/template_semantics/src/template_semantics_checker.ts
 */
export function getTemplateSemanticsDiagnostics(
  typeCheckId: TypeCheckId,
  nodes: TmplAstNode[],
  boundTarget: BoundTarget<TcbDirectiveMetadata>,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const expressionVisitor = new ExpressionsSemanticsVisitor(typeCheckId, boundTarget, diagnostics);
  const templateVisitor = new TemplateSemanticsVisitor(expressionVisitor);
  for (const node of nodes) {
    node.visit(templateVisitor);
  }
  return diagnostics;
}

/** Visitor that verifies the semantics of a template. */
class TemplateSemanticsVisitor extends TmplAstRecursiveVisitor {
  constructor(private readonly expressionVisitor: ExpressionsSemanticsVisitor) {
    super();
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

  // TODO(parity): ngtsc also visits property reads (`visitPropertyRead`) to report two-way
  // bindings to template variables and `@let` declarations that don't hold signals ("Cannot use a
  // non-signal variable '…' in a two-way binding expression. Template variables are read-only."
  // and "Cannot use non-signal @let declaration '…' in a two-way binding expression. @let
  // declarations are read-only."). It tells signals apart with the type checker
  // (`isSignalReference(templateTypeChecker.getSymbolOfNode(target, component))`), which the
  // preprocessor doesn't have, so that check isn't ported rather than flag valid signal writes.

  private checkForIllegalWriteInEventBinding(ast: PropertyRead, context: TmplAstNode): void {
    if (!this.shouldCheckForIllegalWrites(ast, context)) {
      return;
    }

    const target = this.boundTarget.getExpressionTarget(ast);
    if (target instanceof TmplAstVariable) {
      this.reportIllegalWrite(
        context,
        target,
        `Cannot use variable '${target.name}' as the left-hand side of an assignment expression. Template variables are read-only.`,
      );
    }
  }

  private reportIllegalWrite(
    event: TmplAstBoundEvent,
    target: TmplAstVariable,
    message: string,
  ): void {
    const span = target.valueSpan || target.sourceSpan;
    this.diagnostics.push({
      typeCheckId: this.typeCheckId,
      category: OutOfBandDiagnosticCategory.Error,
      code: WRITE_TO_READ_ONLY_VARIABLE,
      message,
      start: event.handlerSpan.start.offset,
      end: event.handlerSpan.end.offset,
      relatedInformation: [
        {
          message: `'${target.name}' is declared here.`,
          start: span.start.offset,
          end: span.end.offset,
        },
      ],
    });
  }

  private shouldCheckForIllegalWrites(
    ast: PropertyRead,
    context: TmplAstNode,
  ): context is TmplAstBoundEvent {
    return (
      context instanceof TmplAstBoundEvent &&
      (ast.receiver instanceof ImplicitReceiver || ast.receiver instanceof ThisReceiver)
    );
  }
}
