/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Constructor} from './constructor';

/** @docs-private */
export interface CanDisable {
  disabled: boolean;
}

/** Mixin to augment a directive with a `disabled` property. */
export function mixinDisabled<T extends Constructor<{}>>(base: T): Constructor<CanDisable> & T {
  return class extends base {
    private _disabled: boolean = false;

    get disabled() { return this._disabled; }
    set disabled(value: any) { this._disabled = coerceBooleanProperty(value); }

    constructor(...args: any[]) { super(...args); }
  };
}
