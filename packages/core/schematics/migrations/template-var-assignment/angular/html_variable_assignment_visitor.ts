/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ImplicitReceiver, ParseSourceSpan, PropertyWrite, RecursiveAstVisitor} from '@angular/compiler';
import {BoundEvent, Element, NullVisitor, Template, Variable, visitAll} from '@angular/compiler/src/render3/r3_ast';

export interface TemplateVariableAssignment {
  start: number;
  end: number;
  node: PropertyWrite;
}

/**
 * HTML AST visitor that traverses the Render3 HTML AST in order to find all
 * expressions that write to local template variables within bound events.
 */
export class HtmlVariableAssignmentVisitor extends NullVisitor {
  variableAssignments: TemplateVariableAssignment[] = [];

  private currentVariables: Variable[] = [];
  private expressionAstVisitor =
      new ExpressionAstVisitor(this.variableAssignments, this.currentVariables);

  visitElement(element: Element): void {
    visitAll(this, element.outputs);
    visitAll(this, element.children);
  }

  visitTemplate(template: Template): void {
    // Keep track of the template variables which can be accessed by the template
    // child nodes through the implicit receiver.
    this.currentVariables.push(...template.variables);

    // Visit all children of the template. The template proxies the outputs of the
    // immediate child elements, so we just ignore outputs on the "Template" in order
    // to not visit similar bound events twice.
    visitAll(this, template.children);

    // Remove all previously added variables since all children that could access
    // these have been visited already.
    template.variables.forEach(v => {
      const variableIdx = this.currentVariables.indexOf(v);

      if (variableIdx !== -1) {
        this.currentVariables.splice(variableIdx, 1);
      }
    });
  }

  visitBoundEvent(node: BoundEvent) {
    node.handler.visit(this.expressionAstVisitor, node.handlerSpan);
  }
}

/** AST visitor that resolves all variable assignments within a given expression AST. */
class ExpressionAstVisitor extends RecursiveAstVisitor {
  constructor(
      private variableAssignments: TemplateVariableAssignment[],
      private currentVariables: Variable[]) {
    super();
  }

  visitPropertyWrite(node: PropertyWrite, span: ParseSourceSpan) {
    if (node.receiver instanceof ImplicitReceiver &&
        this.currentVariables.some(v => v.name === node.name)) {
      this.variableAssignments.push({
        node: node,
        start: span.start.offset,
        end: span.end.offset,
      });
    }
    super.visitPropertyWrite(node, span);
  }
}
