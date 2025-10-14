/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { LView } from '../interfaces/view';
import { NO_CHANGE } from '../tokens';
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
 */
export declare function interpolationV(lView: LView, values: any[]): string | NO_CHANGE;
/**
 * Creates an interpolation binding with 1 expression.
 *
 * @param prefix static value used for concatenation only.
 * @param v0 value checked for change.
 * @param suffix static value used for concatenation only.
 */
export declare function interpolation1(lView: LView, prefix: string, v0: any, suffix?: string): string | NO_CHANGE;
/**
 * Creates an interpolation binding with 2 expressions.
 */
export declare function interpolation2(lView: LView, prefix: string, v0: any, i0: string, v1: any, suffix?: string): string | NO_CHANGE;
/**
 * Creates an interpolation binding with 3 expressions.
 */
export declare function interpolation3(lView: LView, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix?: string): string | NO_CHANGE;
/**
 * Create an interpolation binding with 4 expressions.
 */
export declare function interpolation4(lView: LView, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix?: string): string | NO_CHANGE;
/**
 * Creates an interpolation binding with 5 expressions.
 */
export declare function interpolation5(lView: LView, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix?: string): string | NO_CHANGE;
/**
 * Creates an interpolation binding with 6 expressions.
 */
export declare function interpolation6(lView: LView, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix?: string): string | NO_CHANGE;
/**
 * Creates an interpolation binding with 7 expressions.
 */
export declare function interpolation7(lView: LView, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix?: string): string | NO_CHANGE;
/**
 * Creates an interpolation binding with 8 expressions.
 */
export declare function interpolation8(lView: LView, prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix?: string): string | NO_CHANGE;
