/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {FormField} from '../../form_field_directive';
import type {FieldTree} from '../../types';
import type {StandardSchemaValidationError} from './standard_schema';

/**
 * Options used to create a `ValidationError`.
 */
export interface ValidationErrorOptions {
  /** Human readable error message. */
  message?: string;
}

/**
 * A type that requires the given type `T` to have a `field` property.
 * @template T The type to add a `field` to.
 *
 * @experimental 21.0.0
 */
export type WithFieldTree<T> = T & {fieldTree: FieldTree<unknown>};
/** @deprecated Use `WithFieldTree` instead  */
export type WithField<T> = WithFieldTree<T>;

/**
 * A type that allows the given type `T` to optionally have a `field` property.
 * @template T The type to optionally add a `field` to.
 *
 * @experimental 21.0.0
 */
export type WithOptionalFieldTree<T> = Omit<T, 'fieldTree'> & {fieldTree?: FieldTree<unknown>};
/** @deprecated Use `WithOptionalFieldTree` instead  */
export type WithOptionalField<T> = WithOptionalFieldTree<T>;

/**
 * A type that ensures the given type `T` does not have a `field` property.
 * @template T The type to remove the `field` from.
 *
 * @experimental 21.0.0
 */
export type WithoutFieldTree<T> = T & {fieldTree: never};
/** @deprecated Use `WithoutFieldTree` instead  */
export type WithoutField<T> = WithoutFieldTree<T>;

/**
 * Create a required error associated with the target field
 * @param options The validation error options
 *
 * @experimental 21.0.0
 */
export function requiredError(
  options: WithFieldTree<ValidationErrorOptions>,
): RequiredValidationError;
/**
 * Create a required error
 * @param options The optional validation error options
 *
 * @category validation
 * @experimental 21.0.0
 */
export function requiredError(
  options?: ValidationErrorOptions,
): WithoutFieldTree<RequiredValidationError>;
export function requiredError(
  options?: ValidationErrorOptions,
): WithOptionalFieldTree<RequiredValidationError> {
  return new RequiredValidationError(options);
}

/**
 * Create a min value error associated with the target field
 * @param min The min value constraint
 * @param options The validation error options
 *
 * @category validation
 * @experimental 21.0.0
 */
export function minError(
  min: number,
  options: WithFieldTree<ValidationErrorOptions>,
): MinValidationError;
/**
 * Create a min value error
 * @param min The min value constraint
 * @param options The optional validation error options
 *
 * @category validation
 * @experimental 21.0.0
 */
export function minError(
  min: number,
  options?: ValidationErrorOptions,
): WithoutFieldTree<MinValidationError>;
export function minError(
  min: number,
  options?: ValidationErrorOptions,
): WithOptionalFieldTree<MinValidationError> {
  return new MinValidationError(min, options);
}

/**
 * Create a max value error associated with the target field
 * @param max The max value constraint
 * @param options The validation error options
 *
 * @category validation
 * @experimental 21.0.0
 */
export function maxError(
  max: number,
  options: WithFieldTree<ValidationErrorOptions>,
): MaxValidationError;
/**
 * Create a max value error
 * @param max The max value constraint
 * @param options The optional validation error options
 *
 * @category validation
 * @experimental 21.0.0
 */
export function maxError(
  max: number,
  options?: ValidationErrorOptions,
): WithoutFieldTree<MaxValidationError>;
export function maxError(
  max: number,
  options?: ValidationErrorOptions,
): WithOptionalFieldTree<MaxValidationError> {
  return new MaxValidationError(max, options);
}

/**
 * Create a minLength error associated with the target field
 * @param minLength The minLength constraint
 * @param options The validation error options
 *
 * @category validation
 * @experimental 21.0.0
 */
export function minLengthError(
  minLength: number,
  options: WithFieldTree<ValidationErrorOptions>,
): MinLengthValidationError;
/**
 * Create a minLength error
 * @param minLength The minLength constraint
 * @param options The optional validation error options
 *
 * @category validation
 * @experimental 21.0.0
 */
export function minLengthError(
  minLength: number,
  options?: ValidationErrorOptions,
): WithoutFieldTree<MinLengthValidationError>;
export function minLengthError(
  minLength: number,
  options?: ValidationErrorOptions,
): WithOptionalFieldTree<MinLengthValidationError> {
  return new MinLengthValidationError(minLength, options);
}

/**
 * Create a maxLength error associated with the target field
 * @param maxLength The maxLength constraint
 * @param options The validation error options
 *
 * @category validation
 * @experimental 21.0.0
 */
export function maxLengthError(
  maxLength: number,
  options: WithFieldTree<ValidationErrorOptions>,
): MaxLengthValidationError;
/**
 * Create a maxLength error
 * @param maxLength The maxLength constraint
 * @param options The optional validation error options
 *
 * @category validation
 * @experimental 21.0.0
 */
export function maxLengthError(
  maxLength: number,
  options?: ValidationErrorOptions,
): WithoutFieldTree<MaxLengthValidationError>;
export function maxLengthError(
  maxLength: number,
  options?: ValidationErrorOptions,
): WithOptionalFieldTree<MaxLengthValidationError> {
  return new MaxLengthValidationError(maxLength, options);
}

/**
 * Create a pattern matching error associated with the target field
 * @param pattern The violated pattern
 * @param options The validation error options
 *
 * @category validation
 * @experimental 21.0.0
 */
export function patternError(
  pattern: RegExp,
  options: WithFieldTree<ValidationErrorOptions>,
): PatternValidationError;
/**
 * Create a pattern matching error
 * @param pattern The violated pattern
 * @param options The optional validation error options
 *
 * @category validation
 * @experimental 21.0.0
 */
export function patternError(
  pattern: RegExp,
  options?: ValidationErrorOptions,
): WithoutFieldTree<PatternValidationError>;
export function patternError(
  pattern: RegExp,
  options?: ValidationErrorOptions,
): WithOptionalFieldTree<PatternValidationError> {
  return new PatternValidationError(pattern, options);
}

/**
 * Create an email format error associated with the target field
 * @param options The validation error options
 *
 * @category validation
 * @experimental 21.0.0
 */
export function emailError(options: WithFieldTree<ValidationErrorOptions>): EmailValidationError;
/**
 * Create an email format error
 * @param options The optional validation error options
 *
 * @category validation
 * @experimental 21.0.0
 */
export function emailError(
  options?: ValidationErrorOptions,
): WithoutFieldTree<EmailValidationError>;
export function emailError(
  options?: ValidationErrorOptions,
): WithOptionalFieldTree<EmailValidationError> {
  return new EmailValidationError(options);
}

/**
 * Common interface for all validation errors.
 *
 * This can be returned from validators.
 *
 * It's also used by the creation functions to create an instance
 * (e.g. `requiredError`, `minError`, etc.).
 *
 * @see [Signal Form Validation](guide/forms/signals/validation)
 * @see [Signal Form Validation Errors](guide/forms/signals/validation#validation-errors)
 * @category validation
 * @experimental 21.0.0
 */
export interface ValidationError {
  /** Identifies the kind of error. */
  readonly kind: string;
  /** Human readable error message. */
  readonly message?: string;
}

export declare namespace ValidationError {
  /**
   * Validation error with an associated field tree.
   *
   * This is returned from field state, e.g., catField.errors() would be of a list of errors with
   * `field: catField` bound to state.
   */
  export interface WithFieldTree extends ValidationError {
    /** The field associated with this error. */
    readonly fieldTree: FieldTree<unknown>;
    readonly formField?: FormField<unknown>;
  }
  /** @deprecated Use `ValidationError.WithFieldTree` instead  */
  export type WithField = WithFieldTree;

  /**
   * Validation error with an associated field tree and specific form field binding.
   */
  export interface WithFormField extends WithFieldTree {
    readonly formField: FormField<unknown>;
  }

  /**
   * Validation error with optional field.
   *
   * This is generally used in places where the result might have a field.
   * e.g., as a result of a `validateTree`, or when handling form submission.
   */
  export interface WithOptionalFieldTree extends ValidationError {
    /** The field associated with this error. */
    readonly fieldTree?: FieldTree<unknown>;
  }
  /** @deprecated Use `ValidationError.WithOptionalFieldTree` instead  */
  export type WithOptionalField = WithOptionalFieldTree;

  /**
   * Validation error with no field.
   *
   * This is used to strongly enforce that fields are not allowed in validation result.
   */
  export interface WithoutFieldTree extends ValidationError {
    /** The field associated with this error. */
    readonly fieldTree?: never;
    readonly formField?: never;
  }
  /** @deprecated Use `ValidationError.WithoutFieldTree` instead  */
  export type WithoutField = WithoutFieldTree;
}

/**
 * Internal version of `NgValidationError`, we create this separately so we can change its type on
 * the exported version to a type union of the possible sub-classes.
 *
 * @experimental 21.0.0
 */
export abstract class BaseNgValidationError implements ValidationError {
  /** Brand the class to avoid Typescript structural matching */
  private __brand = undefined;

  /** Identifies the kind of error. */
  readonly kind: string = '';

  /** The field associated with this error. */
  readonly fieldTree!: FieldTree<unknown>;

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
 * @category validation
 * @experimental 21.0.0
 */
export class RequiredValidationError extends BaseNgValidationError {
  override readonly kind = 'required';
}

/**
 * An error used to indicate that a value is lower than the minimum allowed.
 *
 * @category validation
 * @experimental 21.0.0
 */
export class MinValidationError extends BaseNgValidationError {
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
 * @category validation
 * @experimental 21.0.0
 */
export class MaxValidationError extends BaseNgValidationError {
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
 * @category validation
 * @experimental 21.0.0
 */
export class MinLengthValidationError extends BaseNgValidationError {
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
 * @category validation
 * @experimental 21.0.0
 */
export class MaxLengthValidationError extends BaseNgValidationError {
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
 * @category validation
 * @experimental 21.0.0
 */
export class PatternValidationError extends BaseNgValidationError {
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
 * @category validation
 * @experimental 21.0.0
 */
export class EmailValidationError extends BaseNgValidationError {
  override readonly kind = 'email';
}

/**
 * The base class for all built-in, non-custom errors. This class can be used to check if an error
 * is one of the standard kinds, allowing you to switch on the kind to further narrow the type.
 *
 * @example
 * ```ts
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
 * @category validation
 * @experimental 21.0.0
 */
export const NgValidationError: abstract new () => NgValidationError = BaseNgValidationError as any;
export type NgValidationError =
  | RequiredValidationError
  | MinValidationError
  | MaxValidationError
  | MinLengthValidationError
  | MaxLengthValidationError
  | PatternValidationError
  | EmailValidationError
  | StandardSchemaValidationError;
