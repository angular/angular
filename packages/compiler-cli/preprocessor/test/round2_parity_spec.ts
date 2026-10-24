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

describe('jit: true Angular member and constructor parameter decorator downleveling', () => {
  it('handles Angular member and constructor parameter decorators for jit: true', async () => {
    const outputs = await compileFiles({
      '/test.ts': `
        import {Component, Input, Output, EventEmitter, Inject, Optional, ViewChild} from '@angular/core';

        function CustomProp(): PropertyDecorator {
          return () => {};
        }

        @Component({
          selector: 'jit-cmp',
          template: '<span></span>',
          jit: true,
        })
        export class JitCmp {
          @ViewChild('tpl') tpl: any;
          @CustomProp()
          @Input('aliased') myInput = '';
          @Output() myOutput = new EventEmitter<void>();
          @Input() 'string-literal-input' = 123;

          private _val = '';
          @Input()
          get gs(): string { return this._val; }
          @Input('gsAlias')
          set gs(v: string) { this._val = v; }

          constructor(@Optional() @Inject('TOKEN') public token: string) {}
        }
      `,
    });

    const content = outputs.get('/out/test.ts')!;
    expect(content).toContain('@Component(');
    expect(content).toContain("@Inject('TOKEN')");
    expect(content).toContain('@Optional()');
    expect(content).toContain('static ctorParameters = (): any => [');
    expect(content).toContain("@ViewChild('tpl')");
    expect(content).toContain("@Input('aliased')");
    expect(content).toContain('@Output()');
    expect(content).toContain('@CustomProp()');
    expect(content).toContain("@Input() 'string-literal-input' = 123;");
    expect(content).not.toContain('static propDecorators = {');
  });

  it('preserves decorators and omits static propDecorators for jit: true when emitDeclarationOnly is true', async () => {
    const outputs = await compileFiles(
      {
        '/test.ts': `
          import {Component, Directive, Input, Inject} from '@angular/core';

          @Directive({selector: '[other-dir]'})
          export class OtherDir {}

          @Component({
            selector: 'jit-cmp',
            template: '',
            jit: true,
          })
          export class JitCmp {
            @Input() myInput = '';
            constructor(@Inject('TOKEN') public token: string) {}
          }
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
    expect(content).toContain('@Input() myInput');
    expect(content).toContain("@Inject('TOKEN')");
    expect(content).not.toContain('static propDecorators');
    expect(content).not.toContain('static ctorParameters');
  });
});
