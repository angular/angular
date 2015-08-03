import {Json} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';

/**
 * Converts `funcOrValue` to a string which can be used in generated code.
 */
export const codify = Json.stringify;

/**
 * Combine the strings of generated code into a single interpolated string.
 * Each element of `vals` is expected to be a string literal or a codegen'd
 * call to a method returning a string.
 */
export function combineGeneratedStrings(vals: string[]): string {
  return vals.join(' + ');
}
