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
  input,
  InputSignal,
  OutputEmitterRef,
  OutputRef,
  OutputRefSubscription,
  untracked,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {FormUiControl} from '../api/control';
import {Field} from '../api/types';
import {
  illegallyGetComponentInstance,
  illegallyIsModelInput,
  illegallyIsSignalInput,
  illegallySetComponentInput as illegallySetInputSignal,
} from '../util/illegal';
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
    if (this.el.nativeElement instanceof HTMLInputElement) {
      // Bind our field to an <input>
      const input = this.el.nativeElement;
      const isCheckbox = input.type === 'checkbox';

      input.addEventListener('input', () => {
        this.state().value.set((!isCheckbox ? input.value : input.checked) as T);
        this.state().markAsDirty();
      });
      input.addEventListener('blur', () => this.state().markAsTouched());

      effect(
        () => {
          if (!isCheckbox) {
            input.value = this.state().value() as string;
          } else {
            input.checked = this.state().value() as boolean;
          }
        },
        {injector},
      );
    } else if (this.cva !== undefined) {
      const cva = this.cva;
      // Binding to a Control Value Accessor

      cva.registerOnChange((value: T) => this.state().value.set(value));
      cva.registerOnTouched(() => this.state().markAsTouched());

      effect(
        () => {
          const value = this.state().value();
          untracked(() => {
            cva.writeValue(value);
          });
        },
        {injector},
      );
    } else if (isUiControl<T>(cmp)) {
      // Binding to a custom UI component.

      // Input bindings:
      maybeSynchronize(injector, () => this.state().value(), cmp.value);
      maybeSynchronize(injector, () => this.state().disabled(), cmp.disabled);
      maybeSynchronize(injector, () => this.state().readonly(), cmp.readonly);
      maybeSynchronize(injector, () => this.state().errors(), cmp.errors);
      maybeSynchronize(injector, () => this.state().touched(), cmp.touched);
      maybeSynchronize(injector, () => this.state().valid(), cmp.valid);

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
      injector.get(DestroyRef).onDestroy(() => {
        cleanupValue.unsubscribe();
        cleanupTouch?.unsubscribe();
        cleanupDefaultTouch?.();
      });
    } else {
      throw new Error(`Unhandled control?`);
    }
    if (this.cva) {
      this.cva.writeValue(this.state().value());
    }
  }
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

function maybeSynchronize<T>(
  injector: Injector,
  source: () => T,
  target: InputSignal<T> | undefined,
): void {
  if (target === undefined) {
    return;
  }
  effect(() => illegallySetInputSignal(target, source()), {injector});
}
