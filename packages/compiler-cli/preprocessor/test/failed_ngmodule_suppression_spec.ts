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

describe('failed NgModule analysis wire suppression', () => {
  it('suppresses codegen on failed NgModules while preserving NG6001, NG2003 on @Injectable, and sibling classes', async () => {
    const extDts = `
      import * as i0 from '@angular/core';
      export declare class ExternalComponent {
        static ɵcmp: i0.ɵɵComponentDeclaration<ExternalComponent, 'ext-comp', never, {}, {}, never, never, false, never>;
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
            noUnusedLocals: true,
          },
          files: ['app.ts', 'ext.d.ts'],
          angularCompilerOptions: {
            strictInjectionParameters: true,
          },
        }),
      },
      {
        path: '/ext.d.ts',
        content: extDts,
      },
      {
        path: '/app.ts',
        content: `
          import {Component, Injectable, NgModule} from '@angular/core';
          import {ExternalComponent} from './ext';

          @NgModule({
            declarations: [ExternalComponent],
          })
          export class BrokenModule {
            constructor(dep: unknown) {}
          }

          @Injectable()
          @NgModule({
            declarations: [ExternalComponent],
          })
          export class BrokenInjectableModule {
            constructor(dep: unknown) {}
          }

          @Component({
            selector: 'valid-comp',
            template: '<div>ok</div>',
          })
          export class ValidComponent {}
        `,
      },
    ];

    const outputs = await runPipeline(testFiles, {optimize: true, format: true});
    const outMap = new Map(outputs.map((o) => [o.path, o.content]));

    const diagJson = JSON.parse(outMap.get('/tsconfig.ngdiag.json')!) as {
      diagnostics: Array<{
        code: number;
        messageText: string | {messageText: string};
        start?: number;
        length?: number;
      }>;
    };
    const ng6001 = diagJson.diagnostics.filter((d) => d.code === 6001);
    const ng2003 = diagJson.diagnostics.filter((d) => d.code === 2003);
    expect(ng6001.length).toBe(2);
    expect(ng2003.length).toBe(1);
    expect(JSON.stringify(ng2003[0].messageText)).toContain('BrokenInjectableModule');
    expect(JSON.stringify(ng2003[0].messageText)).not.toContain('BrokenModule.');

    const appOut = outMap.get('/out/app.ts')!;
    expect(appOut).toBeDefined();

    // Neither BrokenModule nor BrokenInjectableModule may emit ɵmod, ɵinj, ɵprov, ɵfac, or
    // ɵsetClassMetadata.
    expect(appOut).not.toContain('ɵmod');
    expect(appOut).not.toContain('ɵinj');
    expect(appOut).not.toContain('ɵprov');
    expect(appOut).toContain('export class BrokenModule {\n  constructor(dep: unknown) {}\n}');
    expect(appOut).toContain(
      'export class BrokenInjectableModule {\n  constructor(dep: unknown) {}\n}',
    );
    expect(appOut).not.toContain('BrokenModule_Factory');
    expect(appOut).not.toContain('BrokenInjectableModule_Factory');
    expect(appOut).not.toContain('ɵsetClassMetadata(BrokenModule');
    expect(appOut).not.toContain('ɵsetClassMetadata(BrokenInjectableModule');

    // Both @Injectable() and @NgModule({ declarations: [ExternalComponent] }) remain intact on
    // BrokenInjectableModule (and @NgModule on BrokenModule), keeping ExternalComponent used.
    expect(appOut).toMatch(
      /@Injectable\(\)\s*@NgModule\(\{\s*declarations:\s*\[ExternalComponent\],?\s*\}\)\s*export class BrokenInjectableModule/,
    );
    expect(appOut).toMatch(
      /@NgModule\(\{\s*declarations:\s*\[ExternalComponent\],?\s*\}\)\s*export class BrokenModule/,
    );

    // Sibling ValidComponent still compiles ɵcmp and ɵfac.
    expect(appOut).toMatch(/class ValidComponent\s*\{[\s\S]*?static\s+ɵfac\b/);
    expect(appOut).toMatch(/class ValidComponent\s*\{[\s\S]*?static\s+ɵcmp\b/);

    // Downstream tsc with `noUnusedLocals: true` and `strict: true` must report zero TS6133/TS2339
    // errors on the emitted `.ng.ts` output.
    const tsDiags = typecheckWithExtDts(outMap, extDts, ['/out/app.ts']);
    expect(tsDiags).toEqual([]);
  });
});

export function typecheckWithExtDts(
  outMap: Map<string, string>,
  extDtsContent: string,
  rootFiles: string[],
): string[] {
  const nodeModules = resolveFixtureNodeModules();
  const tmpRoot = fsSync.mkdtempSync(path.join(os.tmpdir(), 'ngp-cat10-tsc-'));
  try {
    fsSync.symlinkSync(nodeModules, path.join(tmpRoot, 'node_modules'), 'dir');
    const extDtsDisk = path.join(tmpRoot, 'out', 'ext.d.ts');
    fsSync.mkdirSync(path.dirname(extDtsDisk), {recursive: true});
    fsSync.writeFileSync(extDtsDisk, extDtsContent);

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
      noUnusedLocals: true,
      skipLibCheck: true,
      noEmit: true,
      types: [],
    };

    const diskRoots = [extDtsDisk, ...rootFiles.map((r) => path.join(tmpRoot, r.slice(1)))];
    const program = ts.createProgram(diskRoots, tsOptions);
    return ts
      .getPreEmitDiagnostics(program)
      .map((d) => `TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
  } finally {
    fsSync.rmSync(tmpRoot, {recursive: true, force: true});
  }
}
