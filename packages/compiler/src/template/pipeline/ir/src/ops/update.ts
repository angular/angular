/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SecurityContext} from '../../../../../core';
import * as i18n from '../../../../../i18n/i18n_ast';
import * as o from '../../../../../output/output_ast';
import {ParseSourceSpan} from '../../../../../parse_util';
import {BindingKind, I18nParamResolutionTime, OpKind} from '../enums';
import type {ConditionalCaseExpr} from '../expression';
import {SlotHandle} from '../handle';
import {Op, XrefId} from '../operations';
import {ConsumesVarsTrait, DependsOnSlotContextOpTrait, TRAIT_CONSUMES_VARS, TRAIT_DEPENDS_ON_SLOT_CONTEXT} from '../traits';
import type {HostPropertyOp} from './host';
import {ListEndOp, NEW_OP, StatementOp, VariableOp} from './shared';


/**
 * An operation usable on the update side of the IR.
 */
export type UpdateOp = ListEndOp<UpdateOp>|StatementOp<UpdateOp>|PropertyOp|AttributeOp|StylePropOp|
    ClassPropOp|StyleMapOp|ClassMapOp|InterpolateTextOp|AdvanceOp|VariableOp<UpdateOp>|BindingOp|
    HostPropertyOp|ConditionalOp|I18nExpressionOp|I18nApplyOp|IcuUpdateOp|RepeaterOp;

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
   * The interpolated value.
   */
  interpolation: Interpolation;

  /**
   * The i18n placeholders associated with this interpolation.
   */
  i18nPlaceholders: i18n.Placeholder[];

  sourceSpan: ParseSourceSpan;
}

/**
 * Create an `InterpolationTextOp`.
 */
export function createInterpolateTextOp(
    xref: XrefId, interpolation: Interpolation, i18nPlaceholders: i18n.Placeholder[],
    sourceSpan: ParseSourceSpan): InterpolateTextOp {
  return {
    kind: OpKind.InterpolateText,
    target: xref,
    interpolation,
    i18nPlaceholders,
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
   * Whether the binding is a TextAttribute (e.g. `some-attr="some-value"`). This needs to be
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
                                       ConsumesVarsTrait {
  kind: OpKind.Conditional;

  /**
   * The insertion point, which is the first template in the creation block belonging to this
   * condition.
   */
  target: XrefId;

  /**
   * The slot of the target, to be populated during slot allocation.
   */
  targetSlot: SlotHandle;

  /**
   * The main test expression (for a switch), or `null` (for an if, which has no test expression).
   */
  test: o.Expression|null;

  /**
   * Each possible embedded view that could be displayed has a condition (or is default). This
   * structure maps each view xref to its corresponding condition.
   */
  conditions: Array<ConditionalCaseExpr>;

  /**
   * After processing, this will be a single collapsed Joost-expression that evaluates the
   * conditions, and yields the slot number of the template which should be displayed.
   */
  processed: o.Expression|null;

  /**
   * Control flow conditionals can accept a context value (this is a result of specifying an alias).
   * This expression will be passed to the conditional instruction's context parameter.
   */
  contextValue: o.Expression|null;

  sourceSpan: ParseSourceSpan;
}

/**
 * Create a conditional op, which will display an embedded view according to a condtion.
 */
export function createConditionalOp(
    target: XrefId, targetSlot: SlotHandle, test: o.Expression|null,
    conditions: Array<ConditionalCaseExpr>, sourceSpan: ParseSourceSpan): ConditionalOp {
  return {
    kind: OpKind.Conditional,
    target,
    targetSlot,
    test,
    conditions,
    processed: null,
    sourceSpan,
    contextValue: null,
    ...NEW_OP,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
    ...TRAIT_CONSUMES_VARS,
  };
}

export interface RepeaterOp extends Op<UpdateOp> {
  kind: OpKind.Repeater;

  /**
   * The RepeaterCreate op associated with this repeater.
   */
  target: XrefId;

  targetSlot: SlotHandle;

  /**
   * The collection provided to the for loop as its expression.
   */
  collection: o.Expression;

  sourceSpan: ParseSourceSpan;
}

export function createRepeaterOp(
    repeaterCreate: XrefId, targetSlot: SlotHandle, collection: o.Expression,
    sourceSpan: ParseSourceSpan): RepeaterOp {
  return {
    kind: OpKind.Repeater,
    target: repeaterCreate,
    targetSlot,
    collection,
    sourceSpan,
    ...NEW_OP,
  };
}

/**
 * An op that represents an expression in an i18n message.
 */
export interface I18nExpressionOp extends Op<UpdateOp>, ConsumesVarsTrait,
                                          DependsOnSlotContextOpTrait {
  kind: OpKind.I18nExpression;

  /**
   * The i18n block that this expression belongs to.
   */
  context: XrefId;

  /**
   * The Xref of the op that we need to `advance` to. This should be the final op in the owning i18n
   * block. This is necessary so that we run all lifecycle hooks.
   */
  target: XrefId;

  targetSlot: SlotHandle;

  /**
   * The expression value.
   */
  expression: o.Expression;

  /**
   * The i18n placeholder associated with this expression.
   */
  i18nPlaceholder: string;

  /**
   * The time that this expression is resolved.
   */
  resolutionTime: I18nParamResolutionTime;

  sourceSpan: ParseSourceSpan;
}

/**
 * Create an i18n expression op.
 */
export function createI18nExpressionOp(
    context: XrefId, target: XrefId, targetSlot: SlotHandle, expression: o.Expression,
    i18nPlaceholder: string, resolutionTime: I18nParamResolutionTime,
    sourceSpan: ParseSourceSpan): I18nExpressionOp {
  return {
    kind: OpKind.I18nExpression,
    context,
    target,
    targetSlot,
    expression,
    i18nPlaceholder,
    resolutionTime,
    sourceSpan,
    ...NEW_OP,
    ...TRAIT_CONSUMES_VARS,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
  };
}

/**
 * An op that represents applying a set of i18n expressions.
 */
export interface I18nApplyOp extends Op<UpdateOp> {
  kind: OpKind.I18nApply;

  /**
   * The i18n block to which expressions are applied
   */
  target: XrefId;

  targetSlot: SlotHandle;

  sourceSpan: ParseSourceSpan;
}

/**
 *Creates an op to apply i18n expression ops
 */
export function createI18nApplyOp(
    target: XrefId, targetSlot: SlotHandle, sourceSpan: ParseSourceSpan): I18nApplyOp {
  return {
    kind: OpKind.I18nApply,
    target,
    targetSlot,
    sourceSpan,
    ...NEW_OP,
  };
}

/**
 * An op that represents updating an ICU expression.
 */
export interface IcuUpdateOp extends Op<UpdateOp> {
  kind: OpKind.IcuUpdate;

  /**
   * The ID of the ICU being updated.
   */
  xref: XrefId;

  sourceSpan: ParseSourceSpan;
}

/**
 * Creates an op to update an ICU expression.
 */
export function createIcuUpdateOp(xref: XrefId, sourceSpan: ParseSourceSpan): IcuUpdateOp {
  return {
    kind: OpKind.IcuUpdate,
    xref,
    sourceSpan,
    ...NEW_OP,
  };
}
