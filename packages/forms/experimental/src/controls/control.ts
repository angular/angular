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
  input,
  InputSignal,
  OutputEmitterRef,
  OutputRef,
  OutputRefSubscription,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {FormUiControl} from '../api/control';
import {Field} from '../api/types';
import {
  illegallyGetComponentInstance,
  illegallyIsModelInput,
  illegallyIsSignalInput,
  illegallySetComponentInput as illegallySetInputSignal,
} from '../illegal';
import {InteropNgControl} from './interop_ng_control';

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
  readonly field = input.required<Field<T>>({alias: 'control'});
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

  ngOnInit() {
    const injector = this.injector;
    const cmp = illegallyGetComponentInstance(injector);

    if (cmp && isUiControl<T>(cmp)) {
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

  // Bind our field to an <input> or <textarea>
  private setupNativeInput(input: HTMLInputElement | HTMLTextAreaElement): void {
    const isCheckbox = input instanceof HTMLInputElement && input.type === 'checkbox';

    input.addEventListener('input', () => {
      this.state().value.set((!isCheckbox ? input.value : input.checked) as T);
      this.state().markAsDirty();
    });
    input.addEventListener('blur', () => this.state().markAsTouched());

    this.maybeSynchronize(() => this.state().readonly(), withBooleanAttribute(input, 'readonly'));
    this.maybeSynchronize(() => this.state().disabled(), withBooleanAttribute(input, 'disabled'));

    if (!isCheckbox) {
      this.maybeSynchronize(
        () => this.state().value(),
        (value) => (input.value = value as string),
      );
    } else {
      this.maybeSynchronize(
        () => this.state().value(),
        (value) => (input.checked = value as boolean),
      );
    }
  }

  // Binding to a Control Value Accessor
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

  // Binding to a custom UI component.
  private setupCustomUiControl(cmp: FormUiControl<T>) {
    // Input bindings:
    this.maybeSynchronize(() => this.state().value(), withInput(cmp.value));
    this.maybeSynchronize(() => this.state().disabled(), withInput(cmp.disabled));
    this.maybeSynchronize(() => this.state().readonly(), withInput(cmp.readonly));
    this.maybeSynchronize(() => this.state().errors(), withInput(cmp.errors));
    this.maybeSynchronize(() => this.state().touched(), withInput(cmp.touched));
    this.maybeSynchronize(() => this.state().valid(), withInput(cmp.valid));

    // Output bindings:
    const cleanupValue = cmp.value.subscribe((newValue) => this.state().value.set(newValue));
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
      cleanupValue.unsubscribe();
      cleanupTouch?.unsubscribe();
      cleanupDefaultTouch?.();
    });
  }

  private maybeSynchronize<T>(source: () => T, sink: ((value: T) => void) | undefined): void {
    if (!sink) {
      return;
    }
    effect(() => sink(source()), {injector: this.injector});
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

function isUiControl<T>(cmp: unknown): cmp is FormUiControl<T> {
  const castCmp = cmp as FormUiControl<unknown>;
  return (
    illegallyIsModelInput(castCmp.value) &&
    (!castCmp.disabled || illegallyIsSignalInput(castCmp.disabled)) &&
    (!castCmp.errors || illegallyIsSignalInput(castCmp.errors)) &&
    (!castCmp.valid || illegallyIsSignalInput(castCmp.valid)) &&
    (!castCmp.touched || illegallyIsSignalInput(castCmp.touched)) &&
    (!castCmp.touch || isOutputRef(castCmp.touch))
  );
}

function isOutputRef(value: unknown): value is OutputRef<unknown> {
  return value instanceof OutputEmitterRef || value instanceof EventEmitter;
}
