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
  type Signal,
  type ɵControlDirectiveHost as ControlDirectiveHost,
} from '@angular/core';
import {Subscription} from 'rxjs';

import type {AbstractControl} from '../model/abstract_model';
import type {FormControl} from '../model/form_control';
import {requiredValidator, Validators} from '../validators';

import {AbstractControlDirective} from './abstract_control_directive';
import {ControlContainer} from './control_container';
import {ControlValueAccessor} from './control_value_accessor';
import {isNativeFormElement, setNativeDomProperty, type NativeFormControl} from './native';
import {ReactiveValidationError} from './reactive_validation_error';
import {RequiredValidator, ValidationErrors, ValidatorFn} from './validators';
import {selectValueAccessor} from './shared';

type ParseError = {kind: string};

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

    const cdr = this.injector?.get(ChangeDetectorRef);
    if (!this.control || !cdr) {
      return;
    }

    const markForCheck = cdr.markForCheck.bind(cdr);
    this.subscription = new Subscription();

    this.subscription.add(this.control.valueChanges.subscribe(markForCheck));
    this.subscription.add(this.control.statusChanges.subscribe(markForCheck));

    // Add parseErrors validator if present
    if (this.parseErrorsValidator) {
      this.control.addValidators(this.parseErrorsValidator);
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
    const hasNgNoCva =
      host.nativeElement.hasAttribute?.('ngNoCva') || host.nativeElement.hasAttribute?.('ngnoCva');
    const hasCva = !hasNgNoCva && this.rawValueAccessors && this.rawValueAccessors.length > 0;

    if (hasCva || !host.customControl) {
      // This control is using the CVA pattern, so ngControlCreate is a noop.
      return;
    }

    this.isCustomControlBased = true;

    // Listen to custom control value changes -> update FormControl
    // Note: We access this.control dynamically because it may not be set yet
    // (e.g., FormControlDirective's form input hasn't been bound)
    host.listenToCustomControlModel((value) => {
      // TODO: is there a case where this input has not yet been set?
      this.control?.setValue(value, {emitModelToViewChange: false});
      this.control?.markAsDirty();
      this.viewToModelUpdate(value);
    });

    // Listen to touched changes from FVC
    host.listenToCustomControlOutput('touchedChange', () => {
      this.control?.markAsTouched();
    });

    // Check if FVC exposes parseErrors signal
    const parseErrors = (host.customControl as {parseErrors?: Signal<readonly ParseError[]>})
      ?.parseErrors;
    if (parseErrors && this.injector) {
      this.setupParseErrorsValidator(parseErrors, this.injector);
    }

    this.customControlBindings = {};
    this.isNativeFormElement = isNativeFormElement(host.nativeElement);

    this.requiredValidatorViaDi = this._rawValidators.find((v) => v instanceof RequiredValidator);
  }

  protected ngControlUpdate(host: ControlDirectiveHost, bindRequired: boolean): void {
    if (!this.isCustomControlBased) {
      return;
    }

    const control = this.control!;
    const bindings = this.customControlBindings!;

    // Bind FormControl value -> FVC
    if (!Object.is(bindings.value, control.value)) {
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
   * Can be overridden by subclasses that handle `required` in a different way.1
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

  private setupParseErrorsValidator(
    parseErrors: Signal<readonly ParseError[]>,
    injector: Injector,
  ) {
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
      {injector},
    );
  }

  protected removeParseErrorsValidator(control: AbstractControl | null | undefined): void {
    if (this.parseErrorsValidator) {
      control?.removeValidators(this.parseErrorsValidator);
      control?.updateValueAndValidity({emitEvent: false});
    }
  }
}
