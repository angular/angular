/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {execFileSync} from 'child_process';
import * as fs from 'node:fs/promises';
import * as os from 'os';
import * as path from 'path';
import {resolveGoldenRoot} from './golden_cases.js';
import {
  getOrCreateSyntheticNodeModules,
  parseMarkdownTestCase,
  pathExists,
  resolveSidecarBinary,
} from './utils.js';
import type {PerfSummary, RustSummary, TraceEvent} from '../src/perf.js';
import {createHybridCompiler, HybridCompiler, type IAnalyzer} from '../src/hybrid_compiler.js';
import {run} from '../ngp.js';

describe('ngp CLI (main.ts)', () => {
  const ngpPath = path.resolve(import.meta.dirname, '../main.js');
  const fixtureDir = path.join(resolveGoldenRoot(), 'directive_host_directives');
  let tempDir: string;
  let tsconfigPath: string;

  const runNgp = (args: string[]) => {
    return execFileSync(process.execPath, [...process.execArgv, ngpPath, ...args], {
      encoding: 'utf-8',
      stdio: 'pipe',
      env: process.env,
    });
  };

  beforeAll(async () => {
    const mdPath = path.join(fixtureDir, 'source.md');
    if (!(await pathExists(mdPath))) {
      throw new Error(`Source file not found: ${mdPath}`);
    }
    const files = await parseMarkdownTestCase(mdPath);

    tempDir = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'ngp-cli-test-')));
    tsconfigPath = path.join(tempDir, 'tsconfig.json');

    const nodeModules = getOrCreateSyntheticNodeModules();
    if (nodeModules) {
      await fs.symlink(nodeModules, path.join(tempDir, 'node_modules'), 'dir');
    }

    await Promise.all(
      files.map(async (file) => {
        const relativePath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
        const filePath = path.join(tempDir, relativePath);
        await fs.mkdir(path.dirname(filePath), {recursive: true});
        await fs.writeFile(filePath, file.content);
      }),
    );
  });

  afterAll(async () => {
    if (tempDir) {
      await fs.rm(tempDir, {recursive: true, force: true});
    }
  });

  it('should exit with an error when missing tsconfig argument', () => {
    expect(() => runNgp([])).toThrowError(
      /Usage: ngp <project-dir\|angular\.json\|tsconfig\.json>/,
    );
  });

  it('should process files and output to console by default', () => {
    const output = runNgp([tsconfigPath, '--wasm']);

    expect(output).toContain('Running ngp...');
    expect(output).toContain('Processing files...');
    expect(output).toContain('test.ts ---');
  });

  it('should create output files when --out is specified', async () => {
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ngp-cli-out-'));

    try {
      const output = runNgp([tsconfigPath, '--wasm', '--out', outDir, '--root', tempDir]);

      expect(output).toContain(`(output: ${outDir})`);
      expect(output).toContain(`(root: ${tempDir})`);

      const generatedSourcePath = path.join(outDir, 'test.ts');
      expect(await pathExists(generatedSourcePath)).toBe(true);
      expect(await pathExists(`${generatedSourcePath}.map`)).toBe(true);

      // `run()` writes the diagnostics file next to the tsconfig, not under `--out`.
      const diagPath = path.join(tempDir, 'tsconfig.ngdiag.json');
      expect(await pathExists(diagPath)).toBe(true);
      const diag = JSON.parse(await fs.readFile(diagPath, 'utf-8')) as {
        tsconfigPath: string;
        diagnostics: unknown[];
      };
      expect(diag.tsconfigPath).toBe(tsconfigPath);
      expect(diag.diagnostics).toEqual([]);
    } finally {
      await fs.rm(outDir, {recursive: true, force: true});
    }
  });

  it('creates HybridCompiler configured with options from innerAnalyzer', () => {
    const fakeAnalyzer = {
      analyze: async function* () {},
      getCompilerOptions: () => ({
        legacyOptionalChaining: true,
        annotateForClosureCompiler: true,
        workspaceName: 'my_ws',
        preserveWhitespaces: false,
      }),
      close: () => {},
    } as unknown as IAnalyzer;
    const compiler = createHybridCompiler(fakeAnalyzer, {
      optimize: true,
      rootDir: '/workspace',
      enableTemplateTypeChecker: true,
    });
    expect(compiler).toBeInstanceOf(HybridCompiler);
    expect(compiler.optimize).toBe(true);
    expect(compiler.legacyOptionalChaining).toBe(true);
    expect(compiler.isClosureCompilerEnabled).toBe(true);
    expect(compiler.workspaceName).toBe('my_ws');
    expect(compiler.rootDir).toBe('/workspace');
  });

  it('creates an incremental HybridCompiler unless incremental is false', () => {
    const fakeAnalyzer = {
      getCompilerOptions: () => ({}),
      close: () => {},
    } as unknown as IAnalyzer;
    expect(createHybridCompiler(fakeAnalyzer).incrementalEnabled).toBe(true);
    expect(createHybridCompiler(fakeAnalyzer, {incremental: true}).incrementalEnabled).toBe(true);
    expect(createHybridCompiler(fakeAnalyzer, {incremental: false}).incrementalEnabled).toBe(false);
  });

  it('leaves compiler.analyzer open when keepAnalyzerAlive is true', async () => {
    let closed = false;
    const fakeAnalyzer = {
      analyze: async function* () {},
      analyzeOptimized: async function* () {},
      close: () => {
        closed = true;
      },
    } as unknown as IAnalyzer;
    const compiler = new HybridCompiler(fakeAnalyzer, {optimize: false});
    await run(compiler, {keepAnalyzerAlive: true});
    expect(closed).toBe(false);
  });

  it('closes compiler.analyzer when keepAnalyzerAlive is false or omitted', async () => {
    let closed = false;
    const fakeAnalyzer = {
      analyze: async function* () {},
      analyzeOptimized: async function* () {},
      close: () => {
        closed = true;
      },
    } as unknown as IAnalyzer;
    const compiler = new HybridCompiler(fakeAnalyzer, {optimize: false});
    await run(compiler, {});
    expect(closed).toBe(true);
  });
});

describe('ngp CLI output of unchanged files', () => {
  const ngpPath = path.resolve(import.meta.dirname, '../main.js');

  const SERVICE_CONTENT = `export class Logger {
  log(message: string): void {
    console.log(message);
  }
}
`;
  const COMPONENT_CONTENT = `import {Component} from '@angular/core';

@Component({selector: 'my-cmp', template: '<div>{{ name }}</div>'})
export class MyComponent {
  name = 'hello';
}
`;
  const INJECTABLE_CONTENT = `import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class DataService {
  getData(): string[] {
    return [];
  }
}
`;

  let tempDir: string;
  let tsconfigPath: string;

  /** Writes a fixture project with `files` (relative path → content) into a fresh temp dir. */
  async function createProject(files: Record<string, string>): Promise<void> {
    tempDir = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'ngp-unchanged-test-')));
    tsconfigPath = path.join(tempDir, 'tsconfig.json');

    const nodeModules = getOrCreateSyntheticNodeModules();
    if (nodeModules) {
      await fs.symlink(nodeModules, path.join(tempDir, 'node_modules'), 'dir');
    }

    const tsconfig = {compilerOptions: {strict: true}, files: Object.keys(files)};
    await fs.writeFile(tsconfigPath, JSON.stringify(tsconfig));
    await Promise.all(
      Object.entries(files).map(([name, content]) =>
        fs.writeFile(path.join(tempDir, name), content),
      ),
    );
  }

  const runNgp = (...args: string[]) =>
    execFileSync(
      process.execPath,
      [...process.execArgv, ngpPath, tsconfigPath, '--wasm', ...args],
      {
        encoding: 'utf-8',
        stdio: 'pipe',
        env: process.env,
      },
    );

  /** The `.ng.ts`, `.ng.ts.map` and `.ngtypecheck.ts` paths NGP writes in-place for `name`. */
  const inPlaceOutputs = (name: string) => {
    const base = path.join(tempDir, name.replace(/\.ts$/, ''));
    return [`${base}.ng.ts`, `${base}.ng.ts.map`, `${base}.ngtypecheck.ts`];
  };

  afterEach(async () => {
    if (tempDir) {
      await fs.rm(tempDir, {recursive: true, force: true});
    }
  });

  it('does not write outputs for a file without Angular declarations in --in-place mode', async () => {
    await createProject({'logger.ts': SERVICE_CONTENT});

    runNgp('--optimize', '--in-place');

    for (const output of inPlaceOutputs('logger.ts')) {
      expect(await pathExists(output))
        .withContext(output)
        .toBe(false);
    }
    expect(await fs.readFile(path.join(tempDir, 'logger.ts'), 'utf-8')).toBe(SERVICE_CONTENT);
  });

  it('does not write outputs for an unchanged file in non-optimized --in-place mode', async () => {
    await createProject({'logger.ts': SERVICE_CONTENT});

    runNgp('--in-place');

    for (const output of inPlaceOutputs('logger.ts')) {
      expect(await pathExists(output))
        .withContext(output)
        .toBe(false);
    }
  });

  it('writes all outputs for a component in --in-place mode', async () => {
    await createProject({'my_cmp.ts': COMPONENT_CONTENT});

    runNgp('--optimize', '--in-place');

    const [ngTsPath, mapPath, tcbPath] = inPlaceOutputs('my_cmp.ts');
    expect(await pathExists(ngTsPath)).toBe(true);
    expect(await pathExists(mapPath)).toBe(true);
    expect(await pathExists(tcbPath)).toBe(true);
    const tcb = await fs.readFile(tcbPath, 'utf-8');
    expect(tcb.trim()).not.toBe('');
    expect(tcb).not.toContain('// Empty TCB');
    expect(await fs.readFile(path.join(tempDir, 'my_cmp.ts'), 'utf-8')).toBe(COMPONENT_CONTENT);
  });

  it('only writes outputs for changed files in a mixed --in-place target', async () => {
    await createProject({'logger.ts': SERVICE_CONTENT, 'my_cmp.ts': COMPONENT_CONTENT});

    runNgp('--optimize', '--in-place');

    for (const output of inPlaceOutputs('logger.ts')) {
      expect(await pathExists(output))
        .withContext(output)
        .toBe(false);
    }
    for (const output of inPlaceOutputs('my_cmp.ts')) {
      expect(await pathExists(output))
        .withContext(output)
        .toBe(true);
    }
    expect(await pathExists(path.join(tempDir, 'tsconfig.ngdiag.json'))).toBe(true);
  });

  it('does not write a type-check file for a changed file without a template in --in-place mode', async () => {
    await createProject({'data_service.ts': INJECTABLE_CONTENT});

    runNgp('--optimize', '--in-place');

    const [ngTsPath, mapPath, tcbPath] = inPlaceOutputs('data_service.ts');
    expect(await fs.readFile(ngTsPath, 'utf-8')).toContain('ɵprov');
    expect(await pathExists(mapPath)).toBe(true);
    expect(await pathExists(tcbPath)).toBe(false);
    expect(await fs.readFile(path.join(tempDir, 'data_service.ts'), 'utf-8')).toBe(
      INJECTABLE_CONTENT,
    );
  });

  it('still writes outputs for an unchanged file when --out is specified', async () => {
    await createProject({'logger.ts': SERVICE_CONTENT});
    const outDir = await fs.realpath(
      await fs.mkdtemp(path.join(os.tmpdir(), 'ngp-unchanged-out-')),
    );

    try {
      runNgp('--optimize', '--out', outDir, '--root', tempDir);

      const outputPath = path.join(outDir, 'logger.ts');
      expect(await fs.readFile(outputPath, 'utf-8')).toContain(SERVICE_CONTENT);
      expect(await pathExists(`${outputPath}.map`)).toBe(true);
      expect(await fs.readFile(path.join(outDir, 'logger.ngtypecheck.ts'), 'utf-8')).toBe(
        '// Empty TCB\nexport const empty = true;\n',
      );
    } finally {
      await fs.rm(outDir, {recursive: true, force: true});
    }
  });
});

describe('ngp CLI --perf-trace with the sidecar', () => {
  const ngpPath = path.resolve(import.meta.dirname, '../main.js');
  let tempDir: string;

  afterEach(async () => {
    if (tempDir) {
      await fs.rm(tempDir, {recursive: true, force: true});
    }
  });

  it('covers startup, the sidecar RPCs and the Rust summary', async () => {
    tempDir = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'ngp-perf-test-')));
    const nodeModules = getOrCreateSyntheticNodeModules();
    if (nodeModules) {
      await fs.symlink(nodeModules, path.join(tempDir, 'node_modules'), 'dir');
    }
    const tsconfigPath = path.join(tempDir, 'tsconfig.json');
    await fs.writeFile(tsconfigPath, JSON.stringify({files: ['my_cmp.ts']}));
    await fs.writeFile(
      path.join(tempDir, 'my_cmp.ts'),
      `import {Component} from '@angular/core';

@Component({selector: 'my-cmp', template: '<div>{{ name }}</div>'})
export class MyComponent {
  name = 'hello';
}
`,
    );
    const tracePath = path.join(tempDir, 'perf.trace');
    const summaryPath = path.join(tempDir, 'perf.json');
    execFileSync(
      process.execPath,
      [
        ...process.execArgv,
        ngpPath,
        tsconfigPath,
        '--optimize',
        '--in-place',
        '--sidecar',
        resolveSidecarBinary(),
        '--perf-trace',
        tracePath,
        '--perf-summary',
        summaryPath,
      ],
      {encoding: 'utf-8', stdio: 'pipe', env: process.env},
    );
    const events = JSON.parse(await fs.readFile(tracePath, 'utf-8')) as TraceEvent[];
    const summary = JSON.parse(await fs.readFile(summaryPath, 'utf-8')) as PerfSummary;

    const ngpPid = events.find((e) => e.name === 'process_name' && e.args?.['name'] === 'ngp')!.pid;
    const slices = events.filter((e) => e.pid === ngpPid && e.ph === 'X' && e.tid === 1);
    const named = (name: string) => slices.filter((e) => e.name === `ngp.${name}`);
    for (const name of ['Startup', 'SpawnSidecar', 'InitializeRpc', 'TakePerf', 'Close']) {
      expect(named(name).length).withContext(name).toBe(1);
    }
    expect(named('ParseAnalysisResult').length).toBeGreaterThan(0);
    expect(named('TemplateParse').length).toBe(2);
    expect(summary.node.counters['TemplatesParsed']).toBe(2);
    expect(summary.node.counters['AnalysisResultBytes']).toBeGreaterThan(0);
    // In order, and the main thread's slices nest.
    const [startup] = named('Startup');
    expect(startup.ts + startup.dur!).toBeLessThanOrEqual(named('SpawnSidecar')[0].ts);
    expect(named('TakePerf')[0].ts + named('TakePerf')[0].dur!).toBeLessThanOrEqual(
      named('Close')[0].ts,
    );
    const sorted = [...slices].sort((a, b) => a.ts - b.ts || b.dur! - a.dur!);
    const open: TraceEvent[] = [];
    for (const e of sorted) {
      while (open.length && open[open.length - 1].ts + open[open.length - 1].dur! <= e.ts) {
        open.pop();
      }
      const parent = open[open.length - 1];
      if (parent) {
        expect(e.ts + e.dur!)
          .withContext(`${e.name} in ${parent.name}`)
          .toBeLessThanOrEqual(parent.ts + parent.dur! + 1);
      }
      open.push(e);
    }

    // ng-analyze's counters and per-kind summary, with the slowest executions named by path.
    const rustPid = events.find(
      (e) => e.name === 'process_name' && e.args?.['name'] === 'ng-analyze',
    )!.pid;
    const counters = events.find((e) => e.name === 'ngp.rust.Counters')!;
    expect(counters.pid).toBe(rustPid);
    expect(counters.args!['FsReads']).toBeGreaterThan(0);
    const rustSummary = events.find((e) => e.name === 'ngp.rust.Summary')!;
    expect(rustSummary.pid).toBe(rustPid);
    const queries = rustSummary.args!['queries'] as RustSummary['queries'];
    const slowest = queries['ParseFile'].slowest!;
    expect(slowest.length).toBeGreaterThan(0);
    expect(slowest.length).toBeLessThanOrEqual(5);
    expect(slowest.some((s) => s.file === path.join(tempDir, 'my_cmp.ts'))).toBeTrue();
    expect(summary.rust!.queries['ParseFile'].slowest).toEqual(slowest);
  });
});
