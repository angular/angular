import {StandardSchemaV1} from './standard_schema_types';
import {Field} from './types';

export type WithOptionalField<E extends BaseValidationError> = Omit<E, 'field'> & {
  readonly field?: Field<unknown>;
};

/** Common interface for all validation errors. */
export interface BaseValidationError {
  /** Identifies the kind of error. */
  readonly kind: string;
  /** Human readable error message. */
  readonly message?: string;
  /** Reserved property used by async and tree validators. */
  readonly field?: never;
}

export interface RequiredValidationError extends BaseValidationError {
  readonly kind: 'ng:required';
}

export interface MinValidationError extends BaseValidationError {
  readonly kind: 'ng:min';
  readonly min: number;
}

export interface MaxValidationError extends BaseValidationError {
  readonly kind: 'ng:max';
  readonly max: number;
}

export interface MinlengthValidationError extends BaseValidationError {
  readonly kind: 'ng:minlength';
  readonly minlength: number;
}

export interface MaxlengthValidationError extends BaseValidationError {
  readonly kind: 'ng:maxlength';
  readonly maxlength: number;
}

export interface PatternValidationError extends BaseValidationError {
  readonly kind: 'ng:pattern';
  readonly pattern: string;
}

export interface EmailValidationError extends BaseValidationError {
  readonly kind: 'ng:email';
}

export interface StandardSchemaValidationError extends BaseValidationError {
  readonly kind: `ng:standard`;
  issue: StandardSchemaV1.Issue;
}

export interface CustomValidationError extends BaseValidationError {
  readonly kind: `custom:${string}`;
}

export type ValidationError =
  | RequiredValidationError
  | MinValidationError
  | MaxValidationError
  | MinlengthValidationError
  | MaxlengthValidationError
  | PatternValidationError
  | EmailValidationError
  | StandardSchemaValidationError
  | CustomValidationError;

export type ValidationTreeError = WithOptionalField<ValidationError>;
