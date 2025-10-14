/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Marker symbol for `ConsumesSlotOpTrait`.
 */
export const ConsumesSlot = Symbol('ConsumesSlot');
/**
 * Marker symbol for `DependsOnSlotContextOpTrait`.
 */
export const DependsOnSlotContext = Symbol('DependsOnSlotContext');
/**
 * Marker symbol for `ConsumesVars` trait.
 */
export const ConsumesVarsTrait = Symbol('ConsumesVars');
/**
 * Marker symbol for `UsesVarOffset` trait.
 */
export const UsesVarOffset = Symbol('UsesVarOffset');
/**
 * Default values for most `ConsumesSlotOpTrait` fields (used with the spread operator to initialize
 * implementors of the trait).
 */
export const TRAIT_CONSUMES_SLOT = {
  [ConsumesSlot]: true,
  numSlotsUsed: 1,
};
/**
 * Default values for most `DependsOnSlotContextOpTrait` fields (used with the spread operator to
 * initialize implementors of the trait).
 */
export const TRAIT_DEPENDS_ON_SLOT_CONTEXT = {
  [DependsOnSlotContext]: true,
};
/**
 * Default values for `UsesVars` fields (used with the spread operator to initialize
 * implementors of the trait).
 */
export const TRAIT_CONSUMES_VARS = {
  [ConsumesVarsTrait]: true,
};
/**
 * Test whether an operation implements `ConsumesSlotOpTrait`.
 */
export function hasConsumesSlotTrait(op) {
  return op[ConsumesSlot] === true;
}
export function hasDependsOnSlotContextTrait(value) {
  return value[DependsOnSlotContext] === true;
}
export function hasConsumesVarsTrait(value) {
  return value[ConsumesVarsTrait] === true;
}
/**
 * Test whether an expression implements `UsesVarOffsetTrait`.
 */
export function hasUsesVarOffsetTrait(expr) {
  return expr[UsesVarOffset] === true;
}
//# sourceMappingURL=traits.js.map
