/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Counter, MajorPhase, PerfRecorder} from './api';

class NoopPerfRecorder implements PerfRecorder {
  readonly enabled = false;
  private noopCounter: Counter = {count: 0};

  trackMajorTimeAs(): MajorPhase {
    return MajorPhase.Default;
  }

  doneTrackingMajorTime(): void {}

  trackMinorTimeAs(): void {}

  doneTrackingMinorTime(): void {}

  statistic(): Counter {
    return this.noopCounter;
  }
}

export const NOOP_PERF_RECORDER: PerfRecorder = new NoopPerfRecorder();
