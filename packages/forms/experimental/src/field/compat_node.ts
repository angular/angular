/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AggregateProperty,
  FieldState,
  Property,
  SubmittedStatus,
} from '@angular/forms/experimental';
import {
  computed,
  inject,
  Injector,
  runInInjectionContext,
  signal,
  Signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {AbstractControl} from '@angular/forms';
import {map} from 'rxjs';
import {ValidationError} from '../api/validation_errors';
import {ChildFieldNodeOptions} from './structure';
import {FieldSubmitState} from './submit';
import {FieldNode} from './node';

export function isAbstractControl(value: any): value is AbstractControl {
  return typeof value?.setValue === 'function' && 'value' in value;
}

// TODO: Dynamic parent
// TODO: Figure out async + clean up
export class ControlToFieldConverter implements FieldState<unknown> {
  readonly control: WritableSignal<AbstractControl>;
  readonly dirty: Signal<boolean>;
  readonly disabled: Signal<boolean>;
  readonly disabledReasons;
  readonly errors = signal([]);
  readonly invalid = computed(() => !this.valid());
  readonly keyInParent: Signal<string | number>;
  readonly pending: Signal<boolean>;
  readonly readonly = signal(false);

  get submittedStatus(): Signal<SubmittedStatus> {
    return this.submitState.submittedStatus;
  }

  readonly syncErrors: Signal<ValidationError[]> = signal([]);
  readonly syncValid: Signal<boolean>;
  readonly touched: Signal<boolean>;
  readonly hidden: Signal<boolean>;
  readonly valid: Signal<boolean>;
  readonly value: WritableSignal<unknown>;
  readonly submitState: FieldSubmitState;
  readonly injector: Injector;

  constructor(private readonly options: ChildFieldNodeOptions) {
    this.injector = options.parent.structure.root.structure.fieldManager.injector;
    this.control = computed(() => {
      return (options.parent.value() as any)[options.initialKeyInParent];
    }) as WritableSignal<AbstractControl>;

    // TODO: is the parent dynamic?
    this.disabledReasons = computed(() => {
      return [...(this.options.parent?.nodeState.disabledReasons() ?? [])];
    });

    this.submitState = new FieldSubmitState({
      structure: {
        value: options.value,
        parent: this.options.parent,
        children: signal([]) as any,
      },
    } as FieldNode);

    this.keyInParent = signal(this.options.initialKeyInParent);

    const getControlStatusSignal = <T>(getValue: (c: AbstractControl) => T) => {
      return computed(() => {
        const control = this.control();
        return untracked(() => {
          return runInInjectionContext(this.injector, () =>
            toSignal(
              control.statusChanges.pipe(
                map(() => {
                  return getValue(control);
                }),
              ),
              {
                initialValue: getValue(control),
              },
            ),
          );
        })();
      });
    };

    this.pending = getControlStatusSignal((c) => c.pending);
    this.valid = getControlStatusSignal((c) => c.valid);
    this.touched = getControlStatusSignal((c) => c.touched);
    this.dirty = getControlStatusSignal((c) => c.dirty);
    this.syncValid = getControlStatusSignal((c) => c.status === 'VALID');

    const controlDisabled = getControlStatusSignal((c) => c.disabled);

    this.disabled = computed(() => {
      return controlDisabled() || this.disabledReasons().length > 0;
    });

    this.hidden = computed(() => {
      return this.options.parent?.nodeState.hidden();
    });

    const controlValue = computed(() => {
      const control = this.control();
      return untracked(() => {
        return runInInjectionContext(this.injector, () => {
          return toSignal(control.valueChanges, {initialValue: control.value});
        });
      })();
    }) as WritableSignal<any>;

    const value = computed(() => {
      return controlValue();
    }) as WritableSignal<any>;

    value.set = (v: any) => {
      this.control().setValue(v);
    };
    this.value = value;
  }

  property<M>(prop: AggregateProperty<M, any>): Signal<M>;
  property<M>(prop: Property<M>): M | undefined;
  property<M>(prop: unknown): M | Signal<M> | undefined {
    throw new Error('Method not implemented.');
  }

  reset(): void {
    throw new Error('Method not implemented.');
  }

  markAsDirty(): void {
    this.control().markAsDirty();
    this.control().updateValueAndValidity();
  }

  markAsTouched(): void {
    this.control().markAsTouched();
    this.control().updateValueAndValidity();
  }

  /**
   * Resets the submitted status of this field and all of its children.
   */
  resetSubmittedStatus(): void {
    this.submitState.reset();
  }
}
