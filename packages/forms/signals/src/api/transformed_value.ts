/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  inject,
  linkedSignal,
  type ModelSignal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import {FORM_FIELD_PARSE_ERRORS} from '../directive/parse_errors';
import {createParser} from '../util/parser';
import type {ValidationError} from './rules';
import type {OneOrMany} from './types';

/**
 * Result of parsing a raw value into a model value.
 */
export interface ParseResult<TValue> {
  /**
   * The parsed value. If omitted, the model is not updated.
   */
  readonly value?: TValue;
  /**
   * Errors encountered during parsing, if any.
   */
  readonly error?: OneOrMany<ValidationError.WithoutFieldTree>;
}

/**
 * Options for `transformedValue`.
 *
 * @experimental 21.2.0
 */
export interface TransformedValueOptions<TValue, TRaw> {
  /**
   * Parse the raw value into the model value.
   *
   * Should return an object containing the parsed result, which may contain:
   *   - `value`: The parsed model value. If `undefined`, the model will not be updated.
   *   - `error`: Any parse errors encountered. If `undefined`, no errors are reported.
   */
  parse: (rawValue: TRaw) => ParseResult<TValue>;

  /**
   * Format the model value into the raw value.
   */
  format: (value: TValue) => TRaw;
}

/**
 * A writable signal representing a "raw" UI value that is synchronized with a model signal
 * via parse/format transformations.
 *
 * @category control
 * @experimental 21.2.0
 */
export interface TransformedValueSignal<TRaw> extends WritableSignal<TRaw> {
  /**
   * The current parse errors resulting from the last transformation.
   */
  readonly parseErrors: Signal<readonly ValidationError.WithoutFieldTree[]>;
}

/**
 * Creates a writable signal representing a "raw" UI value that is transformed to/from a model
 * value via `parse` and `format` functions.
 *
 * This utility simplifies the creation of custom form controls that parse a user-facing value
 * representation into an underlying model value. For example, a numeric input that displays and
 * accepts string values but stores a number.
 *
 * Parse errors are exposed via the returned signal’s `parseErrors()` property.
 * When `transformedValue` is used within a Signal Forms field context, parse errors are also
 * reported to the nearest field automatically. When no field context is present, no automatic
 * reporting occurs and `parseErrors` can be consumed directly.
 *
 * Note: `parse` may return both a `value` and an `error`. Returning `value` updates the model;
 * omitting it leaves the model unchanged.
 *
 * @param value The model signal to synchronize with.
 * @param options Configuration including `parse` and `format` functions.
 * @returns A `TransformedValueSignal` representing the raw value with parse error tracking.
 * @experimental 21.2.0
 *
 * @example
 * ```ts
 * @Component({
 *   selector: 'number-input',
 *   template: `<input [value]="rawValue()" (input)="rawValue.set($event.target.value)" />`,
 * })
 * export class NumberInput implements FormValueControl<number | null> {
 *   readonly value = model.required<number | null>();
 *
 *   protected readonly rawValue = transformedValue(this.value, {
 *     parse: (val) => {
 *       if (val === '') return {value: null};
 *       const num = Number(val);
 *       if (Number.isNaN(num)) {
 *         return {error: {kind: 'parse', message: `${val} is not numeric`}};
 *       }
 *       return {value: num};
 *     },
 *     format: (val) => val?.toString() ?? '',
 *   });
 * }
 * ```
 */
export function transformedValue<TValue, TRaw>(
  value: ModelSignal<TValue>,
  options: TransformedValueOptions<TValue, TRaw>,
): TransformedValueSignal<TRaw> {
  const {parse, format} = options;
  const parser = createParser(value, value.set, parse);

  // Wire up the parse errors from the parser to the form field.
  const formFieldParseErrors = inject(FORM_FIELD_PARSE_ERRORS, {self: true, optional: true});
  if (formFieldParseErrors) {
    formFieldParseErrors.set(parser.errors);
  }

  // Create the result signal with overridden set/update and a `parseErrors` property.
  const rawValue = linkedSignal(() => format(value()));
  const result = rawValue as WritableSignal<TRaw> & {
    parseErrors: Signal<readonly ValidationError.WithoutFieldTree[]>;
  };
  result.parseErrors = parser.errors;
  const originalSet = result.set.bind(result);

  // Notify the parser when `set` or `update` is called on the raw value
  result.set = (newRawValue: TRaw) => {
    parser.setRawValue(newRawValue);
    originalSet(newRawValue);
  };
  result.update = (updateFn: (value: TRaw) => TRaw) => {
    result.set(updateFn(rawValue()));
  };

  return result;
}
