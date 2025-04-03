/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WritableSignal} from '@angular/core';

import {FieldNode} from '../field_node';
import {FieldPathNode} from '../path_node';
import {assertPathIsCurrent, SchemaImpl} from '../schema';
import type {Field, FieldPath, LogicFn, Schema, ServerError} from './types';

/**
 * Creates a form wrapped around the given model data. A form is represented as simply a `Field` of
 * the model data.
 *
 * `form` uses the given model as the source of truth and *does not* maintain its own copy of the
 * data. This means that updating the value on a `FieldState` updates the originally passed in model
 * as well.
 *
 * @example ```
 * const nameModel = signal({first: '', last: ''});
 * const nameForm = form(nameModel);
 * nameForm.first.$state.value.set('John');
 * nameForm.$state.value(); // {first: 'John', last: ''}
 * nameModel(); // {first: 'John', last: ''}
 * ```
 *
 * The form can also be created with a schema, which is a set of rules that define the logic for the
 * form. The schema can be either a pre-defined schema created with the `schema` function, or a
 * function that builds the schema by binding logic to a parts of the field structure.
 *
 * @example ```
 * const nameForm = form(signal({first: '', last: ''}), (name) => {
 *   required(name.first);
 *   error(name.last, (value) => !/^[a-z]+$/i.test(value), 'Alphabet characters only');
 * });
 * nameForm.$state.valid(); // false
 * nameForm.$state.value.set({first: 'John', last: 'Doe'});
 * nameForm.$state.valid(); // true
 * ```
 *
 * @param model A writable signal that contains the model data for the form. The resulting field
 * structure will match the shape of the model and any changes to the form data will be written to
 * the model.
 * @param schema A schema or a function that binds logic to the form. This can be optionally
 * included to specify logic for the form (e.g. validation, disabled fields, etc.)
 * @return A `Field` representing a form around the data model.
 * @template The type of the data model.
 */
export function form<T>(model: WritableSignal<T>, schema?: NoInfer<Schema<T>>): Field<T> {
  const pathImpl = FieldPathNode.newRoot();
  if (schema !== undefined) {
    new SchemaImpl(schema).apply(pathImpl);
  }
  const fieldRoot = FieldNode.newRoot(model, pathImpl.logic);
  return fieldRoot.fieldProxy as Field<T>;
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
 * When binding logic to the array items, the `Field` for the array item is passed as an additional
 * argument. This can be used to reference other properties on the item.
 *
 * @example ```
 * const namesForm = form(signal([{first: '', last: ''}]), (names) => {
 *   array(names, (name) => {
 *     error(
 *       name.last,
 *       (value, nameField) => value === nameField.first.$state.value(),
 *       'Last name must be different than first name',
 *     );
 *   });
 * });
 * ```
 *
 * @param path The target path for an array field whose items the schema will be applied to.
 * @param schema A schema for an element of the array, or function that binds logic to an
 * element of the array.
 * @template T The data type of an element in the array.
 */
export function applyEach<T>(path: FieldPath<T[]>, schema: NoInfer<Schema<T>>): void {
  assertPathIsCurrent(path);

  const elementPath = FieldPathNode.extractFromPath(path).element.fieldPathProxy;
  apply(elementPath, schema);
}

/**
 * Applies a predefined schema to a given `FieldPath`.
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
 * @param path The target path to apply the schema to.
 * @param schema The schema to apply to the property
 */
export function apply<T>(path: FieldPath<T>, schema: NoInfer<Schema<T>>): void {
  assertPathIsCurrent(path);

  const childPathImpl = FieldPathNode.extractFromPath(path).withNewKey();
  new SchemaImpl(schema).apply(childPathImpl);
}

/**
 * Conditionally applies a predefined schema to a given `FieldPath`.
 *
 * @param path The target path to apply the schema to.
 * @param logic A `LogicFn<T, boolean>` that returns `true` when the schema should be applied.
 * @param schema The schema to apply to the field when the `logic` function returns `true`.
 */
export function applyWhen<T>(
  path: FieldPath<T>,
  logic: LogicFn<T, boolean>,
  schema: NoInfer<Schema<T>>,
): void {
  assertPathIsCurrent(path);

  const predicatedPathImpl = FieldPathNode.extractFromPath(path).withPredicate({
    fn: logic,
    path,
  });
  new SchemaImpl(schema).apply(predicatedPathImpl);
}

/**
 * Conditionally applies a predefined schema to a given `FieldPath`.
 *
 * @param path The target path to apply the schema to.
 * @param valuePredicate A type guard that accepts a value `T` and returns `true` if `T` is of type
 *   `TNarrowed`.
 * @param schema The schema to apply to the field when `valuePredicate` returns `true`.
 */
export function applyWhenValue<T, TNarrowed extends T>(
  path: FieldPath<T>,
  predicate: (value: T) => value is TNarrowed,
  schema: NoInfer<Schema<TNarrowed>>,
): void;
/**
 * Conditionally applies a predefined schema to a given `FieldPath`.
 *
 * @param path The target path to apply the schema to.
 * @param valuePredicate A function that accepts a value `T` and returns `true` when the schema
 *   should be applied.
 * @param schema The schema to apply to the field when `valuePredicate` returns `true`.
 */
export function applyWhenValue<T>(
  path: FieldPath<T>,
  predicate: (value: T) => boolean,
  schema: NoInfer<Schema<T>>,
): void;
export function applyWhenValue(
  path: FieldPath<unknown>,
  predicate: (value: unknown) => boolean,
  schema: Schema<unknown>,
) {
  applyWhen(path, ({value}) => predicate(value()), schema);
}

/**
 * Submits a given `Field` using the given action function and applies any server errors resulting
 * from the action to the field. Server errors retured by the `action` will be integrated into the
 * field as a `FormError` on the sub-field indicated by the `field` property of the server error.
 *
 * @example ```
 * async function registerNewUser(registrationForm: Field<{username: string, password: string}>) {
 *   const result = await myClient.registerNewUser(registrationForm.$state.value());
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
 *   return registerNewUser(registrationForm.$state.value());
 * });
 * registrationForm.username.$state.errors(); // [{kind: 'server', message: 'Username already taken'}]
 * ```
 *
 * @param f The field to submit.
 * @param action An asynchronous action used to submit the field. The action may return server
 * errors.
 */
export async function submit<T>(
  form: Field<T>,
  action: (form: Field<T>) => Promise<ServerError[] | void>,
) {
  const api = form.$state as FieldNode;
  api.setSubmittedStatus('submitting');
  const errors = (await action(form)) || [];
  for (const error of errors) {
    (error.field.$state as FieldNode).setServerErrors(error.error);
  }
  api.setSubmittedStatus('submitted');
}
