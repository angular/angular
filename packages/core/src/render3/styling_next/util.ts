/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {Sanitizer, SecurityContext} from '../../sanitization/security';
import {StyleSanitizeFn, StyleSanitizeMode} from '../../sanitization/style_sanitizer';
import {StylingContext} from '../interfaces/styling';
import {LView, SANITIZER} from '../interfaces/view';
import {getProp as getOldProp, getSinglePropIndexValue as getOldSinglePropIndexValue} from '../styling/class_and_style_bindings';

import {LStylingMap, LStylingMapIndex, TStylingConfigFlags, TStylingContext, TStylingContextIndex, TStylingContextPropConfigFlags} from './interfaces';
import {getCurrentStyleSanitizer, setCurrentStyleSanitizer} from './state';

const MAP_BASED_ENTRY_PROP_NAME = '--MAP--';

/**
 * Creates a new instance of the `TStylingContext`.
 *
 * This function will also pre-fill the context with data
 * for map-based bindings.
 */
export function allocTStylingContext(): TStylingContext {
  // because map-based bindings deal with a dynamic set of values, there
  // is no way to know ahead of time whether or not sanitization is required.
  // For this reason the configuration will always mark sanitization as active
  // (this means that when map-based values are applied then sanitization will
  // be checked against each property).
  const mapBasedConfig = TStylingContextPropConfigFlags.SanitizationRequired;
  return [TStylingConfigFlags.Initial, 0, mapBasedConfig, 0, MAP_BASED_ENTRY_PROP_NAME];
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

function getPropConfig(context: TStylingContext, index: number): number {
  return (context[index + TStylingContextIndex.ConfigAndGuardOffset] as number) &
      TStylingContextPropConfigFlags.Mask;
}

export function isSanitizationRequired(context: TStylingContext, index: number) {
  return (getPropConfig(context, index) & TStylingContextPropConfigFlags.SanitizationRequired) > 0;
}

export function getGuardMask(context: TStylingContext, index: number) {
  const configGuardValue = context[index + TStylingContextIndex.ConfigAndGuardOffset] as number;
  return configGuardValue >> TStylingContextPropConfigFlags.TotalBits;
}

export function setGuardMask(context: TStylingContext, index: number, maskValue: number) {
  const config = getPropConfig(context, index);
  const guardMask = maskValue << TStylingContextPropConfigFlags.TotalBits;
  context[index + TStylingContextIndex.ConfigAndGuardOffset] = config | guardMask;
}

export function getValuesCount(context: TStylingContext, index: number) {
  return context[index + TStylingContextIndex.ValuesCountOffset] as number;
}

export function getBindingValue(context: TStylingContext, index: number, offset: number) {
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

export function getPropValuesStartPosition(context: TStylingContext) {
  return TStylingContextIndex.MapBindingsBindingsStartPosition +
      context[TStylingContextIndex.MapBindingsValuesCountPosition];
}

export function isMapBased(prop: string) {
  return prop === MAP_BASED_ENTRY_PROP_NAME;
}

export function hasValueChanged(
    a: LStylingMap | number | String | string | null | boolean | undefined | {},
    b: LStylingMap | number | String | string | null | boolean | undefined | {}): boolean {
  const compareValueA = Array.isArray(a) ? a[LStylingMapIndex.RawValuePosition] : a;
  const compareValueB = Array.isArray(b) ? b[LStylingMapIndex.RawValuePosition] : b;
  return compareValueA !== compareValueB;
}

/**
 * Determines whether the provided styling value is truthy or falsy.
 */
export function isStylingValueDefined(value: any) {
  // the reason why null is compared against is because
  // a CSS class value that is set to `false` must be
  // respected (otherwise it would be treated as falsy).
  // Empty string values are because developers usually
  // set a value to an empty string to remove it.
  return value != null && value !== '';
}

/**
 * Returns the current style sanitizer function for the given view.
 *
 * The default style sanitizer (which lives inside of `LView`) will
 * be returned depending on whether the `styleSanitizer` instruction
 * was called or not prior to any styling instructions running.
 */
export function getCurrentOrLViewSanitizer(lView: LView): StyleSanitizeFn|null {
  const sanitizer: StyleSanitizeFn|null = (getCurrentStyleSanitizer() || lView[SANITIZER]) as any;
  if (sanitizer && typeof sanitizer !== 'function') {
    setCurrentStyleSanitizer(sanitizer);
    return sanitizeUsingSanitizerObject;
  }
  return sanitizer;
}

/**
 * Style sanitization function that internally uses a `Sanitizer` instance to handle style
 * sanitization.
 */
const sanitizeUsingSanitizerObject: StyleSanitizeFn =
    (prop: string, value: string, mode: StyleSanitizeMode) => {
      const sanitizer = getCurrentStyleSanitizer() as Sanitizer;
      if (sanitizer) {
        if (mode & StyleSanitizeMode.SanitizeOnly) {
          return sanitizer.sanitize(SecurityContext.STYLE, value);
        } else {
          return true;
        }
      }
      return value;
    };
