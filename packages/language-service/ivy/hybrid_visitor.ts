/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceSpan} from '@angular/compiler';
import * as e from '@angular/compiler/src/expression_parser/ast';  // e for expression AST
import * as t from '@angular/compiler/src/render3/r3_ast';         // t for template AST

/**
 * Return the template AST node or expression AST node that most accurately
 * represents the node at the specified cursor `position`.
 * @param ast AST tree
 * @param position cursor position
 */
export function findNodeAtPosition(ast: t.Node[], position: number): t.Node|e.AST|undefined {
  const visitor = new R3Visitor(position);
  visitor.visitAll(ast);
  return visitor.path[visitor.path.length - 1];
}

class R3Visitor implements t.Visitor {
  // We need to keep a path instead of the last node because we might need more
  // context for the last node, for example what is the parent node?
  readonly path: Array<t.Node|e.AST> = [];

  // Position must be absolute in the source file.
  constructor(private readonly position: number) {}

  visit(node: t.Node) {
    const {start, end} = getSpanIncludingEndTag(node);
    // Note both start and end are inclusive because we want to match conditions
    // like ¦start and end¦ where ¦ is the cursor.
    if (start <= this.position && this.position <= end) {
      const length = end - start;
      const last: t.Node|e.AST|undefined = this.path[this.path.length - 1];
      if (last) {
        const {start, end} = isTemplateNode(last) ? getSpanIncludingEndTag(last) : last.sourceSpan;
        const lastLength = end - start;
        if (length > lastLength) {
          // The current node has a span that is larger than the last node found
          // so we do not descend into it. This typically means we have found
          // a candidate in one of the root nodes so we do not need to visit
          // other root nodes.
          return;
        }
      }
      if (node instanceof t.BoundEvent &&
          this.path.find((n => n instanceof t.BoundAttribute && node.name === n.name + 'Change'))) {
        // For two-way binding aka banana-in-a-box, there are two matches:
        // BoundAttribute and BoundEvent. Both have the same spans. We choose to
        // return BoundAttribute because it matches the identifier name verbatim.
        // TODO: For operations like go to definition, ideally we want to return
        // both.
        return;
      }
      this.path.push(node);
      node.visit(this);
    }
  }

  visitElement(element: t.Element) {
    this.visitAll(element.attributes);
    this.visitAll(element.inputs);
    this.visitAll(element.outputs);
    this.visitAll(element.references);
    this.visitAll(element.children);
  }

  visitTemplate(template: t.Template) {
    this.visitAll(template.attributes);
    this.visitAll(template.inputs);
    this.visitAll(template.outputs);
    this.visitAll(template.templateAttrs);
    this.visitAll(template.references);
    this.visitAll(template.variables);
    this.visitAll(template.children);
  }

  visitContent(content: t.Content) {
    t.visitAll(this, content.attributes);
  }

  visitVariable(variable: t.Variable) {
    // Variable has no template nodes or expression nodes.
  }

  visitReference(reference: t.Reference) {
    // Reference has no template nodes or expression nodes.
  }

  visitTextAttribute(attribute: t.TextAttribute) {
    // Text attribute has no template nodes or expression nodes.
  }

  visitBoundAttribute(attribute: t.BoundAttribute) {
    const visitor = new ExpressionVisitor(this.position);
    visitor.visit(attribute.value, this.path);
  }

  visitBoundEvent(attribute: t.BoundEvent) {
    const visitor = new ExpressionVisitor(this.position);
    visitor.visit(attribute.handler, this.path);
  }

  visitText(text: t.Text) {
    // Text has no template nodes or expression nodes.
  }

  visitBoundText(text: t.BoundText) {
    const visitor = new ExpressionVisitor(this.position);
    visitor.visit(text.value, this.path);
  }

  visitIcu(icu: t.Icu) {
    for (const boundText of Object.values(icu.vars)) {
      this.visit(boundText);
    }
    for (const boundTextOrText of Object.values(icu.placeholders)) {
      this.visit(boundTextOrText);
    }
  }

  visitAll(nodes: t.Node[]) {
    for (const node of nodes) {
      this.visit(node);
    }
  }
}

class ExpressionVisitor extends e.RecursiveAstVisitor {
  // Position must be absolute in the source file.
  constructor(private readonly position: number) {
    super();
  }

  visit(node: e.AST, path: Array<t.Node|e.AST>) {
    if (node instanceof e.ASTWithSource) {
      // In order to reduce noise, do not include `ASTWithSource` in the path.
      // For the purpose of source spans, there is no difference between
      // `ASTWithSource` and and underlying node that it wraps.
      node = node.ast;
    }
    const {start, end} = node.sourceSpan;
    // The third condition is to account for the implicit receiver, which should
    // not be visited.
    if (start <= this.position && this.position <= end && !(node instanceof e.ImplicitReceiver)) {
      path.push(node);
      node.visit(this, path);
    }
  }
}

export function isTemplateNode(node: t.Node|e.AST): node is t.Node {
  // Template node implements the Node interface so we cannot use instanceof.
  return node.sourceSpan instanceof ParseSourceSpan;
}

export function isExpressionNode(node: t.Node|e.AST): node is e.AST {
  return node instanceof e.AST;
}

function getSpanIncludingEndTag(ast: t.Node) {
  const result = {
    start: ast.sourceSpan.start.offset,
    end: ast.sourceSpan.end.offset,
  };
  // For Element and Template node, sourceSpan.end is the end of the opening
  // tag. For the purpose of language service, we need to actually recognize
  // the end of the closing tag. Otherwise, for situation like
  // <my-component></my-comp¦onent> where the cursor is in the closing tag
  // we will not be able to return any information.
  if ((ast instanceof t.Element || ast instanceof t.Template) && ast.endSourceSpan) {
    result.end = ast.endSourceSpan.end.offset;
  }
  return result;
}
