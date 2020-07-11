/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs';
import {ListRange} from '@angular/cdk/collections';

/**
 * An item to be repeated by the VirtualScrollViewport
 */
export interface CdkVirtualScrollRepeater<T> {
  dataStream: Observable<T[] | ReadonlyArray<T>>;
  measureRangeSize(range: ListRange, orientation: 'horizontal' | 'vertical'): number;
}
