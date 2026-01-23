/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {WritableSignal} from '@angular/core';
import {form, FormOptions} from '../../../public_api';
import {FieldTree, PathKind, SchemaOrSchemaFn} from '../../../src/api/types';
import {normalizeFormArgs} from '../../../src/util/normalize_form_args';
import {CompatFieldAdapter} from '../compat_field_adapter';

/**
 * Options that may be specified when creating a compat form.
 *
 * @category interop
 * @experimental 21.0.0
 */
export type CompatFormOptions = Omit<FormOptions, 'adapter'>;

/**
 * Creates a compatibility form wrapped around the given model data.
 *
 * `compatForm` is a version of the `form` function that is designed for backwards
 * compatibility with Reactive forms by accepting Reactive controls as a part of the data.
 *
 * @example
 * ```ts
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
 * @param model A writable signal that contains the model data for the form. The resulting field
 * structure will match the shape of the model and any changes to the form data will be written to
 * the model.

 * @category interop
 * @experimental 21.0.0
 */
export function compatForm<TModel>(model: WritableSignal<TModel>): FieldTree<TModel>;

/**
 * Creates a compatibility form wrapped around the given model data.
 *
 * `compatForm` is a version of the `form` function that is designed for backwards
 * compatibility with Reactive forms by accepting Reactive controls as a part of the data.
 *
 * @example
 * ```ts
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
 *
 * @param model A writable signal that contains the model data for the form. The resulting field
 * structure will match the shape of the model and any changes to the form data will be written to
 * the model.
 * @param schemaOrOptions The second argument can be either
 *   1. A schema or a function used to specify logic for the form (e.g. validation, disabled fields, etc.).
 *      When passing a schema, the form options can be passed as a third argument if needed.
 *   2. The form options (excluding adapter, since it's provided).
 *
 * @category interop
 * @experimental 21.0.0
 */
export function compatForm<TModel>(
  model: WritableSignal<TModel>,
  schemaOrOptions: SchemaOrSchemaFn<TModel> | CompatFormOptions,
): FieldTree<TModel>;

/**
 * Creates a compatibility form wrapped around the given model data.
 *
 * `compatForm` is a version of the `form` function that is designed for backwards
 * compatibility with Reactive forms by accepting Reactive controls as a part of the data.
 *
 * @example
 * ```ts
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
 *
 * @param model A writable signal that contains the model data for the form. The resulting field
 * structure will match the shape of the model and any changes to the form data will be written to
 * the model.
 * @param schemaOrOptions A schema or a function used to specify logic for the form (e.g. validation, disabled fields, etc.).
 *      When passing a schema, the form options can be passed as a third argument if needed.
 * @param options The form options (excluding adapter, since it's provided).
 *
 * @category interop
 * @experimental 21.0.0
 */
export function compatForm<TModel>(
  model: WritableSignal<TModel>,
  schema: SchemaOrSchemaFn<TModel>,
  options: CompatFormOptions,
): FieldTree<TModel>;

export function compatForm<TModel>(...args: any[]): FieldTree<TModel> {
  const [model, maybeSchema, maybeOptions] = normalizeFormArgs<TModel>(args);

  const options = {...maybeOptions, adapter: new CompatFieldAdapter()};
  const schema = maybeSchema || ((() => {}) as SchemaOrSchemaFn<TModel, PathKind>);
  return form(model, schema, options) as FieldTree<TModel>;
}
