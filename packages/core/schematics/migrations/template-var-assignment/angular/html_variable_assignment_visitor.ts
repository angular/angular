/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {ImplicitReceiver, ParseSourceSpan, PropertyWrite, RecursiveAstVisitor, TmplAstBoundEvent, TmplAstElement, TmplAstTemplate, TmplAstVariable} from '@angular/compiler';
import {TemplateAstVisitor} from '../../../utils/template_ast_visitor';


export interface TemplateVariableAssignment {
  start: number;
  end: number;
  node: PropertyWrite;
}

/**
 * HTML AST visitor that traverses the Render3 HTML AST in order to find all
 * expressions that write to local template variables within bound events.
 */
export class HtmlVariableAssignmentVisitor extends TemplateAstVisitor {
  variableAssignments: TemplateVariableAssignment[] = [];

  private currentVariables: TmplAstVariable[] = [];
  private expressionAstVisitor;

  constructor(compilerModule: typeof import('@angular/compiler')) {
    super(compilerModule);

    // AST visitor that resolves all variable assignments within a given expression AST.
    // This class must be defined within the template visitor due to the need to extend from a class
    // value found within `@angular/compiler` which is dynamically imported and provided to the
    // visitor.
    this.expressionAstVisitor = new (class extends compilerModule.RecursiveAstVisitor {
      constructor(
          private variableAssignments: TemplateVariableAssignment[],
          private currentVariables: TmplAstVariable[]) {
        super();
      }

      override visitPropertyWrite(node: PropertyWrite, span: ParseSourceSpan) {
        if (node.receiver instanceof compilerModule.ImplicitReceiver &&
            this.currentVariables.some(v => v.name === node.name)) {
          this.variableAssignments.push({
            node: node,
            start: span.start.offset,
            end: span.end.offset,
          });
        }
        super.visitPropertyWrite(node, span);
      }
    })(this.variableAssignments, this.currentVariables);
  }

  override visitElement(element: TmplAstElement): void {
    this.visitAll(element.outputs);
    this.visitAll(element.children);
  }

  override visitTemplate(template: TmplAstTemplate): void {
    // Keep track of the template variables which can be accessed by the template
    // child nodes through the implicit receiver.
    this.currentVariables.push(...template.variables);

    // Visit all children of the template. The template proxies the outputs of the
    // immediate child elements, so we just ignore outputs on the "Template" in order
    // to not visit similar bound events twice.
    this.visitAll(template.children);

    // Remove all previously added variables since all children that could access
    // these have been visited already.
    template.variables.forEach(v => {
      const variableIdx = this.currentVariables.indexOf(v);

      if (variableIdx !== -1) {
        this.currentVariables.splice(variableIdx, 1);
      }
    });
  }

  override visitBoundEvent(node: TmplAstBoundEvent) {
    node.handler.visit(this.expressionAstVisitor, node.handlerSpan);
  }
}
