/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FieldNode} from '../field/node';
import {StandardSchemaV1} from './standard_schema_types';
import {Field} from './types';

export type WithOptionalField<E extends ValidationError> = Omit<E, 'field'> & {
  readonly field?: Field<unknown>;
};

/** Common interface for all validation errors. */
export interface ValidationError {
  /** Identifies the kind of error. */
  readonly kind: string;
  /** Human readable error message. */
  readonly message?: string;
  /** Reserved property used by async and tree validators. */
  readonly field?: never;
}

export interface RequiredValidationError extends ValidationError {
  readonly kind: 'required';
}

export interface MinValidationError extends ValidationError {
  readonly kind: 'min';
  readonly min: number;
}

export interface MaxValidationError extends ValidationError {
  readonly kind: 'max';
  readonly max: number;
}

export interface MinlengthValidationError extends ValidationError {
  readonly kind: 'minlength';
  readonly minlength: number;
}

export interface MaxlengthValidationError extends ValidationError {
  readonly kind: 'maxlength';
  readonly maxlength: number;
}

export interface PatternValidationError extends ValidationError {
  readonly kind: 'pattern';
  readonly pattern: string;
}

export interface EmailValidationError extends ValidationError {
  readonly kind: 'email';
}

export interface StandardSchemaValidationError extends ValidationError {
  readonly kind: 'standardschema';
  issue: StandardSchemaV1.Issue;
}

export type NgValidationError =
  | RequiredValidationError
  | MinValidationError
  | MaxValidationError
  | MinlengthValidationError
  | MaxlengthValidationError
  | PatternValidationError
  | EmailValidationError
  | StandardSchemaValidationError;

const kinds = new Set<NgValidationError['kind']>([
  'required',
  'min',
  'max',
  'minlength',
  'maxlength',
  'pattern',
  'email',
  'standardschema',
]);

export const NgValidationError: abstract new () => NgValidationError = <any>{
  [Symbol.hasInstance]: (value: any) => matchesNgErrorStructure(value, false),
};

export type ValidationTreeError = WithOptionalField<ValidationError>;

export type NgValidationTreeError =
  | WithOptionalField<RequiredValidationError>
  | WithOptionalField<MinValidationError>
  | WithOptionalField<MaxValidationError>
  | WithOptionalField<MinlengthValidationError>
  | WithOptionalField<MaxlengthValidationError>
  | WithOptionalField<PatternValidationError>
  | WithOptionalField<EmailValidationError>
  | WithOptionalField<StandardSchemaValidationError>;

export const NgValidationTreeError: abstract new () => NgValidationTreeError = <any>{
  [Symbol.hasInstance]: (value: any) => matchesNgErrorStructure(value, true),
};

const propertyKeyTypes = new Set(['string', 'number', 'symbol']);

function matchesNgErrorStructure(obj: any, allowField: boolean) {
  if (!(obj instanceof Object)) return false;
  const error = obj as NgValidationTreeError;
  if (typeof error.kind !== 'string') return false;
  if (!(error.message === undefined || typeof error.message === 'string')) return false;
  if (error.field !== undefined) {
    if (!allowField) return false;
    if (!(error.field instanceof FieldNode)) return false;
  }
  switch (error.kind) {
    case 'required':
    case 'email':
      return true;
    case 'min':
      console.log(error.min);
      return typeof error.min === 'number';
    case 'max':
      return typeof error.max === 'number';
    case 'minlength':
      return typeof error.minlength === 'number';
    case 'maxlength':
      return typeof error.maxlength === 'number';
    case 'pattern':
      return typeof error.pattern === 'string';
    case 'standardschema':
      if (!(error.issue instanceof Object)) return false;
      if (typeof error.issue.message !== 'string') return false;
      if (typeof error.issue.path !== undefined) {
        if (Array.isArray(error.issue.path)) {
          for (const p of error.issue.path) {
            if (p instanceof Object) {
              if (!propertyKeyTypes.has(typeof p.key)) {
                return false;
              }
            } else if (!propertyKeyTypes.has(typeof p)) {
              return false;
            }
          }
        }
        return false;
      }
      return true;
    default:
      return false;
  }
}
