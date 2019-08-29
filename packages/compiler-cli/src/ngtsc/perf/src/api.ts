/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

export interface PerfRecorder {
  readonly enabled: boolean;

  mark(name: string, node?: ts.SourceFile|ts.Declaration, category?: string, detail?: string): void;
  start(name: string, node?: ts.SourceFile|ts.Declaration, category?: string, detail?: string):
      number;
  stop(span: number): void;
}
