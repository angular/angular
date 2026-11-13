/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'node:fs/promises';
import * as path from 'path';
import {createWasmHybridCompilerSession} from './utils.js';
import {HybridCompiler} from '../src/hybrid_compiler.js';
import type {ProcessedFile} from '../src/processor.js';
import {FileUpdateType} from '../src/types.js';

const FILES: Record<string, string> = {
  'tsconfig.json': JSON.stringify({
    compilerOptions: {},
    files: ['a.component.ts', 'b.component.ts', 'dir.ts'],
  }),
  'dir.ts': `
    import {Directive, Input} from '@angular/core';
    @Directive({selector: '[dir]'})
    export class Dir {
      @Input() first = '';
    }
  `,
  'a.component.ts': `
    import {Component} from '@angular/core';
    import {Dir} from './dir';
    @Component({selector: 'app-a', imports: [Dir], template: '<div dir [first]="v"></div>'})
    export class AComponent {
      v = 'a';
    }
  `,
  'b.component.ts': `
    import {Component} from '@angular/core';
    @Component({selector: 'app-b', templateUrl: './b.component.html'})
    export class BComponent {}
  `,
  'b.component.html': '<p>b</p>',
};

/** The processed output of every file of one build, keyed by the file's base name. */
type BuildOutputs = Map<string, ProcessedFile>;

interface SessionOptions {
  verifyReusedProcessedFiles?: boolean;
  incremental?: boolean;
  extraFiles?: Record<string, string>;
}

async function createSession(testName: string, options: SessionOptions = {}) {
  const {compiler, analyzer, root} = await createWasmHybridCompilerSession({
    suite: 'processed_file_reuse',
    testName,
    files: {...FILES, ...options.extraFiles},
    compilerOptions: {
      verifyReusedProcessedFiles: options.verifyReusedProcessedFiles,
      incremental: options.incremental ?? true,
    },
  });

  /** Runs a full build first, then a delta pass per call via `compiler.compile()`. */
  const build = async (): Promise<BuildOutputs> => {
    const outputs: BuildOutputs = new Map();
    for (const [filePath, processed] of await compiler.compile()) {
      outputs.set(path.basename(filePath), processed);
    }
    return outputs;
  };
  const edit = (name: string, content: string) =>
    compiler.updateFileContent([{filePath: path.join(root, name), content}]);
  return {compiler, analyzer, root, build, edit};
}

describe('HybridCompiler processed output reuse', () => {
  it('reprocesses only the files whose processing inputs changed', async () => {
    const {analyzer, build, edit} = await createSession('template_edit');
    const first = await build();

    await edit('b.component.html', '<p>b, edited</p>');
    const second = await build();

    expect(second.get('a.component.ts')).toBe(first.get('a.component.ts'));
    expect(second.get('dir.ts')).toBe(first.get('dir.ts'));
    expect(second.get('b.component.ts')).not.toBe(first.get('b.component.ts'));
    expect(second.get('b.component.ts')!.magicString.toString()).toContain('b, edited');
    analyzer.close();
  });

  it('streams only dirty chunks during analyzeOptimizedDelta', async () => {
    const {compiler, analyzer, build, edit} = await createSession('delta_stream_only_dirty');
    await build();

    await edit('b.component.html', '<p>b, edited</p>');
    const deltaChunks = [];
    for await (const chunk of compiler.analyzeOptimizedDelta()) {
      deltaChunks.push(chunk);
    }
    const streamedFiles = deltaChunks.flatMap((c) => c.files.map((f) => path.basename(f.filePath)));

    expect(streamedFiles).toEqual(['b.component.ts']);
    analyzer.close();
  });

  it("reprocesses a component when a dependency's public API changes", async () => {
    const {analyzer, build, edit} = await createSession('dependency_edit');
    const first = await build();

    await edit('dir.ts', FILES['dir.ts'].replace(`@Input() first = '';`, `@Input() second = '';`));
    const second = await build();

    expect(second.get('dir.ts')).not.toBe(first.get('dir.ts'));
    expect(second.get('a.component.ts')).not.toBe(first.get('a.component.ts'));
    expect(second.get('b.component.ts')).toBe(first.get('b.component.ts'));
    analyzer.close();
  });

  it('reprocesses everything when a file that is no known resource changes', async () => {
    const {compiler, analyzer, root, build} = await createSession('unknown_resource');
    const first = await build();
    compiler.recordSuccessfulEmit([
      path.join(root, 'a.component.ts'),
      path.join(root, 'b.component.ts'),
      path.join(root, 'dir.ts'),
    ]);

    await compiler.invalidateFiles([
      {filePath: path.join(root, 'theme.css'), updateType: FileUpdateType.Changed},
    ]);
    const second = await build();

    for (const [name, processed] of second) {
      expect(processed).withContext(name).not.toBe(first.get(name)!);
    }
    // Reprocessing produced the same output, so nothing has to be emitted again.
    const shouldEmit = compiler.createEmitFilter();
    expect(shouldEmit(path.join(root, 'a.component.ts'))).toBeFalse();
    expect(shouldEmit(path.join(root, 'b.component.ts'))).toBeFalse();
    expect(shouldEmit(path.join(root, 'dir.ts'))).toBeFalse();
    analyzer.close();
  });

  it('re-emits a component whose output changed through a dependency two imports away', async () => {
    const {compiler, analyzer, root, build, edit} = await createSession('transitive_dependency', {
      extraFiles: {
        'const.ts': `export const SEL = 'app-a';`,
        'barrel.ts': `export {SEL} from './const';`,
        'a.component.ts': `
          import {Component} from '@angular/core';
          import {SEL} from './barrel';
          @Component({selector: SEL, template: ''})
          export class AComponent {}
        `,
      },
    });
    const first = await build();
    expect(first.get('a.component.ts')!.magicString.toString()).toContain("'app-a'");
    compiler.recordSuccessfulEmit([
      path.join(root, 'a.component.ts'),
      path.join(root, 'b.component.ts'),
      path.join(root, 'dir.ts'),
      path.join(root, 'barrel.ts'),
      path.join(root, 'const.ts'),
    ]);

    // `a.component.ts` only imports `barrel.ts`, so `const.ts` is not among its static
    // dependencies, but its output depends on it all the same.
    await edit('const.ts', `export const SEL = 'app-a-v2';`);
    const second = await build();

    expect(second.get('a.component.ts')!.magicString.toString()).toContain("'app-a-v2'");
    const shouldEmit = compiler.createEmitFilter();
    expect(shouldEmit(path.join(root, 'a.component.ts'))).toBeTrue();
    expect(shouldEmit(path.join(root, 'b.component.ts'))).toBeFalse();
    analyzer.close();
  });

  it('re-binds the users of a component whose <ng-content> tags changed', async () => {
    const childTemplate = (slot: string) => `${slot}<ng-content></ng-content>`;
    const {compiler, analyzer, root, build, edit} = await createSession('ng_content_change', {
      extraFiles: {
        'tsconfig.json': JSON.stringify({
          compilerOptions: {},
          files: ['parent.component.ts', 'child.component.ts'],
        }),
        'child.component.ts': `
          import {Component} from '@angular/core';
          @Component({selector: 'app-child', templateUrl: './child.component.html'})
          export class ChildComponent {}
        `,
        // An `<ng-content>` that is commented out contributes no slot. A text match would find
        // it all the same and see no change once it is uncommented.
        'child.component.html': childTemplate('<!-- <ng-content select="span"></ng-content> -->'),
        'parent.component.ts': `
          import {Component} from '@angular/core';
          import {ChildComponent} from './child.component';
          @Component({
            selector: 'app-parent',
            imports: [ChildComponent],
            template: '<app-child>@if (show) {<span>a</span><b>b</b>}</app-child>',
          })
          export class ParentComponent {
            show = true;
          }
        `,
      },
    });
    const contentProjectionDiagnostics = () =>
      compiler.getDiagnostics().filter((diag) => diag.code === 8011);
    const first = await build();
    expect(contentProjectionDiagnostics()).toEqual([]);

    await edit('child.component.html', childTemplate('<ng-content select="span"></ng-content>'));
    const second = await build();

    expect(second.get('parent.component.ts')).not.toBe(first.get('parent.component.ts'));
    expect(contentProjectionDiagnostics().map((diag) => diag.messageText)).toEqual([
      jasmine.stringContaining('"span"'),
    ]);
    analyzer.close();
  });

  it('in verification mode, re-processes reusable files and accepts identical output', async () => {
    const {compiler, analyzer, root, build} = await createSession('verification', {
      verifyReusedProcessedFiles: true,
    });
    const first = await build();

    // Force a chunk containing a.component.ts to be re-processed without changing its inputs.
    const aPath = path.join(root, 'a.component.ts');
    const aMeta = (await compiler.getCachedMetadata(aPath))!;
    const secondA = await compiler.processFile(aPath, FILES['a.component.ts'], aMeta);

    // Nothing is reused, but nothing differs from what would have been.
    const firstA = first.get('a.component.ts')!;
    expect(secondA).not.toBe(firstA);
    expect(secondA.magicString.toString()).toBe(firstA.magicString.toString());
    analyzer.close();
  });

  it('reuses cached template parsing and target binding across delta passes for unchanged files', async () => {
    const {compiler, analyzer, root, build, edit} = await createSession('file_cache_reuse');
    await build();
    const aPath = path.join(root, 'a.component.ts');
    const bPath = path.join(root, 'b.component.ts');
    const firstAPrepared = compiler.fileCache.get(aPath)?.preparedTcbData;
    const firstBPrepared = compiler.fileCache.get(bPath)?.preparedTcbData;
    expect(firstAPrepared).toBeTruthy();
    expect(firstBPrepared).toBeTruthy();

    await edit('b.component.html', '<p>b, edited</p>');
    await build();

    expect(compiler.fileCache.get(aPath)?.preparedTcbData).toBe(firstAPrepared);
    expect(compiler.fileCache.get(bPath)?.preparedTcbData).not.toBe(firstBPrepared);
    analyzer.close();
  });

  it('reprocesses only the component whose template <link rel="stylesheet"> resource changed', async () => {
    const {compiler, analyzer, root, build, edit} = await createSession('linked_stylesheet');
    await fs.writeFile(path.join(root, 'linked.css'), '.linked { color: red; }');
    await edit('b.component.html', '<link rel="stylesheet" href="./linked.css"><p>b</p>');
    const first = await build();
    expect(first.get('b.component.ts')!.magicString.toString()).toContain('color: red');
    compiler.incremental.recordSuccessfulEmit([
      path.join(root, 'a.component.ts'),
      path.join(root, 'b.component.ts'),
      path.join(root, 'dir.ts'),
    ]);

    await fs.writeFile(path.join(root, 'linked.css'), '.linked { color: blue; }');
    await compiler.invalidateFiles([
      {filePath: path.join(root, 'linked.css'), updateType: FileUpdateType.Changed},
    ]);
    const second = await build();

    expect(second.get('a.component.ts')).toBe(first.get('a.component.ts'));
    expect(second.get('dir.ts')).toBe(first.get('dir.ts'));
    expect(second.get('b.component.ts')).not.toBe(first.get('b.component.ts'));
    expect(second.get('b.component.ts')!.magicString.toString()).toContain('color: blue');
    const shouldEmit = compiler.incremental.createEmitFilter();
    expect(shouldEmit(path.join(root, 'b.component.ts'))).toBeTrue();
    expect(shouldEmit(path.join(root, 'a.component.ts'))).toBeFalse();
    analyzer.close();
  });

  it('evicts files that leave the program closure on delta builds', async () => {
    const {compiler, analyzer, root, build, edit} = await createSession('removed_from_program');
    const first = await build();
    expect(first.has('b.component.ts')).toBeTrue();

    await edit(
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: {},
        files: ['a.component.ts', 'dir.ts'],
      }),
    );
    const second = await build();

    expect(second.has('b.component.ts')).toBeFalse();
    expect(compiler.currentProcessedFiles.has(path.join(root, 'b.component.ts'))).toBeFalse();
    // The tsconfig is no resource: the files that stay keep their output.
    expect(second.get('a.component.ts')).toBe(first.get('a.component.ts'));
    expect(second.get('dir.ts')).toBe(first.get('dir.ts'));
    analyzer.close();
  });

  it('re-processes and re-emits all files when incremental is false', async () => {
    const {compiler, analyzer, root, build, edit} = await createSession('incremental_disabled', {
      incremental: false,
    });
    const first = await build();
    compiler.recordSuccessfulEmit([
      path.join(root, 'a.component.ts'),
      path.join(root, 'b.component.ts'),
      path.join(root, 'dir.ts'),
    ]);

    await edit('b.component.html', '<p>b, edited</p>');
    const second = await build();

    expect(second.get('a.component.ts')).not.toBe(first.get('a.component.ts')!);
    expect(second.get('dir.ts')).not.toBe(first.get('dir.ts')!);
    expect(second.get('b.component.ts')).not.toBe(first.get('b.component.ts')!);
    const shouldEmit = compiler.createEmitFilter();
    expect(shouldEmit(path.join(root, 'a.component.ts'))).toBeTrue();
    expect(shouldEmit(path.join(root, 'b.component.ts'))).toBeTrue();
    expect(shouldEmit(path.join(root, 'dir.ts'))).toBeTrue();
    analyzer.close();
  });

  it('produces the same output without fingerprinting or reuse when incremental is false', async () => {
    /** Processes every file through `prepareChunk` + `processFile`, keyed by base name. */
    const processAll = async (compiler: HybridCompiler, root: string): Promise<BuildOutputs> => {
      const outputs: BuildOutputs = new Map();
      for await (const chunk of compiler.analyzeOptimized()) {
        const chunkContext = await compiler.prepareChunk(chunk);
        for (const file of chunk.files) {
          const content = await fs.readFile(file.filePath, 'utf-8');
          outputs.set(
            path.basename(file.filePath),
            await compiler.processFile(file.filePath, content, file, chunkContext),
          );
        }
      }
      return outputs;
    };
    const incremental = await createSession('parity_incremental', {incremental: true});
    const oneShot = await createSession('parity_one_shot', {incremental: false});
    const incrementalOutputs = await processAll(incremental.compiler, incremental.root);
    const oneShotOutputs = await processAll(oneShot.compiler, oneShot.root);

    expect([...oneShotOutputs.keys()].sort()).toEqual([...incrementalOutputs.keys()].sort());
    expect(oneShotOutputs.get('a.component.ts')!.tcb?.code).toBeTruthy();
    // The two sessions live in different directories; compare their output modulo that.
    const normalize = (text: string | undefined, root: string) => text?.split(root).join('<root>');
    for (const [name, expected] of incrementalOutputs) {
      const actual = oneShotOutputs.get(name)!;
      expect(normalize(actual.magicString.toString(), oneShot.root))
        .withContext(name)
        .toBe(normalize(expected.magicString.toString(), incremental.root));
      expect(normalize(actual.tcb?.code, oneShot.root))
        .withContext(name)
        .toBe(normalize(expected.tcb?.code, incremental.root));
    }

    // Both bind the templates for this build, but only the incremental compiler keys that
    // binding for reuse in later builds.
    const boundState = (session: {compiler: HybridCompiler; root: string}) =>
      session.compiler.fileCache.get(path.join(session.root, 'a.component.ts'));
    expect(boundState(incremental)?.preparedTcbData).toBeTruthy();
    expect(boundState(incremental)?.boundFingerprint).toBeDefined();
    expect(boundState(oneShot)?.preparedTcbData).toBeTruthy();
    expect(boundState(oneShot)?.boundFingerprint).toBeUndefined();

    // Processing a file again with unchanged inputs reuses the cached output only when incremental.
    const reprocess = async (session: {compiler: HybridCompiler; root: string}) => {
      const aPath = path.join(session.root, 'a.component.ts');
      const aMeta = (await session.compiler.getCachedMetadata(aPath))!;
      return session.compiler.processFile(aPath, FILES['a.component.ts'], aMeta);
    };
    expect(await reprocess(incremental)).toBe(incrementalOutputs.get('a.component.ts')!);
    const oneShotPrepared = boundState(oneShot)?.preparedTcbData;
    const reprocessedOneShot = await reprocess(oneShot);
    expect(reprocessedOneShot).not.toBe(oneShotOutputs.get('a.component.ts')!);
    expect(boundState(oneShot)?.preparedTcbData).toBeTruthy();
    expect(boundState(oneShot)?.preparedTcbData).not.toBe(oneShotPrepared);
    expect(reprocessedOneShot.magicString.toString()).toBe(
      oneShotOutputs.get('a.component.ts')!.magicString.toString(),
    );

    incremental.analyzer.close();
    oneShot.analyzer.close();
  });

  it('uses Rust AnalysisResult.fingerprint without JSON-serializing AnalysisResult and invalidates on .d.ts metadata changes', async () => {
    const makeDts = (inputName: string, comment = '') => `
      import * as i0 from '@angular/core';
      export declare class LibDir {
        static ɵdir: i0.ɵɵDirectiveDeclaration<LibDir, "[lib]", never, { "${inputName}": { "alias": "${inputName}"; "required": false; } }, {}, never, never, true, never>;
        static ɵfac: i0.ɵɵFactoryDeclaration<LibDir, never>;
      }
      ${comment}
    `;
    const {compiler, analyzer, build, edit, root} = await createSession('rust_fingerprint_dts', {
      extraFiles: {
        'tsconfig.json': JSON.stringify({
          compilerOptions: {},
          files: ['a.component.ts', 'b.component.ts', 'dir.ts', 'lib.d.ts'],
        }),
        'lib.d.ts': makeDts('first'),
        'a.component.ts': `
          import {Component} from '@angular/core';
          import {LibDir} from './lib';
          @Component({selector: 'app-a', imports: [LibDir], template: '<div lib [first]="v"></div>'})
          export class AComponent {
            v = 'a';
          }
        `,
      },
    });
    try {
      const aPath = path.join(root, 'a.component.ts');
      const serializeCached = spyOn<any>(compiler, 'serializeCached').and.callThrough();
      const first = await build();

      const metaV1 = (await compiler.getCachedMetadata(aPath))!;
      expect(metaV1.fingerprint).toMatch(/^[0-9a-f]{16}$/);
      expect(serializeCached.calls.allArgs().some((args) => args[0] === metaV1)).toBeFalse();

      // Comment-only edit in `.d.ts` preserves the Rust fingerprint and reuses processed output.
      await edit('lib.d.ts', makeDts('first', '// comment only'));
      const second = await build();
      const metaV2 = (await compiler.getCachedMetadata(aPath))!;
      expect(metaV2.fingerprint).toBe(metaV1.fingerprint);
      expect(second.get('a.component.ts')).toBe(first.get('a.component.ts')!);

      // Changing the directive input in `.d.ts` changes `resolvedDeclarations` and `fingerprint`.
      await edit('lib.d.ts', makeDts('second', '// comment only'));
      const third = await build();
      const metaV3 = (await compiler.getCachedMetadata(aPath))!;
      expect(metaV3.fingerprint).not.toBe(metaV1.fingerprint);
      expect(third.get('a.component.ts')).not.toBe(first.get('a.component.ts')!);
    } finally {
      analyzer.close();
    }
  });

  it('shares boundFingerprint from prepareChunk to processFile', async () => {
    const {compiler, analyzer, root} = await createSession('share_bound_fingerprint');
    try {
      const computeSpy = spyOn<any>(compiler, 'computeBoundFingerprint').and.callThrough();
      const runAsyncPass = async () => {
        const outputs: BuildOutputs = new Map();
        for await (const chunk of compiler.analyzeOptimized()) {
          const chunkContext = await compiler.prepareChunk(chunk);
          for (const file of chunk.files) {
            const content = await fs.readFile(file.filePath, 'utf-8');
            outputs.set(
              path.basename(file.filePath),
              await compiler.processFile(file.filePath, content, file, chunkContext),
            );
          }
        }
        return outputs;
      };

      const cold = await runAsyncPass();
      const callsFor = (fileName: string) =>
        computeSpy.calls.allArgs().filter((args) => path.basename(args[0] as string) === fileName)
          .length;
      // Component files compute `boundFingerprint` once in `prepareChunk` and reuse it in
      // `processFile`; non-TCB files (`dir.ts`) skip it in `prepareChunk` and compute once in `processFile`.
      expect(callsFor('a.component.ts')).toBe(1);
      expect(callsFor('b.component.ts')).toBe(1);
      expect(callsFor('dir.ts')).toBe(1);

      computeSpy.calls.reset();
      const warmAsync = await runAsyncPass();
      expect(callsFor('a.component.ts')).toBe(1);
      expect(callsFor('b.component.ts')).toBe(1);
      expect(callsFor('dir.ts')).toBe(1);
      expect(warmAsync.get('a.component.ts')).toBe(cold.get('a.component.ts')!);
      expect(warmAsync.get('b.component.ts')).toBe(cold.get('b.component.ts')!);

      // An out-of-band content edit still invalidates rather than trusting a stale chunk entry.
      const aPath = path.join(root, 'a.component.ts');
      const aMeta = (await compiler.getCachedMetadata(aPath))!;
      const editedContent = FILES['a.component.ts'].replace("v = 'a';", "v = 'edited';");
      const reprocessed = await compiler.processFile(aPath, editedContent, aMeta);
      expect(reprocessed).not.toBe(cold.get('a.component.ts')!);
      expect(reprocessed.magicString.toString()).toContain("v = 'edited'");
    } finally {
      analyzer.close();
    }
  });

  it('does not reuse stale cached output for out-of-band processFile after an <ng-content> dependency update', async () => {
    const childTemplate = (slot: string) => `${slot}<ng-content></ng-content>`;
    const parentSource = `
      import {Component} from '@angular/core';
      import {ChildComponent} from './child.component';
      @Component({
        selector: 'app-parent',
        imports: [ChildComponent],
        template: '<app-child>@if (show) {<span>a</span><b>b</b>}</app-child>',
      })
      export class ParentComponent {
        show = true;
      }
    `;
    const {compiler, analyzer, root, build, edit} = await createSession(
      'out_of_band_ng_content_invalidation',
      {
        extraFiles: {
          'tsconfig.json': JSON.stringify({
            compilerOptions: {},
            files: ['parent.component.ts', 'child.component.ts'],
          }),
          'child.component.ts': `
            import {Component} from '@angular/core';
            @Component({selector: 'app-child', templateUrl: './child.component.html'})
            export class ChildComponent {}
          `,
          'child.component.html': childTemplate(''),
          'parent.component.ts': parentSource,
        },
      },
    );
    try {
      const parentPath = path.join(root, 'parent.component.ts');
      const first = await build();
      const parentMetaV1 = (await compiler.getCachedMetadata(parentPath))!;
      expect(compiler.getDiagnostics().filter((diag) => diag.code === 8011)).toEqual([]);

      await edit('child.component.html', childTemplate('<ng-content select="span"></ng-content>'));

      const reprocessed = await compiler.processFile(parentPath, parentSource, parentMetaV1);
      expect(reprocessed).not.toBe(first.get('parent.component.ts')!);
      expect(
        compiler
          .getDiagnostics()
          .filter((diag) => diag.code === 8011)
          .map((diag) => diag.messageText),
      ).toEqual([jasmine.stringContaining('"span"')]);
    } finally {
      analyzer.close();
    }
  });
});
