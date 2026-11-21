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
import {HybridCompiler, type NgDiagnostic, SidecarAnalyzer} from '../api.js';
import {createTracer, type Tracer} from '../src/perf.js';
import {buildTypeCheckingConfig} from '../src/tcb.js';
import {resolveFixtureNodeModules, resolveSidecarBinary} from './utils.js';

const STRICT_TCB_CONFIG = buildTypeCheckingConfig({strictTemplates: true});

interface ProjectHarness {
  root: string;
  sidecar: SidecarAnalyzer;
  tracer: Tracer;
  compiler: HybridCompiler;
  createCompiler: (options?: {enableHmr?: boolean}) => HybridCompiler;
}

async function withProject(
  files: Record<string, string>,
  runTest: (harness: ProjectHarness) => Promise<void>,
  options: {enableHmr?: boolean} = {},
): Promise<void> {
  const base = process.env['TEST_TMPDIR'] || os.tmpdir();
  const root = await fs.realpath(await fs.mkdtemp(path.join(base, 'ngp-dep-tpl-')));
  const tsconfig = {
    compilerOptions: {strict: true},
    files: Object.keys(files).filter((f) => /\.(?:ts|d\.[cm]?ts)$/.test(f)),
  };
  const allFiles: Record<string, string> = {'tsconfig.json': JSON.stringify(tsconfig), ...files};
  await Promise.all(
    Object.entries(allFiles).map(async ([relPath, content]) => {
      const fullPath = path.join(root, relPath);
      await fs.mkdir(path.dirname(fullPath), {recursive: true});
      await fs.writeFile(fullPath, content, 'utf-8');
    }),
  );

  const tracer = createTracer();
  const sidecar = new SidecarAnalyzer(resolveSidecarBinary(), tracer);
  try {
    await sidecar.initialize(
      path.join(root, 'tsconfig.json'),
      /* optimize */ true,
      undefined,
      resolveFixtureNodeModules(),
      {perfTrace: true, enableHmr: options.enableHmr},
    );
    const createCompiler = (compilerOptions: {enableHmr?: boolean} = {}) =>
      new HybridCompiler(sidecar, {
        optimize: true,
        enableHmr: compilerOptions.enableHmr,
        tcbConfig: STRICT_TCB_CONFIG,
        tracer,
      });
    await runTest({
      root,
      sidecar,
      tracer,
      compiler: createCompiler({enableHmr: options.enableHmr}),
      createCompiler,
    });
  } finally {
    sidecar.close();
    await fs.rm(root, {recursive: true, force: true});
  }
}

function projectionMessages(diagnostics: readonly NgDiagnostic[] | undefined): string[] {
  return (diagnostics ?? []).filter((d) => d.code === 8011).map((d) => d.messageText);
}

function cachedBaseNames(compiler: HybridCompiler): string[] {
  return [...compiler.fileCache.keys()].map((p) => path.basename(p));
}

describe('cross-file ngContentSelectors and dependency templates', () => {
  it('should resolve cross-file dependency templates only when building TCB targets', async () => {
    const childContent = `
      import {Component} from '@angular/core';

      @Component({selector: 'child-slot', template: '<ng-content select="[slot]"></ng-content>'})
      export class ChildSlotCmp {}
    `;
    const parentWithConflict = `
      import {Component} from '@angular/core';
      import {ChildSlotCmp} from './child';

      @Component({
        selector: 'parent-a',
        imports: [ChildSlotCmp],
        template: '<child-slot>@if (show) {<div slot>a</div><span>b</span>}</child-slot>',
      })
      export class ParentACmp {
        show = true;
      }

      @Component({
        selector: 'parent-b',
        imports: [ChildSlotCmp],
        template: '<child-slot>@if (show) {<div slot>c</div><span>d</span>}</child-slot>',
      })
      export class ParentBCmp {
        show = true;
      }
    `;
    const parentWithoutConflict = parentWithConflict
      .replace('<span>b</span>', '')
      .replace('<span>d</span>', '');
    await withProject(
      {
        'child.ts': childContent,
        'parent.ts': parentWithConflict,
      },
      async ({root, sidecar, tracer, compiler: hmrCompiler, createCompiler}) => {
        const parentPath = path.join(root, 'parent.ts');

        // HMR update compilation returns before TCB generation, so it must not read `child.ts`.
        tracer.take();
        const hmrModule = await hmrCompiler.emitHmrUpdateModule(parentPath, 'ParentACmp');
        expect(hmrModule).toContain('ParentACmp');
        expect(cachedBaseNames(hmrCompiler)).toEqual(['parent.ts']);
        // Both templates in `parent.ts` are parsed at the top of `processFile`, but `child.ts` is not.
        expect(tracer.take().summary.node.counters['TemplatesParsed']).toBe(2);

        // Standalone `processFile` (without `prepareChunk`) resolves `child.ts` once across both
        // components in `parent.ts` and updates diagnostics when `content` changes.
        const standaloneCompiler = createCompiler();
        tracer.take();
        const firstStandalone = await standaloneCompiler.processFile(
          parentPath,
          parentWithConflict,
        );
        // `ParentACmp` (codegen + diagNodes) + `ParentBCmp` (codegen + diagNodes) + `ChildSlotCmp` (1 parse).
        expect(tracer.take().summary.node.counters['TemplatesParsed']).toBe(5);
        expect(projectionMessages(firstStandalone.diagnostics).length).toBe(2);

        const editedStandalone = await standaloneCompiler.processFile(
          parentPath,
          parentWithoutConflict,
        );
        expect(projectionMessages(editedStandalone.diagnostics)).toEqual([]);

        // When `prepareChunk` has already bound `preparedTcbData` for `parent.ts`, `processFile`
        // reuses that binding in `generateTcb` without re-reading `child.ts`.
        const chunkCompiler = createCompiler();
        const chunks = [];
        for await (const chunk of chunkCompiler.analyzeOptimized()) {
          chunks.push(chunk);
        }
        const parentChunk = chunks.find((c) =>
          c.files.some((f) => path.basename(f.filePath) === 'parent.ts'),
        )!;
        const parentMeta = parentChunk.files.find(
          (f) => path.basename(f.filePath) === 'parent.ts',
        )!;
        const childMeta = chunks
          .flatMap((c) => c.files)
          .find((f) => path.basename(f.filePath) === 'child.ts')!;
        const chunkContext = await chunkCompiler.prepareChunk(parentChunk);

        // Evict `child.ts` from `fileCache` and drain perf counters: `processFile` must reuse
        // `parent.ts`'s `preparedTcbData` without calling `buildTcbTargets` or reading `child.ts`.
        chunkCompiler.fileCache.delete(childMeta.filePath);
        await sidecar.takePerf();

        const processedFromChunk = await chunkCompiler.processFile(
          parentMeta.filePath,
          parentWithConflict,
          parentMeta,
          chunkContext,
        );
        const perfAfterProcess = await sidecar.takePerf();
        expect(perfAfterProcess.summary.counters['FsReads'] ?? 0).toBe(0);
        expect(projectionMessages(processedFromChunk.diagnostics).length).toBe(2);
      },
      {enableHmr: true},
    );
  });
});
