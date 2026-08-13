/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getProfiler, Hooks, Profiler} from '../profiler';
import type {ComponentInstance} from '../../shared/interfaces';
import type {ElementPosition} from '../../../../../protocol';
import {runOutsideAngular} from '../../shared/utils/general';
import {IdentityTracker} from '../../directive-forest/identity-tracker/identity-tracker';

// Current analyzer instance
let analyzer: CdAnalyzerImpl | null = null;

// A set of analyzer consumers
const consumers = new Set<string>([]);

/**
 * Data emitted from the `CDAnalyzer` for a specific component
 * on each change detection cycle.
 */
export interface CdData {
  /** A weak ref to the target component. */
  component: WeakRef<ComponentInstance>;

  /** Position of the component element in the directive forest. */
  elementPosition: ElementPosition;

  /**
   * Contains the processing times of the component
   * for each CD cycle it was part of. The last value
   * represents the latest time.
   */
  cdPassDurations: number[];
}

type CdDataListener = (current: CdData[], all: CdData[]) => void;

/** Collects component instances change detection data. */
export interface CdAnalyzer {
  /** Emits the latest cycle data along with all of the data collected by the analyzer. */
  onCycle(listener: CdDataListener): () => void;
}

/**
 * Get the current `CDAnalyzer` (existing or new).
 *
 * If a consumer key is NOT provided, the function will
 * return an analyzer ONLY if it already exists.
 *
 * If a consumer key is provided, the function will
 * always return an analyzer – the existing one or
 * a newly created.
 */
export function getCdAnalyzer(consumer: string): CdAnalyzer;
export function getCdAnalyzer(): CdAnalyzer | null;
export function getCdAnalyzer(consumer?: string): CdAnalyzer | null {
  if (consumer === undefined) {
    return analyzer;
  }
  if (!consumer.length) {
    throw new Error('The consumer cannot be an empty string.');
  }

  if (!analyzer) {
    analyzer = new CdAnalyzerImpl(getProfiler());
  }
  consumers.add(consumer);

  return analyzer;
}

/**
 * Attempts to dispose an analyzer if the provided
 * consumer is the only remaining dependent.
 */
export function gracefullyDisposeAnalyzer(consumer: string) {
  consumers.delete(consumer);

  if (!consumers.size) {
    analyzer?.destroy();
    analyzer = null;
  }
}

export class CdAnalyzerImpl implements CdAnalyzer {
  private readonly data = new Map<number, CdData>(); // Map<CMP_ID, CdData>
  private readonly listeners: CdDataListener[] = [];
  private readonly cleanUpRegistry = new FinalizationRegistry((cmpId: number) => {
    // Clean up the components from the data map that have been GC-ed
    this.data.delete(cmpId);
  });

  // Keeps track of component processing times during the current CD cycle.
  // A component can have multiple `CdStart` and `CdEnd` events during a single cycle
  // due to embedded view.
  private currCycleStartTimes = new Map<number, number>(); // Map<CMP_ID, start>
  private currCycleAccumProcessingTimes = new Map<number, number>(); // Map<CMP_ID, duration>

  private inCd: boolean = false;

  private readonly profilerConfig: Partial<Hooks> = {
    onChangeDetectionStart: (cmp: ComponentInstance, _, __, position) => {
      if (!this.inCd) {
        this.inCd = true;

        runOutsideAngular(() => {
          Promise.resolve().then(() => {
            this.inCd = false;

            for (const [cmpId, time] of this.currCycleAccumProcessingTimes) {
              this.data.get(cmpId)?.cdPassDurations.push(time);
            }

            const {current, all} = this.processDataForEmission();
            this.emit(current, all);

            this.currCycleStartTimes = new Map();
            this.currCycleAccumProcessingTimes = new Map();
          });
        });
      }

      const id = getCmpId(cmp);
      if (id === null) {
        return;
      }

      if (!this.data.has(id)) {
        const cmpRef = new WeakRef(cmp);
        // Register the component instance for clean up
        this.cleanUpRegistry.register(cmp, id);

        this.data.set(id, {
          cdPassDurations: [],
          elementPosition: position,
          component: cmpRef,
        });
      }

      this.currCycleStartTimes.set(id, performance.now());
    },

    onChangeDetectionEnd: (cmp: ComponentInstance) => {
      const id = getCmpId(cmp);
      if (id === null) {
        return;
      }
      const cmpData = this.data.get(id);
      const cmpCurrCycleStartTime = this.currCycleStartTimes.get(id);

      if (!cmpData || cmpCurrCycleStartTime === undefined) {
        console.warn('Unable to find corresponding CD start data for', cmp);
        return;
      }

      let totalTime = this.currCycleAccumProcessingTimes.get(id) ?? 0;
      totalTime += performance.now() - cmpCurrCycleStartTime;
      this.currCycleAccumProcessingTimes.set(id, totalTime);
    },
  };

  constructor(private readonly profiler: Profiler) {
    this.profiler.subscribe(this.profilerConfig);
  }

  destroy() {
    this.profiler.unsubscribe(this.profilerConfig);
  }

  onCycle(listener: CdDataListener) {
    this.listeners.push(listener);

    return () => {
      const idx = this.listeners.findIndex((l) => l === listener);
      if (idx > -1) {
        this.listeners.splice(idx, 1);
      }
    };
  }

  private processDataForEmission(): {current: CdData[]; all: CdData[]} {
    return {
      current: Array.from(this.currCycleStartTimes.entries()).map(([cmp]) => this.data.get(cmp)!),
      all: Array.from(this.data.values()),
    };
  }

  private emit(current: CdData[], all: CdData[]) {
    for (const l of this.listeners) {
      l(current, all);
    }
  }
}

/** Returns a component ID. */
function getCmpId(cmp: ComponentInstance): number | null {
  return IdentityTracker.getInstance().getDirectiveId(cmp) ?? null;
}
