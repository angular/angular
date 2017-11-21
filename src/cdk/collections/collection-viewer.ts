/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';

/**
 * Interface for any component that provides a view of some data collection and wants to provide
 * information regarding the view and any changes made.
 */
export interface CollectionViewer {
  /**
   * A stream that emits whenever the `CollectionViewer` starts looking at a new portion of the
   * data. The `start` index is inclusive, while the `end` is exclusive.
   */
  viewChange: Observable<{start: number, end: number}>;
}
