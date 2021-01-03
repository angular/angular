/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DeclarationNode} from '../../reflection';

export interface PerfRecorder {
  readonly enabled: boolean;

  mark(name: string, node?: DeclarationNode, category?: string, detail?: string): void;
  start(name: string, node?: DeclarationNode, category?: string, detail?: string): number;
  stop(span: number): void;
}
