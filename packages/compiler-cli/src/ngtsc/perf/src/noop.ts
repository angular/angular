/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {PerfPhase, PerfRecorder} from './api';

class NoopPerfRecorder implements PerfRecorder {
  eventCount(): void {}

  memory(): void {}

  phase(): PerfPhase {
    return PerfPhase.Unaccounted;
  }

  inPhase<T>(phase: PerfPhase, fn: () => T): T {
    return fn();
  }

  reset(): void {}
}

export const NOOP_PERF_RECORDER: PerfRecorder = new NoopPerfRecorder();
