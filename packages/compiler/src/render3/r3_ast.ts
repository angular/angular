/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SecurityContext} from '../core';
import {
  AST,
  ASTWithSource,
  BindingType,
  BoundElementProperty,
  ParsedEvent,
  ParsedEventType,
} from '../expression_parser/ast';
import {I18nMeta} from '../i18n/i18n_ast';
import {ParseSourceSpan} from '../parse_util';

export interface Node {
  readonly kind: NodeKind;
  sourceSpan: ParseSourceSpan;
  visit<Result>(visitor: Visitor<Result>): Result;
}

export enum NodeKind {
  BoundText = 'BoundText',
  TextAttribute = 'TextAttribute',
  BoundAttribute = 'BoundAttribute',
  BoundEvent = 'BoundEvent',
  Comment = 'Comment',
  Element = 'Element',
  BoundDeferredTrigger = 'BoundDeferredTrigger',
  NeverDeferredTrigger = 'NeverDeferredTrigger',
  IdleDeferredTrigger = 'IdleDeferredTrigger',
  ImmediateDeferredTrigger = 'ImmediateDeferredTrigger',
  HoverDeferredTrigger = 'HoverDeferredTrigger',
  TimerDeferredTrigger = 'TimerDeferredTrigger',
  InteractionDeferredTrigger = 'InteractionDeferredTrigger',
  ViewportDeferredTrigger = 'ViewportDeferredTrigger',
  DeferredBlockPlaceholder = 'DeferredBlockPlaceholder',
  DeferredBlockLoading = 'DeferredBlockLoading',
  DeferredBlockError = 'DeferredBlockError',
  DeferredBlock = 'DeferredBlock',
  SwitchBlock = 'SwitchBlock',
  SwitchBlockCase = 'SwitchBlockCase',
  ForLoopBlock = 'ForLoopBlock',
  ForLoopBlockEmpty = 'ForLoopBlockEmpty',
  IfBlock = 'IfBlock',
  IfBlockBranch = 'IfBlockBranch',
  UnknownBlock = 'UnknownBlock',
  LetDeclaration = 'LetDeclaration',
  Template = 'Template',
  Text = 'Text',
  Content = 'Content',
  Variable = 'Variable',
  Reference = 'Reference',
  Icu = 'Icu',
}

/**
 * This is an R3 `Node`-like wrapper for a raw `html.Comment` node. We do not currently
 * require the implementation of a visitor for Comments as they are only collected at
 * the top-level of the R3 AST, and only if `Render3ParseOptions['collectCommentNodes']`
 * is true.
 */
export class Comment implements Node {
  constructor(
    public value: string,
    public sourceSpan: ParseSourceSpan,
  ) {}

  readonly kind = NodeKind.Comment;

  visit<Result>(_visitor: Visitor<Result>): Result {
    throw new Error('visit() not implemented for Comment');
  }
}

export class Text implements Node {
  constructor(
    public value: string,
    public sourceSpan: ParseSourceSpan,
  ) {}

  readonly kind = NodeKind.Text;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitText(this);
  }
}

export class BoundText implements Node {
  constructor(
    public value: AST,
    public sourceSpan: ParseSourceSpan,
    public i18n?: I18nMeta,
  ) {}

  readonly kind = NodeKind.BoundText;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitBoundText(this);
  }
}

/**
 * Represents a text attribute in the template.
 *
 * `valueSpan` may not be present in cases where there is no value `<div a></div>`.
 * `keySpan` may also not be present for synthetic attributes from ICU expansions.
 */
export class TextAttribute implements Node {
  constructor(
    public name: string,
    public value: string,
    public sourceSpan: ParseSourceSpan,
    readonly keySpan: ParseSourceSpan | undefined,
    public valueSpan?: ParseSourceSpan,
    public i18n?: I18nMeta,
  ) {}

  readonly kind = NodeKind.TextAttribute;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitTextAttribute(this);
  }
}

export class BoundAttribute implements Node {
  constructor(
    public name: string,
    public type: BindingType,
    public securityContext: SecurityContext,
    public value: AST,
    public unit: string | null,
    public sourceSpan: ParseSourceSpan,
    readonly keySpan: ParseSourceSpan,
    public valueSpan: ParseSourceSpan | undefined,
    public i18n: I18nMeta | undefined,
  ) {}

  readonly kind = NodeKind.BoundAttribute;

  static fromBoundElementProperty(prop: BoundElementProperty, i18n?: I18nMeta): BoundAttribute {
    if (prop.keySpan === undefined) {
      throw new Error(
        `Unexpected state: keySpan must be defined for bound attributes but was not for ${prop.name}: ${prop.sourceSpan}`,
      );
    }
    return new BoundAttribute(
      prop.name,
      prop.type,
      prop.securityContext,
      prop.value,
      prop.unit,
      prop.sourceSpan,
      prop.keySpan,
      prop.valueSpan,
      i18n,
    );
  }

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitBoundAttribute(this);
  }
}

export class BoundEvent implements Node {
  constructor(
    public name: string,
    public type: ParsedEventType,
    public handler: AST,
    public target: string | null,
    public phase: string | null,
    public sourceSpan: ParseSourceSpan,
    public handlerSpan: ParseSourceSpan,
    readonly keySpan: ParseSourceSpan,
  ) {}

  readonly kind = NodeKind.BoundEvent;

  static fromParsedEvent(event: ParsedEvent) {
    const target: string | null =
      event.type === ParsedEventType.Regular ? event.targetOrPhase : null;
    const phase: string | null =
      event.type === ParsedEventType.Animation ? event.targetOrPhase : null;
    if (event.keySpan === undefined) {
      throw new Error(
        `Unexpected state: keySpan must be defined for bound event but was not for ${event.name}: ${event.sourceSpan}`,
      );
    }
    return new BoundEvent(
      event.name,
      event.type,
      event.handler,
      target,
      phase,
      event.sourceSpan,
      event.handlerSpan,
      event.keySpan,
    );
  }

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitBoundEvent(this);
  }
}

export class Element implements Node {
  constructor(
    public name: string,
    public attributes: TextAttribute[],
    public inputs: BoundAttribute[],
    public outputs: BoundEvent[],
    public children: Node[],
    public references: Reference[],
    public sourceSpan: ParseSourceSpan,
    public startSourceSpan: ParseSourceSpan,
    public endSourceSpan: ParseSourceSpan | null,
    public i18n?: I18nMeta,
  ) {}

  readonly kind = NodeKind.Element;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitElement(this);
  }
}

export abstract class DeferredTrigger implements Node {
  constructor(
    public nameSpan: ParseSourceSpan | null,
    public sourceSpan: ParseSourceSpan,
    public prefetchSpan: ParseSourceSpan | null,
    public whenOrOnSourceSpan: ParseSourceSpan | null,
    public hydrateSpan: ParseSourceSpan | null,
  ) {}

  abstract readonly kind: NodeKind;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitDeferredTrigger(this);
  }
}

export class BoundDeferredTrigger extends DeferredTrigger {
  constructor(
    public value: AST,
    sourceSpan: ParseSourceSpan,
    prefetchSpan: ParseSourceSpan | null,
    whenSourceSpan: ParseSourceSpan,
    hydrateSpan: ParseSourceSpan | null,
  ) {
    // BoundDeferredTrigger is for 'when' triggers. These aren't really "triggers" and don't have a
    // nameSpan. Trigger names are the built in event triggers like hover, interaction, etc.
    super(/** nameSpan */ null, sourceSpan, prefetchSpan, whenSourceSpan, hydrateSpan);
  }

  override readonly kind = NodeKind.BoundDeferredTrigger;
}

export class NeverDeferredTrigger extends DeferredTrigger {
  override readonly kind = NodeKind.NeverDeferredTrigger;
}

export class IdleDeferredTrigger extends DeferredTrigger {
  override readonly kind = NodeKind.IdleDeferredTrigger;
}

export class ImmediateDeferredTrigger extends DeferredTrigger {
  override readonly kind = NodeKind.ImmediateDeferredTrigger;
}

export class HoverDeferredTrigger extends DeferredTrigger {
  constructor(
    public reference: string | null,
    nameSpan: ParseSourceSpan,
    sourceSpan: ParseSourceSpan,
    prefetchSpan: ParseSourceSpan | null,
    onSourceSpan: ParseSourceSpan | null,
    hydrateSpan: ParseSourceSpan | null,
  ) {
    super(nameSpan, sourceSpan, prefetchSpan, onSourceSpan, hydrateSpan);
  }

  override readonly kind = NodeKind.HoverDeferredTrigger;
}

export class TimerDeferredTrigger extends DeferredTrigger {
  constructor(
    public delay: number,
    nameSpan: ParseSourceSpan,
    sourceSpan: ParseSourceSpan,
    prefetchSpan: ParseSourceSpan | null,
    onSourceSpan: ParseSourceSpan | null,
    hydrateSpan: ParseSourceSpan | null,
  ) {
    super(nameSpan, sourceSpan, prefetchSpan, onSourceSpan, hydrateSpan);
  }

  override readonly kind = NodeKind.TimerDeferredTrigger;
}

export class InteractionDeferredTrigger extends DeferredTrigger {
  constructor(
    public reference: string | null,
    nameSpan: ParseSourceSpan,
    sourceSpan: ParseSourceSpan,
    prefetchSpan: ParseSourceSpan | null,
    onSourceSpan: ParseSourceSpan | null,
    hydrateSpan: ParseSourceSpan | null,
  ) {
    super(nameSpan, sourceSpan, prefetchSpan, onSourceSpan, hydrateSpan);
  }

  override readonly kind = NodeKind.InteractionDeferredTrigger;
}

export class ViewportDeferredTrigger extends DeferredTrigger {
  constructor(
    public reference: string | null,
    nameSpan: ParseSourceSpan,
    sourceSpan: ParseSourceSpan,
    prefetchSpan: ParseSourceSpan | null,
    onSourceSpan: ParseSourceSpan | null,
    hydrateSpan: ParseSourceSpan | null,
  ) {
    super(nameSpan, sourceSpan, prefetchSpan, onSourceSpan, hydrateSpan);
  }

  override readonly kind = NodeKind.ViewportDeferredTrigger;
}

export class BlockNode {
  constructor(
    public nameSpan: ParseSourceSpan,
    public sourceSpan: ParseSourceSpan,
    public startSourceSpan: ParseSourceSpan,
    public endSourceSpan: ParseSourceSpan | null,
  ) {}

  readonly kind: string = 'BlockNode';
}

export class DeferredBlockPlaceholder extends BlockNode implements Node {
  constructor(
    public children: Node[],
    public minimumTime: number | null,
    nameSpan: ParseSourceSpan,
    sourceSpan: ParseSourceSpan,
    startSourceSpan: ParseSourceSpan,
    endSourceSpan: ParseSourceSpan | null,
    public i18n?: I18nMeta,
  ) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
  }

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitDeferredBlockPlaceholder(this);
  }

  override readonly kind = NodeKind.DeferredBlockPlaceholder;
}

export class DeferredBlockLoading extends BlockNode implements Node {
  constructor(
    public children: Node[],
    public afterTime: number | null,
    public minimumTime: number | null,
    nameSpan: ParseSourceSpan,
    sourceSpan: ParseSourceSpan,
    startSourceSpan: ParseSourceSpan,
    endSourceSpan: ParseSourceSpan | null,
    public i18n?: I18nMeta,
  ) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
  }

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitDeferredBlockLoading(this);
  }

  override readonly kind = NodeKind.DeferredBlockLoading;
}

export class DeferredBlockError extends BlockNode implements Node {
  constructor(
    public children: Node[],
    nameSpan: ParseSourceSpan,
    sourceSpan: ParseSourceSpan,
    startSourceSpan: ParseSourceSpan,
    endSourceSpan: ParseSourceSpan | null,
    public i18n?: I18nMeta,
  ) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
  }

  override readonly kind = NodeKind.DeferredBlockError;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitDeferredBlockError(this);
  }
}

export interface DeferredBlockTriggers {
  when?: BoundDeferredTrigger;
  idle?: IdleDeferredTrigger;
  immediate?: ImmediateDeferredTrigger;
  hover?: HoverDeferredTrigger;
  timer?: TimerDeferredTrigger;
  interaction?: InteractionDeferredTrigger;
  viewport?: ViewportDeferredTrigger;
  never?: NeverDeferredTrigger;
}

export class DeferredBlock extends BlockNode implements Node {
  readonly triggers: Readonly<DeferredBlockTriggers>;
  readonly prefetchTriggers: Readonly<DeferredBlockTriggers>;
  readonly hydrateTriggers: Readonly<DeferredBlockTriggers>;
  private readonly definedTriggers: (keyof DeferredBlockTriggers)[];
  private readonly definedPrefetchTriggers: (keyof DeferredBlockTriggers)[];
  private readonly definedHydrateTriggers: (keyof DeferredBlockTriggers)[];

  constructor(
    public children: Node[],
    triggers: DeferredBlockTriggers,
    prefetchTriggers: DeferredBlockTriggers,
    hydrateTriggers: DeferredBlockTriggers,
    public placeholder: DeferredBlockPlaceholder | null,
    public loading: DeferredBlockLoading | null,
    public error: DeferredBlockError | null,
    nameSpan: ParseSourceSpan,
    sourceSpan: ParseSourceSpan,
    public mainBlockSpan: ParseSourceSpan,
    startSourceSpan: ParseSourceSpan,
    endSourceSpan: ParseSourceSpan | null,
    public i18n?: I18nMeta,
  ) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
    this.triggers = triggers;
    this.prefetchTriggers = prefetchTriggers;
    this.hydrateTriggers = hydrateTriggers;
    // We cache the keys since we know that they won't change and we
    // don't want to enumarate them every time we're traversing the AST.
    this.definedTriggers = Object.keys(triggers) as (keyof DeferredBlockTriggers)[];
    this.definedPrefetchTriggers = Object.keys(prefetchTriggers) as (keyof DeferredBlockTriggers)[];
    this.definedHydrateTriggers = Object.keys(hydrateTriggers) as (keyof DeferredBlockTriggers)[];
  }

  override readonly kind = NodeKind.DeferredBlock;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitDeferredBlock(this);
  }

  visitAll(visitor: Visitor<unknown>): void {
    // Visit the hydrate triggers first to match their insertion order.
    this.visitTriggers(this.definedHydrateTriggers, this.hydrateTriggers, visitor);
    this.visitTriggers(this.definedTriggers, this.triggers, visitor);
    this.visitTriggers(this.definedPrefetchTriggers, this.prefetchTriggers, visitor);
    visitAll(visitor, this.children);
    const remainingBlocks = [this.placeholder, this.loading, this.error].filter(
      (x) => x !== null,
    ) as Array<Node>;
    visitAll(visitor, remainingBlocks);
  }

  private visitTriggers(
    keys: (keyof DeferredBlockTriggers)[],
    triggers: DeferredBlockTriggers,
    visitor: Visitor,
  ) {
    visitAll(
      visitor,
      keys.map((k) => triggers[k]!),
    );
  }
}

export class SwitchBlock extends BlockNode implements Node {
  constructor(
    public expression: AST,
    public cases: SwitchBlockCase[],
    /**
     * These blocks are only captured to allow for autocompletion in the language service. They
     * aren't meant to be processed in any other way.
     */
    public unknownBlocks: UnknownBlock[],
    sourceSpan: ParseSourceSpan,
    startSourceSpan: ParseSourceSpan,
    endSourceSpan: ParseSourceSpan | null,
    nameSpan: ParseSourceSpan,
  ) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
  }

  override readonly kind = NodeKind.SwitchBlock;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitSwitchBlock(this);
  }
}

export class SwitchBlockCase extends BlockNode implements Node {
  constructor(
    public expression: AST | null,
    public children: Node[],
    sourceSpan: ParseSourceSpan,
    startSourceSpan: ParseSourceSpan,
    endSourceSpan: ParseSourceSpan | null,
    nameSpan: ParseSourceSpan,
    public i18n?: I18nMeta,
  ) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
  }

  override readonly kind = NodeKind.SwitchBlockCase;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitSwitchBlockCase(this);
  }
}

export class ForLoopBlock extends BlockNode implements Node {
  constructor(
    public item: Variable,
    public expression: ASTWithSource,
    public trackBy: ASTWithSource,
    public trackKeywordSpan: ParseSourceSpan,
    public contextVariables: Variable[],
    public children: Node[],
    public empty: ForLoopBlockEmpty | null,
    sourceSpan: ParseSourceSpan,
    public mainBlockSpan: ParseSourceSpan,
    startSourceSpan: ParseSourceSpan,
    endSourceSpan: ParseSourceSpan | null,
    nameSpan: ParseSourceSpan,
    public i18n?: I18nMeta,
  ) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
  }

  override readonly kind = NodeKind.ForLoopBlock;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitForLoopBlock(this);
  }
}

export class ForLoopBlockEmpty extends BlockNode implements Node {
  constructor(
    public children: Node[],
    sourceSpan: ParseSourceSpan,
    startSourceSpan: ParseSourceSpan,
    endSourceSpan: ParseSourceSpan | null,
    nameSpan: ParseSourceSpan,
    public i18n?: I18nMeta,
  ) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
  }

  override readonly kind = NodeKind.ForLoopBlockEmpty;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitForLoopBlockEmpty(this);
  }
}

export class IfBlock extends BlockNode implements Node {
  constructor(
    public branches: IfBlockBranch[],
    sourceSpan: ParseSourceSpan,
    startSourceSpan: ParseSourceSpan,
    endSourceSpan: ParseSourceSpan | null,
    nameSpan: ParseSourceSpan,
  ) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
  }

  override readonly kind = NodeKind.IfBlock;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitIfBlock(this);
  }
}

export class IfBlockBranch extends BlockNode implements Node {
  constructor(
    public expression: AST | null,
    public children: Node[],
    public expressionAlias: Variable | null,
    sourceSpan: ParseSourceSpan,
    startSourceSpan: ParseSourceSpan,
    endSourceSpan: ParseSourceSpan | null,
    nameSpan: ParseSourceSpan,
    public i18n?: I18nMeta,
  ) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
  }

  override readonly kind = NodeKind.IfBlockBranch;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitIfBlockBranch(this);
  }
}

export class UnknownBlock implements Node {
  constructor(
    public name: string,
    public sourceSpan: ParseSourceSpan,
    public nameSpan: ParseSourceSpan,
  ) {}

  readonly kind = NodeKind.UnknownBlock;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitUnknownBlock(this);
  }
}

export class LetDeclaration implements Node {
  constructor(
    public name: string,
    public value: AST,
    public sourceSpan: ParseSourceSpan,
    public nameSpan: ParseSourceSpan,
    public valueSpan: ParseSourceSpan,
  ) {}

  readonly kind = NodeKind.LetDeclaration;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitLetDeclaration(this);
  }
}

export class Template implements Node {
  constructor(
    // tagName is the name of the container element, if applicable.
    // `null` is a special case for when there is a structural directive on an `ng-template` so
    // the renderer can differentiate between the synthetic template and the one written in the
    // file.
    public tagName: string | null,
    public attributes: TextAttribute[],
    public inputs: BoundAttribute[],
    public outputs: BoundEvent[],
    public templateAttrs: (BoundAttribute | TextAttribute)[],
    public children: Node[],
    public references: Reference[],
    public variables: Variable[],
    public sourceSpan: ParseSourceSpan,
    public startSourceSpan: ParseSourceSpan,
    public endSourceSpan: ParseSourceSpan | null,
    public i18n?: I18nMeta,
  ) {}

  readonly kind = NodeKind.Template;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitTemplate(this);
  }
}

export class Content implements Node {
  readonly name = 'ng-content';

  constructor(
    public selector: string,
    public attributes: TextAttribute[],
    public children: Node[],
    public sourceSpan: ParseSourceSpan,
    public i18n?: I18nMeta,
  ) {}

  readonly kind = NodeKind.Content;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitContent(this);
  }
}

export class Variable implements Node {
  constructor(
    public name: string,
    public value: string,
    public sourceSpan: ParseSourceSpan,
    readonly keySpan: ParseSourceSpan,
    public valueSpan?: ParseSourceSpan,
  ) {}

  readonly kind = NodeKind.Variable;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitVariable(this);
  }
}

export class Reference implements Node {
  constructor(
    public name: string,
    public value: string,
    public sourceSpan: ParseSourceSpan,
    readonly keySpan: ParseSourceSpan,
    public valueSpan?: ParseSourceSpan,
  ) {}

  readonly kind = NodeKind.Reference;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitReference(this);
  }
}

export class Icu implements Node {
  constructor(
    public vars: {[name: string]: BoundText},
    public placeholders: {[name: string]: Text | BoundText},
    public sourceSpan: ParseSourceSpan,
    public i18n?: I18nMeta,
  ) {}

  readonly kind = NodeKind.Icu;

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitIcu(this);
  }
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
  visitDeferredBlock(deferred: DeferredBlock): Result;
  visitDeferredBlockPlaceholder(block: DeferredBlockPlaceholder): Result;
  visitDeferredBlockError(block: DeferredBlockError): Result;
  visitDeferredBlockLoading(block: DeferredBlockLoading): Result;
  visitDeferredTrigger(trigger: DeferredTrigger): Result;
  visitSwitchBlock(block: SwitchBlock): Result;
  visitSwitchBlockCase(block: SwitchBlockCase): Result;
  visitForLoopBlock(block: ForLoopBlock): Result;
  visitForLoopBlockEmpty(block: ForLoopBlockEmpty): Result;
  visitIfBlock(block: IfBlock): Result;
  visitIfBlockBranch(block: IfBlockBranch): Result;
  visitUnknownBlock(block: UnknownBlock): Result;
  visitLetDeclaration(decl: LetDeclaration): Result;
}

export class RecursiveVisitor implements Visitor<void> {
  visitElement(element: Element): void {
    visitAll(this, element.attributes);
    visitAll(this, element.inputs);
    visitAll(this, element.outputs);
    visitAll(this, element.children);
    visitAll(this, element.references);
  }
  visitTemplate(template: Template): void {
    visitAll(this, template.attributes);
    visitAll(this, template.inputs);
    visitAll(this, template.outputs);
    visitAll(this, template.children);
    visitAll(this, template.references);
    visitAll(this, template.variables);
  }
  visitDeferredBlock(deferred: DeferredBlock): void {
    deferred.visitAll(this);
  }
  visitDeferredBlockPlaceholder(block: DeferredBlockPlaceholder): void {
    visitAll(this, block.children);
  }
  visitDeferredBlockError(block: DeferredBlockError): void {
    visitAll(this, block.children);
  }
  visitDeferredBlockLoading(block: DeferredBlockLoading): void {
    visitAll(this, block.children);
  }
  visitSwitchBlock(block: SwitchBlock): void {
    visitAll(this, block.cases);
  }
  visitSwitchBlockCase(block: SwitchBlockCase): void {
    visitAll(this, block.children);
  }
  visitForLoopBlock(block: ForLoopBlock): void {
    const blockItems = [block.item, ...block.contextVariables, ...block.children];
    block.empty && blockItems.push(block.empty);
    visitAll(this, blockItems);
  }
  visitForLoopBlockEmpty(block: ForLoopBlockEmpty): void {
    visitAll(this, block.children);
  }
  visitIfBlock(block: IfBlock): void {
    visitAll(this, block.branches);
  }
  visitIfBlockBranch(block: IfBlockBranch): void {
    const blockItems = block.children;
    block.expressionAlias && blockItems.push(block.expressionAlias);
    visitAll(this, blockItems);
  }
  visitContent(content: Content): void {
    visitAll(this, content.children);
  }
  visitVariable(variable: Variable): void {}
  visitReference(reference: Reference): void {}
  visitTextAttribute(attribute: TextAttribute): void {}
  visitBoundAttribute(attribute: BoundAttribute): void {}
  visitBoundEvent(attribute: BoundEvent): void {}
  visitText(text: Text): void {}
  visitBoundText(text: BoundText): void {}
  visitIcu(icu: Icu): void {}
  visitDeferredTrigger(trigger: DeferredTrigger): void {}
  visitUnknownBlock(block: UnknownBlock): void {}
  visitLetDeclaration(decl: LetDeclaration): void {}
}

export function visitAll<Result>(visitor: Visitor<Result>, nodes: Node[]): Result[] {
  const result: Result[] = [];
  if (visitor.visit) {
    for (const node of nodes) {
      visitor.visit(node) || node.visit(visitor);
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
