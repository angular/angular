/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {performance, PerformanceObserver} from 'perf_hooks';

/**
 * Instrumented sections. A section is `ngp.<Name>` in the trace and the bare `<Name>` in the
 * summary, whose keys are a namespace of their own.
 */
export enum SpanKind {
  PrepareChunk,
  PrepareTcbTargets,
  Compile,
  SerializeOutput,
  GenerateTcb,
  SourceMap,
  WriteOutput,
  WriteDiagnostics,
  AwaitAnalysis,
  /** The per-file async slice. */
  File,
  /** Process start to the first instrumented code (module loading etc.). */
  Startup,
  SpawnSidecar,
  /** The sidecar's `initialize` round trip. */
  InitializeRpc,
  TakePerf,
  Close,
  /** `JSON.parse` of an analysis result chunk from the sidecar. */
  ParseAnalysisResult,
  /** One `parseTemplate` call. A component template is parsed twice (normal and diagnostic). */
  TemplateParse,
  TemplateBind,
}

export enum Counter {
  FilesAnalyzed,
  FilesEmitted,
  FilesReused,
  UnchangedFilesEmitted,
  TcbFilesGenerated,
  EmptyTcbFilesWritten,
  TemplatesParsed,
  ComponentsCompiled,
  DirectivesCompiled,
  PipesCompiled,
  InjectablesCompiled,
  NgModulesCompiled,
  AnalysisResultBytes,
}

const SPAN_KINDS = Object.keys(SpanKind).length / 2;
const COUNTERS = Object.keys(Counter).length / 2;

/** Trace event names, `ngp.` + the enum name, indexed by `SpanKind`. */
const SPAN_NAMES: string[] = [];
for (let kind = 0; kind < SPAN_KINDS; kind++) {
  SPAN_NAMES.push(`ngp.${SpanKind[kind]}`);
}

/**
 * Sections that contain driver-level awaits (nothing else runs meanwhile). They are wall time,
 * so they don't count towards `mainThreadBusyUs`, and can't start inside other sections.
 */
const AWAITING_KINDS = new Uint8Array(SPAN_KINDS);
AWAITING_KINDS[SpanKind.PrepareChunk] = 1;
AWAITING_KINDS[SpanKind.WriteDiagnostics] = 1;
AWAITING_KINDS[SpanKind.AwaitAnalysis] = 1;
AWAITING_KINDS[SpanKind.Startup] = 1;
AWAITING_KINDS[SpanKind.InitializeRpc] = 1;
AWAITING_KINDS[SpanKind.TakePerf] = 1;

/** A Chrome Trace Event Format entry. */
export interface TraceEvent {
  name: string;
  cat?: string;
  ph: 'X' | 'b' | 'e' | 's' | 'f' | 'C' | 'M' | 'i';
  /** Scope of an `i` event; `p` is process-wide. */
  s?: 'p' | 't' | 'g';
  pid: number;
  tid: number;
  ts: number;
  dur?: number;
  /** Flow id, for `s`/`f`. */
  id?: number;
  /** `'e'` binds a flow end to the enclosing slice. */
  bp?: 'e';
  id2?: {local: number};
  args?: Record<string, unknown>;
}

export interface RustQueryStats {
  count: number;
  cacheHits: number;
  busyUs: number;
  selfUs: number;
  queuedUs: number;
  wallUs: number;
  cancelled: number;
  /** The executions with the most busy time, slowest first. */
  slowest?: RustSlowQuery[];
}

export interface RustSlowQuery {
  /** Execution id, as in the query slices' `args.q`. */
  q: number;
  busyUs: number;
  selfUs: number;
  wallUs: number;
  file?: string;
  /** In detail mode. */
  key?: string;
}

export interface RustSummary {
  queries: Record<string, RustQueryStats>;
  spans: Record<string, {count: number; selfUs: number}>;
  counters: Record<string, number>;
}

/** Reply of ng-analyze's `takePerf`. Draining it resets the analyzer's buffers. */
export interface RustPerfTake {
  /** Rust clock (µs since its fixed epoch) when the reply was built. */
  nowUs: number;
  pid: number;
  /** Finished trace events without `pid`, on the Rust clock. `M` events have `ts` 0. */
  events: Array<Omit<TraceEvent, 'pid'>>;
  summary: RustSummary;
}

/** A `takePerf` reply plus the Node clock around the round trip, for clock alignment. */
export interface AnalyzerPerfTake extends RustPerfTake {
  requestUs: number;
  responseUs: number;
}

export interface SpanStats {
  count: number;
  selfUs: number;
  inclusiveUs: number;
}

export interface AsyncSpanStats {
  count: number;
  wallUs: number;
}

export interface NodeSummary {
  /** Synchronous (`X`) sections on the main thread. */
  spans: Record<string, SpanStats>;
  /** Async per-file slices. Wall time is latency, since other files' work interleaves. */
  async: Record<string, AsyncSpanStats>;
  /** Time in instrumented synchronous sections, excluding sections that span awaits. */
  mainThreadBusyUs: number;
  counters: Record<string, number>;
  /** GC pauses seen by a `gc` performance observer. */
  gc?: {count: number; totalUs: number};
}

/** The `--perf-summary` output. */
export interface PerfSummary {
  version: 1;
  wallUs: number;
  node: NodeSummary;
  rust?: RustSummary;
}

export interface Tracer {
  readonly enabled: boolean;
  /**
   * Starts a synchronous section on the main thread and returns a token for `end()`. Don't hold
   * a token across an `await`, except at driver level where nothing else runs. A `fileId` of 0
   * means no file.
   */
  begin(kind: SpanKind, fileId?: number): number;
  /** Ends the section of `token`, and any section left open inside it. */
  end(token: number): void;
  slice<T>(kind: SpanKind, fn: () => T, fileId?: number): T;
  /** Records a finished synchronous section that ran from `startUs` until now. */
  record(kind: SpanKind, startUs: number): void;
  /** Allocates an id for a file and begins its `ngp.File` async slice. */
  newFileId(path: string): number;
  asyncBegin(kind: SpanKind, fileId: number): void;
  /** `asyncEnd(SpanKind.File, fileId)` ends the `ngp.File` slice. */
  asyncEnd(kind: SpanKind, fileId: number): void;
  count(counter: Counter, n?: number): void;
  addAnalyzerPerf(perf: AnalyzerPerfTake): void;
  /** Returns the events and summary recorded since the last `take()`, and resets them. */
  take(): {events: TraceEvent[]; summary: PerfSummary};
}

/**
 * Current time in µs from `process.hrtime()`, the clock `tsc_wrapped/perf_trace.ts` uses, so the
 * events share one timeline.
 */
export function nowMicros(): number {
  const [sec, nsec] = process.hrtime();
  return sec * 1e6 + nsec / 1e3;
}

/** When the process started, on the `nowMicros()` clock. */
export function processStartMicros(): number {
  return nowMicros() - performance.now() * 1e3;
}

function emptySummary(wallUs: number): PerfSummary {
  return {
    version: 1,
    wallUs,
    node: {spans: {}, async: {}, mainThreadBusyUs: 0, counters: {}},
  };
}

/** Track of GC pauses in the Node process. */
const GC_TID = 2;

/** `perf_hooks.constants.NODE_PERFORMANCE_GC_*`, the `detail.kind` of `gc` entries. */
const GC_KINDS: Record<number, string> = {
  1: 'minor',
  2: 'minor mark-sweep',
  4: 'major',
  8: 'incremental',
  16: 'weakcb',
};

function metadata(name: string, pid: number, tid: number, value: string): TraceEvent {
  return {name, ph: 'M', pid, tid, ts: 0, args: {name: value}};
}

export const NOOP_TRACER: Tracer = Object.freeze({
  enabled: false,
  begin: () => 0,
  end: () => {},
  slice: <T>(_kind: SpanKind, fn: () => T): T => fn(),
  record: () => {},
  newFileId: () => 0,
  asyncBegin: () => {},
  asyncEnd: () => {},
  count: () => {},
  addAnalyzerPerf: () => {},
  take: () => ({events: [], summary: emptySummary(0)}),
});

export function createTracer(): Tracer {
  return new RecordingTracer(process.pid);
}

class RecordingTracer implements Tracer {
  readonly enabled = true;
  private events: TraceEvent[] = [];
  // Open synchronous sections, innermost last.
  private readonly openKind: SpanKind[] = [];
  private readonly openStart: number[] = [];
  private readonly openFile: Array<number | undefined> = [];
  private readonly openChildUs: number[] = [];
  private openNonAwaiting = 0;
  private readonly spanCount = new Float64Array(SPAN_KINDS);
  private readonly spanInclusiveUs = new Float64Array(SPAN_KINDS);
  private readonly spanSelfUs = new Float64Array(SPAN_KINDS);
  private readonly asyncCount = new Float64Array(SPAN_KINDS);
  private readonly asyncWallUs = new Float64Array(SPAN_KINDS);
  /** Start of each open async slice, keyed `fileId * SPAN_KINDS + kind`. */
  private readonly asyncOpen = new Map<number, number>();
  private readonly counters = new Float64Array(COUNTERS);
  private busyUs = 0;
  private startUs = nowMicros();
  private nextFileId = 1;
  private rust: RustSummary | undefined = undefined;
  private gcObserver: PerformanceObserver | undefined;
  private gcCount = 0;
  private gcUs = 0;

  constructor(private readonly pid: number) {
    // Only created when tracing. GC pauses go on their own track, since their timestamps come
    // from a different clock and could cross the main thread's slice boundaries by a few µs.
    this.gcObserver = new PerformanceObserver((list) => this.addGcEntries(list.getEntries()));
    this.gcObserver.observe({entryTypes: ['gc']});
  }

  private addGcEntries(entries: PerformanceEntry[]): void {
    const origin = processStartMicros();
    for (const entry of entries) {
      const kind = (entry as PerformanceEntry & {detail?: {kind?: number}}).detail?.kind;
      const dur = entry.duration * 1e3;
      this.gcCount++;
      this.gcUs += dur;
      this.events.push({
        name: 'ngp.Gc',
        cat: 'ngp.gc',
        ph: 'X',
        pid: this.pid,
        tid: GC_TID,
        ts: origin + entry.startTime * 1e3,
        dur,
        args: {kind: GC_KINDS[kind ?? 0] ?? 'other'},
      });
    }
  }

  begin(kind: SpanKind, fileId?: number): number {
    if (AWAITING_KINDS[kind] && this.openNonAwaiting > 0) {
      throw new Error(`${SpanKind[kind]} can't begin inside a synchronous section`);
    }
    this.openKind.push(kind);
    this.openStart.push(nowMicros());
    this.openFile.push(fileId);
    this.openChildUs.push(0);
    if (!AWAITING_KINDS[kind]) {
      this.openNonAwaiting++;
    }
    return this.openKind.length;
  }

  end(token: number): void {
    if (token < 1 || token > this.openKind.length) {
      return;
    }
    const now = nowMicros();
    while (this.openKind.length >= token) {
      this.close(now);
    }
  }

  record(kind: SpanKind, startUs: number): void {
    if (!AWAITING_KINDS[kind]) {
      this.openNonAwaiting++;
    }
    this.finish(kind, startUs, nowMicros(), undefined, 0);
  }

  private close(now: number): void {
    const kind = this.openKind.pop()!;
    const start = this.openStart.pop()!;
    const fileId = this.openFile.pop();
    const childUs = this.openChildUs.pop()!;
    this.finish(kind, start, now, fileId, childUs);
  }

  private finish(
    kind: SpanKind,
    start: number,
    now: number,
    fileId: number | undefined,
    childUs: number,
  ): void {
    const dur = Math.max(0, now - start);
    this.spanCount[kind]++;
    this.spanInclusiveUs[kind] += dur;
    this.spanSelfUs[kind] += Math.max(0, dur - childUs);
    const depth = this.openChildUs.length;
    if (depth > 0) {
      this.openChildUs[depth - 1] += dur;
    }
    if (!AWAITING_KINDS[kind] && --this.openNonAwaiting === 0) {
      this.busyUs += dur;
    }
    const event: TraceEvent = {
      name: SPAN_NAMES[kind],
      cat: 'ngp',
      ph: 'X',
      pid: this.pid,
      tid: 1,
      ts: start,
      dur,
    };
    if (fileId) {
      event.args = {f: fileId};
    }
    this.events.push(event);
  }

  slice<T>(kind: SpanKind, fn: () => T, fileId?: number): T {
    const token = this.begin(kind, fileId);
    try {
      return fn();
    } finally {
      this.end(token);
    }
  }

  newFileId(path: string): number {
    const fileId = this.nextFileId++;
    this.asyncEvent('b', SpanKind.File, fileId, {path});
    return fileId;
  }

  asyncBegin(kind: SpanKind, fileId: number): void {
    this.asyncEvent('b', kind, fileId);
  }

  asyncEnd(kind: SpanKind, fileId: number): void {
    this.asyncEvent('e', kind, fileId);
  }

  private asyncEvent(
    ph: 'b' | 'e',
    kind: SpanKind,
    fileId: number,
    args?: Record<string, unknown>,
  ): void {
    const now = nowMicros();
    const key = fileId * SPAN_KINDS + kind;
    if (ph === 'b') {
      this.asyncOpen.set(key, now);
    } else {
      const start = this.asyncOpen.get(key);
      if (start === undefined) {
        return;
      }
      this.asyncOpen.delete(key);
      this.asyncCount[kind]++;
      this.asyncWallUs[kind] += Math.max(0, now - start);
    }
    const event: TraceEvent = {
      name: SPAN_NAMES[kind],
      cat: 'ngp.file',
      ph,
      pid: this.pid,
      tid: 1,
      ts: now,
      id2: {local: fileId},
    };
    if (args !== undefined) {
      event.args = args;
    }
    this.events.push(event);
  }

  count(counter: Counter, n = 1): void {
    this.counters[counter] += n;
  }

  addAnalyzerPerf(perf: AnalyzerPerfTake): void {
    this.rust = perf.summary;
    const pid = perf.pid;
    // Rust clock to Node clock: `nowUs` was read about halfway through the round trip.
    const base = (perf.requestUs + perf.responseUs) / 2 - perf.nowUs;
    for (const e of perf.events) {
      this.events.push({...e, pid, ts: e.ph === 'M' ? 0 : e.ts + base});
    }
    // The summary goes in the trace too: counters as a counter track, and the per-kind totals
    // (with the slowest executions) as a process-wide instant, whose args Perfetto shows when
    // it's selected.
    const ts = perf.nowUs + base;
    const {counters, ...summary} = perf.summary;
    const cat = 'ngp.rust';
    this.events.push({name: 'ngp.rust.Counters', cat, ph: 'C', pid, tid: 0, ts, args: counters});
    this.events.push({
      name: 'ngp.rust.Summary',
      cat,
      ph: 'i',
      s: 'p',
      pid,
      tid: 0,
      ts,
      args: summary,
    });
  }

  take(): {events: TraceEvent[]; summary: PerfSummary} {
    const now = nowMicros();
    const summary = emptySummary(Math.round(now - this.startUs));
    const node = summary.node;
    for (let kind = 0; kind < SPAN_KINDS; kind++) {
      if (this.spanCount[kind] > 0) {
        node.spans[SpanKind[kind]] = {
          count: this.spanCount[kind],
          selfUs: Math.round(this.spanSelfUs[kind]),
          inclusiveUs: Math.round(this.spanInclusiveUs[kind]),
        };
      }
      if (this.asyncCount[kind] > 0) {
        node.async[SpanKind[kind]] = {
          count: this.asyncCount[kind],
          wallUs: Math.round(this.asyncWallUs[kind]),
        };
      }
    }
    node.mainThreadBusyUs = Math.round(this.busyUs);
    for (let counter = 0; counter < COUNTERS; counter++) {
      node.counters[Counter[counter]] = this.counters[counter];
    }
    if (this.gcObserver !== undefined) {
      // Entries are delivered a tick after the GC, so ones from the last tick may be missed.
      // `takeRecords` is missing from some @types/node versions.
      const observer = this.gcObserver as unknown as {takeRecords?(): PerformanceEntry[]};
      this.addGcEntries(observer.takeRecords?.() ?? []);
      this.gcObserver.disconnect();
      this.gcObserver = undefined;
    }
    node.gc = {count: this.gcCount, totalUs: Math.round(this.gcUs)};
    const {spans, async, ...nodeTotals} = node;
    if (this.rust !== undefined) {
      summary.rust = this.rust;
    }

    const pid = this.pid;
    const events: TraceEvent[] = [
      metadata('process_name', pid, 0, 'ngp'),
      metadata('thread_name', pid, 1, 'main'),
      metadata('thread_name', pid, GC_TID, 'gc'),
      ...this.events,
      {name: 'ngp.Counters', cat: 'ngp', ph: 'C', pid, tid: 1, ts: now, args: {...node.counters}},
      // Spans are left out; the timeline has them.
      {name: 'ngp.Summary', cat: 'ngp', ph: 'i', s: 'p', pid, tid: 1, ts: now, args: nodeTotals},
    ];

    // Sections an exception left open can't be closed meaningfully; drop them.
    this.openKind.length = 0;
    this.openStart.length = 0;
    this.openFile.length = 0;
    this.openChildUs.length = 0;
    this.openNonAwaiting = 0;
    this.events = [];
    this.spanCount.fill(0);
    this.spanInclusiveUs.fill(0);
    this.spanSelfUs.fill(0);
    this.asyncCount.fill(0);
    this.asyncWallUs.fill(0);
    this.counters.fill(0);
    this.busyUs = 0;
    this.gcCount = 0;
    this.gcUs = 0;
    this.startUs = now;
    this.rust = undefined;
    return {events, summary};
  }
}

/** Writes `events` to `filePath` as a Chrome trace JSON array, overwriting it. */
export async function writeTraceFile(filePath: string, events: TraceEvent[]): Promise<void> {
  await fs.mkdir(path.dirname(filePath), {recursive: true});
  await fs.writeFile(filePath, JSON.stringify(events), 'utf8');
}

/** Writes `summary` to `filePath` as JSON, overwriting it. */
export async function writeSummaryFile(filePath: string, summary: PerfSummary): Promise<void> {
  await fs.mkdir(path.dirname(filePath), {recursive: true});
  await fs.writeFile(filePath, JSON.stringify(summary, null, 2), 'utf8');
}
