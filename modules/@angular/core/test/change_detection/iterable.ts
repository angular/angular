/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSymbolIterator} from '../../src/facade/lang';

export class TestIterable {
  list: number[];
  constructor() { this.list = []; }

  [getSymbolIterator()]() { return (this.list as any)[getSymbolIterator()](); }
}
