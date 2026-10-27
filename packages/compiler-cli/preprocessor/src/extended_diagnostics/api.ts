/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AbsoluteSourceSpan,
  AST,
  BoundTarget,
  CombinedRecursiveAstVisitor,
  isNgTemplate,
  KeyedRead,
  NonNullAssert,
  ParenthesizedExpression,
  ParseSourceSpan,
  SafeCall,
  SafeKeyedRead,
  SafePropertyRead,
  TcbDirectiveMetadata,
  TmplAstNode,
  TmplAstTemplate,
  VERSION,
} from '@angular/compiler';
import type {ExtendedTemplateDiagnosticName, NgpCompilerOptions} from '../compiler_options.js';
import type {Diagnostic, DiagnosticRelatedInformation} from '../diagnostic.js';
import type {TcbTargetInput} from '../tcb.js';

const versionSubDomain = VERSION.major !== '0' ? `v${VERSION.major}.` : '';
export const EXTENDED_ERROR_DETAILS_PAGE_BASE_URL = `https://${versionSubDomain}angular.dev/extended-diagnostics`;

/**
 * Mirrors `formatExtendedError` in `ngtsc/typecheck/extended/api/format-extended-error.ts`.
 */
export function formatExtendedError(code: number, message?: null | false | string): string {
  const fullCode = `NG${Math.abs(code)}`;
  const errorMessage = `${fullCode}${message ? ': ' + message : ''}`;
  const addPeriodSeparator = !/[.,;!?\n]$/.test(errorMessage);
  const separator = addPeriodSeparator ? '.' : '';
  return `${errorMessage}${separator} Find more at ${EXTENDED_ERROR_DETAILS_PAGE_BASE_URL}/${fullCode}`;
}

/**
 * A Template Check receives information about the template it's checking and returns
 * information about the diagnostics to be generated.
 *
 * Mirrors `TemplateCheck` in `ngtsc/typecheck/extended/api/api.ts`.
 */
export interface TemplateCheck<Code extends number> {
  /** Unique template check code, used for configuration and searching the error. */
  code: Code;

  /** Runs check and returns information about the diagnostics to be generated. */
  run(ctx: TemplateContext<Code>, component: TcbTargetInput, template: TmplAstNode[]): Diagnostic[];
}

/**
 * The TemplateContext provided to a Template Check to get diagnostic information.
 *
 * Mirrors `TemplateContext` in `ngtsc/typecheck/extended/api/api.ts`.
 */
export interface TemplateContext<Code extends number = number> {
  /** Bound template target providing directive/pipe/expression target bindings for the template. */
  boundTarget: BoundTarget<TcbDirectiveMetadata>;

  /**
   * Creates a template diagnostic with the given information for the template being processed and
   * using the diagnostic category configured for the extended template diagnostic.
   */
  makeTemplateDiagnostic(
    sourceSpan: ParseSourceSpan | AbsoluteSourceSpan | {start: number; end: number},
    message: string,
    relatedInformation?: readonly DiagnosticRelatedInformation[],
  ): Diagnostic;
}

/**
 * A factory which creates a template check for a particular code and name. This binds the two
 * together and associates them with a specific `TemplateCheck`.
 *
 * Mirrors `TemplateCheckFactory` in `ngtsc/typecheck/extended/api/api.ts`.
 */
export interface TemplateCheckFactory<
  Code extends number,
  Name extends ExtendedTemplateDiagnosticName,
> {
  code: Code;
  name: Name;
  create(options?: NgpCompilerOptions): TemplateCheck<Code> | null;
}

/**
 * This abstract class provides a base implementation for the run method, visiting all nodes in
 * the template and calling `visitNode()` for each one.
 *
 * Mirrors `TemplateCheckWithVisitor` in `ngtsc/typecheck/extended/api/api.ts`.
 */
export abstract class TemplateCheckWithVisitor<Code extends number> implements TemplateCheck<Code> {
  abstract code: Code;

  /**
   * Base implementation for run function, visits all nodes in template and calls
   * `visitNode()` for each one.
   */
  run(
    ctx: TemplateContext<Code>,
    component: TcbTargetInput,
    template: TmplAstNode[],
  ): Diagnostic[] {
    const visitor = new TemplateVisitor<Code>(ctx, component, this);
    return visitor.getDiagnostics(template);
  }

  /**
   * Visit a TmplAstNode or AST node of the template. Authors should override this
   * method to implement the check and return diagnostics.
   */
  abstract visitNode(
    ctx: TemplateContext<Code>,
    component: TcbTargetInput,
    node: TmplAstNode | AST,
  ): Diagnostic[];
}

/**
 * Visits all nodes in a template (TmplAstNode and AST) and calls `visitNode` for each one.
 *
 * Mirrors `TemplateVisitor` in `ngtsc/typecheck/extended/api/api.ts`.
 */
class TemplateVisitor<Code extends number> extends CombinedRecursiveAstVisitor {
  diagnostics: Diagnostic[] = [];

  constructor(
    private readonly ctx: TemplateContext<Code>,
    private readonly component: TcbTargetInput,
    private readonly check: TemplateCheckWithVisitor<Code>,
  ) {
    super();
  }

  override visit(node: AST | TmplAstNode): void {
    this.diagnostics.push(...this.check.visitNode(this.ctx, this.component, node));
    super.visit(node);
  }

  override visitTemplate(template: TmplAstTemplate): void {
    const isInlineTemplate = template.tagName && isNgTemplate(template.tagName);
    this.visitAllTemplateNodes(template.attributes);

    if (isInlineTemplate) {
      // Only visit input/outputs if this isn't an inline template node generated for a structural
      // directive (like `<div *ngIf></div>`). These nodes would be visited when the underlying
      // element of an inline template node is processed.
      this.visitAllTemplateNodes(template.inputs);
      this.visitAllTemplateNodes(template.outputs);
    }

    this.visitAllTemplateNodes(template.directives);

    // `templateAttrs` aren't transferred over to the inner element so we always have to visit them.
    this.visitAllTemplateNodes(template.templateAttrs);

    this.visitAllTemplateNodes(template.variables);
    this.visitAllTemplateNodes(template.references);
    this.visitAllTemplateNodes(template.children);
  }

  getDiagnostics(template: TmplAstNode[]): Diagnostic[] {
    this.diagnostics = [];
    this.visitAllTemplateNodes(template);
    return this.diagnostics;
  }
}

/**
 * Checks if the given AST node originates from a KeyedRead (indexed access)
 * by unwrapping parentheses, non-null assertions, and traversing the receivers
 * of safe navigation operations (?. property access, ?.[] keyed access, ?.() calls).
 *
 * Mirrors `isAccessFromUncheckedIndex` in `ngtsc/typecheck/extended/api/api.ts`.
 */
export function isAccessFromUncheckedIndex(node: AST): boolean {
  if (node instanceof KeyedRead) {
    return true;
  } else if (
    node instanceof SafePropertyRead ||
    node instanceof SafeKeyedRead ||
    node instanceof SafeCall
  ) {
    return isAccessFromUncheckedIndex(node.receiver);
  } else if (node instanceof ParenthesizedExpression || node instanceof NonNullAssert) {
    return isAccessFromUncheckedIndex(node.expression);
  }
  return false;
}
