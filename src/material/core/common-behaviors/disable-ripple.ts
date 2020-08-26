/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Constructor, AbstractConstructor} from './constructor';

/** @docs-private */
export interface CanDisableRipple {
  /** Whether ripples are disabled. */
  disableRipple: boolean;
}

/** @docs-private */
export type CanDisableRippleCtor = Constructor<CanDisableRipple>;

/** Mixin to augment a directive with a `disableRipple` property. */
export function mixinDisableRipple<T extends AbstractConstructor<{}>>(
  base: T): CanDisableRippleCtor & T {
  abstract class Mixin extends (base as unknown as Constructor<{}>) {
    private _disableRipple: boolean = false;

    /** Whether the ripple effect is disabled or not. */
    get disableRipple() { return this._disableRipple; }
    set disableRipple(value: any) { this._disableRipple = coerceBooleanProperty(value); }

    constructor(...args: any[]) { super(...args); }
  }

  // Since we don't directly extend from `base` with it's original types, and we instruct
  // TypeScript that `T` actually is instantiatable through `new`, the types don't overlap.
  // This is a limitation in TS as abstract classes cannot be typed properly dynamically.
  return Mixin as unknown as T & CanDisableRippleCtor;
}
