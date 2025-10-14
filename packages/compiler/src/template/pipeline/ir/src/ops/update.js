/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {OpKind} from '../enums';
import {TRAIT_CONSUMES_VARS, TRAIT_DEPENDS_ON_SLOT_CONTEXT} from '../traits';
import {NEW_OP} from './shared';
/**
 * Create an `InterpolationTextOp`.
 */
export function createInterpolateTextOp(xref, interpolation, sourceSpan) {
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
  constructor(strings, expressions, i18nPlaceholders) {
    this.strings = strings;
    this.expressions = expressions;
    this.i18nPlaceholders = i18nPlaceholders;
    if (i18nPlaceholders.length !== 0 && i18nPlaceholders.length !== expressions.length) {
      throw new Error(
        `Expected ${expressions.length} placeholders to match interpolation expression count, but got ${i18nPlaceholders.length}`,
      );
    }
  }
}
/**
 * Create a `BindingOp`, not yet transformed into a particular type of binding.
 */
export function createBindingOp(
  target,
  kind,
  name,
  expression,
  unit,
  securityContext,
  isTextAttribute,
  isStructuralTemplateAttribute,
  templateKind,
  i18nMessage,
  sourceSpan,
) {
  return {
    kind: OpKind.Binding,
    bindingKind: kind,
    target,
    name,
    expression,
    unit,
    securityContext,
    isTextAttribute,
    isStructuralTemplateAttribute,
    templateKind,
    i18nContext: null,
    i18nMessage,
    sourceSpan,
    ...NEW_OP,
  };
}
/**
 * Create a `PropertyOp`.
 */
export function createPropertyOp(
  target,
  name,
  expression,
  bindingKind,
  securityContext,
  isStructuralTemplateAttribute,
  templateKind,
  i18nContext,
  i18nMessage,
  sourceSpan,
) {
  return {
    kind: OpKind.Property,
    target,
    name,
    expression,
    bindingKind,
    securityContext,
    sanitizer: null,
    isStructuralTemplateAttribute,
    templateKind,
    i18nContext,
    i18nMessage,
    sourceSpan,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
    ...TRAIT_CONSUMES_VARS,
    ...NEW_OP,
  };
}
/**
 * Create a `TwoWayPropertyOp`.
 */
export function createTwoWayPropertyOp(
  target,
  name,
  expression,
  securityContext,
  isStructuralTemplateAttribute,
  templateKind,
  i18nContext,
  i18nMessage,
  sourceSpan,
) {
  return {
    kind: OpKind.TwoWayProperty,
    target,
    name,
    expression,
    securityContext,
    sanitizer: null,
    isStructuralTemplateAttribute,
    templateKind,
    i18nContext,
    i18nMessage,
    sourceSpan,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
    ...TRAIT_CONSUMES_VARS,
    ...NEW_OP,
  };
}
/** Create a `StylePropOp`. */
export function createStylePropOp(xref, name, expression, unit, sourceSpan) {
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
 * Create a `ClassPropOp`.
 */
export function createClassPropOp(xref, name, expression, sourceSpan) {
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
/** Create a `StyleMapOp`. */
export function createStyleMapOp(xref, expression, sourceSpan) {
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
 * Create a `ClassMapOp`.
 */
export function createClassMapOp(xref, expression, sourceSpan) {
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
 * Create an `AttributeOp`.
 */
export function createAttributeOp(
  target,
  namespace,
  name,
  expression,
  securityContext,
  isTextAttribute,
  isStructuralTemplateAttribute,
  templateKind,
  i18nMessage,
  sourceSpan,
) {
  return {
    kind: OpKind.Attribute,
    target,
    namespace,
    name,
    expression,
    securityContext,
    sanitizer: null,
    isTextAttribute,
    isStructuralTemplateAttribute,
    templateKind,
    i18nContext: null,
    i18nMessage,
    sourceSpan,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
    ...TRAIT_CONSUMES_VARS,
    ...NEW_OP,
  };
}
/**
 * Create an `AdvanceOp`.
 */
export function createAdvanceOp(delta, sourceSpan) {
  return {
    kind: OpKind.Advance,
    delta,
    sourceSpan,
    ...NEW_OP,
  };
}
/**
 * Create a conditional op, which will display an embedded view according to a condtion.
 */
export function createConditionalOp(target, test, conditions, sourceSpan) {
  return {
    kind: OpKind.Conditional,
    target,
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
export function createRepeaterOp(repeaterCreate, targetSlot, collection, sourceSpan) {
  return {
    kind: OpKind.Repeater,
    target: repeaterCreate,
    targetSlot,
    collection,
    sourceSpan,
    ...NEW_OP,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
  };
}
/**
 * Create an `AnimationBindingOp`.
 */
export function createAnimationBindingOp(
  name,
  target,
  animationKind,
  expression,
  securityContext,
  sourceSpan,
  animationBindingKind,
) {
  return {
    kind: OpKind.AnimationBinding,
    name,
    target,
    animationKind,
    expression,
    i18nMessage: null,
    securityContext,
    sanitizer: null,
    sourceSpan,
    animationBindingKind,
    ...NEW_OP,
  };
}
export function createDeferWhenOp(target, expr, modifier, sourceSpan) {
  return {
    kind: OpKind.DeferWhen,
    target,
    expr,
    modifier,
    sourceSpan,
    ...NEW_OP,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
    ...TRAIT_CONSUMES_VARS,
  };
}
/**
 * Create an i18n expression op.
 */
export function createI18nExpressionOp(
  context,
  target,
  i18nOwner,
  handle,
  expression,
  icuPlaceholder,
  i18nPlaceholder,
  resolutionTime,
  usage,
  name,
  sourceSpan,
) {
  return {
    kind: OpKind.I18nExpression,
    context,
    target,
    i18nOwner,
    handle,
    expression,
    icuPlaceholder,
    i18nPlaceholder,
    resolutionTime,
    usage,
    name,
    sourceSpan,
    ...NEW_OP,
    ...TRAIT_CONSUMES_VARS,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
  };
}
/**
 * Creates an op to apply i18n expression ops.
 */
export function createI18nApplyOp(owner, handle, sourceSpan) {
  return {
    kind: OpKind.I18nApply,
    owner,
    handle,
    sourceSpan,
    ...NEW_OP,
  };
}
/**
 * Creates a `StoreLetOp`.
 */
export function createStoreLetOp(target, declaredName, value, sourceSpan) {
  return {
    kind: OpKind.StoreLet,
    target,
    declaredName,
    value,
    sourceSpan,
    ...TRAIT_DEPENDS_ON_SLOT_CONTEXT,
    ...TRAIT_CONSUMES_VARS,
    ...NEW_OP,
  };
}
//# sourceMappingURL=update.js.map
