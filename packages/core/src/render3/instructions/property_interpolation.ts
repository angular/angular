/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {assertEqual, assertLessThan} from '../../util/assert';
import {bindingUpdated, bindingUpdated2, bindingUpdated3, bindingUpdated4} from '../bindings';
import {SanitizerFn} from '../interfaces/sanitization';
import {BINDING_INDEX, TVIEW} from '../interfaces/view';
import {getLView, getSelectedIndex} from '../state';
import {NO_CHANGE} from '../tokens';
import {renderStringify} from '../util/misc_utils';

import {TsickleIssue1009, elementPropertyInternal, storeBindingMetadata} from './shared';



/**
 * Create interpolation bindings with a variable number of expressions.
 *
 * If there are 1 to 8 expressions `interpolation1()` to `interpolation8()` should be used instead.
 * Those are faster because there is no need to create an array of expressions and iterate over it.
 *
 * `values`:
 * - has static text at even indexes,
 * - has evaluated expressions at odd indexes.
 *
 * Returns the concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 *
 * @codeGenApi
 */
export function ΔinterpolationV(values: any[]): string|NO_CHANGE {
  ngDevMode && assertLessThan(2, values.length, 'should have at least 3 values');
  ngDevMode && assertEqual(values.length % 2, 1, 'should have an odd number of values');
  let different = false;
  const lView = getLView();
  const tData = lView[TVIEW].data;
  let bindingIndex = lView[BINDING_INDEX];

  if (tData[bindingIndex] == null) {
    // 2 is the index of the first static interstitial value (ie. not prefix)
    for (let i = 2; i < values.length; i += 2) {
      tData[bindingIndex++] = values[i];
    }
    bindingIndex = lView[BINDING_INDEX];
  }

  for (let i = 1; i < values.length; i += 2) {
    // Check if bindings (odd indexes) have changed
    bindingUpdated(lView, bindingIndex++, values[i]) && (different = true);
  }
  lView[BINDING_INDEX] = bindingIndex;
  storeBindingMetadata(lView, values[0], values[values.length - 1]);

  if (!different) {
    return NO_CHANGE;
  }

  // Build the updated content
  let content = values[0];
  for (let i = 1; i < values.length; i += 2) {
    content += renderStringify(values[i]) + values[i + 1];
  }

  return content;
}

/**
 * Creates an interpolation binding with 1 expression.
 *
 * @param prefix static value used for concatenation only.
 * @param v0 value checked for change.
 * @param suffix static value used for concatenation only.
 *
 * @codeGenApi
 */
export function Δinterpolation1(prefix: string, v0: any, suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const different = bindingUpdated(lView, lView[BINDING_INDEX]++, v0);
  storeBindingMetadata(lView, prefix, suffix);
  return different ? prefix + renderStringify(v0) + suffix : NO_CHANGE;
}

/**
 * Creates an interpolation binding with 2 expressions.
 *
 * @codeGenApi
 */
export function Δinterpolation2(
    prefix: string, v0: any, i0: string, v1: any, suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  const different = bindingUpdated2(lView, bindingIndex, v0, v1);
  lView[BINDING_INDEX] += 2;

  // Only set static strings the first time (data will be null subsequent runs).
  const data = storeBindingMetadata(lView, prefix, suffix);
  if (data) {
    lView[TVIEW].data[bindingIndex] = i0;
  }

  return different ? prefix + renderStringify(v0) + i0 + renderStringify(v1) + suffix : NO_CHANGE;
}

/**
 * Creates an interpolation binding with 3 expressions.
 *
 * @codeGenApi
 */
export function Δinterpolation3(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string): string|
    NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  const different = bindingUpdated3(lView, bindingIndex, v0, v1, v2);
  lView[BINDING_INDEX] += 3;

  // Only set static strings the first time (data will be null subsequent runs).
  const data = storeBindingMetadata(lView, prefix, suffix);
  if (data) {
    const tData = lView[TVIEW].data;
    tData[bindingIndex] = i0;
    tData[bindingIndex + 1] = i1;
  }

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + suffix :
      NO_CHANGE;
}

/**
 * Create an interpolation binding with 4 expressions.
 *
 * @codeGenApi
 */
export function Δinterpolation4(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  const different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  lView[BINDING_INDEX] += 4;

  // Only set static strings the first time (data will be null subsequent runs).
  const data = storeBindingMetadata(lView, prefix, suffix);
  if (data) {
    const tData = lView[TVIEW].data;
    tData[bindingIndex] = i0;
    tData[bindingIndex + 1] = i1;
    tData[bindingIndex + 2] = i2;
  }

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 +
          renderStringify(v3) + suffix :
      NO_CHANGE;
}

/**
 * Creates an interpolation binding with 5 expressions.
 *
 * @codeGenApi
 */
export function Δinterpolation5(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated(lView, bindingIndex + 4, v4) || different;
  lView[BINDING_INDEX] += 5;

  // Only set static strings the first time (data will be null subsequent runs).
  const data = storeBindingMetadata(lView, prefix, suffix);
  if (data) {
    const tData = lView[TVIEW].data;
    tData[bindingIndex] = i0;
    tData[bindingIndex + 1] = i1;
    tData[bindingIndex + 2] = i2;
    tData[bindingIndex + 3] = i3;
  }

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 +
          renderStringify(v3) + i3 + renderStringify(v4) + suffix :
      NO_CHANGE;
}

/**
 * Creates an interpolation binding with 6 expressions.
 *
 * @codeGenApi
 */
export function Δinterpolation6(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, i4: string, v5: any, suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated2(lView, bindingIndex + 4, v4, v5) || different;
  lView[BINDING_INDEX] += 6;

  // Only set static strings the first time (data will be null subsequent runs).
  const data = storeBindingMetadata(lView, prefix, suffix);
  if (data) {
    const tData = lView[TVIEW].data;
    tData[bindingIndex] = i0;
    tData[bindingIndex + 1] = i1;
    tData[bindingIndex + 2] = i2;
    tData[bindingIndex + 3] = i3;
    tData[bindingIndex + 4] = i4;
  }

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 +
          renderStringify(v3) + i3 + renderStringify(v4) + i4 + renderStringify(v5) + suffix :
      NO_CHANGE;
}

/**
 * Creates an interpolation binding with 7 expressions.
 *
 * @codeGenApi
 */
export function Δinterpolation7(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string): string|
    NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated3(lView, bindingIndex + 4, v4, v5, v6) || different;
  lView[BINDING_INDEX] += 7;

  // Only set static strings the first time (data will be null subsequent runs).
  const data = storeBindingMetadata(lView, prefix, suffix);
  if (data) {
    const tData = lView[TVIEW].data;
    tData[bindingIndex] = i0;
    tData[bindingIndex + 1] = i1;
    tData[bindingIndex + 2] = i2;
    tData[bindingIndex + 3] = i3;
    tData[bindingIndex + 4] = i4;
    tData[bindingIndex + 5] = i5;
  }

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 +
          renderStringify(v3) + i3 + renderStringify(v4) + i4 + renderStringify(v5) + i5 +
          renderStringify(v6) + suffix :
      NO_CHANGE;
}

/**
 * Creates an interpolation binding with 8 expressions.
 *
 * @codeGenApi
 */
export function Δinterpolation8(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any,
    suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated4(lView, bindingIndex + 4, v4, v5, v6, v7) || different;
  lView[BINDING_INDEX] += 8;

  // Only set static strings the first time (data will be null subsequent runs).
  const data = storeBindingMetadata(lView, prefix, suffix);
  if (data) {
    const tData = lView[TVIEW].data;
    tData[bindingIndex] = i0;
    tData[bindingIndex + 1] = i1;
    tData[bindingIndex + 2] = i2;
    tData[bindingIndex + 3] = i3;
    tData[bindingIndex + 4] = i4;
    tData[bindingIndex + 5] = i5;
    tData[bindingIndex + 6] = i6;
  }

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 +
          renderStringify(v3) + i3 + renderStringify(v4) + i4 + renderStringify(v5) + i5 +
          renderStringify(v6) + i6 + renderStringify(v7) + suffix :
      NO_CHANGE;
}

/////////////////////////////////////////////////////////////////////
/// NEW INSTRUCTIONS
/////////////////////////////////////////////////////////////////////

/**
 *
 * Update an interpolated property on an element with a lone bound value
 *
 * Used when the value passed to a property has 1 interpolated value in it, an no additional text
 * surrounds that interpolated value:
 *
 * ```html
 * <div title="{{v0}}"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ΔpropertyInterpolate('title', v0);
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ΔpropertyInterpolate(
    propName: string, v0: any, sanitizer?: SanitizerFn): TsickleIssue1009 {
  ΔpropertyInterpolate1(propName, '', v0, '', sanitizer);
  return ΔpropertyInterpolate;
}


/**
 *
 * Update an interpolated property on an element with single bound value surrounded by text.
 *
 * Used when the value passed to a property has 1 interpolated value in it:
 *
 * ```html
 * <div title="prefix{{v0}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ΔpropertyInterpolate1('title', 'prefix', v0, 'suffix');
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ΔpropertyInterpolate1(
    propName: string, prefix: string, v0: any, suffix: string,
    sanitizer?: SanitizerFn): TsickleIssue1009 {
  const index = getSelectedIndex();
  const interpolatedValue = Δinterpolation1(prefix, v0, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    elementPropertyInternal(index, propName, interpolatedValue, sanitizer);
  }
  return ΔpropertyInterpolate1;
}

/**
 *
 * Update an interpolated property on an element with 2 bound values surrounded by text.
 *
 * Used when the value passed to a property has 2 interpolated values in it:
 *
 * ```html
 * <div title="prefix{{v0}}-{{v1}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ΔpropertyInterpolate2('title', 'prefix', v0, '-', v1, 'suffix');
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ΔpropertyInterpolate2(
    propName: string, prefix: string, v0: any, i0: string, v1: any, suffix: string,
    sanitizer?: SanitizerFn): TsickleIssue1009 {
  const index = getSelectedIndex();
  const interpolatedValue = Δinterpolation2(prefix, v0, i0, v1, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    elementPropertyInternal(index, propName, interpolatedValue, sanitizer);
  }
  return ΔpropertyInterpolate2;
}

/**
 *
 * Update an interpolated property on an element with 3 bound values surrounded by text.
 *
 * Used when the value passed to a property has 3 interpolated values in it:
 *
 * ```html
 * <div title="prefix{{v0}}-{{v1}}-{{v2}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ΔpropertyInterpolate3(
 * 'title', 'prefix', v0, '-', v1, '-', v2, 'suffix');
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ΔpropertyInterpolate3(
    propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any,
    suffix: string, sanitizer?: SanitizerFn): TsickleIssue1009 {
  const index = getSelectedIndex();
  const interpolatedValue = Δinterpolation3(prefix, v0, i0, v1, i1, v2, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    elementPropertyInternal(index, propName, interpolatedValue, sanitizer);
  }
  return ΔpropertyInterpolate3;
}

/**
 *
 * Update an interpolated property on an element with 4 bound values surrounded by text.
 *
 * Used when the value passed to a property has 4 interpolated values in it:
 *
 * ```html
 * <div title="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ΔpropertyInterpolate4(
 * 'title', 'prefix', v0, '-', v1, '-', v2, '-', v3, 'suffix');
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ΔpropertyInterpolate4(
    propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string,
    v3: any, suffix: string, sanitizer?: SanitizerFn): TsickleIssue1009 {
  const index = getSelectedIndex();
  const interpolatedValue = Δinterpolation4(prefix, v0, i0, v1, i1, v2, i2, v3, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    elementPropertyInternal(index, propName, interpolatedValue, sanitizer);
  }
  return ΔpropertyInterpolate4;
}

/**
 *
 * Update an interpolated property on an element with 5 bound values surrounded by text.
 *
 * Used when the value passed to a property has 5 interpolated values in it:
 *
 * ```html
 * <div title="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ΔpropertyInterpolate5(
 * 'title', 'prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, 'suffix');
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param i3 Static value used for concatenation only.
 * @param v4 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ΔpropertyInterpolate5(
    propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string,
    v3: any, i3: string, v4: any, suffix: string, sanitizer?: SanitizerFn): TsickleIssue1009 {
  const index = getSelectedIndex();
  const interpolatedValue = Δinterpolation5(prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    elementPropertyInternal(index, propName, interpolatedValue, sanitizer);
  }
  return ΔpropertyInterpolate5;
}

/**
 *
 * Update an interpolated property on an element with 6 bound values surrounded by text.
 *
 * Used when the value passed to a property has 6 interpolated values in it:
 *
 * ```html
 * <div title="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}-{{v5}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ΔpropertyInterpolate6(
 *    'title', 'prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, '-', v5, 'suffix');
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param i3 Static value used for concatenation only.
 * @param v4 Value checked for change.
 * @param i4 Static value used for concatenation only.
 * @param v5 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ΔpropertyInterpolate6(
    propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string,
    v3: any, i3: string, v4: any, i4: string, v5: any, suffix: string,
    sanitizer?: SanitizerFn): TsickleIssue1009 {
  const index = getSelectedIndex();
  const interpolatedValue =
      Δinterpolation6(prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    elementPropertyInternal(index, propName, interpolatedValue, sanitizer);
  }
  return ΔpropertyInterpolate6;
}

/**
 *
 * Update an interpolated property on an element with 7 bound values surrounded by text.
 *
 * Used when the value passed to a property has 7 interpolated values in it:
 *
 * ```html
 * <div title="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}-{{v5}}-{{v6}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ΔpropertyInterpolate7(
 *    'title', 'prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, '-', v5, '-', v6, 'suffix');
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param i3 Static value used for concatenation only.
 * @param v4 Value checked for change.
 * @param i4 Static value used for concatenation only.
 * @param v5 Value checked for change.
 * @param i5 Static value used for concatenation only.
 * @param v6 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ΔpropertyInterpolate7(
    propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string,
    v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string,
    sanitizer?: SanitizerFn): TsickleIssue1009 {
  const index = getSelectedIndex();
  const interpolatedValue =
      Δinterpolation7(prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    elementPropertyInternal(index, propName, interpolatedValue, sanitizer);
  }
  return ΔpropertyInterpolate7;
}

/**
 *
 * Update an interpolated property on an element with 8 bound values surrounded by text.
 *
 * Used when the value passed to a property has 8 interpolated values in it:
 *
 * ```html
 * <div title="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}-{{v5}}-{{v6}}-{{v7}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ΔpropertyInterpolate8(
 *  'title', 'prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, '-', v5, '-', v6, '-', v7, 'suffix');
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param i3 Static value used for concatenation only.
 * @param v4 Value checked for change.
 * @param i4 Static value used for concatenation only.
 * @param v5 Value checked for change.
 * @param i5 Static value used for concatenation only.
 * @param v6 Value checked for change.
 * @param i6 Static value used for concatenation only.
 * @param v7 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ΔpropertyInterpolate8(
    propName: string, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string,
    v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any,
    suffix: string, sanitizer?: SanitizerFn): TsickleIssue1009 {
  const index = getSelectedIndex();
  const interpolatedValue =
      Δinterpolation8(prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    elementPropertyInternal(index, propName, interpolatedValue, sanitizer);
  }
  return ΔpropertyInterpolate8;
}

/**
 * Update an interpolated property on an element with 8 or more bound values surrounded by text.
 *
 * Used when the number of interpolated values exceeds 7.
 *
 * ```html
 * <div
 *  title="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}-{{v5}}-{{v6}}-{{v7}}-{{v8}}-{{v9}}suffix"></div>
 * ```
 *
 * Its compiled representation is::
 *
 * ```ts
 * ΔpropertyInterpolateV(
 *  'title', ['prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, '-', v5, '-', v6, '-', v7, '-', v9,
 *  'suffix']);
 * ```
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled.
 *
 * @param propName The name of the property to update.
 * @param values The a collection of values and the strings inbetween those values, beginning with a
 * string prefix and ending with a string suffix.
 * (e.g. `['prefix', value0, '-', value1, '-', value2, ..., value99, 'suffix']`)
 * @param sanitizer An optional sanitizer function
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ΔpropertyInterpolateV(
    propName: string, values: any[], sanitizer?: SanitizerFn): TsickleIssue1009 {
  const index = getSelectedIndex();

  const interpolatedValue = ΔinterpolationV(values);
  if (interpolatedValue !== NO_CHANGE) {
    elementPropertyInternal(index, propName, interpolatedValue, sanitizer);
  }
  return ΔpropertyInterpolateV;
}
