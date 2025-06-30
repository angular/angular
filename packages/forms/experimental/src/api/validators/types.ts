/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChildLogicFn, ItemLogicFn, LogicFn, ValidationResult} from '../types';

// TODO(kirjs): Consider using {length: number}
export type ValueWithLength = Array<unknown> | string;

export interface BaseValidatorConfig<T> {
  errors?: LogicFn<T, ValidationResult>;
}
export interface ChildBaseValidatorConfig<T> {
  errors?: ChildLogicFn<T, ValidationResult>;
}
export interface ItemBaseValidatorConfig<T> {
  errors?: ItemLogicFn<T, ValidationResult>;
}
