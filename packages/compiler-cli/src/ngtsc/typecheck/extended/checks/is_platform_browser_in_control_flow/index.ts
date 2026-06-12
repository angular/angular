/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 */

import {
  AST,
  Call,
  RecursiveAstVisitor,
  TmplAstIfBlockBranch,
  TmplAstNode,
  TmplAstSwitchBlock,
  TmplAstSwitchBlockCase,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
  formatExtendedError,
} from '../../api';

/**
 * Extract control flow expression from Angular template nodes
 */
function getControlFlowExpression(node: TmplAstNode): AST | null {
  if (node instanceof TmplAstIfBlockBranch) {
    return node.expression;
  }
  if (node instanceof TmplAstSwitchBlock) {
    return node.expression;
  }
  if (node instanceof TmplAstSwitchBlockCase) {
    return node.expression;
  }
  return null;
}

/**
 * Visitor to detect isPlatformBrowser() calls
 */
class PlatformBrowserVisitor extends RecursiveAstVisitor {
  found = false;

  override visitCall(ast: Call) {
    const receiver = ast.receiver as any;

    if (receiver && receiver.name === 'isPlatformBrowser') {
      this.found = true;
    }

    super.visitCall(ast, null);
  }
}

/**
 * Detects usage of `isPlatformBrowser()` inside control flow expressions
 */
class IsPlatformBrowserInControlFlowCheck extends TemplateCheckWithVisitor<ErrorCode.HYDRATION_PLATFORM_BROWSER_IN_CONTROL_FLOW> {
  override code = ErrorCode.HYDRATION_PLATFORM_BROWSER_IN_CONTROL_FLOW as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.HYDRATION_PLATFORM_BROWSER_IN_CONTROL_FLOW>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.HYDRATION_PLATFORM_BROWSER_IN_CONTROL_FLOW>[] {
    // Only handle control flow template nodes
    if (
      node instanceof TmplAstIfBlockBranch ||
      node instanceof TmplAstSwitchBlock ||
      node instanceof TmplAstSwitchBlockCase
    ) {
      const expr = getControlFlowExpression(node);

      if (expr !== null) {
        const visitor = new PlatformBrowserVisitor();
        expr.visit(visitor);

        if (visitor.found) {
          const errorString = formatExtendedError(
            ErrorCode.HYDRATION_PLATFORM_BROWSER_IN_CONTROL_FLOW,
            `Using isPlatformBrowser() inside control flow (e.g. @if, @switch) may cause hydration re-rendering and UI flicker.`,
          );

          return [ctx.makeTemplateDiagnostic(expr.sourceSpan as any, errorString)];
        }
      }
    }

    return [];
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.HYDRATION_PLATFORM_BROWSER_IN_CONTROL_FLOW,
  ExtendedTemplateDiagnosticName.HYDRATION_PLATFORM_BROWSER_IN_CONTROL_FLOW
> = {
  code: ErrorCode.HYDRATION_PLATFORM_BROWSER_IN_CONTROL_FLOW,
  name: ExtendedTemplateDiagnosticName.HYDRATION_PLATFORM_BROWSER_IN_CONTROL_FLOW,
  create: () => new IsPlatformBrowserInControlFlowCheck(),
};
