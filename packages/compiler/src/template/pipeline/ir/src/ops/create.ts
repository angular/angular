/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceSpan} from '../../../../../parse_util';
import {ElementAttributes} from '../element';
import {OpKind} from '../enums';
import {Op, OpList, XrefId} from '../operations';
import {ConsumesSlotOpTrait, TRAIT_CONSUMES_SLOT, TRAIT_USES_SLOT_INDEX, UsesSlotIndexTrait} from '../traits';

import {ListEndOp, NEW_OP, StatementOp, VariableOp} from './shared';

import type {UpdateOp} from './update';

/**
 * An operation usable on the creation side of the IR.
 */
export type CreateOp = ListEndOp<CreateOp>|StatementOp<CreateOp>|ElementOp|ElementStartOp|
    ElementEndOp|ContainerOp|ContainerStartOp|ContainerEndOp|TemplateOp|EnableBindingsOp|
    DisableBindingsOp|TextOp|ListenerOp|PipeOp|VariableOp<CreateOp>|NamespaceOp;

/**
 * An operation representing the creation of an element or container.
 */
export type ElementOrContainerOps =
    ElementOp|ElementStartOp|ContainerOp|ContainerStartOp|TemplateOp;

/**
 * The set of OpKinds that represent the creation of an element or container
 */
const elementContainerOpKinds = new Set([
  OpKind.Element, OpKind.ElementStart, OpKind.Container, OpKind.ContainerStart, OpKind.Template
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
   * Attributes of various kinds on this element.
   *
   * Before attribute processing, this is an `ElementAttributes` structure representing the
   * attributes on this element.
   *
   * After processing, it's a `ConstIndex` pointer into the shared `consts` array of the component
   * compilation.
   */
  attributes: ElementAttributes|ConstIndex|null;

  /**
   * Local references to this element.
   *
   * Before local ref processing, this is an array of `LocalRef` declarations.
   *
   * After processing, it's a `ConstIndex` pointer into the shared `consts` array of the component
   * compilation.
   */
  localRefs: LocalRef[]|ConstIndex|null;

  /**
   * Whether this container is marked `ngNonBindable`, which disabled Angular binding for itself and
   * all descendants.
   */
  nonBindable: boolean;

  sourceSpan: ParseSourceSpan;
}

export interface ElementOpBase extends ElementOrContainerOpBase {
  kind: OpKind.Element|OpKind.ElementStart|OpKind.Template;

  /**
   * The HTML tag name for this element.
   */
  tag: string;

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
}

/**
 * Create an `ElementStartOp`.
 */
export function createElementStartOp(
    tag: string, xref: XrefId, namespace: Namespace, sourceSpan: ParseSourceSpan): ElementStartOp {
  return {
    kind: OpKind.ElementStart,
    xref,
    tag,
    attributes: new ElementAttributes(),
    localRefs: [],
    nonBindable: false,
    namespace,
    sourceSpan,
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
  };
}

/**
 * Logical operation representing an element with no children in the creation IR.
 */
export interface ElementOp extends ElementOpBase {
  kind: OpKind.Element;
}

/**
 * Logical operation representing an embedded view declaration in the creation IR.
 */
export interface TemplateOp extends ElementOpBase {
  kind: OpKind.Template;

  /**
   * The number of declaration slots used by this template, or `null` if slots have not yet been
   * assigned.
   */
  decls: number|null;

  /**
   * The number of binding variable slots used by this template, or `null` if binding variables have
   * not yet been counted.
   */
  vars: number|null;
}

/**
 * Create a `TemplateOp`.
 */
export function createTemplateOp(
    xref: XrefId, tag: string, namespace: Namespace, sourceSpan: ParseSourceSpan): TemplateOp {
  return {
    kind: OpKind.Template,
    xref,
    attributes: new ElementAttributes(),
    tag,
    decls: null,
    vars: null,
    localRefs: [],
    nonBindable: false,
    namespace,
    sourceSpan,
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
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

  sourceSpan: ParseSourceSpan|null;
}

/**
 * Create an `ElementEndOp`.
 */
export function createElementEndOp(xref: XrefId, sourceSpan: ParseSourceSpan|null): ElementEndOp {
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
 * Logical operation causing binding to be re-enabled after visiting descendants of a non-bindable
 * container.
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

  sourceSpan: ParseSourceSpan|null;
}

/**
 * Create a `TextOp`.
 */
export function createTextOp(
    xref: XrefId, initialValue: string, sourceSpan: ParseSourceSpan|null): TextOp {
  return {
    kind: OpKind.Text,
    xref,
    initialValue,
    sourceSpan,
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
  };
}

/**
 * Logical operation representing an event listener on an element in the creation IR.
 */
export interface ListenerOp extends Op<CreateOp>, UsesSlotIndexTrait {
  kind: OpKind.Listener;

  /**
   * Name of the event which is being listened to.
   */
  name: string;

  /**
   * Tag name of the element on which this listener is placed.
   */
  tag: string;

  /**
   * A list of `UpdateOp`s representing the body of the event listener.
   */
  handlerOps: OpList<UpdateOp>;

  /**
   * Name of the function
   */
  handlerFnName: string|null;

  /**
   * Whether this listener is known to consume `$event` in its body.
   */
  consumesDollarEvent: boolean;

  /**
   * Whether the listener is listening for an animation event.
   */
  isAnimationListener: boolean;

  /**
   * The animation phase of the listener.
   */
  animationPhase: string|null;
}

/**
 * Create a `ListenerOp`.
 */
export function createListenerOp(target: XrefId, name: string, tag: string): ListenerOp {
  return {
    kind: OpKind.Listener,
    target,
    tag,
    name,
    handlerOps: new OpList(),
    handlerFnName: null,
    consumesDollarEvent: false,
    isAnimationListener: false,
    animationPhase: null,
    ...NEW_OP,
    ...TRAIT_USES_SLOT_INDEX,
  };
}

/**
 * Create a `ListenerOp` for an animation.
 */
export function createListenerOpForAnimation(
    target: XrefId, name: string, animationPhase: string, tag: string): ListenerOp {
  return {
    kind: OpKind.Listener,
    target,
    tag,
    name,
    handlerOps: new OpList(),
    handlerFnName: null,
    consumesDollarEvent: false,
    isAnimationListener: true,
    animationPhase,
    ...NEW_OP,
    ...TRAIT_USES_SLOT_INDEX,
  };
}

export interface PipeOp extends Op<CreateOp>, ConsumesSlotOpTrait {
  kind: OpKind.Pipe;
  xref: XrefId;
  name: string;
}

export function createPipeOp(xref: XrefId, name: string): PipeOp {
  return {
    kind: OpKind.Pipe,
    xref,
    name,
    ...NEW_OP,
    ...TRAIT_CONSUMES_SLOT,
  };
}

/**
 * Whether the active namespace is HTML, MathML, or SVG mode.
 */
export enum Namespace {
  HTML,
  SVG,
  Math,
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
 * An index into the `consts` array which is shared across the compilation of all views in a
 * component.
 */
export type ConstIndex = number&{__brand: 'ConstIndex'};
