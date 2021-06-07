/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AstPath} from '../ast_path';
import {CompileDirectiveSummary, CompileProviderMetadata, CompileTokenMetadata} from '../compile_metadata';
import {SecurityContext} from '../core';
import {ASTWithSource, BindingType, BoundElementProperty, ParsedEvent, ParsedEventType, ParsedVariable} from '../expression_parser/ast';
import {LifecycleHooks} from '../lifecycle_reflector';
import {ParseSourceSpan} from '../parse_util';



/**
 * An Abstract Syntax Tree node representing part of a parsed Angular template.
 */
export interface TemplateAst {
  /**
   * The source span from which this node was parsed.
   */
  sourceSpan: ParseSourceSpan;

  /**
   * Visit this node and possibly transform it.
   */
  visit(visitor: TemplateAstVisitor, context: any): any;
}

/**
 * A segment of text within the template.
 */
export class TextAst implements TemplateAst {
  constructor(
      public value: string, public ngContentIndex: number, public sourceSpan: ParseSourceSpan) {}
  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitText(this, context);
  }
}

/**
 * A bound expression within the text of a template.
 */
export class BoundTextAst implements TemplateAst {
  constructor(
      public value: ASTWithSource, public ngContentIndex: number,
      public sourceSpan: ParseSourceSpan) {}
  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitBoundText(this, context);
  }
}

/**
 * A plain attribute on an element.
 */
export class AttrAst implements TemplateAst {
  constructor(public name: string, public value: string, public sourceSpan: ParseSourceSpan) {}
  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitAttr(this, context);
  }
}

export const enum PropertyBindingType {
  // A normal binding to a property (e.g. `[property]="expression"`).
  Property,
  // A binding to an element attribute (e.g. `[attr.name]="expression"`).
  Attribute,
  // A binding to a CSS class (e.g. `[class.name]="condition"`).
  Class,
  // A binding to a style rule (e.g. `[style.rule]="expression"`).
  Style,
  // A binding to an animation reference (e.g. `[animate.key]="expression"`).
  Animation,
}

const BoundPropertyMapping = {
  [BindingType.Animation]: PropertyBindingType.Animation,
  [BindingType.Attribute]: PropertyBindingType.Attribute,
  [BindingType.Class]: PropertyBindingType.Class,
  [BindingType.Property]: PropertyBindingType.Property,
  [BindingType.Style]: PropertyBindingType.Style,
};

/**
 * A binding for an element property (e.g. `[property]="expression"`) or an animation trigger (e.g.
 * `[@trigger]="stateExp"`)
 */
export class BoundElementPropertyAst implements TemplateAst {
  readonly isAnimation: boolean;

  constructor(
      public name: string, public type: PropertyBindingType,
      public securityContext: SecurityContext, public value: ASTWithSource,
      public unit: string|null, public sourceSpan: ParseSourceSpan) {
    this.isAnimation = this.type === PropertyBindingType.Animation;
  }

  static fromBoundProperty(prop: BoundElementProperty) {
    const type = BoundPropertyMapping[prop.type];
    return new BoundElementPropertyAst(
        prop.name, type, prop.securityContext, prop.value, prop.unit, prop.sourceSpan);
  }

  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitElementProperty(this, context);
  }
}

/**
 * A binding for an element event (e.g. `(event)="handler()"`) or an animation trigger event (e.g.
 * `(@trigger.phase)="callback($event)"`).
 */
export class BoundEventAst implements TemplateAst {
  readonly fullName: string;
  readonly isAnimation: boolean;

  constructor(
      public name: string, public target: string|null, public phase: string|null,
      public handler: ASTWithSource, public sourceSpan: ParseSourceSpan,
      public handlerSpan: ParseSourceSpan) {
    this.fullName = BoundEventAst.calcFullName(this.name, this.target, this.phase);
    this.isAnimation = !!this.phase;
  }

  static calcFullName(name: string, target: string|null, phase: string|null): string {
    if (target) {
      return `${target}:${name}`;
    }
    if (phase) {
      return `@${name}.${phase}`;
    }

    return name;
  }

  static fromParsedEvent(event: ParsedEvent) {
    const target: string|null = event.type === ParsedEventType.Regular ? event.targetOrPhase : null;
    const phase: string|null =
        event.type === ParsedEventType.Animation ? event.targetOrPhase : null;
    return new BoundEventAst(
        event.name, target, phase, event.handler, event.sourceSpan, event.handlerSpan);
  }

  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitEvent(this, context);
  }
}

/**
 * A reference declaration on an element (e.g. `let someName="expression"`).
 */
export class ReferenceAst implements TemplateAst {
  constructor(
      public name: string, public value: CompileTokenMetadata, public originalValue: string,
      public sourceSpan: ParseSourceSpan) {}
  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitReference(this, context);
  }
}

/**
 * A variable declaration on a <ng-template> (e.g. `var-someName="someLocalName"`).
 */
export class VariableAst implements TemplateAst {
  constructor(
      public readonly name: string, public readonly value: string,
      public readonly sourceSpan: ParseSourceSpan, public readonly valueSpan?: ParseSourceSpan) {}

  static fromParsedVariable(v: ParsedVariable) {
    return new VariableAst(v.name, v.value, v.sourceSpan, v.valueSpan);
  }

  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitVariable(this, context);
  }
}

/**
 * An element declaration in a template.
 */
export class ElementAst implements TemplateAst {
  constructor(
      public name: string, public attrs: AttrAst[], public inputs: BoundElementPropertyAst[],
      public outputs: BoundEventAst[], public references: ReferenceAst[],
      public directives: DirectiveAst[], public providers: ProviderAst[],
      public hasViewContainer: boolean, public queryMatches: QueryMatch[],
      public children: TemplateAst[], public ngContentIndex: number|null,
      public sourceSpan: ParseSourceSpan, public endSourceSpan: ParseSourceSpan|null) {}

  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitElement(this, context);
  }
}

/**
 * A `<ng-template>` element included in an Angular template.
 */
export class EmbeddedTemplateAst implements TemplateAst {
  constructor(
      public attrs: AttrAst[], public outputs: BoundEventAst[], public references: ReferenceAst[],
      public variables: VariableAst[], public directives: DirectiveAst[],
      public providers: ProviderAst[], public hasViewContainer: boolean,
      public queryMatches: QueryMatch[], public children: TemplateAst[],
      public ngContentIndex: number, public sourceSpan: ParseSourceSpan) {}

  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitEmbeddedTemplate(this, context);
  }
}

/**
 * A directive property with a bound value (e.g. `*ngIf="condition").
 */
export class BoundDirectivePropertyAst implements TemplateAst {
  constructor(
      public directiveName: string, public templateName: string, public value: ASTWithSource,
      public sourceSpan: ParseSourceSpan) {}
  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitDirectiveProperty(this, context);
  }
}

/**
 * A directive declared on an element.
 */
export class DirectiveAst implements TemplateAst {
  constructor(
      public directive: CompileDirectiveSummary, public inputs: BoundDirectivePropertyAst[],
      public hostProperties: BoundElementPropertyAst[], public hostEvents: BoundEventAst[],
      public contentQueryStartId: number, public sourceSpan: ParseSourceSpan) {}
  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitDirective(this, context);
  }
}

/**
 * A provider declared on an element
 */
export class ProviderAst implements TemplateAst {
  constructor(
      public token: CompileTokenMetadata, public multiProvider: boolean, public eager: boolean,
      public providers: CompileProviderMetadata[], public providerType: ProviderAstType,
      public lifecycleHooks: LifecycleHooks[], public sourceSpan: ParseSourceSpan,
      readonly isModule: boolean) {}

  visit(visitor: TemplateAstVisitor, context: any): any {
    // No visit method in the visitor for now...
    return null;
  }
}

export enum ProviderAstType {
  PublicService,
  PrivateService,
  Component,
  Directive,
  Builtin
}

/**
 * Position where content is to be projected (instance of `<ng-content>` in a template).
 */
export class NgContentAst implements TemplateAst {
  constructor(
      public index: number, public ngContentIndex: number, public sourceSpan: ParseSourceSpan) {}
  visit(visitor: TemplateAstVisitor, context: any): any {
    return visitor.visitNgContent(this, context);
  }
}

export interface QueryMatch {
  queryId: number;
  value: CompileTokenMetadata;
}

/**
 * A visitor for {@link TemplateAst} trees that will process each node.
 */
export interface TemplateAstVisitor {
  // Returning a truthy value from `visit()` will prevent `templateVisitAll()` from the call to
  // the typed method and result returned will become the result included in `visitAll()`s
  // result array.
  visit?(ast: TemplateAst, context: any): any;

  visitNgContent(ast: NgContentAst, context: any): any;
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any;
  visitElement(ast: ElementAst, context: any): any;
  visitReference(ast: ReferenceAst, context: any): any;
  visitVariable(ast: VariableAst, context: any): any;
  visitEvent(ast: BoundEventAst, context: any): any;
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any;
  visitAttr(ast: AttrAst, context: any): any;
  visitBoundText(ast: BoundTextAst, context: any): any;
  visitText(ast: TextAst, context: any): any;
  visitDirective(ast: DirectiveAst, context: any): any;
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any;
}

/**
 * A visitor that accepts each node but doesn't do anything. It is intended to be used
 * as the base class for a visitor that is only interested in a subset of the node types.
 */
export class NullTemplateVisitor implements TemplateAstVisitor {
  visitNgContent(ast: NgContentAst, context: any): void {}
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): void {}
  visitElement(ast: ElementAst, context: any): void {}
  visitReference(ast: ReferenceAst, context: any): void {}
  visitVariable(ast: VariableAst, context: any): void {}
  visitEvent(ast: BoundEventAst, context: any): void {}
  visitElementProperty(ast: BoundElementPropertyAst, context: any): void {}
  visitAttr(ast: AttrAst, context: any): void {}
  visitBoundText(ast: BoundTextAst, context: any): void {}
  visitText(ast: TextAst, context: any): void {}
  visitDirective(ast: DirectiveAst, context: any): void {}
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): void {}
}

/**
 * Base class that can be used to build a visitor that visits each node
 * in an template ast recursively.
 */
export class RecursiveTemplateAstVisitor extends NullTemplateVisitor implements TemplateAstVisitor {
  constructor() {
    super();
  }

  // Nodes with children
  override visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    return this.visitChildren(context, visit => {
      visit(ast.attrs);
      visit(ast.references);
      visit(ast.variables);
      visit(ast.directives);
      visit(ast.providers);
      visit(ast.children);
    });
  }

  override visitElement(ast: ElementAst, context: any): any {
    return this.visitChildren(context, visit => {
      visit(ast.attrs);
      visit(ast.inputs);
      visit(ast.outputs);
      visit(ast.references);
      visit(ast.directives);
      visit(ast.providers);
      visit(ast.children);
    });
  }

  override visitDirective(ast: DirectiveAst, context: any): any {
    return this.visitChildren(context, visit => {
      visit(ast.inputs);
      visit(ast.hostProperties);
      visit(ast.hostEvents);
    });
  }

  protected visitChildren(
      context: any,
      cb: (visit: (<V extends TemplateAst>(children: V[]|undefined) => void)) => void) {
    let results: any[][] = [];
    let t = this;
    function visit<T extends TemplateAst>(children: T[]|undefined) {
      if (children && children.length) results.push(templateVisitAll(t, children, context));
    }
    cb(visit);
    return Array.prototype.concat.apply([], results);
  }
}

/**
 * Visit every node in a list of {@link TemplateAst}s with the given {@link TemplateAstVisitor}.
 */
export function templateVisitAll(
    visitor: TemplateAstVisitor, asts: TemplateAst[], context: any = null): any[] {
  const result: any[] = [];
  const visit = visitor.visit ?
      (ast: TemplateAst) => visitor.visit!(ast, context) || ast.visit(visitor, context) :
      (ast: TemplateAst) => ast.visit(visitor, context);
  asts.forEach(ast => {
    const astResult = visit(ast);
    if (astResult) {
      result.push(astResult);
    }
  });
  return result;
}

export type TemplateAstPath = AstPath<TemplateAst>;
