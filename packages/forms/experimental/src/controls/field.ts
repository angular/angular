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
  untracked,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {FormUiControl} from '../api/control';
import {Form} from '../api/types';
import {
  illegallyGetComponentInstance,
  illegallyIsModelInput,
  illegallyIsSignalInput,
  illegallySetComponentInput as illegallySetInputSignal,
} from '../illegal';
import {InteropNgControl} from './interop_ng_control';

@Directive({
  selector: '[field]',
  providers: [{provide: NgControl, useFactory: () => inject(Field).ngControl}],
})
export class Field<T> {
  readonly injector = inject(Injector);
  readonly field = input.required<Form<T>>();
  readonly el = inject(ElementRef);
  readonly cvaArray = inject<ControlValueAccessor[]>(NG_VALUE_ACCESSOR, {optional: true});

  private _ngControl: InteropNgControl | undefined;

  get ngControl(): NgControl {
    return (this._ngControl ??= new InteropNgControl(
      () => this.field().$api,
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
        this.field().$api.value.set((!isCheckbox ? i.value : i.checked) as T);
      });
      i.addEventListener('blur', () => this.field().$api.markAsTouched());

      effect(
        () => {
          if (!isCheckbox) {
            i.value = this.field().$api.value() as string;
          } else {
            i.checked = this.field().$api.value() as boolean;
          }
        },
        {injector},
      );
    } else if (this.cva !== undefined) {
      const cva = this.cva;
      // Binding to a Control Value Accessor

      cva.registerOnChange((value: T) => this.field().$api.value.set(value));
      cva.registerOnTouched(() => this.field().$api.markAsTouched());

      effect(
        () => {
          const value = this.field().$api.value();
          untracked(() => {
            cva.writeValue(value);
          });
        },
        {injector},
      );
    } else if (isUiControl<T>(cmp)) {
      // Binding to a custom UI component.

      // Input bindings:
      maybeSynchronize(injector, () => this.field().$api.value(), cmp.value);
      maybeSynchronize(injector, () => this.field().$api.disabled(), cmp.disabled);
      maybeSynchronize(injector, () => this.field().$api.errors(), cmp.errors);
      maybeSynchronize(injector, () => this.field().$api.touched(), cmp.touched);
      maybeSynchronize(injector, () => this.field().$api.valid(), cmp.valid);

      // Output bindings:
      const cleanupValue = cmp.value.subscribe((newValue) => this.field().$api.value.set(newValue));
      const cleanupTouch = cmp.touch?.subscribe(() => this.field().$api.markAsTouched());

      // Cleanup for output binding subscriptions:
      injector.get(DestroyRef).onDestroy(() => {
        cleanupValue.unsubscribe();
        cleanupTouch?.unsubscribe();
      });
    } else {
      throw new Error(`Unhandled control?`);
    }
    if (this.cva) {
      this.cva.writeValue(this.field().$api.value());
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
