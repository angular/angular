/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
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
} from '../illegal';
import {InteropNgControl} from './interop_ng_control';

@Directive({
  selector: '[field]',
  providers: [{provide: NgControl, useFactory: () => inject(FieldDirective).ngControl}],
})
export class FieldDirective<T> {
  readonly injector = inject(Injector);
  readonly field = input.required<Field<T>>();
  readonly el: ElementRef<HTMLElement> = inject(ElementRef);
  readonly cvaArray = inject<ControlValueAccessor[]>(NG_VALUE_ACCESSOR, {optional: true});

  private _ngControl: InteropNgControl | undefined;

  get ngControl(): NgControl {
    return (this._ngControl ??= new InteropNgControl(
      () => this.field().$state,
    )) as unknown as NgControl;
  }

  get cva(): ControlValueAccessor | undefined {
    return this.cvaArray?.[0] ?? this._ngControl?.valueAccessor ?? undefined;
  }

  ngOnInit() {
    const injector = this.injector;
    const cmp = illegallyGetComponentInstance(injector);
    if (this.el.nativeElement instanceof HTMLInputElement) {
      // Bind our field to an <input>

      const i = this.el.nativeElement;
      const isCheckbox = i.type === 'checkbox';

      i.addEventListener('input', () => {
        this.field().$state.value.set((!isCheckbox ? i.value : i.checked) as T);
      });
      i.addEventListener('blur', () => this.field().$state.markAsTouched());

      effect(
        () => {
          if (!isCheckbox) {
            i.value = this.field().$state.value() as string;
          } else {
            i.checked = this.field().$state.value() as boolean;
          }
        },
        {injector},
      );
    } else if (this.cva !== undefined) {
      const cva = this.cva;
      // Binding to a Control Value Accessor

      cva.registerOnChange((value: T) => this.field().$state.value.set(value));
      cva.registerOnTouched(() => this.field().$state.markAsTouched());

      effect(
        () => {
          const value = this.field().$state.value();
          untracked(() => {
            cva.writeValue(value);
          });
        },
        {injector},
      );
    } else if (isUiControl<T>(cmp)) {
      // Binding to a custom UI component.

      // Input bindings:
      maybeSynchronize(injector, () => this.field().$state.value(), cmp.value);
      maybeSynchronize(injector, () => this.field().$state.disabled(), cmp.disabled);
      maybeSynchronize(injector, () => this.field().$state.readonly(), cmp.readonly);
      maybeSynchronize(injector, () => this.field().$state.errors(), cmp.errors);
      maybeSynchronize(injector, () => this.field().$state.touched(), cmp.touched);
      maybeSynchronize(injector, () => this.field().$state.valid(), cmp.valid);

      // Output bindings:
      const cleanupValue = cmp.value.subscribe((newValue) =>
        this.field().$state.value.set(newValue),
      );
      let cleanupTouch: OutputRefSubscription | undefined;
      let cleanupDefaultTouch: (() => void) | undefined;
      if (cmp.touch !== undefined) {
        cleanupTouch = cmp.touch.subscribe(() => this.field().$state.markAsTouched());
      } else {
        // If the component did not give us a touch event stream, use the standard touch logic,
        // marking it touched when the focus moves from inside the host element to outside.
        const listener = (event: FocusEvent) => {
          const newActiveEl = event.relatedTarget;
          if (!this.el.nativeElement.contains(newActiveEl as Element | null)) {
            this.field().$state.markAsTouched();
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
      this.cva.writeValue(this.field().$state.value());
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
