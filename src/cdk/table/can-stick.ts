/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';

/** @docs-private */
export type Constructor<T> = new(...args: any[]) => T;

/**
 * Interface for a mixin to provide a directive with a function that checks if the sticky input has
 * been changed since the last time the function was called. Essentially adds a dirty-check to the
 * sticky value.
 * @docs-private
 */
export interface CanStick {
  /** Whether sticky positioning should be applied. */
  sticky: boolean;

  /** Whether the sticky input has changed since it was last checked. */
  _hasStickyChanged: boolean;

  /** Whether the sticky value has changed since this was last called. */
  hasStickyChanged(): boolean;

  /** Resets the dirty check for cases where the sticky state has been used without checking. */
  resetStickyChanged(): void;
}

/** @docs-private */
export type CanStickCtor = Constructor<CanStick>;

/**
 * Mixin to provide a directive with a function that checks if the sticky input has been
 * changed since the last time the function was called. Essentially adds a dirty-check to the
 * sticky value.
 * @docs-private
 */
export function mixinHasStickyInput<T extends Constructor<{}>>(base: T): CanStickCtor & T {
  return class extends base {
    /** Whether sticky positioning should be applied. */
    get sticky(): boolean { return this._sticky; }
    set sticky(v: boolean) {
      const prevValue = this._sticky;
      this._sticky = coerceBooleanProperty(v);
      this._hasStickyChanged = prevValue !== this._sticky;
    }
    _sticky: boolean = false;

    /** Whether the sticky input has changed since it was last checked. */
    _hasStickyChanged: boolean = false;

    /** Whether the sticky value has changed since this was last called. */
    hasStickyChanged(): boolean {
      const hasStickyChanged = this._hasStickyChanged;
      this._hasStickyChanged = false;
      return hasStickyChanged;
    }

    /** Resets the dirty check for cases where the sticky state has been used without checking. */
    resetStickyChanged() {
      this._hasStickyChanged = false;
    }

    constructor(...args: any[]) { super(...args); }
  };
}
