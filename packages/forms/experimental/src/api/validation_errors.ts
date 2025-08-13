/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {StandardSchemaV1} from '@standard-schema/spec';
import {isArray} from '../util/type_guards';
import {Field, Mutable, ValidationResult} from './types';

/** Internal symbol used for class branding. */
const BRAND = Symbol();

/**
 * Sets the given field on the given error if it does not already have a field.
 * @param errors The error(s) to add the field to
 * @param field The default field to add
 * @returns The passed in error(s), with its field set.
 */
export function addDefaultField<E extends ValidationError>(error: E, field: Field<unknown>): E;
/**
 * Sets the given field on the given errors that do not already have a field.
 * @param errors The error(s) to add the field to
 * @param field The default field to add
 * @returns The passed in error(s), with its field set.
 */
export function addDefaultField<E extends ValidationError>(
  errors: ValidationResult<E>,
  field: Field<unknown>,
): ValidationResult<E>;
export function addDefaultField<E extends ValidationError>(
  errors: ValidationResult<E>,
  field: Field<unknown>,
): ValidationResult<E> {
  if (isArray(errors)) {
    for (const error of errors) {
      (error as Mutable<ValidationError>).field ??= field;
    }
  } else if (errors) {
    (errors as Mutable<ValidationError>).field ??= field;
  }
  return errors;
}

interface ValidationErrorOptions {
  /** Human readable error message. */
  message?: string;

  /** The field associated with this error. */
  field?: Field<unknown>;
}

/** Common interface for all validation errors. */
export abstract class ValidationError {
  /** Brand the class to avoid Typescript structural matching */
  [BRAND] = undefined;

  /** Identifies the kind of error. */
  readonly kind: string = '';

  /** The field associated with this error. */
  readonly field!: Field<unknown>;

  /** Human readable error message. */
  readonly message?: string;

  constructor(options?: ValidationErrorOptions) {
    if (options) {
      Object.assign(this, options);
    }
  }

  /**
   * Create a required error
   * @param options The optional validation error options
   */
  static required(options?: ValidationErrorOptions): RequiredValidationError {
    return new RequiredValidationError(options);
  }

  /**
   * Create a min value error
   * @param min The min value constraint
   * @param options The optional validation error options
   */
  static min(min: number, options?: ValidationErrorOptions): MinValidationError {
    return new MinValidationError(min, options);
  }

  /**
   * Create a max value error
   * @param max The max value constraint
   * @param options The optional validation error options
   */
  static max(max: number, options?: ValidationErrorOptions): MaxValidationError {
    return new MaxValidationError(max, options);
  }

  /**
   * Create a minLength error
   * @param minLength The minLength constraint
   * @param options The optional validation error options
   */
  static minLength(minLength: number, options?: ValidationErrorOptions): MinLengthValidationError {
    return new MinLengthValidationError(minLength, options);
  }

  /**
   * Create a maxLength error
   * @param maxLength The maxLength constraint
   * @param options The optional validation error options
   */
  static maxLength(maxLength: number, options?: ValidationErrorOptions): MaxLengthValidationError {
    return new MaxLengthValidationError(maxLength, options);
  }

  /**
   * Create a pattern matching error
   * @param pattern The violated pattern
   * @param options The optional validation error options
   */
  static pattern(pattern: RegExp, options?: ValidationErrorOptions): PatternValidationError {
    return new PatternValidationError(pattern, options);
  }

  /**
   * Create an email format error
   * @param options The optional validation error options
   */
  static email(options?: ValidationErrorOptions): EmailValidationError {
    return new EmailValidationError(options);
  }

  /**
   * Create a standard schema issue error
   * @param issue The standard schema issue
   * @param options The optional validation error options
   */
  static standardSchema(
    issue: StandardSchemaV1.Issue,
    options?: ValidationErrorOptions,
  ): StandardSchemaValidationError {
    return new StandardSchemaValidationError(issue, options);
  }

  /**
   * Create a custom error
   * @param obj The object to create an error from
   */
  static custom<E extends Omit<Partial<ValidationError>, typeof BRAND>>(
    obj?: E & ValidationErrorOptions,
  ): CustomValidationError {
    const e = new CustomValidationError(obj);
    if (obj) {
      Object.assign(e, obj);
    }
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
    options?: ValidationErrorOptions,
  ) {
    super(options);
  }
}

/**
 * An error used to indicate that a value is higher than the maximum allowed.
 */
export class MaxValidationError extends _NgValidationError {
  override readonly kind = 'max';

  constructor(
    readonly max: number,
    options?: ValidationErrorOptions,
  ) {
    super(options);
  }
}

/**
 * An error used to indicate that a value is shorter than the minimum allowed length.
 */
export class MinLengthValidationError extends _NgValidationError {
  override readonly kind = 'minLength';

  constructor(
    readonly minLength: number,
    options?: ValidationErrorOptions,
  ) {
    super(options);
  }
}

/**
 * An error used to indicate that a value is longer than the maximum allowed length.
 */
export class MaxLengthValidationError extends _NgValidationError {
  override readonly kind = 'maxLength';

  constructor(
    readonly maxLength: number,
    options?: ValidationErrorOptions,
  ) {
    super(options);
  }
}

/**
 * An error used to indicate that a value does not match the required pattern.
 */
export class PatternValidationError extends _NgValidationError {
  override readonly kind = 'pattern';

  constructor(
    readonly pattern: RegExp,
    options?: ValidationErrorOptions,
  ) {
    super(options);
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
    options?: ValidationErrorOptions,
  ) {
    super(options);
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
