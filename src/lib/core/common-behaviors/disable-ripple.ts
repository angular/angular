/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Constructor} from './constructor';

/** @docs-private */
export interface CanDisableRipple {
  disableRipple: boolean;
}

/** Mixin to augment a directive with a `disableRipple` property. */
export function mixinDisableRipple<T extends Constructor<{}>>(base: T)
    : Constructor<CanDisableRipple> & T {
  return class extends base {
    private _disableRipple: boolean = false;

    /** Whether the ripple effect is disabled or not. */
    get disableRipple() { return this._disableRipple; }
    set disableRipple(value: any) { this._disableRipple = coerceBooleanProperty(value); }

    constructor(...args: any[]) { super(...args); }
  };
}
