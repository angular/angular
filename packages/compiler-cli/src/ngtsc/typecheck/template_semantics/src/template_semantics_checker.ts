/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ASTWithSource,
  Binary,
  BindingType,
  CssSelector,
  ImplicitReceiver,
  ParsedEventType,
  PropertyRead,
  RecursiveAstVisitor,
  ThisReceiver,
  TmplAstBoundEvent,
  TmplAstElement,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstRecursiveVisitor,
  TmplAstVariable,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../../diagnostics';
import {TemplateDiagnostic, TemplateTypeChecker} from '../../api';
import {isSignalReference} from '../../src/symbol_util';
import {TemplateSemanticsChecker} from '../api/api';

const NG_SKIP_HYDRATION_ATTR = 'ngSkipHydration';

function selectorMatchesAttribute(selectorStr: string | null, attrName: string): boolean {
  if (!selectorStr) {
    return false;
  }
  try {
    const selectors = CssSelector.parse(selectorStr);
    for (const sel of selectors) {
      for (let i = 0; i < sel.attrs.length; i += 2) {
        if (sel.attrs[i] === attrName) {
          return true;
        }
      }
    }
  } catch {
    return false;
  }
  return false;
}

export class TemplateSemanticsCheckerImpl implements TemplateSemanticsChecker {
  constructor(private templateTypeChecker: TemplateTypeChecker) {}

  getDiagnosticsForComponent(component: ts.ClassDeclaration): TemplateDiagnostic[] {
    const template = this.templateTypeChecker.getTemplate(component);
    return template !== null
      ? TemplateSemanticsVisitor.visit(template, component, this.templateTypeChecker)
      : [];
  }
}

/** Visitor that verifies the semantics of a template. */
class TemplateSemanticsVisitor extends TmplAstRecursiveVisitor {
  static visit(
    nodes: TmplAstNode[],
    component: ts.ClassDeclaration,
    templateTypeChecker: TemplateTypeChecker,
  ) {
    const diagnostics: TemplateDiagnostic[] = [];
    const expressionVisitor = new ExpressionsSemanticsVisitor(
      templateTypeChecker,
      component,
      diagnostics,
    );
    const templateVisitor = new TemplateSemanticsVisitor(
      expressionVisitor,
      templateTypeChecker,
      component,
      diagnostics,
    );
    nodes.forEach((node) => node.visit(templateVisitor));
    return diagnostics;
  }

  private constructor(
    private expressionVisitor: ExpressionsSemanticsVisitor,
    private templateTypeChecker: TemplateTypeChecker,
    private component: ts.ClassDeclaration,
    private diagnostics: TemplateDiagnostic[],
  ) {
    super();
  }

  override visitElement(element: TmplAstElement) {
    super.visitElement(element);

    const directives = this.templateTypeChecker.getDirectivesOfNode(this.component, element);
    const hostlessComponent = directives?.find((dir) => dir.isComponent && dir.isHostless);

    if (hostlessComponent !== undefined) {
      for (const input of element.inputs) {
        const isInputClaimed = directives?.some((dir) =>
          dir.inputs.hasBindingPropertyName(input.name),
        );
        if (
          input.type === BindingType.Attribute ||
          input.type === BindingType.Class ||
          input.type === BindingType.Style ||
          input.type === BindingType.Animation
        ) {
          if (!isInputClaimed) {
            this.reportHostlessBindingError(input);
          }
        } else if (input.type === BindingType.Property) {
          if (!isInputClaimed) {
            this.reportHostlessBindingError(input);
          }
        }
      }
      for (const output of element.outputs) {
        const isOutputClaimed = directives?.some((dir) =>
          dir.outputs.hasBindingPropertyName(output.name),
        );
        if (!isOutputClaimed) {
          this.reportHostlessBindingError(output);
        }
      }
      for (const attribute of element.attributes) {
        if (attribute.name === NG_SKIP_HYDRATION_ATTR) continue;
        const isClaimed = directives?.some((dir) => {
          if (dir.inputs.hasBindingPropertyName(attribute.name)) return true;
          if (selectorMatchesAttribute(dir.selector, attribute.name)) {
            return true;
          }
          return false;
        });
        if (!isClaimed) {
          this.reportHostlessBindingError(attribute);
        }
      }
    }
  }

  private reportHostlessBindingError(node: TmplAstNode) {
    this.diagnostics.push(
      this.templateTypeChecker.makeTemplateDiagnostic(
        this.component,
        node.sourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.HOSTLESS_COMPONENT_UNSUPPORTED_BINDING),
        'Hostless components cannot have DOM bindings.',
      ),
    );
  }

  override visitBoundEvent(event: TmplAstBoundEvent): void {
    super.visitBoundEvent(event);
    event.handler.visit(this.expressionVisitor, event);
  }
}

/** Visitor that verifies the semantics of the expressions within a template. */
class ExpressionsSemanticsVisitor extends RecursiveAstVisitor {
  constructor(
    private templateTypeChecker: TemplateTypeChecker,
    private component: ts.ClassDeclaration,
    private diagnostics: TemplateDiagnostic[],
  ) {
    super();
  }

  override visitBinary(ast: Binary, context: TmplAstNode): void {
    if (Binary.isAssignmentOperation(ast.operation) && ast.left instanceof PropertyRead) {
      this.checkForIllegalWriteInEventBinding(ast.left, context);
    } else {
      super.visitBinary(ast, context);
    }
  }

  override visitPropertyRead(ast: PropertyRead, context: TmplAstNode) {
    super.visitPropertyRead(ast, context);
    this.checkForIllegalWriteInTwoWayBinding(ast, context);
  }

  private checkForIllegalWriteInEventBinding(ast: PropertyRead, context: TmplAstNode) {
    if (!this.shouldCheckForIllegalWrites(ast, context)) {
      return;
    }

    const target = this.templateTypeChecker.getExpressionTarget(ast, this.component);
    if (target instanceof TmplAstVariable) {
      const errorMessage = `Cannot use variable '${target.name}' as the left-hand side of an assignment expression. Template variables are read-only.`;
      this.diagnostics.push(this.makeIllegalTemplateVarDiagnostic(target, context, errorMessage));
    }
  }

  private checkForIllegalWriteInTwoWayBinding(ast: PropertyRead, context: TmplAstNode) {
    // Only check top-level property reads inside two-way bindings for illegal assignments.
    if (
      !this.shouldCheckForIllegalWrites(ast, context) ||
      context.type !== ParsedEventType.TwoWay ||
      ast !== unwrapAstWithSource(context.handler)
    ) {
      return;
    }

    const target = this.templateTypeChecker.getExpressionTarget(ast, this.component);
    const isVariable = target instanceof TmplAstVariable;
    const isLet = target instanceof TmplAstLetDeclaration;

    if (!isVariable && !isLet) {
      return;
    }

    // Two-way bindings to template variables are only allowed if the variables are signals.
    const symbol = this.templateTypeChecker.getSymbolOfNode(target, this.component);
    if (symbol !== null && !isSignalReference(symbol, this.templateTypeChecker)) {
      let errorMessage: string;

      if (isVariable) {
        errorMessage = `Cannot use a non-signal variable '${target.name}' in a two-way binding expression. Template variables are read-only.`;
      } else {
        errorMessage = `Cannot use non-signal @let declaration '${target.name}' in a two-way binding expression. @let declarations are read-only.`;
      }

      this.diagnostics.push(this.makeIllegalTemplateVarDiagnostic(target, context, errorMessage));
    }
  }

  private makeIllegalTemplateVarDiagnostic(
    target: TmplAstVariable | TmplAstLetDeclaration,
    expressionNode: TmplAstBoundEvent,
    errorMessage: string,
  ): TemplateDiagnostic {
    const span =
      target instanceof TmplAstVariable ? target.valueSpan || target.sourceSpan : target.sourceSpan;
    return this.templateTypeChecker.makeTemplateDiagnostic(
      this.component,
      expressionNode.handlerSpan,
      ts.DiagnosticCategory.Error,
      ngErrorCode(ErrorCode.WRITE_TO_READ_ONLY_VARIABLE),
      errorMessage,
      [
        {
          text: `'${target.name}' is declared here.`,
          start: span.start.offset,
          end: span.end.offset,
          sourceFile: this.component.getSourceFile(),
        },
      ],
    );
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

function unwrapAstWithSource(ast: AST): AST {
  return ast instanceof ASTWithSource ? ast.ast : ast;
}
