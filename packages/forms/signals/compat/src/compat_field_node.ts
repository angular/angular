/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, linkedSignal, runInInjectionContext, Signal, untracked} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {FieldNode} from '../../src/field/node';
import {getInjectorFromOptions} from '../../src/field/util';
import {toSignal} from '@angular/core/rxjs-interop';
import {map, takeUntil} from 'rxjs/operators';
import type {CompatFieldNodeOptions} from './compat_structure';
import {Observable, ReplaySubject} from 'rxjs';

/**
 * Field node with additional  control property.
 *
 * Compat node has no children.
 */
export class CompatFieldNode extends FieldNode {
  readonly control: Signal<AbstractControl>;

  constructor(public readonly options: CompatFieldNodeOptions) {
    super(options);
    this.control = this.options.control;
  }
}

function makeCreateDestroy() {
  let destroy$ = new ReplaySubject<void>(1);
  return () => {
    if (destroy$) {
      destroy$.next();
      destroy$.complete();
    }
    return (destroy$ = new ReplaySubject<void>(1));
  };
}

/**
 * Helper function taking options, and a callback which takes options, and a function
 * converting reactive control to appropriate property using toSignal from rxjs compat.
 *
 * This helper keeps all complexity in one place by doing the following things:
 * - Running the callback in injection context
 * - Not tracking the callback, as it creates a new signal.
 * - Reacting to control changes, allowing to swap control dynamically.
 *
 * @param options
 * @param makeSignal
 */
export function extractControlPropToSignal<T, R = T>(
  options: CompatFieldNodeOptions,
  makeSignal: (c: AbstractControl<T>, destroy$: Observable<void>) => Signal<R>,
): Signal<R> {
  const injector = getInjectorFromOptions(options);
  const createDestroy = makeCreateDestroy();

  const signalOfControlSignal = linkedSignal({
    source: options.control,
    computation: (control) => {
      return untracked(() => {
        return runInInjectionContext(injector, () => makeSignal(control, createDestroy()));
      });
    },
  });

  // We have to have computed, because we need to react to both:
  // linked signal changes as well as the inner signal changes.
  return computed(() => signalOfControlSignal()());
}

/**
 * A helper function, simplifying getting reactive control properties after status changes.
 *
 * Used to extract errors and statuses such as valid, pending.
 *
 * @param options
 * @param getValue
 */
export const getControlStatusSignal = <T>(
  options: CompatFieldNodeOptions,
  getValue: (c: AbstractControl<unknown>) => T,
) => {
  return extractControlPropToSignal<unknown, T>(options, (c, destroy$) =>
    toSignal(
      c.statusChanges.pipe(
        map(() => getValue(c)),
        takeUntil(destroy$),
      ),
      {
        initialValue: getValue(c),
      },
    ),
  );
};

/**
 * A helper function, simplifying converting convert events to signals.
 *
 * Used to get dirty and touched signals from control.
 *
 *  @param options
 * @param getValue A function which takes control and returns required value.
 */
export const getControlEventsSignal = <T>(
  options: CompatFieldNodeOptions,
  getValue: (c: AbstractControl) => T,
) => {
  return extractControlPropToSignal<unknown, T>(options, (c, destroy$) =>
    toSignal(
      c.events.pipe(
        map(() => {
          return getValue(c);
        }),
        takeUntil(destroy$),
      ),
      {
        initialValue: getValue(c),
      },
    ),
  );
};
