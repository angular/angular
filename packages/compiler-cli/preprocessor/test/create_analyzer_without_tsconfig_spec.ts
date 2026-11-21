/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createAnalyzer, createAnalyzerWithInfo} from '../api.js';
import {HybridCompiler} from '../src/hybrid_compiler.js';
import type {ProcessedFile} from '../src/processor.js';
import type {AnalysisResult} from '../src/types.js';
import {resolveFixtureNodeModules, resolveWasmBinding} from './utils.js';

const COMP_PATH = '/app/src/my_comp.ts';
const COMP_CONTENT = `import {Component} from '@angular/core';

@Component({
  selector: 'my-comp',
  template: '<div>Hello</div>',
})
export class MyComp {}
`;

/** Non-standalone `MyComp` whose template matches `HighlightDir`'s selector. */
const HIGHLIGHT_COMP_CONTENT = `import {Component} from '@angular/core';

@Component({
  selector: 'my-comp',
  standalone: false,
  template: '<div highlight>Hello</div>',
})
export class MyComp {}
`;

const HIGHLIGHT_DIR_CONTENT = `import {Directive} from '@angular/core';

@Directive({
  selector: '[highlight]',
  standalone: false,
})
export class HighlightDir {}
`;

/** `AppModule` declaring `MyComp` (a sibling file) and `HighlightDir` (imported from `dirSpecifier`). */
function appModuleContent(dirSpecifier = './highlight_dir'): string {
  return `import {NgModule} from '@angular/core';
import {MyComp} from './my_comp';
import {HighlightDir} from '${dirSpecifier}';

@NgModule({
  declarations: [MyComp, HighlightDir],
})
export class AppModule {}
`;
}

/** Runs the optimized pipeline and returns the processed output of every file in `virtualFiles`. */
async function processAll(
  compiler: HybridCompiler,
  virtualFiles: Record<string, string>,
): Promise<Map<string, ProcessedFile>> {
  const processed = new Map<string, ProcessedFile>();
  for await (const chunk of compiler.analyzeOptimized()) {
    const chunkContext = await compiler.prepareChunk(chunk);
    for (const file of chunk.files) {
      const content = virtualFiles[file.filePath];
      if (content === undefined) continue;
      processed.set(
        file.filePath,
        await compiler.processFile(file.filePath, content, file, chunkContext),
      );
    }
  }
  return processed;
}

/** The names of the declarations in the compilation scope of the first class in `metadata`. */
function resolvedDeclarationNames(metadata: AnalysisResult | null): string[] {
  return metadata?.classes[0]?.component?.resolvedDeclarations?.map((d) => d.name) ?? [];
}

describe('createAnalyzer without a tsconfig', () => {
  it('analyzes the program closure of explicit entry points', async () => {
    const virtualFiles = {[COMP_PATH]: COMP_CONTENT};
    const analyzer = await createAnalyzer({
      backend: 'wasm',
      wasmBinding: resolveWasmBinding(),
      virtualFiles,
      optimize: false,
      entryPoints: [COMP_PATH],
      defaultHost: {
        rootDirs: ['/app'],
        nodeModulesPathOverride: resolveFixtureNodeModules(),
      },
    });

    try {
      const metadata = await analyzer.getMetadataForFile(COMP_PATH);
      expect(metadata?.classes.map((c) => c.className)).toEqual(['MyComp']);

      const compiler = new HybridCompiler(analyzer, {
        optimize: false,
        rootDirs: ['/app'],
      });
      const processed = await compiler.processFile(COMP_PATH, COMP_CONTENT);
      expect(processed.magicString.toString()).toContain('ɵɵdefineComponent');
    } finally {
      analyzer.close();
    }
  });

  it('reports the loaded backend for the options-only form', async () => {
    const {analyzer, backend} = await createAnalyzerWithInfo({
      backend: 'wasm',
      wasmBinding: resolveWasmBinding(),
      virtualFiles: {[COMP_PATH]: COMP_CONTENT},
      entryPoints: [COMP_PATH],
    });
    try {
      expect(backend).toBe('wasm');
    } finally {
      analyzer.close();
    }
  });

  it('rejects relative entry points', async () => {
    await expectAsync(
      createAnalyzer({
        backend: 'wasm',
        wasmBinding: resolveWasmBinding(),
        virtualFiles: {[COMP_PATH]: COMP_CONTENT},
        entryPoints: ['src/my_comp.ts'],
      }),
    ).toBeRejectedWithError(/must be an absolute path when no tsconfig is given/);
  });

  it('collects diagnostics via HybridCompiler.getDiagnostics() without a tsconfig', async () => {
    const nonStandaloneContent = `import {Component} from '@angular/core';

@Component({
  selector: 'my-comp',
  standalone: false,
  template: '<div>Hello</div>',
})
export class MyComp {}
`;
    const analyzer = await createAnalyzer({
      backend: 'wasm',
      wasmBinding: resolveWasmBinding(),
      virtualFiles: {[COMP_PATH]: nonStandaloneContent},
      optimize: true,
      entryPoints: [COMP_PATH],
      strictStandalone: true,
      defaultHost: {
        rootDirs: ['/app'],
        nodeModulesPathOverride: resolveFixtureNodeModules(),
      },
    });

    try {
      const compiler = new HybridCompiler(analyzer, {
        optimize: true,
        rootDirs: ['/app'],
      });
      for await (const chunk of compiler.analyzeOptimized()) {
        const chunkContext = await compiler.prepareChunk(chunk);
        for (const file of chunk.files) {
          await compiler.processFile(file.filePath, nonStandaloneContent, file, chunkContext);
        }
      }
      const diagnostics = compiler.getDiagnostics();
      expect(diagnostics.map((d) => d.code)).toContain(2023);
    } finally {
      analyzer.close();
    }
  });

  it('resolves NgModule compilation scopes across the import closure of a single entry point', async () => {
    const mainPath = '/app/src/main.ts';
    const virtualFiles: Record<string, string> = {
      [mainPath]: `import './app_module';\n`,
      ['/app/src/app_module.ts']: appModuleContent(),
      ['/app/src/highlight_dir.ts']: HIGHLIGHT_DIR_CONTENT,
      [COMP_PATH]: HIGHLIGHT_COMP_CONTENT,
    };

    const analyzer = await createAnalyzer({
      backend: 'wasm',
      wasmBinding: resolveWasmBinding(),
      virtualFiles,
      optimize: true,
      // Only main.ts is passed as an entry point; AppModule, MyComp, and HighlightDir are
      // discovered by following the import closure from main.ts.
      entryPoints: [mainPath],
      defaultHost: {
        rootDirs: ['/app'],
        nodeModulesPathOverride: resolveFixtureNodeModules(),
      },
    });

    try {
      const compiler = new HybridCompiler(analyzer, {
        optimize: true,
        rootDirs: ['/app'],
      });
      const processed = (await processAll(compiler, virtualFiles)).get(COMP_PATH);
      const compEmitted = processed?.magicString.toString();
      expect(compEmitted).toContain('HighlightDir');
      expect(compEmitted).toContain('dependencies:');
    } finally {
      analyzer.close();
    }
  });

  it('invalidates cached NgModule scopes when setEntryPoints adds or removes roots', async () => {
    const modulePath = '/app/src/app_module.ts';
    const virtualFiles: Record<string, string> = {
      [COMP_PATH]: HIGHLIGHT_COMP_CONTENT,
      ['/app/src/highlight_dir.ts']: HIGHLIGHT_DIR_CONTENT,
      [modulePath]: appModuleContent(),
    };

    const analyzer = await createAnalyzer({
      backend: 'wasm',
      wasmBinding: resolveWasmBinding(),
      virtualFiles,
      optimize: true,
      // Start with only MyComp; AppModule is not imported by MyComp, so it is outside the closure.
      entryPoints: [COMP_PATH],
      defaultHost: {
        rootDirs: ['/app'],
        nodeModulesPathOverride: resolveFixtureNodeModules(),
      },
    });

    try {
      const initialMeta = await analyzer.getMetadataForFile(COMP_PATH);
      expect(resolvedDeclarationNames(initialMeta)).not.toContain('HighlightDir');

      // Add AppModule as an entry point; MyComp's cached metadata must be evicted and re-resolved
      // with AppModule's scope.
      const invalidatedOnAdd = await analyzer.setEntryPoints([COMP_PATH, modulePath]);
      expect(invalidatedOnAdd).toContain(COMP_PATH);

      const updatedMeta = await analyzer.getMetadataForFile(COMP_PATH);
      expect(resolvedDeclarationNames(updatedMeta)).toContain('HighlightDir');

      // Remove AppModule from entry points; MyComp's cached metadata must be evicted again.
      const invalidatedOnRemove = await analyzer.setEntryPoints([COMP_PATH]);
      expect(invalidatedOnRemove).toContain(COMP_PATH);

      const finalMeta = await analyzer.getMetadataForFile(COMP_PATH);
      expect(resolvedDeclarationNames(finalMeta)).not.toContain('HighlightDir');

      await expectAsync(analyzer.setEntryPoints(['src/my_comp.ts'])).toBeRejectedWithError(
        /must be absolute paths/,
      );
    } finally {
      analyzer.close();
    }
  });

  it('rewrites @angular/core runtime imports when r3SymbolsFile is set explicitly', async () => {
    const r3SymbolsPath = '/core/src/r3_symbols.ts';
    const injectablePath = '/core/src/di/injectable.ts';
    const appRefPath = '/core/src/application/application_ref.ts';
    const appRefContent = `import {Injectable} from '../di/injectable';

@Injectable({providedIn: 'root'})
export class ApplicationRef {}
`;
    const virtualFiles: Record<string, string> = {
      [r3SymbolsPath]: `export const ITS_JUST_ANGULAR = true;\n`,
      [injectablePath]: `export function Injectable(opts?: unknown): any {}\n`,
      [appRefPath]: appRefContent,
    };

    const analyzer = await createAnalyzer({
      backend: 'wasm',
      wasmBinding: resolveWasmBinding(),
      virtualFiles,
      optimize: false,
      // r3_symbols.ts is not in entryPoints; r3SymbolsFile identifies it explicitly, which also
      // marks the compilation as @angular/core.
      entryPoints: [appRefPath],
      r3SymbolsFile: r3SymbolsPath,
      defaultHost: {
        rootDirs: ['/core'],
        nodeModulesPathOverride: resolveFixtureNodeModules(),
      },
    });

    try {
      const compiler = new HybridCompiler(analyzer, {
        optimize: false,
        rootDirs: ['/core'],
      });
      const processed = await compiler.processFile(appRefPath, appRefContent);
      const emitted = processed.magicString.toString();
      expect(emitted).toContain("import * as i0 from '../r3_symbols';");
      expect(emitted).not.toContain("from '@angular/core'");
      expect(emitted).toContain('i0.ɵɵdefineInjectable(');
      expect(emitted).toContain('i0.setClassMetadata(');
    } finally {
      analyzer.close();
    }
  });

  it('recognizes @angular/core decorators when angularCoreCompilation is set without r3_symbols.ts', async () => {
    const injectablePath = '/core/src/di/injectable.ts';
    const testingServicePath = '/core/testing/src/testing_service.ts';
    const testingServiceContent = `import {Injectable} from '../../src/di/injectable';

@Injectable()
export class TestingService {}
`;
    const virtualFiles: Record<string, string> = {
      [injectablePath]: `export function Injectable(opts?: unknown): any {}\n`,
      [testingServicePath]: testingServiceContent,
    };

    const analyzer = await createAnalyzer({
      backend: 'wasm',
      wasmBinding: resolveWasmBinding(),
      virtualFiles,
      optimize: false,
      entryPoints: [testingServicePath],
      angularCoreCompilation: true,
      defaultHost: {
        rootDirs: ['/core'],
        nodeModulesPathOverride: resolveFixtureNodeModules(),
      },
    });

    try {
      const compiler = new HybridCompiler(analyzer, {
        optimize: false,
        rootDirs: ['/core'],
      });
      const processed = await compiler.processFile(testingServicePath, testingServiceContent);
      const emitted = processed.magicString.toString();
      expect(emitted).toContain("import * as i0 from '@angular/core';");
      expect(emitted).toContain('i0.ɵɵdefineInjectable(');
    } finally {
      analyzer.close();
    }
  });

  it('emits workspace-prefixed imports using importPrefixRoots without a tsconfig', async () => {
    const modulePath = '/app/pkg/app_module.ts';
    const compPath = '/app/pkg/my_comp.ts';
    // HighlightDir lives under the second prefix root so its specifier must have the longer
    // `/app/bazel-out/bin` stripped rather than just `/app`.
    const virtualFiles: Record<string, string> = {
      [modulePath]: appModuleContent('../bazel-out/bin/pkg/highlight_dir'),
      ['/app/bazel-out/bin/pkg/highlight_dir.ts']: HIGHLIGHT_DIR_CONTENT,
      [compPath]: HIGHLIGHT_COMP_CONTENT,
    };

    const analyzer = await createAnalyzer({
      backend: 'wasm',
      wasmBinding: resolveWasmBinding(),
      virtualFiles,
      optimize: true,
      entryPoints: [modulePath],
      workspaceName: 'my_ws',
      useHostForImportGeneration: true,
      importPrefixRoots: ['/app', '/app/bazel-out/bin'],
      defaultHost: {
        rootDirs: ['/app', '/app/bazel-out/bin'],
        nodeModulesPathOverride: resolveFixtureNodeModules(),
      },
    });

    try {
      const compiler = new HybridCompiler(analyzer, {
        optimize: true,
        workspaceName: 'my_ws',
        rootDirs: ['/app', '/app/bazel-out/bin'],
      });
      const processed = (await processAll(compiler, virtualFiles)).get(compPath);
      expect(processed?.magicString.toString()).toContain("from 'my_ws/pkg/highlight_dir'");
      expect(processed?.tcb?.code).toContain("from 'my_ws/pkg/my_comp'");
    } finally {
      analyzer.close();
    }
  });
});
