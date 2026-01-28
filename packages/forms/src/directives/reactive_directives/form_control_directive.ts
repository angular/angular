/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  forwardRef,
  Inject,
  InjectionToken,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  Provider,
  Renderer2,
  Self,
  SimpleChanges,
  type ɵControlDirectiveHost as ControlDirectiveHost,
} from '@angular/core';

import {FormControl} from '../../model/form_control';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../../validators';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '../control_value_accessor';
import {NgControl} from '../ng_control';
import {disabledAttrWarning} from '../reactive_errors';
import {
  _ngModelWarning,
  CALL_SET_DISABLED_STATE,
  cleanUpControl,
  isPropertyUpdated,
  SetDisabledStateOption,
  setUpControlValueAccessor,
} from '../shared';
import {AsyncValidator, AsyncValidatorFn, Validator, ValidatorFn} from '../validators';

/**
 * Token to provide to turn off the ngModel warning on formControl and formControlName.
 */
export const NG_MODEL_WITH_FORM_CONTROL_WARNING = new InjectionToken(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'NgModelWithFormControlWarning' : '',
);

const formControlBinding: Provider = {
  provide: NgControl,
  useExisting: forwardRef(() => FormControlDirective),
};

/**
 * @description
 * Synchronizes a standalone `FormControl` instance to a form control element.
 *
 * Note that support for using the `ngModel` input property and `ngModelChange` event with reactive
 * form directives was deprecated in Angular v6 and is scheduled for removal in
 * a future version of Angular.
 *
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
 * @see {@link FormControl}
 * @see {@link AbstractControl}
 *
 * @usageNotes
 *
 * The following example shows how to register a standalone control and set its value.
 *
 * {@example forms/ts/simpleFormControl/simple_form_control_example.ts region='Component'}
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
@Directive({
  selector: '[formControl]',
  providers: [formControlBinding],
  exportAs: 'ngForm',
  standalone: false,
})
export class FormControlDirective extends NgControl implements OnChanges, OnDestroy {
  /**
   * Internal reference to the view model value.
   * @docs-private
   */
  viewModel: any;

  /**
   * @description
   * Tracks the `FormControl` instance bound to the directive.
   */
  @Input('formControl') form!: FormControl;

  /**
   * @description
   * Triggers a warning in dev mode that this input should not be used with reactive forms.
   */
  @Input('disabled')
  set isDisabled(isDisabled: boolean) {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      console.warn(disabledAttrWarning);
    }
  }

  // TODO(kara): remove next 4 properties once deprecation period is over

  /** @deprecated as of v6 */
  @Input('ngModel') model: any;

  /** @deprecated as of v6 */
  @Output('ngModelChange') update = new EventEmitter();

  /**
   * @description
   * Static property used to track whether any ngModel warnings have been sent across
   * all instances of FormControlDirective. Used to support warning config of "once".
   *
   * @internal
   */
  static _ngModelWarningSentOnce = false;

  /**
   * @description
   * Instance property used to track whether an ngModel warning has been sent out for this
   * particular `FormControlDirective` instance. Used to support warning config of "always".
   *
   * @internal
   */
  _ngModelWarningSent = false;

  constructor(
    @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator | ValidatorFn)[],
    @Optional()
    @Self()
    @Inject(NG_ASYNC_VALIDATORS)
    asyncValidators: (AsyncValidator | AsyncValidatorFn)[],
    @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[],
    @Optional()
    @Inject(NG_MODEL_WITH_FORM_CONTROL_WARNING)
    private _ngModelWarningConfig: string | null,
    @Optional()
    @Inject(CALL_SET_DISABLED_STATE)
    private callSetDisabledState?: SetDisabledStateOption,
    @Optional() renderer?: Renderer2,
    @Optional() injector?: Injector,
  ) {
    super(injector, renderer, valueAccessors);
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
  }

  /** @docs-private */
  ngOnChanges(changes: SimpleChanges): void {
    if (this._isControlChanged(changes)) {
      const previousForm = changes['form'].previousValue as FormControl | null;
      if (previousForm) {
        cleanUpControl(previousForm, this, /* validateControlPresenceOnChange */ false);
        this.removeParseErrorsValidator(previousForm);
      }
      // Only set up CVA if not using FVC
      if (!this.isCustomControlBased) {
        // Now that we know we're not using FVC, select the value accessor
        this.valueAccessor ??= this.selectedValueAccessor;
        setUpControlValueAccessor(this.form, this, this.callSetDisabledState);
      } else {
        // Set up FVC subscriptions when form changes - mark for check so
        // ɵngControlUpdate runs and syncs values/status to the FVC
        this.setupCustomControl();
      }
      this.form.updateValueAndValidity({emitEvent: false});
    }
    if (isPropertyUpdated(changes, this.viewModel)) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        _ngModelWarning('formControl', FormControlDirective, this, this._ngModelWarningConfig);
      }
      this.form.setValue(this.model);
      this.viewModel = this.model;
    }
  }

  /** @docs-private */
  ngOnDestroy() {
    if (this.form) {
      cleanUpControl(this.form, this, /* validateControlPresenceOnChange */ false);
    }
  }

  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  override get path(): string[] {
    return [];
  }

  /**
   * @description
   * The `FormControl` bound to this directive.
   */
  override get control(): FormControl {
    return this.form;
  }

  /**
   * @description
   * Sets the new value for the view model and emits an `ngModelChange` event.
   *
   * @param newValue The new value for the view model.
   */
  override viewToModelUpdate(newValue: any): void {
    this.viewModel = newValue;
    this.update.emit(newValue);
  }

  private _isControlChanged(changes: {[key: string]: any}): boolean {
    return changes.hasOwnProperty('form');
  }

  /**
   * Internal control directive creation lifecycle hook.
   *
   * The presence of this method tells the compiler to install `ɵɵControlFeature`, which will
   * cause this directive to be recognized as a control directive by the `ɵcontrolCreate` and
   * `ɵcontrol` instructions.
   *
   * @internal
   */
  ɵngControlCreate(host: ControlDirectiveHost): void {
    super.ngControlCreate(host);
  }

  /**
   * Internal control directive update lifecycle hook.
   *
   * @internal
   */
  ɵngControlUpdate(host: ControlDirectiveHost): void {
    super.ngControlUpdate(host, true);
  }
}
