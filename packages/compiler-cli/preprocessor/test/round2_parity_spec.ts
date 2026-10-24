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

describe('ɵsetClassMetadata placement with non-Angular class decorators', () => {
  it('emits ɵsetClassMetadata when a custom class decorator is present', async () => {
    const outputs = await compileFiles({
      '/test.ts': `
        import {Component} from '@angular/core';

        function CustomClassDecorator(): ClassDecorator {
          return (target) => target;
        }

        @CustomClassDecorator()
        @Component({
          selector: 'decorated-cmp',
          template: '',
        })
        export class DecoratedCmp {}
      `,
    });

    const content = outputs.get('/out/test.ts')!;
    expect(content).not.toContain('static {');
    expect(content).toContain(
      "((): any => {\n  (((typeof ngDevMode === 'undefined') || ngDevMode) && i0.ɵsetClassMetadata(DecoratedCmp,",
    );
  });
});
