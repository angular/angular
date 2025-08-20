/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  Injector,
  Input,
  InputSignal,
  OutputEmitterRef,
  OutputRef,
  OutputRefSubscription,
  reflectComponentType,
  signal,
  Type,
  untracked,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {FormCheckboxControl, FormUiControl, FormValueControl} from '../api/control';
import {
  AggregateProperty,
  MAX,
  MAX_LENGTH,
  MIN,
  MIN_LENGTH,
  PATTERN,
  REQUIRED,
} from '../api/property';
import {Field} from '../api/types';
import type {FieldNode} from '../field/node';
import {
  illegallyGetComponentInstance,
  illegallyIsModelInput,
  illegallyIsSignalInput,
  illegallyRunEffect,
  illegallySetComponentInput as illegallySetInputSignal,
} from '../util/illegal';
import {InteropNgControl} from './interop_ng_control';

/**
 * Binds a form `Field` to a UI control that edits it. A UI control can be one of several things:
 * 1. A native HTML input or textarea
 * 2. A signal forms custom control that implements `FormValueControl` or `FormCheckboxControl`
 * 3. A component that provides a ControlValueAccessor. This should only be used to backwards
 *    compatibility with reactive forms. Prefer options (1) and (2).
 *
 * This directive has several responsibilities:
 * 1. Two-way binds the field's value with the UI control's value
 * 2. Binds additional forms related state on the field to the UI control (disabled, required, etc.)
 * 3. Relays relevant events on the control to the field (e.g. marks field touched on blur)
 * 4. Provides a fake `NgControl` that implements a subset of the features available on the reactive
 *    forms `NgControl`. This is provided to improve interoperability with controls designed to work
 *    with reactive forms. It should not be used by controls written for signal forms.
 */
@Directive({
  selector: '[control]',
  providers: [
    {
      provide: NgControl,
      useFactory: () => inject(Control).ngControl,
    },
  ],
})
export class Control<T> {
  /** The injector for this component. */
  private readonly injector = inject(Injector);

  /** Whether state synchronization with the field has been setup yet. */
  private initialized = false;

  /** The field that is bound to this control. */
  readonly field = signal<Field<T>>(undefined as any);

  // If `[control]` is applied to a custom UI control, it wants to synchronize state in the field w/
  // the inputs of that custom control. This is difficult to do in user-land. We use `effect`, but
  // effects don't run before the lifecycle hooks of the component. This is usually okay, but has
  // one significant issue: the UI control's required inputs won't be set in time for those
  // lifecycle hooks to run.
  //
  // Eventually we can build custom functionality for the `Control` directive into the framework,
  // but for now we work around this limitation with a hack. We use an `@Input` instead of a
  // signal-based `input()` for the `[control]` to hook the exact moment inputs are being set,
  // before the important lifecycle hooks of the UI control. We can then initialize all our effects
  // and force them to run immediately, ensuring all required inputs have values.
  @Input({required: true, alias: 'control'})
  set _field(value: Field<T>) {
    this.field.set(value);
    if (!this.initialized) {
      this.initialize();
    }
  }

  /** The field state of the bound field. */
  readonly state = computed(() => this.field()());

  /** The HTMLElement this directive is attached to. */
  readonly el: ElementRef<HTMLElement> = inject(ElementRef);

  /** The NG_VALUE_ACCESSOR array for the host component. */
  readonly cvaArray = inject<ControlValueAccessor[]>(NG_VALUE_ACCESSOR, {optional: true});

  /** The Cached value for the lazily created interop NgControl. */
  private _ngControl: InteropNgControl | undefined;

  /** A fake NgControl provided for better interop with reactive forms. */
  get ngControl(): NgControl {
    return (this._ngControl ??= new InteropNgControl(() => this.state())) as unknown as NgControl;
  }

  /** The ControlValueAccessor for the host component. */
  get cva(): ControlValueAccessor | undefined {
    return this.cvaArray?.[0] ?? this._ngControl?.valueAccessor ?? undefined;
  }

  /** Initializes state synchronization between the field and the host UI control. */
  private initialize() {
    this.initialized = true;
    const injector = this.injector;
    const cmp = illegallyGetComponentInstance(injector);

    // If component has a `control` input, we assume that it will handle binding the field to the
    // appropriate native/custom control in its template, so we do not attempt to bind any inputs on
    // this component.
    if (cmp && isShadowedControlComponent(cmp)) {
      return;
    }

    if (cmp && isFormUiControl(cmp)) {
      // If we're binding to a component that follows the standard form ui control contract,
      // set up state synchronization based on the contract.
      this.setupCustomUiControl(cmp);
    } else if (this.cva !== undefined) {
      // If we're binding to a component that doesn't follow the standard contract, but provides a
      // control value accessor, set up state synchronization based on th CVA.
      this.setupControlValueAccessor(this.cva);
    } else if (
      this.el.nativeElement instanceof HTMLInputElement ||
      this.el.nativeElement instanceof HTMLTextAreaElement ||
      this.el.nativeElement instanceof HTMLSelectElement
    ) {
      // If we're binding to a native html input, set up state synchronization with its native
      // properties / attributes.
      this.setupNativeInput(this.el.nativeElement);
    } else {
      throw new Error(`Unhandled control?`);
    }

    // Register this control on the field it is currently bound to. We do this at the end of
    // initialization so that it only runs if we are actually syncing with this control
    // (as opposed to just passing the field through to its `control` input).
    effect(
      (onCleanup) => {
        const fieldNode = this.state() as unknown as FieldNode;
        fieldNode.nodeState.controls.update((controls) => [...controls, this as Control<unknown>]);
        onCleanup(() => {
          fieldNode.nodeState.controls.update((controls) => controls.filter((c) => c !== this));
        });
      },
      {injector: this.injector},
    );
  }

  /**
   * Set up state synchronization between the field and a native <input>, <textarea>, or <select>.
   */
  private setupNativeInput(
    input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  ): void {
    const inputType =
      input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement
        ? 'text'
        : input.type;

    input.addEventListener('input', () => {
      switch (inputType) {
        case 'checkbox':
          this.state().value.set((input as HTMLInputElement).checked as T);
          break;
        case 'radio':
          // The `input` event only fires when a radio button becomes selected, so write its `value`
          // into the state.
          this.state().value.set((input as HTMLInputElement).value as T);
          break;
        default:
          this.state().value.set(input.value as T);
          break;
      }
      this.state().markAsDirty();
    });
    input.addEventListener('blur', () => this.state().markAsTouched());

    this.maybeSynchronize(() => this.state().readonly(), withBooleanAttribute(input, 'readonly'));
    // TODO: consider making a global configuration option for using aria-disabled instead.
    this.maybeSynchronize(() => this.state().disabled(), withBooleanAttribute(input, 'disabled'));
    this.maybeSynchronize(() => this.state().name(), withAttribute(input, 'name'));

    this.maybeSynchronize(this.propertySource(REQUIRED), withBooleanAttribute(input, 'required'));
    this.maybeSynchronize(this.propertySource(MIN), withAttribute(input, 'min'));
    this.maybeSynchronize(this.propertySource(MIN_LENGTH), withAttribute(input, 'minLength'));
    this.maybeSynchronize(this.propertySource(MAX), withAttribute(input, 'max'));
    this.maybeSynchronize(this.propertySource(MAX_LENGTH), withAttribute(input, 'maxLength'));

    switch (inputType) {
      case 'checkbox':
        this.maybeSynchronize(
          () => this.state().value(),
          (value) => ((input as HTMLInputElement).checked = value as boolean),
        );
        break;
      case 'radio':
        this.maybeSynchronize(
          () => this.state().value(),
          (value) => {
            // Although HTML behavior is to clear the input already, we do this just in case.
            // It seems like it might be necessary in certain environments (e.g. Domino).
            (input as HTMLInputElement).checked = input.value === value;
          },
        );
        break;
      default:
        this.maybeSynchronize(
          () => this.state().value(),
          (value) => {
            input.value = value as string;
          },
        );
        break;
    }
  }

  /** Set up state synchronization between the field and a ControlValueAccessor. */
  private setupControlValueAccessor(cva: ControlValueAccessor): void {
    cva.registerOnChange((value: T) => this.state().value.set(value));
    cva.registerOnTouched(() => this.state().markAsTouched());

    this.maybeSynchronize(
      () => this.state().value(),
      (value) => cva.writeValue(value),
    );

    if (cva.setDisabledState) {
      this.maybeSynchronize(
        () => this.state().disabled(),
        (value) => cva.setDisabledState!(value),
      );
    }

    cva.writeValue(this.state().value());
    cva.setDisabledState?.(this.state().disabled());
  }

  /** Set up state synchronization between the field and a FormUiControl. */
  private setupCustomUiControl(cmp: FormUiControl) {
    // Handle the property side of the model binding. How we do this depends on the shape of the
    // component. There are 2 options:
    // * it provides a `value` model (most controls that edit a single value)
    // * it provides a `checked` model with no `value` signal (custom checkbox)

    let cleanupValue: OutputRefSubscription | undefined;
    if (isFormValueControl(cmp)) {
      // <custom-input [(value)]="state().value">
      this.maybeSynchronize(() => this.state().value(), withInput(cmp.value));
      cleanupValue = cmp.value.subscribe((newValue) => this.state().value.set(newValue as T));
    } else if (isFormCheckboxControl(cmp)) {
      // <custom-checkbox [(checked)]="state().value" />
      this.maybeSynchronize(() => this.state().value() as boolean, withInput(cmp.checked));
      cleanupValue = cmp.checked.subscribe((newValue) => this.state().value.set(newValue as T));
    } else {
      throw new Error(`Unknown custom control subtype`);
    }

    this.maybeSynchronize(() => this.state().name(), withInput(cmp.name));
    this.maybeSynchronize(() => this.state().disabled(), withInput(cmp.disabled));
    this.maybeSynchronize(() => this.state().disabledReasons(), withInput(cmp.disabledReasons));
    this.maybeSynchronize(() => this.state().readonly(), withInput(cmp.readonly));
    this.maybeSynchronize(() => this.state().hidden(), withInput(cmp.hidden));
    this.maybeSynchronize(() => this.state().errors(), withInput(cmp.errors));
    if (illegallyIsModelInput(cmp.touched) || illegallyIsSignalInput(cmp.touched)) {
      this.maybeSynchronize(() => this.state().touched(), withInput(cmp.touched));
    }
    this.maybeSynchronize(() => this.state().dirty(), withInput(cmp.dirty));
    this.maybeSynchronize(() => this.state().invalid(), withInput(cmp.invalid));
    this.maybeSynchronize(() => this.state().pending(), withInput(cmp.pending));

    this.maybeSynchronize(this.propertySource(REQUIRED), withInput(cmp.required));
    this.maybeSynchronize(this.propertySource(MIN), withInput(cmp.min));
    this.maybeSynchronize(this.propertySource(MIN_LENGTH), withInput(cmp.minLength));
    this.maybeSynchronize(this.propertySource(MAX), withInput(cmp.max));
    this.maybeSynchronize(this.propertySource(MAX_LENGTH), withInput(cmp.maxLength));
    this.maybeSynchronize(this.propertySource(PATTERN), withInput(cmp.pattern));

    let cleanupTouch: OutputRefSubscription | undefined;
    let cleanupDefaultTouch: (() => void) | undefined;
    if (illegallyIsModelInput(cmp.touched) || isOutputRef(cmp.touched)) {
      cleanupTouch = cmp.touched.subscribe(() => this.state().markAsTouched());
    } else {
      // If the component did not give us a touch event stream, use the standard touch logic,
      // marking it touched when the focus moves from inside the host element to outside.
      const listener = (event: FocusEvent) => {
        const newActiveEl = event.relatedTarget;
        if (!this.el.nativeElement.contains(newActiveEl as Element | null)) {
          this.state().markAsTouched();
        }
      };
      this.el.nativeElement.addEventListener('focusout', listener);
      cleanupDefaultTouch = () => this.el.nativeElement.removeEventListener('focusout', listener);
    }

    // Cleanup for output binding subscriptions:
    this.injector.get(DestroyRef).onDestroy(() => {
      cleanupValue?.unsubscribe();
      cleanupTouch?.unsubscribe();
      cleanupDefaultTouch?.();
    });
  }

  /** Synchronize a value from a reactive source to a given sink. */
  private maybeSynchronize<T>(source: () => T, sink: ((value: T) => void) | undefined): void {
    if (!sink) {
      return undefined;
    }
    const ref = effect(
      () => {
        const value = source();
        untracked(() => sink(value));
      },
      {injector: this.injector},
    );
    // Run the effect immediately to ensure sinks which are required inputs are set before they can
    // be observed. See the note on `_field` for more details.
    illegallyRunEffect(ref);
  }

  /** Creates a reactive value source by reading the given AggregateProperty from the field. */
  private propertySource<T>(key: AggregateProperty<T, any>): () => T {
    const metaSource = computed(() =>
      this.state().hasProperty(key) ? this.state().property(key) : key.getInitial,
    );
    return () => metaSource()?.();
  }
}

/** Creates a value sync from an input signal. */
function withInput<T>(input: InputSignal<T> | undefined): ((value: T) => void) | undefined {
  return input ? (value: T) => illegallySetInputSignal(input, value) : undefined;
}

/** Creates a boolean value sync that writes the given attribute of the given element. */
function withBooleanAttribute(element: HTMLElement, attribute: string): (value: boolean) => void {
  return (value) => {
    if (value) {
      element.setAttribute(attribute, '');
    } else {
      element.removeAttribute(attribute);
    }
  };
}

/** Creates a (non-boolean) value sync that writes the given attribute of the given element. */
function withAttribute(
  element: HTMLElement,
  attribute: string,
): (value: {toString(): string} | undefined) => void {
  return (value) => {
    if (value !== undefined) {
      element.setAttribute(attribute, value.toString());
    } else {
      element.removeAttribute(attribute);
    }
  };
}

/**
 * Checks whether the given component matches the contract for either FormValueControl or
 * FormCheckboxControl.
 */
function isFormUiControl(cmp: unknown): cmp is FormUiControl {
  const castCmp = cmp as FormUiControl;
  return (
    (isFormValueControl(castCmp) || isFormCheckboxControl(castCmp)) &&
    (castCmp.readonly === undefined || illegallyIsSignalInput(castCmp.readonly)) &&
    (castCmp.disabled === undefined || illegallyIsSignalInput(castCmp.disabled)) &&
    (castCmp.disabledReasons === undefined || illegallyIsSignalInput(castCmp.disabledReasons)) &&
    (castCmp.errors === undefined || illegallyIsSignalInput(castCmp.errors)) &&
    (castCmp.invalid === undefined || illegallyIsSignalInput(castCmp.invalid)) &&
    (castCmp.pending === undefined || illegallyIsSignalInput(castCmp.pending)) &&
    (castCmp.touched === undefined ||
      illegallyIsModelInput(castCmp.touched) ||
      illegallyIsSignalInput(castCmp.touched) ||
      isOutputRef(castCmp.touched)) &&
    (castCmp.dirty === undefined || illegallyIsSignalInput(castCmp.dirty)) &&
    (castCmp.min === undefined || illegallyIsSignalInput(castCmp.min)) &&
    (castCmp.minLength === undefined || illegallyIsSignalInput(castCmp.minLength)) &&
    (castCmp.max === undefined || illegallyIsSignalInput(castCmp.max)) &&
    (castCmp.maxLength === undefined || illegallyIsSignalInput(castCmp.maxLength))
  );
}

/** Checks whether the given FormUiControl is a FormValueControl. */
function isFormValueControl(cmp: FormUiControl): cmp is FormValueControl<unknown> {
  return illegallyIsModelInput((cmp as FormValueControl<unknown>).value);
}

/** Checks whether the given FormUiControl is a FormCheckboxControl. */
function isFormCheckboxControl(cmp: FormUiControl): cmp is FormCheckboxControl {
  return (
    illegallyIsModelInput((cmp as FormCheckboxControl).checked) &&
    (cmp as FormCheckboxControl).value === undefined
  );
}

/** Checks whether the given component has an input called `control`. */
function isShadowedControlComponent(cmp: unknown): boolean {
  const mirror = reflectComponentType((cmp as {}).constructor as Type<unknown>);
  return mirror?.inputs.some((input) => input.templateName === 'control') ?? false;
}

/** Checks whether the given object is an output ref. */
function isOutputRef(value: unknown): value is OutputRef<unknown> {
  return value instanceof OutputEmitterRef || value instanceof EventEmitter;
}
