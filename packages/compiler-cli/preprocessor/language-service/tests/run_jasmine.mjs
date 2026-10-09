/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import esbuild from 'esbuild';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import fs from 'node:fs/promises';
import Jasmine from 'jasmine';
import cp from 'node:child_process';
import {createRequire} from 'node:module';
import {ensureWasmBinding} from './wasm_binding.mjs';

const req = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../../..');
const outDir = path.join(__dirname, '.jasmine_build');

ensureWasmBinding(repoRoot);

// If no arguments, run each spec in its own child process sequentially for clean isolation
const args = process.argv.slice(2);
if (args.length === 0) {
  const entries = await fs.readdir(__dirname);
  const specFiles = entries
    .filter((f) => (f.endsWith('_spec.ts') || f.endsWith('.test.ts')) && !f.endsWith('.d.ts'))
    .sort()
    .map((f) => path.join(__dirname, f));

  let failed = false;
  for (const specFile of specFiles) {
    const result = cp.spawnSync(process.execPath, [fileURLToPath(import.meta.url), specFile], {
      stdio: 'inherit',
      cwd: repoRoot,
    });
    if (result.status !== 0) {
      failed = true;
    }
  }
  process.exit(failed ? 1 : 0);
}

// Single spec run mode
const specFile = path.resolve(args[0]);

// Resolve tsgo binary path
try {
  const previewPkg = req.resolve('@typescript/native-preview/package.json');
  const previewReq = createRequire(previewPkg);
  const platformPkg = `@typescript/native-preview-${process.platform}-${process.arch}`;
  const platPkgJson = previewReq.resolve(`${platformPkg}/package.json`);
  process.env['TSGO_BINARY_PATH'] = path.join(
    path.dirname(platPkgJson),
    'lib',
    process.platform === 'win32' ? 'tsgo.exe' : 'tsgo',
  );
} catch (e) {
  console.warn('Could not resolve tsgo binary:', e);
}

// Clean and create outDir
await fs.rm(outDir, {recursive: true, force: true});
await fs.mkdir(outDir, {recursive: true});

try {
  const baseName = path.basename(specFile).replace(/\.ts$/, '.cjs');
  const outFile = path.join(outDir, baseName);

  await esbuild.build({
    entryPoints: [specFile],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    outfile: outFile,
    external: [
      'vscode-languageserver',
      'vscode-languageserver/*',
      'vscode-languageserver-textdocument',
      'vscode-languageserver-types',
      'vscode-jsonrpc',
      'vscode-jsonrpc/*',
      'vscode-uri',
      'typescript',
      '@typescript/native-preview',
      '@typescript/native-preview/*',
      'jasmine',
      path.join(repoRoot, 'packages/compiler-cli/preprocessor/ng-analyze-wasm/ng_analyze.js'),
      path.join(repoRoot, 'packages/compiler-cli/preprocessor/ng-analyze/index.js'),
    ],
    alias: {
      '@angular/compiler-cli/private/hybrid_analysis': path.join(
        repoRoot,
        'packages/compiler-cli/private/hybrid_analysis.ts',
      ),
      '@angular/compiler-cli/private/migrations': path.join(
        repoRoot,
        'packages/compiler-cli/private/migrations.ts',
      ),
      '@angular/compiler-cli': path.join(repoRoot, 'packages/compiler-cli/index.ts'),
      '@angular/compiler': path.join(repoRoot, 'packages/compiler/index.ts'),
      '@angular/language-service/private': path.join(
        repoRoot,
        'packages/language-service/private.ts',
      ),
      '@angular/language-service/api': path.join(repoRoot, 'packages/language-service/api.ts'),
      '@angular/language-service': path.join(repoRoot, 'packages/language-service/api.ts'),
      '@angular/core': path.join(repoRoot, 'packages/core/index.ts'),
    },
    define: {
      __dirname: JSON.stringify(path.dirname(specFile)),
      'import.meta.url': JSON.stringify(pathToFileURL(specFile).href),
    },
    logOverride: {
      'empty-import-meta': 'silent',
    },
  });

  // tslint:disable-next-line:no-console
  console.log(`\nRunning ${path.basename(specFile)} with Jasmine:`);
  const jasmine = new Jasmine();
  jasmine.exitOnCompletion = false;
  // The timeout lives on jasmine-core (`runner.jasmine`), not on the runner itself.
  jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
  jasmine.env.configure({random: false});
  jasmine.loadConfig({
    spec_files: [outFile],
  });
  const result = await jasmine.execute();
  if (result.overallStatus !== 'passed') {
    process.exit(1);
  }
} finally {
  await fs.rm(outDir, {recursive: true, force: true});
}
