/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />

import {PerfCheckpoint, PerfEvent, PerfPhase, PerfRecorder} from './api';
import {HrTime, mark, timeSinceInMicros} from './clock';

/**
 * Serializable performance data for the compilation, using string names.
 */
export interface PerfResults {
  events: Record<string, number>;
  phases: Record<string, number>;
  memory: Record<string, number>;
}

/**
 * A `PerfRecorder` that actively tracks performance statistics.
 */
export class ActivePerfRecorder implements PerfRecorder {
  private counters: number[];
  private phaseTime: number[];
  private bytes: number[];

  private currentPhase = PerfPhase.Unaccounted;
  private currentPhaseEntered = this.zeroTime;

  /**
   * Creates an `ActivePerfRecoder` with its zero point set to the current time.
   */
  static zeroedToNow(): ActivePerfRecorder {
    return new ActivePerfRecorder(mark());
  }

  private constructor(private zeroTime: HrTime) {
    this.counters = Array(PerfEvent.LAST).fill(0);
    this.phaseTime = Array(PerfPhase.LAST).fill(0);
    this.bytes = Array(PerfCheckpoint.LAST).fill(0);

    // Take an initial memory snapshot before any other compilation work begins.
    this.memory(PerfCheckpoint.Initial);
  }

  reset(): void {
    this.counters = Array(PerfEvent.LAST).fill(0);
    this.phaseTime = Array(PerfPhase.LAST).fill(0);
    this.bytes = Array(PerfCheckpoint.LAST).fill(0);
    this.zeroTime = mark();
    this.currentPhase = PerfPhase.Unaccounted;
    this.currentPhaseEntered = this.zeroTime;
  }

  memory(after: PerfCheckpoint): void {
    this.bytes[after] = process.memoryUsage().heapUsed;
  }

  phase(phase: PerfPhase): PerfPhase {
    const previous = this.currentPhase;
    this.phaseTime[this.currentPhase] += timeSinceInMicros(this.currentPhaseEntered);
    this.currentPhase = phase;
    this.currentPhaseEntered = mark();
    return previous;
  }

  inPhase<T>(phase: PerfPhase, fn: () => T): T {
    const previousPhase = this.phase(phase);
    try {
      return fn();
    } finally {
      this.phase(previousPhase);
    }
  }

  eventCount(counter: PerfEvent, incrementBy: number = 1): void {
    this.counters[counter] += incrementBy;
  }

  /**
   * Return the current performance metrics as a serializable object.
   */
  finalize(): PerfResults {
    // Track the last segment of time spent in `this.currentPhase` in the time array.
    this.phase(PerfPhase.Unaccounted);

    const results: PerfResults = {
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
export class DelegatingPerfRecorder implements PerfRecorder {
  constructor(public target: PerfRecorder) {}

  eventCount(counter: PerfEvent, incrementBy?: number): void {
    this.target.eventCount(counter, incrementBy);
  }

  phase(phase: PerfPhase): PerfPhase {
    return this.target.phase(phase);
  }

  inPhase<T>(phase: PerfPhase, fn: () => T): T {
    // Note: this doesn't delegate to `this.target.inPhase` but instead is implemented manually here
    // to avoid adding an additional frame of noise to the stack when debugging.
    const previousPhase = this.target.phase(phase);
    try {
      return fn();
    } finally {
      this.target.phase(previousPhase);
    }
  }

  memory(after: PerfCheckpoint): void {
    this.target.memory(after);
  }

  reset(): void {
    this.target.reset();
  }
}
