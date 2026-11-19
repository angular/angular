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

  it('preserves multiline template literal content inside the ɵsetClassMetadata static block', async () => {
    const outputs = await compileFiles({
      '/test.ts': [
        "import {Component} from '@angular/core';",
        '',
        '@Component({',
        "  selector: 'multiline-cmp',",
        '  template: `<div>',
        '  <span>hello</span>',
        '</div>`,',
        '})',
        'export class MultilineCmp {}',
      ].join('\n'),
    });

    const content = outputs.get('/out/test.ts')!;
    expect(content).toContain('static {');
    expect(content).toContain('template: `<div>\n  <span>hello</span>\n</div>`');
  });

  it('emits ɵsetClassMetadata outside the class when non-Angular member or parameter decorators survive', async () => {
    const outputs = await compileFiles({
      '/test.ts': `
        import {Component} from '@angular/core';

        function Log(): MethodDecorator {
          return (_t, _k, d) => d;
        }
        function ParamDec(): ParameterDecorator {
          return () => {};
        }
        function PropDec(): PropertyDecorator {
          return () => {};
        }

        @Component({selector: 'method-dec-cmp', template: ''})
        export class MethodDecCmp {
          @Log()
          greet() {}
        }

        @Component({selector: 'ctor-param-dec-cmp', template: ''})
        export class CtorParamDecCmp {
          constructor(@ParamDec() _x: unknown) {}
        }

        @Component({selector: 'method-param-dec-cmp', template: ''})
        export class MethodParamDecCmp {
          compute(@ParamDec() x: number) {
            return x;
          }
        }

        @Component({selector: 'declare-prop-dec-cmp', template: ''})
        export class DeclarePropDecCmp {
          @PropDec()
          declare prop: string;
        }
      `,
    });

    const content = outputs.get('/out/test.ts')!;
    expect(content).not.toContain('static {');
    expect(content).toContain('i0.ɵsetClassMetadata(MethodDecCmp,');
    expect(content).toContain('i0.ɵsetClassMetadata(CtorParamDecCmp,');
    expect(content).toContain('i0.ɵsetClassMetadata(MethodParamDecCmp,');
    expect(content).toContain('i0.ɵsetClassMetadata(DeclarePropDecCmp,');
  });

  it('emits ɵsetClassMetadataAsync outside the class when @defer is combined with a non-Angular member decorator', async () => {
    const outputs = await compileFiles({
      '/dep.ts': `
        import {Component} from '@angular/core';
        @Component({selector: 'deferred-dep', template: ''})
        export class DeferredDep {}
      `,
      '/test.ts': `
        import {Component} from '@angular/core';
        import {DeferredDep} from './dep';

        function Log(): MethodDecorator {
          return (_t, _k, d) => d;
        }

        @Component({
          selector: 'defer-cmp',
          imports: [DeferredDep],
          template: '@defer { <deferred-dep /> }',
        })
        export class DeferCmp {
          @Log()
          run() {}
        }
      `,
    });

    const content = outputs.get('/out/test.ts')!;
    expect(content).not.toContain('static {');
    expect(content).toContain('i0.ɵsetClassMetadataAsync(DeferCmp,');
  });

  it('guards private and protected static member accesses when ɵsetClassMetadata moves outside the class without breaking return ASI or hiding invalid accesses', async () => {
    const remoteBaseSource = `
      export class RemoteBase {
        protected static readonly REMOTE_SEL = 'remote-cmp';
      }
    `;
    const outputs = await compileFiles({
      '/remote_base.ts': remoteBaseSource,
      '/test.ts': `
        import {Component, Inject, InjectionToken, Input, signal} from '@angular/core';
        import * as ns from './remote_base';

        function Log(): MethodDecorator {
          return (_t, _k, d) => d;
        }

        const BASE_SEL = Symbol('BASE_SEL');

        export class Base extends ns.RemoteBase {
          protected static readonly BASE_SEL = 'base-cmp';
          private static readonly BASE_PRIV = 'base-priv';
        }

        export namespace LocalNs {
          export class LocalBase {
            protected static readonly LOCAL_NS_SEL = 'local-ns-cmp';
          }
        }

        export class Unrelated {
          private static readonly OTHER_PRIV = 'other-priv';
        }

        @Component({
          selector: Base.BASE_SEL,
          template: '',
          providers: [
            {
              provide: 'SECRET',
              useFactory: (): typeof SubCmp.SECRET => {
                return /* cached */ SubCmp.SECRET;
              },
            },
            {
              provide: 'MULTILINE',
              useFactory: () =>
                SubCmp
                  .SECRET,
            },
            {
              provide: 'THROW_GUARD',
              useFactory: () => {
                throw /* fatal */ SubCmp.ERR;
              },
            },
            {
              provide: 'GEN_SIGNAL',
              useFactory: () => {
                function* gen(): Generator<string, any, string> {
                  const s = signal(yield SubCmp.SECRET);
                  return s;
                }
                return gen;
              },
            },
            {
              provide: 'NS_BASE',
              useFactory: (): typeof ns.RemoteBase.REMOTE_SEL => ns.RemoteBase.REMOTE_SEL,
            },
          ],
        })
        export class SubCmp extends Base {
          // Public computed property with the same identifier name must not shadow Base.BASE_SEL.
          static readonly [BASE_SEL] = 123;
          private static readonly ALIAS = 'myAlias';
          private static readonly SECRET = 'ok';
          private static readonly ERR = new Error('boom');
          private static readonly TOK = new InjectionToken<string>('TOK');

          constructor(@Inject(SubCmp.TOK) readonly injected: string) {
            super();
          }

          @Input(SubCmp.ALIAS) val = '';

          @Log()
          run() {}
        }

        @Component({selector: LocalNs.LocalBase.LOCAL_NS_SEL, template: ''})
        export class LocalNsSubCmp extends LocalNs.LocalBase {
          @Log()
          run() {}
        }
      `,
    });

    const content = outputs.get('/out/test.ts')!;
    expect(content).not.toContain('static {');
    expect(content).toContain('selector: Base.// @ts-ignore\nBASE_SEL');
    expect(content).toContain('args: [SubCmp.// @ts-ignore\nALIAS]');
    expect(content).toContain('args: [SubCmp.// @ts-ignore\nTOK]');
    expect(content).toContain('selector: LocalNs.LocalBase.// @ts-ignore\nLOCAL_NS_SEL');
    // Inside-class `ɵcmp` keeps `return /* cached */ SubCmp.SECRET;` untouched, while
    // outside-class `ɵsetClassMetadata` places `// @ts-ignore` right before `SECRET`.
    expect(content).toContain('return /* cached */ SubCmp.SECRET;');
    expect(content).toContain('return /* cached */ SubCmp.// @ts-ignore\nSECRET;');

    const checkEmitted = (tsContent: string): string[] => {
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
      };
      const virtualSources = new Map<string, string>([
        ['/remote_base.ts', remoteBaseSource],
        ['/test.ts', tsContent],
        [
          '/angular-core.d.ts',
          `
          declare const ngDevMode: boolean;
          declare module '@angular/core' {
            export class InjectionToken<T> { constructor(desc: string); }
            export function Component(meta: any): ClassDecorator;
            export function Inject(token: any): ParameterDecorator;
            export function Input(alias?: string): any;
            export function signal<T>(initialValue: T, options?: {debugName?: string}): () => T;
            export type ɵɵFactoryDeclaration<A, B> = any;
            export type ɵɵComponentDeclaration<A, B, C, D, E, F, G, H, I> = any;
            export const ɵɵInheritDefinitionFeature: any;
            export const ɵɵProvidersFeature: any;
            export function ɵɵgetInheritedFactory(type: any): any;
            export function ɵɵdirectiveInject(token: any): any;
            export function ɵɵdefineComponent(def: any): any;
            export function ɵsetClassMetadata(type: any, decorators: any, ctorParams: any, propDecorators: any): void;
            export function ɵsetClassDebugInfo(type: any, info: any): void;
          }
          `,
        ],
      ]);
      const baseHost = ts.createCompilerHost(tsOptions, true);
      const host: ts.CompilerHost = {
        ...baseHost,
        fileExists: (f) => virtualSources.has(f) || baseHost.fileExists(f),
        readFile: (f) => virtualSources.get(f) ?? baseHost.readFile(f),
        getSourceFile: (f, lang, onError, shouldCreate) => {
          const v = virtualSources.get(f);
          return v !== undefined
            ? ts.createSourceFile(f, v, lang, true)
            : baseHost.getSourceFile(f, lang, onError, shouldCreate);
        },
      };
      const program = ts.createProgram(
        ['/remote_base.ts', '/test.ts', '/angular-core.d.ts'],
        tsOptions,
        host,
      );
      return ts
        .getPreEmitDiagnostics(program)
        .map((d) => `TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
    };

    expect(checkEmitted(content)).toEqual([]);

    // Genuine visibility/property errors (unrelated class private static, base-class private
    // static, or non-existent property matching a private computed `[SYM]` key) must NOT be
    // silenced with `@ts-ignore`.
    const invalidOutputs = await compileFiles({
      '/test.ts': `
        import {Component} from '@angular/core';
        function Log(): MethodDecorator { return (_t, _k, d) => d; }
        const SYM = Symbol('SYM');
        class Other { private static readonly P = []; }
        class Base { private static readonly B = []; }
        @Component({selector: 'bad-cmp', template: '', providers: [Other.P, Base.B, BadCmp.SYM]})
        export class BadCmp extends Base {
          private static readonly [SYM] = [];
          @Log() run() {}
        }
      `,
    });
    const invalidContent = invalidOutputs.get('/out/test.ts')!;
    expect(invalidContent).not.toContain('Other.// @ts-ignore\nP');
    expect(invalidContent).not.toContain('Base.// @ts-ignore\nB');
    expect(invalidContent).not.toContain('BadCmp.// @ts-ignore\nSYM');
    expect(invalidContent).toContain('providers: [Other.P, Base.B, BadCmp.SYM]');
  });
});
