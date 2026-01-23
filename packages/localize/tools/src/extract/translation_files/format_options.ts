/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export type FormatOptions = Record<string, string>;
export type ValidOption = [key: string, values: string[]];
export type ValidOptions = ValidOption[];

/**
 * Check that the given `options` are allowed based on the given `validOptions`.
 * @param name The name of the serializer that is receiving the options.
 * @param validOptions An array of valid options and their allowed values.
 * @param options The options to be validated.
 */
export function validateOptions(name: string, validOptions: ValidOptions, options: FormatOptions) {
  const validOptionsMap = new Map<ValidOption[0], ValidOption[1]>(validOptions);
  for (const option in options) {
    if (!validOptionsMap.has(option)) {
      throw new Error(
        `Invalid format option for ${name}: "${option}".\n` +
          `Allowed options are ${JSON.stringify(Array.from(validOptionsMap.keys()))}.`,
      );
    }
    const validOptionValues = validOptionsMap.get(option)!;
    const optionValue = options[option];
    if (!validOptionValues.includes(optionValue)) {
      throw new Error(
        `Invalid format option value for ${name}: "${option}".\n` +
          `Allowed option values are ${JSON.stringify(
            validOptionValues,
          )} but received "${optionValue}".`,
      );
    }
  }
}

/**
 * Parse the given `optionString` into a collection of `FormatOptions`.
 * @param optionString The string to parse.
 */
export function parseFormatOptions(optionString: string = '{}'): FormatOptions {
  return JSON.parse(optionString) as FormatOptions;
}
