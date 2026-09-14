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
  signal,
  untracked,
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
import {
  selectValueAccessor,
  setUpValidators,
  ɵFORM_CONTROL_INTEGRATION as FORM_CONTROL_INTEGRATION,
} from './shared';

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
   * Counts the `statusChanges` emissions of the current control, plus the merge of validators in
   * `setupCustomControl`. Read by `ngControlUpdate`, so that it runs again when only the errors
   * change.
   */
  private readonly statusChangeCount = signal(0);

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

    // Merge the validators collected from DI (validator directives such as `required` or
    // `minlength` on the element, and any `NG_VALIDATORS` provider) into the control, as
    // `setUpControlValueAccessor` does. When FormControlDirective or FormControlName lets go of the
    // control, `cleanUpControl` removes them again.
    setUpValidators(this.control, this);

    const markForCheck = cdr.markForCheck.bind(cdr);
    this.subscription = new Subscription();

    this.subscription.add(this.control.valueChanges.subscribe(markForCheck));
    this.subscription.add(
      this.control.statusChanges.subscribe(() => {
        markForCheck();
        untracked(() => this.statusChangeCount.update((count) => count + 1));
      }),
    );

    this.resetSubscription?.unsubscribe();
    this.resetSubscription = undefined;
    if (this.userOnReset) {
      this.resetSubscription = this.control.events.subscribe((event) => {
        if (event instanceof FormResetEvent && this.control) {
          this.userOnReset?.(this.control.value);
        }
      });
      this.subscription.add(this.resetSubscription);
    }

    // Add parseErrors validator if present
    if (this.parseErrorsValidator) {
      this.control.addValidators(this.parseErrorsValidator);
    }

    // The caller re-validates the control with `emitEvent: false` after the setup, so the
    // validators merged above emit no `statusChanges`, and leave the status signal unchanged when
    // the control was already invalid. Count a change, so that `ngControlUpdate` binds the errors.
    if (this.validator !== null || this.asyncValidator !== null) {
      untracked(() => this.statusChangeCount.update((count) => count + 1));
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
      // TODO: is there a case where this input has not yet been set?
      this.control?.setValue(value, {emitModelToViewChange: false});
      this.control?.markAsDirty();
      this.viewToModelUpdate(value);
    });

    // Listen to touched changes from FVC
    host.listenToCustomControlOutput('touch', () => {
      this.control?.markAsTouched();
    });

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

    // Track the status signal and the status change count, so that this update runs again when
    // validation changes later in the same change detection pass (e.g. a validator directive's
    // `ngOnChanges` re-validating the control). The status getters below are untracked, `errors`
    // is a plain field that the status signal does not cover, and a `markForCheck` from
    // `statusChanges` does not re-run a view that is already being refreshed.
    control._status();
    this.statusChangeCount();

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
   * A control is required when it has `Validators.required`. A `RequiredValidator` on the element
   * is handled by `shouldBindRequired` instead.
   */
  private get isRequired(): boolean {
    return this.control?._hasRequired() ?? false;
  }

  /**
   * Whether the control should bind the `required` property (in custom control mode).
   *
   * Not when a `RequiredValidator` is on the element, which is then the source of truth for
   * required-ness as it is for `NgModel`: the template's `required` binding already reaches the
   * custom control's `required` input, while a value bound here would also be written into the
   * directive's input of the same name. That would override the template, both on the first pass
   * (before the directive's `ngOnChanges`, clearing a static `required`) and later (turning
   * `Validators.required` into a directive validator that outlives its removal).
   *
   * Can be overridden by subclasses that handle `required` in a different way.
   */
  protected get shouldBindRequired(): boolean {
    return this.requiredValidatorViaDi === undefined;
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
