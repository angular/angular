/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectorRef,
  DestroyRef,
  computed,
  effect,
  type Injector,
  type Renderer2,
  Signal,
  inject,
  type ɵControlDirectiveHost as ControlDirectiveHost,
  Provider,
} from '@angular/core';
import {Subscription} from 'rxjs';

import {FormResetEvent, type AbstractControl} from '../model/abstract_model';
import type {FormControl} from '../model/form_control';

import {AbstractControlDirective} from './abstract_control_directive';
import {ControlContainer} from './control_container';
import {ControlValueAccessor} from './control_value_accessor';
import {isNativeFormElement, setNativeDomProperty, type NativeFormControl} from './native';
import {ReactiveValidationError} from './reactive_validation_error';
import {RequiredValidator, ValidationErrors, ValidatorFn} from './validators';
import {selectValueAccessor, ɵFORM_CONTROL_INTEGRATION as FORM_CONTROL_INTEGRATION} from './shared';

type ParseError = {readonly kind: string};

export const NG_CONTROL_INTEGRATION_PROVIDER: Provider = {
  provide: FORM_CONTROL_INTEGRATION,
  useFactory: () => {
    const control = inject(NgControl, {self: true});
    return {
      setParseErrors: (source: Signal<ReadonlyArray<ParseError>> | undefined) => {
        control.setParseErrorSource(source);
      },
      set onReset(callback: (value?: unknown) => void) {
        control.onReset = callback;
      },
    };
  },
};

/**
 * @description
 * A base class that all `FormControl`-based directives extend. It binds a `FormControl`
 * object to a DOM element.
 *
 * @publicApi
 */
export abstract class NgControl extends AbstractControlDirective {
  /**
   * @description
   * The parent form for the control.
   *
   * @internal
   */
  _parent: ControlContainer | null = null;

  /**
   * @description
   * The name for the control
   */
  name: string | number | null = null;

  /**
   * @description
   * The value accessor for the control
   */
  valueAccessor: ControlValueAccessor | null = null;

  protected isCustomControlBased = false;

  private userOnReset?: (value?: unknown) => void;
  private resetSubscription?: Subscription;

  /** @internal */
  set onReset(callback: (value?: unknown) => void) {
    this.userOnReset = callback;

    this.resetSubscription?.unsubscribe();
    this.resetSubscription = undefined;

    if (this.control) {
      this.resetSubscription = this.control.events.subscribe((event) => {
        if (event instanceof FormResetEvent && this.control) {
          this.userOnReset?.(this.control.value);
        }
      });
      this.subscription?.add(this.resetSubscription);
    }
  }
  private isNativeFormElement = false;

  /**
   * Raw `ControlValueAccessor`s retrieved from DI.
   */
  private readonly rawValueAccessors: ControlValueAccessor[] | undefined;

  private _selectedValueAccessor: ControlValueAccessor | null = null;

  protected get selectedValueAccessor(): ControlValueAccessor | null {
    return (this._selectedValueAccessor ??= selectValueAccessor(this, this.rawValueAccessors));
  }

  /**
   * @description
   * The callback method to update the model from the view when requested
   *
   * @param newValue The new value for the view
   */
  abstract viewToModelUpdate(newValue: any): void;

  /**
   * Validator function that returns current parse errors.
   */
  protected parseErrorsValidator: ValidatorFn | null = null;

  /**
   * Renderer for setting native DOM properties. Set by subclass constructor.
   */
  private renderer: Renderer2 | undefined;

  /**
   * Injector for creating effects. Set by subclass constructor.
   */
  private readonly injector: Injector | undefined;

  private requiredValidatorViaDi: RequiredValidator | undefined;

  /**
   * Container for any RxJS subscriptions related to the current control.
   *
   * This gets cleaned up and recreated when the control changes.
   */
  private subscription: Subscription | undefined;

  /**
   * Tracks last bound values to avoid unnecessary FVC updates.
   */
  protected customControlBindings: {
    value?: unknown;
    disabled?: boolean;
    touched?: boolean;
    dirty?: boolean;
    valid?: boolean;
    invalid?: boolean;
    pending?: boolean;
    required?: boolean;
    errors?: ValidationErrors | null;
  } | null = null;

  /**
   * Last value emitted by the custom control that has not been committed to the `FormControl`
   * yet (`updateOn: 'blur' | 'submit'`). Only meaningful while `hasPendingCustomValue` is true.
   */
  private pendingCustomValue: unknown = undefined;
  private hasPendingCustomValue = false;

  constructor(
    injector?: Injector,
    renderer?: Renderer2,
    rawValueAccessors?: ControlValueAccessor[],
  ) {
    super();
    this.injector = injector;
    this.renderer = renderer;
    this.rawValueAccessors = rawValueAccessors;
    this.injector?.get(DestroyRef)?.onDestroy(() => {
      this.removeParseErrorsValidator(this.control);
      this.subscription?.unsubscribe();
    });
  }

  protected setupCustomControl(): void {
    this.subscription?.unsubscribe();

    const control = this.control;
    const cdr = this.injector?.get(ChangeDetectorRef);
    if (!control || !cdr) {
      return;
    }

    const markForCheck = cdr.markForCheck.bind(cdr);
    this.subscription = new Subscription();

    this.subscription.add(() => this.discardPendingCustomValue(control));

    // `registerOnChange` and `_unregisterOnChange` are declared on `FormControl` (and
    // `SignalFormControl`), not on `AbstractControl`. We guard `registerOnChange` at runtime.
    if (typeof (control as FormControl).registerOnChange === 'function') {
      const onControlChange = (newValue?: unknown, emitModelEvent?: boolean) => {
        this.discardPendingCustomValue(control);
        if (emitModelEvent) {
          this.viewToModelUpdate(newValue);
        }
        markForCheck();
      };
      (control as FormControl).registerOnChange(onControlChange);
      this.subscription.add(() => (control as FormControl)._unregisterOnChange(onControlChange));
    }

    this.subscription.add(control.valueChanges.subscribe(markForCheck));
    this.subscription.add(control.statusChanges.subscribe(markForCheck));

    this.resetSubscription?.unsubscribe();
    this.resetSubscription = undefined;
    if (this.userOnReset) {
      this.resetSubscription = control.events.subscribe((event) => {
        if (event instanceof FormResetEvent && this.control) {
          this.userOnReset?.(this.control.value);
        }
      });
      this.subscription.add(this.resetSubscription);
    }

    // Add parseErrors validator if present
    if (this.parseErrorsValidator) {
      control.addValidators(this.parseErrorsValidator);
    }
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
  protected ngControlCreate(host: ControlDirectiveHost): void {
    const hasNgNoCva = host.nativeElement.hasAttribute?.('ngNoCva');
    const hasCva =
      !hasNgNoCva &&
      ((this.rawValueAccessors && this.rawValueAccessors.length > 0) ||
        this.valueAccessor !== null);

    if (hasCva || !host.customControl) {
      // This control is using the CVA pattern, so ngControlCreate is a noop.
      return;
    }

    this.isCustomControlBased = true;

    // Listen to custom control value changes -> update FormControl
    // Note: We access this.control dynamically because it may not be set yet
    // (e.g., FormControlDirective's form input hasn't been bound)
    host.listenToCustomControlModel((value) => {
      const control = this.control;
      if (!control) {
        return;
      }

      // `_pendingValue` and `_pendingChange` are only declared on `FormControl`; cast rather than
      // checking `instanceof FormControl` so `SignalFormControl` and custom `AbstractControl`
      // subclasses are supported.
      (control as FormControl)._pendingValue = value;
      (control as FormControl)._pendingChange = true;
      control._pendingDirty = true;
      this.pendingCustomValue = value;
      this.hasPendingCustomValue = true;

      if (control.updateOn === 'change') {
        this.updateControlFromCustom(control);
      }
    });

    // Listen to touched changes from FVC
    host.listenToCustomControlOutput('touch', () => {
      const control = this.control;
      if (!control) {
        return;
      }

      control._pendingTouched = true;

      // `_pendingChange` is only declared on `FormControl` (same as in `listenToCustomControlModel`).
      if (control.updateOn === 'blur' && (control as FormControl)._pendingChange) {
        this.updateControlFromCustom(control);
      }

      if (control.updateOn !== 'submit') {
        control.markAsTouched();
      }
    });

    this.customControlBindings = {};
    this.isNativeFormElement = isNativeFormElement(host.nativeElement);

    this.requiredValidatorViaDi = this._rawValidators.find((v) => v instanceof RequiredValidator);
  }

  private updateControlFromCustom(control: AbstractControl): void {
    // `_pendingValue` and `_pendingChange` are only declared on `FormControl` (same as in
    // `listenToCustomControlModel`).
    const value = (control as FormControl)._pendingValue;
    // Clear the pending state before `setValue` so `valueChanges` and `events` subscribers don't
    // observe a committed value that is still marked as pending.
    (control as FormControl)._pendingChange = false;
    this.clearPendingCustomValue();
    // The custom control is the source of `value`, so it already holds it. Record that before
    // `setValue` so a `valueChanges` subscriber that synchronously sets a different value is
    // still propagated by `ngControlUpdate`.
    if (this.customControlBindings) {
      this.customControlBindings.value = value;
    }
    if (control._pendingDirty) {
      control.markAsDirty();
    }
    control.setValue(value, {emitModelToViewChange: false});
    // Read `control.value` rather than `value` in case a `valueChanges` subscriber changed it.
    this.viewToModelUpdate(control.value);
  }

  private discardPendingCustomValue(control: AbstractControl): void {
    if (!this.hasPendingCustomValue) {
      return;
    }
    if (this.customControlBindings) {
      this.customControlBindings.value = this.pendingCustomValue;
    }
    this.clearPendingCustomValue();
    // `_pendingValue` and `_pendingChange` are only declared on `FormControl` (same as in
    // `listenToCustomControlModel`).
    (control as FormControl)._pendingValue = control.value;
    (control as FormControl)._pendingChange = false;
    control._pendingDirty = false;
  }

  private clearPendingCustomValue(): void {
    this.pendingCustomValue = undefined;
    this.hasPendingCustomValue = false;
  }

  protected ngControlUpdate(host: ControlDirectiveHost, bindRequired: boolean): void {
    if (!this.isCustomControlBased) {
      return;
    }

    const control = this.control;
    const bindings = this.customControlBindings;
    if (!control || !bindings) {
      return;
    }

    // If a pending custom value was committed externally (e.g. by `syncPendingControls` on
    // form submission), update `bindings.value` to what the custom control already holds.
    // `_pendingChange` is only declared on `FormControl` (same as in `listenToCustomControlModel`).
    if (this.hasPendingCustomValue && !(control as FormControl)._pendingChange) {
      bindings.value = this.pendingCustomValue;
      this.clearPendingCustomValue();
    }

    // Bind FormControl value -> FVC
    if (!Object.is(bindings.value, control.value)) {
      // Overwriting the custom control discards its pending value, so clear the control's
      // pending state too. Otherwise a later blur would commit the discarded value.
      this.discardPendingCustomValue(control);
      bindings.value = control.value;
      host.setCustomControlModelInput(control.value);
    }

    // Bind all status properties
    this.bindControlProperty(host, bindings, 'touched', control.touched);
    this.bindControlProperty(host, bindings, 'dirty', control.dirty);
    this.bindControlProperty(host, bindings, 'valid', control.valid);
    this.bindControlProperty(host, bindings, 'invalid', control.invalid);
    this.bindControlProperty(host, bindings, 'pending', control.pending);
    this.bindControlProperty(host, bindings, 'disabled', control.disabled);

    // Binding to `required` may be handled by the host element itself.
    if (this.shouldBindRequired) {
      this.bindControlProperty(host, bindings, 'required', this.isRequired);
    }

    // Bind errors - convert Reactive Form errors to Signal Form format
    const errorObject = control.errors;
    if (bindings.errors !== errorObject) {
      bindings.errors = errorObject;
      const errorArray = this._convertErrors(errorObject);
      host.setInputOnDirectives('errors', errorArray);
    }
  }

  /**
   * Returns true if the control is currently considered required, false otherwise.
   *
   * A control can be required either via `NG_VALIDATORS` including the `RequiredValidator`.
   */
  private get isRequired(): boolean {
    return (this.requiredValidatorViaDi?._enabled || this.control?._hasRequired()) ?? false;
  }

  /**
   * Whether the control should bind the `required` property (in custom control mode).
   *
   * Can be overridden by subclasses that handle `required` in a different way.
   */
  protected get shouldBindRequired(): boolean {
    return true;
  }

  /**
   * Binds a status property to FVC, falling back to native DOM if FVC lacks the input.
   */
  private bindControlProperty(
    host: ControlDirectiveHost,
    bindings: Record<string, unknown>,
    name: 'disabled' | 'touched' | 'dirty' | 'valid' | 'invalid' | 'pending' | 'required',
    value: boolean,
  ): void {
    if (bindings[name] === value) {
      return;
    }
    bindings[name] = value;

    // Try setting on the custom control first.
    const wasSet = host.setInputOnDirectives(name, value);

    // Fall back to native DOM property for 'disabled' and 'required'
    if (
      this.isNativeFormElement &&
      !wasSet &&
      (name === 'disabled' || name === 'required') &&
      this.renderer
    ) {
      setNativeDomProperty(this.renderer, host.nativeElement as NativeFormControl, name, value);
    }
  }

  /**
   * Converts Reactive Forms errors to Signal Forms error format.
   */
  private _convertErrors(errors: ValidationErrors | null): ReactiveValidationError[] {
    if (errors === null) {
      return [];
    }
    const control = this.control as FormControl;
    return Object.entries(errors).map(([kind, context]) => {
      return new ReactiveValidationError({context, kind, control});
    });
  }

  /** @internal */
  setParseErrorSource(parseErrors: Signal<ReadonlyArray<ParseError>> | undefined) {
    if (parseErrors === undefined) {
      return;
    }

    let convertedErrors: ValidationErrors | null = null;
    const convertedParseErrors = computed(() => {
      const rawErrors = parseErrors();
      if (rawErrors.length === 0) {
        return null;
      }

      return rawErrors.reduce(
        (acc, err) => {
          acc[err.kind] = err;
          return acc;
        },
        {} as Record<string, ParseError>,
      );
    });

    // Create validator that returns current parse errors
    this.parseErrorsValidator = (() => convertedErrors).bind(this);

    // Setup effect to watch parseErrors and trigger revalidation
    effect(
      () => {
        convertedErrors = convertedParseErrors();
        this.control?.updateValueAndValidity({emitEvent: false});
      },
      {injector: this.injector},
    );
  }

  protected removeParseErrorsValidator(control: AbstractControl | null | undefined): void {
    if (this.parseErrorsValidator) {
      control?.removeValidators(this.parseErrorsValidator);
      control?.updateValueAndValidity({emitEvent: false});
    }
  }
}
