/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {StandardSchemaV1} from '@standard-schema/spec';
import {Field} from './types';

/**
 * Options used to create a `ValidationError`.
 */
interface ValidationErrorOptions {
  /** Human readable error message. */
  message?: string;
}

/**
 * A type that requires the given type `T` to have a `field` property.
 * @template T The type to add a `field` to.
 *
 * @experimental 21.0.0
 */
export type WithField<T> = T & {field: Field<unknown>};

/**
 * A type that allows the given type `T` to optionally have a `field` property.
 * @template T The type to optionally add a `field` to.
 *
 * @experimental 21.0.0
 */
export type WithOptionalField<T> = Omit<T, 'field'> & {field?: Field<unknown>};

/**
 * A type that ensures the given type `T` does not have a `field` property.
 * @template T The type to remove the `field` from.
 *
 * @experimental 21.0.0
 */
export type WithoutField<T> = T & {field: never};

/**
 * Create a required error associated with the target field
 * @param options The validation error options
 *
 * @experimental 21.0.0
 */
export function requiredError(options: WithField<ValidationErrorOptions>): RequiredValidationError;
/**
 * Create a required error
 * @param options The optional validation error options
 *
 * @experimental 21.0.0
 */
export function requiredError(
  options?: ValidationErrorOptions,
): WithoutField<RequiredValidationError>;
export function requiredError(
  options?: ValidationErrorOptions,
): WithOptionalField<RequiredValidationError> {
  return new RequiredValidationError(options);
}

/**
 * Create a min value error associated with the target field
 * @param min The min value constraint
 * @param options The validation error options
 *
 * @experimental 21.0.0
 */
export function minError(
  min: number,
  options: WithField<ValidationErrorOptions>,
): MinValidationError;
/**
 * Create a min value error
 * @param min The min value constraint
 * @param options The optional validation error options
 *
 * @experimental 21.0.0
 */
export function minError(
  min: number,
  options?: ValidationErrorOptions,
): WithoutField<MinValidationError>;
export function minError(
  min: number,
  options?: ValidationErrorOptions,
): WithOptionalField<MinValidationError> {
  return new MinValidationError(min, options);
}

/**
 * Create a max value error associated with the target field
 * @param max The max value constraint
 * @param options The validation error options
 *
 * @experimental 21.0.0
 */
export function maxError(
  max: number,
  options: WithField<ValidationErrorOptions>,
): MaxValidationError;
/**
 * Create a max value error
 * @param max The max value constraint
 * @param options The optional validation error options
 *
 * @experimental 21.0.0
 */
export function maxError(
  max: number,
  options?: ValidationErrorOptions,
): WithoutField<MaxValidationError>;
export function maxError(
  max: number,
  options?: ValidationErrorOptions,
): WithOptionalField<MaxValidationError> {
  return new MaxValidationError(max, options);
}

/**
 * Create a minLength error associated with the target field
 * @param minLength The minLength constraint
 * @param options The validation error options
 *
 * @experimental 21.0.0
 */
export function minLengthError(
  minLength: number,
  options: WithField<ValidationErrorOptions>,
): MinLengthValidationError;
/**
 * Create a minLength error
 * @param minLength The minLength constraint
 * @param options The optional validation error options
 *
 * @experimental 21.0.0
 */
export function minLengthError(
  minLength: number,
  options?: ValidationErrorOptions,
): WithoutField<MinLengthValidationError>;
export function minLengthError(
  minLength: number,
  options?: ValidationErrorOptions,
): WithOptionalField<MinLengthValidationError> {
  return new MinLengthValidationError(minLength, options);
}

/**
 * Create a maxLength error associated with the target field
 * @param maxLength The maxLength constraint
 * @param options The validation error options
 *
 * @experimental 21.0.0
 */
export function maxLengthError(
  maxLength: number,
  options: WithField<ValidationErrorOptions>,
): MaxLengthValidationError;
/**
 * Create a maxLength error
 * @param maxLength The maxLength constraint
 * @param options The optional validation error options
 *
 * @experimental 21.0.0
 */
export function maxLengthError(
  maxLength: number,
  options?: ValidationErrorOptions,
): WithoutField<MaxLengthValidationError>;
export function maxLengthError(
  maxLength: number,
  options?: ValidationErrorOptions,
): WithOptionalField<MaxLengthValidationError> {
  return new MaxLengthValidationError(maxLength, options);
}

/**
 * Create a pattern matching error associated with the target field
 * @param pattern The violated pattern
 * @param options The validation error options
 *
 * @experimental 21.0.0
 */
export function patternError(
  pattern: RegExp,
  options: WithField<ValidationErrorOptions>,
): PatternValidationError;
/**
 * Create a pattern matching error
 * @param pattern The violated pattern
 * @param options The optional validation error options
 *
 * @experimental 21.0.0
 */
export function patternError(
  pattern: RegExp,
  options?: ValidationErrorOptions,
): WithoutField<PatternValidationError>;
export function patternError(
  pattern: RegExp,
  options?: ValidationErrorOptions,
): WithOptionalField<PatternValidationError> {
  return new PatternValidationError(pattern, options);
}

/**
 * Create an email format error associated with the target field
 * @param options The validation error options
 *
 * @experimental 21.0.0
 */
export function emailError(options: WithField<ValidationErrorOptions>): EmailValidationError;
/**
 * Create an email format error
 * @param options The optional validation error options
 *
 * @experimental 21.0.0
 */
export function emailError(options?: ValidationErrorOptions): WithoutField<EmailValidationError>;
export function emailError(
  options?: ValidationErrorOptions,
): WithOptionalField<EmailValidationError> {
  return new EmailValidationError(options);
}

/**
 * Create a standard schema issue error associated with the target field
 * @param issue The standard schema issue
 * @param options The validation error options
 *
 * @experimental 21.0.0
 */
export function standardSchemaError(
  issue: StandardSchemaV1.Issue,
  options: WithField<ValidationErrorOptions>,
): StandardSchemaValidationError;
/**
 * Create a standard schema issue error
 * @param issue The standard schema issue
 * @param options The optional validation error options
 *
 * @experimental 21.0.0
 */
export function standardSchemaError(
  issue: StandardSchemaV1.Issue,
  options?: ValidationErrorOptions,
): WithoutField<StandardSchemaValidationError>;
export function standardSchemaError(
  issue: StandardSchemaV1.Issue,
  options?: ValidationErrorOptions,
): WithOptionalField<StandardSchemaValidationError> {
  return new StandardSchemaValidationError(issue, options);
}

/**
 * Create a custom error associated with the target field
 * @param obj The object to create an error from
 *
 * @experimental 21.0.0
 */
export function customError<E extends Partial<ValidationError>>(
  obj: WithField<E>,
): CustomValidationError;
/**
 * Create a custom error
 * @param obj The object to create an error from
 *
 * @experimental 21.0.0
 */
export function customError<E extends Partial<ValidationError>>(
  obj?: E,
): WithoutField<CustomValidationError>;
export function customError<E extends Partial<ValidationError>>(
  obj?: E,
): WithOptionalField<CustomValidationError> {
  return new CustomValidationError(obj);
}

/**
 * Common interface for all validation errors.
 *
 * Use the creation functions to create an instance (e.g. `requiredError`, `minError`, etc.).
 *
 * @experimental 21.0.0
 */
export interface ValidationError {
  /** Identifies the kind of error. */
  readonly kind: string;
  /** The field associated with this error. */
  readonly field: Field<unknown>;
  /** Human readable error message. */
  readonly message?: string;
}

/**
 * A custom error that may contain additional properties
 *
 * @experimental 21.0.0
 */
export class CustomValidationError implements ValidationError {
  /** Brand the class to avoid Typescript structural matching */
  private __brand = undefined;

  /**
   * Allow the user to attach arbitrary other properties.
   */
  [key: PropertyKey]: unknown;

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
}

/**
 * Internal version of `NgValidationError`, we create this separately so we can change its type on
 * the exported version to a type union of the possible sub-classes.
 *
 * @experimental 21.0.0
 */
abstract class _NgValidationError implements ValidationError {
  /** Brand the class to avoid Typescript structural matching */
  private __brand = undefined;

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
}

/**
 * An error used to indicate that a required field is empty.
 *
 * @experimental 21.0.0
 */
export class RequiredValidationError extends _NgValidationError {
  override readonly kind = 'required';
}

/**
 * An error used to indicate that a value is lower than the minimum allowed.
 *
 * @experimental 21.0.0
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
 *
 * @experimental 21.0.0
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
 *
 * @experimental 21.0.0
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
 *
 * @experimental 21.0.0
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
 *
 * @experimental 21.0.0
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
 *
 * @experimental 21.0.0
 */
export class EmailValidationError extends _NgValidationError {
  override readonly kind = 'email';
}

/**
 * An error used to indicate an issue validating against a standard schema.
 *
 * @experimental 21.0.0
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
 * @example
 * ```
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
 *
 * @experimental 21.0.0
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
