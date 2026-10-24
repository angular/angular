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

describe('ɵsetClassMetadata propDecorators member declaration order', () => {
  it('emits propDecorators keys for interleaved signal and decorator members', async () => {
    const outputs = await compileFiles({
      '/test.ts': `
        import {Component, Input, Output, EventEmitter, input, output, viewChild} from '@angular/core';

        @Component({selector: 'my-cmp', template: ''})
        export class MyCmp {
          sigInput = input(1);
          @Input() decInput = 2;
          sigOut = output<void>();
          sigQuery = viewChild('q');
          @Output() decOut = new EventEmitter<void>();
        }
      `,
    });

    const content = outputs.get('/out/test.ts')!;
    const metaStart = content.indexOf('ɵsetClassMetadata(');
    expect(metaStart).toBeGreaterThanOrEqual(0);
    const propBlock = content.slice(metaStart);
    const orderedKeys = ['sigInput', 'decInput', 'sigOut', 'sigQuery', 'decOut'].sort(
      (a, b) => propBlock.indexOf(`${a}:`) - propBlock.indexOf(`${b}:`),
    );

    expect(orderedKeys).toEqual(['sigInput', 'decInput', 'sigOut', 'sigQuery', 'decOut']);
  });
});
