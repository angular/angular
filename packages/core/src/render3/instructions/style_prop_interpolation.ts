/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NO_CHANGE} from '../tokens';
import {ɵɵinterpolation1, ɵɵinterpolation2, ɵɵinterpolation3, ɵɵinterpolation4, ɵɵinterpolation5, ɵɵinterpolation6, ɵɵinterpolation7, ɵɵinterpolation8, ɵɵinterpolationV} from './interpolation';
import {TsickleIssue1009} from './shared';
import {ɵɵstyleProp} from './styling';


/**
 *
 * Update an interpolated style property on an element with single bound value surrounded by text.
 *
 * Used when the value passed to a property has 1 interpolated value in it:
 *
 * ```html
 * <div style.color="prefix{{v0}}suffix"></div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵstylePropInterpolate1(0, 'prefix', v0, 'suffix');
 * ```
 *
 * @param styleIndex Index of style to update. This index value refers to the
 *        index of the style in the style bindings array that was passed into
 *        `styling`.
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param valueSuffix Optional suffix. Used with scalar values to add unit such as `px`.
 * @param forceOverride Whether or not to update the styling value immediately.
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵstylePropInterpolate1(
    styleIndex: number, prefix: string, v0: any, suffix: string, valueSuffix?: string | null,
    forceOverride?: boolean): TsickleIssue1009 {
  // TODO(FW-1340): Refactor to remove the use of other instructions here.
  const interpolatedValue = ɵɵinterpolation1(prefix, v0, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    ɵɵstyleProp(styleIndex, interpolatedValue as string, valueSuffix, forceOverride);
  }
  return ɵɵstylePropInterpolate1;
}

/**
 *
 * Update an interpolated style property on an element with 2 bound values surrounded by text.
 *
 * Used when the value passed to a property has 2 interpolated values in it:
 *
 * ```html
 * <div style.color="prefix{{v0}}-{{v1}}suffix"></div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵstylePropInterpolate2(0, 'prefix', v0, '-', v1, 'suffix');
 * ```
 *
 * @param styleIndex Index of style to update. This index value refers to the
 *        index of the style in the style bindings array that was passed into
 *        `styling`.
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param valueSuffix Optional suffix. Used with scalar values to add unit such as `px`.
 * @param forceOverride Whether or not to update the styling value immediately.
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵstylePropInterpolate2(
    styleIndex: number, prefix: string, v0: any, i0: string, v1: any, suffix: string,
    valueSuffix?: string | null, forceOverride?: boolean): TsickleIssue1009 {
  // TODO(FW-1340): Refactor to remove the use of other instructions here.
  const interpolatedValue = ɵɵinterpolation2(prefix, v0, i0, v1, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    ɵɵstyleProp(styleIndex, interpolatedValue as string, valueSuffix, forceOverride);
  }
  return ɵɵstylePropInterpolate2;
}

/**
 *
 * Update an interpolated style property on an element with 3 bound values surrounded by text.
 *
 * Used when the value passed to a property has 3 interpolated values in it:
 *
 * ```html
 * <div style.color="prefix{{v0}}-{{v1}}-{{v2}}suffix"></div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵstylePropInterpolate3(0, 'prefix', v0, '-', v1, '-', v2, 'suffix');
 * ```
 *
 * @param styleIndex Index of style to update. This index value refers to the
 *        index of the style in the style bindings array that was passed into
 *        `styling`.
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param valueSuffix Optional suffix. Used with scalar values to add unit such as `px`.
 * @param forceOverride Whether or not to update the styling value immediately.
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵstylePropInterpolate3(
    styleIndex: number, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any,
    suffix: string, valueSuffix?: string | null, forceOverride?: boolean): TsickleIssue1009 {
  // TODO(FW-1340): Refactor to remove the use of other instructions here.
  const interpolatedValue = ɵɵinterpolation3(prefix, v0, i0, v1, i1, v2, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    ɵɵstyleProp(styleIndex, interpolatedValue as string, valueSuffix, forceOverride);
  }
  return ɵɵstylePropInterpolate3;
}

/**
 *
 * Update an interpolated style property on an element with 4 bound values surrounded by text.
 *
 * Used when the value passed to a property has 4 interpolated values in it:
 *
 * ```html
 * <div style.color="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}suffix"></div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵstylePropInterpolate4(0, 'prefix', v0, '-', v1, '-', v2, '-', v3, 'suffix');
 * ```
 *
 * @param styleIndex Index of style to update. This index value refers to the
 *        index of the style in the style bindings array that was passed into
 *        `styling`.
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @param valueSuffix Optional suffix. Used with scalar values to add unit such as `px`.
 * @param forceOverride Whether or not to update the styling value immediately.
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵstylePropInterpolate4(
    styleIndex: number, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any,
    i2: string, v3: any, suffix: string, valueSuffix?: string | null,
    forceOverride?: boolean): TsickleIssue1009 {
  // TODO(FW-1340): Refactor to remove the use of other instructions here.
  const interpolatedValue = ɵɵinterpolation4(prefix, v0, i0, v1, i1, v2, i2, v3, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    ɵɵstyleProp(styleIndex, interpolatedValue as string, valueSuffix, forceOverride);
  }
  return ɵɵstylePropInterpolate4;
}

/**
 *
 * Update an interpolated style property on an element with 5 bound values surrounded by text.
 *
 * Used when the value passed to a property has 5 interpolated values in it:
 *
 * ```html
 * <div style.color="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}suffix"></div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵstylePropInterpolate5(0, 'prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, 'suffix');
 * ```
 *
 * @param styleIndex Index of style to update. This index value refers to the
 *        index of the style in the style bindings array that was passed into
 *        `styling`.
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
 * @param valueSuffix Optional suffix. Used with scalar values to add unit such as `px`.
 * @param forceOverride Whether or not to update the styling value immediately.
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵstylePropInterpolate5(
    styleIndex: number, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any,
    i2: string, v3: any, i3: string, v4: any, suffix: string, valueSuffix?: string | null,
    forceOverride?: boolean): TsickleIssue1009 {
  // TODO(FW-1340): Refactor to remove the use of other instructions here.
  const interpolatedValue = ɵɵinterpolation5(prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    ɵɵstyleProp(styleIndex, interpolatedValue as string, valueSuffix, forceOverride);
  }
  return ɵɵstylePropInterpolate5;
}

/**
 *
 * Update an interpolated style property on an element with 6 bound values surrounded by text.
 *
 * Used when the value passed to a property has 6 interpolated values in it:
 *
 * ```html
 * <div style.color="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}-{{v5}}suffix"></div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵstylePropInterpolate6(0, 'prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, '-', v5, 'suffix');
 * ```
 *
 * @param styleIndex Index of style to update. This index value refers to the
 *        index of the style in the style bindings array that was passed into
 *        `styling`.
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
 * @param valueSuffix Optional suffix. Used with scalar values to add unit such as `px`.
 * @param forceOverride Whether or not to update the styling value immediately.
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵstylePropInterpolate6(
    styleIndex: number, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any,
    i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix: string,
    valueSuffix?: string | null, forceOverride?: boolean): TsickleIssue1009 {
  // TODO(FW-1340): Refactor to remove the use of other instructions here.
  const interpolatedValue =
      ɵɵinterpolation6(prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    ɵɵstyleProp(styleIndex, interpolatedValue as string, valueSuffix, forceOverride);
  }
  return ɵɵstylePropInterpolate6;
}

/**
 *
 * Update an interpolated style property on an element with 7 bound values surrounded by text.
 *
 * Used when the value passed to a property has 7 interpolated values in it:
 *
 * ```html
 * <div style.color="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}-{{v5}}-{{v6}}suffix"></div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵstylePropInterpolate7(
 *    0, 'prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, '-', v5, '-', v6, 'suffix');
 * ```
 *
 * @param styleIndex Index of style to update. This index value refers to the
 *        index of the style in the style bindings array that was passed into
 *        `styling`.
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
 * @param valueSuffix Optional suffix. Used with scalar values to add unit such as `px`.
 * @param forceOverride Whether or not to update the styling value immediately.
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵstylePropInterpolate7(
    styleIndex: number, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any,
    i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any,
    suffix: string, valueSuffix?: string | null, forceOverride?: boolean): TsickleIssue1009 {
  // TODO(FW-1340): Refactor to remove the use of other instructions here.
  const interpolatedValue =
      ɵɵinterpolation7(prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    ɵɵstyleProp(styleIndex, interpolatedValue as string, valueSuffix, forceOverride);
  }
  return ɵɵstylePropInterpolate7;
}

/**
 *
 * Update an interpolated style property on an element with 8 bound values surrounded by text.
 *
 * Used when the value passed to a property has 8 interpolated values in it:
 *
 * ```html
 * <div style.color="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}-{{v5}}-{{v6}}-{{v7}}suffix"></div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵstylePropInterpolate8(0, 'prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, '-', v5, '-', v6,
 * '-', v7, 'suffix');
 * ```
 *
 * @param styleIndex Index of style to update. This index value refers to the
 *        index of the style in the style bindings array that was passed into
 *        `styling`.
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
 * @param valueSuffix Optional suffix. Used with scalar values to add unit such as `px`.
 * @param forceOverride Whether or not to update the styling value immediately.
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵstylePropInterpolate8(
    styleIndex: number, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any,
    i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string,
    v7: any, suffix: string, valueSuffix?: string | null,
    forceOverride?: boolean): TsickleIssue1009 {
  // TODO(FW-1340): Refactor to remove the use of other instructions here.
  const interpolatedValue =
      ɵɵinterpolation8(prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    ɵɵstyleProp(styleIndex, interpolatedValue as string, valueSuffix, forceOverride);
  }
  return ɵɵstylePropInterpolate8;
}

/**
 * Update an interpolated style property on an element with 8 or more bound values surrounded by
 * text.
 *
 * Used when the number of interpolated values exceeds 7.
 *
 * ```html
 * <div
 *  style.color="prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}-{{v5}}-{{v6}}-{{v7}}-{{v8}}-{{v9}}suffix">
 * </div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵstylePropInterpolateV(
 *  0, ['prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, '-', v5, '-', v6, '-', v7, '-', v9,
 *  'suffix']);
 * ```
 *
 * @param styleIndex Index of style to update. This index value refers to the
 *        index of the style in the style bindings array that was passed into
 *        `styling`..
 * @param values The a collection of values and the strings in-between those values, beginning with
 * a string prefix and ending with a string suffix.
 * (e.g. `['prefix', value0, '-', value1, '-', value2, ..., value99, 'suffix']`)
 * @param valueSuffix Optional suffix. Used with scalar values to add unit such as `px`.
 * @param forceOverride Whether or not to update the styling value immediately.
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
export function ɵɵstylePropInterpolateV(
    styleIndex: number, values: any[], valueSuffix?: string | null,
    forceOverride?: boolean): TsickleIssue1009 {
  // TODO(FW-1340): Refactor to remove the use of other instructions here.
  const interpolated = ɵɵinterpolationV(values);
  if (interpolated !== NO_CHANGE) {
    ɵɵstyleProp(styleIndex, interpolated as string, valueSuffix, forceOverride);
  }
  return ɵɵstylePropInterpolateV;
}
