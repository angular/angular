/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
var SlicePipe_1;
import {__decorate} from 'tslib';
import {Pipe} from '@angular/core';
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
let SlicePipe = (SlicePipe_1 = class SlicePipe {
  transform(value, start, end) {
    if (value == null) return null;
    const supports = typeof value === 'string' || Array.isArray(value);
    if (!supports) {
      throw invalidPipeArgumentError(SlicePipe_1, value);
    }
    return value.slice(start, end);
  }
});
SlicePipe = SlicePipe_1 = __decorate(
  [
    Pipe({
      name: 'slice',
      pure: false,
    }),
  ],
  SlicePipe,
);
export {SlicePipe};
//# sourceMappingURL=slice_pipe.js.map
