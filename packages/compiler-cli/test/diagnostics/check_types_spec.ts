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

function getNgRootDir() {
  const moduleFilename = module.filename.replace(/\\/g, '/');
  const distIndex = moduleFilename.indexOf('/dist/all');
  return moduleFilename.substr(0, distIndex);
}

describe('ng type checker', () => {
  let basePath: string;
  let write: (fileName: string, content: string) => void;
  let errorSpy: jasmine.Spy&((s: string) => void);

  function compileAndCheck(
      mockDirs: {[fileName: string]: string}[],
      overrideOptions: ng.CompilerOptions = {}): ng.Diagnostics {
    const fileNames: string[] = [];
    mockDirs.forEach((dir) => {
      Object.keys(dir).forEach((fileName) => {
        if (fileName.endsWith('.ts')) {
          fileNames.push(path.resolve(basePath, fileName));
        }
        write(fileName, dir[fileName]);
      });
    });
    const options: ng.CompilerOptions = {
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
      'typeRoots': [path.resolve(basePath, 'node_modules/@types')], ...overrideOptions
    };
    const {diagnostics} = ng.performCompilation({rootNames: fileNames, options});
    return diagnostics;
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

  function accept(
      files: {[fileName: string]: string} = {}, overrideOptions: ng.CompilerOptions = {}) {
    expectNoDiagnostics(compileAndCheck([QUICKSTART, files], overrideOptions));
  }

  function reject(
      message: string | RegExp, location: RegExp, files: {[fileName: string]: string},
      overrideOptions: ng.CompilerOptions = {}) {
    const diagnostics = compileAndCheck([QUICKSTART, files], overrideOptions);
    if (!diagnostics || !diagnostics.length) {
      throw new Error('Expected a diagnostic erorr message');
    } else {
      const matches: (d: ng.Diagnostic) => boolean = typeof message === 'string' ?
          d => ng.isNgDiagnostic(d)&& d.messageText == message :
          d => ng.isNgDiagnostic(d) && message.test(d.messageText);
      const matchingDiagnostics = diagnostics.filter(matches) as ng.Diagnostic[];
      if (!matchingDiagnostics || !matchingDiagnostics.length) {
        throw new Error(
            `Expected a diagnostics matching ${message}, received\n  ${diagnostics.map(d => d.messageText).join('\n  ')}`);
      }

      const span = matchingDiagnostics[0].span;
      if (!span) {
        throw new Error('Expected a sourceSpan');
      }
      expect(`${span.start.file.url}@${span.start.line}:${span.start.offset}`).toMatch(location);
    }
  }

  it('should accept unmodified QuickStart', () => { accept(); });

  it('should accept unmodified QuickStart with tests for unused variables', () => {
    accept({}, {
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
    });
  });

  describe('with modified quickstart (fullTemplateTypeCheck: false)', () => {
    addTests({fullTemplateTypeCheck: false});
  });

  describe('with modified quickstart (fullTemplateTypeCheck: true)', () => {
    addTests({fullTemplateTypeCheck: true});
  });

  function addTests(config: {fullTemplateTypeCheck: boolean}) {
    function a(template: string) { accept({'src/app.component.html': template}, config); }

    function r(template: string, message: string | RegExp, location: string) {
      reject(
          message, new RegExp(`app\.component\.html\@${location}$`),
          {'src/app.component.html': template}, config);
    }

    function rejectOnlyWithFullTemplateTypeCheck(
        template: string, message: string | RegExp, location: string) {
      if (config.fullTemplateTypeCheck) {
        r(template, message, location);
      } else {
        a(template);
      }
    }

    it('should report an invalid field access', () => {
      r('<div>{{fame}}<div>', `Property 'fame' does not exist on type 'AppComponent'.`, '0:5');
    });
    it('should reject a reference to a field of a nullable',
       () => { r('<div>{{maybePerson.name}}</div>', `Object is possibly 'undefined'.`, '0:5'); });
    it('should accept a reference to a field of a nullable using using non-null-assert',
       () => { a('{{maybePerson!.name}}'); });
    it('should accept a safe property access of a nullable person',
       () => { a('{{maybePerson?.name}}'); });
    it('should accept a function call', () => { a('{{getName()}}'); });
    it('should reject an invalid method', () => {
      r('<div>{{getFame()}}</div>',
        `Property 'getFame' does not exist on type 'AppComponent'. Did you mean 'getName'?`, '0:5');
    });
    it('should accept a field access of a method result', () => { a('{{getPerson().name}}'); });
    it('should reject an invalid field reference of a method result', () => {
      r('<div>{{getPerson().fame}}</div>', `Property 'fame' does not exist on type 'Person'.`,
        '0:5');
    });
    it('should reject an access to a nullable field of a method result', () => {
      r('<div>{{getMaybePerson().name}}</div>', `Object is possibly 'undefined'.`, '0:5');
    });
    it('should accept a nullable assert of a nullable field refernces of a method result',
       () => { a('{{getMaybePerson()!.name}}'); });
    it('should accept a safe property access of a nullable field reference of a method result',
       () => { a('{{getMaybePerson()?.name}}'); });

    it('should report an invalid field access inside of an ng-template', () => {
      rejectOnlyWithFullTemplateTypeCheck(
          '<ng-template>{{fame}}</ng-template>',
          `Property 'fame' does not exist on type 'AppComponent'.`, '0:13');
    });
    it('should report an invalid call to a pipe', () => {
      rejectOnlyWithFullTemplateTypeCheck(
          '<div>{{"hello" | aPipe}}</div>',
          `Argument of type '"hello"' is not assignable to parameter of type 'number'.`, '0:5');
    });
    it('should report an invalid property on an exportAs directive', () => {
      rejectOnlyWithFullTemplateTypeCheck(
          '<div aDir #aDir="aDir">{{aDir.fname}}</div>',
          `Property 'fname' does not exist on type 'ADirective'. Did you mean 'name'?`, '0:23');
    });
  }

  describe('with lowered expressions', () => {
    it('should not report lowered expressions as errors',
       () => { expectNoDiagnostics(compileAndCheck([LOWERING_QUICKSTART])); });
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
