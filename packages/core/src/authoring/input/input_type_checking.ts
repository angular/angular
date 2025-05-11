/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {InputSignalWithTransform} from './input_signal';

/** Retrieves the write type of an `InputSignal` and `InputSignalWithTransform`. */
export type ɵUnwrapInputSignalWriteType<Field> =
  Field extends InputSignalWithTransform<any, infer WriteT> ? WriteT : never;

/**
 * Unwraps all `InputSignal`/`InputSignalWithTransform` class fields of
 * the given directive.
 */
export type ɵUnwrapDirectiveSignalInputs<Dir, Fields extends keyof Dir> = {
  [P in Fields]: ɵUnwrapInputSignalWriteType<Dir[P]>;
};

/**
 * Extracts a type with only the input properties of `Dir`, where each property's
 * type is extracted using `ɵUnwrapInputSignalWriteType`. Only fields of type
 * `InputSignal`, `ModelSignal` and `InputSignalWithTransform` are extracted.
 */
export type ExtractDirectiveSignalInputs<Dir> = {
  [Field in keyof Dir as ɵUnwrapInputSignalWriteType<Dir[Field]> extends never
    ? never
    : Field]: ɵUnwrapInputSignalWriteType<Dir[Field]>;
};

/**
 * Determines the type of the input property `TKey` in `Dir`.
 * If `TKey` is a known input, it uses the extracted input type.
 * Otherwise, it defaults to `unknown`.
 */
export type ExtractedDirectiveInputValue<Dir, Field extends keyof any> =
  ExtractDirectiveSignalInputs<Dir> extends Record<Field, unknown>
    ? ExtractDirectiveSignalInputs<Dir>[Field]
    : unknown;

/** To require a string type and still provide the possibility of code completion */
export type SomeInputPropertyName = string & NonNullable<unknown>;
