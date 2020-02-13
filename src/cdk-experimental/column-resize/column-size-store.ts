/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

/**
 * Can be provided by the host application to enable persistence of column resize state.
 */
@Injectable()
export abstract class ColumnSizeStore {
  /** Returns the persisted size of the specified column in the specified table. */
  abstract getSize(tableId: string, columnId: string): number;

  /** Persists the size of the specified column in the specified table. */
  abstract setSize(tableId: string, columnId: string): void;
}
