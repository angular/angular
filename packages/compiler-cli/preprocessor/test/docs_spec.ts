/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {posix as path} from 'path';
import ts from 'typescript';
import {createAnalyzer, getApiDocumentation, getApiDocumentationSync} from '../api.js';
import {HybridCompiler} from '../src/hybrid_compiler.js';
import {buildTypeCheckingConfig} from '../src/tcb.js';
import {resolveFixtureNodeModules, resolveWasmBinding} from './utils.js';

async function setupDocsTest(files: Record<string, string>) {
  const projectRoot = '/project';
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  const nodeModulesPath = resolveFixtureNodeModules().replace(/\\/g, '/');

  const virtualFiles: Record<string, string> = {};
  const filePaths: string[] = [];
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(projectRoot, relativePath);
    virtualFiles[fullPath] = content;
    filePaths.push(fullPath);
  }

  virtualFiles[tsconfigPath] = JSON.stringify({
    compilerOptions: {
      strict: true,
      target: 'es2022',
      module: 'es2022',
      moduleResolution: 'bundler',
      experimentalDecorators: true,
    },
    files: filePaths,
  });

  const wasmBinding = resolveWasmBinding();
  const analyzer = await createAnalyzer(tsconfigPath, {
    virtualFiles,
    optimize: true,
    backend: 'wasm',
    wasmBinding,
    nodeModulesPathOverride: nodeModulesPath,
  });

  const compiler = new HybridCompiler(analyzer, {
    optimize: true,
    tcbConfig: buildTypeCheckingConfig({strictTemplates: true}),
    rootDir: projectRoot,
  });

  const compilerOptions: ts.CompilerOptions = {
    strict: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    experimentalDecorators: true,
    baseUrl: projectRoot,
    paths: {
      '@angular/*': [path.join(nodeModulesPath, '@angular/*')],
    },
  };

  const baseHost = ts.createCompilerHost(compilerOptions, true);
  const host: ts.CompilerHost = {
    ...baseHost,
    getCurrentDirectory: () => projectRoot,
    fileExists: (fileName: string) => {
      const normalized = fileName.replace(/\\/g, '/');
      return normalized in virtualFiles || baseHost.fileExists(fileName);
    },
    readFile: (fileName: string) => {
      const normalized = fileName.replace(/\\/g, '/');
      if (normalized in virtualFiles) {
        return virtualFiles[normalized];
      }
      return baseHost.readFile(fileName);
    },
    getSourceFile: (
      fileName: string,
      languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions,
      onError?: (message: string) => void,
      shouldCreateNewSourceFile?: boolean,
    ) => {
      const normalized = fileName.replace(/\\/g, '/');
      if (normalized in virtualFiles) {
        return ts.createSourceFile(
          normalized,
          virtualFiles[normalized],
          languageVersionOrOptions,
          true,
        );
      }
      return baseHost.getSourceFile(
        fileName,
        languageVersionOrOptions,
        onError,
        shouldCreateNewSourceFile,
      );
    },
  };

  const tsProgram = ts.createProgram(filePaths, compilerOptions, host);
  return {compiler, tsProgram, entryPoint: path.join(projectRoot, 'index.ts')};
}

describe('API documentation extraction', () => {
  it('should extract component, directive, pipe, and NgModule documentation asynchronously and synchronously', async () => {
    const {compiler, tsProgram, entryPoint} = await setupDocsTest({
      'index.ts': `
        import {Component, Directive, EventEmitter, Input, NgModule, Output, Pipe, input, model, output} from '@angular/core';

        /** A test component. */
        @Component({
          selector: 'my-comp',
          exportAs: 'myComp',
          template: '<div></div>',
        })
        export class MyComp {
          @Input() disabled = false;
          @Output() closed = new EventEmitter<void>();
          label = input.required<string>({alias: 'ariaLabel'});
          value = model<number>(0);
          clicked = output<MouseEvent>();
        }

        /** A test directive. */
        @Directive({
          selector: '[myDir]',
          standalone: false,
        })
        export class MyDir {}

        /** A test pipe. */
        @Pipe({
          name: 'myPipe',
          pure: false,
        })
        export class MyPipe {
          transform(val: string): string {
            return val;
          }
        }

        /** A test module. */
        @NgModule({
          declarations: [MyDir],
        })
        export class MyModule {}
      `,
    });

    const asyncDocs = await compiler.getApiDocumentation(tsProgram, entryPoint, new Set());
    const syncDocs = compiler.getApiDocumentationSync(tsProgram, entryPoint, new Set());

    for (const docs of [asyncDocs, syncDocs]) {
      expect(docs.entries.map((e) => e.name)).toEqual(['MyComp', 'MyDir', 'MyPipe', 'MyModule']);

      const compEntry = docs.entries.find((e) => e.name === 'MyComp') as any;
      expect(compEntry.entryType).toBe('component');
      expect(compEntry.selector).toBe('my-comp');
      expect(compEntry.exportAs).toEqual(['myComp']);
      expect(compEntry.isStandalone).toBe(true);
      expect(compEntry.description).toBe('A test component.');

      const dirEntry = docs.entries.find((e) => e.name === 'MyDir') as any;
      expect(dirEntry.entryType).toBe('directive');
      expect(dirEntry.selector).toBe('[myDir]');
      expect(dirEntry.isStandalone).toBe(false);

      const pipeEntry = docs.entries.find((e) => e.name === 'MyPipe') as any;
      expect(pipeEntry.entryType).toBe('pipe');
      expect(pipeEntry.pipeName).toBe('myPipe');
      expect(pipeEntry.isPure).toBe(false);
      expect(pipeEntry.isStandalone).toBe(true);

      const modEntry = docs.entries.find((e) => e.name === 'MyModule') as any;
      expect(modEntry.entryType).toBe('ng_module');
    }

    compiler.analyzer.close();
  });

  it('should support standalone getApiDocumentation and getApiDocumentationSync with cached metadata', async () => {
    const {compiler, tsProgram, entryPoint} = await setupDocsTest({
      'index.ts': `
        import {Component} from '@angular/core';

        @Component({
          selector: 'cached-comp',
          template: '',
        })
        export class CachedComp {}
      `,
    });

    // Populate the metadata cache on HybridCompiler
    for await (const _chunk of compiler.analyze()) {
      // Cache populated during iteration
    }

    const asyncDocs = await getApiDocumentation(compiler, tsProgram, entryPoint, new Set());
    const syncDocs = getApiDocumentationSync(compiler, tsProgram, entryPoint, new Set());

    expect(asyncDocs.entries.length).toBe(1);
    expect(asyncDocs.entries[0].name).toBe('CachedComp');
    expect(syncDocs.entries).toEqual(asyncDocs.entries);

    compiler.analyzer.close();
  });

  it('should throw when the entry point is not in the program', async () => {
    const {compiler, tsProgram} = await setupDocsTest({
      'index.ts': `export const x = 1;`,
    });

    await expectAsync(
      compiler.getApiDocumentation(tsProgram, '/project/nonexistent.ts', new Set()),
    ).toBeRejectedWithError(/Entry point "\/project\/nonexistent\.ts" not found/);

    expect(() =>
      compiler.getApiDocumentationSync(tsProgram, '/project/nonexistent.ts', new Set()),
    ).toThrowError(/Entry point "\/project\/nonexistent\.ts" not found/);

    compiler.analyzer.close();
  });
});
