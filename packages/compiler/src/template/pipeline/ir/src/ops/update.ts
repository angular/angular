/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SecurityContext} from '../../../../../core';
import * as o from '../../../../../output/output_ast';
import {ParseSourceSpan} from '../../../../../parse_util';
import {BindingKind, OpKind} from '../enums';
import {Op, XrefId} from '../operations';
import {ConsumesVarsTrait, DependsOnSlotContextOpTrait, TRAIT_CONSUMES_VARS, TRAIT_DEPENDS_ON_SLOT_CONTEXT, TRAIT_USES_SLOT_INDEX, UsesSlotIndexTrait} from '../traits';

import type {HostPropertyOp} from './host';
import {ListEndOp, NEW_OP, StatementOp, VariableOp} from './shared';


/**
 * An operation usable on the update side of the IR.
 */
export type UpdateOp = ListEndOp<UpdateOp>|StatementOp<UpdateOp>|PropertyOp|AttributeOp|StylePropOp|
    ClassPropOp|StyleMapOp|ClassMapOp|InterpolateTextOp|AdvanceOp|VariableOp<UpdateOp>|BindingOp|
    HostPropertyOp|ConditionalOp;

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

  interpolation: Interpolation;

  sourceSpan: ParseSourceSpan;
}

/**
 * Create an `InterpolationTextOp`.
 */
export function createInterpolateTextOp(
    xref: XrefId, interpolation: Interpolation, sourceSpan: ParseSourceSpan): InterpolateTextOp {
  return {
    kind: OpKind.InterpolateText,
    target: xref,
    interpolation,
    sourceSpan,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
    ...TRAIT_CONSUMES_VARS,
    ...NEW_OP,
  };
}

export class Interpolation {
  constructor(readonly strings: string[], readonly expressions: o.Expression[]) {}
}

/**
 * An intermediate binding op, that has not yet been processed into an individual property,
 * attribute, style, etc.
 */
export interface BindingOp extends Op<UpdateOp> {
  kind: OpKind.Binding;

  /**
   * Reference to the element on which the property is bound.
   */
  target: XrefId;

  /**
   *  The kind of binding represented by this op.
   */
  bindingKind: BindingKind;

  /**
   *  The name of this binding.
   */
  name: string;

  /**
   * Expression which is bound to the property.
   */
  expression: o.Expression|Interpolation;

  /**
   * The unit of the bound value.
   */
  unit: string|null;

  /**
   * The security context of the binding.
   */
  securityContext: SecurityContext;

  /**
   * Whether the binding is a TextAttribute (e.g. `some-attr="some-value"`). This needs ot be
   * tracked for compatiblity with `TemplateDefinitionBuilder` which treats `style` and `class`
   * TextAttributes differently from `[attr.style]` and `[attr.class]`.
   */
  isTextAttribute: boolean;

  /**
   * Whether this binding is on a template.
   */
  isTemplate: boolean;

  sourceSpan: ParseSourceSpan;
}

/**
 * Create a `BindingOp`, not yet transformed into a particular type of binding.
 */
export function createBindingOp(
    target: XrefId, kind: BindingKind, name: string, expression: o.Expression|Interpolation,
    unit: string|null, securityContext: SecurityContext, isTextAttribute: boolean,
    isTemplate: boolean, sourceSpan: ParseSourceSpan): BindingOp {
  return {
    kind: OpKind.Binding,
    bindingKind: kind,
    target,
    name,
    expression,
    unit,
    securityContext,
    isTextAttribute,
    isTemplate,
    sourceSpan,
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
  expression: o.Expression|Interpolation;

  /**
   * Whether this property is an animation trigger.
   */
  isAnimationTrigger: boolean;

  /**
   * The security context of the binding.
   */
  securityContext: SecurityContext;

  /**
   * The sanitizer for this property.
   */
  sanitizer: o.Expression|null;

  /**
   * Whether this binding is on a template.
   */
  isTemplate: boolean;

  sourceSpan: ParseSourceSpan;
}

/**
 * Create a `PropertyOp`.
 */
export function createPropertyOp(
    target: XrefId, name: string, expression: o.Expression|Interpolation,
    isAnimationTrigger: boolean, securityContext: SecurityContext, isTemplate: boolean,

    sourceSpan: ParseSourceSpan): PropertyOp {
  return {
    kind: OpKind.Property,
    target,
    name,
    expression,
    isAnimationTrigger,
    securityContext,
    sanitizer: null,
    isTemplate,
    sourceSpan,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
    ...TRAIT_CONSUMES_VARS,
    ...NEW_OP,
  };
}

/**
 * A logical operation representing binding to a style property in the update IR.
 */
export interface StylePropOp extends Op<UpdateOp>, ConsumesVarsTrait, DependsOnSlotContextOpTrait {
  kind: OpKind.StyleProp;

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
  expression: o.Expression|Interpolation;

  /**
   * The unit of the bound value.
   */
  unit: string|null;

  sourceSpan: ParseSourceSpan;
}

/** Create a `StylePropOp`. */
export function createStylePropOp(
    xref: XrefId, name: string, expression: o.Expression|Interpolation, unit: string|null,
    sourceSpan: ParseSourceSpan): StylePropOp {
  return {
    kind: OpKind.StyleProp,
    target: xref,
    name,
    expression,
    unit,
    sourceSpan,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
    ...TRAIT_CONSUMES_VARS,
    ...NEW_OP,
  };
}

/**
 * A logical operation representing binding to a class property in the update IR.
 */
export interface ClassPropOp extends Op<UpdateOp>, ConsumesVarsTrait, DependsOnSlotContextOpTrait {
  kind: OpKind.ClassProp;

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

  sourceSpan: ParseSourceSpan;
}

/**
 * Create a `ClassPropOp`.
 */
export function createClassPropOp(
    xref: XrefId, name: string, expression: o.Expression,
    sourceSpan: ParseSourceSpan): ClassPropOp {
  return {
    kind: OpKind.ClassProp,
    target: xref,
    name,
    expression,
    sourceSpan,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
    ...TRAIT_CONSUMES_VARS,
    ...NEW_OP,
  };
}

/**
 * A logical operation representing binding to a style map in the update IR.
 */
export interface StyleMapOp extends Op<UpdateOp>, ConsumesVarsTrait, DependsOnSlotContextOpTrait {
  kind: OpKind.StyleMap;

  /**
   * Reference to the element on which the property is bound.
   */
  target: XrefId;

  /**
   * Expression which is bound to the property.
   */
  expression: o.Expression|Interpolation;

  sourceSpan: ParseSourceSpan;
}

/** Create a `StyleMapOp`. */
export function createStyleMapOp(
    xref: XrefId, expression: o.Expression|Interpolation, sourceSpan: ParseSourceSpan): StyleMapOp {
  return {
    kind: OpKind.StyleMap,
    target: xref,
    expression,
    sourceSpan,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
    ...TRAIT_CONSUMES_VARS,
    ...NEW_OP,
  };
}

/**
 * A logical operation representing binding to a style map in the update IR.
 */
export interface ClassMapOp extends Op<UpdateOp>, ConsumesVarsTrait, DependsOnSlotContextOpTrait {
  kind: OpKind.ClassMap;

  /**
   * Reference to the element on which the property is bound.
   */
  target: XrefId;

  /**
   * Expression which is bound to the property.
   */
  expression: o.Expression|Interpolation;

  sourceSpan: ParseSourceSpan;
}

/**
 * Create a `ClassMapOp`.
 */
export function createClassMapOp(
    xref: XrefId, expression: o.Expression|Interpolation, sourceSpan: ParseSourceSpan): ClassMapOp {
  return {
    kind: OpKind.ClassMap,
    target: xref,
    expression,
    sourceSpan,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
    ...TRAIT_CONSUMES_VARS,
    ...NEW_OP,
  };
}

/**
 * A logical operation representing setting an attribute on an element in the update IR.
 */
export interface AttributeOp extends Op<UpdateOp> {
  kind: OpKind.Attribute;

  /**
   * The `XrefId` of the template-like element the attribute will belong to.
   */
  target: XrefId;

  /**
   * The name of the attribute.
   */
  name: string;

  /**
   * The value of the attribute.
   */
  expression: o.Expression|Interpolation;

  /**
   * The security context of the binding.
   */
  securityContext: SecurityContext;

  /**
   * The sanitizer for this attribute.
   */
  sanitizer: o.Expression|null;

  /**
   * Whether the binding is a TextAttribute (e.g. `some-attr="some-value"`). This needs ot be
   * tracked for compatiblity with `TemplateDefinitionBuilder` which treats `style` and `class`
   * TextAttributes differently from `[attr.style]` and `[attr.class]`.
   */
  isTextAttribute: boolean;

  /**
   * Whether this binding is on a template.
   */
  isTemplate: boolean;

  sourceSpan: ParseSourceSpan;
}

/**
 * Create an `AttributeOp`.
 */
export function createAttributeOp(
    target: XrefId, name: string, expression: o.Expression|Interpolation,
    securityContext: SecurityContext, isTextAttribute: boolean, isTemplate: boolean,
    sourceSpan: ParseSourceSpan): AttributeOp {
  return {
    kind: OpKind.Attribute,
    target,
    name,
    expression,
    securityContext,
    sanitizer: null,
    isTextAttribute,
    isTemplate,
    sourceSpan,
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

  // Source span of the binding that caused the advance
  sourceSpan: ParseSourceSpan;
}

/**
 * Create an `AdvanceOp`.
 */
export function createAdvanceOp(delta: number, sourceSpan: ParseSourceSpan): AdvanceOp {
  return {
    kind: OpKind.Advance,
    delta,
    sourceSpan,
    ...NEW_OP,
  };
}

/**
 * Logical operation representing a conditional expression in the update IR.
 */
export interface ConditionalOp extends Op<ConditionalOp>, DependsOnSlotContextOpTrait,
                                       UsesSlotIndexTrait {
  kind: OpKind.Conditional;

  /**
   * The insertion point, which is the first template in the creation block belonging to this
   * condition.
   */
  target: XrefId;

  /**
   * The slot of the target, to be populated during slot allocation.
   */
  slot: number|null;

  /**
   * The main test expression.
   */
  test: o.Expression;

  /**
   * Each possible embedded view that could be displayed has a condition (or is default). This
   * structure maps each view xref to its corresponding condition.
   */
  conditions: Array<[XrefId, o.Expression|null]>;

  /**
   * After processing, this will be a single collapsed Joost-expression that evaluates to the right
   * slot..
   */
  processed: o.Expression|null;

  sourceSpan: ParseSourceSpan;
}

/**
 * Create a conditional op, which will display an embedded view according to a condtion.
 */
export function createConditionalOp(
    target: XrefId, test: o.Expression, sourceSpan: ParseSourceSpan): ConditionalOp {
  return {
    kind: OpKind.Conditional,
    target,
    test,
    conditions: [],
    processed: null,
    sourceSpan,
    ...NEW_OP,
    ...TRAIT_USES_SLOT_INDEX,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
  };
}
