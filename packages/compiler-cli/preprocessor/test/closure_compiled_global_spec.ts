/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fsSync from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import ts from 'typescript';

import {resolveFixtureNodeModules, runPipeline, TestFile} from './utils.js';

describe('ambient .d.ts global value evaluation', () => {
  it('resolves ambient .d.ts globals across files in full and experimental-local modes without Closure flags', async () => {
    const closureDts = `
      declare var GLOBAL_TOKEN: import('@angular/core').InjectionToken<string>;
      declare var COMPILED: boolean;
      declare const ENV_TAG: 'prod';
      declare class AmbientGlobalService {}
    `;
    const umdDts = `
      declare namespace UmdGlobalLib {
        export const VERSION: string;
      }
      declare const UMD_TAG: 'umd';
      export as namespace UmdGlobalLib;
    `;
    const globalAugDts = `
      export {};
      declare global {
        var AUGMENTED_FLAG: boolean;
        const AUGMENTED_SUFFIX: 'aug';
      }
    `;
    const testFiles: TestFile[] = [
      {
        path: '/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'es2022',
            module: 'esnext',
            moduleResolution: 'bundler',
            experimentalDecorators: true,
            strict: true,
          },
          files: ['closure.lib.d.ts', 'umd.lib.d.ts', 'global_aug.d.ts', 'imported.ts', 'app.ts'],
        }),
      },
      {path: '/closure.lib.d.ts', content: closureDts},
      {path: '/umd.lib.d.ts', content: umdDts},
      {path: '/global_aug.d.ts', content: globalAugDts},
      {
        path: '/imported.ts',
        content: `
          import {Directive, Injectable, NgModule} from '@angular/core';

          export const CROSS_SELECTOR = COMPILED && \`app-\${ENV_TAG}-\${UMD_TAG}-\${AUGMENTED_FLAG && AUGMENTED_SUFFIX}\`;

          @Injectable()
          export class ImportedService {}

          export const IMPORTED_PROVIDERS = [
            ImportedService,
            AmbientGlobalService,
            {provide: GLOBAL_TOKEN, useValue: 'ok'},
          ];

          @Directive({
            selector: '[importedDir]',
            standalone: false,
          })
          export class ImportedDir {}

          @NgModule({
            declarations: [ImportedDir],
            exports: [ImportedDir],
          })
          export class ImportedModule {}
        `,
      },
      {
        path: '/app.ts',
        content: `
          import {Component, NgModule} from '@angular/core';
          import {CROSS_SELECTOR, IMPORTED_PROVIDERS, ImportedModule} from './imported';

          @Component({
            selector: CROSS_SELECTOR,
            template: '<div importedDir></div>',
            standalone: false,
          })
          export class AppCmp {}

          @NgModule({
            declarations: [AppCmp],
            imports: [COMPILED && ImportedModule],
            providers: [COMPILED && IMPORTED_PROVIDERS, AmbientGlobalService],
          })
          export class AppModule {}
        `,
      },
    ];

    const outputs = await runPipeline(testFiles, {optimize: true, format: true});
    const outMap = new Map(outputs.map((o) => [o.path, o.content]));
    expect(outMap.get('/tsconfig.ngdiag.json')).toBeUndefined();

    const appOut = outMap.get('/out/app.ts')!;
    expect(appOut).toBeDefined();
    expect(appOut).toContain("selectors: [['app-prod-umd-aug']]");
    expect(appOut).toContain('ImportedDir');
    expect(appOut).toContain('ImportedModule');
    expect(appOut).not.toContain('closure.lib');
    expect(appOut).not.toContain('umd.lib');
    expect(
      typecheckAmbientOutputs(
        testFiles,
        outMap,
        [
          {name: 'closure.lib.d.ts', content: closureDts},
          {name: 'umd.lib.d.ts', content: umdDts},
          {name: 'global_aug.d.ts', content: globalAugDts},
        ],
        ['/out/imported.ts', '/out/app.ts'],
      ),
    ).toEqual([]);

    const localTestFiles: TestFile[] = [
      {
        path: '/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'es2022',
            module: 'esnext',
            moduleResolution: 'bundler',
            experimentalDecorators: true,
            strict: true,
          },
          files: ['closure.lib.d.ts', 'imported.ts', 'app.ts'],
          angularCompilerOptions: {
            compilationMode: 'experimental-local',
          },
        }),
      },
      {path: '/closure.lib.d.ts', content: closureDts},
      {
        path: '/imported.ts',
        content: `
          export const LOCAL_CROSS_SELECTOR = COMPILED && 'app-local-closure';
        `,
      },
      {
        path: '/app.ts',
        content: `
          import {Component, NgModule} from '@angular/core';
          import {LOCAL_CROSS_SELECTOR} from './imported';

          @Component({
            selector: LOCAL_CROSS_SELECTOR,
            template: '',
          })
          export class LocalClosureCmp {}

          @NgModule({
            providers: [COMPILED && AmbientGlobalService, {provide: GLOBAL_TOKEN, useValue: 'local'}],
          })
          export class LocalClosureModule {}
        `,
      },
    ];
    const localOutputs = await runPipeline(localTestFiles, {optimize: false, format: true});
    const localOutMap = new Map(localOutputs.map((o) => [o.path, o.content]));
    expect(localOutMap.get('/tsconfig.ngdiag.json')).toBeUndefined();
    const localAppOut = localOutMap.get('/out/app.ts')!;
    expect(localAppOut).toContain("selectors: [['app-local-closure']]");
    expect(localAppOut).not.toContain('closure.lib');
    expect(
      typecheckAmbientOutputs(
        localTestFiles,
        localOutMap,
        [{name: 'closure.lib.d.ts', content: closureDts}],
        ['/out/imported.ts', '/out/app.ts'],
      ),
    ).toEqual([]);
  });

  it('supports literal-typed ambient globals and lexical shadowing', async () => {
    const outputs = await runPipeline(
      [
        {
          path: '/tsconfig.json',
          content: JSON.stringify({
            compilerOptions: {
              target: 'es2022',
              module: 'esnext',
              moduleResolution: 'bundler',
              experimentalDecorators: true,
            },
            files: ['closure.lib.d.ts', 'shadowed.ts', 'literal_false.ts'],
          }),
        },
        {
          path: '/closure.lib.d.ts',
          content: `
            declare var COMPILED: boolean;
            declare const DEV_COMPILED: false;
          `,
        },
        {
          path: '/shadowed.ts',
          content: `
            import {Component} from '@angular/core';
            const COMPILED = false;

            @Component({
              selector: (COMPILED && 'app-closure') || 'app-shadowed',
              template: '',
            })
            export class ShadowedCmp {}
          `,
        },
        {
          path: '/literal_false.ts',
          content: `
            import {Component} from '@angular/core';

            @Component({
              selector: (DEV_COMPILED && 'app-prod') || 'app-dev',
              template: '',
            })
            export class LiteralFalseCmp {}
          `,
        },
      ],
      {optimize: true, format: true},
    );
    const outMap = new Map(outputs.map((o) => [o.path, o.content]));
    expect(outMap.get('/tsconfig.ngdiag.json')).toBeUndefined();
    expect(outMap.get('/out/shadowed.ts')).toContain("selectors: [['app-shadowed']]");
    expect(outMap.get('/out/literal_false.ts')).toContain("selectors: [['app-dev']]");
  });

  // Regression guard for the Google3 target that motivated ambient globals
  // (//alkali/apps/heidelbergwf/client/app/media/store:store): a spread conditional on `COMPILED`
  // and an imported flag in `@NgModule.imports`.
  for (const useMockData of [true, false]) {
    it(`folds \`...(COMPILED && USE_MOCK_DATA ? [MocksModule] : [])\` in NgModule imports (USE_MOCK_DATA = ${useMockData})`, async () => {
      const closureDts = 'declare var COMPILED: boolean;\n';
      const testFiles: TestFile[] = [
        {
          path: '/tsconfig.json',
          content: JSON.stringify({
            compilerOptions: {
              target: 'es2022',
              module: 'esnext',
              moduleResolution: 'bundler',
              experimentalDecorators: true,
              strict: true,
            },
            files: ['closure.lib.d.ts', 'flags.ts', 'mocks.ts', 'store.ts'],
          }),
        },
        {path: '/closure.lib.d.ts', content: closureDts},
        {path: '/flags.ts', content: `export const USE_MOCK_DATA = ${useMockData};\n`},
        {
          path: '/mocks.ts',
          content: `
            import {NgModule} from '@angular/core';

            @NgModule({})
            export class MocksModule {}
          `,
        },
        {
          path: '/store.ts',
          content: `
            import {NgModule} from '@angular/core';
            import {USE_MOCK_DATA} from './flags';
            import {MocksModule} from './mocks';

            @NgModule({})
            export class StoreDepsModule {}

            @NgModule({
              imports: [StoreDepsModule, ...(COMPILED && USE_MOCK_DATA ? [MocksModule] : [])],
            })
            export class StoreModule {}
          `,
        },
      ];
      const outputs = await runPipeline(testFiles, {optimize: true, format: true});
      const outMap = new Map(outputs.map((o) => [o.path, o.content]));
      expect(outMap.get('/tsconfig.ngdiag.json')).toBeUndefined();
      const storeOut = outMap.get('/out/store.ts')!;
      const scope = storeOut.slice(storeOut.indexOf('ɵɵsetNgModuleScope(StoreModule'));
      const scopedImports = scope.slice(0, scope.indexOf(')'));
      expect(scopedImports).toContain('StoreDepsModule');
      if (useMockData) {
        expect(scopedImports).toContain('MocksModule');
      } else {
        expect(scopedImports).not.toContain('MocksModule');
      }
      expect(storeOut).not.toContain('closure.lib');
      expect(
        typecheckAmbientOutputs(
          testFiles,
          outMap,
          [{name: 'closure.lib.d.ts', content: closureDts}],
          ['/out/flags.ts', '/out/mocks.ts', '/out/store.ts'],
        ),
      ).toEqual([]);
    });
  }
});

export function typecheckAmbientOutputs(
  inputFiles: ReadonlyArray<TestFile>,
  outMap: Map<string, string>,
  ambientDtsFiles: ReadonlyArray<{name: string; content: string}>,
  rootFiles: string[],
): string[] {
  const nodeModules = resolveFixtureNodeModules();
  const tmpRoot = fsSync.mkdtempSync(path.join(os.tmpdir(), 'ngp-cat9-tsc-'));
  try {
    fsSync.symlinkSync(nodeModules, path.join(tmpRoot, 'node_modules'), 'dir');
    const dtsRoots: string[] = [];
    for (const dts of ambientDtsFiles) {
      const diskDts = path.join(tmpRoot, 'out', dts.name);
      fsSync.mkdirSync(path.dirname(diskDts), {recursive: true});
      fsSync.writeFileSync(diskDts, dts.content);
      dtsRoots.push(diskDts);
    }

    for (const input of inputFiles) {
      if (!input.path.endsWith('.ts') || input.path.endsWith('.d.ts')) continue;
      const diskPath = path.join(tmpRoot, 'out', input.path.replace(/^\//, ''));
      fsSync.mkdirSync(path.dirname(diskPath), {recursive: true});
      fsSync.writeFileSync(diskPath, input.content);
    }

    for (const [virtualPath, content] of outMap) {
      if (!virtualPath.startsWith('/out/')) continue;
      const diskPath = path.join(tmpRoot, virtualPath.slice(1));
      fsSync.mkdirSync(path.dirname(diskPath), {recursive: true});
      fsSync.writeFileSync(diskPath, content);
    }

    const tsOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
      experimentalDecorators: true,
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      types: [],
    };

    const diskRoots = [...dtsRoots, ...rootFiles.map((r) => path.join(tmpRoot, r.slice(1)))];
    const program = ts.createProgram(diskRoots, tsOptions);
    return ts
      .getPreEmitDiagnostics(program)
      .map((d) => `TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
  } finally {
    fsSync.rmSync(tmpRoot, {recursive: true, force: true});
  }
}
