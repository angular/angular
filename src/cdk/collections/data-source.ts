/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';
import {CollectionViewer} from './collection-viewer';

export abstract class DataSource<T> {
  /**
   * Connects a collection viewer (such as a data-table) to this data source. Note that
   * the stream provided will be accessed during change detection and should not directly change
   * values that are bound in template views.
   * @param collectionViewer The component that exposes a view over the data provided by this
   *     data source.
   * @returns Observable that emits a new value when the data changes.
   */
  abstract connect(collectionViewer: CollectionViewer): Observable<T[]>;

  /**
   * Disconnects a collection viewer (such as a data-table) from this data source. Can be used
   * to perform any clean-up or tear-down operations when a view is being destroyed.
   *
   * @param collectionViewer The component that exposes a view over the data provided by this
   *     data source.
   */
  abstract disconnect(collectionViewer: CollectionViewer): void;
}
