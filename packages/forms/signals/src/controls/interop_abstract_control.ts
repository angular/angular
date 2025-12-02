/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FieldTree} from '../api/types';
import {InteropBase} from './interop_base';
import {REQUIRED} from '../api/metadata';
import {type AbstractControl, type ValidatorFn, Validators} from '@angular/forms';

// TODO: Also consider supporting (if possible):
// - hasError
// - getError
// - reset
// - name
// - path
// - markAs[Touched,Dirty,etc.]

export type InteropAbstractControlKeys = 'hasValidator' | 'setValue' | 'updateValueAndValidity';

/**
 * A functional wrapper for InteropAbstractControl, which handles the type casting.
 *
 * @param f Field tree
 */
export function createInteropControl<T>(f: FieldTree<T>) {
  return new InteropAbstractControl(f) as unknown as AbstractControl<T>;
}

/**
 * Implementation for an AbstractControl that takes a FieldTree, and proxies relevant properties.
 *
 * This can be used to include a signal form in a reactive form, and also when binding signal
 * forms to components that take AbstractControls.
 *
 * It doesn't extend or implements AbstractControl, because it has 70+ props, some of which are private.
 */
export class InteropAbstractControl<T>
  extends InteropBase<T>
  implements Pick<AbstractControl<unknown>, InteropAbstractControlKeys>
{
  constructor(field: FieldTree<T>) {
    super(field);
  }

  setValue(v: T): void {
    (this.field().value as any).set(v);
  }

  hasValidator(validator: ValidatorFn): boolean {
    // This addresses a common case where users look for the presence of `Validators.required` to
    // determine whether to show a required "*" indicator in the UI.
    if (validator === Validators.required) {
      return this.field().metadata(REQUIRED)();
    }
    return false;
  }

  updateValueAndValidity() {
    // No-op since value and validity are always up to date in signal forms.
    // We offer this method so that reactive forms code attempting to call it doesn't error.
  }
}
