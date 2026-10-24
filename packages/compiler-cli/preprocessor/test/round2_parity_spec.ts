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

describe('component hostDirectives validation and poisoning', () => {
  it('validates standalone component with both broken imports and invalid hostDirectives', async () => {
    const outputs = await compileFiles({
      '/test.ts': `
        import {Component, Directive} from '@angular/core';

        @Directive({selector: '[non-standalone]', standalone: false})
        export class NonStandaloneDir {}

        export class NotADirective {}

        @Component({
          selector: 'my-cmp',
          template: '',
          imports: [NonStandaloneDir],
          hostDirectives: [NotADirective],
        })
        export class MyCmp {}
      `,
    });

    const diags = outputs.get('/tsconfig.ngdiag.json')!;
    expect(diags).toBeDefined();
    expect(diags).toContain('"code": 2011');
    expect(diags).not.toContain('"code": 2013');
  });

  it('validates hostDirectives on an orphan non-standalone component', async () => {
    const outputs = await compileFiles({
      '/test.ts': `
        import {Component, Directive} from '@angular/core';

        @Directive({selector: '[non-standalone-host]', standalone: false})
        export class NonStandaloneHostDir {}

        @Component({
          selector: 'orphan-cmp',
          standalone: false,
          template: '',
          hostDirectives: [NonStandaloneHostDir],
        })
        export class OrphanCmp {}
      `,
    });

    const diags = outputs.get('/tsconfig.ngdiag.json') ?? '';
    expect(diags).not.toContain('"code": 2014');
  });

  it('handles cascading diagnostics when hostDirectives has a shape error (NG1010)', async () => {
    const outputs = await compileFiles({
      '/test.ts': `
        import {Component, Directive} from '@angular/core';

        @Directive({selector: '[non-standalone]', standalone: false})
        export class NonStandaloneDir {}

        @Component({
          selector: 'shape-err-cmp',
          template: '',
          imports: [NonStandaloneDir],
          hostDirectives: 123 as any,
        })
        export class ShapeErrCmp {}
      `,
    });

    const diags = outputs.get('/tsconfig.ngdiag.json')!;
    expect(diags).toBeDefined();
    expect(diags).toContain('"code": 1010');
    expect(diags).toContain('"code": 2011');
  });
});
