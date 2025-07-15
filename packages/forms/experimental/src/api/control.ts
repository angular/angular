/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InputSignal, ModelSignal, OutputRef} from '@angular/core';
import {ValidationError} from './validation_errors';

export interface FormUiControl<TValue> {
  readonly value: ModelSignal<TValue>;
  readonly errors?: InputSignal<readonly ValidationError[] | undefined>;
  readonly disabled?: InputSignal<boolean | string | undefined>;
  readonly readonly?: InputSignal<boolean | undefined>;
  readonly valid?: InputSignal<boolean | undefined>;
  readonly touched?: InputSignal<boolean | undefined>;

  readonly touch?: OutputRef<void>;
}
