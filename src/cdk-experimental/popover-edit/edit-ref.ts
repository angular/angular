/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, OnDestroy, Self} from '@angular/core';
import {ControlContainer} from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import {take} from 'rxjs/operators';

import {EditEventDispatcher} from './edit-event-dispatcher';

/**
 * Used for communication between the form within the edit lens and the
 * table that launched it. Provided by CdkEditControl within the lens.
 */
@Injectable()
export class EditRef<FormValue> implements OnDestroy {
  /** Emits the final value of this edit instance before closing. */
  private readonly _finalValueSubject = new Subject<FormValue>();
  readonly finalValue: Observable<FormValue> = this._finalValueSubject.asObservable();

  /** Emits when the user tabs out of this edit lens before closing. */
  private readonly _blurredSubject = new Subject<void>();
  readonly blurred: Observable<void> = this._blurredSubject.asObservable();

  /** The value to set the form back to on revert. */
  private _revertFormValue: FormValue;

  /**
   * The flags are used to track whether a keyboard enter press is in progress at the same time
   * as other events that would cause the edit lens to close. We must track this so that the
   * Enter keyup event does not fire after we close as it would cause the edit to immediately
   * reopen.
   */
  private _enterPressed = false;
  private _closePending = false;

  constructor(
      @Self() private readonly _form: ControlContainer,
      private readonly _editEventDispatcher: EditEventDispatcher) {
    this._editEventDispatcher.setActiveEditRef(this);
  }

  /**
   * Called by the host directive's OnInit hook. Reads the initial state of the
   * form and overrides it with persisted state from previous openings, if
   * applicable.
   */
  init(previousFormValue: FormValue|undefined): void {
    // Wait for either the first value to be set, then override it with
    // the previously entered value, if any.
    this._form.valueChanges!.pipe(take(1)).subscribe(() => {
      this.updateRevertValue();

      if (previousFormValue) {
        this.reset(previousFormValue);
      }
    });
  }

  ngOnDestroy(): void {
    this._editEventDispatcher.unsetActiveEditRef(this);
    this._finalValueSubject.next(this._form.value);
    this._finalValueSubject.complete();
  }

  /** Whether the attached form is in a valid state. */
  isValid(): boolean|null {
    return this._form.valid;
  }

  /** Set the form's current value as what it will be set to on revert/reset. */
  updateRevertValue(): void {
    this._revertFormValue = this._form.value;
  }

  /** Tells the table to close the edit popup. */
  close(): void {
    this._editEventDispatcher.editing.next(null);
  }

  /** Notifies the active edit that the user has moved focus out of the lens. */
  blur(): void {
    this._blurredSubject.next();
  }

  /**
   * Closes the edit if the enter key is not down.
   * Otherwise, sets _closePending to true so that the edit will close on the
   * next enter keyup.
   */
  closeAfterEnterKeypress(): void {
    // If the enter key is currently pressed, delay closing the popup so that
    // the keyUp event does not cause it to immediately reopen.
    if (this._enterPressed) {
      this._closePending = true;
    } else {
      this.close();
    }
  }

  /**
   * Called on Enter keyup/keydown.
   * Closes the edit if pending. Otherwise just updates _enterPressed.
   */
  trackEnterPressForClose(pressed: boolean): void {
    if (this._closePending) {
      this.close();
      return;
    }

    this._enterPressed = pressed;
  }

  /**
   * Resets the form value to the specified value or the previously set
   * revert value.
   */
  reset(value?: FormValue): void {
    this._form.reset(value || this._revertFormValue);
  }
}
