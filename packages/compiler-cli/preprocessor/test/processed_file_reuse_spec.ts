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

async function createSession(testName: string, verifyReusedProcessedFiles = false) {
  const tmpBase = process.env['TEST_TMPDIR'] || path.resolve(process.cwd(), '.tmp');
  const root = path.resolve(tmpBase, 'processed_file_reuse', testName);
  await fs.rm(root, {recursive: true, force: true});
  await fs.mkdir(root, {recursive: true});
  for (const [name, content] of Object.entries(FILES)) {
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
  });

  let built = false;
  /** Runs a full build first, then a delta pass per call, processing every streamed file. */
  const build = (): BuildOutputs => {
    const chunks = built ? compiler.analyzeOptimizedDeltaSync() : compiler.analyzeOptimizedSync();
    built = true;
    const outputs: BuildOutputs = new Map();
    for (const chunk of chunks) {
      const context = compiler.prepareChunkSync(chunk);
      for (const file of chunk.files) {
        const content = analyzer.getFileContentSync(file.filePath);
        outputs.set(
          path.basename(file.filePath),
          compiler.processFileSync(file.filePath, content, undefined, file, context),
        );
      }
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

    compiler.invalidateFilesSync([
      {filePath: path.join(root, 'theme.css'), updateType: FileUpdateType.Changed},
    ]);
    const second = build();

    for (const [name, processed] of second) {
      expect(processed).withContext(name).not.toBe(first.get(name)!);
    }
    analyzer.close();
  });

  it('in verification mode, re-processes reusable files and accepts identical output', async () => {
    const {analyzer, build, edit} = await createSession('verification', true);
    const first = build();

    edit('b.component.html', '<p>b, edited</p>');
    const second = build();

    // Nothing is reused, but nothing differs from what would have been.
    expect(second.get('a.component.ts')).not.toBe(first.get('a.component.ts'));
    expect(second.get('a.component.ts')!.magicString.toString()).toBe(
      first.get('a.component.ts')!.magicString.toString(),
    );
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
});
