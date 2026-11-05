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

describe('foreign-function ModuleWithProviders remote scope cycle protection', () => {
  it('wraps ɵɵsetComponentScope arrays in closures when an NgModule imports a foreign-function ModuleWithProviders', async () => {
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
          files: ['app.module.ts', 'comp-b.component.ts', 'addon.ts'],
        }),
      },
      {
        path: '/addon.ts',
        content: `
          import {Directive, ModuleWithProviders, NgModule} from '@angular/core';

          @Directive({
            selector: '[addonDir]',
            standalone: false,
          })
          export class AddonDir {}

          @NgModule({
            declarations: [AddonDir],
            exports: [AddonDir],
          })
          export class AddonModule {
            static forRoot(): ModuleWithProviders<AddonModule> {
              return (globalThis as any).dynamicMwp;
            }
          }
        `,
      },
      {
        path: '/comp-b.component.ts',
        content: `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp-b',
            template: '<div addonDir>CompB: <comp-a></comp-a></div>',
            standalone: false,
          })
          export class CompB {}
        `,
      },
      {
        path: '/app.module.ts',
        content: `
          import {Component, NgModule} from '@angular/core';
          import {AddonModule} from './addon';
          import {CompB} from './comp-b.component';

          @NgModule({
            declarations: [CompA, CompB],
            imports: [AddonModule.forRoot()],
            exports: [CompB],
          })
          export class AppModule {}

          @Component({
            selector: 'comp-a',
            template: '<div>CompA: <comp-b></comp-b></div>',
            standalone: false,
          })
          export class CompA {}
        `,
      },
    ];

    const outputs = await runPipeline(testFiles, {optimize: true, format: true});
    const outMap = new Map(outputs.map((o) => [o.path, o.content]));
    const appModuleOut = outMap.get('/out/app.module.ts')!;
    expect(appModuleOut).toBeDefined();
    expect(appModuleOut).toMatch(
      /i0\.ɵɵsetComponentScope\(\s*CompB,\s*function\s*\(\)\s*\{\s*return\s*\[/,
    );

    const diags = typecheckOutputs(outMap, [
      '/out/addon.ts',
      '/out/comp-b.component.ts',
      '/out/app.module.ts',
    ]);
    expect(diags).toEqual([]);
  });
});

function typecheckOutputs(outMap: Map<string, string>, rootFiles: string[]): string[] {
  const nodeModules = resolveFixtureNodeModules();
  const tmpRoot = fsSync.mkdtempSync(path.join(os.tmpdir(), 'ngp-cat8-tsc-'));
  try {
    fsSync.symlinkSync(nodeModules, path.join(tmpRoot, 'node_modules'), 'dir');
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

    const diskRoots = rootFiles.map((r) => path.join(tmpRoot, r.slice(1)));
    const program = ts.createProgram(diskRoots, tsOptions);
    return ts
      .getPreEmitDiagnostics(program)
      .map((d) => `TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
  } finally {
    fsSync.rmSync(tmpRoot, {recursive: true, force: true});
  }
}
