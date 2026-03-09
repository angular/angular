/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ɵINPUT_SIGNAL_BRAND_READ_TYPE} from '../authoring/input/input_signal';

/**
 * Represents a basic change from a previous to a new value for a single
 * property on a directive instance. Passed as a value in a
 * {@link SimpleChanges} object to the `ngOnChanges` hook.
 *
 * @see {@link OnChanges}
 *
 * @publicApi
 */
export type SimpleChange<T = any> =
  | {
      previousValue: T;
      currentValue: T;
      firstChange: false;
      isFirstChange(): false;
    }
  | {
      previousValue: T | undefined;
      currentValue: T;
      firstChange: true;
      isFirstChange(): boolean;
    };

export interface ɵSimpleChangeCtor {
  new (previousValue: unknown, currentValue: unknown, firstChange: boolean): SimpleChange<any>;
}

export const SimpleChange: ɵSimpleChangeCtor = class SimpleChange {
  constructor(
    public previousValue: unknown,
    public currentValue: unknown,
    public firstChange: boolean,
  ) {}

  isFirstChange(): boolean {
    return this.firstChange;
  }
} as ɵSimpleChangeCtor;

/**
 * A hashtable of changes represented by {@link SimpleChange} objects stored
 * at the declared property name they belong to on a Directive or Component. This is
 * the type passed to the `ngOnChanges` hook. Pass the current class or `this` as the
 * first generic argument for stronger type checking (e.g. `SimpleChanges<YourComponent>`).
 *
 * @see {@link OnChanges}
 *
 * @see [Inspecting changes](guide/components/lifecycle#inspecting-changes)
 *
 * @publicApi
 */
export type SimpleChanges<T = unknown> = T extends object
  ? {
      [Key in keyof T]?: SimpleChange<
        T[Key] extends {[ɵINPUT_SIGNAL_BRAND_READ_TYPE]: infer V} ? V : T[Key]
      >;
    }
  : {
      [propName: string]: SimpleChange; // Backwards-compatible signature.
    };
