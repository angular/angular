/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementAttributes} from '../element';
import {OpKind} from '../enums';
import {Op, OpList, XrefId} from '../operations';

import {ListEndOp, NEW_OP, StatementOp} from './shared';
import type {UpdateOp} from './update';

/**
 * An operation usable on the creation side of the IR.
 */
export type CreateOp = ListEndOp<CreateOp>|StatementOp<CreateOp>|ElementOp|ElementStartOp|
    ElementEndOp|TemplateOp|TextOp|ListenerOp;

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
export interface ElementOpBase extends Op<CreateOp> {
  kind: OpKind.Element|OpKind.ElementStart|OpKind.Template;

  /**
   * `XrefId` allocated for this element.
   *
   * This ID is used to reference this element from other IR structures.
   */
  xref: XrefId;

  /**
   * The HTML tag name for this element.
   */
  tag: string;

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
export function createElementStartOp(tag: string, xref: XrefId): ElementStartOp {
  return {
    kind: OpKind.ElementStart,
    xref,
    tag,
    attributes: new ElementAttributes(),
    localRefs: [],
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
}

/**
 * Create a `TemplateOp`.
 */
export function createTemplateOp(xref: XrefId, tag: string): TemplateOp {
  return {
    kind: OpKind.Template,
    xref,
    attributes: new ElementAttributes(),
    tag,
    localRefs: [],
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
}

/**
 * Create an `ElementEndOp`.
 */
export function createElementEndOp(xref: XrefId): ElementEndOp {
  return {
    kind: OpKind.ElementEnd,
    xref,
    ...NEW_OP,
  };
}

/**
 * Logical operation representing a text node in the creation IR.
 */
export interface TextOp extends Op<CreateOp> {
  kind: OpKind.Text;

  /**
   * `XrefId` used to reference this text node in other IR structures.
   */
  xref: XrefId;

  /**
   * The static initial value of the text node.
   */
  initialValue: string;
}

/**
 * Create a `TextOp`.
 */
export function createTextOp(xref: XrefId, initialValue: string): TextOp {
  return {
    kind: OpKind.Text,
    xref,
    initialValue,
    ...NEW_OP,
  };
}

/**
 * Logical operation representing an event listener on an element in the creation IR.
 */
export interface ListenerOp extends Op<CreateOp> {
  kind: OpKind.Listener;

  /**
   * `XrefId` of the element on which the event listener is bound.
   */
  xref: XrefId;

  /**
   * Name of the event which is being listened to.
   */
  name: string;

  /**
   * A list of `UpdateOp`s representing the body of the event listener.
   */
  handlerOps: OpList<UpdateOp>;

  /**
   * Name of the function
   */
  handlerFnName: string|null;
}

/**
 * Create a `ListenerOp`.
 */
export function createListenerOp(xref: XrefId, name: string): ListenerOp {
  return {
    kind: OpKind.Listener,
    xref,
    name,
    handlerOps: new OpList(),
    handlerFnName: null,
    ...NEW_OP,
  };
}

/**
 * An index into the `consts` array which is shared across the compilation of all views in a
 * component.
 */
export type ConstIndex = number&{__brand: 'ConstIndex'};
