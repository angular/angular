/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BargraphNode} from '../record-formatter/bargraph-formatter';
import {FlamegraphNode} from '../record-formatter/flamegraph-formatter';

export interface SelectedEntry {
  entry: BargraphNode | FlamegraphNode;
  selectedDirectives: SelectedDirective[];
  parentHierarchy?: {name: string}[];
}

export interface SelectedDirective {
  directive: string;
  method: string;
  value: number;
}
