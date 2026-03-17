/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  effect,
  EventEmitter,
  inject,
  Injector,
  ɵRuntimeError as RuntimeError,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import {
  AbstractControl,
  ControlEvent,
  FormArray,
  FormControlState,
  FormControlStatus,
  FormGroup,
  FormResetEvent,
  PristineChangeEvent,
  StatusChangeEvent,
  TouchedChangeEvent,
  ValueChangeEvent,
} from '@angular/forms';

import {FormOptions} from '../../../src/api/structure';
import {FieldState, FieldTree, SchemaFn} from '../../../src/api/types';
import {signalErrorsToValidationErrors} from '../../../src/compat/validation_errors';
import {RuntimeErrorCode} from '../../../src/errors';
import {FieldNode} from '../../../src/field/node';
import {normalizeFormArgs} from '../../../src/util/normalize_form_args';
import {compatForm} from '../api/compat_form';

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
 * A control could be created using signal forms, and integrated with an existing FormGroup
 * propagating all the statuses and validity.
 *
 * @usageNotes
 *
 * ### Basic usage
 *
 * ```angular-ts
 * const form = new FormGroup({
 *   // You can create SignalFormControl with signal form rules, and add it to a FormGroup.
 *   name: new SignalFormControl('Alice', p => {
 *     required(p);
 *   }),
 *   age: new FormControl(25),
 * });
 * ```
 * In the template you can get the underlying `fieldTree` and bind it:
 *
 * ```angular-html
 *  <form [formGroup]="form">
 *    <input [formField]="nameControl.fieldTree" />
 *    <input formControlName="age" />
 *  </form>
 * ```
 *
 * @experimental
 */
export class SignalFormControl<T> extends AbstractControl {
  /** Source FieldTree. */
  public readonly fieldTree: FieldTree<T>;
  /** The raw signal driving the control value. */
  public readonly sourceValue: WritableSignal<T>;

  private readonly fieldState: FieldState<T>;
  private readonly initialValue: T;
  private pendingParentNotifications = 0;
  private readonly onChangeCallbacks: Array<(value?: any, emitModelEvent?: boolean) => void> = [];
  private readonly onDisabledChangeCallbacks: Array<(isDisabled: boolean) => void> = [];
  override readonly valueChanges = new EventEmitter<T>();
  override readonly statusChanges = new EventEmitter<FormControlStatus>();

  constructor(value: T, schemaOrOptions?: SchemaFn<T> | FormOptions<T>, options?: FormOptions<T>) {
    super(null, null);

    const [model, schema, opts] = normalizeFormArgs<T>([signal(value), schemaOrOptions, options]);
    this.sourceValue = model;
    this.initialValue = value;
    const injector = opts?.injector ?? inject(Injector);

    const rawTree = schema
      ? compatForm(this.sourceValue, schema, {injector})
      : compatForm(this.sourceValue, {injector});

    this.fieldTree = wrapFieldTreeForSyncUpdates(rawTree, () =>
      this.parent?.updateValueAndValidity({sourceControl: this} as any),
    );
    this.fieldState = this.fieldTree();

    this.defineCompatProperties();

    // Value changes effect
    effect(
      () => {
        const value = this.sourceValue();
        untracked(() => {
          this.notifyParentUnlessPending();
          this.valueChanges.emit(value);
          this.emitControlEvent(new ValueChangeEvent(value, this));
        });
      },
      {injector},
    );

    // Status changes effect
    effect(
      () => {
        const status = this.status;
        untracked(() => {
          this.statusChanges.emit(status);
        });
        this.emitControlEvent(new StatusChangeEvent(status, this));
      },
      {injector},
    );

    // Disabled changes effect
    effect(
      () => {
        const isDisabled = this.disabled;
        untracked(() => {
          for (const fn of this.onDisabledChangeCallbacks) {
            fn(isDisabled);
          }
        });
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

  /**
   * Defines properties using closure-safe names to prevent issues with property renaming optimizations.
   *
   * AbstractControl have `value` and `errors` as readonly prop, which doesn't allow getters.
   **/
  private defineCompatProperties(): void {
    const valueProp = getClosureSafeProperty({value: getClosureSafeProperty});
    Object.defineProperty(this, valueProp, {
      get: () => this.sourceValue(),
    });
    const errorsProp = getClosureSafeProperty({errors: getClosureSafeProperty});
    Object.defineProperty(this, errorsProp, {
      get: () => signalErrorsToValidationErrors(this.fieldState.errors()),
    });
  }

  private emitControlEvent(event: ControlEvent): void {
    untracked(() => {
      (this as any)._events.next(event);
    });
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
    if (options?.emitModelToViewChange !== false) {
      for (const fn of this.onChangeCallbacks) {
        fn(value, true);
      }
    }
  }

  registerOnChange(fn: (value?: any, emitModelEvent?: boolean) => void): void {
    this.onChangeCallbacks.push(fn);
  }

  /** @internal */
  _unregisterOnChange(fn: (value?: any, emitModelEvent?: boolean) => void): void {
    removeListItem(this.onChangeCallbacks, fn);
  }

  registerOnDisabledChange(fn: (isDisabled: boolean) => void): void {
    this.onDisabledChangeCallbacks.push(fn);
  }

  /** @internal */
  _unregisterOnDisabledChange(fn: (isDisabled: boolean) => void): void {
    removeListItem(this.onDisabledChangeCallbacks, fn);
  }

  override getRawValue(): T {
    return this.value;
  }

  override reset(value?: T | FormControlState<T>, options?: ValueUpdateOptions): void {
    if (isFormControlState(value)) {
      throw unsupportedDisableEnableError();
    }

    const resetValue = value ?? this.initialValue;
    this.fieldState.reset(resetValue);

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

  override set dirty(_: boolean) {
    throw unsupportedFeatureError(
      ngDevMode && 'Setting dirty directly is not supported. Instead use markAsDirty().',
    );
  }

  override get pristine(): boolean {
    return !this.dirty;
  }

  override set pristine(_: boolean) {
    throw unsupportedFeatureError(
      ngDevMode && 'Setting pristine directly is not supported. Instead use reset().',
    );
  }

  override get touched(): boolean {
    return this.fieldState.touched();
  }

  override set touched(_: boolean) {
    throw unsupportedFeatureError(
      ngDevMode &&
        'Setting touched directly is not supported. Instead use markAsTouched() or reset().',
    );
  }

  override get untouched(): boolean {
    return !this.touched;
  }

  override set untouched(_: boolean) {
    throw unsupportedFeatureError(
      ngDevMode && 'Setting untouched directly is not supported. Instead use reset().',
    );
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
    (this.fieldState as FieldNode).markAsPristine();
    this.propagateToParent(opts, (parent) => parent.markAsPristine(opts));
  }

  override markAsUntouched(opts?: {onlySelf?: boolean}): void {
    (this.fieldState as FieldNode).markAsUntouched();
    this.propagateToParent(opts, (parent) => parent.markAsUntouched(opts));
  }

  override updateValueAndValidity(_opts?: Object): void {}

  /** @internal */
  // @ts-ignore
  override _updateValue(): void {}

  /** @internal */
  // @ts-ignore
  override _forEachChild(_cb: (c: AbstractControl) => void): void {}

  /** @internal */
  // @ts-ignore
  override _anyControls(_condition: (c: AbstractControl) => boolean): boolean {
    return false;
  }

  /** @internal */
  // @ts-ignore
  override _allControlsDisabled(): boolean {
    return this.disabled;
  }

  /** @internal */
  // @ts-ignore
  override _syncPendingControls(): boolean {
    return false;
  }

  override disable(_opts?: {onlySelf?: boolean; emitEvent?: boolean}): void {
    throw unsupportedDisableEnableError();
  }

  override enable(_opts?: {onlySelf?: boolean; emitEvent?: boolean}): void {
    throw unsupportedDisableEnableError();
  }

  override setValidators(_validators: any): void {
    throw unsupportedValidatorsError();
  }

  override setAsyncValidators(_validators: any): void {
    throw unsupportedValidatorsError();
  }

  override addValidators(_validators: any): void {
    throw unsupportedValidatorsError();
  }

  override addAsyncValidators(_validators: any): void {
    throw unsupportedValidatorsError();
  }

  override removeValidators(_validators: any): void {
    throw unsupportedValidatorsError();
  }

  override removeAsyncValidators(_validators: any): void {
    throw unsupportedValidatorsError();
  }

  override clearValidators(): void {
    throw unsupportedValidatorsError();
  }

  override clearAsyncValidators(): void {
    throw unsupportedValidatorsError();
  }

  override setErrors(_errors: any, _opts?: {emitEvent?: boolean}): void {
    throw unsupportedFeatureError(
      ngDevMode &&
        'Imperatively setting errors is not supported in signal forms. Errors are derived from validation rules.',
    );
  }

  override markAsPending(_opts?: {onlySelf?: boolean; emitEvent?: boolean}): void {
    throw unsupportedFeatureError(
      ngDevMode &&
        'Imperatively marking as pending is not supported in signal forms. Pending state is derived from async validation status.',
    );
  }
}

class CachingWeakMap<K extends object, V> {
  private readonly map = new WeakMap<K, V>();

  getOrCreate(key: K, create: () => V): V {
    const cached = this.map.get(key);
    if (cached) {
      return cached;
    }
    const value = create();
    this.map.set(key, value);
    return value;
  }
}

/**
 * A FieldTree proxy that patches setters to immediately react on value changes.
 * @param tree
 * @param onUpdate
 */
function wrapFieldTreeForSyncUpdates<T>(tree: FieldTree<T>, onUpdate: () => void): FieldTree<T> {
  const treeCache = new CachingWeakMap<FieldTree<unknown>, FieldTree<unknown>>();
  const stateCache = new CachingWeakMap<FieldState<unknown>, FieldState<unknown>>();

  // Takes a FieldState and wraps a value to instantly call onUpdate.
  const wrapState = (state: FieldState<unknown>): FieldState<unknown> => {
    const {value} = state;
    const wrappedValue = Object.assign((...a: unknown[]) => (value as Function)(...a), {
      set: (v: unknown) => {
        value.set(v);
        onUpdate();
      },
      update: (fn: (v: unknown) => unknown) => {
        value.update(fn);
        onUpdate();
      },
    }) as WritableSignal<unknown>;
    return Object.create(state, {value: {get: () => wrappedValue}});
  };
  // Takes a FieldTree and wraps it's state's value to instantly call onUpdate.
  const wrapTree = (t: FieldTree<unknown>): FieldTree<unknown> => {
    return treeCache.getOrCreate(t, () => {
      return new Proxy(t, {
        // When getting a prop, wrap FieldTree if it's a function
        get(target, prop, receiver) {
          const val = Reflect.get(target, prop, receiver);
          // Some of FieldTree children are not function, e.g. length.
          if (typeof val === 'function' && typeof prop === 'string') {
            return wrapTree(val);
          }
          return val;
        },
        // When calling the tree, wrap the returned state
        apply(target, _, args) {
          const state: FieldState<unknown> = (target as Function)(...args);
          return stateCache.getOrCreate(state, () => wrapState(state));
        },
      }) as FieldTree<unknown>;
    });
  };

  return wrapTree(tree) as FieldTree<T>;
}

function isFormControlState(formState: unknown): formState is FormControlState<unknown> {
  return (
    typeof formState === 'object' &&
    formState !== null &&
    Object.keys(formState).length === 2 &&
    'value' in formState &&
    'disabled' in formState
  );
}

function unsupportedFeatureError(message: string | null): Error {
  return new RuntimeError(RuntimeErrorCode.UNSUPPORTED_FEATURE, message ?? false);
}

function unsupportedDisableEnableError(): Error {
  return unsupportedFeatureError(
    ngDevMode &&
      'Imperatively changing enabled/disabled status in form control is not supported in signal forms. Instead use a "disabled" rule to derive the disabled status from a signal.',
  );
}

function unsupportedValidatorsError(): Error {
  return unsupportedFeatureError(
    ngDevMode &&
      'Dynamically adding and removing validators is not supported in signal forms. Instead use the "applyWhen" rule to conditionally apply validators based on a signal.',
  );
}

function removeListItem<T>(list: T[], el: T): void {
  const index = list.indexOf(el);
  if (index > -1) list.splice(index, 1);
}

function getClosureSafeProperty<T>(objWithPropertyToExtract: T): string {
  for (let key in objWithPropertyToExtract) {
    if (objWithPropertyToExtract[key] === (getClosureSafeProperty as any)) {
      return key;
    }
  }
  throw Error(
    typeof ngDevMode === 'undefined' || ngDevMode
      ? 'Could not find renamed property on target object.'
      : '',
  );
}
