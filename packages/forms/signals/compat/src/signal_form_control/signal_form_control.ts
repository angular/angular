/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EventEmitter, inject, Injector, signal, WritableSignal, effect} from '@angular/core';
import {
  AbstractControl,
  ControlEvent,
  FormArray,
  FormControlStatus,
  FormControlState,
  FormGroup,
  PristineChangeEvent,
  StatusChangeEvent,
  TouchedChangeEvent,
  ValueChangeEvent,
  FormResetEvent,
} from '@angular/forms';

import {compatForm} from '../api/compat_form';
import {signalErrorsToValidationErrors} from '../../../src/api/rules';
import {FormOptions} from '../../../src/api/structure';
import {FieldState, FieldTree, SchemaFn} from '../../../src/api/types';
import {normalizeFormArgs} from '../../../src/util/normalize_form_args';

/** Options used to update the control value. */
export type ValueUpdateOptions = {
  onlySelf?: boolean;
  emitEvent?: boolean;
  emitModelToViewChange?: boolean;
  emitViewToModelChange?: boolean;
};

/**
 * A `FormControl` that is backed by signal forms rules.
 *
 * This class provides a bridge between Signal Forms and Reactive Forms, allowing
 * signal-based controls to be used within a standard `FormGroup` or `FormArray`.
 *
 * @experimental
 */
export class SignalFormControl<T> extends AbstractControl {
  /** Source FieldTree. */
  public readonly fieldTree: FieldTree<T>;
  /** The raw signal driving the control value. */
  public readonly sourceValue: WritableSignal<T>;

  private readonly fieldState: FieldState<T>;
  private pendingParentNotifications = 0;
  override readonly valueChanges = new EventEmitter<T>();
  override readonly statusChanges = new EventEmitter<FormControlStatus>();

  constructor(value: T, schemaOrOptions?: SchemaFn<T> | FormOptions, options?: FormOptions) {
    super(null, null);

    const [model, schema, opts] = normalizeFormArgs<T>([signal(value), schemaOrOptions, options]);
    this.sourceValue = model;
    const injector = opts?.injector ?? inject(Injector);

    this.fieldTree = schema
      ? compatForm(this.sourceValue, schema, {injector})
      : compatForm(this.sourceValue, {injector});
    this.fieldState = this.fieldTree();

    Object.defineProperty(this, 'value', {
      get: () => this.sourceValue(),
    });
    Object.defineProperty(this, 'errors', {
      get: () => signalErrorsToValidationErrors(this.fieldState.errors()),
    });

    // Value changes effect
    effect(
      () => {
        const value = this.sourceValue();
        this.notifyParentUnlessPending();
        this.valueChanges.emit(value);
        this.emitControlEvent(new ValueChangeEvent(value, this));
      },
      {injector},
    );

    // Status changes effect
    effect(
      () => {
        const status = this.status;
        this.statusChanges.emit(status);
        this.emitControlEvent(new StatusChangeEvent(status, this));
      },
      {injector},
    );

    // Touched changes effect
    effect(
      () => {
        const isTouched = this.fieldState.touched();
        this.emitControlEvent(new TouchedChangeEvent(isTouched, this));
        const parent = this.parent;
        if (!parent) {
          return;
        }
        if (!isTouched) {
          parent.markAsUntouched();
        } else {
          parent.markAsTouched();
        }
      },
      {injector},
    );

    // Dirty changes effect
    effect(
      () => {
        const isDirty = this.fieldState.dirty();
        this.emitControlEvent(new PristineChangeEvent(!isDirty, this));
        const parent = this.parent;
        if (!parent) {
          return;
        }
        if (isDirty) {
          parent.markAsDirty();
        } else {
          parent.markAsPristine();
        }
      },
      {injector},
    );
  }

  private emitControlEvent(event: ControlEvent): void {
    (this as any)._events.next(event);
  }

  override setValue(value: any, options?: ValueUpdateOptions): void {
    this.updateValue(value, options);
  }

  override patchValue(value: any, options?: ValueUpdateOptions): void {
    this.updateValue(value, options);
  }

  private updateValue(value: any, options?: ValueUpdateOptions): void {
    const parent = this.scheduleParentUpdate(options);
    this.sourceValue.set(value);
    if (parent) {
      this.updateParentValueAndValidity(parent, options?.emitEvent);
    }
  }

  override getRawValue(): T {
    return this.value;
  }

  override reset(value?: T | FormControlState<T>, options?: ValueUpdateOptions): void {
    if (isFormControlState(value)) {
      value = value.value;
    }

    const resetValue = value ?? this.sourceValue();
    this.fieldState.reset(resetValue as any);

    if (value !== undefined) {
      this.updateValue(value, options);
    } else if (!options?.onlySelf) {
      const parent = this.parent;
      if (parent) {
        this.updateParentValueAndValidity(parent, options?.emitEvent);
      }
    }

    if (options?.emitEvent !== false) {
      this.emitControlEvent(new FormResetEvent(this));
    }
  }

  private scheduleParentUpdate(options?: ValueUpdateOptions): FormGroup | FormArray | null {
    const parent = options?.onlySelf ? null : this.parent;
    if (options?.onlySelf || parent) {
      this.pendingParentNotifications++;
    }
    return parent;
  }

  private notifyParentUnlessPending(): void {
    if (this.pendingParentNotifications > 0) {
      this.pendingParentNotifications--;
      return;
    }
    const parent = this.parent;
    if (parent) {
      this.updateParentValueAndValidity(parent);
    }
  }

  private updateParentValueAndValidity(parent: AbstractControl, emitEvent?: boolean): void {
    parent.updateValueAndValidity({emitEvent, sourceControl: this} as any);
  }

  private propagateToParent(
    opts: {onlySelf?: boolean} | undefined,
    fn: (parent: AbstractControl) => void,
  ) {
    const parent = this.parent;
    if (parent && !opts?.onlySelf) {
      fn(parent);
    }
  }

  override get status(): FormControlStatus {
    if (this.fieldState.disabled()) {
      return 'DISABLED';
    }
    if (this.fieldState.valid()) {
      return 'VALID';
    }
    if (this.fieldState.invalid()) {
      return 'INVALID';
    }
    return 'PENDING';
  }

  override get valid(): boolean {
    return this.fieldState.valid();
  }

  override get invalid(): boolean {
    return this.fieldState.invalid();
  }

  override get pending(): boolean {
    return this.fieldState.pending();
  }

  override get disabled(): boolean {
    return this.fieldState.disabled();
  }

  override get enabled(): boolean {
    return !this.disabled;
  }

  override get dirty(): boolean {
    return this.fieldState.dirty();
  }

  override get pristine(): boolean {
    return !this.dirty;
  }

  override get touched(): boolean {
    return this.fieldState.touched();
  }

  override get untouched(): boolean {
    return !this.touched;
  }

  override markAsTouched(opts?: {onlySelf?: boolean}): void {
    this.fieldState.markAsTouched();
    this.propagateToParent(opts, (parent) => parent.markAsTouched(opts));
  }

  override markAsDirty(opts?: {onlySelf?: boolean}): void {
    this.fieldState.markAsDirty();
    this.propagateToParent(opts, (parent) => parent.markAsDirty(opts));
  }

  override markAsPristine(opts?: {onlySelf?: boolean}): void {
    const wasTouched = this.touched;
    this.fieldState.reset(this.sourceValue());
    if (wasTouched) {
      this.fieldState.markAsTouched();
    }
    this.propagateToParent(opts, (parent) => parent.markAsPristine(opts));
  }

  override markAsUntouched(opts?: {onlySelf?: boolean}): void {
    const wasDirty = this.dirty;
    this.fieldState.reset(this.sourceValue());
    if (wasDirty) {
      this.fieldState.markAsDirty();
    }
    this.propagateToParent(opts, (parent) => parent.markAsUntouched(opts));
  }

  override updateValueAndValidity(_opts?: Object): void {}

  /** @internal */
  _updateValue(): void {}

  /** @internal */
  _forEachChild(_cb: (c: AbstractControl) => void): void {}

  /** @internal */
  _anyControls(_condition: (c: AbstractControl) => boolean): boolean {
    return false;
  }

  /** @internal */
  _allControlsDisabled(): boolean {
    return this.disabled;
  }

  /** @internal */
  _syncPendingControls(): boolean {
    return false;
  }
}

function isFormControlState(formState: unknown): formState is {value: any; disabled: boolean} {
  return (
    typeof formState === 'object' &&
    formState !== null &&
    Object.keys(formState).length === 2 &&
    'value' in formState &&
    'disabled' in formState
  );
}
