/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  computed,
  Directive,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  Provider,
  Self,
  signal,
  SimpleChanges,
  untracked,
  ɵWritable as Writable,
} from '@angular/core';

import {FormArray} from '../../model/form_array';
import {FormControl, isFormControl} from '../../model/form_control';
import {FormGroup} from '../../model/form_group';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../../validators';
import {ControlContainer} from '../control_container';
import {Form} from '../form_interface';
import {missingFormException} from '../reactive_errors';
import {
  CALL_SET_DISABLED_STATE,
  cleanUpControl,
  cleanUpFormContainer,
  cleanUpValidators,
  removeListItem,
  SetDisabledStateOption,
  setUpControl,
  setUpFormContainer,
  setUpValidators,
  syncPendingControls,
} from '../shared';
import {AsyncValidator, AsyncValidatorFn, Validator, ValidatorFn} from '../validators';

import type {FormControlName} from './form_control_name';
import type {FormArrayName, FormGroupName} from './form_group_name';
import {FormResetEvent, FormSubmittedEvent} from '../../model/abstract_model';

const formDirectiveProvider: Provider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FormGroupDirective),
};

/**
 * @description
 *
 * Binds an existing `FormGroup` or `FormRecord` to a DOM element.
 *
 * This directive accepts an existing `FormGroup` instance. It will then use this
 * `FormGroup` instance to match any child `FormControl`, `FormGroup`/`FormRecord`,
 * and `FormArray` instances to child `FormControlName`, `FormGroupName`,
 * and `FormArrayName` directives.
 *
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
 * @see {@link AbstractControl}
 *
 * @usageNotes
 * ### Register Form Group
 *
 * The following example registers a `FormGroup` with first name and last name controls,
 * and listens for the *ngSubmit* event when the button is clicked.
 *
 * {@example forms/ts/simpleFormGroup/simple_form_group_example.ts region='Component'}
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
@Directive({
  selector: '[formGroup]',
  providers: [formDirectiveProvider],
  host: {'(submit)': 'onSubmit($event)', '(reset)': 'onReset()'},
  exportAs: 'ngForm',
  standalone: false,
})
export class FormGroupDirective extends ControlContainer implements Form, OnChanges, OnDestroy {
  /**
   * @description
   * Reports whether the form submission has been triggered.
   */
  get submitted() {
    return untracked(this._submittedReactive);
  }
  // TODO(atscott): Remove once invalid API usage is cleaned up internally
  private set submitted(value: boolean) {
    this._submittedReactive.set(value);
  }
  /** @internal */
  readonly _submitted = computed(() => this._submittedReactive());
  private readonly _submittedReactive = signal(false);

  /**
   * Reference to an old form group input value, which is needed to cleanup
   * old instance in case it was replaced with a new one.
   */
  private _oldForm: FormGroup | undefined;

  /**
   * Callback that should be invoked when controls in FormGroup or FormArray collection change
   * (added or removed). This callback triggers corresponding DOM updates.
   */
  private readonly _onCollectionChange = () => this._updateDomValue();

  /**
   * @description
   * Tracks the list of added `FormControlName` instances
   */
  directives: FormControlName[] = [];

  /**
   * @description
   * Tracks the `FormGroup` bound to this directive.
   */
  @Input('formGroup') form: FormGroup = null!;

  /**
   * @description
   * Emits an event when the form submission has been triggered.
   */
  @Output() ngSubmit = new EventEmitter();

  constructor(
    @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator | ValidatorFn)[],
    @Optional()
    @Self()
    @Inject(NG_ASYNC_VALIDATORS)
    asyncValidators: (AsyncValidator | AsyncValidatorFn)[],
    @Optional()
    @Inject(CALL_SET_DISABLED_STATE)
    private callSetDisabledState?: SetDisabledStateOption,
  ) {
    super();
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
  }

  /** @nodoc */
  ngOnChanges(changes: SimpleChanges): void {
    this._checkFormPresent();
    if (changes.hasOwnProperty('form')) {
      this._updateValidators();
      this._updateDomValue();
      this._updateRegistrations();
      this._oldForm = this.form;
    }
  }

  /** @nodoc */
  ngOnDestroy() {
    if (this.form) {
      cleanUpValidators(this.form, this);

      // Currently the `onCollectionChange` callback is rewritten each time the
      // `_registerOnCollectionChange` function is invoked. The implication is that cleanup should
      // happen *only* when the `onCollectionChange` callback was set by this directive instance.
      // Otherwise it might cause overriding a callback of some other directive instances. We should
      // consider updating this logic later to make it similar to how `onChange` callbacks are
      // handled, see https://github.com/angular/angular/issues/39732 for additional info.
      if (this.form._onCollectionChange === this._onCollectionChange) {
        this.form._registerOnCollectionChange(() => {});
      }
    }
  }

  /**
   * @description
   * Returns this directive's instance.
   */
  override get formDirective(): Form {
    return this;
  }

  /**
   * @description
   * Returns the `FormGroup` bound to this directive.
   */
  override get control(): FormGroup {
    return this.form;
  }

  /**
   * @description
   * Returns an array representing the path to this group. Because this directive
   * always lives at the top level of a form, it always an empty array.
   */
  override get path(): string[] {
    return [];
  }

  /**
   * @description
   * Method that sets up the control directive in this group, re-calculates its value
   * and validity, and adds the instance to the internal list of directives.
   *
   * @param dir The `FormControlName` directive instance.
   */
  addControl(dir: FormControlName): FormControl {
    const ctrl: any = this.form.get(dir.path);
    setUpControl(ctrl, dir, this.callSetDisabledState);
    ctrl.updateValueAndValidity({emitEvent: false});
    this.directives.push(dir);
    return ctrl;
  }

  /**
   * @description
   * Retrieves the `FormControl` instance from the provided `FormControlName` directive
   *
   * @param dir The `FormControlName` directive instance.
   */
  getControl(dir: FormControlName): FormControl {
    return <FormControl>this.form.get(dir.path);
  }

  /**
   * @description
   * Removes the `FormControlName` instance from the internal list of directives
   *
   * @param dir The `FormControlName` directive instance.
   */
  removeControl(dir: FormControlName): void {
    cleanUpControl(dir.control || null, dir, /* validateControlPresenceOnChange */ false);
    removeListItem(this.directives, dir);
  }

  /**
   * Adds a new `FormGroupName` directive instance to the form.
   *
   * @param dir The `FormGroupName` directive instance.
   */
  addFormGroup(dir: FormGroupName): void {
    this._setUpFormContainer(dir);
  }

  /**
   * Performs the necessary cleanup when a `FormGroupName` directive instance is removed from the
   * view.
   *
   * @param dir The `FormGroupName` directive instance.
   */
  removeFormGroup(dir: FormGroupName): void {
    this._cleanUpFormContainer(dir);
  }

  /**
   * @description
   * Retrieves the `FormGroup` for a provided `FormGroupName` directive instance
   *
   * @param dir The `FormGroupName` directive instance.
   */
  getFormGroup(dir: FormGroupName): FormGroup {
    return <FormGroup>this.form.get(dir.path);
  }

  /**
   * Performs the necessary setup when a `FormArrayName` directive instance is added to the view.
   *
   * @param dir The `FormArrayName` directive instance.
   */
  addFormArray(dir: FormArrayName): void {
    this._setUpFormContainer(dir);
  }

  /**
   * Performs the necessary cleanup when a `FormArrayName` directive instance is removed from the
   * view.
   *
   * @param dir The `FormArrayName` directive instance.
   */
  removeFormArray(dir: FormArrayName): void {
    this._cleanUpFormContainer(dir);
  }

  /**
   * @description
   * Retrieves the `FormArray` for a provided `FormArrayName` directive instance.
   *
   * @param dir The `FormArrayName` directive instance.
   */
  getFormArray(dir: FormArrayName): FormArray {
    return <FormArray>this.form.get(dir.path);
  }

  /**
   * Sets the new value for the provided `FormControlName` directive.
   *
   * @param dir The `FormControlName` directive instance.
   * @param value The new value for the directive's control.
   */
  updateModel(dir: FormControlName, value: any): void {
    const ctrl = <FormControl>this.form.get(dir.path);
    ctrl.setValue(value);
  }

  /**
   * @description
   * Method called with the "submit" event is triggered on the form.
   * Triggers the `ngSubmit` emitter to emit the "submit" event as its payload.
   *
   * @param $event The "submit" event object
   */
  onSubmit($event: Event): boolean {
    this._submittedReactive.set(true);
    syncPendingControls(this.form, this.directives);
    this.ngSubmit.emit($event);
    this.form._events.next(new FormSubmittedEvent(this.control));

    // Forms with `method="dialog"` have some special behavior that won't reload the page and that
    // shouldn't be prevented. Note that we need to null check the `event` and the `target`, because
    // some internal apps call this method directly with the wrong arguments.
    return ($event?.target as HTMLFormElement | null)?.method === 'dialog';
  }

  /**
   * @description
   * Method called when the "reset" event is triggered on the form.
   */
  onReset(): void {
    this.resetForm();
  }

  /**
   * @description
   * Resets the form to an initial value and resets its submitted status.
   *
   * @param value The new value for the form.
   */
  resetForm(value: any = undefined): void {
    this.form.reset(value);
    this._submittedReactive.set(false);
    this.form._events.next(new FormResetEvent(this.form));
  }

  /** @internal */
  _updateDomValue() {
    this.directives.forEach((dir) => {
      const oldCtrl = dir.control;
      const newCtrl = this.form.get(dir.path);
      if (oldCtrl !== newCtrl) {
        // Note: the value of the `dir.control` may not be defined, for example when it's a first
        // `FormControl` that is added to a `FormGroup` instance (via `addControl` call).
        cleanUpControl(oldCtrl || null, dir);

        // Check whether new control at the same location inside the corresponding `FormGroup` is an
        // instance of `FormControl` and perform control setup only if that's the case.
        // Note: we don't need to clear the list of directives (`this.directives`) here, it would be
        // taken care of in the `removeControl` method invoked when corresponding `formControlName`
        // directive instance is being removed (invoked from `FormControlName.ngOnDestroy`).
        if (isFormControl(newCtrl)) {
          setUpControl(newCtrl, dir, this.callSetDisabledState);
          (dir as Writable<FormControlName>).control = newCtrl;
        }
      }
    });

    this.form._updateTreeValidity({emitEvent: false});
  }

  private _setUpFormContainer(dir: FormArrayName | FormGroupName): void {
    const ctrl: any = this.form.get(dir.path);
    setUpFormContainer(ctrl, dir);
    // NOTE: this operation looks unnecessary in case no new validators were added in
    // `setUpFormContainer` call. Consider updating this code to match the logic in
    // `_cleanUpFormContainer` function.
    ctrl.updateValueAndValidity({emitEvent: false});
  }

  private _cleanUpFormContainer(dir: FormArrayName | FormGroupName): void {
    if (this.form) {
      const ctrl: any = this.form.get(dir.path);
      if (ctrl) {
        const isControlUpdated = cleanUpFormContainer(ctrl, dir);
        if (isControlUpdated) {
          // Run validity check only in case a control was updated (i.e. view validators were
          // removed) as removing view validators might cause validity to change.
          ctrl.updateValueAndValidity({emitEvent: false});
        }
      }
    }
  }

  private _updateRegistrations() {
    this.form._registerOnCollectionChange(this._onCollectionChange);
    if (this._oldForm) {
      this._oldForm._registerOnCollectionChange(() => {});
    }
  }

  private _updateValidators() {
    setUpValidators(this.form, this);
    if (this._oldForm) {
      cleanUpValidators(this._oldForm, this);
    }
  }

  private _checkFormPresent() {
    if (!this.form && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw missingFormException();
    }
  }
}
