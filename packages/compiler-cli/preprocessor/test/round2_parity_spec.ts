/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

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
      'static ɵmod: i0.ɵɵNgModuleDeclaration<AppModule, never, never, never>',
    );
  });
});
