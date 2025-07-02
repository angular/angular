/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {inject, Injector, runInInjectionContext, WritableSignal} from '@angular/core';

import {FormFieldManager} from '../field/manager';
import {FieldNode} from '../field/node';
import {FieldPathNode} from '../path_node';
import {assertPathIsCurrent, isSchemaOrSchemaFn, SchemaImpl} from '../schema';
import type {
  Field,
  FieldPath,
  LogicFn,
  PathKind,
  Schema,
  SchemaFn,
  SchemaOrSchemaFn,
  ServerError,
} from './types';

export interface FormOptions {
  injector?: Injector;
}

function normalizeFormArgs<T>(
  args: any[],
): [WritableSignal<T>, SchemaOrSchemaFn<T> | undefined, FormOptions | undefined] {
  let model: WritableSignal<T>;
  let schema: SchemaOrSchemaFn<T> | undefined;
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
 * nameForm.first().value.set('John');
 * nameForm().value(); // {first: 'John', last: ''}
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
 *   error(name.last, ({value}) => !/^[a-z]+$/i.test(value()), 'Alphabet characters only');
 * });
 * nameForm().valid(); // false
 * nameForm().value.set({first: 'John', last: 'Doe'});
 * nameForm().valid(); // true
 * ```
 *
 * @param model A writable signal that contains the model data for the form. The resulting field
 * structure will match the shape of the model and any changes to the form data will be written to
 * the model.
 * @param options The form options
 * @return A `Field` representing a form around the data model.
 * @template The type of the data model.
 */
export function form<T>(model: WritableSignal<T>, options?: FormOptions): Field<T>;

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
 * nameForm.first().value.set('John');
 * nameForm().value(); // {first: 'John', last: ''}
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
 *   error(name.last, ({value}) => !/^[a-z]+$/i.test(value()), 'Alphabet characters only');
 * });
 * nameForm().valid(); // false
 * nameForm().value.set({first: 'John', last: 'Doe'});
 * nameForm().valid(); // true
 * ```
 *
 * @param model A writable signal that contains the model data for the form. The resulting field
 * structure will match the shape of the model and any changes to the form data will be written to
 * the model.
 * @param schema A schema or a function that binds logic to the form. This can be optionally
 * included to specify logic for the form (e.g. validation, disabled fields, etc.)
 * @param options The form options
 * @return A `Field` representing a form around the data model.
 * @template The type of the data model.
 */
export function form<T>(
  model: WritableSignal<T>,
  // TODO: Decide if we want `NoInfer` or not.
  // Note: `NoInfer<...>` works here when the schema is defined inline, but not when it is defined
  // ahead of time, e.g.
  // const s = (p: FieldPath<string>) => { ... };
  // const f = form(signal(''), s);
  schema?: SchemaOrSchemaFn<T>,
  options?: FormOptions,
): Field<T>;

export function form<T>(...args: any[]): Field<T> {
  const [model, schema, options] = normalizeFormArgs<T>(args);
  const injector = options?.injector ?? inject(Injector);
  const pathNode = runInInjectionContext(injector, () => SchemaImpl.rootCompile(schema));
  const fieldManager = new FormFieldManager(injector);
  const fieldRoot = FieldNode.newRoot(fieldManager, model, pathNode);
  fieldManager.createFieldManagementEffect(fieldRoot.structure);

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
 *       (value, nameField) => value === nameField.first().value(),
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
export function applyEach<T>(
  path: FieldPath<T[]>,
  schema: NoInfer<SchemaOrSchemaFn<T, PathKind.Item>>,
): void {
  assertPathIsCurrent(path);

  const elementPath = FieldPathNode.unwrapFieldPath(path).element.fieldPathProxy;
  apply(elementPath, schema as Schema<T>);
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
export function apply<T>(path: FieldPath<T>, schema: NoInfer<SchemaOrSchemaFn<T>>): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.mergeIn(SchemaImpl.create(schema));
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
  schema: NoInfer<SchemaOrSchemaFn<T>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.mergeIn(SchemaImpl.create(schema), {fn: logic, path});
}

/**
 * Conditionally applies a predefined schema to a given `FieldPath`.
 *
 * @param path The target path to apply the schema to.
 * @param predicate A type guard that accepts a value `T` and returns `true` if `T` is of type
 *   `TNarrowed`.
 * @param schema The schema to apply to the field when `predicate` returns `true`.
 */
export function applyWhenValue<T, TNarrowed extends T>(
  path: FieldPath<T>,
  predicate: (value: T) => value is TNarrowed,
  schema: NoInfer<SchemaOrSchemaFn<TNarrowed>>,
): void;
/**
 * Conditionally applies a predefined schema to a given `FieldPath`.
 *
 * @param path The target path to apply the schema to.
 * @param predicate A function that accepts a value `T` and returns `true` when the schema
 *   should be applied.
 * @param schema The schema to apply to the field when `predicate` returns `true`.
 */
export function applyWhenValue<T>(
  path: FieldPath<T>,
  predicate: (value: T) => boolean,
  schema: NoInfer<SchemaOrSchemaFn<T>>,
): void;
export function applyWhenValue(
  path: FieldPath<unknown>,
  predicate: (value: unknown) => boolean,
  schema: SchemaOrSchemaFn<unknown>,
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
 *   const result = await myClient.registerNewUser(registrationForm().value());
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
 *   return registerNewUser(registrationForm);
 * });
 * registrationForm.username().errors(); // [{kind: 'server', message: 'Username already taken'}]
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
  const api = form() as FieldNode;
  api.submitState.selfSubmittedStatus.set('submitting');
  const errors = (await action(form)) || [];
  for (const error of errors) {
    (error.field() as FieldNode).submitState.setServerErrors(error.error);
  }
  api.submitState.selfSubmittedStatus.set('submitted');
}

export function schema<T>(fn: SchemaFn<T>): Schema<T> {
  return SchemaImpl.create(fn) as unknown as Schema<T>;
}
