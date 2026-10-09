/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'node:fs/promises';
import * as path from 'path';
import {
  getOrCreateSyntheticNodeModules,
  pathExists,
  resolveWasmBinding,
  TestFile,
} from './utils.js';
import {createAnalyzer} from '../api.js';
import {HybridCompiler} from '../src/hybrid_compiler.js';
import {buildTypeCheckingConfig} from '../src/tcb.js';

async function findNodeModules(): Promise<string> {
  let dir = process.cwd();
  while (!(await pathExists(path.join(dir, 'node_modules', '@angular')))) {
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const candidate = path.join(dir, 'node_modules');
  if (await pathExists(path.join(candidate, '@angular'))) {
    return candidate;
  }
  return getOrCreateSyntheticNodeModules() || candidate;
}

async function createCompiler(
  testName: string,
  files: TestFile[],
): Promise<{compiler: HybridCompiler; root: string}> {
  // `Cache` keeps an uppercase component in every path, which the analyzer case-folds on
  // case-insensitive platforms.
  const tmpBase = process.env['TEST_TMPDIR'] || path.resolve(process.cwd(), '.tmp');
  const root = path.resolve(tmpBase, 'Cache_Invalidation', testName);
  await fs.rm(root, {recursive: true, force: true});
  const virtualFiles: Record<string, string> = {};
  for (const f of files) {
    const full = path.join(root, f.path);
    await fs.mkdir(path.dirname(full), {recursive: true});
    await fs.writeFile(full, f.content);
    virtualFiles[full] = f.content;
  }

  const tsconfigPath = path.join(root, 'tsconfig.json');
  const analyzer = await createAnalyzer(tsconfigPath, {
    backend: 'wasm',
    wasmBinding: resolveWasmBinding(),
    virtualFiles,
    optimize: true,
    nodeModulesPathOverride: await findNodeModules(),
  });
  const compiler = new HybridCompiler(analyzer, {
    optimize: true,
    tcbConfig: buildTypeCheckingConfig({strictTemplates: true}),
  });
  await compiler.init();
  return {compiler, root};
}

const TSCONFIG: TestFile = {
  path: 'tsconfig.json',
  content: JSON.stringify({compilerOptions: {}, files: ['main.ts']}),
};
const MAIN: TestFile = {path: 'main.ts', content: 'export const main = 1;\n'};

function componentSource(template: string): string {
  return `
    import {Component} from '@angular/core';
    @Component({selector: 'app-loose', template: '${template}'})
    export class LooseComponent {
      value = 'x';
    }
  `;
}

function directiveSource(input: string): string {
  return `
    import {Directive, Input} from '@angular/core';
    @Directive({selector: '[dir]'})
    export class Dir {
      @Input() ${input}: string = '';
    }
  `;
}

const DEPENDENT_SOURCE = `
  import {Component} from '@angular/core';
  import {Dir} from './Shared/dir';
  @Component({
    selector: 'app-dependent',
    imports: [Dir],
    template: '<div dir [first]="value" [second]="value"></div>',
  })
  export class DependentComponent {
    value = 'x';
  }
`;

describe('HybridCompiler fileCache invalidation', () => {
  it('drops the entry of an edited file whose path the analyzer case-folds', async () => {
    const {compiler, root} = await createCompiler('edited_file', [
      TSCONFIG,
      MAIN,
      {path: 'Feature/loose.ts', content: componentSource('<span>{{value}}</span>')},
    ]);
    try {
      const loosePath = path.join(root, 'Feature/loose.ts');
      expect(compiler.getTcbForFile(loosePath)).toContain('LooseComponent');
      const key = compiler.getClassMetadata(loosePath)!.filePath;
      expect(compiler.fileCache.has(key)).toBe(true);

      const updated = componentSource('<b>{{value.length}}</b>');
      await fs.writeFile(loosePath, updated);
      await compiler.updateFileContent([{filePath: loosePath, content: updated}]);

      expect(compiler.fileCache.has(key)).toBe(false);
      expect(compiler.getTcbForFile(loosePath)).toContain('.length');
    } finally {
      compiler.analyzer.close();
    }
  });

  it('drops the entry of a file outside the entrypoints when a file it depends on changes', async () => {
    const {compiler, root} = await createCompiler('dependent_file', [
      TSCONFIG,
      MAIN,
      {path: 'Shared/dir.ts', content: directiveSource('first')},
      {path: 'dependent.ts', content: DEPENDENT_SOURCE},
    ]);
    try {
      const dependentPath = path.join(root, 'dependent.ts');
      const before = compiler.getTcbForFile(dependentPath);
      const key = compiler.getClassMetadata(dependentPath)!.filePath;
      expect(compiler.fileCache.has(key)).toBe(true);
      expect(before).toContain('_t1.first');
      expect(before).not.toContain('_t1.second');

      const dirPath = path.join(root, 'Shared/dir.ts');
      const updated = directiveSource('second');
      await fs.writeFile(dirPath, updated);
      await compiler.updateFileContent([{filePath: dirPath, content: updated}]);

      expect(compiler.fileCache.has(key)).toBe(false);
      const after = compiler.getTcbForFile(dependentPath);
      expect(after).toContain('_t1.second');
      expect(after).not.toContain('_t1.first');
    } finally {
      compiler.analyzer.close();
    }
  });
});
