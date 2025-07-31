/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InputSignal, ModelSignal, OutputRef, Signal} from '@angular/core';
import {ValidationError} from './validation_errors';

export interface BaseUiControl {
  readonly errors?: InputSignal<readonly ValidationError[] | undefined>;
  readonly disabled?: InputSignal<boolean | undefined>;
  readonly readonly?: InputSignal<boolean | undefined>;
  readonly valid?: InputSignal<boolean | undefined>;
  readonly touched?: InputSignal<boolean | undefined>;
  readonly name?: InputSignal<string>;

  readonly touch?: OutputRef<void>;

  readonly min?: InputSignal<number | undefined>;
  readonly minLength?: InputSignal<number | undefined>;
  readonly max?: InputSignal<number | undefined>;
  readonly maxLength?: InputSignal<number | undefined>;
}

export interface FormValueControl<TValue> extends BaseUiControl {
  readonly value: ModelSignal<TValue>;
  readonly checked?: undefined;
}

export interface FormCheckboxControl extends BaseUiControl {
  readonly checked: ModelSignal<boolean>;
  readonly value?: undefined;
}
