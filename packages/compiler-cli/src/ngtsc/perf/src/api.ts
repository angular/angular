/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface PerfRecorder {
  readonly enabled: boolean;

  trackMajorTimeAs(phase: MajorPhase): MajorPhase;
  doneTrackingMajorTime(): void;

  trackMinorTimeAs(phase: MinorPhase): void;
  doneTrackingMinorTime(): void;

  statistic(stat: Statistic): Counter;
}

export interface Counter {
  count: number;
}

export enum MajorPhase {
  Default,
  TypeScript,
  Analyze,
  Resolve,
  TemplateTypeChecking,
  Compile,
}

export enum MinorPhase {
  CycleDetection,
}

export enum Statistic {
  ComponentCount,
  DirectiveCount,
  InjectableCount,
  NgModuleCount,
  PipeCount,

  TemplateNodeCount,
}
