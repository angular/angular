/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {WritableSignal} from '@angular/core';

import {form, FormOptions, normalizeFormArgs} from '../../src/api/structure';
import {CompatField, CompatSchemaOrSchemaFn} from './compat_types';
import {CompatFieldAdapter} from './compat_field_adapter';
import {PathKind, SchemaOrSchemaFn} from '../../src/api/types';

export function compatForm<TValue>(
  model: WritableSignal<TValue>,
  schema: CompatSchemaOrSchemaFn<TValue>,
  options: FormOptions,
): CompatField<TValue>;

export function compatForm<TValue>(
  model: WritableSignal<TValue>,
  options: FormOptions,
): CompatField<TValue>;

export function compatForm<TValue>(...args: any[]): CompatField<TValue> {
  const [model, maybeSchema, maybeOptions] = normalizeFormArgs<TValue>(args);

  const options = {adapter: new CompatFieldAdapter(), ...maybeOptions};
  const schema = maybeSchema || ((() => {}) as SchemaOrSchemaFn<TValue, PathKind>);
  return form(model, schema, options) as CompatField<TValue>;
}
