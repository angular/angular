/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompilerOptions, createAotCompiler} from '@angular/compiler';
import {EmittingCompilerHost, MockAotCompilerHost, MockCompilerHost, MockData, MockDirectory, MockMetadataBundlerHost, arrayToMockDir, arrayToMockMap, isSource, settings, setup, toMockFileArray} from '@angular/compiler/test/aot/test_util';
import * as ts from 'typescript';

import {TypeChecker} from '../../src/diagnostics/check_types';
import {Diagnostic} from '../../src/transformers/api';
import {LowerMetadataCache} from '../../src/transformers/lower_expressions';

function compile(
    rootDirs: MockData, options: AotCompilerOptions = {},
    tsOptions: ts.CompilerOptions = {}): Diagnostic[] {
  const rootDirArr = toMockFileArray(rootDirs);
  const scriptNames = rootDirArr.map(entry => entry.fileName).filter(isSource);
  const host = new MockCompilerHost(scriptNames, arrayToMockDir(rootDirArr));
  const aotHost = new MockAotCompilerHost(host, new LowerMetadataCache({}));
  const tsSettings = {...settings, ...tsOptions};
  const program = ts.createProgram(host.scriptNames.slice(0), tsSettings, host);
  const ngChecker = new TypeChecker(program, tsSettings, host, aotHost, options);
  return ngChecker.getDiagnostics();
}

describe('ng type checker', () => {
  let angularFiles = setup();

  function accept(...files: MockDirectory[]) {
    expectNoDiagnostics(compile([angularFiles, QUICKSTART, ...files]));
  }

  function reject(message: string | RegExp, ...files: MockDirectory[]) {
    const diagnostics = compile([angularFiles, QUICKSTART, ...files]);
    if (!diagnostics || !diagnostics.length) {
      throw new Error('Expected a diagnostic erorr message');
    } else {
      const matches: (d: Diagnostic) => boolean = typeof message === 'string' ?
          d => d.messageText == message :
          d => message.test(d.messageText);
      const matchingDiagnostics = diagnostics.filter(matches);
      if (!matchingDiagnostics || !matchingDiagnostics.length) {
        throw new Error(
            `Expected a diagnostics matching ${message}, received\n  ${diagnostics.map(d => d.messageText).join('\n  ')}`);
      }
    }
  }

  it('should accept unmodified QuickStart', () => { accept(); });

  describe('with modified quickstart', () => {
    function a(template: string) {
      accept({quickstart: {app: {'app.component.ts': appComponentSource(template)}}});
    }

    function r(template: string, message: string | RegExp) {
      reject(message, {quickstart: {app: {'app.component.ts': appComponentSource(template)}}});
    }

    it('should report an invalid field access',
       () => { r('{{fame}}', `Property 'fame' does not exist on type 'AppComponent'.`); });
    it('should reject a reference to a field of a nullable',
       () => { r('{{maybePerson.name}}', `Object is possibly 'undefined'.`); });
    it('should accept a reference to a field of a nullable using using non-null-assert',
       () => { a('{{maybePerson!.name}}'); });
    it('should accept a safe property access of a nullable person',
       () => { a('{{maybePerson?.name}}'); });
    it('should accept a function call', () => { a('{{getName()}}'); });
    it('should reject an invalid method', () => {
      r('{{getFame()}}',
        `Property 'getFame' does not exist on type 'AppComponent'. Did you mean 'getName'?`);
    });
    it('should accept a field access of a method result', () => { a('{{getPerson().name}}'); });
    it('should reject an invalid field reference of a method result',
       () => { r('{{getPerson().fame}}', `Property 'fame' does not exist on type 'Person'.`); });
    it('should reject an access to a nullable field of a method result',
       () => { r('{{getMaybePerson().name}}', `Object is possibly 'undefined'.`); });
    it('should accept a nullable assert of a nullable field refernces of a method result',
       () => { a('{{getMaybePerson()!.name}}'); });
    it('should accept a safe property access of a nullable field reference of a method result',
       () => { a('{{getMaybePerson()?.name}}'); });
  });

  describe('with lowered expressions', () => {
    it('should not report lowered expressions as errors', () => {
      expectNoDiagnostics(compile([angularFiles, LOWERING_QUICKSTART]));
    });
  });
});

function appComponentSource(template: string): string {
  return `
    import {Component} from '@angular/core';

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
      template: '${template}'
    })
    export class AppComponent {
      name = 'Angular';
      person: Person;
      people: Person[];
      maybePerson?: Person;

      getName(): string { return this.name; }
      getPerson(): Person { return this.person; }
      getMaybePerson(): Person | undefined { this.maybePerson; }
    }
  `;
}

const QUICKSTART: MockDirectory = {
  quickstart: {
    app: {
      'app.component.ts': appComponentSource('<h1>Hello {{name}}</h1>'),
      'app.module.ts': `
        import { NgModule }      from '@angular/core';
        import { toString }      from './utils';

        import { AppComponent }  from './app.component';

        @NgModule({
          declarations: [ AppComponent ],
          bootstrap:    [ AppComponent ]
        })
        export class AppModule { }
      `
    }
  }
};

const LOWERING_QUICKSTART: MockDirectory = {
  quickstart: {
    app: {
      'app.component.ts': appComponentSource('<h1>Hello {{name}}</h1>'),
      'app.module.ts': `
        import { NgModule, Component }      from '@angular/core';
        import { toString }      from './utils';

        import { AppComponent }  from './app.component';

        class Foo {}

        @Component({
          template: '',
          providers: [
            {provide: 'someToken', useFactory: () => new Foo()}
          ]
        })
        export class Bar {}

        @NgModule({
          declarations: [ AppComponent, Bar ],
          bootstrap:    [ AppComponent ]
        })
        export class AppModule { }
      `
    }
  }
};

function expectNoDiagnostics(diagnostics: Diagnostic[]) {
  if (diagnostics && diagnostics.length) {
    throw new Error(diagnostics.map(d => `${d.span}: ${d.messageText}`).join('\n'));
  }
}
