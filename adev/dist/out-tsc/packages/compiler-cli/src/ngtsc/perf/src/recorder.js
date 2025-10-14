/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/// <reference types="node" />
import {PerfCheckpoint, PerfEvent, PerfPhase} from './api';
import {mark, timeSinceInMicros} from './clock';
/**
 * A `PerfRecorder` that actively tracks performance statistics.
 */
export class ActivePerfRecorder {
  zeroTime;
  counters;
  phaseTime;
  bytes;
  currentPhase = PerfPhase.Unaccounted;
  currentPhaseEntered;
  /**
   * Creates an `ActivePerfRecorder` with its zero point set to the current time.
   */
  static zeroedToNow() {
    return new ActivePerfRecorder(mark());
  }
  constructor(zeroTime) {
    this.zeroTime = zeroTime;
    this.currentPhaseEntered = this.zeroTime;
    this.counters = Array(PerfEvent.LAST).fill(0);
    this.phaseTime = Array(PerfPhase.LAST).fill(0);
    this.bytes = Array(PerfCheckpoint.LAST).fill(0);
    // Take an initial memory snapshot before any other compilation work begins.
    this.memory(PerfCheckpoint.Initial);
  }
  reset() {
    this.counters = Array(PerfEvent.LAST).fill(0);
    this.phaseTime = Array(PerfPhase.LAST).fill(0);
    this.bytes = Array(PerfCheckpoint.LAST).fill(0);
    this.zeroTime = mark();
    this.currentPhase = PerfPhase.Unaccounted;
    this.currentPhaseEntered = this.zeroTime;
  }
  memory(after) {
    this.bytes[after] = process.memoryUsage().heapUsed;
  }
  phase(phase) {
    const previous = this.currentPhase;
    this.phaseTime[this.currentPhase] += timeSinceInMicros(this.currentPhaseEntered);
    this.currentPhase = phase;
    this.currentPhaseEntered = mark();
    return previous;
  }
  inPhase(phase, fn) {
    const previousPhase = this.phase(phase);
    try {
      return fn();
    } finally {
      this.phase(previousPhase);
    }
  }
  eventCount(counter, incrementBy = 1) {
    this.counters[counter] += incrementBy;
  }
  /**
   * Return the current performance metrics as a serializable object.
   */
  finalize() {
    // Track the last segment of time spent in `this.currentPhase` in the time array.
    this.phase(PerfPhase.Unaccounted);
    const results = {
      events: {},
      phases: {},
      memory: {},
    };
    for (let i = 0; i < this.phaseTime.length; i++) {
      if (this.phaseTime[i] > 0) {
        results.phases[PerfPhase[i]] = this.phaseTime[i];
      }
    }
    for (let i = 0; i < this.phaseTime.length; i++) {
      if (this.counters[i] > 0) {
        results.events[PerfEvent[i]] = this.counters[i];
      }
    }
    for (let i = 0; i < this.bytes.length; i++) {
      if (this.bytes[i] > 0) {
        results.memory[PerfCheckpoint[i]] = this.bytes[i];
      }
    }
    return results;
  }
}
/**
 * A `PerfRecorder` that delegates to a target `PerfRecorder` which can be updated later.
 *
 * `DelegatingPerfRecorder` is useful when a compiler class that needs a `PerfRecorder` can outlive
 * the current compilation. This is true for most compiler classes as resource-only changes reuse
 * the same `NgCompiler` for a new compilation.
 */
export class DelegatingPerfRecorder {
  target;
  constructor(target) {
    this.target = target;
  }
  eventCount(counter, incrementBy) {
    this.target.eventCount(counter, incrementBy);
  }
  phase(phase) {
    return this.target.phase(phase);
  }
  inPhase(phase, fn) {
    // Note: this doesn't delegate to `this.target.inPhase` but instead is implemented manually here
    // to avoid adding an additional frame of noise to the stack when debugging.
    const previousPhase = this.target.phase(phase);
    try {
      return fn();
    } finally {
      this.target.phase(previousPhase);
    }
  }
  memory(after) {
    this.target.memory(after);
  }
  reset() {
    this.target.reset();
  }
}
//# sourceMappingURL=recorder.js.map
