/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const UNDEFINED_PLACEHOLDER = `ɵɵUNDEFINED_PLACEHOLDER_JSON`;
const UNDEFINED_PLACEHOLDER_REGEX = new RegExp(`["']${UNDEFINED_PLACEHOLDER}["']`, 'g');

/**
 * Stringifies the given object while preserving `undefined` values which would usually
 * be transformed into `null` with JSON5. We want to preserve `undefined` because in generated
 * JavaScript, the `undefined` values are separate from `null`, and `undefined` can be minified
 * more efficiently. For example in arrays: `[, , someValue]`.
 *
 * Note that we do not use `JSON5` or similar formats where properties are not explicitly
 * wrapped in quotes. Quotes are necessary so that Closure compiler does not accidentally
 * rename properties. See an example where the currency symbols will be incorrect:
 * https://closure-compiler.appspot.com/home#code%3D%252F%252F%2520%253D%253DClosureCompiler%253D%253D%250A%252F%252F%2520%2540output_file_name%2520default.js%250A%252F%252F%2520%2540compilation_level%2520ADVANCED_OPTIMIZATIONS%250A%252F%252F%2520%253D%253D%252FClosureCompiler%253D%253D%250A%250Aconst%2520base_currencies%2520%253D%2520%257B%250A%2520%2520ABC%253A%2520'd'%252C%250A%2509USD%253A%2520'x'%252C%250A%257D%253B%250A%250Aconst%2520current_locale_currencies%2520%253D%2520%257B%257D%250A%250Afunction%2520getCurrencySymbol(l)%2520%257B%250A%2520%2520return%2520current_locale_currencies%255Bl%255D%2520%257C%257C%2520base_currencies%255Bl%255D%2520%257C%257C%2520l%250A%257D%250A%250Aconsole.log(getCurrencySymbol('de'))%253B
 */
export function stringify(value: any) {
  const result =
      JSON.stringify(value, ((_, value) => value === undefined ? UNDEFINED_PLACEHOLDER : value));

  UNDEFINED_PLACEHOLDER_REGEX.lastIndex = 0;

  return result.replace(UNDEFINED_PLACEHOLDER_REGEX, 'undefined');
}
