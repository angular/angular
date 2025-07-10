/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {StandardSchemaV1} from './standard_schema_types';
import {Field} from './types';

/** Internal symbol used for class branding. */
const BRAND = Symbol();

/**
 * Creates a `ValidationError` subclass instance using the given error constructor and constructor
 * params.
 * @param errorCtor The subclass constructor
 * @param params The params to pass to the constructor.
 * @return An instance of `TError` created with the given constructor and params.
 * @template TError The type of error to create
 * @template TArgs The type of arguments to the constructor
 */
export function createError<TError extends ValidationError, TArgs extends any[]>(
  errorCtor: new (...args: TArgs) => TError,
  ...params: [...TArgs]
): TError;
/**
 * Create a `ValidationError` subclass instance with target field using the given error constructor
 * and constructor params. Using this method rather than the constructor directly allows assigning
 * the field.
 * @param errorCtor The subclass constructor
 * @param params The constructor params, plus the field the error applies to.
 * @return An instance of `WithField<TErorr>` created with the given constructor and params.
 * @template TError The type of error to create
 * @template TArgs The type of arguments to the constructor
 */
export function createError<TError extends ValidationError, TArgs extends any[]>(
  errorCtor: new (...args: TArgs) => TError,
  ...params: [...TArgs, Field<unknown> | undefined]
): WithField<TError>;
export function createError<TError extends ValidationError, TArgs extends any[]>(
  errorCtor: new (...args: TArgs) => TError,
  ...params: [...TArgs, Field<unknown> | undefined]
): TError | WithField<TError> {
  const field = params.pop();
  const instance = new errorCtor(...(params as unknown as TArgs));
  (instance as any).field = field;
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
 * Represents a `ValidationError` with an associated target field.
 */
export type WithField<E extends ValidationError> = Omit<E, 'field'> & {
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
    return createError(RequiredValidationError, message, field);
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
    return createError(MinValidationError, min, message, field);
  }

  /**
   * Create a max value error
   * @param min The max value constraint
   * @param message The optional human readable error message
   */
  static max(max: number, message?: string): MaxValidationError;
  /**
   * Create a max value error targeted at a specific field
   * @param min The max value constraint
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
    return createError(MaxValidationError, max, message, field);
  }

  /**
   * Create a minlength error
   * @param min The minlength constraint
   * @param message The optional human readable error message
   */
  static minlength(minlength: number, message?: string): MinlengthValidationError;
  /**
   * Create a minlength error targeted at a specific field
   * @param min The minlength constraint
   * @param message The optional human readable error message
   * @param field The target field
   */
  static minlength(
    minlength: number,
    message: string | undefined,
    field: Field<unknown>,
  ): WithField<MinlengthValidationError>;
  static minlength(
    minlength: number,
    message?: string,
    field?: Field<unknown>,
  ): MinlengthValidationError | WithField<MinlengthValidationError> {
    return createError(MinlengthValidationError, minlength, message, field);
  }

  /**
   * Create a maxlength error
   * @param min The maxlength constraint
   * @param message The optional human readable error message
   */
  static maxlength(maxlength: number, message?: string): MaxlengthValidationError;
  /**
   * Create a maxlength error targeted at a specific field
   * @param min The maxlength constraint
   * @param message The optional human readable error message
   * @param field The target field
   */
  static maxlength(
    maxlength: number,
    message: string | undefined,
    field: Field<unknown>,
  ): WithField<MaxlengthValidationError>;
  static maxlength(
    maxlength: number,
    message?: string,
    field?: Field<unknown>,
  ): MaxlengthValidationError | WithField<MaxlengthValidationError> {
    return createError(MaxlengthValidationError, maxlength, message, field);
  }

  /**
   * Create a pattern matching error
   * @param min The violated pattern
   * @param message The optional human readable error message
   */
  static pattern(pattern: string, message?: string): PatternValidationError;
  /**
   * Create a pattern matching error targeted at a specific field
   * @param min The violated pattern
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
    return createError(PatternValidationError, pattern, message, field);
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
    return createError(EmailValidationError, message, field);
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
    return createError(StandardSchemaValidationError, issue, message, field);
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
    const e = createError(CustomValidationError, message, field);
    Object.assign(e, props);
    return e;
  }
}

/**
 * A custom error that may contain additional properties
 */
export class CustomValidationError extends ValidationError {
  [key: PropertyKey]: unknown;
}

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
export class MinlengthValidationError extends _NgValidationError {
  override readonly kind = 'minlength';

  constructor(
    readonly minlength: number,
    message?: string,
  ) {
    super(message);
  }
}

/**
 * An error used to indicate that a value is longer than the maximum allowed length.
 */
export class MaxlengthValidationError extends _NgValidationError {
  override readonly kind = 'maxlength';

  constructor(
    readonly maxlegnth: number,
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
  override readonly kind = 'standardschema';

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
 *   if (e instanceof NgValiationError) {
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
  | MinlengthValidationError
  | MaxlengthValidationError
  | PatternValidationError
  | EmailValidationError
  | StandardSchemaValidationError;
