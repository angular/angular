/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type Signal, linkedSignal} from '@angular/core';
import type {ValidationError} from '../api/rules';
import type {ParseResult} from '../api/transformed_value';

/**
 * An object that handles parsing raw UI values into model values.
 */
export interface Parser<TRaw> {
  /**
   * Errors encountered during the last parse attempt.
   */
  errors: Signal<readonly ValidationError.WithoutFieldTree[]>;
  /**
   * Parses the given raw value and updates the underlying model value if successful.
   */
  setRawValue: (rawValue: TRaw) => void;
}

/**
 * Creates a {@link Parser} that synchronizes a raw value with an underlying model value.
 *
 * @param getValue Function to get the current model value.
 * @param setValue Function to update the model value.
 * @param parse Function to parse the raw value into a {@link ParseResult}.
 * @returns A {@link Parser} instance.
 */
export function createParser<TValue, TRaw>(
  getValue: () => TValue,
  setValue: (value: TValue) => void,
  parse: (raw: TRaw) => ParseResult<TValue>,
): Parser<TRaw> {
  const errors = linkedSignal({
    source: getValue,
    computation: () => [] as readonly ValidationError.WithoutFieldTree[],
  });

  const setRawValue = (rawValue: TRaw) => {
    const result = parse(rawValue);
    errors.set(result.errors ?? []);
    if (result.value !== undefined) {
      setValue(result.value);
    }
  };

  return {errors: errors.asReadonly(), setRawValue};
}
