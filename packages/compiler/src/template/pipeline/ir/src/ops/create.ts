/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18n from '../../../../../i18n/i18n_ast';
import * as o from '../../../../../output/output_ast';
import {ParseSourceSpan} from '../../../../../parse_util';
import {R3DeferBlockMetadata} from '../../../../../render3/view/api';
import {BindingKind, DeferTriggerKind, I18nContextKind, I18nParamValueFlags, Namespace} from '../enums';
import {SlotHandle} from '../handle';
import {Op, OpList, XrefId} from '../operations';
import {CollapsableEndTrait, CollapsableStartTrait, ConsumesSlotOpTrait} from '../traits';
import type {SharedOp} from './shared';
import type {UpdateOp} from './update';

/**
 * An operation usable on the creation side of the IR.
 */
export abstract class CreateOp extends Op<CreateOp|SharedOp> {}

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
export abstract class ElementOrContainerOp extends CreateOp implements ConsumesSlotOpTrait {
  consumesSlot: true = true;

  /**
   * `XrefId` allocated for this element.
   *
   * This ID is used to reference this element from other IR structures.
   */
  abstract xref: XrefId;

  /**
   * The HTML tag name for this element.
   */
  tag: string|null = null;

  /**
   * Attributes of various kinds on this element. Represented as a `ConstIndex` pointer into the
   * shared `consts` array of the component compilation.
   */
  attributes: ConstIndex|null = null;

  /**
   * Local references to this element.
   *
   * Before local ref processing, this is an array of `LocalRef` declarations.
   *
   * After processing, it's a `ConstIndex` pointer into the shared `consts` array of the component
   * compilation.
   */
  localRefs: LocalRef[]|ConstIndex|null = [];

  /**
   * Whether this container is marked `ngNonBindable`, which disabled Angular binding for itself and
   * all descendants.
   */
  nonBindable: boolean = false;

  sourceSpan: ParseSourceSpan = null!;

  handle = new SlotHandle();

  numSlotsUsed = 1;
}

export abstract class ElementOpBase extends ElementOrContainerOp {
  /**
   * The namespace of this element, which controls the preceding namespace instruction.
   */
  namespace: Namespace = Namespace.HTML;
}

/**
 * Logical operation representing the start of an element in the creation IR.
 */
export class ElementStartOp extends ElementOpBase implements CollapsableStartTrait<CreateOp> {
  collapsableStart: true = true;
  override xref: XrefId;

  /**
   * The i18n placeholder data associated with this element.
   */
  i18nPlaceholder?: i18n.TagPlaceholder;

  constructor(
      tag: string, xref: XrefId, namespace: Namespace,
      i18nPlaceholder: i18n.TagPlaceholder|undefined, sourceSpan: ParseSourceSpan) {
    super();
    this.tag = tag;
    this.xref = xref;
    this.namespace = namespace;
    this.i18nPlaceholder = i18nPlaceholder;
    this.sourceSpan = sourceSpan;
  }

  collapse(): ElementOp {
    let elem =
        new ElementOp(this.tag!, this.xref, this.namespace, this.i18nPlaceholder, this.sourceSpan);
    elem.attributes = this.attributes;
    elem.localRefs = this.localRefs;
    elem.nonBindable = this.nonBindable;
    elem.handle = this.handle;
    elem.numSlotsUsed = this.numSlotsUsed;
    return elem;
  }
}

/**
 * Logical operation representing an element with no children in the creation IR.
 */
export class ElementOp extends ElementOpBase {
  override xref: XrefId;

  /**
   * The i18n placeholder data associated with this element.
   */
  i18nPlaceholder?: i18n.TagPlaceholder;

  constructor(
      tag: string, xref: XrefId, namespace: Namespace,
      i18nPlaceholder: i18n.TagPlaceholder|undefined, sourceSpan: ParseSourceSpan) {
    super();
    this.tag = tag;
    this.xref = xref;
    this.namespace = namespace;
    this.i18nPlaceholder = i18nPlaceholder;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * Logical operation representing an embedded view declaration in the creation IR.
 */
export class TemplateOp extends ElementOpBase {
  override xref: XrefId;

  /**
   * The number of declaration slots used by this template, or `null` if slots have not yet been
   * assigned.
   */
  decls: number|null = null;

  /**
   * The number of binding variable slots used by this template, or `null` if binding variables have
   * not yet been counted.
   */
  vars: number|null = null;

  /**
   * Suffix to add to the name of the generated template function.
   */
  functionNameSuffix: string;

  /**
   * The i18n placeholder data associated with this template.
   */
  i18nPlaceholder?: i18n.TagPlaceholder;

  constructor(
      xref: XrefId, tag: string|null, functionNameSuffix: string, namespace: Namespace,
      i18nPlaceholder: i18n.TagPlaceholder|undefined, sourceSpan: ParseSourceSpan) {
    super();
    this.xref = xref;
    this.tag = tag;
    this.functionNameSuffix = functionNameSuffix;
    this.namespace = namespace;
    this.i18nPlaceholder = i18nPlaceholder;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * An op that creates a repeater (e.g. a for loop).
 */
export class RepeaterCreateOp extends ElementOpBase {
  override xref: XrefId;

  /**
   * The number of declaration slots used by this repeater's template, or `null` if slots have not
   * yet been assigned.
   */
  decls: number|null = null;

  /**
   * The number of binding variable slots used by this repeater's, or `null` if binding variables
   * have not yet been counted.
   */
  vars: number|null = null;

  /**
   * The Xref of the empty view function. (For the primary view function, use the `xref` property).
   */
  emptyView: XrefId|null;

  /**
   * The track expression to use while iterating.
   */
  track: o.Expression;

  /**
   * `null` initially, then an `o.Expression`. Might be a track expression, or might be a reference
   * into the constant pool.
   */
  trackByFn: o.Expression|null = null;

  /**
   * Context variables avaialable in this block.
   */
  varNames: RepeaterVarNames;

  /**
   * Whether the repeater track function relies on the component instance.
   */
  usesComponentInstance: boolean = false;

  /**
   * Suffix to add to the name of the generated template function.
   */
  functionNameSuffix: string = 'For';

  constructor(
      primaryView: XrefId, emptyView: XrefId|null, tag: string|null, track: o.Expression,
      varNames: RepeaterVarNames, sourceSpan: ParseSourceSpan) {
    super();
    this.xref = primaryView;
    this.emptyView = emptyView, this.track = track;
    this.tag = tag;
    this.varNames = varNames;
    this.sourceSpan = sourceSpan;
    this.numSlotsUsed = emptyView === null ? 2 : 3;
  }
}

// TODO: add source spans?
export interface RepeaterVarNames {
  $index: string;
  $count: string;
  $first: string;
  $last: string;
  $even: string;
  $odd: string;
  $implicit: string;
}

/**
 * Logical operation representing the end of an element structure in the creation IR.
 *
 * Pairs with an `ElementStart` operation.
 */
export class ElementEndOp extends CreateOp implements CollapsableEndTrait<CreateOp> {
  collapsableEnd: true = true;

  /**
   * The `XrefId` of the element declared via `ElementStart`.
   */
  xref: XrefId;

  sourceSpan: ParseSourceSpan|null;

  constructor(xref: XrefId, sourceSpan: ParseSourceSpan|null) {
    super();
    this.xref = xref;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * Logical operation representing the start of a container in the creation IR.
 */
export class ContainerStartOp extends ElementOrContainerOp implements
    CollapsableStartTrait<CreateOp> {
  collapsableStart: true = true;

  override xref: XrefId;

  constructor(
      xref: XrefId, handle: SlotHandle, attributes: ConstIndex|null,
      localRefs: LocalRef[]|ConstIndex|null, nonBindable: boolean, sourceSpan: ParseSourceSpan) {
    super();
    this.xref = xref;
    this.handle = handle;
    this.attributes = attributes;
    this.localRefs = localRefs;
    this.sourceSpan = sourceSpan;
    this.nonBindable = nonBindable;
    this.numSlotsUsed = this.numSlotsUsed;
  }

  collapse(): ContainerOp {
    let cont = new ContainerOp(
        this.xref, this.handle, this.attributes, this.localRefs, this.nonBindable, this.sourceSpan);
    return cont;
  }
}

/**
 * Logical operation representing an empty container in the creation IR.
 */
export class ContainerOp extends ElementOrContainerOp {
  override xref: XrefId;

  constructor(
      xref: XrefId, handle: SlotHandle, attributes: ConstIndex|null,
      localRefs: LocalRef[]|ConstIndex|null, nonBindable: boolean, sourceSpan: ParseSourceSpan) {
    super();
    this.xref = xref;
    this.handle = handle;
    this.attributes = attributes;
    this.localRefs = localRefs;
    this.sourceSpan = sourceSpan;
    this.nonBindable = nonBindable;
    this.numSlotsUsed = this.numSlotsUsed;
  }
}

/**
 * Logical operation representing the end of a container structure in the creation IR.
 *
 * Pairs with an `ContainerStart` operation.
 */
export class ContainerEndOp extends CreateOp implements CollapsableEndTrait<CreateOp> {
  collapsableEnd: true = true;

  /**
   * The `XrefId` of the element declared via `ContainerStart`.
   */
  xref: XrefId;

  sourceSpan: ParseSourceSpan;

  constructor(xref: XrefId, sourceSpan: ParseSourceSpan) {
    super();
    this.xref = xref;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * Logical operation causing binding to be disabled in descendents of a non-bindable container.
 */
export class DisableBindingsOp extends CreateOp {
  /**
   * `XrefId` of the element that was marked non-bindable.
   */
  xref: XrefId;

  constructor(xref: XrefId) {
    super();
    this.xref = xref;
  }
}

/**
 * Logical operation causing binding to be re-enabled after visiting descendants of a
 * non-bindable container.
 */
export class EnableBindingsOp extends CreateOp {
  /**
   * `XrefId` of the element that was marked non-bindable.
   */
  xref: XrefId;

  constructor(xref: XrefId) {
    super();
    this.xref = xref;
  }
}

/**
 * Logical operation representing a text node in the creation IR.
 */
export class TextOp extends CreateOp implements ConsumesSlotOpTrait {
  consumesSlot: true = true;

  /**
   * `XrefId` used to reference this text node in other IR structures.
   */
  xref: XrefId;

  /**
   * The static initial value of the text node.
   */
  initialValue: string;

  handle: SlotHandle = new SlotHandle();

  numSlotsUsed: number = 1;

  sourceSpan: ParseSourceSpan|null;

  constructor(xref: XrefId, initialValue: string, sourceSpan: ParseSourceSpan|null) {
    super();
    this.xref = xref;
    this.initialValue = initialValue;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * Logical operation representing an event listener on an element in the creation IR.
 */
export class ListenerOp extends CreateOp {
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
  tag: string|null;

  /**
   * A list of `UpdateOp`s representing the body of the event listener.
   */
  handlerOps: OpList<UpdateOp> = new OpList();

  /**
   * Name of the function
   */
  handlerFnName: string|null = null;

  /**
   * Whether this listener is known to consume `$event` in its body.
   */
  consumesDollarEvent: boolean = false;

  /**
   * Whether the listener is listening for an animation event.
   */
  isAnimationListener: boolean;

  /**
   * The animation phase of the listener.
   */
  animationPhase: string|null;

  sourceSpan: ParseSourceSpan;

  constructor(
      target: XrefId, targetSlot: SlotHandle, name: string, tag: string|null,
      animationPhase: string|null, hostListener: boolean, sourceSpan: ParseSourceSpan) {
    super();
    this.target = target;
    this.targetSlot = targetSlot;
    this.tag = tag;
    this.hostListener = hostListener;
    this.name = name;
    this.animationPhase = animationPhase;
    this.isAnimationListener = animationPhase !== null;
    this.sourceSpan = sourceSpan;
  }
}

export class PipeOp extends CreateOp implements ConsumesSlotOpTrait {
  consumesSlot: true = true;

  xref: XrefId;

  name: string;

  handle: SlotHandle;

  numSlotsUsed: number = 1;

  constructor(xref: XrefId, slot: SlotHandle, name: string) {
    super();
    this.xref = xref;
    this.name = name;
    this.handle = slot;
  }
}

/**
 * An op corresponding to a namespace instruction, for switching between HTML, SVG, and MathML.
 */
export class NamespaceOp extends CreateOp {
  active: Namespace;

  constructor(active: Namespace) {
    super();
    this.active = active;
  }
}

/**
 * An op that creates a content projection slot.
 */
export class ProjectionDefOp extends CreateOp {
  // The parsed selector information for this projection def.
  def: o.Expression|null;

  constructor(def: o.Expression|null) {
    super();
    this.def = def;
  }
}

/**
 * An op that creates a content projection slot.
 */
export class ProjectionOp extends CreateOp implements ConsumesSlotOpTrait {
  consumesSlot: true = true;

  xref: XrefId;

  projectionSlotIndex: number = 0;

  attributes: string[] = [];

  localRefs: string[] = [];

  selector: string;

  handle: SlotHandle;

  numSlotsUsed: number = 1;

  sourceSpan: ParseSourceSpan;

  constructor(xref: XrefId, selector: string, sourceSpan: ParseSourceSpan) {
    super();
    this.xref = xref;
    this.selector = selector;
    this.sourceSpan = sourceSpan;
    this.handle = new SlotHandle();
  }
}

/**
 * Represents an attribute that has been extracted for inclusion in the consts array.
 */
export class ExtractedAttributeOp extends CreateOp {
  /**
   * The `XrefId` of the template-like element the extracted attribute will belong to.
   */
  target: XrefId;

  /**
   *  The kind of binding represented by this extracted attribute.
   */
  bindingKind: BindingKind;

  /**
   * The name of the extracted attribute.
   */
  name: string;

  /**
   * The value expression of the extracted attribute.
   */
  expression: o.Expression|null;

  constructor(
      target: XrefId, bindingKind: BindingKind, name: string, expression: o.Expression|null) {
    super();
    this.target = target;
    this.bindingKind = bindingKind;
    this.name = name;
    this.expression = expression;
  }
}

export class DeferOp extends CreateOp implements ConsumesSlotOpTrait {
  consumesSlot: true = true;

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
  loadingView: XrefId|null = null;

  loadingSlot: SlotHandle|null = null;

  /**
   * Secondary placeholder block associated with this defer op.
   */
  placeholderView: XrefId|null = null;

  placeholderSlot: SlotHandle|null = null;

  /**
   * Secondary error block associated with this defer op.
   */
  errorView: XrefId|null = null;

  errorSlot: SlotHandle|null = null;

  placeholderMinimumTime: number|null = null;
  loadingMinimumTime: number|null = null;
  loadingAfterTime: number|null = null;

  placeholderConfig: o.Expression|null = null;
  loadingConfig: o.Expression|null = null;

  /**
   * Metadata about this defer block, provided by the parser.
   */
  metadata: R3DeferBlockMetadata;

  /**
   * After processing, the resolver function for the defer deps will be extracted to the constant
   * pool, and a reference to that function will be populated here.
   */
  resolverFn: o.Expression|null = null;

  handle: SlotHandle = new SlotHandle();

  numSlotsUsed: number = 2;

  sourceSpan: ParseSourceSpan;

  constructor(
      xref: XrefId, main: XrefId, mainSlot: SlotHandle, metadata: R3DeferBlockMetadata,
      sourceSpan: ParseSourceSpan) {
    super();
    this.xref = xref;
    this.mainView = main;
    this.mainSlot = mainSlot;
    this.metadata = metadata;
    this.sourceSpan = sourceSpan;
  }
}

interface DeferTriggerBase {
  kind: DeferTriggerKind;
}

interface DeferTriggerWithTargetBase extends DeferTriggerBase {
  targetName: string|null;

  /**
   * The Xref of the targeted name. May be in a different view.
   */
  targetXref: XrefId|null;

  /**
   * The slot index of the named reference, inside the view provided below. This slot may not be
   * inside the current view, and is handled specially as a result.
   */
  targetSlot: SlotHandle|null;

  targetView: XrefId|null;

  /**
   * Number of steps to walk up or down the view tree to find the target localRef.
   */
  targetSlotViewSteps: number|null;
}

interface DeferIdleTrigger extends DeferTriggerBase {
  kind: DeferTriggerKind.Idle;
}

interface DeferImmediateTrigger extends DeferTriggerBase {
  kind: DeferTriggerKind.Immediate;
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
export type DeferTrigger = DeferIdleTrigger|DeferImmediateTrigger|DeferTimerTrigger|
    DeferHoverTrigger|DeferInteractionTrigger|DeferViewportTrigger;

export class DeferOnOp extends CreateOp {
  defer: XrefId;

  /**
   * The trigger for this defer op (e.g. idle, hover, etc).
   */
  trigger: DeferTrigger;

  /**
   * Whether to emit the prefetch version of the instruction.
   */
  prefetch: boolean;

  sourceSpan: ParseSourceSpan;

  constructor(
      defer: XrefId, trigger: DeferTrigger, prefetch: boolean, sourceSpan: ParseSourceSpan) {
    super();
    this.defer = defer;
    this.trigger = trigger;
    this.prefetch = prefetch;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * Represents a single value in an i18n param map. Each placeholder in the map may have multiple of
 * these values associated with it.
 */
export interface I18nParamValue {
  /**
   * The value.
   */
  value: string|number;

  /**
   * The sub-template index associated with the value.
   */
  subTemplateIndex: number|null;

  /**
   * Flags associated with the value.
   */
  flags: I18nParamValueFlags;
}

/**
 * Represents an i18n message that has been extracted for inclusion in the consts array.
 */
export class I18nMessageOp extends CreateOp {
  /**
   * An id used to reference this message.
   */
  xref: XrefId;

  /**
   * A reference to the i18n op this message was extracted from.
   */
  i18nBlock: XrefId;

  /**
   * The i18n message represented by this op.
   */
  message: i18n.Message;

  /**
   * The placeholder used for this message when it is referenced in another message.
   * For a top-level message that isn't referenced from another message, this will be null.
   */
  messagePlaceholder: string|null;

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
  subMessages: XrefId[] = [];

  constructor(
      xref: XrefId, i18nBlock: XrefId, message: i18n.Message, messagePlaceholder: string|null,
      params: Map<string, o.Expression>, postprocessingParams: Map<string, o.Expression>,
      needsPostprocessing: boolean) {
    super();
    this.xref = xref;
    this.i18nBlock = i18nBlock;
    this.message = message;
    this.messagePlaceholder = messagePlaceholder;
    this.params = params;
    this.postprocessingParams = postprocessingParams;
    this.needsPostprocessing = needsPostprocessing;
  }
}

export abstract class I18nOpBase extends CreateOp implements ConsumesSlotOpTrait {
  consumesSlot: true = true;

  /**
   * `XrefId` allocated for this i18n block.
   */
  abstract xref: XrefId;

  /**
   * A reference to the root i18n block that this one belongs to. For a root i18n block, this is
   * the same as xref.
   */
  abstract root: XrefId;

  /**
   * The i18n metadata associated with this op.
   */
  abstract message: i18n.Message;

  /**
   * The index in the consts array where the message i18n message is stored.
   */
  messageIndex: ConstIndex|null = null;

  /**
   * The index of this sub-block in the i18n message. For a root i18n block, this is null.
   */
  subTemplateIndex: number|null = null;

  /**
   * The i18n context generated from this block. Initially null, until the context is created.
   */
  context: XrefId|null = null;

  abstract handle: SlotHandle;

  numSlotsUsed: number = 1;
}

/**
 * Represents an empty i18n block.
 */
export class I18nOp extends I18nOpBase {
  override xref: XrefId;

  override root: XrefId;

  override message: i18n.Message;

  override handle: SlotHandle;

  constructor(xref: XrefId, handle: SlotHandle, message: i18n.Message, root?: XrefId) {
    super();
    this.xref = xref;
    this.handle = handle;
    this.root = root ?? xref;
    this.message = message;
  }
}

/**
 * Represents the start of an i18n block.
 */
export class I18nStartOp extends I18nOpBase implements CollapsableStartTrait<CreateOp> {
  collapsableStart: true = true;

  override xref: XrefId;

  override root: XrefId;

  override message: i18n.Message;

  override handle: SlotHandle = new SlotHandle();

  constructor(xref: XrefId, message: i18n.Message, root?: XrefId) {
    super();
    this.xref = xref;
    this.root = root ?? xref;
    this.message = message;
  }

  collapse(): I18nOp {
    let op = new I18nOp(this.xref, this.handle, this.message, this.root);
    op.messageIndex = this.messageIndex;
    op.subTemplateIndex = this.subTemplateIndex;
    op.context = this.context;
    op.numSlotsUsed = this.numSlotsUsed;
    return op;
  }
}

/**
 * Represents the end of an i18n block.
 */
export class I18nEndOp extends CreateOp implements CollapsableEndTrait<CreateOp> {
  collapsableEnd: true = true;

  /**
   * The `XrefId` of the `I18nStartOp` that created this block.
   */
  xref: XrefId;

  constructor(xref: XrefId) {
    super();
    this.xref = xref;
  }
}

/**
 * An op that represents the start of an ICU expression.
 */
export class IcuStartOp extends CreateOp {
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
  context: XrefId|null = null;

  sourceSpan: ParseSourceSpan;

  constructor(
      xref: XrefId, message: i18n.Message, messagePlaceholder: string,
      sourceSpan: ParseSourceSpan) {
    super();
    this.xref = xref;
    this.message = message;
    this.messagePlaceholder = messagePlaceholder;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * An op that represents the end of an ICU expression.
 */
export class IcuEndOp extends CreateOp {
  /**
   * The ID of the corresponding IcuStartOp.
   */
  xref: XrefId;

  constructor(xref: XrefId) {
    super();
    this.xref = xref;
  }
}

/**
 * An i18n context that is used to generate a translated i18n message. A separate context is created
 * for two different scenarios:
 *
 * 1. For each top-level i18n block.
 * 2. For each ICU referenced as a sub-message. ICUs that are referenced as a sub-message will be
 *    used to generate a separate i18n message, but will not be extracted directly into the consts
 *    array. Instead they will be pulled in as part of the initialization statements for the message
 *    that references them.
 *
 * Child i18n blocks, resulting from the use of an ng-template inside of a parent i18n block, do not
 * generate a separate context. Instead their content is included in the translated message for
 * their root block.
 */
export class I18nContextOp extends CreateOp {
  /**
   *  The id of this context.
   */
  xref: XrefId;

  contextKind: I18nContextKind;

  /**
   * A reference to the I18nStartOp or I18nOp this context belongs to.
   *
   * It is possible for multiple contexts to belong to the same block, since both the block and any
   * ICUs inside the block will each get their own context.
   */
  i18nBlock: XrefId;

  /**
   * The i18n message associated with this context.
   */
  message: i18n.Message;

  /**
   * The param map for this context.
   */
  params: Map<string, I18nParamValue[]> = new Map();

  /**
   * The post-processing param map for this context.
   */
  postprocessingParams: Map<string, I18nParamValue[]> = new Map();

  sourceSpan: ParseSourceSpan;

  constructor(
      contextKind: I18nContextKind, xref: XrefId, i18nBlock: XrefId, message: i18n.Message,
      sourceSpan: ParseSourceSpan) {
    super();
    this.contextKind = contextKind;
    this.xref = xref;
    this.i18nBlock = i18nBlock;
    this.message = message;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * An index into the `consts` array which is shared across the compilation of all views in a
 * component.
 */
export type ConstIndex = number&{__brand: 'ConstIndex'};

export function literalOrArrayLiteral(value: any): o.Expression {
  if (Array.isArray(value)) {
    return o.literalArr(value.map(literalOrArrayLiteral));
  }
  return o.literal(value, o.INFERRED_TYPE);
}
