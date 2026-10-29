/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'node:fs/promises';
import * as path from 'path';
import {resolveFixtureNodeModules, resolveWasmBinding} from './utils.js';
import {createAnalyzer} from '../api.js';
import {HybridCompiler} from '../src/hybrid_compiler.js';
import type {ProcessedFile} from '../src/processor.js';
import {buildTypeCheckingConfig} from '../src/tcb.js';
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

async function createSession(
  testName: string,
  verifyReusedProcessedFiles = false,
  incremental = true,
  extraFiles: Record<string, string> = {},
) {
  const tmpBase = process.env['TEST_TMPDIR'] || path.resolve(process.cwd(), '.tmp');
  const root = path.resolve(tmpBase, 'processed_file_reuse', testName);
  await fs.rm(root, {recursive: true, force: true});
  await fs.mkdir(root, {recursive: true});
  for (const [name, content] of Object.entries({...FILES, ...extraFiles})) {
    await fs.writeFile(path.join(root, name), content);
  }
  const analyzer = await createAnalyzer(path.join(root, 'tsconfig.json'), {
    backend: 'wasm',
    wasmBinding: resolveWasmBinding(),
    optimize: true,
    nodeModulesPathOverride: resolveFixtureNodeModules(),
  });
  const compiler = new HybridCompiler(analyzer, {
    optimize: true,
    tcbConfig: buildTypeCheckingConfig({strictTemplates: true}),
    verifyReusedProcessedFiles,
    incremental,
  });

  /** Runs a full build first, then a delta pass per call via `compiler.compileSync()`. */
  const build = (): BuildOutputs => {
    const outputs: BuildOutputs = new Map();
    for (const [filePath, processed] of compiler.compileSync()) {
      outputs.set(path.basename(filePath), processed);
    }
    return outputs;
  };
  const edit = (name: string, content: string) =>
    compiler.updateFileContentSync([{filePath: path.join(root, name), content}]);
  return {compiler, analyzer, root, build, edit};
}

describe('HybridCompiler processed output reuse', () => {
  it('reprocesses only the files whose processing inputs changed', async () => {
    const {analyzer, build, edit} = await createSession('template_edit');
    const first = build();

    edit('b.component.html', '<p>b, edited</p>');
    const second = build();

    expect(second.get('a.component.ts')).toBe(first.get('a.component.ts'));
    expect(second.get('dir.ts')).toBe(first.get('dir.ts'));
    expect(second.get('b.component.ts')).not.toBe(first.get('b.component.ts'));
    expect(second.get('b.component.ts')!.magicString.toString()).toContain('b, edited');
    analyzer.close();
  });

  it('streams only dirty chunks during analyzeOptimizedDeltaSync', async () => {
    const {compiler, analyzer, build, edit} = await createSession('delta_stream_only_dirty');
    build();

    edit('b.component.html', '<p>b, edited</p>');
    const deltaChunks = Array.from(compiler.analyzeOptimizedDeltaSync());
    const streamedFiles = deltaChunks.flatMap((c) => c.files.map((f) => path.basename(f.filePath)));

    expect(streamedFiles).toEqual(['b.component.ts']);
    analyzer.close();
  });

  it("reprocesses a component when a dependency's public API changes", async () => {
    const {analyzer, build, edit} = await createSession('dependency_edit');
    const first = build();

    edit('dir.ts', FILES['dir.ts'].replace(`@Input() first = '';`, `@Input() second = '';`));
    const second = build();

    expect(second.get('dir.ts')).not.toBe(first.get('dir.ts'));
    expect(second.get('a.component.ts')).not.toBe(first.get('a.component.ts'));
    expect(second.get('b.component.ts')).toBe(first.get('b.component.ts'));
    analyzer.close();
  });

  it('reprocesses everything when a file that is no known resource changes', async () => {
    const {compiler, analyzer, root, build} = await createSession('unknown_resource');
    const first = build();
    compiler.recordSuccessfulEmit([
      path.join(root, 'a.component.ts'),
      path.join(root, 'b.component.ts'),
      path.join(root, 'dir.ts'),
    ]);

    compiler.invalidateFilesSync([
      {filePath: path.join(root, 'theme.css'), updateType: FileUpdateType.Changed},
    ]);
    const second = build();

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
    const {compiler, analyzer, root, build, edit} = await createSession(
      'transitive_dependency',
      false,
      true,
      {
        'const.ts': `export const SEL = 'app-a';`,
        'barrel.ts': `export {SEL} from './const';`,
        'a.component.ts': `
          import {Component} from '@angular/core';
          import {SEL} from './barrel';
          @Component({selector: SEL, template: ''})
          export class AComponent {}
        `,
      },
    );
    const first = build();
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
    edit('const.ts', `export const SEL = 'app-a-v2';`);
    const second = build();

    expect(second.get('a.component.ts')!.magicString.toString()).toContain("'app-a-v2'");
    const shouldEmit = compiler.createEmitFilter();
    expect(shouldEmit(path.join(root, 'a.component.ts'))).toBeTrue();
    expect(shouldEmit(path.join(root, 'b.component.ts'))).toBeFalse();
    analyzer.close();
  });

  it('re-binds the users of a component whose <ng-content> tags changed', async () => {
    const childTemplate = (slot: string) => `${slot}<ng-content></ng-content>`;
    const {compiler, analyzer, root, build, edit} = await createSession(
      'ng_content_change',
      false,
      true,
      {
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
    );
    const contentProjectionDiagnostics = () =>
      compiler.getDiagnostics().filter((diag) => diag.code === 8011);
    const first = build();
    expect(contentProjectionDiagnostics()).toEqual([]);

    edit('child.component.html', childTemplate('<ng-content select="span"></ng-content>'));
    const second = build();

    expect(second.get('parent.component.ts')).not.toBe(first.get('parent.component.ts'));
    expect(contentProjectionDiagnostics().map((diag) => diag.messageText)).toEqual([
      jasmine.stringContaining('"span"'),
    ]);
    analyzer.close();
  });

  it('in verification mode, re-processes reusable files and accepts identical output', async () => {
    const {compiler, analyzer, root, build} = await createSession('verification', true);
    const first = build();

    // Force a chunk containing a.component.ts to be re-processed without changing its inputs.
    const aPath = path.join(root, 'a.component.ts');
    const aMeta = compiler.getCachedMetadata(aPath)!;
    const secondA = compiler.processFileSync(aPath, FILES['a.component.ts'], undefined, aMeta);

    // Nothing is reused, but nothing differs from what would have been.
    const firstA = first.get('a.component.ts')!;
    expect(secondA).not.toBe(firstA);
    expect(secondA.magicString.toString()).toBe(firstA.magicString.toString());
    analyzer.close();
  });

  it('reuses cached template parsing and target binding across delta passes for unchanged files', async () => {
    const {compiler, analyzer, root, build, edit} = await createSession('file_cache_reuse');
    build();
    const aPath = path.join(root, 'a.component.ts');
    const bPath = path.join(root, 'b.component.ts');
    const firstAPrepared = compiler.fileCache.get(aPath)?.preparedTcbData;
    const firstBPrepared = compiler.fileCache.get(bPath)?.preparedTcbData;
    expect(firstAPrepared).toBeTruthy();
    expect(firstBPrepared).toBeTruthy();

    edit('b.component.html', '<p>b, edited</p>');
    build();

    expect(compiler.fileCache.get(aPath)?.preparedTcbData).toBe(firstAPrepared);
    expect(compiler.fileCache.get(bPath)?.preparedTcbData).not.toBe(firstBPrepared);
    analyzer.close();
  });

  it('reprocesses only the component whose template <link rel="stylesheet"> resource changed', async () => {
    const {compiler, analyzer, root, build, edit} = await createSession('linked_stylesheet');
    await fs.writeFile(path.join(root, 'linked.css'), '.linked { color: red; }');
    edit('b.component.html', '<link rel="stylesheet" href="./linked.css"><p>b</p>');
    const first = build();
    expect(first.get('b.component.ts')!.magicString.toString()).toContain('color: red');
    compiler.incremental.recordSuccessfulEmit([
      path.join(root, 'a.component.ts'),
      path.join(root, 'b.component.ts'),
      path.join(root, 'dir.ts'),
    ]);

    await fs.writeFile(path.join(root, 'linked.css'), '.linked { color: blue; }');
    compiler.invalidateFilesSync([
      {filePath: path.join(root, 'linked.css'), updateType: FileUpdateType.Changed},
    ]);
    const second = build();

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
    const first = build();
    expect(first.has('b.component.ts')).toBeTrue();

    edit(
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: {},
        files: ['a.component.ts', 'dir.ts'],
      }),
    );
    const second = build();

    expect(second.has('b.component.ts')).toBeFalse();
    expect(compiler.currentProcessedFiles.has(path.join(root, 'b.component.ts'))).toBeFalse();
    // The tsconfig is no resource: the files that stay keep their output.
    expect(second.get('a.component.ts')).toBe(first.get('a.component.ts'));
    expect(second.get('dir.ts')).toBe(first.get('dir.ts'));
    analyzer.close();
  });

  it('re-processes and re-emits all files when incremental is false', async () => {
    const {compiler, analyzer, root, build, edit} = await createSession(
      'incremental_disabled',
      false,
      false,
    );
    const first = build();
    compiler.recordSuccessfulEmit([
      path.join(root, 'a.component.ts'),
      path.join(root, 'b.component.ts'),
      path.join(root, 'dir.ts'),
    ]);

    edit('b.component.html', '<p>b, edited</p>');
    const second = build();

    expect(second.get('a.component.ts')).not.toBe(first.get('a.component.ts')!);
    expect(second.get('dir.ts')).not.toBe(first.get('dir.ts')!);
    expect(second.get('b.component.ts')).not.toBe(first.get('b.component.ts')!);
    const shouldEmit = compiler.createEmitFilter();
    expect(shouldEmit(path.join(root, 'a.component.ts'))).toBeTrue();
    expect(shouldEmit(path.join(root, 'b.component.ts'))).toBeTrue();
    expect(shouldEmit(path.join(root, 'dir.ts'))).toBeTrue();
    analyzer.close();
  });
});
