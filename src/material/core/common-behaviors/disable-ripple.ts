/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {AbstractConstructor, Constructor} from './constructor';

/** @docs-private */
export interface CanDisableRipple {
  /** Whether ripples are disabled. */
  disableRipple: boolean;
}

type CanDisableRippleCtor = Constructor<CanDisableRipple> & AbstractConstructor<CanDisableRipple>;

/** Mixin to augment a directive with a `disableRipple` property. */
export function mixinDisableRipple<T extends AbstractConstructor<{}>>(
  base: T,
): CanDisableRippleCtor & T;
export function mixinDisableRipple<T extends Constructor<{}>>(base: T): CanDisableRippleCtor & T {
  return class extends base {
    private _disableRipple: boolean = false;

    /** Whether the ripple effect is disabled or not. */
    get disableRipple(): boolean {
      return this._disableRipple;
    }
    set disableRipple(value: any) {
      this._disableRipple = coerceBooleanProperty(value);
    }

    constructor(...args: any[]) {
      super(...args);
    }
  };
}
