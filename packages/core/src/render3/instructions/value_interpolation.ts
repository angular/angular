/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {bindingUpdated} from '../bindings';
import {getLView, nextBindingIndex} from '../state';
import {NO_CHANGE} from '../tokens';
import {renderStringify} from '../util/stringify_utils';
import {
  interpolation1,
  interpolation2,
  interpolation3,
  interpolation4,
  interpolation5,
  interpolation6,
  interpolation7,
  interpolation8,
  interpolationV,
} from './interpolation';

/**
 * Interpolate a value with a single bound value and no prefixes or suffixes.
 *
 * @param v0 Value checked for change.
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
export function ɵɵinterpolate(v0: any): string | NO_CHANGE {
  // Avoid calling into the `interpolate` functions since
  // we know that we don't have a prefix or suffix.
  return bindingUpdated(getLView(), nextBindingIndex(), v0) ? renderStringify(v0) : NO_CHANGE;
}

/**
 * Interpolate a value with a single bound value.
 *
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
export function ɵɵinterpolate1(prefix: string, v0: any, suffix = ''): string | NO_CHANGE {
  return interpolation1(getLView(), prefix, v0, suffix);
}

/**
 * Interpolate a value with two bound values.
 *
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
export function ɵɵinterpolate2(
  prefix: string,
  v0: any,
  i0: string,
  v1: any,
  suffix = '',
): string | NO_CHANGE {
  return interpolation2(getLView(), prefix, v0, i0, v1, suffix);
}

/**
 * Interpolate a value with three bound values.
 *
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
export function ɵɵinterpolate3(
  prefix: string,
  v0: any,
  i0: string,
  v1: any,
  i1: string,
  v2: any,
  suffix = '',
): string | NO_CHANGE {
  return interpolation3(getLView(), prefix, v0, i0, v1, i1, v2, suffix);
}

/**
 * Interpolate a value with four bound values.
 *
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
export function ɵɵinterpolate4(
  prefix: string,
  v0: any,
  i0: string,
  v1: any,
  i1: string,
  v2: any,
  i2: string,
  v3: any,
  suffix = '',
): string | NO_CHANGE {
  return interpolation4(getLView(), prefix, v0, i0, v1, i1, v2, i2, v3, suffix);
}

/**
 * Interpolate a value with five bound values.
 *
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
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
export function ɵɵinterpolate5(
  prefix: string,
  v0: any,
  i0: string,
  v1: any,
  i1: string,
  v2: any,
  i2: string,
  v3: any,
  i3: string,
  v4: any,
  suffix = '',
): string | NO_CHANGE {
  return interpolation5(getLView(), prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, suffix);
}

/**
 * Interpolate a value with six bound values.
 *
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
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
export function ɵɵinterpolate6(
  prefix: string,
  v0: any,
  i0: string,
  v1: any,
  i1: string,
  v2: any,
  i2: string,
  v3: any,
  i3: string,
  v4: any,
  i4: string,
  v5: any,
  suffix = '',
): string | NO_CHANGE {
  return interpolation6(getLView(), prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix);
}

/**
 * Interpolate a value with seven bound values.
 *
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
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
export function ɵɵinterpolate7(
  prefix: string,
  v0: any,
  i0: string,
  v1: any,
  i1: string,
  v2: any,
  i2: string,
  v3: any,
  i3: string,
  v4: any,
  i4: string,
  v5: any,
  i5: string,
  v6: any,
  suffix = '',
): string | NO_CHANGE {
  return interpolation7(
    getLView(),
    prefix,
    v0,
    i0,
    v1,
    i1,
    v2,
    i2,
    v3,
    i3,
    v4,
    i4,
    v5,
    i5,
    v6,
    suffix,
  );
}

/**
 * Interpolate a value with eight bound values.
 *
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
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
export function ɵɵinterpolate8(
  prefix: string,
  v0: any,
  i0: string,
  v1: any,
  i1: string,
  v2: any,
  i2: string,
  v3: any,
  i3: string,
  v4: any,
  i4: string,
  v5: any,
  i5: string,
  v6: any,
  i6: string,
  v7: any,
  suffix = '',
): string | NO_CHANGE {
  return interpolation8(
    getLView(),
    prefix,
    v0,
    i0,
    v1,
    i1,
    v2,
    i2,
    v3,
    i3,
    v4,
    i4,
    v5,
    i5,
    v6,
    i6,
    v7,
    suffix,
  );
}

/**
 * Interpolate a value with nine or more bound values.
 *
 * @param values The collection of values and the strings in-between those values, beginning with
 * a string prefix and ending with a string suffix.
 * (e.g. `['prefix', value0, '-', value1, '-', value2, ..., value99, 'suffix']`)
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
export function ɵɵinterpolateV(values: unknown[]): string | NO_CHANGE {
  return interpolationV(getLView(), values);
}
