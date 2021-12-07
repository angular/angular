/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, ASTWithSource, ParseSourceSpan, RecursiveAstVisitor, TmplAstBoundAttribute, TmplAstBoundEvent, TmplAstBoundText, TmplAstContent, TmplAstElement, TmplAstIcu, TmplAstNode, TmplAstRecursiveVisitor, TmplAstReference, TmplAstTemplate, TmplAstText, TmplAstTextAttribute, TmplAstVariable} from '@angular/compiler';
import ts from 'typescript';

import {NgCompilerOptions} from '../../../core/api';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../diagnostics';
import {NgTemplateDiagnostic, TemplateTypeChecker} from '../../api';

/**
 * A Template Check receives information about the template it's checking and returns
 * information about the diagnostics to be generated.
 */
export interface TemplateCheck<Code extends ErrorCode> {
  /** Unique template check code, used for configuration and searching the error. */
  code: Code;

  /** Runs check and returns information about the diagnostics to be generated. */
  run(ctx: TemplateContext<Code>, component: ts.ClassDeclaration,
      template: TmplAstNode[]): NgTemplateDiagnostic<Code>[];
}

/**
 * The TemplateContext provided to a Template Check to get diagnostic information.
 */
export interface TemplateContext<Code extends ErrorCode> {
  /** Interface that provides information about template nodes. */
  templateTypeChecker: TemplateTypeChecker;

  /**
   * TypeScript interface that provides type information about symbols that appear
   * in the template (it is not to query types outside the Angular component).
   */
  typeChecker: ts.TypeChecker;

  /**
   * Creates a template diagnostic with the given information for the template being processed and
   * using the diagnostic category configured for the extended template diagnostic.
   */
  makeTemplateDiagnostic(sourceSpan: ParseSourceSpan, message: string, relatedInformation?: {
    text: string,
    start: number,
    end: number,
    sourceFile: ts.SourceFile,
  }[]): NgTemplateDiagnostic<Code>;
}

/**
 * A factory which creates a template check for a particular code and name. This binds the two
 * together and associates them with a specific `TemplateCheck`.
 */
export interface TemplateCheckFactory<
  Code extends ErrorCode,
  Name extends ExtendedTemplateDiagnosticName,
> {
  code: Code;
  name: Name;
  create(options: NgCompilerOptions): TemplateCheck<Code>|null;
}

/**
 * This abstract class provides a base implementation for the run method.
 */
export abstract class TemplateCheckWithVisitor<Code extends ErrorCode> implements
    TemplateCheck<Code> {
  abstract code: Code;

  /**
   * Base implementation for run function, visits all nodes in template and calls
   * `visitNode()` for each one.
   */
  run(ctx: TemplateContext<Code>, component: ts.ClassDeclaration,
      template: TmplAstNode[]): NgTemplateDiagnostic<Code>[] {
    const visitor = new TemplateVisitor<Code>(ctx, component, this);
    return visitor.getDiagnostics(template);
  }

  /**
   * Visit a TmplAstNode or AST node of the template. Authors should override this
   * method to implement the check and return diagnostics.
   */
  abstract visitNode(
      ctx: TemplateContext<Code>, component: ts.ClassDeclaration,
      node: TmplAstNode|AST): NgTemplateDiagnostic<Code>[];
}

/**
 * Visits all nodes in a template (TmplAstNode and AST) and calls `visitNode` for each one.
 */
class TemplateVisitor<Code extends ErrorCode> extends RecursiveAstVisitor implements
    TmplAstRecursiveVisitor {
  diagnostics: NgTemplateDiagnostic<Code>[] = [];

  constructor(
      private readonly ctx: TemplateContext<Code>, private readonly component: ts.ClassDeclaration,
      private readonly check: TemplateCheckWithVisitor<Code>) {
    super();
  }

  override visit(node: AST|TmplAstNode, context?: any) {
    this.diagnostics.push(...this.check.visitNode(this.ctx, this.component, node));
    node.visit(this);
  }

  visitAllNodes(nodes: TmplAstNode[]) {
    for (const node of nodes) {
      this.visit(node);
    }
  }

  visitAst(ast: AST) {
    if (ast instanceof ASTWithSource) {
      ast = ast.ast;
    }
    this.visit(ast);
  }

  visitElement(element: TmplAstElement) {
    this.visitAllNodes(element.attributes);
    this.visitAllNodes(element.inputs);
    this.visitAllNodes(element.outputs);
    this.visitAllNodes(element.references);
    this.visitAllNodes(element.children);
  }

  visitTemplate(template: TmplAstTemplate) {
    this.visitAllNodes(template.attributes);
    if (template.tagName === 'ng-template') {
      // Only visit input/outputs/templateAttrs if this isn't an inline template node
      // generated for a structural directive (like `<div *ngIf></div>`). These nodes
      // would be visited when the underlying element of an inline template node is processed.
      this.visitAllNodes(template.inputs);
      this.visitAllNodes(template.outputs);
      this.visitAllNodes(template.templateAttrs);
    }
    this.visitAllNodes(template.variables);
    this.visitAllNodes(template.references);
    this.visitAllNodes(template.children);
  }
  visitContent(content: TmplAstContent): void {}
  visitVariable(variable: TmplAstVariable): void {}
  visitReference(reference: TmplAstReference): void {}
  visitTextAttribute(attribute: TmplAstTextAttribute): void {}
  visitBoundAttribute(attribute: TmplAstBoundAttribute): void {
    this.visitAst(attribute.value);
  }
  visitBoundEvent(attribute: TmplAstBoundEvent): void {
    this.visitAst(attribute.handler);
  }
  visitText(text: TmplAstText): void {}
  visitBoundText(text: TmplAstBoundText): void {
    this.visitAst(text.value);
  }
  visitIcu(icu: TmplAstIcu): void {}

  getDiagnostics(template: TmplAstNode[]): NgTemplateDiagnostic<Code>[] {
    this.diagnostics = [];
    this.visitAllNodes(template);
    return this.diagnostics;
  }
}
