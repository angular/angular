/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directory} from '@angular/compiler-cli/test/mocks';
import {ReflectorHost} from '@angular/language-service/src/reflector_host';
import * as ts from 'typescript';

import {BuiltinType, Symbol, SymbolQuery, SymbolTable} from '../src/symbols';
import {getSymbolQuery} from '../src/typescript_symbols';

import {DiagnosticContext, MockLanguageServiceHost} from './mocks';

function emptyPipes(): SymbolTable {
  return {
    size: 0,
    get(key: string) {
      return undefined;
    },
    has(key: string) {
      return false;
    },
    values(): Symbol[] {
      return [];
    }
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
    program = service.getProgram()!;
    checker = program.getTypeChecker();
    sourceFile = program.getSourceFile('/quickstart/app/app.component.ts')!;
    const symbolResolverHost = new ReflectorHost(() => program, host);
    context = new DiagnosticContext(service, program, checker, symbolResolverHost);
    query = getSymbolQuery(program, checker, sourceFile, emptyPipes);
  });

  it('should be able to get undefined for an unknown symbol', () => {
    const unknownType = context.getStaticSymbol('/unkonwn/file.ts', 'UnknownType');
    const symbol = query.getTypeSymbol(unknownType);
    expect(symbol).toBeUndefined();
  });

  it('should return correct built-in types', () => {
    const tests: Array<[BuiltinType, boolean, ts.TypeFlags?]> = [
      // builtinType, throws, want
      [BuiltinType.Any, false, ts.TypeFlags.Any],
      [BuiltinType.Boolean, false, ts.TypeFlags.Boolean | ts.TypeFlags.Union],
      [BuiltinType.Null, false, ts.TypeFlags.Null],
      [BuiltinType.Number, false, ts.TypeFlags.Number],
      [BuiltinType.String, false, ts.TypeFlags.String],
      [BuiltinType.Undefined, false, ts.TypeFlags.Undefined],
      [BuiltinType.Unbound, true],
      [BuiltinType.Other, true],
    ];
    for (const [builtinType, throws, want] of tests) {
      if (throws) {
        expect(() => query.getBuiltinType(builtinType)).toThrow();
      } else {
        const symbol = query.getBuiltinType(builtinType);
        const got: ts.TypeFlags = (symbol as any).tsType.flags;
        expect(got).toBe(want!);
      }
    }
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
