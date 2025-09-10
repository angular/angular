/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, runInInjectionContext, untracked} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {FieldNode} from '../node';
import {getInjectorFromOptions} from '../util';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';
import {CompatFieldNodeOptions} from './compat_structure';

export class CompatFieldNode extends FieldNode {
  readonly control: AbstractControl;

  constructor(public readonly options: CompatFieldNodeOptions) {
    super(options);
    this.control = this.options.control as never;
  }
}

/**
 * This is a helper function, simplifying getting control properties after status changes.
 * @param options
 * @param getValue
 */
export const getControlStatusSignal = <T>(
  options: CompatFieldNodeOptions,
  getValue: (c: AbstractControl) => T,
) => {
  return computed(() => {
    // We get control outside untracked call, so it's actually tracked.
    // TODO: Investigate whether we need to handle destruction in a special way.
    const c = options.control();
    return untracked(() => {
      return runInInjectionContext(getInjectorFromOptions(options), () =>
        toSignal(
          c.statusChanges.pipe(
            map(() => {
              return getValue(c);
            }),
          ),
          {
            initialValue: getValue(c),
          },
        ),
      );
    })();
  });
};

/**
 *
 *
 * @param options
 * @param getValue A function which takes control and returns required value.
 */
export const getControlEventsSignal = <T>(
  options: CompatFieldNodeOptions,
  getValue: (c: AbstractControl) => T,
) => {
  return computed(() => {
    // We get control outside untracked call, so it's actually tracked.
    const c = options.control();
    return untracked(() => {
      return runInInjectionContext(getInjectorFromOptions(options), () =>
        toSignal(
          c.events.pipe(
            map(() => {
              return getValue(c);
            }),
          ),
          {
            initialValue: getValue(c),
          },
        ),
      );
    })();
  });
};
