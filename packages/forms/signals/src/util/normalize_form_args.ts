/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {WritableSignal} from '@angular/core';
import type {SchemaOrSchemaFn} from '../api/types';
import type {FormOptions} from '../api/structure';
import {isSchemaOrSchemaFn} from '../schema/schema';

/**
 * Extracts the model, schema, and options from the arguments passed to `form()`.
 */
export function normalizeFormArgs<TModel>(
  args: any[],
): [WritableSignal<TModel>, SchemaOrSchemaFn<TModel> | undefined, FormOptions | undefined] {
  let model: WritableSignal<TModel>;
  let schema: SchemaOrSchemaFn<TModel> | undefined;
  let options: FormOptions | undefined;

  if (args.length === 3) {
    [model, schema, options] = args;
  } else if (args.length === 2) {
    if (isSchemaOrSchemaFn(args[1])) {
      [model, schema] = args;
    } else {
      [model, options] = args;
    }
  } else {
    [model] = args;
  }

  return [model, schema, options];
}
