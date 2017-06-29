/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';

export interface CollectionViewer {
  viewChange: Observable<{start: number, end: number}>;
}

export abstract class DataSource<T> {
  abstract connect(collectionViewer: CollectionViewer): Observable<T[]>;
  abstract disconnect(collectionViewer: CollectionViewer): void;
}
