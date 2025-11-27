/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injector, runInInjectionContext, WritableSignal} from '@angular/core';

import {BasicFieldAdapter, FieldAdapter} from '../field/field_adapter';
import {FormFieldManager} from '../field/manager';
import {FieldNode} from '../field/node';
import {addDefaultField} from '../field/validation';
import {DYNAMIC} from '../schema/logic';
import {FieldPathNode} from '../schema/path_node';
import {assertPathIsCurrent, SchemaImpl} from '../schema/schema';
import {normalizeFormArgs} from '../util/normalize_form_args';
import {isArray} from '../util/type_guards';
import type {
  FieldTree,
  ItemType,
  LogicFn,
  OneOrMany,
  PathKind,
  Schema,
  SchemaFn,
  SchemaOrSchemaFn,
  SchemaPath,
  TreeValidationResult,
} from './types';
import type {ValidationError} from './validation_errors';

/**
 * Options that may be specified when creating a form.
 *
 * @category structure
 * @experimental 21.0.0
 */
export interface FormOptions {
  /**
   * The injector to use for dependency injection. If this is not provided, the injector for the
   * current [injection context](guide/di/dependency-injection-context), will be used.
   */
  injector?: Injector;
  name?: string;

  /**
   * Adapter allows managing fields in a more flexible way.
   * Currently this is used to support interop with reactive forms.
   */
  adapter?: FieldAdapter;
}

/**
 * Creates a form wrapped around the given model data. A form is represented as simply a `FieldTree`
 * of the model data.
 *
 * `form` uses the given model as the source of truth and *does not* maintain its own copy of the
 * data. This means that updating the value on a `FieldState` updates the originally passed in model
 * as well.
 *
 * @example
 * ```ts
 * const nameModel = signal({first: '', last: ''});
 * const nameForm = form(nameModel);
 * nameForm.first().value.set('John');
 * nameForm().value(); // {first: 'John', last: ''}
 * nameModel(); // {first: 'John', last: ''}
 * ```
 *
 * @param model A writable signal that contains the model data for the form. The resulting field
 * structure will match the shape of the model and any changes to the form data will be written to
 * the model.
 * @return A `FieldTree` representing a form around the data model.
 * @template TModel The type of the data model.
 *
 * @category structure
 * @experimental 21.0.0
 */
export function form<TModel>(model: WritableSignal<TModel>): FieldTree<TModel>;

/**
 * Creates a form wrapped around the given model data. A form is represented as simply a `FieldTree`
 * of the model data.
 *
 * `form` uses the given model as the source of truth and *does not* maintain its own copy of the
 * data. This means that updating the value on a `FieldState` updates the originally passed in model
 * as well.
 *
 * @example
 * ```ts
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
 * @example
 * ```ts
 * const nameForm = form(signal({first: '', last: ''}), (name) => {
 *   required(name.first);
 *   pattern(name.last, /^[a-z]+$/i, {message: 'Alphabet characters only'});
 * });
 * nameForm().valid(); // false
 * nameForm().value.set({first: 'John', last: 'Doe'});
 * nameForm().valid(); // true
 * ```
 *
 * @param model A writable signal that contains the model data for the form. The resulting field
 * structure will match the shape of the model and any changes to the form data will be written to
 * the model.
 * @param schemaOrOptions The second argument can be either
 *   1. A schema or a function used to specify logic for the form (e.g. validation, disabled fields, etc.).
 *      When passing a schema, the form options can be passed as a third argument if needed.
 *   2. The form options
 * @return A `FieldTree` representing a form around the data model
 * @template TValue The type of the data model.
 *
 * @category structure
 * @experimental 21.0.0
 */
export function form<TModel>(
  model: WritableSignal<TModel>,
  schemaOrOptions: SchemaOrSchemaFn<TModel> | FormOptions,
): FieldTree<TModel>;

/**
 * Creates a form wrapped around the given model data. A form is represented as simply a `FieldTree`
 * of the model data.
 *
 * `form` uses the given model as the source of truth and *does not* maintain its own copy of the
 * data. This means that updating the value on a `FieldState` updates the originally passed in model
 * as well.
 *
 * @example
 * ```ts
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
 * @example
 * ```ts
 * const nameForm = form(signal({first: '', last: ''}), (name) => {
 *   required(name.first);
 *   validate(name.last, ({value}) => !/^[a-z]+$/i.test(value()) ? customError({kind: 'alphabet-only'}) : undefined);
 * });
 * nameForm().valid(); // false
 * nameForm().value.set({first: 'John', last: 'Doe'});
 * nameForm().valid(); // true
 * ```
 *
 * @param model A writable signal that contains the model data for the form. The resulting field
 * structure will match the shape of the model and any changes to the form data will be written to
 * the model.
 * @param schema A schema or a function used to specify logic for the form (e.g. validation, disabled fields, etc.)
 * @param options The form options
 * @return A `FieldTree` representing a form around the data model.
 * @template TModel The type of the data model.
 *
 * @category structure
 * @experimental 21.0.0
 */
export function form<TModel>(
  model: WritableSignal<TModel>,
  schema: SchemaOrSchemaFn<TModel>,
  options: FormOptions,
): FieldTree<TModel>;

export function form<TModel>(...args: any[]): FieldTree<TModel> {
  const [model, schema, options] = normalizeFormArgs<TModel>(args);
  const injector = options?.injector ?? inject(Injector);
  const pathNode = runInInjectionContext(injector, () => SchemaImpl.rootCompile(schema));
  const fieldManager = new FormFieldManager(injector, options?.name);
  const adapter = options?.adapter ?? new BasicFieldAdapter();
  const fieldRoot = FieldNode.newRoot(fieldManager, model, pathNode, adapter);
  fieldManager.createFieldManagementEffect(fieldRoot.structure);

  return fieldRoot.fieldProxy as FieldTree<TModel>;
}

/**
 * Applies a schema to each item of an array.
 *
 * @example
 * ```ts
 * const nameSchema = schema<{first: string, last: string}>((name) => {
 *   required(name.first);
 *   required(name.last);
 * });
 * const namesForm = form(signal([{first: '', last: ''}]), (names) => {
 *   applyEach(names, nameSchema);
 * });
 * ```
 *
 * @param path The target path for an array field whose items the schema will be applied to.
 * @param schema A schema for an element of the array, or function that binds logic to an
 * element of the array.
 * @template TValue The data type of the item field to apply the schema to.
 *
 * @category structure
 * @experimental 21.0.0
 */
export function applyEach<TValue extends ReadonlyArray<any>>(
  path: SchemaPath<TValue>,
  schema: NoInfer<SchemaOrSchemaFn<TValue[number], PathKind.Item>>,
): void;
export function applyEach<TValue extends Object>(
  path: SchemaPath<TValue>,
  schema: NoInfer<SchemaOrSchemaFn<ItemType<TValue>, PathKind.Child>>,
): void;
export function applyEach<TValue extends Object>(
  path: SchemaPath<TValue>,
  schema: NoInfer<SchemaOrSchemaFn<ItemType<TValue>, PathKind.Item>>,
): void {
  assertPathIsCurrent(path);

  const elementPath = FieldPathNode.unwrapFieldPath(path).getChild(DYNAMIC).fieldPathProxy;
  apply(elementPath, schema as Schema<TValue>);
}

/**
 * Applies a predefined schema to a given `FieldPath`.
 *
 * @example
 * ```ts
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
 *
 * @category structure
 * @experimental 21.0.0
 */
export function apply<TValue>(
  path: SchemaPath<TValue>,
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
 *
 * @category structure
 * @experimental 21.0.0
 */
export function applyWhen<TValue>(
  path: SchemaPath<TValue>,
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
 *
 * @category structure
 * @experimental 21.0.0
 */
export function applyWhenValue<TValue, TNarrowed extends TValue>(
  path: SchemaPath<TValue>,
  predicate: (value: TValue) => value is TNarrowed,
  schema: SchemaOrSchemaFn<TNarrowed>,
): void;

/**
 * Conditionally applies a predefined schema to a given `FieldPath`.
 *
 * @param path The target path to apply the schema to.
 * @param predicate A function that accepts a value `T` and returns `true` when the schema
 *   should be applied.
 * @param schema The schema to apply to the field when `predicate` returns `true`.
 * @template TValue The data type of the field to apply the schema to.
 *
 * @category structure
 * @experimental 21.0.0
 */
export function applyWhenValue<TValue>(
  path: SchemaPath<TValue>,
  predicate: (value: TValue) => boolean,
  schema: NoInfer<SchemaOrSchemaFn<TValue>>,
): void;

export function applyWhenValue(
  path: SchemaPath<unknown>,
  predicate: (value: unknown) => boolean,
  schema: SchemaOrSchemaFn<unknown>,
) {
  applyWhen(path, ({value}) => predicate(value()), schema);
}

/**
 * Submits a given `FieldTree` using the given action function and applies any server errors
 * resulting from the action to the field. Server errors returned by the `action` will be integrated
 * into the field as a `ValidationError` on the sub-field indicated by the `field` property of the
 * server error.
 *
 * @example
 * ```ts
 * async function registerNewUser(registrationForm: FieldTree<{username: string, password: string}>) {
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
 * @param form The field to submit.
 * @param action An asynchronous action used to submit the field. The action may return server
 * errors.
 * @template TModel The data type of the field being submitted.
 *
 * @category submission
 * @experimental 21.0.0
 */
export async function submit<TModel>(
  form: FieldTree<TModel>,
  action: (form: FieldTree<TModel>) => Promise<TreeValidationResult>,
) {
  const node = form() as unknown as FieldNode;
  markAllAsTouched(node);

  // Fail fast if the form is already invalid.
  if (node.invalid()) {
    return;
  }

  node.submitState.selfSubmitting.set(true);
  try {
    const errors = await action(form);
    errors && setServerErrors(node, errors);
  } finally {
    node.submitState.selfSubmitting.set(false);
  }
}

/**
 * Sets a list of server errors to their individual fields.
 *
 * @param submittedField The field that was submitted, resulting in the errors.
 * @param errors The errors to set.
 */
function setServerErrors(
  submittedField: FieldNode,
  errors: OneOrMany<ValidationError.WithOptionalField>,
) {
  if (!isArray(errors)) {
    errors = [errors];
  }
  const errorsByField = new Map<FieldNode, ValidationError.WithField[]>();
  for (const error of errors) {
    const errorWithField = addDefaultField(error, submittedField.fieldProxy);
    const field = errorWithField.field() as FieldNode;
    let fieldErrors = errorsByField.get(field);
    if (!fieldErrors) {
      fieldErrors = [];
      errorsByField.set(field, fieldErrors);
    }
    fieldErrors.push(errorWithField);
  }
  for (const [field, fieldErrors] of errorsByField) {
    field.submitState.serverErrors.set(fieldErrors);
  }
}

/**
 * Creates a `Schema` that adds logic rules to a form.
 * @param fn A **non-reactive** function that sets up reactive logic rules for the form.
 * @returns A schema object that implements the given logic.
 * @template TValue The value type of a `FieldTree` that this schema binds to.
 *
 * @category structure
 * @experimental 21.0.0
 */
export function schema<TValue>(fn: SchemaFn<TValue>): Schema<TValue> {
  return SchemaImpl.create(fn) as unknown as Schema<TValue>;
}

/** Marks a {@link node} and its descendants as touched. */
function markAllAsTouched(node: FieldNode) {
  node.markAsTouched();
  for (const child of node.structure.children()) {
    markAllAsTouched(child);
  }
}
