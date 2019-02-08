/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SecurityContext} from '../core';
import {AST, BindingType, BoundElementProperty, ParsedEvent, ParsedEventType} from '../expression_parser/ast';
import {AST as I18nAST} from '../i18n/i18n_ast';
import {ParseSourceSpan} from '../parse_util';

export interface Node {
  sourceSpan: ParseSourceSpan;
  visit<Result>(visitor: Visitor<Result>): Result;
}

export class Text implements Node {
  constructor(public value: string, public sourceSpan: ParseSourceSpan) {}
  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitText(this); }
}

export class BoundText implements Node {
  constructor(public value: AST, public sourceSpan: ParseSourceSpan, public i18n?: I18nAST) {}
  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitBoundText(this); }
}

export class TextAttribute implements Node {
  constructor(
      public name: string, public value: string, public sourceSpan: ParseSourceSpan,
      public valueSpan?: ParseSourceSpan, public i18n?: I18nAST) {}
  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitTextAttribute(this); }
}

export class BoundAttribute implements Node {
  constructor(
      public name: string, public type: BindingType, public securityContext: SecurityContext,
      public value: AST, public unit: string|null, public sourceSpan: ParseSourceSpan,
      public i18n?: I18nAST) {}

  static fromBoundElementProperty(prop: BoundElementProperty, i18n?: I18nAST) {
    return new BoundAttribute(
        prop.name, prop.type, prop.securityContext, prop.value, prop.unit, prop.sourceSpan, i18n);
  }

  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitBoundAttribute(this); }
}

export class BoundEvent implements Node {
  constructor(
      public name: string, public type: ParsedEventType, public handler: AST,
      public target: string|null, public phase: string|null, public sourceSpan: ParseSourceSpan,
      public handlerSpan: ParseSourceSpan) {}

  static fromParsedEvent(event: ParsedEvent) {
    const target: string|null = event.type === ParsedEventType.Regular ? event.targetOrPhase : null;
    const phase: string|null =
        event.type === ParsedEventType.Animation ? event.targetOrPhase : null;
    return new BoundEvent(
        event.name, event.type, event.handler, target, phase, event.sourceSpan, event.handlerSpan);
  }

  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitBoundEvent(this); }
}

export class Element implements Node {
  constructor(
      public name: string, public attributes: TextAttribute[], public inputs: BoundAttribute[],
      public outputs: BoundEvent[], public children: Node[], public references: Reference[],
      public sourceSpan: ParseSourceSpan, public startSourceSpan: ParseSourceSpan|null,
      public endSourceSpan: ParseSourceSpan|null, public i18n?: I18nAST) {
    // If the element is empty then the source span should include any closing tag
    if (children.length === 0 && startSourceSpan && endSourceSpan) {
      this.sourceSpan = {...sourceSpan, end: endSourceSpan.end};
    }
  }
  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitElement(this); }
}

export class Template implements Node {
  constructor(
      public tagName: string, public attributes: TextAttribute[], public inputs: BoundAttribute[],
      public outputs: BoundEvent[], public children: Node[], public references: Reference[],
      public variables: Variable[], public sourceSpan: ParseSourceSpan,
      public startSourceSpan: ParseSourceSpan|null, public endSourceSpan: ParseSourceSpan|null,
      public i18n?: I18nAST) {}
  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitTemplate(this); }
}

export class Content implements Node {
  constructor(
      public selector: string, public attributes: TextAttribute[],
      public sourceSpan: ParseSourceSpan, public i18n?: I18nAST) {}
  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitContent(this); }
}

export class Variable implements Node {
  constructor(public name: string, public value: string, public sourceSpan: ParseSourceSpan) {}
  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitVariable(this); }
}

export class Reference implements Node {
  constructor(public name: string, public value: string, public sourceSpan: ParseSourceSpan) {}
  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitReference(this); }
}

export class Icu implements Node {
  constructor(
      public vars: {[name: string]: BoundText},
      public placeholders: {[name: string]: Text | BoundText}, public sourceSpan: ParseSourceSpan,
      public i18n?: I18nAST) {}
  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitIcu(this); }
}

export interface Visitor<Result = any> {
  // Returning a truthy value from `visit()` will prevent `visitAll()` from the call to the typed
  // method and result returned will become the result included in `visitAll()`s result array.
  visit?(node: Node): Result;

  visitElement(element: Element): Result;
  visitTemplate(template: Template): Result;
  visitContent(content: Content): Result;
  visitVariable(variable: Variable): Result;
  visitReference(reference: Reference): Result;
  visitTextAttribute(attribute: TextAttribute): Result;
  visitBoundAttribute(attribute: BoundAttribute): Result;
  visitBoundEvent(attribute: BoundEvent): Result;
  visitText(text: Text): Result;
  visitBoundText(text: BoundText): Result;
  visitIcu(icu: Icu): Result;
}

export class NullVisitor implements Visitor<void> {
  visitElement(element: Element): void {}
  visitTemplate(template: Template): void {}
  visitContent(content: Content): void {}
  visitVariable(variable: Variable): void {}
  visitReference(reference: Reference): void {}
  visitTextAttribute(attribute: TextAttribute): void {}
  visitBoundAttribute(attribute: BoundAttribute): void {}
  visitBoundEvent(attribute: BoundEvent): void {}
  visitText(text: Text): void {}
  visitBoundText(text: BoundText): void {}
  visitIcu(icu: Icu): void {}
}

export class RecursiveVisitor implements Visitor<void> {
  visitElement(element: Element): void {
    visitAll(this, element.attributes);
    visitAll(this, element.children);
    visitAll(this, element.references);
  }
  visitTemplate(template: Template): void {
    visitAll(this, template.attributes);
    visitAll(this, template.children);
    visitAll(this, template.references);
    visitAll(this, template.variables);
  }
  visitContent(content: Content): void {}
  visitVariable(variable: Variable): void {}
  visitReference(reference: Reference): void {}
  visitTextAttribute(attribute: TextAttribute): void {}
  visitBoundAttribute(attribute: BoundAttribute): void {}
  visitBoundEvent(attribute: BoundEvent): void {}
  visitText(text: Text): void {}
  visitBoundText(text: BoundText): void {}
  visitIcu(icu: Icu): void {}
}

export class TransformVisitor implements Visitor<Node> {
  visitElement(element: Element): Node {
    const newAttributes = transformAll(this, element.attributes);
    const newInputs = transformAll(this, element.inputs);
    const newOutputs = transformAll(this, element.outputs);
    const newChildren = transformAll(this, element.children);
    const newReferences = transformAll(this, element.references);
    if (newAttributes != element.attributes || newInputs != element.inputs ||
        newOutputs != element.outputs || newChildren != element.children ||
        newReferences != element.references) {
      return new Element(
          element.name, newAttributes, newInputs, newOutputs, newChildren, newReferences,
          element.sourceSpan, element.startSourceSpan, element.endSourceSpan);
    }
    return element;
  }

  visitTemplate(template: Template): Node {
    const newAttributes = transformAll(this, template.attributes);
    const newInputs = transformAll(this, template.inputs);
    const newOutputs = transformAll(this, template.outputs);
    const newChildren = transformAll(this, template.children);
    const newReferences = transformAll(this, template.references);
    const newVariables = transformAll(this, template.variables);
    if (newAttributes != template.attributes || newInputs != template.inputs ||
        newChildren != template.children || newVariables != template.variables ||
        newReferences != template.references) {
      return new Template(
          template.tagName, newAttributes, newInputs, newOutputs, newChildren, newReferences,
          newVariables, template.sourceSpan, template.startSourceSpan, template.endSourceSpan);
    }
    return template;
  }

  visitContent(content: Content): Node { return content; }

  visitVariable(variable: Variable): Node { return variable; }
  visitReference(reference: Reference): Node { return reference; }
  visitTextAttribute(attribute: TextAttribute): Node { return attribute; }
  visitBoundAttribute(attribute: BoundAttribute): Node { return attribute; }
  visitBoundEvent(attribute: BoundEvent): Node { return attribute; }
  visitText(text: Text): Node { return text; }
  visitBoundText(text: BoundText): Node { return text; }
  visitIcu(icu: Icu): Node { return icu; }
}

export function visitAll<Result>(visitor: Visitor<Result>, nodes: Node[]): Result[] {
  const result: Result[] = [];
  if (visitor.visit) {
    for (const node of nodes) {
      const newNode = visitor.visit(node) || node.visit(visitor);
    }
  } else {
    for (const node of nodes) {
      const newNode = node.visit(visitor);
      if (newNode) {
        result.push(newNode);
      }
    }
  }
  return result;
}

export function transformAll<Result extends Node>(
    visitor: Visitor<Node>, nodes: Result[]): Result[] {
  const result: Result[] = [];
  let changed = false;
  for (const node of nodes) {
    const newNode = node.visit(visitor);
    if (newNode) {
      result.push(newNode as Result);
    }
    changed = changed || newNode != node;
  }
  return changed ? result : nodes;
}