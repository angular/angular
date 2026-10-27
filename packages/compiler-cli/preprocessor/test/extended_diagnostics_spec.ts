/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  type AST,
  type BoundTarget,
  OutOfBandDiagnosticCategory,
  ParseLocation,
  ParseSourceFile,
  ParseSourceSpan,
  parseTemplate,
  type TcbDirectiveMetadata,
  TmplAstElement,
  type TmplAstNode,
  type TmplAstVariable,
  type TypeCheckId,
} from '@angular/compiler';
import {createAnalyzer} from '../api.js';
import {
  type ExtendedTemplateDiagnosticName,
  verifyExtendedDiagnosticsOptions,
} from '../src/compiler_options.js';
import {type Diagnostic, flattenNgDiagnosticMessage} from '../src/diagnostic.js';
import {
  EXTENDED_ERROR_DETAILS_PAGE_BASE_URL,
  ExtendedTemplateCheckerImpl,
  formatExtendedError,
  type TemplateCheckFactory,
  TemplateCheckWithVisitor,
  type TemplateContext,
} from '../src/extended_diagnostics.js';
import {HybridCompiler, serializeDiagnostics} from '../src/hybrid_compiler.js';
import {OutOfBandDiagnosticRecorderImpl} from '../src/oob.js';
import {buildTypeCheckingConfig, type TcbTargetInput} from '../src/tcb.js';
import {resolveFixtureNodeModules, resolveWasmBinding, runPipeline} from './utils.js';

interface DiagRelatedInformation {
  messageText: string;
  filePath?: string;
  span?: {start: number; end: number};
}

interface DiagEntry {
  filePath?: string;
  category: 'warning' | 'error';
  code: number;
  messageText: string;
  span?: {start: number; end: number};
  relatedInformation?: DiagRelatedInformation[];
}

async function getDiagnosticReport(
  files: Record<string, string>,
  angularCompilerOptions: Record<string, unknown> = {},
): Promise<{optionDiagnostics: DiagEntry[]; diagnostics: DiagEntry[]}> {
  const tsconfig = {
    compilerOptions: {
      strict: true,
      target: 'es2022',
      module: 'es2022',
      moduleResolution: 'bundler',
      experimentalDecorators: true,
    },
    files: Object.keys(files).filter((f) => f.endsWith('.ts')),
    angularCompilerOptions: {
      strictTemplates: true,
      // Suppress unusedStandaloneImports by default unless being tested, so unrelated template tests stay focused.
      extendedDiagnostics: {
        checks: {
          unusedStandaloneImports: 'suppress',
        },
      },
      ...angularCompilerOptions,
    },
  };

  const sourceFiles = [
    {path: '/tsconfig.json', content: JSON.stringify(tsconfig, null, 2)},
    ...Object.entries(files).map(([path, content]) => ({path, content})),
  ];

  const outputs = await runPipeline(sourceFiles, {optimize: true, format: false});
  const diagFile = outputs.find((f) => f.path.endsWith('.ngdiag.json'));
  if (!diagFile) {
    return {optionDiagnostics: [], diagnostics: []};
  }
  const parsed = JSON.parse(diagFile.content);
  return {
    optionDiagnostics: (parsed.optionDiagnostics ?? []) as DiagEntry[],
    diagnostics: (parsed.diagnostics ?? []) as DiagEntry[],
  };
}

async function getDiagnostics(
  files: Record<string, string>,
  angularCompilerOptions: Record<string, unknown> = {},
): Promise<DiagEntry[]> {
  return (await getDiagnosticReport(files, angularCompilerOptions)).diagnostics;
}

async function createIncrementalSession(
  initialFiles: Record<string, string>,
  angularCompilerOptions: Record<string, unknown> = {},
) {
  let currentOptions = angularCompilerOptions;
  const buildTsconfig = (files: Record<string, string>, opts: Record<string, unknown>) => ({
    compilerOptions: {
      strict: true,
      target: 'es2022',
      module: 'es2022',
      moduleResolution: 'bundler',
      experimentalDecorators: true,
    },
    files: Object.keys(files).filter((f) => f.endsWith('.ts')),
    angularCompilerOptions: {
      strictTemplates: true,
      ...opts,
    },
  });

  const virtualFiles: Record<string, string> = {
    '/tsconfig.json': JSON.stringify(buildTsconfig(initialFiles, currentOptions), null, 2),
    ...initialFiles,
  };

  const wasmBinding = resolveWasmBinding();
  const analyzer = await createAnalyzer('/tsconfig.json', {
    backend: 'wasm',
    wasmBinding,
    virtualFiles,
    optimize: true,
    nodeModulesPathOverride: resolveFixtureNodeModules(),
  });

  const compiler = new HybridCompiler(analyzer, {
    optimize: true,
    tsconfigPath: '/tsconfig.json',
    virtualFiles: {},
    tcbConfig: buildTypeCheckingConfig(
      buildTsconfig(initialFiles, currentOptions).angularCompilerOptions,
    ),
  });
  await compiler.init();

  const fileMap = {...initialFiles};

  async function compileCurrent(): Promise<DiagEntry[]> {
    compiler.diagnosticsMap.clear();
    const iterator = compiler.optimize ? compiler.analyzeOptimized() : compiler.analyze();
    for await (const chunk of iterator) {
      const chunkContext = await compiler.prepareChunk(chunk);
      for (const res of chunk.files) {
        const content = fileMap[res.filePath] ?? fileMap['/' + res.filePath.replace(/^\//, '')];
        if (content) {
          await compiler.processFile(res.filePath, content, res, chunkContext);
        }
      }
    }
    const diagContent = serializeDiagnostics('/tsconfig.json', compiler.diagnosticsMap);
    return (JSON.parse(diagContent).diagnostics ?? []) as DiagEntry[];
  }

  return {
    compiler,
    getFile(p: string): string {
      return fileMap[p] ?? '';
    },
    async compileCurrent() {
      return compileCurrent();
    },
    async updateFiles(updates: Record<string, string>, newOptions?: Record<string, unknown>) {
      if (newOptions) {
        currentOptions = newOptions;
        compiler.tcbConfig = buildTypeCheckingConfig(
          buildTsconfig(fileMap, currentOptions).angularCompilerOptions,
        );
      }
      for (const [p, c] of Object.entries(updates)) {
        fileMap[p] = c;
      }
      const updateList = Object.entries(updates).map(([filePath, content]) => ({
        filePath,
        content,
      }));
      await compiler.updateFileContent(updateList);
      return compileCurrent();
    },
    async updateOptions(newOptions: Record<string, unknown>) {
      currentOptions = newOptions;
      compiler.tcbConfig = buildTypeCheckingConfig(
        buildTsconfig(fileMap, currentOptions).angularCompilerOptions,
      );
      return compileCurrent();
    },
    async compileFresh(): Promise<DiagEntry[]> {
      return getDiagnostics(fileMap, currentOptions);
    },
    close() {
      compiler.analyzer.close();
    },
  };
}

describe('extendedDiagnostics configuration validation', () => {
  it('emits NG4003 when strictTemplates is false and extendedDiagnostics is configured', () => {
    const diags = verifyExtendedDiagnosticsOptions({
      strictTemplates: false,
      extendedDiagnostics: {
        defaultCategory: 'warning',
      },
    });
    expect(diags.length).toBe(1);
    expect(diags[0].code).toBe(4003);
    expect(diags[0].messageText).toContain(
      'Angular compiler option "extendedDiagnostics" is configured, however "strictTemplates" is disabled.',
    );
  });

  it('emits NG4004 for invalid defaultCategory or check category', () => {
    const diags = verifyExtendedDiagnosticsOptions({
      strictTemplates: true,
      extendedDiagnostics: {
        defaultCategory: 'invalid' as any,
        checks: {
          invalidBananaInBox: 'loud' as any,
        },
      },
    });
    expect(diags.length).toBe(2);
    expect(diags[0].code).toBe(4004);
    expect(diags[0].messageText).toContain(
      'Angular compiler option "extendedDiagnostics.defaultCategory" has an unknown diagnostic category: "invalid".',
    );
    expect(diags[1].code).toBe(4004);
    expect(diags[1].messageText).toContain(
      'Angular compiler option "extendedDiagnostics.checks[\'invalidBananaInBox\']" has an unknown diagnostic category: "loud".',
    );
  });

  it('emits NG4004 for empty string or non-string category values', () => {
    const emptyDiags = verifyExtendedDiagnosticsOptions({
      strictTemplates: true,
      extendedDiagnostics: {
        defaultCategory: '' as any,
        checks: {
          invalidBananaInBox: '' as any,
        },
      },
    });
    expect(emptyDiags.length).toBe(2);
    expect(emptyDiags[0].code).toBe(4004);
    expect(emptyDiags[0].messageText).toContain(
      'Angular compiler option "extendedDiagnostics.defaultCategory" has an unknown diagnostic category: "".',
    );
    expect(emptyDiags[1].code).toBe(4004);
    expect(emptyDiags[1].messageText).toContain(
      'Angular compiler option "extendedDiagnostics.checks[\'invalidBananaInBox\']" has an unknown diagnostic category: "".',
    );

    const numberDiags = verifyExtendedDiagnosticsOptions({
      strictTemplates: true,
      extendedDiagnostics: {
        defaultCategory: 123 as any,
        checks: {
          invalidBananaInBox: 123 as any,
        },
      },
    });
    expect(numberDiags.length).toBe(2);
    expect(numberDiags[0].code).toBe(4004);
    expect(numberDiags[0].messageText).toContain(
      'Angular compiler option "extendedDiagnostics.defaultCategory" has an unknown diagnostic category: "123".',
    );
    expect(numberDiags[1].code).toBe(4004);
    expect(numberDiags[1].messageText).toContain(
      'Angular compiler option "extendedDiagnostics.checks[\'invalidBananaInBox\']" has an unknown diagnostic category: "123".',
    );
  });

  it('emits NG4005 for unknown check name', () => {
    const diags = verifyExtendedDiagnosticsOptions({
      strictTemplates: true,
      extendedDiagnostics: {
        checks: {
          notARealCheck: 'warning',
        },
      },
    });
    expect(diags.length).toBe(1);
    expect(diags[0].code).toBe(4005);
    expect(diags[0].messageText).toContain(
      'Angular compiler option "extendedDiagnostics.checks" has an unknown check: "notARealCheck".',
    );
  });

  it('separates optionDiagnostics from per-file diagnostics and disables extendedTemplateChecker, templateSemanticsChecker, and sourceFileValidator on config error', async () => {
    const report = await getDiagnosticReport(
      {
        '/app.ts': `
          import {Component, Directive, input} from '@angular/core';

          @Directive({selector: '[unused]'})
          export class UnusedDir {}

          const illegalTopLevelInput = input(0);

          @Component({
            selector: 'app-root',
            imports: [UnusedDir],
            template: \`
              <div ([thing])="bar"></div>
              @for (item of items; track item) {
                <button (click)="item = 2"></button>
              }
            \`,
          })
          export class App {
            bar = 1;
            items = [1];
            req = input.required<string>();
            constructor() {
              this.req();
            }
          }
        `,
      },
      {
        strictTemplates: true,
        extendedDiagnostics: {
          defaultCategory: 'invalid' as any,
        },
      },
    );
    expect(report.diagnostics).toEqual([]);
    expect(report.optionDiagnostics.length).toBe(1);
    expect(report.optionDiagnostics[0].code).toBe(4004);
  });

  it('separates NG4003 into optionDiagnostics when strictTemplates is false alongside extendedDiagnostics', async () => {
    const report = await getDiagnosticReport(
      {
        '/service.ts': `
          import {Injectable, input} from '@angular/core';

          const illegalCall = input(0);

          @Injectable({providedIn: 'root'})
          export class MyService {}
        `,
      },
      {
        strictTemplates: false,
        extendedDiagnostics: {
          defaultCategory: 'error',
          checks: {
            optionalChainNotNullable: 'suppress',
          },
        },
      },
    );
    expect(report.diagnostics).toEqual([]);
    expect(report.optionDiagnostics.length).toBe(1);
    expect(report.optionDiagnostics[0].code).toBe(4003);
  });

  it('keeps diagnostics anchored on .d.ts files out of .ngdiag.json but in diagnosticsMap', async () => {
    const session = await createIncrementalSession({
      '/app.ts': `
        import {NgModule} from '@angular/core';

        @NgModule({
          imports: [NgModule],
        })
        export class MyModule {}
      `,
    });
    try {
      expect(await session.compileCurrent()).toEqual([]);

      const collected = [...session.compiler.diagnosticsMap.values()].flat();
      expect(collected.length).toBe(1);
      expect(collected[0].code).toBe(1010);
      expect(collected[0].filePath).toMatch(/\.d\.ts$/);
      expect(collected[0].filePath).not.toBe('/app.ts');
      expect(flattenNgDiagnosticMessage(collected[0])).toContain(
        'Value at position 0 in the NgModule.imports of MyModule is not a class',
      );
      expect(flattenNgDiagnosticMessage(collected[0])).toContain(
        "Value is a reference to 'NgModule'.",
      );
    } finally {
      session.close();
    }
  });
});

describe('extended template diagnostics', () => {
  it('NG8101: invalidBananaInBox', async () => {
    const diags = await getDiagnostics({
      '/app.ts': `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-root',
          template: '<div ([thing])="bar"></div>',
        })
        export class App {
          bar = 1;
        }
      `,
    });
    expect(diags.length).toBe(1);
    expect(diags[0]).toEqual(
      jasmine.objectContaining({
        code: 8101,
        category: 'warning',
      }),
    );
    expect(diags[0].messageText).toContain(
      `NG8101: In the two-way binding syntax the parentheses should be inside the brackets, ex. '[(thing)]="bar"'.`,
    );
  });

  it('supports defaultCategory and per-check category overrides (error and suppress)', async () => {
    const errorDiags = await getDiagnostics(
      {
        '/app.ts': `
          import {Component} from '@angular/core';
          @Component({
            selector: 'app-root',
            template: '<div ([thing])="bar"></div>',
          })
          export class App {
            bar = 1;
          }
        `,
      },
      {
        extendedDiagnostics: {
          defaultCategory: 'error',
        },
      },
    );
    expect(errorDiags.length).toBe(1);
    expect(errorDiags[0]).toEqual(
      jasmine.objectContaining({
        code: 8101,
        category: 'error',
      }),
    );

    const suppressedDiags = await getDiagnostics(
      {
        '/app.ts': `
          import {Component} from '@angular/core';
          @Component({
            selector: 'app-root',
            template: '<div ([thing])="bar"></div>',
          })
          export class App {
            bar = 1;
          }
        `,
      },
      {
        extendedDiagnostics: {
          defaultCategory: 'error',
          checks: {
            invalidBananaInBox: 'suppress',
          },
        },
      },
    );
    expect(suppressedDiags).toEqual([]);
  });

  it('NG8103: missingControlFlowDirective on standalone component', async () => {
    const diags = await getDiagnostics({
      '/app.ts': `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-root',
          template: '<div *ngIf="cond"></div><div *ngFor="let x of items"></div>',
        })
        export class App {
          cond = true;
          items = [1, 2];
        }
      `,
    });
    const ng8103 = diags.filter((d) => d.code === 8103);
    expect(ng8103.length).toBe(2);
    expect(ng8103[0].messageText).toContain(
      'The `*ngIf` directive was used in the template, but neither the `NgIf` directive nor the `CommonModule` was imported.',
    );
    expect(ng8103[1].messageText).toContain(
      'The `*ngFor` directive was used in the template, but neither the `NgFor` directive nor the `CommonModule` was imported.',
    );
  });

  it('NG8104: textAttributeNotBinding for attr., class., and style.', async () => {
    const diags = await getDiagnostics({
      '/app.ts': `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-root',
          template: '<div attr.id="my-id" class.large="true" style.margin="10px"></div>',
        })
        export class App {}
      `,
    });
    expect(diags.length).toBe(3);
    expect(diags[0].code).toBe(8104);
    expect(diags[0].messageText).toContain(
      `Static attributes should be written without the 'attr.' prefix. For example, id="my-id".`,
    );
    expect(diags[1].code).toBe(8104);
    expect(diags[1].messageText).toContain(
      `NG8104: Attribute, style, and class bindings should be enclosed with square braces. For example, '[class.large]="true"'.`,
    );
    expect(diags[2].code).toBe(8104);
    expect(diags[2].messageText).toContain(
      `NG8104: Attribute, style, and class bindings should be enclosed with square braces. For example, '[style.margin]="'10px'"'.`,
    );
  });

  it('NG8105: missingNgForOfLet', async () => {
    const diags = await getDiagnostics({
      '/app.ts': `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-root',
          template: '<div *ngFor="items"></div>',
          standalone: false,
        })
        export class App {
          items = [1, 2];
        }
      `,
    });
    expect(diags.length).toBe(1);
    expect(diags[0].code).toBe(8105);
    expect(diags[0].messageText).toContain(
      'NG8105: Your ngFor is missing a value. Did you forget to add the `let` keyword? Find more at',
    );
  });

  it('NG8106: suffixNotSupported on attribute bindings', async () => {
    const diags = await getDiagnostics({
      '/app.ts': `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-root',
          template: '<div [attr.width.px]="10" [style.width.px]="10"></div>',
        })
        export class App {}
      `,
    });
    expect(diags.length).toBe(1);
    expect(diags[0].code).toBe(8106);
    expect(diags[0].messageText).toContain(
      `NG8106: The '.px', '.%', '.em' suffixes are only supported on style bindings.`,
    );
  });

  it('NG8108: skipHydrationNotStatic', async () => {
    const diags = await getDiagnostics({
      '/app.ts': `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-root',
          template: '<div [ngSkipHydration]="true"></div><div ngSkipHydration="false"></div><div ngSkipHydration="true"></div><div ngSkipHydration></div>',
        })
        export class App {}
      `,
    });
    const ng8108 = diags.filter((d) => d.code === 8108);
    expect(ng8108.length).toBe(2);
    expect(ng8108[0].messageText).toContain(
      'NG8108: ngSkipHydration should not be used as a binding.',
    );
    expect(ng8108[1].messageText).toContain(
      `NG8108: ngSkipHydration only accepts "true" or "" as value or no value at all. For example 'ngSkipHydration="true"' or 'ngSkipHydration'.`,
    );
  });

  it('NG8111: uninvokedFunctionInEventBinding for arrow functions', async () => {
    const diags = await getDiagnostics({
      '/app.ts': `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-root',
          template: '<button (click)="() => onClick()"></button>',
        })
        export class App {
          onClick() {}
        }
      `,
    });
    expect(diags.length).toBe(1);
    expect(diags[0]).toEqual(
      jasmine.objectContaining({
        code: 8111,
        messageText:
          'Arrow function will not be invoked in this event listener. Did you intend to call a method?',
      }),
    );
  });

  it('NG8112: unusedLetDeclaration', async () => {
    const diags = await getDiagnostics({
      '/app.ts': `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-root',
          template: '@let unused = 1; @let used = 2; {{ used }}',
        })
        export class App {}
      `,
    });
    expect(diags.length).toBe(1);
    expect(diags[0].code).toBe(8112);
    expect(diags[0].messageText).toContain(
      'NG8112: @let unused is declared but its value is never read.',
    );
  });

  it('NG8114: unparenthesizedNullishCoalescing', async () => {
    const diags = await getDiagnostics({
      '/app.ts': `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-root',
          template: '{{ a ?? b && c }} {{ (a ?? b) && c }}',
        })
        export class App {
          a: string | null = null;
          b = true;
          c = 'hello';
        }
      `,
    });
    expect(diags.length).toBe(1);
    expect(diags[0].code).toBe(8114);
    expect(diags[0].messageText).toContain(
      `NG8114: Parentheses are required to disambiguate precedence when mixing '??' with '&&' and '||'.`,
    );
  });

  it('NG8116: missingStructuralDirective on standalone component', async () => {
    const diags = await getDiagnostics({
      '/app.ts': `
        import {Component, Directive} from '@angular/core';
        @Directive({selector: '[usedDir]'})
        export class UsedDir {}

        @Component({
          selector: 'app-root',
          imports: [UsedDir],
          template: '<div *customDir="true"></div><div *usedDir></div>',
        })
        export class App {}
      `,
    });
    const ng8116 = diags.filter((d) => d.code === 8116);
    expect(ng8116.length).toBe(1);
    expect(ng8116[0].messageText).toContain(
      'NG8116: A structural directive `customDir` was used in the template without a corresponding import in the component.',
    );
  });

  it('NG8021: deferTriggerMisconfiguration', async () => {
    const diags = await getDiagnostics({
      '/app.ts': `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-root',
          template: \`
            @defer (on immediate; on timer(100ms)) {
              <div>1a</div>
            }
            @defer (on immediate; prefetch on idle) {
              <div>1b</div>
            }
            @defer (prefetch on idle) {
              <div>2</div>
            }
            @defer (on timer(100ms); prefetch on timer(200ms)) {
              <div>3</div>
            }
            @defer (on hover; prefetch on hover) {
              <div>4</div>
            } @placeholder {
              <button>hover</button>
            }
            @defer (on viewport({trigger: el, rootMargin: '10px'}); prefetch on viewport({trigger: el, rootMargin: '10px'})) {
              <div>5</div>
            }
            @defer (on viewport({trigger: el, rootMargin: '10px'}); prefetch on viewport({trigger: el, rootMargin: '20px'})) {
              <div>6</div>
            }
            <div #el>target</div>
          \`,
        })
        export class App {}
      `,
    });
    const ng8021 = diags.filter((d) => d.code === 8021);
    expect(ng8021.length).toBe(6);
    expect(ng8021[0].messageText).toContain(
      `NG8021: The 'immediate' trigger makes additional triggers redundant.`,
    );
    expect(ng8021[1].messageText).toContain(
      `NG8021: Prefetch triggers have no effect because 'immediate' executes earlier.`,
    );
    expect(ng8021[2].messageText).toContain(
      `NG8021: Define a main trigger when using 'prefetch' triggers.`,
    );
    expect(ng8021[3].messageText).toContain(
      `NG8021: The Prefetch 'timer(200ms)' is not scheduled before the main 'timer(100ms)', so it won't run prior to rendering.`,
    );
    expect(ng8021[4].messageText).toContain(
      `NG8021: Prefetch 'hover' matches the main trigger and provides no benefit. Remove the prefetch modifier.`,
    );
    expect(ng8021[5].messageText).toContain(
      `NG8021: Prefetch 'viewport' matches the main trigger and provides no benefit. Remove the prefetch modifier.`,
    );
  });

  it('NG8021: reports distinct warnings at the same span for combined defer triggers', async () => {
    const diags = await getDiagnostics({
      '/app.ts': `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-root',
          template: \`
            @defer (on immediate; on timer(100ms); prefetch on idle) {
              <div>combined</div>
            }
          \`,
        })
        export class App {}
      `,
    });
    const ng8021 = diags.filter((d) => d.code === 8021);
    expect(ng8021.length).toBe(2);
    expect(ng8021[0].category).toBe('warning');
    expect(ng8021[1].category).toBe('warning');
    expect(ng8021[0].span).toEqual(ng8021[1].span);
    expect(ng8021[0].messageText).toContain(
      `NG8021: The 'immediate' trigger makes additional triggers redundant.`,
    );
    expect(ng8021[1].messageText).toContain(
      `NG8021: Prefetch triggers have no effect because 'immediate' executes earlier.`,
    );
  });

  it('throws on defer reference trigger with no target name and no placeholder in local mode', async () => {
    const files = [
      {
        path: '/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {strict: true, target: 'es2022', module: 'es2022'},
          files: ['/app.ts'],
        }),
      },
      {
        path: '/app.ts',
        content: `
          import {Component} from '@angular/core';
          @Component({
            selector: 'app-root',
            template: \`
              @defer (on hover) {
                <div>Deferred</div>
              }
            \`,
          })
          export class App {}
        `,
      },
    ];
    const errors: string[] = [];
    await runPipeline(files, {optimize: false, format: false, errors});
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain(
      'defer on trigger with no target name must have a placeholder block',
    );
  });

  it('NG8005: write to read-only template variable in event binding', async () => {
    const diags = await getDiagnostics({
      '/app.ts': `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-root',
          template: \`
            @for (item of items; track item) {
              <button (click)="item = 2"></button>
              <button (click)="item++"></button>
              <button (click)="--item"></button>
              <button (click)="(item)++"></button>
              <button (click)="item!++"></button>
              <button (click)="other = item++"></button>
            }
          \`,
        })
        export class App {
          items = [1];
          other = 0;
        }
      `,
    });
    expect(diags.length).toBe(6);
    for (const diag of diags) {
      expect(diag).toEqual(
        jasmine.objectContaining({
          code: 8005,
          category: 'error',
          messageText:
            "Cannot use variable 'item' as the left-hand side of an assignment expression. Template variables are read-only.",
          relatedInformation: [
            jasmine.objectContaining({
              messageText: "'item' is declared here.",
            }),
          ],
        }),
      );
    }
  });

  it('NG8005: reports related information with external template path and mapped offsets', async () => {
    const templateContent = `
      @for (item of items; track item) {
        <button (click)="item = 2"></button>
      }
    `;
    const diags = await getDiagnostics({
      '/app.html': templateContent,
      '/app.ts': `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-root',
          templateUrl: './app.html',
        })
        export class App {
          items = [1];
        }
      `,
    });
    expect(diags.length).toBe(1);
    expect(diags[0]).toEqual(
      jasmine.objectContaining({
        code: 8005,
        category: 'error',
        filePath: '/app.html',
        messageText:
          "Cannot use variable 'item' as the left-hand side of an assignment expression. Template variables are read-only.",
        relatedInformation: [
          jasmine.objectContaining({
            filePath: '/app.html',
            messageText: "'item' is declared here.",
          }),
          jasmine.objectContaining({
            filePath: '/app.ts',
            messageText: 'Error occurs in the template of component App.',
          }),
        ],
      }),
    );
    expect(diags[0].span).toBeDefined();
    expect(diags[0].relatedInformation![0].span).toBeDefined();
    expect(
      templateContent.slice(
        diags[0].relatedInformation![0].span!.start,
        diags[0].relatedInformation![0].span!.end,
      ),
    ).toBe('item');
  });

  it('runs templateSemanticsChecker (NG8005) and unusedStandaloneImports (NG8113) even when strictTemplates is false, but skips extendedTemplateChecker', async () => {
    const diags = await getDiagnostics(
      {
        '/app.ts': `
          import {Component, Directive} from '@angular/core';
          @Directive({selector: '[unusedDir]'})
          export class UnusedDir {}

          @Component({
            selector: 'app-root',
            imports: [UnusedDir],
            template: \`
              <div ([thing])="bar"></div>
              @for (item of items; track item) {
                <button (click)="item = 2"></button>
              }
            \`,
          })
          export class App {
            bar = 1;
            items = [1];
          }
        `,
      },
      {
        strictTemplates: false,
        extendedDiagnostics: undefined,
      },
    );
    expect(diags.some((d) => d.code === 8005)).toBeTrue();
    expect(diags.some((d) => d.code === 8113)).toBeTrue();
    expect(diags.some((d) => d.code === 8101)).toBeFalse();
  });

  it('formatExtendedError formats codes with and without messages consistently', () => {
    expect(formatExtendedError(8101)).toBe(
      `NG8101. Find more at ${EXTENDED_ERROR_DETAILS_PAGE_BASE_URL}/NG8101`,
    );
    expect(formatExtendedError(8101, null)).toBe(
      `NG8101. Find more at ${EXTENDED_ERROR_DETAILS_PAGE_BASE_URL}/NG8101`,
    );
    expect(formatExtendedError(8101, false)).toBe(
      `NG8101. Find more at ${EXTENDED_ERROR_DETAILS_PAGE_BASE_URL}/NG8101`,
    );
    expect(formatExtendedError(8101, 'No trailing punctuation')).toBe(
      `NG8101: No trailing punctuation. Find more at ${EXTENDED_ERROR_DETAILS_PAGE_BASE_URL}/NG8101`,
    );
    expect(formatExtendedError(8101, 'Has trailing punctuation!')).toBe(
      `NG8101: Has trailing punctuation! Find more at ${EXTENDED_ERROR_DETAILS_PAGE_BASE_URL}/NG8101`,
    );
  });

  it('NG8113: unusedStandaloneImports reports all unused or individual unused imports', async () => {
    const sharedCode = `import {Directive} from '@angular/core';
import {DirA} from './app';

@Directive({selector: '[dirShared]'})
export class DirShared {}

export const EXTERNAL_SHARED = [DirShared, DirA];
`;
    const appCode = `import {Component, Directive, Pipe} from '@angular/core';
import {EXTERNAL_SHARED} from './shared';

@Directive({selector: '[dirA]'})
export class DirA {}

@Directive({selector: '[dirB]'})
export class DirB {}

@Pipe({name: 'pipeA'})
export class PipeA {
  transform(v: unknown) { return v; }
}

export const SHARED_DIRS = [DirB];

@Component({
  selector: 'all-unused',
  imports: [DirA, PipeA],
  template: '<div>hello</div>',
})
export class AllUnusedComp {}

@Component({
  selector: 'one-unused',
  imports: [DirA, DirB, PipeA],
  template: '<div dirA>hello</div>',
})
export class OneUnusedComp {}

@Component({
  selector: 'shared-array',
  imports: [SHARED_DIRS],
  template: '<div>hello</div>',
})
export class SharedArrayComp {}

@Component({
  selector: 'external-shared-plus-direct',
  imports: [EXTERNAL_SHARED, DirA],
  template: '<div>hello</div>',
})
export class ExternalSharedPlusDirectComp {}
`;
    const diags = await getDiagnostics(
      {'/shared.ts': sharedCode, '/app.ts': appCode},
      {
        extendedDiagnostics: {
          checks: {
            unusedStandaloneImports: 'warning',
          },
        },
      },
    );
    expect(diags.length).toBe(4);
    expect(diags[0]).toEqual(
      jasmine.objectContaining({
        code: 8113,
        messageText: 'All imports are unused',
      }),
    );
    expect(appCode.slice(diags[0].span!.start, diags[0].span!.end)).toBe('imports');

    expect(diags[1]).toEqual(
      jasmine.objectContaining({
        code: 8113,
        messageText: 'DirB is not used within the template of OneUnusedComp',
      }),
    );
    expect(appCode.slice(diags[1].span!.start, diags[1].span!.end)).toBe('DirB');

    expect(diags[2]).toEqual(
      jasmine.objectContaining({
        code: 8113,
        messageText: 'PipeA is not used within the template of OneUnusedComp',
      }),
    );
    expect(appCode.slice(diags[2].span!.start, diags[2].span!.end)).toBe('PipeA');

    expect(diags[3]).toEqual(
      jasmine.objectContaining({
        code: 8113,
        messageText: 'DirA is not used within the template of ExternalSharedPlusDirectComp',
      }),
    );
    expect(appCode.slice(diags[3].span!.start, diags[3].span!.end)).toBe('DirA');
  });

  it('NG8113: reports single-directive alias variables and imports with conditional expressions', async () => {
    const extCode = `import {Directive} from '@angular/core';
@Directive({selector: '[extUnused]'})
export class ExtUnusedDir {}
`;
    const appCode = `import {Component, Directive} from '@angular/core';
import {ExtUnusedDir} from './ext';

@Directive({selector: '[used]'})
export class UsedDir {}

@Directive({selector: '[other]'})
export class OtherDir {}

@Directive({selector: '[localUnused]'})
export class LocalUnusedDir {}

const Alias = ExtUnusedDir;
export const ExportedAlias = LocalUnusedDir;
const cond = true;

@Component({
  selector: 'alias-comp',
  imports: [UsedDir, Alias, ExportedAlias],
  template: '<div used></div>',
})
export class AliasComp {}

@Component({
  selector: 'cond-comp',
  imports: [cond ? UsedDir : OtherDir, LocalUnusedDir, UsedDir],
  template: '<div used></div>',
})
export class CondComp {}
`;
    const diags = await getDiagnostics(
      {'/ext.ts': extCode, '/app.ts': appCode},
      {
        extendedDiagnostics: {
          checks: {
            unusedStandaloneImports: 'warning',
          },
        },
      },
    );
    expect(diags.length).toBe(3);

    expect(diags[0]).toEqual(
      jasmine.objectContaining({
        code: 8113,
        messageText: 'ExtUnusedDir is not used within the template of AliasComp',
      }),
    );
    expect(appCode.slice(diags[0].span!.start, diags[0].span!.end)).toBe('Alias');

    expect(diags[1]).toEqual(
      jasmine.objectContaining({
        code: 8113,
        messageText: 'LocalUnusedDir is not used within the template of AliasComp',
      }),
    );
    expect(appCode.slice(diags[1].span!.start, diags[1].span!.end)).toBe('ExportedAlias');

    expect(diags[2]).toEqual(
      jasmine.objectContaining({
        code: 8113,
        messageText: 'LocalUnusedDir is not used within the template of CondComp',
      }),
    );
    expect(appCode.slice(diags[2].span!.start, diags[2].span!.end)).toBe('LocalUnusedDir');
  });

  it('NG8113: supports direct unusedStandaloneImports configuration overrides (warning, error, suppress)', async () => {
    const files = {
      '/app.ts': `
        import {Component, Directive} from '@angular/core';
        @Directive({selector: '[dir]'})
        export class Dir {}

        @Component({
          selector: 'app-root',
          imports: [Dir],
          template: '<div>Hello</div>',
        })
        export class App {}
      `,
    };

    const warningDiags = await getDiagnostics(files, {
      unusedStandaloneImports: 'warning',
    });
    expect(warningDiags.length).toBe(1);
    expect(warningDiags[0].code).toBe(8113);
    expect(warningDiags[0].category).toBe('warning');

    const errorDiags = await getDiagnostics(files, {
      unusedStandaloneImports: 'error',
    });
    expect(errorDiags.length).toBe(1);
    expect(errorDiags[0].code).toBe(8113);
    expect(errorDiags[0].category).toBe('error');

    const suppressDiags = await getDiagnostics(files, {
      unusedStandaloneImports: 'suppress',
    });
    expect(suppressDiags.length).toBe(0);
  });

  it('NG8113: edit/fix parity test reusing compiler across used -> unused -> used imports with fresh compilation comparisons', async () => {
    const barrelCode = `
      // 🌍 Barrel exports with Unicode comment: 🚀
      export {DirA} from './dir_a';
      export {DirB} from './dir_b';
      export {DirUsed} from './dir_used';
    `;
    const dirUsedCode = `
      import {Directive} from '@angular/core';
      @Directive({selector: '[dirUsed]'})
      export class DirUsed {}
    `;
    const dirACode = `
      import {Directive} from '@angular/core';
      @Directive({selector: '[dirA]'})
      export class DirA {}
    `;
    const dirBCode = `
      import {Directive} from '@angular/core';
      @Directive({selector: '[dirB]'})
      export class DirB {}
    `;
    const externalHtmlUsed = `<div dirUsed dirB>External template content</div>`;
    const appCodeUsed = `
      // 🌟 Unicode characters before reported span: 你好世界 🎉 12345
      import {Component} from '@angular/core';
      import {DirA, DirB, DirUsed} from './barrel';

      @Component({
        selector: 'inline-comp',
        imports: [DirUsed, DirA],
        template: '<div dirUsed dirA>Inline template</div>',
      })
      export class InlineComp {}

      @Component({
        selector: 'external-comp',
        imports: [DirUsed, DirB],
        templateUrl: './app.html',
      })
      export class ExternalComp {}
    `;

    const initialFiles = {
      '/barrel.ts': barrelCode,
      '/dir_used.ts': dirUsedCode,
      '/dir_a.ts': dirACode,
      '/dir_b.ts': dirBCode,
      '/app.html': externalHtmlUsed,
      '/app.ts': appCodeUsed,
    };

    const session = await createIncrementalSession(initialFiles, {
      extendedDiagnostics: {
        checks: {
          unusedStandaloneImports: 'warning',
        },
      },
    });

    try {
      // Phase 1: All imports used initially -> 0 diagnostics in both reused & fresh compilations
      const p1Reused = await session.compileCurrent();
      const p1Fresh = await session.compileFresh();
      expect(p1Reused).toEqual(p1Fresh);
      expect(p1Reused.length).toBe(0);

      // Phase 2: Edit inline template removing usage -> used to unused transition
      const appCodeUnused = `
        // 🌟 Unicode characters before reported span: 你好世界 🎉 12345
        import {Component} from '@angular/core';
        import {DirA, DirB, DirUsed} from './barrel';

        @Component({
          selector: 'inline-comp',
          imports: [DirUsed, DirA],
          template: '<div dirUsed>Inline template without directive</div>',
        })
        export class InlineComp {}

        @Component({
          selector: 'external-comp',
          imports: [DirUsed, DirB],
          templateUrl: './app.html',
        })
        export class ExternalComp {}
      `;
      const p2Reused = await session.updateFiles({'/app.ts': appCodeUnused});
      const p2Fresh = await session.compileFresh();
      expect(p2Reused).toEqual(p2Fresh);
      expect(p2Reused.length).toBe(1);
      expect(p2Reused[0]).toEqual(
        jasmine.objectContaining({
          code: 8113,
          category: 'warning',
          messageText: 'DirA is not used within the template of InlineComp',
          filePath: '/app.ts',
        }),
      );
      expect(p2Reused[0].span).toBeDefined();
      expect(p2Reused[0].relatedInformation).toBeUndefined();
      expect(appCodeUnused.slice(p2Reused[0].span!.start, p2Reused[0].span!.end)).toBe('DirA');

      // Phase 3: Selector change in dir_b from '[dirB]' to '[dirBChanged]' makes external template import unused
      const dirBCodeChangedSelector = `
        import {Directive} from '@angular/core';
        @Directive({selector: '[dirBChanged]'})
        export class DirB {}
      `;
      const p3Reused = await session.updateFiles({'/dir_b.ts': dirBCodeChangedSelector});
      const p3Fresh = await session.compileFresh();
      expect(p3Reused).toEqual(p3Fresh);
      expect(p3Reused.length).toBe(2);
      expect(p3Reused).toContain(
        jasmine.objectContaining({
          code: 8113,
          category: 'warning',
          messageText: 'DirA is not used within the template of InlineComp',
          filePath: '/app.ts',
        }),
      );
      expect(p3Reused).toContain(
        jasmine.objectContaining({
          code: 8113,
          category: 'warning',
          messageText: 'DirB is not used within the template of ExternalComp',
          filePath: '/app.ts',
        }),
      );
      const dirBDiag = p3Reused.find((d) => d.messageText.includes('DirB'))!;
      expect(appCodeUnused.slice(dirBDiag.span!.start, dirBDiag.span!.end)).toBe('DirB');

      // Phase 4: Diagnostic configuration changes: upgrade warning -> error, then suppress
      const p4ErrorReused = await session.updateOptions({
        extendedDiagnostics: {
          checks: {
            unusedStandaloneImports: 'error',
          },
        },
      });
      const p4ErrorFresh = await session.compileFresh();
      expect(p4ErrorReused).toEqual(p4ErrorFresh);
      expect(p4ErrorReused.length).toBe(2);
      expect(p4ErrorReused[0].category).toBe('error');
      expect(p4ErrorReused[1].category).toBe('error');

      const p4SuppressReused = await session.updateOptions({
        extendedDiagnostics: {
          checks: {
            unusedStandaloneImports: 'suppress',
          },
        },
      });
      const p4SuppressFresh = await session.compileFresh();
      expect(p4SuppressReused).toEqual(p4SuppressFresh);
      expect(p4SuppressReused.length).toBe(0);

      // Phase 5: Fix both files and restore warning category -> unused to used transition
      const p5Reused = await session.updateFiles(
        {
          '/app.ts': appCodeUsed,
          '/dir_b.ts': dirBCode,
        },
        {
          extendedDiagnostics: {
            checks: {
              unusedStandaloneImports: 'warning',
            },
          },
        },
      );
      const p5Fresh = await session.compileFresh();
      expect(p5Reused).toEqual(p5Fresh);
      expect(p5Reused.length).toBe(0);
    } finally {
      session.close();
    }
  });

  it('NG10002: suboptimalTypeInference uses error code 10002', () => {
    const recorder = new OutOfBandDiagnosticRecorderImpl();
    const file = new ParseSourceFile('let x', '/app.ts');
    const span = new ParseSourceSpan(
      new ParseLocation(file, 0, 0, 0),
      new ParseLocation(file, 5, 0, 5),
    );
    const fakeVar = {
      name: 'x',
      value: '$implicit',
      keySpan: span,
      sourceSpan: span,
    } as unknown as TmplAstVariable;
    recorder.suboptimalTypeInference('tcb1' as TypeCheckId, [fakeVar]);
    expect(recorder.diagnostics.length).toBe(1);
    expect(recorder.diagnostics[0].code).toBe(10002);
    expect(recorder.diagnostics[0].category).toBe(OutOfBandDiagnosticCategory.Warning);
  });

  it('supports defining custom TemplateCheckWithVisitor and TemplateCheckFactory via ExtendedTemplateCheckerImpl', () => {
    class NoMarqueeElementCheck extends TemplateCheckWithVisitor<8999> {
      override code = 8999 as const;

      override visitNode(
        ctx: TemplateContext<8999>,
        _component: TcbTargetInput,
        node: TmplAstNode | AST,
      ): Diagnostic[] {
        if (node instanceof TmplAstElement && node.name === 'marquee') {
          return [ctx.makeTemplateDiagnostic(node.sourceSpan, '<marquee> is not allowed.')];
        }
        return [];
      }
    }

    const customFactory: TemplateCheckFactory<8999, ExtendedTemplateDiagnosticName> = {
      code: 8999,
      name: 'invalidBananaInBox',
      create: () => new NoMarqueeElementCheck(),
    };

    const {nodes} = parseTemplate('<marquee></marquee>', '/app.ts');

    const checker = new ExtendedTemplateCheckerImpl([customFactory], {
      extendedDiagnostics: {defaultCategory: 'error'},
    });
    const diags = checker.getDiagnosticsForComponent(
      'tcb1' as TypeCheckId,
      {templateNodes: nodes} as unknown as TcbTargetInput,
      {} as unknown as BoundTarget<TcbDirectiveMetadata>,
    );
    expect(diags).toEqual([
      {
        typeCheckId: 'tcb1' as TypeCheckId,
        category: OutOfBandDiagnosticCategory.Error,
        code: 8999,
        message: '<marquee> is not allowed.',
        start: 0,
        end: 19,
      },
    ]);
  });
});
