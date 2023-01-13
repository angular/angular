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
 * Creates a new `Array` or `String` containing a subset (slice) of the elements.
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
 * This `ngFor` example:
 *
 * {@example common/pipes/ts/slice_pipe.ts region='SlicePipe_list'}
 *
 * produces the following:
 *
 * ```html
 * <li>b</li>
 * <li>c</li>
 * ```
 *
 * ### String Examples
 *
 * {@example common/pipes/ts/slice_pipe.ts region='SlicePipe_string'}
 *
 * @publicApi
 */
@Pipe({
  name: 'slice',
  pure: false,
  standalone: true,
})
export class SlicePipe implements PipeTransform {
  /**
   * @param value a list or a string to be sliced.
   * @param start the starting index of the subset to return:
   *   - **a positive integer**: return the item at `start` index and all items after
   *     in the list or string expression.
   *   - **a negative integer**: return the item at `start` index from the end and all items after
   *     in the list or string expression.
   *   - **if positive and greater than the size of the expression**: return an empty list or
   * string.
   *   - **if negative and greater than the size of the expression**: return entire list or string.
   * @param end the ending index of the subset to return:
   *   - **omitted**: return all items until the end.
   *   - **if positive**: return all items before `end` index of the list or string.
   *   - **if negative**: return all items before `end` index from the end of the list or string.
   */
  transform<T>(value: ReadonlyArray<T>, start: number, end?: number): Array<T>;
  transform(value: null|undefined, start: number, end?: number): null;
  transform<T>(value: ReadonlyArray<T>|null|undefined, start: number, end?: number): Array<T>|null;
  transform(value: string, start: number, end?: number): string;
  transform(value: string|null|undefined, start: number, end?: number): string|null;
  transform<T>(value: ReadonlyArray<T>|string|null|undefined, start: number, end?: number):
      Array<T>|string|null {
    if (value == null) return null;

    if (!this.supports(value)) {
      throw invalidPipeArgumentError(SlicePipe, value);
    }

    return value.slice(start, end);
  }

  private supports(obj: any): boolean {
    return typeof obj === 'string' || Array.isArray(obj);
  }
}
