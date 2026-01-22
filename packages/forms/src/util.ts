/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export function removeListItem<T>(list: T[], el: T): void {
  const index = list.indexOf(el);
  if (index > -1) list.splice(index, 1);
}

import { isEmptyInputValue } from './util';

export function minValidator(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (isEmptyInputValue(value)) {
      return null;
    }

    return value < min ? { min: { min, actual: value } } : null;
  };
}

