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
import {ReflectorHost} from '@angular/language-service/src/reflector_host';
import * as ts from 'typescript';

import {Symbol, SymbolQuery, SymbolTable} from '../../src/diagnostics/symbols';
import {getSymbolQuery, toSymbolTableFactory} from '../../src/diagnostics/typescript_symbols';
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
    program = service.getProgram() !;
    checker = program.getTypeChecker();
    sourceFile = program.getSourceFile('/quickstart/app/app.component.ts') !;
    const options: CompilerOptions = Object.create(host.getCompilationSettings());
    options.genDir = '/dist';
    options.basePath = '/quickstart';
    const symbolResolverHost = new ReflectorHost(() => program, host, options);
    context = new DiagnosticContext(service, program, checker, symbolResolverHost);
    query = getSymbolQuery(program, checker, sourceFile, emptyPipes);
  });

  it('should be able to get undefined for an unknown symbol', () => {
    const unknownType = context.getStaticSymbol('/unkonwn/file.ts', 'UnknownType');
    const symbol = query.getTypeSymbol(unknownType);
    expect(symbol).toBeUndefined();
  });
});

describe('toSymbolTableFactory(tsVersion)', () => {
  it('should return a Map for versions of TypeScript >= 2.2 and a dictionary otherwise', () => {
    const a = { name: 'a' } as ts.Symbol;
    const b = { name: 'b' } as ts.Symbol;

    expect(toSymbolTableFactory('2.1')([a, b]) instanceof Map).toEqual(false);
    expect(toSymbolTableFactory('2.4')([a, b]) instanceof Map).toEqual(true);

    // Check that for the lower bound version `2.2`, toSymbolTableFactory('2.2') returns a map
    expect(toSymbolTableFactory('2.2')([a, b]) instanceof Map).toEqual(true);
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
