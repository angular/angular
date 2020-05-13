/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Pipe, PipeTransform} from '@angular/core';
import {invalidPipeArgumentError} from './invalid_pipe_argument_error';

/**
 * @ngModule CommonModule
 * @description
 *
 * Creates a new `Array` or `String` containing a subset (slice) of the elements in a given value.
 *
 * @usageNotes
 *
 * All behavior is based on the expected behavior of the JavaScript API `Array.prototype.slice()`
 * and `String.prototype.slice()`.
 *
 * When operating on an `Array`, the returned `Array` is always a copy even when all
 * the elements are being returned.
 *
 * When operating on a blank value, the pipe returns the blank value.
 *
 * ### List Example
 *
 * The following example iterates over an array of strings, selecting the second and third entries.
 *
 * {@example common/pipes/ts/slice_pipe.ts region='SlicePipe_list'}
 *
 * The example produces the following output.
 *
 * ```html
 * <li>b</li>
 * <li>c</li>
 * ```
 *
 * ### String Example
 *
 * The following example iterates over a string, selecting various subsets.
 * Notice that negative start values start at the given index from the end, and
 * go from there to the end. A negative end value similarly counts back from the end.
 * When the start index is greater than the length of the string, an empty string is returned.
 *
 * {@example common/pipes/ts/slice_pipe.ts region='SlicePipe_string'}
 *
 * @see [Transforming data with pipes](guide/pipes)
 *
 * @publicApi
 */
@Pipe({name: 'slice', pure: false})
export class SlicePipe implements PipeTransform {
  transform<T>(value: ReadonlyArray<T>, start: number, end?: number): Array<T>;
  transform(value: string, start: number, end?: number): string;
  transform(value: null, start: number, end?: number): null;
  transform(value: undefined, start: number, end?: number): undefined;
  /**
   * @param value A list or string to be sliced. When blank, returns the blank value.
   * @param start The 0-based starting index.
   *   - A positive integer returns the item at this index counting from the beginning of the
   * expression, and all items after it, up to but not including the item at the `end` index. If
   * greater than the size of the value, returns an empty list or string.
   *   - A negative integer returns the item at this index counting from the end of the expression,
   *     and all items after it up to but not including the item at the `end` index.
   *     If greater than the size of the expression, returns the entire list or string.
   * @param end The ending index. The item at the `end` index is not returned.
   * When not supplied, returns all items after the `start` index.
   *   - A positive integer returns all items before this index, counting from the start of the
   * expression.
   *   - A negative integer return all items before this index, counting from the end of the
   * expression.
   */
  transform(value: any, start: number, end?: number): any {
    if (value == null) return value;

    if (!this.supports(value)) {
      throw invalidPipeArgumentError(SlicePipe, value);
    }

    return value.slice(start, end);
  }

  private supports(obj: any): boolean {
    return typeof obj === 'string' || Array.isArray(obj);
  }
}
