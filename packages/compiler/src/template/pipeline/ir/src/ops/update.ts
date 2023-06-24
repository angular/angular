/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../../output/output_ast';
import {ElementAttributeKind} from '../element';
import {OpKind} from '../enums';
import {Op, XrefId} from '../operations';
import {ConsumesVarsTrait, DependsOnSlotContextOpTrait, TRAIT_CONSUMES_VARS, TRAIT_DEPENDS_ON_SLOT_CONTEXT} from '../traits';

import {ListEndOp, NEW_OP, StatementOp, VariableOp} from './shared';

/**
 * An operation usable on the update side of the IR.
 */
export type UpdateOp = ListEndOp<UpdateOp>|StatementOp<UpdateOp>|PropertyOp|InterpolatePropertyOp|
    AttributeOp|InterpolateTextOp|AdvanceOp|VariableOp<UpdateOp>;

/**
 * A logical operation to perform string interpolation on a text node.
 *
 * Interpolation inputs are stored as static `string`s and dynamic `o.Expression`s, in separate
 * arrays. Thus, the interpolation `A{{b}}C{{d}}E` is stored as 3 static strings `['A', 'C', 'E']`
 * and 2 dynamic expressions `[b, d]`.
 */
export interface InterpolateTextOp extends Op<UpdateOp>, ConsumesVarsTrait {
  kind: OpKind.InterpolateText;

  /**
   * Reference to the text node to which the interpolation is bound.
   */
  target: XrefId;

  /**
   * All of the literal strings in the text interpolation, in order.
   *
   * Conceptually interwoven around the `expressions`.
   */
  strings: string[];

  /**
   * All of the dynamic expressions in the text interpolation, in order.
   *
   * Conceptually interwoven in between the `strings`.
   */
  expressions: o.Expression[];
}

/**
 * Create an `InterpolationTextOp`.
 */
export function createInterpolateTextOp(
    xref: XrefId, strings: string[], expressions: o.Expression[]): InterpolateTextOp {
  return {
    kind: OpKind.InterpolateText,
    target: xref,
    strings,
    expressions,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
    ...TRAIT_CONSUMES_VARS,
    ...NEW_OP,
  };
}

/**
 * A logical operation representing binding to a property in the update IR.
 */
export interface PropertyOp extends Op<UpdateOp>, ConsumesVarsTrait, DependsOnSlotContextOpTrait {
  kind: OpKind.Property;

  /**
   * Reference to the element on which the property is bound.
   */
  target: XrefId;

  /**
   * Name of the bound property.
   */
  name: string;

  /**
   * Expression which is bound to the property.
   */
  expression: o.Expression;

  /**
   * The kind of binding represented by this op, either a template binding or a normal binding.
   */
  bindingKind: ElementAttributeKind.Template|ElementAttributeKind.Binding;
}

/**
 * Create a `PropertyOp`.
 */
export function createPropertyOp(
    xref: XrefId, bindingKind: ElementAttributeKind.Template|ElementAttributeKind.Binding,
    name: string, expression: o.Expression): PropertyOp {
  return {
    kind: OpKind.Property,
    target: xref,
    bindingKind,
    name,
    expression,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
    ...TRAIT_CONSUMES_VARS,
    ...NEW_OP,
  };
}

/**
 * A logical operation representing setting an attribute  on an element in the update IR.
 */
export interface AttributeOp extends Op<UpdateOp> {
  kind: OpKind.Attribute;

  /**
   * The `XrefId` of the template-like element the attribte will belong to.
   */
  target: XrefId;

  /**
   * The kind of attribute.
   */
  attributeKind: ElementAttributeKind;

  /**
   * The name of the attribute.
   */
  name: string;

  /**
   * The value of the attribute.
   */
  value: o.Expression;
}

/**
 * Create an `AttributeOp`.
 */
export function createAttributeOp(
    target: XrefId, attributeKind: ElementAttributeKind, name: string,
    value: o.Expression): AttributeOp {
  return {
    kind: OpKind.Attribute,
    target,
    attributeKind,
    name,
    value,
    ...NEW_OP,
  };
}

/**
 * A logical operation representing binding an interpolation to a property in the update IR.
 */
export interface InterpolatePropertyOp extends Op<UpdateOp>, ConsumesVarsTrait,
                                               DependsOnSlotContextOpTrait {
  kind: OpKind.InterpolateProperty;

  /**
   * Reference to the element on which the property is bound.
   */
  target: XrefId;

  /**
   * Name of the bound property.
   */
  name: string;

  /**
   * All of the literal strings in the property interpolation, in order.
   *
   * Conceptually interwoven around the `expressions`.
   */
  strings: string[];

  /**
   * All of the dynamic expressions in the property interpolation, in order.
   *
   * Conceptually interwoven in between the `strings`.
   */
  expressions: o.Expression[];

  /**
   * The kind of binding represented by this op, either a template binding or a normal binding.
   */
  bindingKind: ElementAttributeKind.Template|ElementAttributeKind.Binding;
}

/**
 * Create a `InterpolateProperty`.
 */
export function createInterpolatePropertyOp(
    xref: XrefId, bindingKind: ElementAttributeKind.Template|ElementAttributeKind.Binding,
    name: string, strings: string[], expressions: o.Expression[]): InterpolatePropertyOp {
  return {
    kind: OpKind.InterpolateProperty,
    target: xref,
    bindingKind,
    name,
    strings,
    expressions,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
    ...TRAIT_CONSUMES_VARS,
    ...NEW_OP,
  };
}



/**
 * Logical operation to advance the runtime's internal slot pointer in the update IR.
 */
export interface AdvanceOp extends Op<UpdateOp> {
  kind: OpKind.Advance;

  /**
   * Delta by which to advance the pointer.
   */
  delta: number;
}

/**
 * Create an `AdvanceOp`.
 */
export function createAdvanceOp(delta: number): AdvanceOp {
  return {
    kind: OpKind.Advance,
    delta,
    ...NEW_OP,
  };
}
