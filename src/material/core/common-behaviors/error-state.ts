/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FormControl, FormGroupDirective, NgControl, NgForm} from '@angular/forms';
import {Subject} from 'rxjs';
import {ErrorStateMatcher} from '../error/error-options';
import {AbstractConstructor, Constructor} from './constructor';


/** @docs-private */
export interface CanUpdateErrorState {
  /** Emits whenever the component state changes. */
  readonly stateChanges: Subject<void>;
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
  ngControl: NgControl;
}

/**
 * Mixin to augment a directive with updateErrorState method.
 * For component with `errorState` and need to update `errorState`.
 */
export function mixinErrorState<T extends AbstractConstructor<HasErrorState>>(base: T):
  CanUpdateErrorStateCtor & T;
export function mixinErrorState<T extends Constructor<HasErrorState>>(base: T):
  CanUpdateErrorStateCtor & T {
  return class extends base {
    // This class member exists as an interop with `MatFormFieldControl` which expects
    // a public `stateChanges` observable to emit whenever the form field should be updated.
    // The description is not specifically mentioning the error state, as classes using this
    // mixin can/should emit an event in other cases too.
    /** Emits whenever the component state changes. */
    readonly stateChanges = new Subject<void>();

    /** Whether the component is in an error state. */
    errorState: boolean = false;

    /** An object used to control the error state of the component. */
    errorStateMatcher: ErrorStateMatcher;

    /** Updates the error state based on the provided error state matcher. */
    updateErrorState() {
      const oldState = this.errorState;
      const parent = this._parentFormGroup || this._parentForm;
      const matcher = this.errorStateMatcher || this._defaultErrorStateMatcher;
      const control = this.ngControl ? this.ngControl.control as FormControl : null;
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
