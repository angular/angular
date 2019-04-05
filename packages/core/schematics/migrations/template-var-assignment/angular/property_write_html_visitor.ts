/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceSpan, PropertyWrite, RecursiveAstVisitor} from '@angular/compiler';
import {BoundEvent, Element, NullVisitor, Template, Variable, visitAll} from '@angular/compiler/src/render3/r3_ast';

export interface PropertyAssignment {
  start: number;
  end: number;
  node: PropertyWrite;
}

/**
 * AST visitor that traverses the Render3 HTML AST in order to find all declared
 * template variables and property assignments within bound events.
 */
export class PropertyWriteHtmlVisitor extends NullVisitor {
  templateVariables: Variable[] = [];
  propertyAssignments: PropertyAssignment[] = [];

  private expressionAstVisitor = new ExpressionAstVisitor(this.propertyAssignments);

  visitElement(element: Element): void {
    visitAll(this, element.outputs);
    visitAll(this, element.children);
  }

  visitTemplate(template: Template): void {
    // Visit all children of the template. The template proxies the outputs of the
    // immediate child elements, so we just ignore outputs on the "Template" in order
    // to not visit similar bound events twice.
    visitAll(this, template.children);

    // Keep track of all declared local template variables.
    this.templateVariables.push(...template.variables);
  }

  visitBoundEvent(node: BoundEvent) {
    node.handler.visit(this.expressionAstVisitor, node.handlerSpan);
  }
}

/** AST visitor that resolves all property assignments with a given expression AST. */
class ExpressionAstVisitor extends RecursiveAstVisitor {
  constructor(private propertyAssignments: PropertyAssignment[]) { super(); }

  visitPropertyWrite(node: PropertyWrite, span: ParseSourceSpan) {
    this.propertyAssignments.push({
      node: node,
      start: span.start.offset,
      end: span.end.offset,
    });

    super.visitPropertyWrite(node, span);
  }
}
