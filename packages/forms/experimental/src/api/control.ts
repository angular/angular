/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InputSignal, ModelSignal, OutputRef} from '@angular/core';
import {ValidationError} from './validation_errors';

export interface BaseUiControl {
  readonly errors?: InputSignal<readonly ValidationError[] | undefined>;
  readonly disabled?: InputSignal<boolean | undefined>;
  readonly readonly?: InputSignal<boolean | undefined>;
  readonly valid?: InputSignal<boolean | undefined>;
  readonly touched?: InputSignal<boolean | undefined>;
  readonly name?: InputSignal<string>;

  readonly touch?: OutputRef<void>;

  readonly required?: InputSignal<boolean>;
  readonly min?: InputSignal<number | undefined>;
  readonly minLength?: InputSignal<number | undefined>;
  readonly max?: InputSignal<number | undefined>;
  readonly maxLength?: InputSignal<number | undefined>;
  readonly pattern?: InputSignal<RegExp[]>;
}

export interface FormValueControl<TValue> extends BaseUiControl {
  readonly value: ModelSignal<TValue>;
  // TODO: We currently require that a `checked` input not be present, as we may want to introduce a
  // third kind of form control for radio buttons that defines both a `value` and `checked` input.
  // We are still evaluating whether this makes sense, but if we decide not to persue this we can
  // remove this restriction.
  readonly checked?: undefined;
}

export interface FormCheckboxControl extends BaseUiControl {
  readonly checked: ModelSignal<boolean>;
  readonly value?: undefined;
}
