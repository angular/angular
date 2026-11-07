/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {WritableSignal} from '@angular/core';
import type {FormOptions} from '../api/structure';
import type {SchemaOrSchemaFn} from '../api/types';
import {FieldAdapter} from '../field/field_adapter';
import {isSchemaOrSchemaFn} from '../schema/schema';

/**
 * Extracts the model, schema, and options from the arguments passed to `form()`.
 */
export function normalizeFormArgs<TModel>(
  args: any[],
): [
  WritableSignal<TModel>,
  SchemaOrSchemaFn<TModel> | undefined,
  (FormOptions<TModel> & {adapter?: FieldAdapter}) | undefined,
] {
  const model = args[0];
  let schema: SchemaOrSchemaFn<TModel> | undefined;
  let options: (FormOptions<TModel> & {adapter?: FieldAdapter}) | undefined;

  if (isSchemaOrSchemaFn(args[1])) {
    schema = args[1];
    options = args[2];
  } else {
    options = args[1] && args[2] ? {...args[1], ...args[2]} : (args[1] ?? args[2]);
  }

  return [model, schema, options];
}
