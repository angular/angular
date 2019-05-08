/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {StylingContext} from '../interfaces/styling';
import {getProp as getOldProp, getSinglePropIndexValue as getOldSinglePropIndexValue} from '../styling/class_and_style_bindings';
import {TStylingConfigFlags, TStylingContext, TStylingContextIndex} from './interfaces';

/**
 * Creates a new instance of the `TStylingContext`.
 */
export function allocStylingContext(): TStylingContext {
  return [TStylingConfigFlags.Initial, 0];
}

/**
 * Temporary function that allows for a string-based property name to be
 * obtained from an index-based property identifier.
 *
 * This function will be removed once the new styling refactor code (which
 * lives inside of `render3/styling_next/`) replaces the existing styling
 * implementation.
 */
export function getBindingNameFromIndex(
    stylingContext: StylingContext, offset: number, directiveIndex: number, isClassBased: boolean) {
  const singleIndex =
      getOldSinglePropIndexValue(stylingContext, directiveIndex, offset, isClassBased);
  return getOldProp(stylingContext, singleIndex);
}

export function updateContextDirectiveIndex(context: TStylingContext, index: number) {
  context[TStylingContextIndex.MaxDirectiveIndexPosition] = index;
}

function getConfig(context: TStylingContext) {
  return context[TStylingContextIndex.ConfigPosition];
}

export function setConfig(context: TStylingContext, value: number) {
  context[TStylingContextIndex.ConfigPosition] = value;
}

export function getProp(context: TStylingContext, index: number) {
  return context[index + TStylingContextIndex.PropOffset] as string;
}

export function getGuardMask(context: TStylingContext, index: number) {
  return context[index + TStylingContextIndex.MaskOffset] as number;
}

export function getValuesCount(context: TStylingContext, index: number) {
  return context[index + TStylingContextIndex.ValuesCountOffset] as number;
}

export function getValue(context: TStylingContext, index: number, offset: number) {
  return context[index + TStylingContextIndex.BindingsStartOffset + offset] as number | string;
}

export function getDefaultValue(context: TStylingContext, index: number): string|boolean|null {
  const valuesCount = getValuesCount(context, index);
  return context[index + TStylingContextIndex.BindingsStartOffset + valuesCount - 1] as string |
      boolean | null;
}

/**
 * Temporary function which determines whether or not a context is
 * allowed to be flushed based on the provided directive index.
 */
export function allowStylingFlush(context: TStylingContext, index: number) {
  return index === context[TStylingContextIndex.MaxDirectiveIndexPosition];
}

export function lockContext(context: TStylingContext) {
  setConfig(context, getConfig(context) | TStylingConfigFlags.Locked);
}

export function isContextLocked(context: TStylingContext): boolean {
  return (getConfig(context) & TStylingConfigFlags.Locked) > 0;
}
