/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {InjectionToken} from '@angular/core';
import {FocusTrap} from './focus-trap';

/** The injection token used to specify the inert strategy. */
export const FOCUS_TRAP_INERT_STRATEGY = new InjectionToken<FocusTrapInertStrategy>(
  'FOCUS_TRAP_INERT_STRATEGY',
);

/**
 * A strategy that dictates how FocusTrap should prevent elements
 * outside of the FocusTrap from being focused.
 */
export interface FocusTrapInertStrategy {
  /** Makes all elements outside focusTrap unfocusable. */
  preventFocus(focusTrap: FocusTrap): void;
  /** Reverts elements made unfocusable by preventFocus to their previous state. */
  allowFocus(focusTrap: FocusTrap): void;
}
