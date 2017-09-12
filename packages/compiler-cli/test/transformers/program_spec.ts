/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ng from '@angular/compiler-cli';
import {makeTempDir} from '@angular/tsc-wrapped/test/test_support';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {StructureIsReused, tsStructureIsReused} from '../../src/transformers/util';

function getNgRootDir() {
  const moduleFilename = module.filename.replace(/\\/g, '/');
  const distIndex = moduleFilename.indexOf('/dist/all');
  return moduleFilename.substr(0, distIndex);
}

describe('ng program', () => {
  let basePath: string;
  let write: (fileName: string, content: string) => void;
  let errorSpy: jasmine.Spy&((s: string) => void);

  function writeFiles(...mockDirs: {[fileName: string]: string}[]) {
    mockDirs.forEach(
        (dir) => { Object.keys(dir).forEach((fileName) => { write(fileName, dir[fileName]); }); });
  }

  function createCompilerOptions(overrideOptions: ng.CompilerOptions = {}): ng.CompilerOptions {
    return {
      basePath,
      'experimentalDecorators': true,
      'skipLibCheck': true,
      'strict': true,
      'types': [],
      'outDir': path.resolve(basePath, 'built'),
      'rootDir': basePath,
      'baseUrl': basePath,
      'declaration': true,
      'target': ts.ScriptTarget.ES5,
      'module': ts.ModuleKind.ES2015,
      'moduleResolution': ts.ModuleResolutionKind.NodeJs,
      'lib': [
        path.resolve(basePath, 'node_modules/typescript/lib/lib.es6.d.ts'),
        path.resolve(basePath, 'node_modules/typescript/lib/lib.dom.d.ts')
      ],
      'typeRoots': [path.resolve(basePath, 'node_modules/@types')], ...overrideOptions,
    };
  }

  function expectNoDiagnostics(options: ng.CompilerOptions, p: ng.Program) {
    const diags: ng.Diagnostics =
        [...p.getTsSemanticDiagnostics(), ...p.getNgSemanticDiagnostics()];
    if (diags.length > 0) {
      console.error('Diagnostics: ' + ng.formatDiagnostics(options, diags));
      throw new Error('Expected no diagnostics.');
    }
  }

  beforeEach(() => {
    errorSpy = jasmine.createSpy('consoleError').and.callFake(console.error);
    basePath = makeTempDir();
    write = (fileName: string, content: string) => {
      const dir = path.dirname(fileName);
      if (dir != '.') {
        const newDir = path.join(basePath, dir);
        if (!fs.existsSync(newDir)) fs.mkdirSync(newDir);
      }
      fs.writeFileSync(path.join(basePath, fileName), content, {encoding: 'utf-8'});
    };
    const ngRootDir = getNgRootDir();
    const nodeModulesPath = path.resolve(basePath, 'node_modules');
    fs.mkdirSync(nodeModulesPath);
    fs.symlinkSync(
        path.resolve(ngRootDir, 'dist', 'all', '@angular'),
        path.resolve(nodeModulesPath, '@angular'));
    fs.symlinkSync(
        path.resolve(ngRootDir, 'node_modules', 'rxjs'), path.resolve(nodeModulesPath, 'rxjs'));
    fs.symlinkSync(
        path.resolve(ngRootDir, 'node_modules', 'typescript'),
        path.resolve(nodeModulesPath, 'typescript'));
  });

  describe('reuse of old ts program', () => {
    const files = {
      'src/util.ts': `export const x = 1;`,
      'src/main.ts': `
        import {NgModule, Component} from '@angular/core';
        import {x} from './util';

        @Component({selector: 'comp', templateUrl: './main.html'})
        export class MyComp {}

        @NgModule()
        export class MyModule {}
      `,
      'src/main.html': `Hello world`,
    };

    function expectResuse(newFiles: {[fileName: string]: string}, reuseLevel: StructureIsReused) {
      writeFiles(files);

      const options1 = createCompilerOptions();
      const host1 = ng.createCompilerHost({options: options1});
      const rootNames1 = [path.resolve(basePath, 'src/main.ts')];

      const p1 = ng.createProgram({rootNames: rootNames1, options: options1, host: host1});
      expectNoDiagnostics(options1, p1);

      // Note: we recreate the options, rootNames and the host
      // to check that TS checks against values, and not references!
      writeFiles(newFiles);
      const options2 = {...options1};
      const host2 = ng.createCompilerHost({options: options2});
      const rootNames2 = [...rootNames1];

      const p2 =
          ng.createProgram({rootNames: rootNames2, options: options2, host: host2, oldProgram: p1});
      expectNoDiagnostics(options1, p2);

      expect(tsStructureIsReused(p1.getTsProgram())).toBe(reuseLevel);
    }

    it('should reuse completely if nothing changed',
       () => { expectResuse({}, StructureIsReused.Completely); });

    it('should resuse if a template or a ts file changed', () => {
      expectResuse(
          {
            'src/main.html': `Some other text`,
            'src/util.ts': `export const x = 2;`,
          },
          StructureIsReused.Completely);
    });

    it('should not reuse if an import changed', () => {
      expectResuse(
          {
            'src/util.ts': `
          import {Injectable} from '@angular/core';
          export const x = 2;
        `,
          },
          StructureIsReused.SafeModules);
    });
  });

  it('should typecheck templates even if skipTemplateCodegen is set', () => {
    writeFiles({
      'src/main.ts': `
        import {NgModule, Component} from '@angular/core';

        @Component({selector: 'mycomp', template: '{{nonExistent}}'})
        export class MyComp {}

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `
    });
    const options = createCompilerOptions({skipTemplateCodegen: true});
    const host = ng.createCompilerHost({options});
    const program =
        ng.createProgram({rootNames: [path.resolve(basePath, 'src/main.ts')], options, host});
    const diags = program.getNgSemanticDiagnostics();
    expect(diags.length).toBe(1);
    expect(diags[0].messageText).toBe(`Property 'nonExistent' does not exist on type 'MyComp'.`);
  });

  it('should be able to use asynchronously loaded resources', (done) => {
    writeFiles({
      'src/main.ts': `
        import {NgModule, Component} from '@angular/core';

        @Component({selector: 'mycomp', templateUrl: './main.html'})
        export class MyComp {}

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `,
      // Note: we need to be able to resolve the template synchronously,
      // only the content is delivered asynchronously.
      'src/main.html': '',
    });
    const options = createCompilerOptions();
    const host = ng.createCompilerHost({options});
    host.readResource = () => Promise.resolve('Hello world!');
    const program =
        ng.createProgram({rootNames: [path.resolve(basePath, 'src/main.ts')], options, host});
    program.loadNgStructureAsync().then(() => {
      program.emit();
      const factory = fs.readFileSync(path.resolve(basePath, 'built/src/main.ngfactory.js'));
      expect(factory).toContain('Hello world!');
      done();
    });
  });
});

function appComponentSource(): string {
  return `
    import {Component, Pipe, Directive} from '@angular/core';

    export interface Person {
      name: string;
      address: Address;
    }

    export interface Address {
      street: string;
      city: string;
      state: string;
      zip: string;
    }

    @Component({
      templateUrl: './app.component.html'
    })
    export class AppComponent {
      name = 'Angular';
      person: Person;
      people: Person[];
      maybePerson?: Person;

      getName(): string { return this.name; }
      getPerson(): Person { return this.person; }
      getMaybePerson(): Person | undefined { return this.maybePerson; }
    }

    @Pipe({
      name: 'aPipe',
    })
    export class APipe {
      transform(n: number): number { return n + 1; }
    }

    @Directive({
      selector: '[aDir]',
      exportAs: 'aDir'
    })
    export class ADirective {
      name = 'ADirective';
    }
  `;
}

const QUICKSTART = {
  'src/app.component.ts': appComponentSource(),
  'src/app.component.html': '<h1>Hello {{name}}</h1>',
  'src/app.module.ts': `
    import { NgModule }      from '@angular/core';
    import { AppComponent, APipe, ADirective }  from './app.component';

    @NgModule({
      declarations: [ AppComponent, APipe, ADirective ],
      bootstrap:    [ AppComponent ]
    })
    export class AppModule { }
  `
};

const LOWERING_QUICKSTART = {
  'src/app.component.ts': appComponentSource(),
  'src/app.component.html': '<h1>Hello {{name}}</h1>',
  'src/app.module.ts': `
    import { NgModule, Component }      from '@angular/core';

    import { AppComponent, APipe, ADirective }  from './app.component';

    class Foo {}

    @Component({
      template: '',
      providers: [
        {provide: 'someToken', useFactory: () => new Foo()}
      ]
    })
    export class Bar {}

    @NgModule({
      declarations: [ AppComponent, APipe, ADirective, Bar ],
      bootstrap:    [ AppComponent ]
    })
    export class AppModule { }
  `
};

function expectNoDiagnostics(diagnostics: ng.Diagnostics) {
  if (diagnostics && diagnostics.length) {
    throw new Error(ng.formatDiagnostics({}, diagnostics));
  }
}
