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
import {getOrCreateSyntheticNodeModules, parseMarkdownTestCase, pathExists} from './utils.js';

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

    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ngp-cli-test-'));
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
    } finally {
      await fs.rm(outDir, {recursive: true, force: true});
    }
  });
});
