/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LogicFn, PathKind, ValidationResult} from '../types';

// TODO(kirjs): Consider using {length: number}
export type ValueWithLength = Array<unknown> | string;

export interface BaseValidatorConfig<T, TPathKind extends PathKind /*= PathKind.Root*/> {
  errors?: LogicFn<T, ValidationResult, TPathKind>;
}
