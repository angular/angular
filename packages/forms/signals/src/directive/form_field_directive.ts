/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  computed,
  type ɵControlDirectiveHost as ControlDirectiveHost,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  ɵformatRuntimeError as formatRuntimeError,
  inject,
  InjectionToken,
  Injector,
  input,
  Renderer2,
  ɵRuntimeError as RuntimeError,
  type Signal,
  signal,
  untracked,
} from '@angular/core';
import {type ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {type ValidationError} from '../api/rules';
import type {Field, FieldState} from '../api/types';
import {InteropNgControl} from '../controls/interop_ng_control';
import {RuntimeErrorCode} from '../errors';
import {SIGNAL_FORMS_CONFIG} from '../field/di';
import type {FieldNode} from '../field/node';
import {bindingUpdated, type ControlBindingKey, createBindings} from './bindings';
import {customControlCreate} from './control_custom';
import {cvaControlCreate} from './control_cva';
import {nativeControlCreate} from './control_native';
import {
  isNativeFormElement,
  isNumericFormElement,
  isTextualFormElement,
  type NativeFormControl,
} from './native';
import {FORM_FIELD_PARSE_ERRORS} from './parse_errors';

export const ɵNgFieldDirective: unique symbol = Symbol();

export interface FormFieldBindingOptions {
  /**
   * Focuses the binding.
   *
   * If not specified, Signal Forms will attempt to focus the host element of the `FormField` when
   * asked to focus this binding.
   */
  readonly focus?: (focusOptions?: FocusOptions) => void;
}

/**
 * Lightweight DI token provided by the {@link FormField} directive.
 *
 * @category control
 * @experimental 21.0.0
 */
export const FORM_FIELD = new InjectionToken<FormField<unknown>>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'FORM_FIELD' : '',
);

/**
 * Binds a form `FieldTree` to a UI control that edits it. A UI control can be one of several things:
 * 1. A native HTML input or textarea
 * 2. A signal forms custom control that implements `FormValueControl` or `FormCheckboxControl`
 * 3. A component that provides a `ControlValueAccessor`. This should only be used for backwards
 *    compatibility with reactive forms. Prefer options (1) and (2).
 *
 * This directive has several responsibilities:
 * 1. Two-way binds the field state's value with the UI control's value
 * 2. Binds additional forms related state on the field state to the UI control (disabled, required, etc.)
 * 3. Relays relevant events on the control to the field state (e.g. marks touched on blur)
 * 4. Provides a fake `NgControl` that implements a subset of the features available on the
 *    reactive forms `NgControl`. This is provided to improve interoperability with controls
 *    designed to work with reactive forms. It should not be used by controls written for signal
 *    forms.
 *
 * @category control
 * @experimental 21.0.0
 */
@Directive({
  selector: '[formField]',
  exportAs: 'formField',
  providers: [
    {provide: FORM_FIELD, useExisting: FormField},
    {provide: NgControl, useFactory: () => inject(FormField).interopNgControl},
    {
      provide: FORM_FIELD_PARSE_ERRORS,
      useFactory: () => inject(FormField).parseErrorsSource,
    },
  ],
})
export class FormField<T> {
  /**
   * The field to bind to the underlying form control.
   */
  readonly field = input.required<Field<T>>({alias: 'formField'});

  /**
   * `FieldState` for the currently bound field.
   */
  readonly state = computed<FieldState<T>>(() => this.field()());

  /** @internal */
  readonly renderer = inject(Renderer2);

  /** @internal */
  readonly destroyRef = inject(DestroyRef);

  /**
   * The node injector for the element this field binding.
   */
  readonly injector = inject(Injector);

  /**
   * The DOM element hosting this field binding.
   */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  // Compute some helper booleans about the type of element we're sitting on.
  private readonly elementIsNativeFormElement = isNativeFormElement(this.element);
  private readonly elementAcceptsNumericValues = isNumericFormElement(this.element);
  private readonly elementAcceptsTextualValues = isTextualFormElement(this.element);

  /**
   * Utility that casts `this.element` to `NativeFormControl` to avoid repeated type guards. Only
   * safe to access when `elementIsNativeFormElement` is true.
   *
   * @internal
   */
  readonly nativeFormElement: NativeFormControl = (this.elementIsNativeFormElement
    ? this.element
    : undefined) as NativeFormControl;

  /**
   * Current focus implementation, set by `registerAsBinding`.
   */
  private focuser = (options?: FocusOptions) => this.element.focus(options);

  /** Any `ControlValueAccessor` instances provided on the host element. */
  private readonly controlValueAccessors = inject(NG_VALUE_ACCESSOR, {optional: true, self: true});

  private readonly config = inject(SIGNAL_FORMS_CONFIG, {optional: true});

  private readonly parseErrorsSource = signal<
    Signal<readonly ValidationError.WithoutFieldTree[]> | undefined
  >(undefined);

  /** A lazily instantiated fake `NgControl`. */
  private _interopNgControl: InteropNgControl | undefined;

  /** Lazily instantiates a fake `NgControl` for this form field. */
  protected get interopNgControl(): InteropNgControl {
    return (this._interopNgControl ??= new InteropNgControl(this.state));
  }

  /** @internal */
  readonly parseErrors = computed<ValidationError.WithFormField[]>(
    () =>
      this.parseErrorsSource()?.().map((err) => ({
        ...err,
        fieldTree: untracked(this.state).fieldTree,
        formField: this as FormField<unknown>,
      })) ?? [],
  );

  /** Errors associated with this form field. */
  readonly errors = computed(() =>
    this.state()
      .errors()
      .filter((err) => !err.formField || err.formField === this),
  );

  /** Whether this `FormField` has been registered as a binding on its associated `FieldState`. */
  private isFieldBinding = false;

  /**
   * A `ControlValueAccessor`, if configured, for the host component.
   *
   * @internal
   */
  get controlValueAccessor(): ControlValueAccessor | undefined {
    return this.controlValueAccessors?.[0] ?? this.interopNgControl?.valueAccessor ?? undefined;
  }

  /**
   * Creates an `afterRenderEffect` that applies the configured class bindings to the host element
   * if needed.
   */
  private installClassBindingEffect(): void {
    const classes = Object.entries(this.config?.classes ?? {}).map(
      ([className, computation]) =>
        [className, computed(() => computation(this as FormField<unknown>))] as const,
    );
    if (classes.length === 0) {
      return;
    }

    // If we have class bindings to apply, set up an afterRenderEffect to apply them.
    const bindings = createBindings<string>();
    afterRenderEffect(
      {
        write: () => {
          for (const [className, computation] of classes) {
            const active = computation();
            if (bindingUpdated(bindings, className, active)) {
              if (active) {
                this.renderer.addClass(this.element, className);
              } else {
                this.renderer.removeClass(this.element, className);
              }
            }
          }
        },
      },
      {injector: this.injector},
    );
  }

  /**
   * Focuses this field binding.
   *
   * By default, this will focus the host DOM element. However, custom `FormUiControl`s can
   * implement custom focusing behavior.
   */
  focus(options?: FocusOptions): void {
    this.focuser(options);
  }

  /**
   * Registers this `FormField` as a binding on its associated `FieldState`.
   *
   * This method should be called at most once for a given `FormField`. A `FormField` placed on a
   * custom control (`FormUiControl`) automatically registers that custom control as a binding.
   */
  registerAsBinding(bindingOptions?: FormFieldBindingOptions): void {
    if (this.isFieldBinding) {
      throw new RuntimeError(
        RuntimeErrorCode.BINDING_ALREADY_REGISTERED,
        typeof ngDevMode !== 'undefined' &&
          ngDevMode &&
          'FormField already registered as a binding',
      );
    }
    this.isFieldBinding = true;

    this.installClassBindingEffect();

    if (bindingOptions?.focus) {
      this.focuser = (focusOptions?: FocusOptions) => bindingOptions.focus!(focusOptions);
    }

    // Register this control on the field state it is currently bound to. We do this at the end of
    // initialization so that it only runs if we are actually syncing with this control
    // (as opposed to just passing the field state through to its `formField` input).
    effect(
      (onCleanup) => {
        const fieldNode = this.state() as unknown as FieldNode;
        fieldNode.nodeState.formFieldBindings.update((controls) => [
          ...controls,
          this as FormField<unknown>,
        ]);
        onCleanup(() => {
          fieldNode.nodeState.formFieldBindings.update((controls) =>
            controls.filter((c) => c !== this),
          );
        });
      },
      {injector: this.injector},
    );

    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      effect(
        () => {
          const fieldNode = this.state() as unknown as FieldNode;
          if (fieldNode.hidden()) {
            const path = fieldNode.structure.pathKeys().join('.') || '<root>';
            console.warn(
              formatRuntimeError(
                RuntimeErrorCode.RENDERED_HIDDEN_FIELD,
                `Field '${path}' is hidden but is being rendered. ` +
                  `Hidden fields should be removed from the DOM using @if.`,
              ),
            );
          }
        },
        {injector: this.injector},
      );
    }
  }

  /**
   * The presence of this symbol tells the template type-checker that this directive is a control
   * directive and should be type-checked as such. We don't use the `ɵngControlCreate` method below
   * as it's marked internal and removed from the public API. A symbol is used instead to avoid
   * polluting the public API with the marker.
   */
  readonly [ɵNgFieldDirective]!: true;

  /**
   * Internal control directive creation lifecycle hook.
   *
   * The presence of this method tells the compiler to install `ɵɵControlFeature`, which will
   * cause this directive to be recognized as a control directive by the `ɵcontrolCreate` and
   * `ɵcontrol` instructions.
   *
   * @internal */
  ɵngControlCreate(host: ControlDirectiveHost<'formField'>): void {
    if (host.hasPassThrough) {
      return;
    }

    if (this.controlValueAccessor) {
      this.ɵngControlUpdate = cvaControlCreate(host, this as FormField<unknown>);
    } else if (host.customControl) {
      this.ɵngControlUpdate = customControlCreate(host, this as FormField<unknown>);
    } else if (this.elementIsNativeFormElement) {
      this.ɵngControlUpdate = nativeControlCreate(
        host,
        this as FormField<unknown>,
        this.parseErrorsSource,
      );
    } else {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_FIELD_DIRECTIVE_HOST,
        typeof ngDevMode !== 'undefined' &&
          ngDevMode &&
          `${host.descriptor} is an invalid [formField] directive host. The host must be a native form control ` +
            `(such as <input>', '<select>', or '<textarea>') or a custom form control with a 'value' or ` +
            `'checked' model.`,
      );
    }
  }

  /** @internal */
  ɵngControlUpdate: (() => void) | undefined;

  /** @internal */
  elementAcceptsNativeProperty<K extends ControlBindingKey>(
    key: K,
  ): key is K &
    ('min' | 'max' | 'minLength' | 'maxLength' | 'disabled' | 'required' | 'readonly' | 'name') {
    if (!this.elementIsNativeFormElement) {
      return false;
    }

    switch (key) {
      case 'min':
      case 'max':
        return this.elementAcceptsNumericValues;
      case 'minLength':
      case 'maxLength':
        return this.elementAcceptsTextualValues;
      case 'disabled':
      case 'required':
      case 'readonly':
      case 'name':
        return true;
      default:
        return false;
    }
  }
}
