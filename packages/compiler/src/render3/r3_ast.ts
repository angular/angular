/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SecurityContext} from '../core';
import {AST} from '../expression_parser/ast';
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
  constructor(public value: AST, public sourceSpan: ParseSourceSpan) {}
  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitBoundText(this); }
}

export class TextAttribute implements Node {
  constructor(
      public name: string, public value: string, public sourceSpan: ParseSourceSpan,
      public valueSpan?: ParseSourceSpan) {}
  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitAttribute(this); }
}

/**
 * Enumeration of types of property bindings.
 */
export enum PropertyBindingType {

  /**
   * A normal binding to a property (e.g. `[property]="expression"`).
   */
  Property,

  /**
   * A binding to an element attribute (e.g. `[attr.name]="expression"`).
   */
  Attribute,

  /**
   * A binding to a CSS class (e.g. `[class.name]="condition"`).
   */
  Class,

  /**
   * A binding to a style rule (e.g. `[style.rule]="expression"`).
   */
  Style,

  /**
   * A binding to an animation reference (e.g. `[animate.key]="expression"`).
   */
  Animation
}

export class BoundAttribute implements Node {
  constructor(
      public name: string, public type: PropertyBindingType,
      public securityContext: SecurityContext, public value: AST, public unit: string|null,
      public sourceSpan: ParseSourceSpan) {}
  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitBoundAttribute(this); }
}

export class BoundEvent implements Node {
  constructor(
      public name: string, public handler: AST, public target: string|null,
      public phase: string|null, public sourceSpan: ParseSourceSpan) {}
  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitBoundEvent(this); }
}

export class Element implements Node {
  constructor(
      public name: string, public attributes: TextAttribute[], public inputs: BoundAttribute[],
      public outputs: BoundEvent[], public children: Node[], public references: Reference[],
      public sourceSpan: ParseSourceSpan, public startSourceSpan: ParseSourceSpan|null,
      public endSourceSpan: ParseSourceSpan|null) {}
  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitElement(this); }
}

export class Template implements Node {
  constructor(
      public attributes: TextAttribute[], public inputs: BoundAttribute[], public children: Node[],
      public references: Reference[], public variables: Variable[],
      public sourceSpan: ParseSourceSpan, public startSourceSpan: ParseSourceSpan|null,
      public endSourceSpan: ParseSourceSpan|null) {}
  visit<Result>(visitor: Visitor<Result>): Result { return visitor.visitTemplate(this); }
}

export class Content implements Node {
  constructor(
      public selectorIndex: number, public attributes: TextAttribute[],
      public sourceSpan: ParseSourceSpan) {}
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

export interface Visitor<Result = any> {
  // Returning a truthy value from `visit()` will prevent `visitAll()` from the call to the typed
  // method and result returned will become the result included in `visitAll()`s result array.
  visit?(node: Node): Result;

  visitElement(element: Element): Result;
  visitTemplate(template: Template): Result;
  visitContent(content: Content): Result;
  visitVariable(variable: Variable): Result;
  visitReference(reference: Reference): Result;
  visitAttribute(attribute: TextAttribute): Result;
  visitBoundAttribute(attribute: BoundAttribute): Result;
  visitBoundEvent(attribute: BoundEvent): Result;
  visitText(text: Text): Result;
  visitBoundText(text: BoundText): Result;
}

export class NullVisitor implements Visitor<void> {
  visitElement(element: Element): void {}
  visitTemplate(template: Template): void {}
  visitContent(content: Content): void {}
  visitVariable(variable: Variable): void {}
  visitReference(reference: Reference): void {}
  visitAttribute(attribute: TextAttribute): void {}
  visitBoundAttribute(attribute: BoundAttribute): void {}
  visitBoundEvent(attribute: BoundEvent): void {}
  visitText(text: Text): void {}
  visitBoundText(text: BoundText): void {}
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
  visitAttribute(attribute: TextAttribute): void {}
  visitBoundAttribute(attribute: BoundAttribute): void {}
  visitBoundEvent(attribute: BoundEvent): void {}
  visitText(text: Text): void {}
  visitBoundText(text: BoundText): void {}
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
    const newChildren = transformAll(this, template.children);
    const newReferences = transformAll(this, template.references);
    const newVariables = transformAll(this, template.variables);
    if (newAttributes != template.attributes || newInputs != template.inputs ||
        newChildren != template.children || newVariables != template.variables ||
        newReferences != template.references) {
      return new Template(
          newAttributes, newInputs, newChildren, newReferences, newVariables, template.sourceSpan,
          template.startSourceSpan, template.endSourceSpan);
    }
    return template;
  }

  visitContent(content: Content): Node { return content; }

  visitVariable(variable: Variable): Node { return variable; }
  visitReference(reference: Reference): Node { return reference; }
  visitAttribute(attribute: TextAttribute): Node { return attribute; }
  visitBoundAttribute(attribute: BoundAttribute): Node { return attribute; }
  visitBoundEvent(attribute: BoundEvent): Node { return attribute; }
  visitText(text: Text): Node { return text; }
  visitBoundText(text: BoundText): Node { return text; }
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