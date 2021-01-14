/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompiler, AotCompilerHost, AotCompilerOptions, CompileSummaryKind, GeneratedFile, toTypeScript} from '@angular/compiler';

import {compile, MockDirectory, setup} from './test_util';

describe('aot summaries for jit', () => {
  let angularFiles = setup();
  let angularSummaryFiles: MockDirectory;

  beforeEach(() => {
    angularSummaryFiles = compile(angularFiles, {useSummaries: false, emit: true}).outDir;
  });

  function compileApp(
      rootDir: MockDirectory, options: {useSummaries?: boolean}&AotCompilerOptions = {}):
      {genFiles: GeneratedFile[], outDir: MockDirectory} {
    return compile(
        [rootDir, options.useSummaries ? angularSummaryFiles : angularFiles],
        {...options, enableSummariesForJit: true});
  }

  it('should create @Injectable summaries', () => {
    const appDir = {
      'app.module.ts': `
        import { Injectable } from '@angular/core';

        export class Dep {}

        @Injectable()
        export class MyService {
          constructor(d: Dep) {}
        }
      `
    };
    const rootDir = {'app': appDir};

    const genFile =
        compileApp(rootDir).genFiles.find(f => f.genFileUrl === '/app/app.module.ngsummary.ts')!;
    const genSource = toTypeScript(genFile);

    expect(genSource).toContain(`import * as i0 from '/app/app.module'`);
    expect(genSource).toContain('export function MyServiceNgSummary()');
    // Note: CompileSummaryKind.Injectable = 3
    expect(genSource).toMatch(/summaryKind:3,\s*type:\{\s*reference:i0.MyService/);
    expect(genSource).toContain('token:{identifier:{reference:i0.Dep}}');
  });

  it('should create @Pipe summaries', () => {
    const appDir = {
      'app.module.ts': `
        import { Pipe, NgModule } from '@angular/core';

        export class Dep {}

        @Pipe({name: 'myPipe'})
        export class MyPipe {
          constructor(d: Dep) {}
        }

        @NgModule({declarations: [MyPipe]})
        export class MyModule {}
      `
    };
    const rootDir = {'app': appDir};

    const genFile =
        compileApp(rootDir).genFiles.find(f => f.genFileUrl === '/app/app.module.ngsummary.ts')!;
    const genSource = toTypeScript(genFile);

    expect(genSource).toContain(`import * as i0 from '/app/app.module'`);
    expect(genSource).toContain('export function MyPipeNgSummary()');
    // Note: CompileSummaryKind.Pipe = 1
    expect(genSource).toMatch(/summaryKind:0,\s*type:\{\s*reference:i0.MyPipe/);
    expect(genSource).toContain('token:{identifier:{reference:i0.Dep}}');
  });

  it('should create @Directive summaries', () => {
    const appDir = {
      'app.module.ts': `
        import { Directive, NgModule } from '@angular/core';

        export class Dep {}

        @Directive({selector: '[myDir]'})
        export class MyDirective {
          constructor(a: Dep) {}
        }

        @NgModule({declarations: [MyDirective]})
        export class MyModule {}
      `
    };
    const rootDir = {'app': appDir};

    const genFile =
        compileApp(rootDir).genFiles.find(f => f.genFileUrl === '/app/app.module.ngsummary.ts')!;
    const genSource = toTypeScript(genFile);

    expect(genSource).toContain(`import * as i0 from '/app/app.module'`);
    expect(genSource).toContain('export function MyDirectiveNgSummary()');
    // Note: CompileSummaryKind.Directive = 1
    expect(genSource).toMatch(/summaryKind:1,\s*type:\{\s*reference:i0.MyDirective/);
    expect(genSource).toContain('token:{identifier:{reference:i0.Dep}}');
  });

  it('should create @NgModule summaries', () => {
    const appDir = {
      'app.module.ts': `
        import { NgModule } from '@angular/core';

        export class Dep {}

        @NgModule()
        export class MyModule {
          constructor(d: Dep) {}
        }
      `
    };
    const rootDir = {'app': appDir};

    const genFile =
        compileApp(rootDir).genFiles.find(f => f.genFileUrl === '/app/app.module.ngsummary.ts')!;
    const genSource = toTypeScript(genFile);

    expect(genSource).toContain(`import * as i0 from '/app/app.module'`);
    expect(genSource).toContain('export function MyModuleNgSummary()');
    // Note: CompileSummaryKind.NgModule = 2
    expect(genSource).toMatch(/summaryKind:2,\s*type:\{\s*reference:i0.MyModule/);
    expect(genSource).toContain('token:{identifier:{reference:i0.Dep}}');
  });

  it('should embed useClass provider summaries in @Directive summaries', () => {
    const appDir = {
      'app.service.ts': `
        import { Injectable } from '@angular/core';

        export class Dep {}

        @Injectable()
        export class MyService {
          constructor(d: Dep) {}
        }
      `,
      'app.module.ts': `
        import { Directive, NgModule } from '@angular/core';
        import { MyService } from './app.service';

        @Directive({
          selector: '[myDir]',
          providers: [MyService]
        })
        export class MyDirective {}

        @NgModule({declarations: [MyDirective]})
        export class MyModule {}
      `
    };
    const rootDir = {'app': appDir};

    const genFile =
        compileApp(rootDir).genFiles.find(f => f.genFileUrl === '/app/app.module.ngsummary.ts')!;
    const genSource = toTypeScript(genFile);

    expect(genSource).toMatch(/useClass:\{\s*reference:i1.MyService/);
    // Note: CompileSummaryKind.Injectable = 3
    expect(genSource).toMatch(/summaryKind:3,\s*type:\{\s*reference:i1.MyService/);
    expect(genSource).toContain('token:{identifier:{reference:i1.Dep}}');
  });

  it('should embed useClass provider summaries into @NgModule summaries', () => {
    const appDir = {
      'app.service.ts': `
        import { Injectable } from '@angular/core';

        export class Dep {}

        @Injectable()
        export class MyService {
          constructor(d: Dep) {}
        }
      `,
      'app.module.ts': `
        import { NgModule } from '@angular/core';
        import { MyService } from './app.service';

        @NgModule({
          providers: [MyService]
        })
        export class MyModule {}
      `
    };
    const rootDir = {'app': appDir};

    const genFile =
        compileApp(rootDir).genFiles.find(f => f.genFileUrl === '/app/app.module.ngsummary.ts')!;
    const genSource = toTypeScript(genFile);

    expect(genSource).toMatch(/useClass:\{\s*reference:i1.MyService/);
    // Note: CompileSummaryKind.Injectable = 3
    expect(genSource).toMatch(/summaryKind:3,\s*type:\{\s*reference:i1.MyService/);
    expect(genSource).toContain('token:{identifier:{reference:i1.Dep}}');
  });

  it('should reference declared @Directive and @Pipe summaries in @NgModule summaries', () => {
    const appDir = {
      'app.module.ts': `
        import { Directive, Pipe, NgModule } from '@angular/core';

        @Directive({selector: '[myDir]'})
        export class MyDirective {}

        @Pipe({name: 'myPipe'})
        export class MyPipe {}

        @NgModule({declarations: [MyDirective, MyPipe]})
        export class MyModule {}
      `
    };
    const rootDir = {'app': appDir};

    const genFile =
        compileApp(rootDir).genFiles.find(f => f.genFileUrl === '/app/app.module.ngsummary.ts')!;
    const genSource = toTypeScript(genFile);

    expect(genSource).toMatch(
        /export function MyModuleNgSummary()[^;]*,\s*MyDirectiveNgSummary,\s*MyPipeNgSummary\s*\]\s*;/);
  });

  it('should reference imported @NgModule summaries in @NgModule summaries', () => {
    const appDir = {
      'app.module.ts': `
        import { NgModule } from '@angular/core';

        @NgModule()
        export class MyImportedModule {}

        @NgModule({imports: [MyImportedModule]})
        export class MyModule {}
      `
    };
    const rootDir = {'app': appDir};

    const genFile =
        compileApp(rootDir).genFiles.find(f => f.genFileUrl === '/app/app.module.ngsummary.ts')!;
    const genSource = toTypeScript(genFile);

    expect(genSource).toMatch(
        /export function MyModuleNgSummary()[^;]*,\s*MyImportedModuleNgSummary\s*\]\s*;/);
  });

  it('should create and use reexports for imported NgModules ' +
         'across compilation units if symbol re-exports are enabled',
     () => {
       const lib1In = {
         'lib1': {
           'module.ts': `
          import { NgModule } from '@angular/core';

          @NgModule()
          export class Lib1Module {}
        `,
           'reexport.ts': `
          import { NgModule } from '@angular/core';

          @NgModule()
          export class ReexportModule {}

          export const reexports: any[] = [ ReexportModule ];
        `,
         }
       };
       const {outDir: lib2In, genFiles: lib1Gen} = compileApp(lib1In, {
         useSummaries: true,
         createExternalSymbolFactoryReexports: true,
       });

       lib2In['lib2'] = {
         'module.ts': `
          import { NgModule } from '@angular/core';
          import { Lib1Module } from '../lib1/module';

          @NgModule({
            imports: [Lib1Module]
          })
          export class Lib2Module {}
        `,
         'reexport.ts': `
        import { reexports as reexports_lib1 } from '../lib1/reexport';
        export const reexports: any[] = [ reexports_lib1 ];
        `,
       };
       const {outDir: lib3In, genFiles: lib2Gen} = compileApp(lib2In, {
         useSummaries: true,
         createExternalSymbolFactoryReexports: true,
       });

       const lib2ModuleNgSummary = lib2Gen.find(f => f.genFileUrl === '/lib2/module.ngsummary.ts')!;
       const lib2ReexportNgSummary =
           lib2Gen.find(f => f.genFileUrl === '/lib2/reexport.ngsummary.ts')!;

       // ngsummaries should add reexports for imported NgModules from a direct dependency
       expect(toTypeScript(lib2ModuleNgSummary))
           .toContain(
               `export {Lib1ModuleNgSummary as Lib1Module_1NgSummary} from '/lib1/module.ngsummary'`);
       // ngsummaries should add reexports for reexported values from a direct dependency
       expect(toTypeScript(lib2ReexportNgSummary))
           .toContain(
               `export {ReexportModuleNgSummary as ReexportModule_2NgSummary} from '/lib1/reexport.ngsummary'`);

       lib3In['lib3'] = {
         'module.ts': `
          import { NgModule } from '@angular/core';
          import { Lib2Module } from '../lib2/module';
          import { reexports } from '../lib2/reexport';

          @NgModule({
            imports: [Lib2Module, reexports]
          })
          export class Lib3Module {}
        `,
         'reexport.ts': `
        import { reexports as reexports_lib2 } from '../lib2/reexport';
        export const reexports: any[] = [ reexports_lib2 ];
        `,
       };

       const lib3Gen = compileApp(lib3In, {
                         useSummaries: true,
                         createExternalSymbolFactoryReexports: true
                       }).genFiles;
       const lib3ModuleNgSummary = lib3Gen.find(f => f.genFileUrl === '/lib3/module.ngsummary.ts')!;
       const lib3ReexportNgSummary =
           lib3Gen.find(f => f.genFileUrl === '/lib3/reexport.ngsummary.ts')!;

       // ngsummary.ts files should use the reexported values from direct and deep deps
       const lib3ModuleNgSummarySource = toTypeScript(lib3ModuleNgSummary);
       expect(lib3ModuleNgSummarySource).toContain(`import * as i4 from '/lib2/module.ngsummary'`);
       expect(lib3ModuleNgSummarySource)
           .toContain(`import * as i5 from '/lib2/reexport.ngsummary'`);
       expect(lib3ModuleNgSummarySource)
           .toMatch(
               /export function Lib3ModuleNgSummary()[^;]*,\s*i4.Lib1Module_1NgSummary,\s*i4.Lib2ModuleNgSummary,\s*i5.ReexportModule_2NgSummary\s*\]\s*;/);

       // ngsummaries should add reexports for imported NgModules from a deep dependency
       expect(lib3ModuleNgSummarySource)
           .toContain(
               `export {Lib1Module_1NgSummary as Lib1Module_1NgSummary,Lib2ModuleNgSummary as Lib2Module_2NgSummary} from '/lib2/module.ngsummary'`);
       // ngsummaries should add reexports for reexported values from a deep dependency
       expect(toTypeScript(lib3ReexportNgSummary))
           .toContain(
               `export {ReexportModule_2NgSummary as ReexportModule_3NgSummary} from '/lib2/reexport.ngsummary'`);
     });

  it('should not create reexports for external symbols imported by NgModules', () => {
    const lib1In = {
      'lib1': {
        'module.ts': `
          import { NgModule } from '@angular/core';

          @NgModule()
          export class Lib1Module {}`,
        'reexport.ts': `
          import { NgModule } from '@angular/core';

          @NgModule()
          export class ReexportModule {}

          export const reexports: any[] = [ ReexportModule ];`,
      }
    };
    const {outDir: lib1Out} = compileApp(lib1In, {useSummaries: true});

    const lib2In = {
      ...lib1Out,
      'lib2': {
        'module.ts': `
          import { NgModule } from '@angular/core';
          import { Lib1Module } from '../lib1/module';

          @NgModule({
            imports: [Lib1Module]
          })
          export class Lib2Module {}`,
        'reexport.ts': `
          import { reexports as reexports_lib1 } from '../lib1/reexport';
          export const reexports: any[] = [ reexports_lib1 ];`,
      },
    };

    const {outDir: lib2Out, genFiles: lib2Gen} = compileApp(lib2In, {useSummaries: true});

    const lib2ModuleNgSummary = lib2Gen.find(f => f.genFileUrl === '/lib2/module.ngsummary.ts')!;
    const lib2ReexportNgSummary =
        lib2Gen.find(f => f.genFileUrl === '/lib2/reexport.ngsummary.ts')!;

    // ngsummaries should not add reexports by default for imported NgModules from a direct
    // dependency
    expect(toTypeScript(lib2ModuleNgSummary))
        .toContain(
            `export {Lib1ModuleNgSummary as Lib1ModuleNgSummary} from '/lib1/module.ngsummary'`);
    // ngsummaries should not add reexports by default for reexported values from a direct
    // dependency.
    expect(toTypeScript(lib2ReexportNgSummary))
        .toContain(
            `export {ReexportModuleNgSummary as ReexportModuleNgSummary} from '/lib1/reexport.ngsummary'`);

    const lib3In = {
      ...lib1Out,
      ...lib2Out,
      'lib3': {
        'module.ts': `
          import { NgModule } from '@angular/core';
          import { Lib2Module } from '../lib2/module';
          import { reexports } from '../lib2/reexport';

          @NgModule({
            imports: [Lib2Module, reexports]
          })
          export class Lib3Module {}
        `,
        'reexport.ts': `
          import { reexports as reexports_lib2 } from '../lib2/reexport';
          export const reexports: any[] = [ reexports_lib2 ];
        `,
      },
    };

    const lib3Gen = compileApp(lib3In, {useSummaries: true}).genFiles;
    const lib3ModuleNgSummary = lib3Gen.find(f => f.genFileUrl === '/lib3/module.ngsummary.ts')!;
    const lib3ReexportNgSummary =
        lib3Gen.find(f => f.genFileUrl === '/lib3/reexport.ngsummary.ts')!;

    // ngsummary.ts files should use the external symbols which are manually re-exported from
    // "lib2" from their original symbol location. With re-exported external symbols this would
    // be different because there would be no *direct* dependency on "lib1" at all.
    const lib3ModuleNgSummarySource = toTypeScript(lib3ModuleNgSummary);
    expect(lib3ModuleNgSummarySource).toContain(`import * as i1 from '/lib1/module';`);
    expect(lib3ModuleNgSummarySource).toContain(`import * as i3 from '/lib1/reexport';`);
    expect(lib3ModuleNgSummarySource)
        .toMatch(/export function Lib3ModuleNgSummary\(\).*modules:\[{reference:i1\.Lib1Module,/s);
    expect(lib3ModuleNgSummarySource)
        .toMatch(/export function Lib3ModuleNgSummary\(\).*reference:i3\.ReexportModule,/s);
    // ngsummaries should re-export all used summaries directly. With external symbol re-exports
    // enabled, the "lib1" summaries would be re-exported through "lib2" in order to avoid
    // a *direct* dependency on "lib1".
    expect(lib3ModuleNgSummarySource)
        .toContain(
            `export {Lib1ModuleNgSummary as Lib1ModuleNgSummary} from '/lib1/module.ngsummary';`);
    expect(lib3ModuleNgSummarySource)
        .toContain(
            `export {ReexportModuleNgSummary as ReexportModuleNgSummary} from '/lib1/reexport.ngsummary';`);
    expect(toTypeScript(lib3ReexportNgSummary))
        .toContain(
            `export {ReexportModuleNgSummary as ReexportModuleNgSummary} from '/lib1/reexport.ngsummary';`);
  });
});
