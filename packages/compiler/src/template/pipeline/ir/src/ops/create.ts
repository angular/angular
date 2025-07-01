/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SecurityContext} from '../../../../../core';
import * as i18n from '../../../../../i18n/i18n_ast';
import * as o from '../../../../../output/output_ast';
import {ParseSourceSpan} from '../../../../../parse_util';
import {
  BindingKind,
  DeferOpModifierKind,
  DeferTriggerKind,
  I18nContextKind,
  I18nParamValueFlags,
  Namespace,
  OpKind,
  TDeferDetailsFlags,
  TemplateKind,
} from '../enums';
import {SlotHandle} from '../handle';
import {Op, OpList, XrefId} from '../operations';
import {
  ConsumesSlotOpTrait,
  ConsumesVarsTrait,
  TRAIT_CONSUMES_SLOT,
  TRAIT_CONSUMES_VARS,
} from '../traits';

import {ListEndOp, NEW_OP, StatementOp, VariableOp} from './shared';

import type {UpdateOp} from './update';

/**
 * An operation usable on the creation side of the IR.
 */
export type CreateOp =
  | ListEndOp<CreateOp>
  | StatementOp<CreateOp>
  | ElementOp
  | ElementStartOp
  | ElementEndOp
  | ContainerOp
  | ContainerStartOp
  | ContainerEndOp
  | TemplateOp
  | EnableBindingsOp
  | DisableBindingsOp
  | TextOp
  | ListenerOp
  | TwoWayListenerOp
  | PipeOp
  | VariableOp<CreateOp>
  | NamespaceOp
  | ProjectionDefOp
  | ProjectionOp
  | ExtractedAttributeOp
  | DeferOp
  | DeferOnOp
  | ConditionalCreateOp
  | ConditionalBranchCreateOp
  | RepeaterCreateOp
  | I18nMessageOp
  | I18nOp
  | I18nStartOp
  | I18nEndOp
  | IcuStartOp
  | IcuEndOp
  | IcuPlaceholderOp
  | I18nContextOp
  | I18nAttributesOp
  | DeclareLetOp
  | SourceLocationOp;

/**
 * An operation representing the creation of an element or container.
 */
export type ElementOrContainerOps =
  | ElementOp
  | ElementStartOp
  | ContainerOp
  | ContainerStartOp
  | TemplateOp
  | RepeaterCreateOp
  | ConditionalCreateOp
  | ConditionalBranchCreateOp;

/**
 * The set of OpKinds that represent the creation of an element or container
 */
const elementContainerOpKinds = new Set([
  OpKind.Element,
  OpKind.ElementStart,
  OpKind.Container,
  OpKind.ContainerStart,
  OpKind.Template,
  OpKind.RepeaterCreate,
  OpKind.ConditionalCreate,
  OpKind.ConditionalBranchCreate,
]);

/**
 * Checks whether the given operation represents the creation of an element or container.
 */
export function isElementOrContainerOp(op: CreateOp): op is ElementOrContainerOps {
  return elementContainerOpKinds.has(op.kind);
}

/**
 * Representation of a local reference on an element.
 */
export interface LocalRef {
  /**
   * User-defined name of the local ref variable.
   */
  name: string;

  /**
   * Target of the local reference variable (often `''`).
   */
  target: string;
}

/**
 * Base interface for `Element`, `ElementStart`, and `Template` operations, containing common fields
 * used to represent their element-like nature.
 */
export interface ElementOrContainerOpBase extends Op<CreateOp>, ConsumesSlotOpTrait {
  kind: ElementOrContainerOps['kind'];

  /**
   * `XrefId` allocated for this element.
   *
   * This ID is used to reference this element from other IR structures.
   */
  xref: XrefId;

  /**
   * Attributes of various kinds on this element. Represented as a `ConstIndex` pointer into the
   * shared `consts` array of the component compilation.
   */
  attributes: ConstIndex | null;

  /**
   * Local references to this element.
   *
   * Before local ref processing, this is an array of `LocalRef` declarations.
   *
   * After processing, it's a `ConstIndex` pointer into the shared `consts` array of the component
   * compilation.
   */
  localRefs: LocalRef[] | ConstIndex | null;

  /**
   * Whether this container is marked `ngNonBindable`, which disabled Angular binding for itself and
   * all descendants.
   */
  nonBindable: boolean;

  /**
   * The span of the element's start tag.
   */
  startSourceSpan: ParseSourceSpan;

  /**
   * The whole source span of the element, including children.
   */
  wholeSourceSpan: ParseSourceSpan;
}

export interface ElementOpBase extends ElementOrContainerOpBase {
  kind:
    | OpKind.Element
    | OpKind.ElementStart
    | OpKind.Template
    | OpKind.RepeaterCreate
    | OpKind.ConditionalCreate
    | OpKind.ConditionalBranchCreate;

  /**
   * The HTML tag name for this element.
   */
  tag: string | null;

  /**
   * The namespace of this element, which controls the preceding namespace instruction.
   */
  namespace: Namespace;
}

/**
 * Logical operation representing the start of an element in the creation IR.
 */
export interface ElementStartOp extends ElementOpBase {
  kind: OpKind.ElementStart;

  /**
   * The i18n placeholder data associated with this element.
   */
  i18nPlaceholder?: i18n.TagPlaceholder;
}

/**
 * Create an `ElementStartOp`.
 */
export function createElementStartOp(
  tag: string,
  xref: XrefId,
  namespace: Namespace,
  i18nPlaceholder: i18n.TagPlaceholder | undefined,
  startSourceSpan: ParseSourceSpan,
  wholeSourceSpan: ParseSourceSpan,
): ElementStartOp {
  return {
    kind: OpKind.ElementStart,
    xref,
    tag,
    handle: new SlotHandle(),
    attributes: null,
    localRefs: [],
    nonBindable: false,
    namespace,
    i18nPlaceholder,
    startSourceSpan,
    wholeSourceSpan,
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
  };
}

/**
 * Logical operation representing an element with no children in the creation IR.
 */
export interface ElementOp extends ElementOpBase {
  kind: OpKind.Element;

  /**
   * The i18n placeholder data associated with this element.
   */
  i18nPlaceholder?: i18n.TagPlaceholder;
}

/**
 * Logical operation representing an embedded view declaration in the creation IR.
 */
export interface TemplateOp extends ElementOpBase {
  kind: OpKind.Template;

  templateKind: TemplateKind;

  /**
   * The number of declaration slots used by this template, or `null` if slots have not yet been
   * assigned.
   */
  decls: number | null;

  /**
   * The number of binding variable slots used by this template, or `null` if binding variables have
   * not yet been counted.
   */
  vars: number | null;

  /**
   * Suffix to add to the name of the generated template function.
   */
  functionNameSuffix: string;

  /**
   * The i18n placeholder data associated with this template.
   */
  i18nPlaceholder?: i18n.TagPlaceholder | i18n.BlockPlaceholder;
}

/**
 * Create a `TemplateOp`.
 */
export function createTemplateOp(
  xref: XrefId,
  templateKind: TemplateKind,
  tag: string | null,
  functionNameSuffix: string,
  namespace: Namespace,
  i18nPlaceholder: i18n.TagPlaceholder | i18n.BlockPlaceholder | undefined,
  startSourceSpan: ParseSourceSpan,
  wholeSourceSpan: ParseSourceSpan,
): TemplateOp {
  return {
    kind: OpKind.Template,
    xref,
    templateKind,
    attributes: null,
    tag,
    handle: new SlotHandle(),
    functionNameSuffix,
    decls: null,
    vars: null,
    localRefs: [],
    nonBindable: false,
    namespace,
    i18nPlaceholder,
    startSourceSpan,
    wholeSourceSpan,
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
  };
}

/**
 * An op that creates a conditional (e.g. a if or switch).
 */
export interface ConditionalCreateOp extends ElementOpBase {
  kind: OpKind.ConditionalCreate;

  templateKind: TemplateKind;

  /**
   * The number of declaration slots used by this template, or `null` if slots have not yet been
   * assigned.
   */
  decls: number | null;

  /**
   * The number of binding variable slots used by this template, or `null` if binding variables have
   * not yet been counted.
   */
  vars: number | null;

  /**
   * Suffix to add to the name of the generated template function.
   */
  functionNameSuffix: string;

  /**
   * The i18n placeholder data associated with this template.
   */
  i18nPlaceholder?: i18n.TagPlaceholder | i18n.BlockPlaceholder;
}

export function createConditionalCreateOp(
  xref: XrefId,
  templateKind: TemplateKind,
  tag: string | null,
  functionNameSuffix: string,
  namespace: Namespace,
  i18nPlaceholder: i18n.TagPlaceholder | i18n.BlockPlaceholder | undefined,
  startSourceSpan: ParseSourceSpan,
  wholeSourceSpan: ParseSourceSpan,
): ConditionalCreateOp {
  return {
    kind: OpKind.ConditionalCreate,
    xref,
    templateKind,
    attributes: null,
    tag,
    handle: new SlotHandle(),
    functionNameSuffix,
    decls: null,
    vars: null,
    localRefs: [],
    nonBindable: false,
    namespace,
    i18nPlaceholder,
    startSourceSpan,
    wholeSourceSpan,
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
  };
}

/**
 * An op that creates a conditional branch (e.g. an else or case).
 */
export interface ConditionalBranchCreateOp extends ElementOpBase {
  kind: OpKind.ConditionalBranchCreate;

  templateKind: TemplateKind;

  /**
   * The number of declaration slots used by this template, or `null` if slots have not yet been
   * assigned.
   */
  decls: number | null;

  /**
   * The number of binding variable slots used by this template, or `null` if binding variables have
   * not yet been counted.
   */
  vars: number | null;

  /**
   * Suffix to add to the name of the generated template function.
   */
  functionNameSuffix: string;

  /**
   * The i18n placeholder data associated with this template.
   */
  i18nPlaceholder?: i18n.TagPlaceholder | i18n.BlockPlaceholder;
}

export function createConditionalBranchCreateOp(
  xref: XrefId,
  templateKind: TemplateKind,
  tag: string | null,
  functionNameSuffix: string,
  namespace: Namespace,
  i18nPlaceholder: i18n.TagPlaceholder | i18n.BlockPlaceholder | undefined,
  startSourceSpan: ParseSourceSpan,
  wholeSourceSpan: ParseSourceSpan,
): ConditionalBranchCreateOp {
  return {
    kind: OpKind.ConditionalBranchCreate,
    xref,
    templateKind,
    attributes: null,
    tag,
    handle: new SlotHandle(),
    functionNameSuffix,
    decls: null,
    vars: null,
    localRefs: [],
    nonBindable: false,
    namespace,
    i18nPlaceholder,
    startSourceSpan,
    wholeSourceSpan,
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
  };
}

/**
 * An op that creates a repeater (e.g. a for loop).
 */
export interface RepeaterCreateOp extends ElementOpBase, ConsumesVarsTrait {
  kind: OpKind.RepeaterCreate;

  /**
   * The number of declaration slots used by this repeater's template, or `null` if slots have not
   * yet been assigned.
   */
  decls: number | null;

  /**
   * The number of binding variable slots used by this repeater's, or `null` if binding variables
   * have not yet been counted.
   */
  vars: number | null;

  /**
   * The Xref of the empty view function. (For the primary view function, use the `xref` property).
   */
  emptyView: XrefId | null;

  /**
   * The track expression to use while iterating.
   */
  track: o.Expression;

  /**
   * Some kinds of expressions (e.g. safe reads or nullish coalescing) require additional ops
   * in order to work. This OpList keeps track of those ops, if they're necessary.
   */
  trackByOps: OpList<UpdateOp> | null;

  /**
   * `null` initially, then an `o.Expression`. Might be a track expression, or might be a reference
   * into the constant pool.
   */
  trackByFn: o.Expression | null;

  /**
   * Context variables avaialable in this block.
   */
  varNames: RepeaterVarNames;

  /**
   * Whether the repeater track function relies on the component instance.
   */
  usesComponentInstance: boolean;

  /**
   * Suffix to add to the name of the generated template function.
   */
  functionNameSuffix: string;

  /**
   * Tag name for the empty block.
   */
  emptyTag: string | null;

  /**
   * Attributes of various kinds on the empty block. Represented as a `ConstIndex` pointer into the
   * shared `consts` array of the component compilation.
   */
  emptyAttributes: ConstIndex | null;

  /**
   * The i18n placeholder for the repeated item template.
   */
  i18nPlaceholder: i18n.BlockPlaceholder | undefined;

  /**
   * The i18n placeholder for the empty template.
   */
  emptyI18nPlaceholder: i18n.BlockPlaceholder | undefined;
}

// TODO: add source spans?
export interface RepeaterVarNames {
  $index: Set<string>;
  $implicit: string;
}

export function createRepeaterCreateOp(
  primaryView: XrefId,
  emptyView: XrefId | null,
  tag: string | null,
  track: o.Expression,
  varNames: RepeaterVarNames,
  emptyTag: string | null,
  i18nPlaceholder: i18n.BlockPlaceholder | undefined,
  emptyI18nPlaceholder: i18n.BlockPlaceholder | undefined,
  startSourceSpan: ParseSourceSpan,
  wholeSourceSpan: ParseSourceSpan,
): RepeaterCreateOp {
  return {
    kind: OpKind.RepeaterCreate,
    attributes: null,
    xref: primaryView,
    handle: new SlotHandle(),
    emptyView,
    track,
    trackByFn: null,
    trackByOps: null,
    tag,
    emptyTag,
    emptyAttributes: null,
    functionNameSuffix: 'For',
    namespace: Namespace.HTML,
    nonBindable: false,
    localRefs: [],
    decls: null,
    vars: null,
    varNames,
    usesComponentInstance: false,
    i18nPlaceholder,
    emptyI18nPlaceholder,
    startSourceSpan,
    wholeSourceSpan,
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
    ...TRAIT_CONSUMES_VARS,
    numSlotsUsed: emptyView === null ? 2 : 3,
  };
}

/**
 * Logical operation representing the end of an element structure in the creation IR.
 *
 * Pairs with an `ElementStart` operation.
 */
export interface ElementEndOp extends Op<CreateOp> {
  kind: OpKind.ElementEnd;

  /**
   * The `XrefId` of the element declared via `ElementStart`.
   */
  xref: XrefId;

  sourceSpan: ParseSourceSpan | null;
}

/**
 * Create an `ElementEndOp`.
 */
export function createElementEndOp(xref: XrefId, sourceSpan: ParseSourceSpan | null): ElementEndOp {
  return {
    kind: OpKind.ElementEnd,
    xref,
    sourceSpan,
    ...NEW_OP,
  };
}

/**
 * Logical operation representing the start of a container in the creation IR.
 */
export interface ContainerStartOp extends ElementOrContainerOpBase {
  kind: OpKind.ContainerStart;
}

/**
 * Logical operation representing an empty container in the creation IR.
 */
export interface ContainerOp extends ElementOrContainerOpBase {
  kind: OpKind.Container;
}

/**
 * Logical operation representing the end of a container structure in the creation IR.
 *
 * Pairs with an `ContainerStart` operation.
 */
export interface ContainerEndOp extends Op<CreateOp> {
  kind: OpKind.ContainerEnd;

  /**
   * The `XrefId` of the element declared via `ContainerStart`.
   */
  xref: XrefId;

  sourceSpan: ParseSourceSpan;
}

/**
 * Logical operation causing binding to be disabled in descendents of a non-bindable container.
 */
export interface DisableBindingsOp extends Op<CreateOp> {
  kind: OpKind.DisableBindings;

  /**
   * `XrefId` of the element that was marked non-bindable.
   */
  xref: XrefId;
}

export function createDisableBindingsOp(xref: XrefId): DisableBindingsOp {
  return {
    kind: OpKind.DisableBindings,
    xref,
    ...NEW_OP,
  };
}

/**
 * Logical operation causing binding to be re-enabled after visiting descendants of a
 * non-bindable container.
 */
export interface EnableBindingsOp extends Op<CreateOp> {
  kind: OpKind.EnableBindings;

  /**
   * `XrefId` of the element that was marked non-bindable.
   */
  xref: XrefId;
}

export function createEnableBindingsOp(xref: XrefId): EnableBindingsOp {
  return {
    kind: OpKind.EnableBindings,
    xref,
    ...NEW_OP,
  };
}

/**
 * Logical operation representing a text node in the creation IR.
 */
export interface TextOp extends Op<CreateOp>, ConsumesSlotOpTrait {
  kind: OpKind.Text;

  /**
   * `XrefId` used to reference this text node in other IR structures.
   */
  xref: XrefId;

  /**
   * The static initial value of the text node.
   */
  initialValue: string;

  /**
   * The placeholder for this text in its parent ICU. If this text is not part of an ICU, the
   * placeholder is null.
   */
  icuPlaceholder: string | null;

  sourceSpan: ParseSourceSpan | null;
}

/**
 * Create a `TextOp`.
 */
export function createTextOp(
  xref: XrefId,
  initialValue: string,
  icuPlaceholder: string | null,
  sourceSpan: ParseSourceSpan | null,
): TextOp {
  return {
    kind: OpKind.Text,
    xref,
    handle: new SlotHandle(),
    initialValue,
    icuPlaceholder,
    sourceSpan,
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
  };
}

/**
 * Logical operation representing an event listener on an element in the creation IR.
 */
export interface ListenerOp extends Op<CreateOp> {
  kind: OpKind.Listener;

  target: XrefId;
  targetSlot: SlotHandle;

  /**
   * Whether this listener is from a host binding.
   */
  hostListener: boolean;

  /**
   * Name of the event which is being listened to.
   */
  name: string;

  /**
   * Tag name of the element on which this listener is placed. Might be null, if this listener
   * belongs to a host binding.
   */
  tag: string | null;

  /**
   * A list of `UpdateOp`s representing the body of the event listener.
   */
  handlerOps: OpList<UpdateOp>;

  /**
   * Name of the function
   */
  handlerFnName: string | null;

  /**
   * Whether this listener is known to consume `$event` in its body.
   */
  consumesDollarEvent: boolean;

  /**
   * Whether the listener is listening for an animation event.
   */
  isLegacyAnimationListener: boolean;

  /**
   * The animation phase of the listener.
   */
  legacyAnimationPhase: string | null;

  /**
   * Some event listeners can have a target, e.g. in `document:dragover`.
   */
  eventTarget: string | null;

  sourceSpan: ParseSourceSpan;
}

/**
 * Create a `ListenerOp`. Host bindings reuse all the listener logic.
 */
export function createListenerOp(
  target: XrefId,
  targetSlot: SlotHandle,
  name: string,
  tag: string | null,
  handlerOps: Array<UpdateOp>,
  legacyAnimationPhase: string | null,
  eventTarget: string | null,
  hostListener: boolean,
  sourceSpan: ParseSourceSpan,
): ListenerOp {
  const handlerList = new OpList<UpdateOp>();
  handlerList.push(handlerOps);
  return {
    kind: OpKind.Listener,
    target,
    targetSlot,
    tag,
    hostListener,
    name,
    handlerOps: handlerList,
    handlerFnName: null,
    consumesDollarEvent: false,
    isLegacyAnimationListener: legacyAnimationPhase !== null,
    legacyAnimationPhase: legacyAnimationPhase,
    eventTarget,
    sourceSpan,
    ...NEW_OP,
  };
}

/**
 * Logical operation representing the event side of a two-way binding on an element
 * in the creation IR.
 */
export interface TwoWayListenerOp extends Op<CreateOp> {
  kind: OpKind.TwoWayListener;

  target: XrefId;
  targetSlot: SlotHandle;

  /**
   * Name of the event which is being listened to.
   */
  name: string;

  /**
   * Tag name of the element on which this listener is placed.
   */
  tag: string | null;

  /**
   * A list of `UpdateOp`s representing the body of the event listener.
   */
  handlerOps: OpList<UpdateOp>;

  /**
   * Name of the function
   */
  handlerFnName: string | null;

  sourceSpan: ParseSourceSpan;
}

/**
 * Create a `TwoWayListenerOp`.
 */
export function createTwoWayListenerOp(
  target: XrefId,
  targetSlot: SlotHandle,
  name: string,
  tag: string | null,
  handlerOps: Array<UpdateOp>,
  sourceSpan: ParseSourceSpan,
): TwoWayListenerOp {
  const handlerList = new OpList<UpdateOp>();
  handlerList.push(handlerOps);
  return {
    kind: OpKind.TwoWayListener,
    target,
    targetSlot,
    tag,
    name,
    handlerOps: handlerList,
    handlerFnName: null,
    sourceSpan,
    ...NEW_OP,
  };
}

export interface PipeOp extends Op<CreateOp>, ConsumesSlotOpTrait {
  kind: OpKind.Pipe;
  xref: XrefId;
  name: string;
}

export function createPipeOp(xref: XrefId, slot: SlotHandle, name: string): PipeOp {
  return {
    kind: OpKind.Pipe,
    xref,
    handle: slot,
    name,
    ...NEW_OP,
    ...TRAIT_CONSUMES_SLOT,
  };
}

/**
 * An op corresponding to a namespace instruction, for switching between HTML, SVG, and MathML.
 */
export interface NamespaceOp extends Op<CreateOp> {
  kind: OpKind.Namespace;
  active: Namespace;
}

export function createNamespaceOp(namespace: Namespace): NamespaceOp {
  return {
    kind: OpKind.Namespace,
    active: namespace,
    ...NEW_OP,
  };
}

/**
 * An op that creates a content projection slot.
 */
export interface ProjectionDefOp extends Op<CreateOp> {
  kind: OpKind.ProjectionDef;

  // The parsed selector information for this projection def.
  def: o.Expression | null;
}

export function createProjectionDefOp(def: o.Expression | null): ProjectionDefOp {
  return {
    kind: OpKind.ProjectionDef,
    def,
    ...NEW_OP,
  };
}

/**
 * An op that creates a content projection slot.
 */
export interface ProjectionOp extends Op<CreateOp>, ConsumesSlotOpTrait {
  kind: OpKind.Projection;

  xref: XrefId;

  projectionSlotIndex: number;

  attributes: null | o.LiteralArrayExpr;

  localRefs: string[];

  selector: string;

  i18nPlaceholder?: i18n.TagPlaceholder;

  sourceSpan: ParseSourceSpan;

  fallbackView: XrefId | null;
}

export function createProjectionOp(
  xref: XrefId,
  selector: string,
  i18nPlaceholder: i18n.TagPlaceholder | undefined,
  fallbackView: XrefId | null,
  sourceSpan: ParseSourceSpan,
): ProjectionOp {
  return {
    kind: OpKind.Projection,
    xref,
    handle: new SlotHandle(),
    selector,
    i18nPlaceholder,
    fallbackView,
    projectionSlotIndex: 0,
    attributes: null,
    localRefs: [],
    sourceSpan,
    ...NEW_OP,
    ...TRAIT_CONSUMES_SLOT,
    numSlotsUsed: fallbackView === null ? 1 : 2,
  };
}

/**
 * Represents an attribute that has been extracted for inclusion in the consts array.
 */
export interface ExtractedAttributeOp extends Op<CreateOp> {
  kind: OpKind.ExtractedAttribute;

  /**
   * The `XrefId` of the template-like element the extracted attribute will belong to.
   */
  target: XrefId;

  /**
   *  The kind of binding represented by this extracted attribute.
   */
  bindingKind: BindingKind;

  /**
   * The namespace of the attribute (or null if none).
   */
  namespace: string | null;

  /**
   * The name of the extracted attribute.
   */
  name: string;

  /**
   * The value expression of the extracted attribute.
   */
  expression: o.Expression | null;

  /**
   * If this attribute has a corresponding i18n attribute (e.g. `i18n-foo="m:d"`), then this is the
   * i18n context for it.
   */
  i18nContext: XrefId | null;

  /**
   * The security context of the binding.
   */
  securityContext: SecurityContext | SecurityContext[];

  /**
   * The trusted value function for this property.
   */
  trustedValueFn: o.Expression | null;

  i18nMessage: i18n.Message | null;
}

/**
 * Create an `ExtractedAttributeOp`.
 */
export function createExtractedAttributeOp(
  target: XrefId,
  bindingKind: BindingKind,
  namespace: string | null,
  name: string,
  expression: o.Expression | null,
  i18nContext: XrefId | null,
  i18nMessage: i18n.Message | null,
  securityContext: SecurityContext | SecurityContext[],
): ExtractedAttributeOp {
  return {
    kind: OpKind.ExtractedAttribute,
    target,
    bindingKind,
    namespace,
    name,
    expression,
    i18nContext,
    i18nMessage,
    securityContext,
    trustedValueFn: null,
    ...NEW_OP,
  };
}

export interface DeferOp extends Op<CreateOp>, ConsumesSlotOpTrait {
  kind: OpKind.Defer;

  /**
   * The xref of this defer op.
   */
  xref: XrefId;

  /**
   * The xref of the main view.
   */
  mainView: XrefId;

  mainSlot: SlotHandle;

  /**
   * Secondary loading block associated with this defer op.
   */
  loadingView: XrefId | null;

  loadingSlot: SlotHandle | null;

  /**
   * Secondary placeholder block associated with this defer op.
   */
  placeholderView: XrefId | null;

  placeholderSlot: SlotHandle | null;

  /**
   * Secondary error block associated with this defer op.
   */
  errorView: XrefId | null;

  errorSlot: SlotHandle | null;

  placeholderMinimumTime: number | null;
  loadingMinimumTime: number | null;
  loadingAfterTime: number | null;

  placeholderConfig: o.Expression | null;
  loadingConfig: o.Expression | null;

  /**
   * Depending on the compilation mode, there can be either one dependency resolution function
   * per deferred block or one for the entire template. This field contains the function that
   * belongs specifically to the current deferred block.
   */
  ownResolverFn: o.Expression | null;

  /**
   * After processing, the resolver function for the defer deps will be extracted to the constant
   * pool, and a reference to that function will be populated here.
   */
  resolverFn: o.Expression | null;

  /**
   * Specifies defer block flags, which should be used for all
   * instances of a given defer block (the flags that should be
   * placed into the `TDeferDetails` at runtime).
   */
  flags: TDeferDetailsFlags | null;

  sourceSpan: ParseSourceSpan;
}

export function createDeferOp(
  xref: XrefId,
  main: XrefId,
  mainSlot: SlotHandle,
  ownResolverFn: o.Expression | null,
  resolverFn: o.Expression | null,
  sourceSpan: ParseSourceSpan,
): DeferOp {
  return {
    kind: OpKind.Defer,
    xref,
    handle: new SlotHandle(),
    mainView: main,
    mainSlot,
    loadingView: null,
    loadingSlot: null,
    loadingConfig: null,
    loadingMinimumTime: null,
    loadingAfterTime: null,
    placeholderView: null,
    placeholderSlot: null,
    placeholderConfig: null,
    placeholderMinimumTime: null,
    errorView: null,
    errorSlot: null,
    ownResolverFn,
    resolverFn,
    flags: null,
    sourceSpan,
    ...NEW_OP,
    ...TRAIT_CONSUMES_SLOT,
    numSlotsUsed: 2,
  };
}
interface DeferTriggerBase {
  kind: DeferTriggerKind;
}

interface DeferTriggerWithTargetBase extends DeferTriggerBase {
  targetName: string | null;

  /**
   * The Xref of the targeted name. May be in a different view.
   */
  targetXref: XrefId | null;

  /**
   * The slot index of the named reference, inside the view provided below. This slot may not be
   * inside the current view, and is handled specially as a result.
   */
  targetSlot: SlotHandle | null;

  targetView: XrefId | null;

  /**
   * Number of steps to walk up or down the view tree to find the target localRef.
   */
  targetSlotViewSteps: number | null;
}

interface DeferIdleTrigger extends DeferTriggerBase {
  kind: DeferTriggerKind.Idle;
}

interface DeferImmediateTrigger extends DeferTriggerBase {
  kind: DeferTriggerKind.Immediate;
}

interface DeferNeverTrigger extends DeferTriggerBase {
  kind: DeferTriggerKind.Never;
}

interface DeferHoverTrigger extends DeferTriggerWithTargetBase {
  kind: DeferTriggerKind.Hover;
}

interface DeferTimerTrigger extends DeferTriggerBase {
  kind: DeferTriggerKind.Timer;

  delay: number;
}

interface DeferInteractionTrigger extends DeferTriggerWithTargetBase {
  kind: DeferTriggerKind.Interaction;
}

interface DeferViewportTrigger extends DeferTriggerWithTargetBase {
  kind: DeferTriggerKind.Viewport;
}

/**
 * The union type of all defer trigger interfaces.
 */
export type DeferTrigger =
  | DeferIdleTrigger
  | DeferImmediateTrigger
  | DeferTimerTrigger
  | DeferHoverTrigger
  | DeferInteractionTrigger
  | DeferViewportTrigger
  | DeferNeverTrigger;

export interface DeferOnOp extends Op<CreateOp> {
  kind: OpKind.DeferOn;

  defer: XrefId;

  /**
   * The trigger for this defer op (e.g. idle, hover, etc).
   */
  trigger: DeferTrigger;

  /**
   * Modifier set on the trigger by the user (e.g. `hydrate`, `prefetch` etc).
   */
  modifier: DeferOpModifierKind;

  sourceSpan: ParseSourceSpan;
}

export function createDeferOnOp(
  defer: XrefId,
  trigger: DeferTrigger,
  modifier: DeferOpModifierKind,
  sourceSpan: ParseSourceSpan,
): DeferOnOp {
  return {
    kind: OpKind.DeferOn,
    defer,
    trigger,
    modifier,
    sourceSpan,
    ...NEW_OP,
  };
}

/**
 * Op that reserves a slot during creation time for a `@let` declaration.
 */
export interface DeclareLetOp extends Op<CreateOp>, ConsumesSlotOpTrait {
  kind: OpKind.DeclareLet;
  xref: XrefId;
  sourceSpan: ParseSourceSpan;
  declaredName: string;
}

/**
 * Creates a `DeclareLetOp`.
 */
export function createDeclareLetOp(
  xref: XrefId,
  declaredName: string,
  sourceSpan: ParseSourceSpan,
): DeclareLetOp {
  return {
    kind: OpKind.DeclareLet,
    xref,
    declaredName,
    sourceSpan,
    handle: new SlotHandle(),
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
  };
}

/**
 * Represents a single value in an i18n param map. Each placeholder in the map may have multiple of
 * these values associated with it.
 */
export interface I18nParamValue {
  /**
   * The value. This can be either a slot number, special string, or compound-value consisting of an
   * element slot number and template slot number.
   */
  value: string | number | {element: number; template: number};

  /**
   * The sub-template index associated with the value.
   */
  subTemplateIndex: number | null;

  /**
   * Flags associated with the value.
   */
  flags: I18nParamValueFlags;
}

/**
 * Represents an i18n message that has been extracted for inclusion in the consts array.
 */
export interface I18nMessageOp extends Op<CreateOp> {
  kind: OpKind.I18nMessage;

  /**
   * An id used to reference this message.
   */
  xref: XrefId;

  /**
   * The context from which this message was extracted
   * TODO: remove this, and add another property here instead to match ExtractedAttributes
   */
  i18nContext: XrefId;

  /**
   * A reference to the i18n op this message was extracted from.
   *
   * This might be null, which means this message is not associated with a block. This probably
   * means it is an i18n attribute's message.
   */
  i18nBlock: XrefId | null;

  /**
   * The i18n message represented by this op.
   */
  message: i18n.Message;

  /**
   * The placeholder used for this message when it is referenced in another message.
   * For a top-level message that isn't referenced from another message, this will be null.
   */
  messagePlaceholder: string | null;

  /**
   * Whether this message needs post-processing.
   */
  needsPostprocessing: boolean;

  /**
   * The param map, with placeholders represented as an `Expression`.
   */
  params: Map<string, o.Expression>;

  /**
   * The post-processing param map, with placeholders represented as an `Expression`.
   */
  postprocessingParams: Map<string, o.Expression>;

  /**
   * A list of sub-messages that are referenced by this message.
   */
  subMessages: XrefId[];
}

/**
 * Create an `ExtractedMessageOp`.
 */
export function createI18nMessageOp(
  xref: XrefId,
  i18nContext: XrefId,
  i18nBlock: XrefId | null,
  message: i18n.Message,
  messagePlaceholder: string | null,
  params: Map<string, o.Expression>,
  postprocessingParams: Map<string, o.Expression>,
  needsPostprocessing: boolean,
): I18nMessageOp {
  return {
    kind: OpKind.I18nMessage,
    xref,
    i18nContext,
    i18nBlock,
    message,
    messagePlaceholder,
    params,
    postprocessingParams,
    needsPostprocessing,
    subMessages: [],
    ...NEW_OP,
  };
}

export interface I18nOpBase extends Op<CreateOp>, ConsumesSlotOpTrait {
  kind: OpKind.I18nStart | OpKind.I18n;

  /**
   * `XrefId` allocated for this i18n block.
   */
  xref: XrefId;

  /**
   * A reference to the root i18n block that this one belongs to. For a root i18n block, this is
   * the same as xref.
   */
  root: XrefId;

  /**
   * The i18n metadata associated with this op.
   */
  message: i18n.Message;

  /**
   * The index in the consts array where the message i18n message is stored.
   */
  messageIndex: ConstIndex | null;

  /**
   * The index of this sub-block in the i18n message. For a root i18n block, this is null.
   */
  subTemplateIndex: number | null;

  /**
   * The i18n context generated from this block. Initially null, until the context is created.
   */
  context: XrefId | null;

  sourceSpan: ParseSourceSpan | null;
}

/**
 * Represents an empty i18n block.
 */
export interface I18nOp extends I18nOpBase {
  kind: OpKind.I18n;
}

/**
 * Represents the start of an i18n block.
 */
export interface I18nStartOp extends I18nOpBase {
  kind: OpKind.I18nStart;
}

/**
 * Create an `I18nStartOp`.
 */
export function createI18nStartOp(
  xref: XrefId,
  message: i18n.Message,
  root: XrefId | undefined,
  sourceSpan: ParseSourceSpan | null,
): I18nStartOp {
  return {
    kind: OpKind.I18nStart,
    xref,
    handle: new SlotHandle(),
    root: root ?? xref,
    message,
    messageIndex: null,
    subTemplateIndex: null,
    context: null,
    sourceSpan,
    ...NEW_OP,
    ...TRAIT_CONSUMES_SLOT,
  };
}

/**
 * Represents the end of an i18n block.
 */
export interface I18nEndOp extends Op<CreateOp> {
  kind: OpKind.I18nEnd;

  /**
   * The `XrefId` of the `I18nStartOp` that created this block.
   */
  xref: XrefId;

  sourceSpan: ParseSourceSpan | null;
}

/**
 * Create an `I18nEndOp`.
 */
export function createI18nEndOp(xref: XrefId, sourceSpan: ParseSourceSpan | null): I18nEndOp {
  return {
    kind: OpKind.I18nEnd,
    xref,
    sourceSpan,
    ...NEW_OP,
  };
}

/**
 * An op that represents the start of an ICU expression.
 */
export interface IcuStartOp extends Op<CreateOp> {
  kind: OpKind.IcuStart;

  /**
   * The ID of the ICU.
   */
  xref: XrefId;

  /**
   * The i18n message for this ICU.
   */
  message: i18n.Message;

  /**
   * Placeholder used to reference this ICU in other i18n messages.
   */
  messagePlaceholder: string;

  /**
   * A reference to the i18n context for this op. Initially null, until the context is created.
   */
  context: XrefId | null;

  sourceSpan: ParseSourceSpan;
}

/**
 * Creates an ICU start op.
 */
export function createIcuStartOp(
  xref: XrefId,
  message: i18n.Message,
  messagePlaceholder: string,
  sourceSpan: ParseSourceSpan,
): IcuStartOp {
  return {
    kind: OpKind.IcuStart,
    xref,
    message,
    messagePlaceholder,
    context: null,
    sourceSpan,
    ...NEW_OP,
  };
}

/**
 * An op that represents the end of an ICU expression.
 */
export interface IcuEndOp extends Op<CreateOp> {
  kind: OpKind.IcuEnd;

  /**
   * The ID of the corresponding IcuStartOp.
   */
  xref: XrefId;
}

/**
 * Creates an ICU end op.
 */
export function createIcuEndOp(xref: XrefId): IcuEndOp {
  return {
    kind: OpKind.IcuEnd,
    xref,
    ...NEW_OP,
  };
}

/**
 * An op that represents a placeholder in an ICU expression.
 */
export interface IcuPlaceholderOp extends Op<CreateOp> {
  kind: OpKind.IcuPlaceholder;

  /**
   * The ID of the ICU placeholder.
   */
  xref: XrefId;

  /**
   * The name of the placeholder in the ICU expression.
   */
  name: string;

  /**
   * The static strings to be combined with dynamic expression values to form the text. This works
   * like interpolation, but the strings are combined at compile time, using special placeholders
   * for the dynamic expressions, and put into the translated message.
   */
  strings: string[];

  /**
   * Placeholder values for the i18n expressions to be combined with the static strings to form the
   * full placeholder value.
   */
  expressionPlaceholders: I18nParamValue[];
}

/**
 * Creates an ICU placeholder op.
 */
export function createIcuPlaceholderOp(
  xref: XrefId,
  name: string,
  strings: string[],
): IcuPlaceholderOp {
  return {
    kind: OpKind.IcuPlaceholder,
    xref,
    name,
    strings,
    expressionPlaceholders: [],
    ...NEW_OP,
  };
}

/**
 * An i18n context that is used to generate a translated i18n message. A separate context is created
 * for three different scenarios:
 *
 * 1. For each top-level i18n block.
 * 2. For each ICU referenced as a sub-message. ICUs that are referenced as a sub-message will be
 *    used to generate a separate i18n message, but will not be extracted directly into the consts
 *    array. Instead they will be pulled in as part of the initialization statements for the message
 *    that references them.
 * 3. For each i18n attribute.
 *
 * Child i18n blocks, resulting from the use of an ng-template inside of a parent i18n block, do not
 * generate a separate context. Instead their content is included in the translated message for
 * their root block.
 */
export interface I18nContextOp extends Op<CreateOp> {
  kind: OpKind.I18nContext;

  contextKind: I18nContextKind;

  /**
   * The id of this context.
   */
  xref: XrefId;

  /**
   * A reference to the I18nStartOp or I18nOp this context belongs to.
   *
   * It is possible for multiple contexts to belong to the same block, since both the block and any
   * ICUs inside the block will each get their own context.
   *
   * This might be `null`, in which case the context is not associated with an i18n block. This
   * probably means that it belongs to an i18n attribute.
   */
  i18nBlock: XrefId | null;

  /**
   * The i18n message associated with this context.
   */
  message: i18n.Message;

  /**
   * The param map for this context.
   */
  params: Map<string, I18nParamValue[]>;

  /**
   * The post-processing param map for this context.
   */
  postprocessingParams: Map<string, I18nParamValue[]>;

  sourceSpan: ParseSourceSpan;
}

export function createI18nContextOp(
  contextKind: I18nContextKind,
  xref: XrefId,
  i18nBlock: XrefId | null,
  message: i18n.Message,
  sourceSpan: ParseSourceSpan,
): I18nContextOp {
  if (i18nBlock === null && contextKind !== I18nContextKind.Attr) {
    throw new Error('AssertionError: i18nBlock must be provided for non-attribute contexts.');
  }

  return {
    kind: OpKind.I18nContext,
    contextKind,
    xref,
    i18nBlock,
    message,
    sourceSpan,
    params: new Map(),
    postprocessingParams: new Map(),
    ...NEW_OP,
  };
}

export interface I18nAttributesOp extends Op<CreateOp>, ConsumesSlotOpTrait {
  kind: OpKind.I18nAttributes;

  /**
   * The element targeted by these attributes.
   */
  target: XrefId;

  /**
   * I18nAttributes instructions correspond to a const array with configuration information.
   */
  i18nAttributesConfig: ConstIndex | null;
}

export function createI18nAttributesOp(
  xref: XrefId,
  handle: SlotHandle,
  target: XrefId,
): I18nAttributesOp {
  return {
    kind: OpKind.I18nAttributes,
    xref,
    handle,
    target,
    i18nAttributesConfig: null,
    ...NEW_OP,
    ...TRAIT_CONSUMES_SLOT,
  };
}

/** Describes a location at which an element is defined within a template. */
export interface ElementSourceLocation {
  targetSlot: SlotHandle;
  offset: number;
  line: number;
  column: number;
}

/**
 * Op that attaches the location at which each element is defined within the source template.
 */
export interface SourceLocationOp extends Op<CreateOp> {
  kind: OpKind.SourceLocation;
  templatePath: string;
  locations: ElementSourceLocation[];
}

/** Create a `SourceLocationOp`. */
export function createSourceLocationOp(
  templatePath: string,
  locations: ElementSourceLocation[],
): SourceLocationOp {
  return {
    kind: OpKind.SourceLocation,
    templatePath,
    locations,
    ...NEW_OP,
  };
}

/**
 * An index into the `consts` array which is shared across the compilation of all views in a
 * component.
 */
export type ConstIndex = number & {__brand: 'ConstIndex'};
