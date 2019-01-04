/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Represents a basic change from a previous to a new value.
 *
 * @publicApi
 */
export class SimpleChange {
  constructor(public previousValue: any, public currentValue: any, public firstChange: boolean) {}
  /**
   * Check whether the new value is the first value assigned.
   */
  isFirstChange(): boolean { return this.firstChange; }
}

/**
 * Defines an object that associates properties with
 * instances of `SimpleChange`.
 *
 * @see `OnChanges`
 *
 * @publicApi
 */
export interface SimpleChanges { [propName: string]: SimpleChange; }
