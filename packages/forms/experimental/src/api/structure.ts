/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WritableSignal} from '@angular/core';

import {FormFieldImpl} from '../field_node';
import {assertPathIsCurrent, SchemaImpl} from '../schema';
import type {
  Form,
  FormPath,
  LogicFn,
  Schema,
  SchemaFn,
  SchemaOrSchemaFn,
  ServerError,
} from './types';
import {FormPathImpl} from '../path_node';

/**
 * Creates a predefined set of logic that can be applied to a form of type `T`. `schema` accepts a
 * function that recevies the root `FormPath` for the form and binds logic to it. This creates a set
 * of logic that can be eaily reused by binding it to a whole form (see `form`), a sub-property of
 * a form (see `apply`), or each element of a form array (see `array`).
 *
 * @example ```
 * const nameSchema = schema<{first: string, last: string}>((name) => {
 *   required(name.first);
 *   required(name.last);
 * });
 * const nameForm = form(signal({first: '', last: ''}), nameSchema);
 * ```
 *
 * @param fn A function that recevies the root `FormPath` for the form and binds logic to it.
 * @return A schema that can be applied to a form of type `T`.
 */
export function schema<T>(fn: SchemaFn<T>): Schema<T> {
  return new SchemaImpl(fn).asSchema();
}

/**
 * Creates a form wrapped around the given model data. The form is a tree structure with the same
 * shape as the data. Accessing properties on the `Form` gives access to a child `Form` for that
 * property. Accessing the special `$api` property retreives the `FormField` for the current node in
 * the form tree, which contains the value and status information.
 *
 * The form uses the given model as the source of truth and *does not* maintain its own copy of the
 * data. This means that updating the value on a `FormField` updates the originally passed in model
 * as well.
 *
 * @example ```
 * const nameModel = signal({first: '', last: ''});
 * const nameForm = form(nameModel);
 * nameForm.first.$api.value.set('John');
 * nameForm.$api.value(); // {first: 'John', last: ''}
 * nameModel(); // {first: 'John', last: ''}
 * ```
 *
 * The form can also be created with a schema, which is a set of rules that define the logic for the
 * form. The schema can be either a pre-defined schema created with the `schema` function, or a
 * function that builds the schema by binding logic to a parts of the form structure.
 *
 * @example ```
 * const nameForm = form(signal({first: '', last: ''}), (name) => {
 *   required(name.first);
 *   error(name.last, (value) => !/^[a-z]+$/i.test(value), 'Alphabet characters only');
 * });
 * nameForm.$api.valid(); // false
 * nameForm.$api.value.set({first: 'John', last: 'Doe'});
 * nameForm.$api.valid(); // true
 * ```
 *
 * @param model A writable signal that contains the model data for the form. The form's structure
 * will match the shape of the model and any changes to the form data will be written to the model.
 * @param schemaOrFn A schema or a function that binds logic to the form. This can be optionally
 * included to specify logic for the form (e.g. validation, disabled fields, etc.)
 * @return A form that can be used to update the model.
 */
export function form<T>(
  model: WritableSignal<T>,
  schemaOrFn?: NoInfer<SchemaOrSchemaFn<T>>,
): Form<T> {
  const pathImpl = FormPathImpl.newRoot();
  if (schemaOrFn !== undefined) {
    extractSchema(schemaOrFn).apply(pathImpl);
  }
  const fieldRoot = FormFieldImpl.newRoot(model, pathImpl.logic);
  return fieldRoot.formFieldProxy as Form<T>;
}

/**
 * Applies a schema to each item of an array.
 *
 * @example ```
 * const nameSchema = schema<{first: string, last: string}>((name) => {
 *   required(name.first);
 *   required(name.last);
 * });
 * const namesForm = form(signal([{first: '', last: ''}]), (names) => {
 *   array(names, nameSchema);
 * });
 * ```
 *
 * When binding logic to the array items, the `Form` for the array item is passed as an additional
 * argument. This can be used to reference other properties on the item.
 *
 * @example ```
 * const namesForm = form(signal([{first: '', last: ''}]), (names) => {
 *   array(names, (name) => {
 *     error(
 *       name.last,
 *       (value, nameForm) => value === nameForm.first.$api.value(),
 *       'Last name must be different than first name',
 *     );
 *   });
 * });
 * ```
 *
 * @param path A path for an array field in the form.
 * @param schemaOrFn A schema for an element of the array, or function that binds logic to an
 * element of the array.
 */
export function applyEach<T>(path: FormPath<T[]>, schemaOrFn: NoInfer<SchemaOrSchemaFn<T>>): void {
  // applyEach(p, schema) = apply(p.element, schema)
  assertPathIsCurrent(path);

  const elementPath = FormPathImpl.extractFromPath(path).element.formPathProxy;
  apply(elementPath, schemaOrFn);
}

/**
 * Applies a predefined schema to a property of the form.
 *
 * @example ```
 * const nameSchema = schema<{first: string, last: string}>((name) => {
 *   required(name.first);
 *   required(name.last);
 * });
 * const profileForm = form(signal({name: {first: '', last: ''}, age: 0}), (profile) => {
 *   apply(profile.name, nameSchema);
 * });
 * ```
 *
 * @param path A path for the property to apply the schema to.
 * @param schema The schema to apply to the property
 */
export function apply<T>(path: FormPath<T>, schemaOrFn: NoInfer<SchemaOrSchemaFn<T>>): void {
  assertPathIsCurrent(path);

  const childPathImpl = FormPathImpl.extractFromPath(path).withNewKey();
  extractSchema(schemaOrFn).apply(childPathImpl);
}

export function applyWhen<T>(
  path: FormPath<T>,
  predicate: LogicFn<T, boolean>,
  schemaOrFn: NoInfer<SchemaOrSchemaFn<T>>,
): void {
  assertPathIsCurrent(path);

  const schema = extractSchema(schemaOrFn);

  // Deep Predicate each everything in the schema
  // path[LOGIC] = FormLogic to which we will apply the schema.

  const predicatedPathImpl = FormPathImpl.extractFromPath(path).withPredicate({
    fn: predicate,
    path,
  });

  schema.apply(predicatedPathImpl);
}

export function applyWhenValue<T, TNarrow extends T>(
  path: FormPath<T>,
  predicate: (value: T) => value is TNarrow,
  schemaOrFn: NoInfer<SchemaOrSchemaFn<TNarrow>>,
): void;
export function applyWhenValue<T>(
  path: FormPath<T>,
  predicate: (value: T) => boolean,
  schemaOrFn: NoInfer<SchemaOrSchemaFn<T>>,
): void;
export function applyWhenValue(
  path: FormPath<unknown>,
  predicate: (value: unknown) => boolean,
  schemaOrFn: SchemaOrSchemaFn<unknown>,
) {
  applyWhen(path, ({value}) => predicate(value()), schemaOrFn);
}

/**
 * Submits a given form using the given action function and applies any server errors resulting from
 * the action to the form. Server errors retured by the `action` will be integrated into the form as
 * a `FormError` on the `field` indicated by the server error.
 *
 * @example ```
 * async function registerNewUser(registrationForm: Form<{username: string, password: string}>) {
 *   const result = await myClient.registerNewUser(registrationForm.$api.value());
 *   if (result.errorCode === myClient.ErrorCode.USERNAME_TAKEN) {
 *     return [{
 *       field: registrationForm.username,
 *       error: {kind: 'server', message: 'Username already taken'}
 *     }];
 *   }
 *   return undefined;
 * }
 *
 * const registrationForm = form(signal({username: 'god', password: ''}));
 * submit(registrationForm, async (f) => {
 *   return registerNewUser(registrationForm.$api.value());
 * });
 * registrationForm.username.$api.errors(); // [{kind: 'server', message: 'Username already taken'}]
 * ```
 *
 * @param f The form to submit.
 * @param action An asynchronous action used to submit the form. The action may return server
 * errors.
 */
export async function submit<T>(
  form: Form<T>,
  action: (form: Form<T>) => Promise<ServerError[] | void>,
) {
  const api = form.$api as FormFieldImpl;
  api.setSubmittedStatus('submitting');
  const errors = (await action(form)) || [];
  for (const error of errors) {
    (error.field.$api as FormFieldImpl).setServerErrors(error.error);
  }
  api.setSubmittedStatus('submitted');
}

function extractSchema(schemaOrFn: SchemaOrSchemaFn<any>): SchemaImpl {
  if (typeof schemaOrFn === 'function') {
    schemaOrFn = schema(schemaOrFn);
  }
  return SchemaImpl.extractFromSchema(schemaOrFn);
}
