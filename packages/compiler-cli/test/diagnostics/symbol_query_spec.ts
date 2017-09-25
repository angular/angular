/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '@angular/compiler';
import {CompilerHost} from '@angular/compiler-cli';
import {EmittingCompilerHost, MockAotCompilerHost, MockCompilerHost, MockData, MockDirectory, MockMetadataBundlerHost, arrayToMockDir, arrayToMockMap, isSource, settings, setup, toMockFileArray} from '@angular/compiler/test/aot/test_util';
import * as ts from 'typescript';

import {Symbol, SymbolQuery, SymbolTable} from '../../src/diagnostics/symbols';
import {getSymbolQuery} from '../../src/diagnostics/typescript_symbols';
import {CompilerOptions} from '../../src/transformers/api';
import {Directory} from '../mocks';

import {DiagnosticContext, MockLanguageServiceHost} from './mocks';

function emptyPipes(): SymbolTable {
  return {
    size: 0,
    get(key: string) { return undefined; },
    has(key: string) { return false; },
    values(): Symbol[]{return [];}
  };
}

describe('symbol query', () => {
  let program: ts.Program;
  let checker: ts.TypeChecker;
  let sourceFile: ts.SourceFile;
  let query: SymbolQuery;
  let context: DiagnosticContext;
  beforeEach(() => {
    const registry = ts.createDocumentRegistry(false, '/src');
    const host = new MockLanguageServiceHost(
        ['/quickstart/app/app.component.ts'], QUICKSTART, '/quickstart');
    const service = ts.createLanguageService(host, registry);
    program = service.getProgram();
    checker = program.getTypeChecker();
    sourceFile = program.getSourceFile('/quickstart/app/app.component.ts');
    const options: CompilerOptions = Object.create(host.getCompilationSettings());
    options.genDir = '/dist';
    options.basePath = '/quickstart';
    const aotHost = new CompilerHost(program, options, host, {verboseInvalidExpression: true});
    context = new DiagnosticContext(service, program, checker, aotHost);
    query = getSymbolQuery(program, checker, sourceFile, emptyPipes);
  });

  it('should be able to get undefined for an unknown symbol', () => {
    const unknownType = context.getStaticSymbol('/unkonwn/file.ts', 'UnknownType');
    const symbol = query.getTypeSymbol(unknownType);
    expect(symbol).toBeUndefined();
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

const QUICKSTART: Directory = {
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
