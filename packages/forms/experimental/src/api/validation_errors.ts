/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {StandardSchemaV1} from '@standard-schema/spec';
import {isArray} from '../util/type_guards';
import {Field, Mutable, TreeValidationResult, TreeValidationResultWithField} from './types';

/** Internal symbol used for class branding. */
const BRAND = Symbol();

/**
 * Create a `ValidationError` subclass instance with target field using the given error constructor
 * and constructor params. Using this method rather than the constructor directly allows assigning
 * the field.
 * @param errorCtor The subclass constructor
 * @param target The target field for the error
 * @param params The constructor params
 * @return An instance of `WithField<TError>` created with the given constructor and params.
 * @template TError The type of error to create
 * @template TArgs The type of arguments to the constructor
 */
export function createError<TError extends ValidationError, TArgs extends any[]>(
  errorCtor: new (...args: TArgs) => TError,
  target: undefined,
  ...params: TArgs
): TError;
export function createError<TError extends ValidationError, TArgs extends any[]>(
  errorCtor: new (...args: TArgs) => TError,
  target: Field<unknown>,
  ...params: TArgs
): WithField<TError>;
export function createError<TError extends ValidationError, TArgs extends any[]>(
  errorCtor: new (...args: TArgs) => TError,
  target: Field<unknown> | undefined,
  ...params: TArgs
): TError | WithField<TError>;
export function createError<TError extends ValidationError, TArgs extends any[]>(
  errorCtor: new (...args: TArgs) => TError,
  target: Field<unknown> | undefined,
  ...params: TArgs
): TError | WithField<TError> {
  const instance = new errorCtor(...(params as unknown as TArgs));
  addDefaultField(instance, target!);
  return instance;
}

/**
 * Returns a new `E` instance based on the given `WithField<E>`, but with the field removed.
 * @param e The error to strip the field from
 * @returns A new instance with the field removed, or the same instance if it didn't have a field.
 */
export function stripField<E extends ValidationError>(e: WithField<E> | E): E {
  if (!e.field) {
    return e;
  }
  const newE = {};
  Reflect.setPrototypeOf(newE, Object.getPrototypeOf(e));
  Object.assign(newE, e, {field: undefined});
  return newE as E;
}

/**
 * Adds the given default field on to the given error(s) if the error does not already have a field.
 * @param errors The error(s) to add the field to
 * @param field The default field to add
 * @returns The passed in error(s), with its field set.
 */
export function addDefaultField<E extends ValidationError>(
  errors: TreeValidationResult<E>,
  field: Field<unknown>,
): TreeValidationResultWithField<E> {
  if (isArray(errors)) {
    for (const error of errors) {
      (error as Mutable<ValidationError | WithField<ValidationError>>).field ??= field;
    }
  } else if (errors) {
    (errors as Mutable<ValidationError | WithField<ValidationError>>).field ??= field;
  }
  return errors as WithField<E> | WithField<E>[];
}

/**
 * Represents a `ValidationError` with an associated target field.
 */
export type WithField<E extends ValidationError> = Omit<E, 'field'> & {
  /** The field that has the error. */
  readonly field: Field<unknown>;
};

/** Common interface for all validation errors. */
export abstract class ValidationError {
  /** Brand the class to avoid Typescript structural matching */
  [BRAND] = undefined;

  /** Identifies the kind of error. */
  readonly kind: string = '';

  /** Reserved property used by async and tree validators. */
  readonly field?: never;

  constructor(
    /** Human readable error message. */
    readonly message?: string,
  ) {}

  /**
   * Create a required error
   * @param message The optional human readable error message
   */
  static required(message?: string): RequiredValidationError;
  /**
   * Create a required error targetd at a specific field
   * @param message The optional human readable error message
   * @param field The target field
   */
  static required(
    message: string | undefined,
    field: Field<unknown>,
  ): WithField<RequiredValidationError>;
  static required(
    message?: string,
    field?: Field<unknown>,
  ): RequiredValidationError | WithField<RequiredValidationError> {
    return createError(RequiredValidationError, field, message);
  }

  /**
   * Create a min value error
   * @param min The min value constraint
   * @param message The optional human readable error message
   */
  static min(min: number, message?: string): MinValidationError;
  /**
   * Create a min error targeted at a specific field
   * @param min The min value constraint
   * @param message The optional human readable error message
   * @param field The target field
   */
  static min(
    min: number,
    message: string | undefined,
    field: Field<unknown>,
  ): WithField<MinValidationError>;
  static min(
    min: number,
    message?: string,
    field?: Field<unknown>,
  ): MinValidationError | WithField<MinValidationError> {
    return createError(MinValidationError, field, min, message);
  }

  /**
   * Create a max value error
   * @param max The max value constraint
   * @param message The optional human readable error message
   */
  static max(max: number, message?: string): MaxValidationError;
  /**
   * Create a max value error targeted at a specific field
   * @param max The max value constraint
   * @param message The optional human readable error message
   * @param field The target field
   */
  static max(
    max: number,
    message: string | undefined,
    field: Field<unknown>,
  ): WithField<MaxValidationError>;
  static max(
    max: number,
    message?: string,
    field?: Field<unknown>,
  ): MaxValidationError | WithField<MaxValidationError> {
    return createError(MaxValidationError, field, max, message);
  }

  /**
   * Create a minLength error
   * @param minLength The minLength constraint
   * @param message The optional human readable error message
   */
  static minLength(minLength: number, message?: string): MinLengthValidationError;
  /**
   * Create a minLength error targeted at a specific field
   * @param minLength The minLength constraint
   * @param message The optional human readable error message
   * @param field The target field
   */
  static minLength(
    minLength: number,
    message: string | undefined,
    field: Field<unknown>,
  ): WithField<MinLengthValidationError>;
  static minLength(
    minLength: number,
    message?: string,
    field?: Field<unknown>,
  ): MinLengthValidationError | WithField<MinLengthValidationError> {
    return createError(MinLengthValidationError, field, minLength, message);
  }

  /**
   * Create a maxLength error
   * @param maxLength The maxLength constraint
   * @param message The optional human readable error message
   */
  static maxLength(maxLength: number, message?: string): MaxLengthValidationError;
  /**
   * Create a maxLength error targeted at a specific field
   * @param maxLength The maxLength constraint
   * @param message The optional human readable error message
   * @param field The target field
   */
  static maxLength(
    maxLength: number,
    message: string | undefined,
    field: Field<unknown>,
  ): WithField<MaxLengthValidationError>;
  static maxLength(
    maxLength: number,
    message?: string,
    field?: Field<unknown>,
  ): MaxLengthValidationError | WithField<MaxLengthValidationError> {
    return createError(MaxLengthValidationError, field, maxLength, message);
  }

  /**
   * Create a pattern matching error
   * @param pattern The violated pattern
   * @param message The optional human readable error message
   */
  static pattern(pattern: string, message?: string): PatternValidationError;
  /**
   * Create a pattern matching error targeted at a specific field
   * @param pattern The violated pattern
   * @param message The optional human readable error message
   * @param field The target field
   */
  static pattern(
    pattern: string,
    message: string | undefined,
    field: Field<unknown>,
  ): WithField<PatternValidationError>;
  static pattern(
    pattern: string,
    message?: string,
    field?: Field<unknown>,
  ): PatternValidationError | WithField<PatternValidationError> {
    return createError(PatternValidationError, field, pattern, message);
  }

  /**
   * Create an email format error
   * @param message The optional human readable error message
   */
  static email(message?: string): EmailValidationError;
  /**
   * Create an email format error targeted at a specific field
   * @param message The optional human readable error message
   * @param field The target field
   */
  static email(message: string | undefined, field: Field<unknown>): WithField<EmailValidationError>;
  static email(
    message?: string,
    field?: Field<unknown>,
  ): EmailValidationError | WithField<EmailValidationError> {
    return createError(EmailValidationError, field, message);
  }

  /**
   * Create a standard schema issue error
   * @param issue The standard schema issue
   * @param message The optional human readable error message
   */
  static standardSchema(
    issue: StandardSchemaV1.Issue,
    message?: string,
  ): StandardSchemaValidationError;
  /**
   * Create a standard schema issue error targeted at a specific field
   * @param issue The standard schema issue
   * @param message The optional human readable error message
   * @param field The target field
   */
  static standardSchema(
    issue: StandardSchemaV1.Issue,
    message: string | undefined,
    field: Field<unknown>,
  ): WithField<StandardSchemaValidationError>;
  static standardSchema(
    issue: StandardSchemaV1.Issue,
    message?: string,
    field?: Field<unknown>,
  ): StandardSchemaValidationError | WithField<StandardSchemaValidationError> {
    return createError(StandardSchemaValidationError, field, issue, message);
  }

  /**
   * Create a custom error
   * @param obj The object to create an error from
   */
  static custom<E extends Omit<Partial<ValidationError>, typeof BRAND>>(
    obj?: E,
  ): CustomValidationError;
  /**
   * Create a custom error targeted at a specific field
   * @param obj The object to create an error from
   */
  static custom<E extends Omit<Partial<WithField<ValidationError>>, typeof BRAND>>(
    obj: E,
  ): WithField<CustomValidationError | ValidationError>;
  static custom<E extends ValidationError>(
    obj?: E,
  ): CustomValidationError | WithField<CustomValidationError> {
    if (obj === undefined) {
      return new CustomValidationError();
    }
    const {message, field, ...props} = obj;
    const e = createError(CustomValidationError, field, message);
    Object.assign(e, props);
    return e;
  }
}

/**
 * A custom error that may contain additional properties
 */
export class CustomValidationError extends ValidationError {
  /**
   * Allow the user to attach arbitrary other properties.
   */
  [key: PropertyKey]: unknown;
}

/**
 * Internal version of `NgValidationError`, we create this separately so we can change its type on
 * the exported version to a type union of the possible sub-classes.
 */
abstract class _NgValidationError extends ValidationError {}

/**
 * An error used to indicate that a required field is empty.
 */
export class RequiredValidationError extends _NgValidationError {
  override readonly kind = 'required';
}

/**
 * An error used to indicate that a value is lower than the minimum allowed.
 */
export class MinValidationError extends _NgValidationError {
  override readonly kind = 'min';

  constructor(
    readonly min: number,
    message?: string,
  ) {
    super(message);
  }
}

/**
 * An error used to indicate that a value is higher than the maximum allowed.
 */
export class MaxValidationError extends _NgValidationError {
  override readonly kind = 'max';

  constructor(
    readonly max: number,
    message?: string,
  ) {
    super(message);
  }
}

/**
 * An error used to indicate that a value is shorter than the minimum allowed length.
 */
export class MinLengthValidationError extends _NgValidationError {
  override readonly kind = 'minLength';

  constructor(
    readonly minLength: number,
    message?: string,
  ) {
    super(message);
  }
}

/**
 * An error used to indicate that a value is longer than the maximum allowed length.
 */
export class MaxLengthValidationError extends _NgValidationError {
  override readonly kind = 'maxLength';

  constructor(
    readonly maxLength: number,
    message?: string,
  ) {
    super(message);
  }
}

/**
 * An error used to indicate that a value does not match the required pattern.
 */
export class PatternValidationError extends _NgValidationError {
  override readonly kind = 'pattern';

  constructor(
    readonly pattern: string,
    message?: string,
  ) {
    super(message);
  }
}

/**
 * An error used to indicate that a value is not a valid email.
 */
export class EmailValidationError extends _NgValidationError {
  override readonly kind = 'email';
}

/**
 * An error used to indicate an issue validating against a standard schema.
 */
export class StandardSchemaValidationError extends _NgValidationError {
  override readonly kind = 'standardSchema';

  constructor(
    readonly issue: StandardSchemaV1.Issue,
    message?: string,
  ) {
    super(message);
  }
}

/**
 * The base class for all built-in, non-custom errors. This class can be used to check if an error
 * is one of the standard kinds, allowing you to switch on the kind to further narrow the type.
 *
 * @example ```
 * const f = form(...);
 * for (const e of form().errors()) {
 *   if (e instanceof NgValidationError) {
 *     switch(e.kind) {
 *       case 'required':
 *         console.log('This is required!');
 *         break;
 *       case 'min':
 *         console.log(`Must be at least ${e.min}`);
 *         break;
 *       ...
 *     }
 *   }
 * }
 * ```
 */
export const NgValidationError: abstract new () => NgValidationError = _NgValidationError as any;
export type NgValidationError =
  | RequiredValidationError
  | MinValidationError
  | MaxValidationError
  | MinLengthValidationError
  | MaxLengthValidationError
  | PatternValidationError
  | EmailValidationError
  | StandardSchemaValidationError;
