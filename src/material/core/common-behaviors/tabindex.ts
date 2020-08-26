/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceNumberProperty} from '@angular/cdk/coercion';
import {Constructor, AbstractConstructor} from './constructor';
import {CanDisable} from './disabled';


/** @docs-private */
export interface HasTabIndex {
  /** Tabindex of the component. */
  tabIndex: number;

  /** Tabindex to which to fall back to if no value is set. */
  defaultTabIndex: number;
}

/** @docs-private */
export type HasTabIndexCtor = Constructor<HasTabIndex>;

/** Mixin to augment a directive with a `tabIndex` property. */
export function mixinTabIndex<T extends AbstractConstructor<CanDisable>>(
  base: T, defaultTabIndex = 0): HasTabIndexCtor & T {
  // Note: We cast `base` to `unknown` and then `Constructor`. It could be an abstract class,
  // but given we `extend` it from another class, we can assume a constructor being accessible.
  abstract class Mixin extends (base as unknown as Constructor<CanDisable>) {
    private _tabIndex: number = defaultTabIndex;
    defaultTabIndex = defaultTabIndex;

    get tabIndex(): number { return this.disabled ? -1 : this._tabIndex; }
    set tabIndex(value: number) {
      // If the specified tabIndex value is null or undefined, fall back to the default value.
      this._tabIndex = value != null ? coerceNumberProperty(value) : this.defaultTabIndex;
    }

    constructor(...args: any[]) {
      super(...args);
    }
  }

  // Since we don't directly extend from `base` with it's original types, and we instruct
  // TypeScript that `T` actually is instantiatable through `new`, the types don't overlap.
  // This is a limitation in TS as abstract classes cannot be typed properly dynamically.
  return Mixin as unknown as T & Constructor<HasTabIndex>;
}
