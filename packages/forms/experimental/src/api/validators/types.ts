/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {LogicFn, ValidationResult} from '@angular/forms/experimental';

// TODO(kirjs): Consider using {length: number}
export type ValueWithLength = Array<unknown> | string;


export interface BaseValidatorConfig<T> {
  errors?: LogicFn<T, ValidationResult>;
}
