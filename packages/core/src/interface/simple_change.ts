/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Represents a basic change from a previous to a new value for a single
 * property on a directive instance. Passed as a value in a
 * {@link SimpleChanges} object to the `ngOnChanges` hook.
 *
 * @see {@link OnChanges}
 *
 * @publicApi
 */
export class SimpleChange {
  constructor(
    public previousValue: any,
    public currentValue: any,
    public firstChange: boolean,
  ) {}
  /**
   * Check whether the new value is the first value assigned.
   */
  isFirstChange(): boolean {
    return this.firstChange;
  }
}

/**
 * A hashtable of changes represented by {@link SimpleChange} objects stored
 * at the declared property name they belong to on a Directive or Component. This is
 * the type passed to the `ngOnChanges` hook.
 *
 * @see {@link OnChanges}
 *
 * @publicApi
 */
export interface SimpleChanges {
  [propName: string]: SimpleChange;
}
