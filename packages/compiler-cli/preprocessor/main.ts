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
import {resolveWorkspaceConfig, stripJsonComments} from './src/workspace.js';
import {readConfiguration} from '@angular/compiler-cli';
import type {NgpCompilerOptions} from './src/compiler_options.js';
import {HybridCompiler, IAnalyzer} from './src/hybrid_compiler.js';
import {buildTypeCheckingConfig} from './src/tcb.js';
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
    let angularCompilerOptions: NgpCompilerOptions | undefined;

    // If we're resolving a tsconfig, we shouldn't consult the workspace for tsconfig path,
    // but we should still try to locate the workspaceRoot to prevent sibling library files from escaping outDir.
    if (path.basename(targetPath).includes('tsconfig') && targetPath.endsWith('.json')) {
      const workspaceConfig = await resolveWorkspaceConfig(targetPath);
      rootDir = workspaceConfig ? workspaceConfig.workspaceRoot : path.dirname(targetPath);
      tsconfigPath = targetPath;
      angularCompilerOptions = readConfiguration(tsconfigPath).options;
    } else {
      const workspaceConfig = await resolveWorkspaceConfig(targetPath);
      tsconfigPath = workspaceConfig ? workspaceConfig.tsConfig : targetPath;
      rootDir = workspaceConfig ? workspaceConfig.workspaceRoot : path.dirname(tsconfigPath);
      angularCompilerOptions = workspaceConfig?.angularCompilerOptions;
    }

    // Parse --root <dir> argument
    const rootIndex = args.indexOf('--root');
    if (rootIndex !== -1 && args[rootIndex + 1]) {
      rootDir = path.resolve(args[rootIndex + 1]);
    }

    console.log(
      `Running ngp...${useWasm ? ' (wasm)' : ''}${optimize ? ' (optimize mode)' : ''}${outDir ? ` (output: ${outDir})` : ''} (root: ${rootDir})`,
    );

    const tcbConfig = buildTypeCheckingConfig(angularCompilerOptions, enableTemplateTypeCheckerArg);

    let bazelOptions: any;
    try {
      const rawContent = await fs.readFile(tsconfigPath, 'utf8');
      const rawTsconfig = JSON.parse(stripJsonComments(rawContent)) as any;
      bazelOptions = rawTsconfig?.bazelOptions || rawTsconfig?.bazelOpts;
    } catch {
      // Fallback if tsconfig cannot be read as raw JSON
    }
    const isClosureCompilerEnabled =
      angularCompilerOptions?.annotateForClosureCompiler === true ||
      bazelOptions?.annotateForClosureCompiler === true ||
      bazelOptions?.tsickle === true;

    const emitDeclarationOnly =
      angularCompilerOptions?.emitDeclarationOnly === true &&
      angularCompilerOptions?._experimentalAllowEmitDeclarationOnly === true;

    const onlyPublishPublicTypingsForNgModules =
      angularCompilerOptions?.onlyPublishPublicTypingsForNgModules === true;

    const workspaceName = angularCompilerOptions?.workspaceName || bazelOptions?.workspaceName;
    const rootDirs = angularCompilerOptions?.rootDirs || bazelOptions?.rootDirs;

    let innerAnalyzer: IAnalyzer;
    if (sidecarPath) {
      const sidecar = new SidecarAnalyzer(sidecarPath);
      await sidecar.initialize(tsconfigPath, optimize, undefined, undefined, {
        workspaceName,
        rootDirs,
      });
      innerAnalyzer = sidecar;
    } else {
      const {NapiAnalyzer} = await import('./src/analyzer_napi.js');
      let ngAnalyzeDir = path.resolve(__dirname, './ng-analyze');

      try {
        await fs.access(ngAnalyzeDir);
        ngAnalyzeDir = path.resolve(__dirname, '../../ng-analyze');
      } catch {}

      innerAnalyzer = await NapiAnalyzer.create(tsconfigPath, {
        optimize,
        useWasm,
        ngAnalyzeDir,
        workspaceName,
        rootDirs,
      });
    }
    const compiler = new HybridCompiler(innerAnalyzer, {
      optimize,
      // Where `writeDiagnosticsFile` writes the `.ngdiag.json` file; nothing is written without it.
      tsconfigPath,
      tcbConfig,
      legacyOptionalChaining: angularCompilerOptions?.legacyOptionalChaining,
      isClosureCompilerEnabled,
      onlyExplicitDeferDependencyImports:
        angularCompilerOptions?.onlyExplicitDeferDependencyImports,
      enableTemplateSourceLocations: angularCompilerOptions?.enableTemplateSourceLocations,
      emitDeclarationOnly,
      onlyPublishPublicTypingsForNgModules,
      forbidOrphanComponents: angularCompilerOptions?.forbidOrphanComponents,
      supportJitMode: angularCompilerOptions?.supportJitMode !== false,
      preserveWhitespaces: angularCompilerOptions?.preserveWhitespaces,
      supportTestBed: angularCompilerOptions?.supportTestBed,
      enableI18nLegacyMessageIdFormat: angularCompilerOptions?.enableI18nLegacyMessageIdFormat,
      i18nUseExternalIds: angularCompilerOptions?.i18nUseExternalIds,
      i18nNormalizeLineEndingsInICUs: angularCompilerOptions?.i18nNormalizeLineEndingsInICUs,
      enableHmr: angularCompilerOptions?._enableHmr,
      rootDir,
      workspaceName,
      rootDirs,
    });

    console.log('Processing files...');
    await run(compiler, {outDir, rootDir, inPlace});
  } catch (e) {
    console.error('Fatal Execution Error:', e);
    process.exit(1);
  }
})();
