/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {WritableSignal} from '@angular/core';

import {form, FormOptions} from '../../src/api/structure';
import {CompatFieldTree, CompatSchemaOrSchemaFn} from './compat_types';
import {CompatFieldAdapter} from './compat_field_adapter';
import {PathKind, SchemaOrSchemaFn} from '../../src/api/types';
import {normalizeFormArgs} from '../../src/util/normalize_form_args';

/**
 * Creates a compatibility form wrapped around the given model data.
 *
 * `compatForm` is a version of the `form` function that is designed for backwards
 * compatibility with Reactive forms by accepting Reactive controls as a part of the data.
 *
 * @example
 * ```
 * const lastName = new FormControl('lastName');
 *
 * const nameModel = signal({
 *    first: '',
 *    last: lastName
 * });
 *
 * const nameForm = compatForm(nameModel, (name) => {
 *   required(name.first);
 * });
 *
 * nameForm.last().value(); // lastName, not FormControl
 * ```
 *
 * @param model A writable signal that contains the model data for the form which could include
 *   Reactive controls.
 * @param schema A schema or a function used to specify logic for the form. Note that rules can't
 *   be applied to form controls.
 * @param options The form options.
 * @return A `CompatField` representing a compatibility form around the data model.
 * @template TValue The type of the data model.
 *
 * @experimental 21.0.0
 */
export function compatForm<TValue>(
  model: WritableSignal<TValue>,
  schema: CompatSchemaOrSchemaFn<TValue>,
  options: FormOptions,
): CompatFieldTree<TValue>;

/**
 * Creates a compatibility form wrapped around the given model data.
 *
 * `compatForm` is a version of the `form` function that is designed for backwards
 * compatibility with Reactive forms by accepting Reactive controls as a part of the data.
 *
 * @example
 * ```
 * const lastName = new FormControl('lastName');
 *
 * const nameModel = signal({
 *    first: '',
 *    last: lastName
 * });
 *
 * const nameForm = compatForm(nameModel, (name) => {
 *   required(name.first);
 * });
 *
 * nameForm.last().value(); // lastName, not FormControl
 * ```
 *
 * @param model A writable signal that contains the model data for the form which could include
 *   Reactive controls.
 * @param options The form options.
 * @return A `CompatField` representing a compatibility form around the data model.
 * @template TValue The type of the data model.
 *
 * @experimental 21.0.0
 */
export function compatForm<TValue>(
  model: WritableSignal<TValue>,
  options: FormOptions,
): CompatFieldTree<TValue>;

export function compatForm<TValue>(...args: any[]): CompatFieldTree<TValue> {
  const [model, maybeSchema, maybeOptions] = normalizeFormArgs<TValue>(args);

  const options = {adapter: new CompatFieldAdapter(), ...maybeOptions};
  const schema = maybeSchema || ((() => {}) as SchemaOrSchemaFn<TValue, PathKind>);
  return form(model, schema, options) as CompatFieldTree<TValue>;
}
