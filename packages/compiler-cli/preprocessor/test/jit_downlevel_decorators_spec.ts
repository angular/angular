/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {runPipeline, TestFile} from './utils.js';

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
    expect(content).not.toContain("@Inject('TOKEN')");
    expect(content).not.toContain('@Optional()');
    expect(content).toContain('// @ts-ignore\n  static ctorParameters = (): any => [');
    expect(content).not.toContain("@ViewChild('tpl')");
    expect(content).not.toContain("@Input('aliased')");
    expect(content).not.toContain('@Output()');
    expect(content).toContain('@CustomProp()');
    expect(content).toContain("@Input() 'string-literal-input' = 123;");
    expect(content).toContain('// @ts-ignore\n  static propDecorators: any = {');
    expect(content).not.toContain('string-literal-input:');
    const gsMatches = [...content.matchAll(/\bgs:\s*\[/g)];
    expect(gsMatches.length).toBe(1);
    expect(content).toContain("gs: [{type: Input, args: ['gsAlias']}]");
  });

  it('suppresses TS4114 under noImplicitOverride when a jit: true subclass extends a jit: true base class', async () => {
    const outputs = await compileFiles(
      {
        '/test.ts': `
          import {Component, Input, Inject, Optional} from '@angular/core';

          @Component({
            selector: 'base-jit-cmp',
            template: '',
            jit: true,
          })
          export class BaseJitCmp {
            protected _config = '';

            @Input()
            set config(v: string) {
              this._config = v;
            }

            constructor(@Optional() @Inject('BASE_TOKEN') public baseToken: string) {}
          }

          @Component({
            selector: 'sub-jit-cmp',
            template: '',
            jit: true,
          })
          export class SubJitCmp extends BaseJitCmp {
            @Input()
            override set config(v: string) {
              super.config = v;
            }

            constructor(
              @Optional() @Inject('BASE_TOKEN') baseToken: string,
              @Optional() @Inject('SUB_TOKEN') public subToken: string,
            ) {
              super(baseToken);
            }
          }
        `,
      },
      {
        compilerOptions: {
          noImplicitOverride: true,
        },
      },
    );

    const content = outputs.get('/out/test.ts')!;
    expect([...content.matchAll(/\/\/ @ts-ignore\n  static ctorParameters =/g)].length).toBe(2);
    expect([...content.matchAll(/\/\/ @ts-ignore\n  static propDecorators: any =/g)].length).toBe(
      2,
    );

    const diagnostics = typecheckEmittedTs(content, {noImplicitOverride: true});
    expect(
      diagnostics.map(
        (d) => `TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`,
      ),
    ).toEqual([]);
  });

  it('places /** @nocollapse */ above // @ts-ignore and preserves @nocollapse when Closure Compiler is enabled', async () => {
    const outputs = await compileFiles(
      {
        '/test.ts': `
          import {Component, Input, Inject} from '@angular/core';

          @Component({
            selector: 'closure-jit-cmp',
            template: '',
            jit: true,
          })
          export class ClosureJitCmp {
            @Input() label = '';
            constructor(@Inject('TOKEN') public token: string) {}
          }
        `,
      },
      {
        angularCompilerOptions: {
          annotateForClosureCompiler: true,
        },
      },
    );

    const content = outputs.get('/out/test.ts')!;
    expect(content).toContain(
      '/** @nocollapse */\n  // @ts-ignore\n  static ctorParameters = (): any => [',
    );
    expect(content).toContain(
      '/** @nocollapse */\n  // @ts-ignore\n  static propDecorators: any = {',
    );

    const transpiled = ts.transpileModule(content, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        experimentalDecorators: true,
        removeComments: false,
      },
    });
    expect([...transpiled.outputText.matchAll(/\/\*\* @nocollapse \*\//g)].length).toBe(2);
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

  it('includes both traditional member decorators and signal APIs in static propDecorators for jit: true', async () => {
    const outputs = await compileFiles({
      '/test.ts': `
        import {Component, Input, input, model, output, viewChild, contentChild, ElementRef} from '@angular/core';

        export class ChildCmp {}

        @Component({
          selector: 'mixed-jit-cmp',
          template: '<span></span>',
          jit: true,
        })
        export class MixedJitCmp {
          @Input() legacyInput = '';
          readonly sigInput = input.required<string>();
          readonly sigModel = model(0, {alias: 'modelAlias'});
          readonly sigOut = output<string>();
          readonly child = viewChild.required(ChildCmp);
          readonly projected = contentChild<ElementRef>('proj');
        }
      `,
    });

    const content = outputs.get('/out/test.ts')!;
    expect(content).not.toContain('@Input()');
    expect(content).not.toContain('@i0.Input');
    expect(content).not.toContain('@i0.Output');
    expect(content).not.toContain('@i0.ViewChild');
    expect(content).not.toContain('@i0.ContentChild');
    expect(content).toContain('static propDecorators: any = {');
    expect(content).toContain('legacyInput: [{type: Input}]');
    expect(content).toContain(
      "sigInput: [{type: i0.Input, args: [{isSignal: true, alias: 'sigInput', required: true}]}]",
    );
    expect(content).toContain(
      "sigModel: [{type: i0.Input, args: [{isSignal: true, alias: 'modelAlias', required: false}]}, {type: i0.Output, args: ['modelAliasChange']}]",
    );
    expect(content).toContain("sigOut: [{type: i0.Output, args: ['sigOut']}]");
    expect(content).toContain(
      'child: [{type: i0.ViewChild, args: [i0.forwardRef(() => ChildCmp), {isSignal: true}]}]',
    );
    expect(content).toContain(
      "projected: [{type: i0.ContentChild, args: ['proj', {isSignal: true}]}]",
    );
  });

  it('emits isolatedDeclarations-compatible static fields on exported jit: true classes without TS9017 or TS9007', async () => {
    const outputs = await compileFiles(
      {
        '/test.ts': `
          import {Component, Input, Inject, Optional, ViewChild} from '@angular/core';

          @Component({
            selector: 'jit-isolated-cmp',
            template: '',
            jit: true,
          })
          export class JitIsolatedCmp {
            @ViewChild('container', {static: true}) container: any;
            @Input() label = '';

            constructor(@Optional() @Inject('TOKEN') public token: string) {}
          }
        `,
      },
      {
        compilerOptions: {
          declaration: true,
          isolatedDeclarations: true,
        },
      },
    );

    const content = outputs.get('/out/test.ts')!;
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
    expect(dtsResult.outputText).toContain('static ctorParameters: () => any;');
    expect(dtsResult.outputText).toContain('static propDecorators: any;');
  });

  it('does not trigger TS2417 when a jit: true subclass declares different member decorators than its jit: true base class', async () => {
    const outputs = await compileFiles({
      '/test.ts': `
        import {Component, Input, ViewChild, Inject, Optional} from '@angular/core';

        @Component({
          selector: 'base-cmp',
          template: '',
          jit: true,
        })
        export class BaseCmp {
          @ViewChild('container', {static: true}) container: any;
          constructor(@Optional() @Inject('BASE_TOKEN') public baseToken: string) {}
        }

        @Component({
          selector: 'sub-cmp',
          template: '',
          jit: true,
        })
        export class SubCmp extends BaseCmp {
          @Input() label = '';
          constructor(@Optional() @Inject('BASE_TOKEN') baseToken: string, public count: number) {
            super(baseToken);
          }
        }
      `,
    });

    const content = outputs.get('/out/test.ts')!;
    const diagnostics = typecheckEmittedTs(content, {noImplicitOverride: true});
    expect(
      diagnostics.map(
        (d) => `TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`,
      ),
    ).toEqual([]);
  });

  it('guards forward declaration references in jit: true propDecorators with // @ts-ignore', async () => {
    const outputs = await compileFiles({
      '/test.ts': `
        import {Component, Directive, ViewChild} from '@angular/core';

        @Component({
          selector: 'jit-cmp',
          template: '',
          jit: true,
        })
        export class JitCmp {
          @ViewChild('tpl', {
            static: true,
          })
          tpl: any;

          @ViewChild(ForwardDir) child!: ForwardDir;
        }

        @Directive({
          selector: '[forward-dir]',
          jit: true,
        })
        export class ForwardDir {}
      `,
    });

    const content = outputs.get('/out/test.ts')!;
    expect(content).toContain('child: [{type: ViewChild, args: [// @ts-ignore\nForwardDir]}]');

    const diagnostics = typecheckEmittedTs(content);
    expect(
      diagnostics.map(
        (d) => `TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`,
      ),
    ).toEqual([]);
  });

  it('handles explicit zero-arg constructor vs implicit constructor in jit: true', async () => {
    const source = `
      import {Component, Directive} from '@angular/core';

      @Directive({
        selector: '[empty-ctor-dir]',
        jit: true,
      })
      export class EmptyCtorDir {
        constructor() {}
      }

      @Component({
        selector: 'empty-ctor-cmp',
        template: '',
        jit: true,
      })
      export class EmptyCtorCmp {
        constructor() {}
      }

      @Component({
        selector: 'implicit-ctor-cmp',
        template: '',
        jit: true,
      })
      export class ImplicitCtorCmp {}
    `;

    const outputs = await compileFiles({'/test.ts': source});
    const content = outputs.get('/out/test.ts')!;
    expect(content).not.toContain('static ctorParameters');

    const diagnostics = typecheckEmittedTs(content, {noImplicitOverride: true});
    expect(
      diagnostics.map(
        (d) => `TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`,
      ),
    ).toEqual([]);
  });
});

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

function typecheckEmittedTs(
  emittedContent: string,
  extraCompilerOptions: ts.CompilerOptions = {},
): readonly ts.Diagnostic[] {
  const tsOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ['lib.es2022.d.ts'],
    experimentalDecorators: true,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    types: [],
    ...extraCompilerOptions,
  };

  const virtualSources = new Map<string, string>([
    ['/test.ts', emittedContent],
    [
      '/angular-core.d.ts',
      `
      declare module '@angular/core' {
        export function Component(meta: any): ClassDecorator;
        export function Directive(meta: any): ClassDecorator;
        export function Input(alias?: string): any;
        export function Output(alias?: string): any;
        export function ViewChild(selector: any, opts?: any): any;
        export function Inject(token: any): ParameterDecorator;
        export function Optional(): ParameterDecorator;
      }
      `,
    ],
  ]);

  const baseHost = ts.createCompilerHost(tsOptions, true);
  const host: ts.CompilerHost = {
    ...baseHost,
    fileExists: (fileName) => virtualSources.has(fileName) || baseHost.fileExists(fileName),
    readFile: (fileName) => virtualSources.get(fileName) ?? baseHost.readFile(fileName),
    getSourceFile: (fileName, languageVersion, onError, shouldCreate) => {
      const virtual = virtualSources.get(fileName);
      if (virtual !== undefined) {
        return ts.createSourceFile(fileName, virtual, languageVersion, true);
      }
      return baseHost.getSourceFile(fileName, languageVersion, onError, shouldCreate);
    },
  };

  const program = ts.createProgram(['/test.ts', '/angular-core.d.ts'], tsOptions, host);
  return ts.getPreEmitDiagnostics(program);
}
