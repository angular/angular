/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ImplicitReceiver, ParseSourceSpan, PropertyRead, RecursiveAstVisitor} from '@angular/compiler';
import {BoundAttribute, BoundEvent, BoundText, Element, Node, NullVisitor, Template, visitAll} from '@angular/compiler/src/render3/r3_ast';

/**
 * AST visitor that traverses the Render3 HTML AST in order to check if the given
 * query property is accessed statically in the template.
 */
export class TemplateUsageVisitor extends NullVisitor {
  private hasQueryTemplateReference = false;
  private expressionAstVisitor = new ExpressionAstVisitor(this.queryPropertyName);

  constructor(public queryPropertyName: string) {
    super();
  }

  /** Checks whether the given query is statically accessed within the specified HTML nodes. */
  isQueryUsedStatically(htmlNodes: Node[]): boolean {
    this.hasQueryTemplateReference = false;
    this.expressionAstVisitor.hasQueryPropertyRead = false;

    // Visit all AST nodes and check if the query property is used statically.
    visitAll(this, htmlNodes);

    return !this.hasQueryTemplateReference && this.expressionAstVisitor.hasQueryPropertyRead;
  }

  override visitElement(element: Element): void {
    // In case there is a template references variable that matches the query property
    // name, we can finish this visitor as such a template variable can be used in the
    // entire template and the query therefore can't be accessed from the template.
    if (element.references.some(r => r.name === this.queryPropertyName)) {
      this.hasQueryTemplateReference = true;
      return;
    }

    visitAll(this, element.attributes);
    visitAll(this, element.inputs);
    visitAll(this, element.outputs);
    visitAll(this, element.children);
  }

  override visitTemplate(template: Template): void {
    visitAll(this, template.attributes);
    visitAll(this, template.inputs);
    visitAll(this, template.outputs);

    // We don't want to visit any children of the template as these never can't
    // access a query statically. The templates can be rendered in the ngAfterViewInit"
    // lifecycle hook at the earliest.
  }

  override visitBoundAttribute(attribute: BoundAttribute) {
    attribute.value.visit(this.expressionAstVisitor, attribute.sourceSpan);
  }

  override visitBoundText(text: BoundText) {
    text.value.visit(this.expressionAstVisitor, text.sourceSpan);
  }

  override visitBoundEvent(node: BoundEvent) {
    node.handler.visit(this.expressionAstVisitor, node.handlerSpan);
  }
}

/**
 * AST visitor that checks if the given expression contains property reads that
 * refer to the specified query property name.
 */
class ExpressionAstVisitor extends RecursiveAstVisitor {
  hasQueryPropertyRead = false;

  constructor(private queryPropertyName: string) {
    super();
  }

  override visitPropertyRead(node: PropertyRead, span: ParseSourceSpan): any {
    // The receiver of the property read needs to be "implicit" as queries are accessed
    // from the component instance and not from other objects.
    if (node.receiver instanceof ImplicitReceiver && node.name === this.queryPropertyName) {
      this.hasQueryPropertyRead = true;
      return;
    }

    super.visitPropertyRead(node, span);
  }
}
