#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// tslint:disable:no-console

import {fileURLToPath} from 'url';
import * as fs from 'node:fs/promises';
import * as path from 'path';
import {resolveWorkspaceConfig} from './src/workspace.js';
import {createHybridCompiler, HybridCompiler, IAnalyzer} from './src/hybrid_compiler.js';
import {SidecarAnalyzer} from './src/analyzer_sidecar.js';
import {run} from './ngp.js';

(async () => {
  try {
    // Parse CLI arguments
    const args = process.argv.slice(2);
    const optimize = args.includes('--optimize');
    const useWasm = args.includes('--wasm');
    const enableTemplateTypeCheckerArg = args.includes('--enable-template-type-checker');
    const inPlace = args.includes('--in-place');

    const sidecarIndex = args.indexOf('--sidecar');
    let sidecarPath: string | undefined;
    if (sidecarIndex !== -1 && args[sidecarIndex + 1]) {
      sidecarPath = args[sidecarIndex + 1];
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Parse --out <dir> argument
    let outDir: string | null = null;
    const outIndex = args.indexOf('--out');
    if (outIndex !== -1 && args[outIndex + 1]) {
      outDir = args[outIndex + 1];
    }

    let targetArg: string | undefined;
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--')) {
        if (arg === '--out' || arg === '--root' || arg === '--sidecar') {
          i++;
        }
      } else {
        targetArg = arg;
        break;
      }
    }
    if (!targetArg) {
      console.error(
        'Usage: ngp <project-dir|angular.json|tsconfig.json> [--optimize] [--wasm] [--out <dir>] [--in-place] [--root <dir>] [--sidecar <path>]',
      );
      process.exit(1);
    }

    const targetPath = path.resolve(targetArg);
    let rootDir: string;
    let tsconfigPath: string;

    // If we're resolving a tsconfig, we shouldn't consult the workspace for tsconfig path,
    // but we should still try to locate the workspaceRoot to prevent sibling library files from escaping outDir.
    const workspaceConfig = await resolveWorkspaceConfig(targetPath);
    if (path.basename(targetPath).includes('tsconfig') && targetPath.endsWith('.json')) {
      rootDir = workspaceConfig ? workspaceConfig.workspaceRoot : path.dirname(targetPath);
      tsconfigPath = targetPath;
    } else {
      tsconfigPath = workspaceConfig ? workspaceConfig.tsConfig : targetPath;
      rootDir = workspaceConfig ? workspaceConfig.workspaceRoot : path.dirname(tsconfigPath);
    }

    // Parse --root <dir> argument
    const rootIndex = args.indexOf('--root');
    if (rootIndex !== -1 && args[rootIndex + 1]) {
      rootDir = path.resolve(args[rootIndex + 1]);
    }

    console.log(
      `Running ngp...${useWasm ? ' (wasm)' : ''}${optimize ? ' (optimize mode)' : ''}${outDir ? ` (output: ${outDir})` : ''} (root: ${rootDir})`,
    );

    let innerAnalyzer: IAnalyzer;
    if (sidecarPath) {
      const sidecar = new SidecarAnalyzer(sidecarPath);
      await sidecar.initialize(tsconfigPath, optimize);
      innerAnalyzer = sidecar;
    } else {
      const {NapiAnalyzer} = await import('./src/analyzer_napi.js');
      let ngAnalyzeDir = path.resolve(__dirname, './ng-analyze');

      try {
        await fs.access(ngAnalyzeDir);
      } catch {
        ngAnalyzeDir = path.resolve(__dirname, '../../ng-analyze');
      }

      innerAnalyzer = await NapiAnalyzer.create(tsconfigPath, {
        optimize,
        useWasm,
        ngAnalyzeDir,
      });
    }
    const compiler = createHybridCompiler(innerAnalyzer, {
      optimize,
      rootDir,
      enableTemplateTypeChecker: enableTemplateTypeCheckerArg,
      incremental: false,
    });

    console.log('Processing files...');
    await run(compiler, {outDir, rootDir, inPlace, tsconfigPath});
  } catch (e) {
    console.error('Fatal Execution Error:', e);
    process.exit(1);
  }
})();
