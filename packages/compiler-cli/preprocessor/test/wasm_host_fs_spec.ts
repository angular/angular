/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createRequire} from 'node:module';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {pathExists, resolveWasmBinding} from './utils.js';
import {createNodeHostFs} from '../src/wasm_host_fs.js';

const require = createRequire(import.meta.url);

async function writeFixture(name: string): Promise<string> {
  const tmpBase = process.env['TEST_TMPDIR'] || path.resolve(process.cwd(), '.tmp');
  const root = path.resolve(tmpBase, 'wasm-host-fs', name);
  await fs.rm(root, {recursive: true, force: true});
  await fs.mkdir(path.join(root, 'src'), {recursive: true});

  await fs.writeFile(
    path.join(root, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'esnext',
          moduleResolution: 'bundler',
          strict: true,
        },
        include: ['src/**/*.ts'],
      },
      null,
      2,
    ),
  );

  await fs.writeFile(
    path.join(root, 'src/app.component.ts'),
    `import {Component} from '@angular/core';\n\n` +
      `@Component({\n` +
      `  selector: 'app-root',\n` +
      `  template: '<h1>{{ title }}</h1>',\n` +
      `})\n` +
      `export class AppComponent {\n` +
      `  title = 'hello';\n` +
      `}\n`,
  );

  // Link @angular/core from runfiles if available
  const runfilesDir = process.env['JS_BINARY__RUNFILES'];
  let corePackagePath: string | null = null;
  if (runfilesDir) {
    const candidates = [
      path.join(runfilesDir, '_main/packages/core/npm_package'),
      path.join(runfilesDir, 'angular/packages/core/npm_package'),
      path.join(runfilesDir, 'packages/core/npm_package'),
    ];
    for (const c of candidates) {
      try {
        if (await pathExists(c)) {
          corePackagePath = c;
          break;
        }
      } catch {}
    }
  }

  const nodeModulesDir = path.join(root, 'node_modules/@angular');
  await fs.mkdir(nodeModulesDir, {recursive: true});
  if (corePackagePath) {
    await fs.symlink(corePackagePath, path.join(nodeModulesDir, 'core'), 'dir');
  }

  return root;
}

describe('wasm engine over a real filesystem', () => {
  let root: string;
  let tsconfigPath: string;
  let wasmGlue: string;

  beforeAll(async () => {
    wasmGlue = resolveWasmBinding();
    root = await writeFixture('basic');
    tsconfigPath = path.join(root, 'tsconfig.json');
  });

  it('cannot see on-disk files without a host bridge', () => {
    const {WasmAnalyzer} = require(wasmGlue);
    expect(() => new WasmAnalyzer(JSON.stringify({tsconfigPath, optimize: true}))).toThrow();
  });

  it('reads file contents from disk through the host bridge', () => {
    const {WasmAnalyzer} = require(wasmGlue);
    const analyzer = new WasmAnalyzer(
      JSON.stringify({tsconfigPath, optimize: true}),
      createNodeHostFs(),
    );

    const source = path.join(root, 'src/app.component.ts');
    expect(analyzer.get_file_content(source)).toContain('@Component');
  });

  it('discovers entrypoints by walking directories on disk', () => {
    const {WasmAnalyzer} = require(wasmGlue);
    const analyzer = new WasmAnalyzer(
      JSON.stringify({tsconfigPath, optimize: true}),
      createNodeHostFs(),
    );

    const metadata = analyzer.get_metadata_for_file(path.join(root, 'src/app.component.ts'));
    expect(metadata).toBeTruthy();
    expect(JSON.parse(metadata!)).toEqual(jasmine.any(Object));
  });

  it('finds a file added to a subdirectory the glob covers', async () => {
    const nested = path.join(root, 'src/nested');
    await fs.mkdir(nested, {recursive: true});
    await fs.writeFile(
      path.join(nested, 'other.component.ts'),
      `import {Component} from '@angular/core';\n\n` +
        `@Component({selector: 'other', template: '<p>hi</p>'})\n` +
        `export class OtherComponent {}\n`,
    );

    const {WasmAnalyzer} = require(wasmGlue);
    const analyzer = new WasmAnalyzer(
      JSON.stringify({tsconfigPath, optimize: true}),
      createNodeHostFs(),
    );

    expect(analyzer.get_file_content(path.join(nested, 'other.component.ts'))).toContain(
      'OtherComponent',
    );
  });
});
