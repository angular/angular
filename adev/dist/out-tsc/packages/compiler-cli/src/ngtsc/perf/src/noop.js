/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {PerfPhase} from './api';
class NoopPerfRecorder {
  eventCount() {}
  memory() {}
  phase() {
    return PerfPhase.Unaccounted;
  }
  inPhase(phase, fn) {
    return fn();
  }
  reset() {}
}
export const NOOP_PERF_RECORDER = new NoopPerfRecorder();
//# sourceMappingURL=noop.js.map
