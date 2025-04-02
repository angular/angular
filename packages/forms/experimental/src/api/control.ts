import {InputSignal, ModelSignal, OutputRef} from '@angular/core';
import {FormError} from './types';

export interface FormUiControl<TValue> {
  readonly value: ModelSignal<TValue>;
  readonly errors?: InputSignal<readonly FormError[] | undefined>;
  readonly disabled?: InputSignal<boolean | string | undefined>;
  readonly valid?: InputSignal<boolean | undefined>;
  readonly touched?: InputSignal<boolean | undefined>;

  readonly touch?: OutputRef<void>;
}
