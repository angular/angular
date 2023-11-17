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
import {BindingKind, I18nParamResolutionTime} from '../enums';
import type {ConditionalCaseExpr} from '../expression';
import {SlotHandle} from '../handle';
import {Op, XrefId} from '../operations';
import {ConsumesVarsTrait, DependsOnSlotContextOpTrait} from '../traits';
import type {SharedOp} from './shared';

/**
 * An operation usable on the update side of the IR.
 */
export abstract class UpdateOp extends Op<UpdateOp|SharedOp> {}

/**
 * A logical operation to perform string interpolation on a text node.
 *
 * Interpolation inputs are stored as static `string`s and dynamic `o.Expression`s, in separate
 * arrays. Thus, the interpolation `A{{b}}C{{d}}E` is stored as 3 static strings `['A', 'C', 'E']`
 * and 2 dynamic expressions `[b, d]`.
 */
export class InterpolateTextOp extends UpdateOp implements ConsumesVarsTrait,
                                                           DependsOnSlotContextOpTrait {
  consumesVars: true = true;
  dependsOnSlotContext: true = true;

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
  i18nPlaceholders: string[];

  sourceSpan: ParseSourceSpan;

  constructor(
      target: XrefId, interpolation: Interpolation, i18nPlaceholders: string[],
      sourceSpan: ParseSourceSpan) {
    super();
    this.target = target;
    this.interpolation = interpolation;
    this.i18nPlaceholders = i18nPlaceholders;
    this.sourceSpan = sourceSpan;
  }
}

export class Interpolation {
  constructor(readonly strings: string[], readonly expressions: o.Expression[]) {}
}

/**
 * An intermediate binding op, that has not yet been processed into an individual property,
 * attribute, style, etc.
 */
export class BindingOp extends UpdateOp {
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


  constructor(
      target: XrefId, kind: BindingKind, name: string, expression: o.Expression|Interpolation,
      unit: string|null, securityContext: SecurityContext, isTextAttribute: boolean,
      isTemplate: boolean, sourceSpan: ParseSourceSpan) {
    super();
    this.target = target;
    this.bindingKind = kind;
    this.name = name;
    this.expression = expression;
    this.unit = unit;
    this.securityContext = securityContext;
    this.isTextAttribute = isTextAttribute;
    this.isTemplate = isTemplate;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * A logical operation representing binding to a property in the update IR.
 */
export class PropertyOp extends UpdateOp implements ConsumesVarsTrait, DependsOnSlotContextOpTrait {
  consumesVars: true = true;
  dependsOnSlotContext: true = true;

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

  constructor(
      target: XrefId, name: string, expression: o.Expression|Interpolation,
      isAnimationTrigger: boolean, securityContext: SecurityContext, isTemplate: boolean,
      sourceSpan: ParseSourceSpan) {
    super();
    this.target = target;
    this.name = name;
    this.expression = expression;
    this.isAnimationTrigger = isAnimationTrigger;
    this.securityContext = securityContext;
    this.sanitizer = null;
    this.isTemplate = isTemplate;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * A logical operation representing binding to a style property in the update IR.
 */
export class StylePropOp extends UpdateOp implements ConsumesVarsTrait,
                                                     DependsOnSlotContextOpTrait {
  consumesVars: true = true;
  dependsOnSlotContext: true = true;

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

  constructor(
      target: XrefId, name: string, expression: o.Expression|Interpolation, unit: string|null,
      sourceSpan: ParseSourceSpan) {
    super();
    this.target = target;
    this.name = name;
    this.expression = expression;
    this.unit = unit;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * A logical operation representing binding to a class property in the update IR.
 */
export class ClassPropOp extends UpdateOp implements ConsumesVarsTrait,
                                                     DependsOnSlotContextOpTrait {
  consumesVars: true = true;
  dependsOnSlotContext: true = true;

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

  constructor(xref: XrefId, name: string, expression: o.Expression, sourceSpan: ParseSourceSpan) {
    super();
    this.target = xref, this.name = name;
    this.expression = expression;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * A logical operation representing binding to a style map in the update IR.
 */
export class StyleMapOp extends UpdateOp implements ConsumesVarsTrait, DependsOnSlotContextOpTrait {
  consumesVars: true = true;
  dependsOnSlotContext: true = true;

  /**
   * Reference to the element on which the property is bound.
   */
  target: XrefId;

  /**
   * Expression which is bound to the property.
   */
  expression: o.Expression|Interpolation;

  sourceSpan: ParseSourceSpan;

  constructor(target: XrefId, expression: o.Expression|Interpolation, sourceSpan: ParseSourceSpan) {
    super();
    this.target = target;
    this.expression = expression;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * A logical operation representing binding to a style map in the update IR.
 */
export class ClassMapOp extends UpdateOp implements ConsumesVarsTrait, DependsOnSlotContextOpTrait {
  consumesVars: true = true;
  dependsOnSlotContext: true = true;

  /**
   * Reference to the element on which the property is bound.
   */
  target: XrefId;

  /**
   * Expression which is bound to the property.
   */
  expression: o.Expression|Interpolation;

  sourceSpan: ParseSourceSpan;

  constructor(target: XrefId, expression: o.Expression|Interpolation, sourceSpan: ParseSourceSpan) {
    super();
    this.target = target;
    this.expression = expression;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * A logical operation representing setting an attribute on an element in the update IR.
 */
export class AttributeOp extends UpdateOp implements DependsOnSlotContextOpTrait,
                                                     ConsumesVarsTrait {
  consumesVars: true = true;
  dependsOnSlotContext: true = true;

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

  constructor(
      target: XrefId, name: string, expression: o.Expression|Interpolation,
      securityContext: SecurityContext, isTextAttribute: boolean, isTemplate: boolean,
      sourceSpan: ParseSourceSpan) {
    super();
    this.target = target;
    this.name = name;
    this.expression = expression;
    this.securityContext = securityContext;
    this.sanitizer = null;
    this.isTextAttribute = isTextAttribute;
    this.isTemplate = isTemplate;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * Logical operation to advance the runtime's internal slot pointer in the update IR.
 */
export class AdvanceOp extends UpdateOp {
  /**
   * Delta by which to advance the pointer.
   */
  delta: number;

  sourceSpan: ParseSourceSpan;

  constructor(delta: number, sourceSpan: ParseSourceSpan) {
    super();
    this.delta = delta;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * Logical operation representing a conditional expression in the update IR.
 */
export class ConditionalOp extends UpdateOp implements DependsOnSlotContextOpTrait,
                                                       ConsumesVarsTrait {
  consumesVars: true = true;
  dependsOnSlotContext: true = true;

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
   * Control flow conditionals can accept a context value (this is a result of specifying an
   * alias). This expression will be passed to the conditional instruction's context parameter.
   */
  contextValue: o.Expression|null;

  sourceSpan: ParseSourceSpan;

  constructor(
      target: XrefId, targetSlot: SlotHandle, test: o.Expression|null,
      conditions: Array<ConditionalCaseExpr>, sourceSpan: ParseSourceSpan) {
    super();
    this.target = target;
    this.targetSlot = targetSlot;
    this.test = test;
    this.conditions = conditions;
    this.processed = null;
    this.contextValue = null;
    this.sourceSpan = sourceSpan;
  }
}

export class RepeaterOp extends UpdateOp implements DependsOnSlotContextOpTrait {
  dependsOnSlotContext: true = true;

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

  constructor(
      target: XrefId, targetSlot: SlotHandle, collection: o.Expression,
      sourceSpan: ParseSourceSpan) {
    super();
    this.target = target;
    this.targetSlot = targetSlot;
    this.collection = collection;
    this.sourceSpan = sourceSpan;
  }
}

export class DeferWhenOp extends UpdateOp implements DependsOnSlotContextOpTrait {
  dependsOnSlotContext: true = true;

  /**
   * The `defer` create op associated with this when condition.
   */
  target: XrefId;

  /**
   * A user-provided expression that triggers the defer op.
   */
  expr: o.Expression;

  /**
   * Whether to emit the prefetch version of the instruction.
   */
  prefetch: boolean;

  sourceSpan: ParseSourceSpan;

  constructor(target: XrefId, expr: o.Expression, prefetch: boolean, sourceSpan: ParseSourceSpan) {
    super();
    this.target = target;
    this.expr = expr;
    this.prefetch = prefetch;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * An op that represents an expression in an i18n message.
 */
export class I18nExpressionOp extends UpdateOp implements ConsumesVarsTrait,
                                                          DependsOnSlotContextOpTrait {
  consumesVars: true = true;
  dependsOnSlotContext: true = true;

  /**
   * The i18n context that this expression belongs to.
   */
  context: XrefId;

  /**
   * The Xref of the op that we need to `advance` to. This should be the final op in the owning
   * i18n block. This is necessary so that we run all lifecycle hooks.
   */
  target: XrefId;

  /**
   * A handle for the slot of the i18n block this expression belongs to.
   */
  handle: SlotHandle;

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

  constructor(
      context: XrefId, target: XrefId, handle: SlotHandle, expression: o.Expression,
      i18nPlaceholder: string, resolutionTime: I18nParamResolutionTime,
      sourceSpan: ParseSourceSpan) {
    super();
    this.context = context;
    this.target = target;
    this.handle = handle;
    this.expression = expression;
    this.i18nPlaceholder = i18nPlaceholder;
    this.resolutionTime = resolutionTime;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * An op that represents applying a set of i18n expressions.
 */
export class I18nApplyOp extends UpdateOp {
  /**
   * The Xref of the op that we need to `advance` to. This should be the final op in the owning
   * i18n block. This is necessary so that we run all lifecycle hooks.
   */
  target: XrefId;

  /**
   * A handle for the slot of the i18n block this expression belongs to.
   */
  handle: SlotHandle;

  sourceSpan: ParseSourceSpan;

  constructor(target: XrefId, handle: SlotHandle, sourceSpan: ParseSourceSpan) {
    super();
    this.target = target;
    this.handle = handle;
    this.sourceSpan = sourceSpan;
  }
}

/**
 * Logical operation representing a host binding to a property.
 */
export class HostPropertyOp extends UpdateOp implements ConsumesVarsTrait {
  consumesVars: true = true;
  name: string;
  expression: o.Expression|Interpolation;
  isAnimationTrigger: boolean;
  sourceSpan: ParseSourceSpan|null;

  constructor(
      name: string, expression: o.Expression|Interpolation, isAnimationTrigger: boolean,
      sourceSpan: ParseSourceSpan|null) {
    super();
    this.name = name;
    this.expression = expression;
    this.isAnimationTrigger = isAnimationTrigger;
    this.sourceSpan = sourceSpan;
  }
}
