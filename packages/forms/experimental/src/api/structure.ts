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

function normalizeFormArgs<TValue>(
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
 * @template TValue The type of the data model.
 */
export function form<TValue>(model: WritableSignal<TValue>, options?: FormOptions): Field<TValue>;

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
 * @template TValue The type of the data model.
 */
export function form<TValue>(
  model: WritableSignal<TValue>,
  // TODO: Decide if we want `NoInfer` or not.
  // Note: `NoInfer<...>` works here when the schema is defined inline, but not when it is defined
  // ahead of time, e.g.
  // const s = (p: FieldPath<string>) => { ... };
  // const f = form(signal(''), s);
  schema?: SchemaOrSchemaFn<TValue>,
  options?: FormOptions,
): Field<TValue>;

export function form<TValue>(...args: any[]): Field<TValue> {
  const [model, schema, options] = normalizeFormArgs<TValue>(args);
  const injector = options?.injector ?? inject(Injector);
  const pathNode = runInInjectionContext(injector, () => SchemaImpl.rootCompile(schema));
  const fieldManager = new FormFieldManager(injector);
  const fieldRoot = FieldNode.newRoot(fieldManager, model, pathNode);
  fieldManager.createFieldManagementEffect(fieldRoot.structure);

  return fieldRoot.fieldProxy as Field<TValue>;
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
 * @template TValue The data type of the item field to apply the schema to.
 */
export function applyEach<TValue>(
  path: FieldPath<TValue[]>,
  schema: NoInfer<SchemaOrSchemaFn<TValue, PathKind.Item>>,
): void {
  assertPathIsCurrent(path);

  const elementPath = FieldPathNode.unwrapFieldPath(path).element.fieldPathProxy;
  apply(elementPath, schema as Schema<TValue>);
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
 * @template TValue The data type of the field to apply the schema to.
 */
export function apply<TValue>(
  path: FieldPath<TValue>,
  schema: NoInfer<SchemaOrSchemaFn<TValue>>,
): void {
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
 * @template TValue The data type of the field to apply the schema to.
 */
export function applyWhen<TValue>(
  path: FieldPath<TValue>,
  logic: LogicFn<TValue, boolean>,
  schema: NoInfer<SchemaOrSchemaFn<TValue>>,
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
 * @template TValue The data type of the field to apply the schema to.
 * @template TNarrowed The data type of the schema (a narrowed type of TValue).
 */
export function applyWhenValue<TValue, TNarrowed extends TValue>(
  path: FieldPath<TValue>,
  predicate: (value: TValue) => value is TNarrowed,
  schema: NoInfer<SchemaOrSchemaFn<TNarrowed>>,
): void;
/**
 * Conditionally applies a predefined schema to a given `FieldPath`.
 *
 * @param path The target path to apply the schema to.
 * @param predicate A function that accepts a value `T` and returns `true` when the schema
 *   should be applied.
 * @param schema The schema to apply to the field when `predicate` returns `true`.
 * @template TValue The data type of the field to apply the schema to.
 */
export function applyWhenValue<TValue>(
  path: FieldPath<TValue>,
  predicate: (value: TValue) => boolean,
  schema: NoInfer<SchemaOrSchemaFn<TValue>>,
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
 * @template TValue The data type of the field being submitted.
 */
export async function submit<TValue>(
  form: Field<TValue>,
  action: (form: Field<TValue>) => Promise<ServerError[] | void>,
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
