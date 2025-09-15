/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {WritableSignal} from '@angular/core';
import {SchemaOrSchemaFn} from '../api/types';
import type {FormOptions} from '../api/structure';
import {isSchemaOrSchemaFn} from '../schema/schema';

/** Extracts the model, schema, and options from the arguments passed to `form()`. */
export function normalizeFormArgs<TValue>(
  args: any[],
): [WritableSignal<TValue>, SchemaOrSchemaFn<TValue> | undefined, FormOptions | undefined] {
  let model: WritableSignal<TValue>;
  let schema: SchemaOrSchemaFn<TValue> | undefined;
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
