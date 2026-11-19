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
import {HybridCompiler, type NgDiagnostic, run, SidecarAnalyzer} from '../api.js';
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

describe('DependencyTemplates and .d.ts ngContentSelectors', () => {
  it('should not re-analyze or parse templates for external .d.ts, .d.mts, or .d.cts components', async () => {
    await withProject(
      {
        'ext.d.ts': `
          import * as i0 from '@angular/core';
          export declare class NoSlotCmp {
            static ɵcmp: i0.ɵɵComponentDeclaration<NoSlotCmp, 'no-slot', never, {}, {}, never, never, true, never>;
          }
          export declare class EmptySlotCmp {
            static ɵcmp: i0.ɵɵComponentDeclaration<EmptySlotCmp, 'empty-slot', never, {}, {}, never, [], true, never>;
          }
          export declare class SlotCmp {
            static ɵcmp: i0.ɵɵComponentDeclaration<SlotCmp, 'with-slot', never, {}, {}, never, ['[header]'], true, never>;
          }
          export declare class LegacyCmp {
            static ɵcmp: i0.ɵɵComponentDeclaration<LegacyCmp, 'legacy-comp', never, {}, {}, never>;
          }
          export declare class LegacyModule {
            static ɵmod: i0.ɵɵNgModuleDeclaration<LegacyModule, [typeof LegacyCmp], never, [typeof LegacyCmp]>;
          }
        `,
        'esm.d.mts': `
          import * as i0 from '@angular/core';
          export declare class MtsNoSlotCmp {
            static ɵcmp: i0.ɵɵComponentDeclaration<MtsNoSlotCmp, 'mts-no-slot', never, {}, {}, never, never, true, never>;
          }
          export declare class MtsLegacyCmp {
            static ɵcmp: i0.ɵɵComponentDeclaration<MtsLegacyCmp, 'mts-legacy', never, {}, {}, never>;
          }
          export declare class MtsLegacyModule {
            static ɵmod: i0.ɵɵNgModuleDeclaration<MtsLegacyModule, [typeof MtsLegacyCmp], never, [typeof MtsLegacyCmp]>;
          }
        `,
        'cjs.d.cts': `
          import * as i0 from '@angular/core';
          export declare class CtsNoSlotCmp {
            static ɵcmp: i0.ɵɵComponentDeclaration<CtsNoSlotCmp, 'cts-no-slot', never, {}, {}, never, never, true, never>;
          }
          export declare class CtsLegacyCmp {
            static ɵcmp: i0.ɵɵComponentDeclaration<CtsLegacyCmp, 'cts-legacy', never, {}, {}, never>;
          }
          export declare class CtsLegacyModule {
            static ɵmod: i0.ɵɵNgModuleDeclaration<CtsLegacyModule, [typeof CtsLegacyCmp], never, [typeof CtsLegacyCmp]>;
          }
        `,
        'app.ts': `
          import {Component} from '@angular/core';
          import {EmptySlotCmp, LegacyModule, NoSlotCmp, SlotCmp} from './ext';
          import {MtsLegacyModule, MtsNoSlotCmp} from './esm.mjs';
          import {CtsLegacyModule, CtsNoSlotCmp} from './cjs.cjs';

          @Component({
            selector: 'app-root',
            imports: [
              NoSlotCmp,
              EmptySlotCmp,
              SlotCmp,
              LegacyModule,
              MtsNoSlotCmp,
              MtsLegacyModule,
              CtsNoSlotCmp,
              CtsLegacyModule,
            ],
            template: \`
              <no-slot>@if (show) {<span>a</span><span>b</span>}</no-slot>
              <empty-slot>@if (show) {<span>a</span><span>b</span>}</empty-slot>
              <with-slot>@if (show) {<div header>a</div><span>b</span>}</with-slot>
              <legacy-comp>@if (show) {<span>a</span><span>b</span>}</legacy-comp>
              <mts-no-slot>@if (show) {<span>a</span><span>b</span>}</mts-no-slot>
              <mts-legacy>@if (show) {<span>a</span><span>b</span>}</mts-legacy>
              <cts-no-slot>@if (show) {<span>a</span><span>b</span>}</cts-no-slot>
              <cts-legacy>@if (show) {<span>a</span><span>b</span>}</cts-legacy>
            \`,
          })
          export class AppComponent {
            show = true;
          }
        `,
      },
      async ({root, tracer, compiler}) => {
        const outDir = path.join(root, 'out');
        await run(compiler, {outDir, rootDir: root, tracer});

        expect((await fs.readdir(outDir)).sort()).toEqual([
          'app.ngtypecheck.ts',
          'app.ts',
          'app.ts.map',
        ]);
        expect(projectionMessages(compiler.getDiagnostics())).toEqual([
          jasmine.stringContaining('[header]'),
        ]);

        const {summary} = tracer.take();
        // Only `AppComponent` parses its template (codegen + diagNodes).
        expect(summary.node.counters['TemplatesParsed']).toBe(2);
        // Only `app.ts` runs wire/semantic file analysis; declaration files are never re-queried.
        expect(summary.rust!.queries['AnalyzeFileWire'].count).toBe(1);
        expect(cachedBaseNames(compiler)).toEqual(['app.ts']);
      },
    );
  });

  it('should reuse processed output when importing legacy 6-argument .d.ts components', async () => {
    const appContent = `
      import {Component} from '@angular/core';
      import {LegacyModule} from './legacy';

      @Component({
        selector: 'app-root',
        imports: [LegacyModule],
        template: '<legacy-comp />',
      })
      export class AppComponent {}
    `;
    await withProject(
      {
        'legacy.d.ts': `
          import * as i0 from '@angular/core';
          export declare class LegacyCmp {
            static ɵcmp: i0.ɵɵComponentDeclaration<LegacyCmp, 'legacy-comp', never, {}, {}, never>;
          }
          export declare class LegacyModule {
            static ɵmod: i0.ɵɵNgModuleDeclaration<LegacyModule, [typeof LegacyCmp], never, [typeof LegacyCmp]>;
          }
        `,
        'app.ts': appContent,
      },
      async ({root, compiler}) => {
        const appPath = path.join(root, 'app.ts');
        const first = await compiler.processFile(appPath, appContent);
        const second = await compiler.processFile(appPath, appContent);
        expect(second).toBe(first);
      },
    );
  });

  it('should skip reading .ts dependency sources for external and indirect templates and cache sourceContent for inline templates', async () => {
    const depsContent = `
      import {Component} from '@angular/core';

      const INDIRECT_TPL = '<ng-content select="[ind-slot]"></ng-content>';

      @Component({selector: 'ext-slot-cmp', templateUrl: './external_slot.html'})
      export class ExternalSlotCmp {}

      @Component({selector: 'ind-slot-cmp', template: INDIRECT_TPL})
      export class IndirectSlotCmp {}

      @Component({selector: 'inline-slot-a', template: '<ng-content select="[inline-a]"></ng-content>'})
      export class InlineSlotACmp {}

      @Component({selector: 'inline-slot-b', template: '<ng-content select="[inline-b]"></ng-content>'})
      export class InlineSlotBCmp {}
    `;
    const consumerNonInlineContent = `
      import {Component} from '@angular/core';
      import {ExternalSlotCmp, IndirectSlotCmp} from './deps';

      @Component({
        selector: 'consumer-non-inline',
        imports: [ExternalSlotCmp, IndirectSlotCmp],
        template: \`
          <ext-slot-cmp>@if (show) {<div ext-slot>1</div><span>2</span>}</ext-slot-cmp>
          <ind-slot-cmp>@if (show) {<div ind-slot>1</div><span>2</span>}</ind-slot-cmp>
        \`,
      })
      export class ConsumerNonInline {
        show = true;
      }
    `;
    const consumerInlineAContent = `
      import {Component} from '@angular/core';
      import {InlineSlotACmp} from './deps';

      @Component({
        selector: 'consumer-inline-a',
        imports: [InlineSlotACmp],
        template: '<inline-slot-a>@if (show) {<div inline-a>1</div><div inline-a>2</div>}</inline-slot-a>',
      })
      export class ConsumerInlineA {
        show = true;
      }
    `;
    const consumerInlineBContent = `
      import {Component} from '@angular/core';
      import {InlineSlotBCmp} from './deps';

      @Component({
        selector: 'consumer-inline-b',
        imports: [InlineSlotBCmp],
        template: '<inline-slot-b>@if (show) {<div inline-b>1</div><div inline-b>2</div>}</inline-slot-b>',
      })
      export class ConsumerInlineB {
        show = true;
      }
    `;
    await withProject(
      {
        'external_slot.html': '<ng-content select="[ext-slot]"></ng-content>',
        'deps.ts': depsContent,
        'consumer_non_inline.ts': consumerNonInlineContent,
        'consumer_inline_a.ts': consumerInlineAContent,
        'consumer_inline_b.ts': consumerInlineBContent,
      },
      async ({sidecar, tracer, compiler}) => {
        const canonicalPaths = new Map<string, string>();
        for await (const chunk of compiler.analyzeOptimized()) {
          for (const file of chunk.files) {
            canonicalPaths.set(path.basename(file.filePath), file.filePath);
          }
        }
        const depsPath = canonicalPaths.get('deps.ts')!;
        const consumerNonInlinePath = canonicalPaths.get('consumer_non_inline.ts')!;
        const consumerInlineAPath = canonicalPaths.get('consumer_inline_a.ts')!;
        const consumerInlineBPath = canonicalPaths.get('consumer_inline_b.ts')!;
        await sidecar.takePerf();
        tracer.take();

        // Prefetching only `templateUrl` and indirect-`template` components must not read `deps.ts`.
        const nonInlineProcessed = await compiler.processFile(
          consumerNonInlinePath,
          consumerNonInlineContent,
        );
        const perfAfterNonInline = await sidecar.takePerf();
        expect(perfAfterNonInline.summary.counters['FsReads'] ?? 0).toBe(0);
        expect(compiler.fileCache.get(depsPath)?.sourceContent).toBeUndefined();
        expect(projectionMessages(nonInlineProcessed.diagnostics)).toEqual([
          jasmine.stringContaining('[ext-slot]'),
          jasmine.stringContaining('[ind-slot]'),
        ]);

        // Prefetching an inline-`template` component reads `consumer_inline_a.ts` + `deps.ts` (2 reads)
        // and caches `deps.ts`'s `sourceContent`.
        await compiler.getTcbForFile(consumerInlineAPath);
        const perfAfterInlineA = await sidecar.takePerf();
        expect(perfAfterInlineA.summary.counters['FsReads']).toBe(2);
        expect(compiler.fileCache.get(depsPath)?.sourceContent).toBe(depsContent);

        // A second inline-`template` component in `deps.ts` reads only `consumer_inline_b.ts` (1 read),
        // reusing `deps.ts`'s cached `sourceContent` without re-reading `deps.ts` from disk.
        await compiler.getTcbForFile(consumerInlineBPath);
        const perfAfterInlineB = await sidecar.takePerf();
        expect(perfAfterInlineB.summary.counters['FsReads']).toBe(1);

        // Processing `deps.ts` itself preserves all 4 prefetched templates and only parses `diagNodes`.
        tracer.take();
        await compiler.processFile(depsPath, depsContent);
        expect(tracer.take().summary.node.counters['TemplatesParsed']).toBe(4);
      },
    );
  });

  it('should skip dependency prefetches in processFile when preparedTcbData is bound or during HMR, while prefetching for standalone processFile', async () => {
    const childContent = `
      import {Component} from '@angular/core';

      @Component({selector: 'child-slot', template: '<ng-content select="[slot]"></ng-content>'})
      export class ChildSlotCmp {}
    `;
    const parentWithConflict = `
      import {Component} from '@angular/core';
      import {ChildSlotCmp} from './child';

      @Component({
        selector: 'parent-cmp',
        imports: [ChildSlotCmp],
        template: '<child-slot>@if (show) {<div slot>a</div><span>b</span>}</child-slot>',
      })
      export class ParentCmp {
        show = true;
      }
    `;
    const parentWithoutConflict = parentWithConflict.replace('<span>b</span>', '');
    await withProject(
      {
        'child.ts': childContent,
        'parent.ts': parentWithConflict,
      },
      async ({root, sidecar, tracer, compiler: hmrCompiler, createCompiler}) => {
        const parentPath = path.join(root, 'parent.ts');

        // HMR update compilation returns before TCB generation, so it must not prefetch `child.ts`.
        tracer.take();
        const hmrModule = await hmrCompiler.emitHmrUpdateModule(parentPath, 'ParentCmp');
        expect(hmrModule).toContain('ParentCmp');
        expect(cachedBaseNames(hmrCompiler)).toEqual(['parent.ts']);
        expect(tracer.take().summary.node.counters['TemplatesParsed']).toBe(1);

        // Standalone `processFile` (without `prepareChunk`) prefetches `child.ts` and updates on content edits.
        const standaloneCompiler = createCompiler();
        const firstStandalone = await standaloneCompiler.processFile(
          parentPath,
          parentWithConflict,
        );
        expect(projectionMessages(firstStandalone.diagnostics)).toEqual([
          jasmine.stringContaining('[slot]'),
        ]);

        const editedStandalone = await standaloneCompiler.processFile(
          parentPath,
          parentWithoutConflict,
        );
        expect(projectionMessages(editedStandalone.diagnostics)).toEqual([]);

        // When `prepareChunk` has already bound `preparedTcbData` for `parent.ts`, `processFile`
        // reuses that binding and does not re-prefetch `child.ts`.
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
        // `parent.ts`'s `preparedTcbData` without re-prefetching or re-reading `child.ts`.
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
        expect(projectionMessages(processedFromChunk.diagnostics)).toEqual([
          jasmine.stringContaining('[slot]'),
        ]);
      },
      {enableHmr: true},
    );
  });
});
