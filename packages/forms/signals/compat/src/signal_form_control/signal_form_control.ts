/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injector, signal, WritableSignal} from '@angular/core';
import {AbstractControl, FormControlStatus} from '@angular/forms';

import {compatForm} from '../api/compat_form';
import {signalErrorsToValidationErrors} from '../../../src/api/rules';
import {FormOptions} from '../../../src/api/structure';
import {FieldState, FieldTree, SchemaFn} from '../../../src/api/types';
import {normalizeFormArgs} from '../../../src/util/normalize_form_args';

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
  }

  override setValue(value: any): void {
    this.sourceValue.set(value);
  }

  override patchValue(value: any): void {
    this.sourceValue.set(value);
  }

  override getRawValue(): T {
    return this.value;
  }

  override reset(): void {
    this.fieldState.reset(this.sourceValue());
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
