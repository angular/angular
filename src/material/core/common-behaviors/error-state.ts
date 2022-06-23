/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbstractControl, FormGroupDirective, NgControl, NgForm} from '@angular/forms';
import {Subject} from 'rxjs';
import {ErrorStateMatcher} from '../error/error-options';
import {AbstractConstructor, Constructor} from './constructor';

/** @docs-private */
export interface CanUpdateErrorState {
  /** Updates the error state based on the provided error state matcher. */
  updateErrorState(): void;
  /** Whether the component is in an error state. */
  errorState: boolean;
  /** An object used to control the error state of the component. */
  errorStateMatcher: ErrorStateMatcher;
}

type CanUpdateErrorStateCtor = Constructor<CanUpdateErrorState> &
  AbstractConstructor<CanUpdateErrorState>;

/** @docs-private */
export interface HasErrorState {
  _parentFormGroup: FormGroupDirective;
  _parentForm: NgForm;
  _defaultErrorStateMatcher: ErrorStateMatcher;

  // These properties are defined as per the `MatFormFieldControl` interface. Since
  // this mixin is commonly used with custom form-field controls, we respect the
  // properties (also with the public name they need according to `MatFormFieldControl`).
  ngControl: NgControl;
  stateChanges: Subject<void>;
}

/**
 * Mixin to augment a directive with updateErrorState method.
 * For component with `errorState` and need to update `errorState`.
 */
export function mixinErrorState<T extends AbstractConstructor<HasErrorState>>(
  base: T,
): CanUpdateErrorStateCtor & T;
export function mixinErrorState<T extends Constructor<HasErrorState>>(
  base: T,
): CanUpdateErrorStateCtor & T {
  return class extends base {
    /** Whether the component is in an error state. */
    errorState: boolean = false;

    /** An object used to control the error state of the component. */
    errorStateMatcher: ErrorStateMatcher;

    /** Updates the error state based on the provided error state matcher. */
    updateErrorState() {
      const oldState = this.errorState;
      const parent = this._parentFormGroup || this._parentForm;
      const matcher = this.errorStateMatcher || this._defaultErrorStateMatcher;
      const control = this.ngControl ? (this.ngControl.control as AbstractControl) : null;
      const newState = matcher.isErrorState(control, parent);

      if (newState !== oldState) {
        this.errorState = newState;
        this.stateChanges.next();
      }
    }

    constructor(...args: any[]) {
      super(...args);
    }
  };
}
