/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
  signal,
  untracked,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {BaseUiControl, FormCheckboxControl, FormValueControl} from '../api/control';
import {Field} from '../api/types';
import {
  illegallyGetComponentInstance,
  illegallyIsModelInput,
  illegallyIsSignalInput,
  illegallyRunEffect,
  illegallySetComponentInput as illegallySetInputSignal,
} from '../illegal';
import {InteropNgControl} from './interop_ng_control';
import {AggregateProperty, MAX, MAX_LENGTH, MIN, MIN_LENGTH} from '../api/property';

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
  readonly injector = inject(Injector);
  readonly field = signal<Field<T>>(undefined as any);

  private initialized = false;

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

  // readonly field = input.required<Field<T>>({alias: 'control'});
  readonly state = computed(() => this.field()());
  readonly el: ElementRef<HTMLElement> = inject(ElementRef);
  readonly cvaArray = inject<ControlValueAccessor[]>(NG_VALUE_ACCESSOR, {optional: true});

  private _ngControl: InteropNgControl | undefined;

  get ngControl(): NgControl {
    return (this._ngControl ??= new InteropNgControl(() => this.state())) as unknown as NgControl;
  }

  get cva(): ControlValueAccessor | undefined {
    return this.cvaArray?.[0] ?? this._ngControl?.valueAccessor ?? undefined;
  }

  private initialize() {
    this.initialized = true;
    const injector = this.injector;
    const cmp = illegallyGetComponentInstance(injector);

    if (cmp && isBaseUiControl(cmp)) {
      this.setupCustomUiControl(cmp);
    } else if (
      this.el.nativeElement instanceof HTMLInputElement ||
      this.el.nativeElement instanceof HTMLTextAreaElement
    ) {
      this.setupNativeInput(this.el.nativeElement);
    } else if (this.cva !== undefined) {
      this.setupControlValueAccessor(this.cva);
    } else {
      throw new Error(`Unhandled control?`);
    }

    if (this.cva) {
      this.cva.writeValue(this.state().value());
      this.cva.setDisabledState?.(this.state().disabled());
    }
  }

  /**
   * Bind our field to an <input> or <textarea>.
   */
  private setupNativeInput(input: HTMLInputElement | HTMLTextAreaElement): void {
    const inputType = input instanceof HTMLTextAreaElement ? 'text' : input.type;

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
    this.maybeSynchronize(() => this.state().disabled(), withBooleanAttribute(input, 'disabled'));
    this.maybeSynchronize(() => this.state().name(), withAttribute(input, 'name'));

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

  /**
   * Binding to a `ControlValueAccessor` based UI control
   */
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
  }

  /**
   * Connect to a UI component that implements the control interface.
   */
  private setupCustomUiControl(cmp: BaseUiControl) {
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
    this.maybeSynchronize(() => this.state().readonly(), withInput(cmp.readonly));
    this.maybeSynchronize(() => this.state().errors(), withInput(cmp.errors));
    this.maybeSynchronize(() => this.state().touched(), withInput(cmp.touched));
    this.maybeSynchronize(() => this.state().valid(), withInput(cmp.valid));

    this.maybeSynchronize(this.propertySource(MIN), withInput(cmp.min));
    this.maybeSynchronize(this.propertySource(MIN_LENGTH), withInput(cmp.minLength));
    this.maybeSynchronize(this.propertySource(MAX), withInput(cmp.max));
    this.maybeSynchronize(this.propertySource(MAX_LENGTH), withInput(cmp.maxLength));

    let cleanupTouch: OutputRefSubscription | undefined;
    let cleanupDefaultTouch: (() => void) | undefined;
    if (cmp.touch !== undefined) {
      cleanupTouch = cmp.touch.subscribe(() => this.state().markAsTouched());
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

  private propertySource<T>(key: AggregateProperty<T, any>): () => T | undefined {
    const metaSource = computed(() =>
      this.state().hasProperty(key) ? this.state().property(key) : undefined,
    );
    return () => metaSource()?.();
  }
}

function withInput<T>(input: InputSignal<T> | undefined): ((value: T) => void) | undefined {
  return input ? (value: T) => illegallySetInputSignal(input, value) : undefined;
}

function withBooleanAttribute(element: HTMLElement, attribute: string): (value: boolean) => void {
  return (value) => {
    if (value) {
      element.setAttribute(attribute, '');
    } else {
      element.removeAttribute(attribute);
    }
  };
}

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

function isBaseUiControl(cmp: unknown): cmp is BaseUiControl {
  const castCmp = cmp as BaseUiControl;
  return (
    (isFormValueControl(castCmp) || isFormCheckboxControl(castCmp)) &&
    (castCmp.readonly === undefined || illegallyIsSignalInput(castCmp.readonly)) &&
    (castCmp.disabled === undefined || illegallyIsSignalInput(castCmp.disabled)) &&
    (castCmp.errors === undefined || illegallyIsSignalInput(castCmp.errors)) &&
    (castCmp.valid === undefined || illegallyIsSignalInput(castCmp.valid)) &&
    (castCmp.touched === undefined || illegallyIsSignalInput(castCmp.touched)) &&
    (castCmp.touch === undefined || isOutputRef(castCmp.touch)) &&
    (castCmp.min === undefined || illegallyIsSignalInput(castCmp.min)) &&
    (castCmp.minLength === undefined || illegallyIsSignalInput(castCmp.minLength)) &&
    (castCmp.max === undefined || illegallyIsSignalInput(castCmp.max)) &&
    (castCmp.maxLength === undefined || illegallyIsSignalInput(castCmp.maxLength))
  );
}

function isFormValueControl(cmp: BaseUiControl): cmp is FormValueControl<unknown> {
  return illegallyIsModelInput((cmp as FormValueControl<unknown>).value);
}

function isFormCheckboxControl(cmp: BaseUiControl): cmp is FormCheckboxControl {
  return (
    illegallyIsModelInput((cmp as FormCheckboxControl).checked) &&
    (cmp as FormCheckboxControl).value === undefined
  );
}

function isOutputRef(value: unknown): value is OutputRef<unknown> {
  return value instanceof OutputEmitterRef || value instanceof EventEmitter;
}
