/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EventEmitter, forwardRef, Inject, Input, OnChanges, OnDestroy, Optional, Output, Provider, Self, SimpleChanges,} from '@angular/core';

import {FormArray} from '../../model/form_array';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../../validators';
import {ControlContainer} from '../control_container';
import {CALL_SET_DISABLED_STATE, SetDisabledStateOption, syncPendingControls,} from '../shared';
import {AsyncValidator, AsyncValidatorFn, Validator, ValidatorFn} from '../validators';

import {AbstractFormDirective} from './abstract_form.directive';

const formDirectiveProvider: Provider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FormArrayDirective),
};

/**
 * @description
 *
 * Binds an existing `FormArray` to a DOM element.
 *
 * This directive accepts an existing `FormArray` instance. It will then use this
 * `FormArray` instance to match any child `FormControl`, `FormGroup`/`FormRecord`,
 * and `FormArray` instances to child `FormControlName`, `FormGroupName`,
 * and `FormArrayName` directives.
 *
 * @see [Reactive Forms Guide](guide/reactive-forms)
 * @see `AbstractControl`
 *
 * @usageNotes
 * ### Register Form Group
 *
 * The following example registers a `FormArray` with first name and last name controls,
 * and listens for the *ngSubmit* event when the button is clicked.
 *
 * {@example forms/ts/simpleFormGroup/simple_form_group_example.ts region='Component'}
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
@Directive({
  selector: '[formArray]',
  providers: [formDirectiveProvider],
  host: {'(submit)': 'onSubmit($event)', '(reset)': 'onReset()'},
  exportAs: 'ngForm',
})
export class FormArrayDirective extends AbstractFormDirective<FormArray> implements OnChanges,
                                                                                    OnDestroy {
  /**
   * Callback that should be invoked when controls in FormArray or FormArray collection change
   * (added or removed). This callback triggers corresponding DOM updates.
   *
   * @internal
   */
  override readonly _onCollectionChange = () => this._updateDomValue();

  /**
   * @description
   * Tracks the `FormArray` bound to this directive.
   */
  @Input('formArray') override form: FormArray = null!;

  /**
   * @description
   * Emits an event when the form submission has been triggered.
   */
  @Output() override ngSubmit = new EventEmitter();

  constructor(
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator|ValidatorFn)[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators:
          (AsyncValidator|AsyncValidatorFn)[],
      @Optional() @Inject(CALL_SET_DISABLED_STATE) callSetDisabledState?: SetDisabledStateOption) {
    super(validators, asyncValidators, callSetDisabledState);
  }

  /** @nodoc */
  ngOnChanges(changes: SimpleChanges): void {
    this.onChanges(changes);
  }

  /** @nodoc */
  ngOnDestroy() {
    this.onDestroy();
  }

  /**
   * @description
   * Method called with the "submit" event is triggered on the form.
   * Triggers the `ngSubmit` emitter to emit the "submit" event as its payload.
   *
   * @param $event The "submit" event object
   */
  onSubmit($event: Event): boolean {
    (this as {submitted: boolean}).submitted = true;
    syncPendingControls(this.form, this.directives);
    this.ngSubmit.emit($event);
    // Forms with `method="dialog"` have some special behavior that won't reload the page and that
    // shouldn't be prevented. Note that we need to null check the `event` and the `target`, because
    // some internal apps call this method directly with the wrong arguments.
    return ($event?.target as HTMLFormElement | null)?.method === 'dialog';
  }
}
