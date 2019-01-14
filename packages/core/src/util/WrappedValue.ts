/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Indicates that the result of a {@link Pipe} transformation has changed even though the
 * reference has not changed.
 *
 * Wrapped values are unwrapped automatically during the change detection, and the unwrapped value
 * is stored.
 *
 * Example:
 *
 * ```
 * if (this._latestValue === this._latestReturnedValue) {
 *    return this._latestReturnedValue;
 *  } else {
 *    this._latestReturnedValue = this._latestValue;
 *    return WrappedValue.wrap(this._latestValue); // this will force update
 *  }
 * ```
 *
 * @publicApi
 */
export class WrappedValue {
  /** @deprecated from 5.3, use `unwrap()` instead - will switch to protected */
  wrapped: any;

  constructor(value: any) { this.wrapped = value; }

  /** Creates a wrapped value. */
  static wrap(value: any): WrappedValue { return new WrappedValue(value); }

  /**
   * Returns the underlying value of a wrapped value.
   * Returns the given `value` when it is not wrapped.
   **/
  static unwrap(value: any): any { return WrappedValue.isWrapped(value) ? value.wrapped : value; }

  /** Returns true if `value` is a wrapped value. */
  static isWrapped(value: any): value is WrappedValue { return value instanceof WrappedValue; }
}
