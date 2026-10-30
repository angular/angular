/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {runPipeline, TestFile} from './utils.js';

function makeTsconfig(
  fileNames: string[],
  compilerOptions: Record<string, unknown> = {},
  angularCompilerOptions: Record<string, unknown> = {},
): string {
  return JSON.stringify({
    compilerOptions: {
      target: 'es2022',
      module: 'esnext',
      moduleResolution: 'bundler',
      experimentalDecorators: true,
      ...compilerOptions,
    },
    files: fileNames.map((f) => (f.startsWith('/') ? f.slice(1) : f)),
    angularCompilerOptions,
  });
}

async function compileFiles(
  files: Record<string, string>,
  options: {
    optimize?: boolean;
    compilerOptions?: Record<string, unknown>;
    angularCompilerOptions?: Record<string, unknown>;
    errors?: string[];
  } = {},
): Promise<Map<string, string>> {
  const testFiles: TestFile[] = [
    {
      path: '/tsconfig.json',
      content: makeTsconfig(
        Object.keys(files),
        options.compilerOptions,
        options.angularCompilerOptions,
      ),
    },
    ...Object.entries(files).map(([p, content]) => ({
      path: p.startsWith('/') ? p : `/${p}`,
      content,
    })),
  ];

  const outputs = await runPipeline(testFiles, {
    optimize: options.optimize ?? true,
    format: false,
    errors: options.errors,
  });

  const map = new Map<string, string>();
  for (const out of outputs) {
    map.set(out.path, out.content);
  }
  return map;
}

describe('isolated NgModule imports under emitDeclarationOnly', () => {
  it('emits ɵmod type arguments under emitDeclarationOnly', async () => {
    const outputs = await compileFiles(
      {
        '/test.ts': `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class ImportedModule {}

          @NgModule({
            imports: [ImportedModule],
          })
          export class AppModule {}
        `,
      },
      {
        compilerOptions: {
          declaration: true,
          emitDeclarationOnly: true,
        },
        angularCompilerOptions: {
          _experimentalAllowEmitDeclarationOnly: true,
        },
      },
    );

    const content = outputs.get('/out/test.ts')!;
    expect(content).toContain(
      'static ɵmod: i0.ɵɵNgModuleDeclaration<AppModule, never, [typeof ImportedModule], never>',
    );
  });

  it('expands same-file unannotated const arrays of unresolved imports without triggering TS9017', async () => {
    for (const optimize of [false, true]) {
      const outputs = await compileFiles(
        {
          '/test.ts': `
            import {NgModule} from '@angular/core';
            import {ModuleA} from 'external-pkg-a';
            import {ModuleB} from 'external-pkg-b';

            const MODULE_IMPORTS = [ModuleA, ModuleB];

            @NgModule({
              imports: [MODULE_IMPORTS],
              exports: [MODULE_IMPORTS],
            })
            export class MyModule {}
          `,
        },
        {
          optimize,
          compilerOptions: {
            declaration: true,
            emitDeclarationOnly: true,
            isolatedDeclarations: true,
          },
          angularCompilerOptions: {
            _experimentalAllowEmitDeclarationOnly: true,
          },
        },
      );

      const content = outputs.get('/out/test.ts')!;
      expect(content).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, never, [[typeof ModuleA, typeof ModuleB]], [[typeof ModuleA, typeof ModuleB]]>',
      );
      expect(content).not.toContain('import * as i1');

      const dtsResult = ts.transpileDeclaration(content, {
        fileName: 'test.ts',
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
          declaration: true,
          emitDeclarationOnly: true,
          isolatedDeclarations: true,
        },
      });
      expect(dtsResult.diagnostics ?? []).toEqual([]);
      expect(dtsResult.outputText).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, never, [[typeof ModuleA, typeof ModuleB]], [[typeof ModuleA, typeof ModuleB]]>;',
      );
    }
  });
});
