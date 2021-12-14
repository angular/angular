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
export interface CanDisable {
  /** Whether the component is disabled. */
  disabled: boolean;
}

type CanDisableCtor = Constructor<CanDisable> & AbstractConstructor<CanDisable>;

/** Mixin to augment a directive with a `disabled` property. */
export function mixinDisabled<T extends AbstractConstructor<{}>>(base: T): CanDisableCtor & T;
export function mixinDisabled<T extends Constructor<{}>>(base: T): CanDisableCtor & T {
  return class extends base {
    private _disabled: boolean = false;

    get disabled(): boolean {
      return this._disabled;
    }
    set disabled(value: any) {
      this._disabled = coerceBooleanProperty(value);
    }

    constructor(...args: any[]) {
      super(...args);
    }
  };
}
