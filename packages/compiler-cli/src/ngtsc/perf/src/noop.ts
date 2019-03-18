/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {PerfRecorder} from './api';

export const NOOP_PERF_RECORDER: PerfRecorder = {
  enabled: false,
  mark: (name: string, node: ts.SourceFile | ts.Declaration, category?: string, detail?: string):
            void => {},
  start: (name: string, node: ts.SourceFile | ts.Declaration, category?: string, detail?: string):
             number => { return 0;},
  stop: (span: number | false): void => {},
};
