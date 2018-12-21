/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDataInRange} from '../util/assert';

import {HEADER_OFFSET, LView, TData} from './interfaces/view';
import {isOnChangesDirectiveWrapper} from './onchanges_util';


/** Retrieves a value from any `LView` or `TData`. */
export function loadInternal<T>(view: LView | TData, index: number): T {
  ngDevMode && assertDataInRange(view, index + HEADER_OFFSET);
  const record = view[index + HEADER_OFFSET];
  // If we're storing an array because of a directive or component with ngOnChanges,
  // return the directive or component instance.
  return isOnChangesDirectiveWrapper(record) ? record.instance : record;
}
