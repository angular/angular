import {WritableSignal} from '@angular/core';

import {form, FormOptions} from '../../api/structure';
import {CompatField, CompatSchemaOrSchemaFn} from './compat_types';

export function compatForm<TValue>(
  model: WritableSignal<TValue>,
  schema: CompatSchemaOrSchemaFn<TValue>,
  options: FormOptions,
): CompatField<TValue>;


export function compatForm<TValue>(
  model: WritableSignal<TValue>,
  options: FormOptions,
): CompatField<TValue>;

export function compatForm<TValue>(...args: [any]): CompatField<TValue> {
  return form(...args) as CompatField<TValue>;
}
