/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Counter, MajorPhase, MinorPhase, PerfRecorder, Statistic} from './api';
import {HrTime, mark, timeSinceInMicros} from './clock';

export class PerfTracker implements PerfRecorder {
  readonly enabled = true;

  private statistics = new Map<Statistic, Counter>();
  private defaultMajor = new Stopwatch<MajorPhase>(MajorPhase.Default);
  private currentMajor = this.defaultMajor;
  private majorTimers = new Map<MajorPhase, Stopwatch<MajorPhase>>([
    [MajorPhase.Default, this.defaultMajor],
  ]);

  private currentMinor: Stopwatch<MinorPhase>|null = null;
  private minorTimers = new Map<MinorPhase, Stopwatch<MinorPhase>>();

  constructor() {
    this.currentMajor.start();
  }

  trackMajorTimeAs(phase: MajorPhase): MajorPhase {
    if (!this.majorTimers.has(phase)) {
      this.majorTimers.set(phase, new Stopwatch(phase));
    }
    const prevPhase = this.currentMajor.phase;

    console.error(`Stop: ${MajorPhase[this.currentMajor.phase]}`);
    this.currentMajor.stop();
    this.currentMajor = this.majorTimers.get(phase)!;
    console.error(`Start: ${MajorPhase[this.currentMajor.phase]}`);
    this.currentMajor.start();

    return prevPhase;
  }

  doneTrackingMajorTime(): void {
    this.trackMajorTimeAs(MajorPhase.Default);
  }

  trackMinorTimeAs(phase: MinorPhase): void {
    if (!this.minorTimers.has(phase)) {
      this.minorTimers.set(phase, new Stopwatch(phase));
    }

    if (this.currentMinor !== null) {
      this.currentMinor.stop();
    }
    this.currentMinor = this.minorTimers.get(phase)!;
    this.currentMinor.start();
  }

  doneTrackingMinorTime(): void {
    if (this.currentMinor !== null) {
      this.currentMinor.stop();
      this.currentMinor = null;
    }
  }

  statistic(stat: Statistic): Counter {
    if (!this.statistics.has(stat)) {
      this.statistics.set(stat, {count: 0});
    }
    return this.statistics.get(stat)!;
  }

  getMajorTimeMicros(phase: MajorPhase): number {
    if (this.majorTimers.has(phase)) {
      return this.majorTimers.get(phase)!.timeMicros;
    } else {
      return 0;
    }
  }

  getMinorTimeMicros(phase: MinorPhase): number {
    if (this.minorTimers.has(phase)) {
      return this.minorTimers.get(phase)!.timeMicros;
    } else {
      return 0;
    }
  }

  reportToConsole(): void {
    const stat = (stat: Statistic) => this.statistic(stat).count;
    const major = (major: MajorPhase) => Math.round(this.getMajorTimeMicros(major) / 100) / 10;
    const minor = (minor: MinorPhase) => Math.round(this.getMinorTimeMicros(minor) / 100) / 10;

    console.log('Angular performance:');
    console.log('  Counters:');
    console.log(`    Components: ${stat(Statistic.ComponentCount)}`);
    console.log(`      TemplateNodes:  ${stat(Statistic.TemplateNodeCount)}`);
    console.log(`    Directives: ${stat(Statistic.DirectiveCount)}`);
    console.log(`    Injectables: ${stat(Statistic.InjectableCount)}`);
    console.log(`    NgModules: ${stat(Statistic.NgModuleCount)}`);
    console.log(`    Pipes: ${stat(Statistic.PipeCount)}`);
    console.log();
    console.log('  Timing:');
    console.log(`    Analyze: ${major(MajorPhase.Analyze)} ms`);
    console.log(`    Resolve: ${major(MajorPhase.Resolve)} ms`);
    console.log(`    Template Type-Checking: ${major(MajorPhase.TemplateTypeChecking)} ms`);
    console.log(`    Compile: ${major(MajorPhase.Compile)} ms`);
    console.log(`    (unaccounted): ${major(MajorPhase.Default)} ms`);
    console.log();
    console.log(`    Cycle Detection: ${minor(MinorPhase.CycleDetection)}`);
  }
}

class Stopwatch<T extends MajorPhase|MinorPhase> {
  private accumulatedTime: number = 0;
  private lastStart: HrTime|null = null;

  constructor(readonly phase: T) {}

  get timeMicros(): number {
    if (this.lastStart !== null) {
      return this.accumulatedTime + timeSinceInMicros(this.lastStart);
    } else {
      return this.accumulatedTime;
    }
  }

  start(): void {
    if (this.lastStart !== null) {
      throw new Error('Stopwatch: start() of running timer');
    }
    this.lastStart = mark();
  }

  stop(): void {
    if (this.lastStart === null) {
      return;
    }
    this.accumulatedTime += timeSinceInMicros(this.lastStart);
    this.lastStart = null;
  }
}
