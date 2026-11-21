/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'path';
import {PerformanceObserver} from 'perf_hooks';
import {createAnalyzer} from '../api.js';
import {SidecarAnalyzer} from '../src/analyzer_sidecar.js';
import {parseComponentTemplate} from '../src/compiler-utils.js';
import {HybridCompiler} from '../src/hybrid_compiler.js';
import {
  Counter,
  createTracer,
  NOOP_TRACER,
  nowMicros,
  processStartMicros,
  SpanKind,
  type AnalyzerPerfTake,
  type TraceEvent,
} from '../src/perf.js';
import {buildTypeCheckingConfig} from '../src/tcb.js';
import type * as nga from '../src/types.js';
import {resolveFixtureNodeModules, resolveWasmBinding} from './utils.js';

/** Busy-waits so that a section has a measurable duration. */
function spin(us: number): void {
  const [s, ns] = process.hrtime();
  const end = s * 1e6 + ns / 1e3 + us;
  while (true) {
    const [s2, ns2] = process.hrtime();
    if (s2 * 1e6 + ns2 / 1e3 >= end) {
      return;
    }
  }
}

function spans(events: TraceEvent[], ph: TraceEvent['ph']): TraceEvent[] {
  return events.filter((e) => e.ph === ph);
}

describe('Tracer', () => {
  it('records nothing when disabled', async () => {
    expect(NOOP_TRACER.enabled).toBeFalse();
    expect(NOOP_TRACER.slice(SpanKind.SourceMap, () => 42, 1)).toBe(42);
    expect(await NOOP_TRACER.sliceAsync(SpanKind.PrepareChunk, async () => 'x')).toBe('x');
    const fileId = NOOP_TRACER.newFileId('/a.ts');
    NOOP_TRACER.asyncBegin(SpanKind.WriteOutput, fileId);
    NOOP_TRACER.asyncEnd(SpanKind.WriteOutput, fileId);
    NOOP_TRACER.asyncEnd(SpanKind.File, fileId);
    NOOP_TRACER.count(Counter.FilesEmitted, 3);

    const {events, summary} = NOOP_TRACER.take();
    expect(events).toEqual([]);
    expect(summary.node.spans).toEqual({});
    expect(summary.node.async).toEqual({});
    expect(summary.node.counters).toEqual({});
    expect(summary.rust).toBeUndefined();
  });

  it('nests synchronous slices and computes self time', () => {
    const tracer = createTracer();
    tracer.slice(SpanKind.Compile, () => {
      spin(200);
      tracer.slice(SpanKind.GenerateTcb, () => spin(500), 7);
    });

    const {events, summary} = tracer.take();
    const [inner, outer] = spans(events, 'X');
    expect(outer.name).toBe('ngp.Compile');
    expect(outer.cat).toBe('ngp');
    expect(outer.tid).toBe(1);
    expect(outer.pid).toBe(process.pid);
    expect(outer.args).toBeUndefined();
    expect(inner.name).toBe('ngp.GenerateTcb');
    expect(inner.args).toEqual({f: 7});
    expect(inner.ts).toBeGreaterThanOrEqual(outer.ts);
    expect(inner.ts + inner.dur!).toBeLessThanOrEqual(outer.ts + outer.dur!);

    const compile = summary.node.spans['Compile'];
    const tcb = summary.node.spans['GenerateTcb'];
    expect(compile.count).toBe(1);
    expect(tcb.count).toBe(1);
    expect(tcb.selfUs).toBe(tcb.inclusiveUs);
    expect(compile.inclusiveUs).toBeGreaterThanOrEqual(tcb.inclusiveUs + 150);
    expect(Math.abs(compile.selfUs - (compile.inclusiveUs - tcb.inclusiveUs))).toBeLessThanOrEqual(
      1,
    );
    // Only the top-level slice counts towards main-thread busy time.
    expect(Math.abs(summary.node.mainThreadBusyUs - compile.inclusiveUs)).toBeLessThanOrEqual(1);
  });

  it('does not count sections spanning driver-level awaits as busy time', () => {
    const tracer = createTracer();
    tracer.slice(SpanKind.AwaitAnalysis, () => spin(300));
    tracer.slice(SpanKind.PrepareChunk, () => {
      tracer.slice(SpanKind.PrepareTcbTargets, () => spin(200));
    });

    const {summary} = tracer.take();
    const tcb = summary.node.spans['PrepareTcbTargets'];
    expect(summary.node.spans['AwaitAnalysis'].inclusiveUs).toBeGreaterThanOrEqual(300);
    expect(Math.abs(summary.node.mainThreadBusyUs - tcb.inclusiveUs)).toBeLessThanOrEqual(1);
  });

  it('ends a slice when its body throws', () => {
    const tracer = createTracer();
    expect(() =>
      tracer.slice(SpanKind.Compile, () => {
        tracer.slice(SpanKind.TemplateBind, () => {
          throw new Error('boom');
        });
      }),
    ).toThrowError('boom');
    tracer.slice(SpanKind.PrepareChunk, () => {});

    const {events, summary} = tracer.take();
    expect(spans(events, 'X').map((e) => e.name)).toEqual([
      'ngp.TemplateBind',
      'ngp.Compile',
      'ngp.PrepareChunk',
    ]);
    expect(summary.node.spans['Compile'].count).toBe(1);
  });

  it('ends an async slice when its promise settles, and propagates rejections', async () => {
    const tracer = createTracer();
    const value = await tracer.sliceAsync(SpanKind.AwaitAnalysis, async () => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      spin(300);
      return 42;
    });
    expect(value).toBe(42);
    await expectAsync(
      tracer.sliceAsync(SpanKind.PrepareChunk, async () => {
        await Promise.resolve();
        throw new Error('rejected');
      }),
    ).toBeRejectedWithError('rejected');
    tracer.slice(SpanKind.PrepareTcbTargets, () => {});

    const {events, summary} = tracer.take();
    const [wait, prepare, tcb] = spans(events, 'X');
    expect([wait.name, prepare.name, tcb.name]).toEqual([
      'ngp.AwaitAnalysis',
      'ngp.PrepareChunk',
      'ngp.PrepareTcbTargets',
    ]);
    expect(wait.dur).toBeGreaterThanOrEqual(300);
    expect(wait.ts + wait.dur!).toBeLessThanOrEqual(prepare.ts);
    expect(summary.node.spans['PrepareChunk'].count).toBe(1);
    // Awaiting sections are wall time, not main-thread busy time.
    expect(Math.abs(summary.node.mainThreadBusyUs - tcb.dur!)).toBeLessThanOrEqual(1);
  });

  it('records overlapping per-file work as async slices with file ids', async () => {
    const tracer = createTracer();
    const processFile = async (path: string, delayMs: number) => {
      const fileId = tracer.newFileId(path);
      try {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        tracer.slice(SpanKind.SourceMap, () => {}, fileId);
        tracer.asyncBegin(SpanKind.WriteOutput, fileId);
        await new Promise((resolve) => setTimeout(resolve, 1));
        tracer.asyncEnd(SpanKind.WriteOutput, fileId);
      } finally {
        tracer.asyncEnd(SpanKind.File, fileId);
      }
    };
    await Promise.all([processFile('/a.ts', 5), processFile('/b.ts', 1)]);

    const {events, summary} = tracer.take();
    const begins = spans(events, 'b');
    const ends = spans(events, 'e');
    const fileBegins = begins.filter((e) => e.name === 'ngp.File');
    expect(fileBegins.map((e) => [e.id2, e.args])).toEqual([
      [{local: 1}, {path: '/a.ts'}],
      [{local: 2}, {path: '/b.ts'}],
    ]);
    for (const e of [...begins, ...ends]) {
      expect(e.cat).toBe('ngp.file');
      expect(e.tid).toBe(1);
    }
    // b.ts finishes first, so the file slices overlap.
    const fileEnds = ends.filter((e) => e.name === 'ngp.File');
    expect(fileEnds.map((e) => e.id2!.local)).toEqual([2, 1]);
    expect(fileEnds[1].ts).toBeGreaterThan(fileBegins[1].ts);
    expect(ends.filter((e) => e.name === 'ngp.WriteOutput').length).toBe(2);
    expect(
      spans(events, 'X')
        .filter((e) => e.name === 'ngp.SourceMap')
        .map((e) => e.args)
        .sort((x, y) => (x!['f'] as number) - (y!['f'] as number)),
    ).toEqual([{f: 1}, {f: 2}]);

    // Summary keys are the bare enum names.
    expect(summary.node.async['File'].count).toBe(2);
    expect(summary.node.async['File'].wallUs).toBeGreaterThanOrEqual(5000);
    expect(summary.node.async['WriteOutput'].count).toBe(2);
  });

  it('aggregates counters and the analyzer summary, then resets on take()', () => {
    const tracer = createTracer();
    tracer.count(Counter.TemplatesParsed);
    tracer.count(Counter.TemplatesParsed);
    tracer.count(Counter.FilesAnalyzed, 5);
    tracer.slice(SpanKind.Compile, () => {});
    tracer.slice(SpanKind.Compile, () => {});
    const rust: AnalyzerPerfTake = {
      nowUs: 10,
      pid: 123,
      events: [
        {name: 'process_name', ph: 'M', tid: 0, ts: 0, args: {name: 'ng-analyze'}},
        {name: 'thread_name', ph: 'M', tid: 1, ts: 0, args: {name: 'ng-analyze-worker-1'}},
        {name: 'ngp.rust.AnalyzeFileSemantic', cat: 'ngp.query', ph: 'X', tid: 1, ts: 2, dur: 3},
      ],
      summary: {
        queries: {
          AnalyzeFileSemantic: {
            count: 1,
            cacheHits: 2,
            busyUs: 3,
            selfUs: 3,
            queuedUs: 0,
            wallUs: 4,
            cancelled: 0,
          },
        },
        spans: {Resolve: {count: 1, selfUs: 1}},
        counters: {FsStatCalls: 9},
      },
      requestUs: 0,
      responseUs: 20,
    };
    tracer.addAnalyzerPerf(rust);

    const {events, summary} = tracer.take();
    expect(summary.version).toBe(1);
    expect(summary.wallUs).toBeGreaterThanOrEqual(0);
    expect(summary.node.spans['Compile'].count).toBe(2);
    expect(summary.node.counters['TemplatesParsed']).toBe(2);
    expect(summary.node.counters['FilesAnalyzed']).toBe(5);
    expect(summary.node.counters['FilesEmitted']).toBe(0);
    expect(Object.keys(summary.node.counters).length).toBe(Object.keys(Counter).length / 2);
    expect(summary.rust).toEqual(rust.summary);
    expect(JSON.parse(JSON.stringify(summary))).toEqual(summary);

    expect(spans(events, 'M').map((e) => [e.name, e.pid, e.tid, e.args])).toEqual([
      ['process_name', process.pid, 0, {name: 'ngp'}],
      ['thread_name', process.pid, 1, {name: 'main'}],
      ['thread_name', process.pid, 2, {name: 'gc'}],
      ['process_name', 123, 0, {name: 'ng-analyze'}],
      ['thread_name', 123, 1, {name: 'ng-analyze-worker-1'}],
    ]);
    const counters = spans(events, 'C');
    expect(counters.map((e) => [e.name, e.pid])).toEqual([
      ['ngp.rust.Counters', 123],
      ['ngp.Counters', process.pid],
    ]);
    expect(counters[0].args).toEqual({FsStatCalls: 9});
    expect(counters[1].args).toEqual(summary.node.counters);
    // The Rust per-kind summary is in the trace as a process-wide instant on the sidecar pid.
    const rustSummary = spans(events, 'i').find((e) => e.name === 'ngp.rust.Summary')!;
    expect(rustSummary.pid).toBe(123);
    expect(rustSummary.s).toBe('p');
    expect(rustSummary.ts).toBe(counters[0].ts);
    expect(rustSummary.args).toEqual({queries: rust.summary.queries, spans: rust.summary.spans});

    const second = tracer.take();
    expect(second.summary.node.spans).toEqual({});
    expect(second.summary.node.counters['TemplatesParsed']).toBe(0);
    expect(second.summary.rust).toBeUndefined();
    expect(spans(second.events, 'X')).toEqual([]);
  });

  it('moves analyzer events onto the Node clock with the sidecar pid', () => {
    const tracer = createTracer();
    const events = [
      {name: 'thread_name', ph: 'M', tid: 1, ts: 0, args: {name: 'ng-analyze-worker-0'}},
      {name: 'ngp.rust.Query', cat: 'ngp.query', ph: 's', tid: 1001, ts: 120, id: 9},
      {name: 'ngp.rust.Query', cat: 'ngp.query', ph: 'f', tid: 1, ts: 130, id: 9, bp: 'e'},
      {
        name: 'ngp.rust.ParseFile',
        cat: 'ngp.query',
        ph: 'X',
        tid: 1,
        ts: 130,
        dur: 40,
        args: {q: 9},
      },
      {name: 'ngp.rust.Analyze', cat: 'ngp.rust', ph: 'b', tid: 1001, ts: 100.5, id2: {local: 5}},
    ] as const;
    tracer.addAnalyzerPerf({
      nowUs: 1000,
      pid: 77,
      events: [...events],
      summary: {queries: {}, spans: {}, counters: {}},
      // Midpoint 50_000 is Rust 1000, so Rust t maps to t + 49_000.
      requestUs: 49_990,
      responseUs: 50_010,
    });

    const rust = tracer.take().events.filter((e) => e.pid === 77);
    expect(rust.slice(0, events.length)).toEqual(
      events.map((e) => ({...e, pid: 77, ts: e.ph === 'M' ? 0 : e.ts + 49_000})),
    );
    // Then the summary, at the Rust `nowUs`.
    expect(rust.slice(events.length).map((e) => [e.name, e.ts])).toEqual([
      ['ngp.rust.Counters', 50_000],
      ['ngp.rust.Summary', 50_000],
    ]);
  });

  it('records a section that started before the tracer existed', () => {
    const tracer = createTracer();
    tracer.record(SpanKind.Startup, processStartMicros());
    const {events, summary} = tracer.take();
    const startup = spans(events, 'X').find((e) => e.name === 'ngp.Startup')!;
    // The process has been running for at least as long as this test file took to load.
    expect(startup.dur!).toBeGreaterThan(0);
    expect(startup.ts).toBeLessThan(startup.ts + startup.dur!);
    // Startup includes module loading, so it isn't main thread busy time.
    expect(summary.node.mainThreadBusyUs).toBe(0);
  });

  it('records GC pauses only while tracing, on their own track', async () => {
    const observe = spyOn(PerformanceObserver.prototype, 'observe').and.callThrough();
    NOOP_TRACER.take();
    expect(observe).not.toHaveBeenCalled();

    const tracer = createTracer();
    expect(observe).toHaveBeenCalledOnceWith({entryTypes: ['gc']});
    let garbage: number[][] = [];
    for (let i = 0; i < 200_000; i++) {
      garbage.push(new Array(32).fill(i));
      if (garbage.length > 500) garbage = [];
    }
    // Entries are delivered asynchronously.
    await new Promise((resolve) => setTimeout(resolve, 10));
    const disconnect = spyOn(PerformanceObserver.prototype, 'disconnect').and.callThrough();
    const {events, summary} = tracer.take();
    expect(disconnect).toHaveBeenCalledTimes(1);

    const gc = spans(events, 'X').filter((e) => e.cat === 'ngp.gc');
    expect(gc.length).toBeGreaterThan(0);
    expect(summary.node.gc!.count).toBe(gc.length);
    for (const e of gc) {
      expect(e.tid).toBe(2);
      expect(e.name).toBe('ngp.Gc');
      expect(typeof e.args!['kind']).toBe('string');
    }
    const nodeSummary = spans(events, 'i').find((e) => e.name === 'ngp.Summary')!;
    expect(nodeSummary.args!['gc']).toEqual(summary.node.gc);
    // The observer is gone after the first take().
    expect(tracer.take().summary.node.gc).toEqual({count: 0, totalUs: 0});
  });

  it('counts and times each template parse, parsing the diagnostic copy on first use', () => {
    const tracer = createTracer();
    const component = {
      template: '<div>{{ a }}</div>',
      templateUrl: null,
      templateContentSpan: null,
    } as unknown as nga.ComponentMetadata;
    const parsed = parseComponentTemplate(component, '/app.ts', '', {}, tracer);

    let {events, summary} = tracer.take();
    expect(summary.node.counters['TemplatesParsed']).toBe(1);
    expect(summary.node.spans['TemplateParse'].count).toBe(1);
    expect(spans(events, 'X').filter((e) => e.name === 'ngp.TemplateParse').length).toBe(1);

    // Reading `diagNodes` parses the span-faithful copy once and memoizes it.
    expect(parsed.diagNodes).toBe(parsed.diagNodes);
    ({events, summary} = tracer.take());
    expect(summary.node.counters['TemplatesParsed']).toBe(1);
    expect(summary.node.spans['TemplateParse'].count).toBe(1);
    expect(spans(events, 'X').filter((e) => e.name === 'ngp.TemplateParse').length).toBe(1);
  });

  it('parses each template once in devmode, and parses diagNodes on demand when indexing', async () => {
    const virtualFiles: Record<string, string> = {
      '/tsconfig.json': JSON.stringify({
        compilerOptions: {},
        files: ['/a.ts', '/b.ts'],
      }),
      '/a.ts': `
        import {Component} from '@angular/core';
        import {B} from './b';
        @Component({selector: 'app-a', imports: [B], template: '<app-b />'})
        export class A {}
      `,
      '/b.ts': `
        import {Component} from '@angular/core';
        @Component({selector: 'app-b', template: '<span>b</span>'})
        export class B {}
      `,
    };
    const analyzer = await createAnalyzer('/tsconfig.json', {
      virtualFiles,
      backend: 'wasm',
      wasmBinding: resolveWasmBinding(),
      optimize: false,
      nodeModulesPathOverride: resolveFixtureNodeModules(),
    });
    const tracer = createTracer();
    const compiler = new HybridCompiler(analyzer, {
      optimize: false,
      tcbConfig: buildTypeCheckingConfig({strictTemplates: true}),
      tracer,
    });
    try {
      await compiler.compile();
      expect(tracer.take().summary.node.counters['TemplatesParsed']).toBe(2);

      // Indexing on demand afterwards reuses cached templates and parses only `diagNodes`.
      await compiler.getIndexedComponents();
      expect(tracer.take().summary.node.counters['TemplatesParsed']).toBe(2);
    } finally {
      analyzer.close();
    }
  });

  it('keeps compiling after a file throws mid-Compile, with its sections closed', async () => {
    const root = await fs.mkdtemp(path.join(process.env['TEST_TMPDIR'] || os.tmpdir(), 'perf-'));
    const files: Record<string, string> = {
      'tsconfig.json': JSON.stringify({compilerOptions: {}, files: ['a.component.ts', 'bad.ts']}),
      // The stylesheet link's content is read while `bad.ts` compiles, which is where the throw happens.
      'bad.ts': `
        import {Component} from '@angular/core';
        @Component({selector: 'app-bad', template: '<link rel="stylesheet" href="./missing.css">'})
        export class BadComponent {}
      `,
      // Depends on `bad.ts`, so it's analyzed in a later chunk, prepared after the throw.
      'a.component.ts': `
        import {Component} from '@angular/core';
        import {BadComponent} from './bad';
        @Component({selector: 'app-a', imports: [BadComponent], template: '<app-bad />'})
        export class AComponent {}
      `,
    };
    for (const [name, content] of Object.entries(files)) {
      await fs.writeFile(path.join(root, name), content);
    }
    const analyzer = await createAnalyzer(path.join(root, 'tsconfig.json'), {
      backend: 'wasm',
      wasmBinding: resolveWasmBinding(),
      optimize: true,
      nodeModulesPathOverride: resolveFixtureNodeModules(),
    });
    // The resolved resource's `content` is read inside the `Compile` section for the stylesheet link.
    const throwingAnalyzer = new Proxy(analyzer, {
      get(target, prop, receiver) {
        if (prop === 'readResource') {
          return async (): Promise<nga.ResolvedResource> => ({
            resolvedPath: path.join(root, 'missing.css'),
            get content(): string {
              throw new Error('no stylesheet');
            },
          });
        }
        const value = Reflect.get(target, prop, receiver);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
    const tracer = createTracer();
    const compiler = new HybridCompiler(throwingAnalyzer, {
      optimize: true,
      tcbConfig: buildTypeCheckingConfig({strictTemplates: true}),
      tracer,
    });
    try {
      const outputs = await compiler.compile();
      expect([...compiler.currentProcessErrors.values()]).toEqual(['no stylesheet']);
      expect([...outputs.keys()].map((p) => path.basename(p))).toEqual(['a.component.ts']);
    } finally {
      analyzer.close();
      await fs.rm(root, {recursive: true, force: true});
    }

    const {events, summary} = tracer.take();
    // Both files' `Compile` sections are closed, the failed one by the throw.
    expect(summary.node.spans['Compile'].count).toBe(2);
    expect(summary.node.spans['PrepareChunk'].count).toBe(2);
    const compiles = spans(events, 'X').filter((e) => e.name === 'ngp.Compile');
    const prepares = spans(events, 'X').filter((e) => e.name === 'ngp.PrepareChunk');
    expect(compiles[0].ts + compiles[0].dur!).toBeLessThanOrEqual(prepares[1].ts);
  });

  describe('with a scripted sidecar', () => {
    let tmpDir: string;

    beforeEach(async () => {
      if (process.platform === 'win32') {
        pending('The scripted sidecar launcher is a POSIX shell script.');
      }
      tmpDir = await fs.mkdtemp(path.join(process.env['TEST_TMPDIR'] || os.tmpdir(), 'perf-'));
    });

    afterEach(async () => {
      await fs.rm(tmpDir, {recursive: true, force: true});
    });

    it('aligns the clocks on the `now` round trip, not the slow `takePerf` one', async () => {
      const takeDelayMs = 300;
      const script = path.join(tmpDir, 'fake_sidecar.mjs');
      await fs.writeFile(
        script,
        `
import * as readline from 'node:readline';
const send = (message) => process.stdout.write(JSON.stringify(message) + '\\n');
let nowCalls = 0;
readline.createInterface({input: process.stdin}).on('line', (line) => {
  const {id, method} = JSON.parse(line);
  if (method === 'now') {
    nowCalls++;
    send({id, result: {nowUs: 111}});
  } else if (method === 'takePerf') {
    // A reply that takes a while to arrive, as a multi-MB one does.
    setTimeout(() => {
      const summary = {queries: {}, spans: {}, counters: {nowCalls}};
      send({id, result: {nowUs: 999, pid: 1, events: [], summary}});
    }, ${takeDelayMs});
  } else {
    send({id, result: null});
  }
});
`,
      );
      const launcher = path.join(tmpDir, 'fake_sidecar');
      await fs.writeFile(launcher, `#!/bin/sh\nexec "${process.execPath}" "${script}"\n`);
      await fs.chmod(launcher, 0o755);

      const sidecar = new SidecarAnalyzer(launcher);
      try {
        await sidecar.initialize('/tsconfig.json', false);
        const before = nowMicros();
        const take = await sidecar.takePerf();
        expect(nowMicros() - before).toBeGreaterThanOrEqual(takeDelayMs * 1000 - 5000);
        // `now` was called once, before `takePerf`, and is what the alignment uses.
        expect(take.summary.counters['nowCalls']).toBe(1);
        expect(take.nowUs).toBe(111);
        expect(take.requestUs).toBeGreaterThanOrEqual(before);
        expect(take.responseUs - take.requestUs).toBeLessThan(takeDelayMs * 1000);
      } finally {
        sidecar.close();
      }
    });
  });
});
