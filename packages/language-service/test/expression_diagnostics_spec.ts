/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '@angular/compiler';
import {Directory} from '@angular/compiler-cli/test/mocks';
import {ReflectorHost} from '@angular/language-service/src/reflector_host';
import * as ts from 'typescript';

import {getTemplateExpressionDiagnostics} from '../src/expression_diagnostics';

import {DiagnosticContext, getDiagnosticTemplateInfo, MockLanguageServiceHost} from './mocks';

describe('expression diagnostics', () => {
  let registry: ts.DocumentRegistry;

  let host: MockLanguageServiceHost;
  let service: ts.LanguageService;
  let context: DiagnosticContext;
  let type: StaticSymbol;

  beforeAll(() => {
    registry = ts.createDocumentRegistry(false, '/src');
    host = new MockLanguageServiceHost(['app/app.component.ts'], FILES, '/src');
    service = ts.createLanguageService(host, registry);
    const program = service.getProgram()!;
    const checker = program.getTypeChecker();
    const symbolResolverHost = new ReflectorHost(() => program!, host);
    context = new DiagnosticContext(service, program!, checker, symbolResolverHost);
    type = context.getStaticSymbol('app/app.component.ts', 'AppComponent');
  });

  it('should have no diagnostics in default app', () => {
    function messageToString(messageText: string|ts.DiagnosticMessageChain): string {
      if (typeof messageText == 'string') {
        return messageText;
      } else {
        if (messageText.next)
          return messageText.messageText + messageText.next.map(messageToString);
        return messageText.messageText;
      }
    }

    function expectNoDiagnostics(diagnostics: ts.Diagnostic[]) {
      if (diagnostics && diagnostics.length) {
        const message =
            'messages: ' + diagnostics.map(d => messageToString(d.messageText)).join('\n');
        expect(message).toEqual('');
      }
    }

    expectNoDiagnostics(service.getCompilerOptionsDiagnostics());
    expectNoDiagnostics(service.getSyntacticDiagnostics('app/app.component.ts'));
    expectNoDiagnostics(service.getSemanticDiagnostics('app/app.component.ts'));
  });


  function accept(template: string) {
    const info = getDiagnosticTemplateInfo(context, type, 'app/app.component.html', template);
    if (info) {
      const diagnostics = getTemplateExpressionDiagnostics(info);
      if (diagnostics && diagnostics.length) {
        const message = diagnostics.map(d => d.message).join('\n  ');
        throw new Error(`Unexpected diagnostics: ${message}`);
      }
    } else {
      expect(info).toBeDefined();
    }
  }

  function reject(template: string, expected: string) {
    const info = getDiagnosticTemplateInfo(context, type, 'app/app.component.html', template);
    if (info) {
      const diagnostics = getTemplateExpressionDiagnostics(info);
      if (diagnostics && diagnostics.length) {
        const messages = diagnostics.map(d => d.message).join('\n  ');
        expect(messages).toContain(expected);
      } else {
        throw new Error(`Expected an error containing "${expected} in template "${template}"`);
      }
    } else {
      expect(info).toBeDefined();
    }
  }

  it('should accept a simple template', () => accept('App works!'));
  it('should accept an interpolation', () => accept('App works: {{person.name.first}}'));
  it('should reject misspelled access',
     () => reject('{{persson}}', 'Identifier \'persson\' is not defined'));
  it('should reject access to private',
     () =>
         reject('{{private_person}}', 'Identifier \'private_person\' refers to a private member'));
  it('should accept an *ngIf', () => accept('<div *ngIf="person">{{person.name.first}}</div>'));
  it('should reject *ngIf of misspelled identifier',
     () => reject(
         '<div *ngIf="persson">{{person.name.first}}</div>',
         'Identifier \'persson\' is not defined'));
  it('should reject *ngIf of misspelled identifier in PrefixNot node',
     () =>
         reject('<div *ngIf="people && !persson"></div>', 'Identifier \'persson\' is not defined'));
  it('should reject misspelled field in unary operator expression',
     () => reject('{{ +persson }}', `Identifier 'persson' is not defined`));
  it('should accept an *ngFor', () => accept(`
      <div *ngFor="let p of people">
        {{p.name.first}} {{p.name.last}}
      </div>
    `));
  it('should reject misspelled field in *ngFor',
     () => reject(
         `
      <div *ngFor="let p of people">
        {{p.names.first}} {{p.name.last}}
      </div>
    `,
         'Identifier \'names\' is not defined'));
  it('should accept an async expression',
     () => accept('{{(promised_person | async)?.name.first || ""}}'));
  it('should reject an async misspelled field',
     () => reject(
         '{{(promised_person | async)?.nume.first || ""}}', 'Identifier \'nume\' is not defined'));
  it('should accept an async *ngFor', () => accept(`
      <div *ngFor="let p of promised_people | async">
        {{p.name.first}} {{p.name.last}}
      </div>
    `));
  it('should reject misspelled field an async *ngFor',
     () => reject(
         `
      <div *ngFor="let p of promised_people | async">
        {{p.name.first}} {{p.nume.last}}
      </div>
    `,
         'Identifier \'nume\' is not defined'));
  it('should accept an async *ngIf', () => accept(`
      <div *ngIf="promised_person | async as p">
        {{p.name.first}} {{p.name.last}}
      </div>
    `));
  it('should reject misspelled field in async *ngIf',
     () => reject(
         `
      <div *ngIf="promised_person | async as p">
        {{p.name.first}} {{p.nume.last}}
      </div>
    `,
         'Identifier \'nume\' is not defined'));
  it('should reject access to potentially undefined field',
     () => reject(
         `<div>{{maybe_person.name.first}}`,
         `'maybe_person' is possibly undefined. Consider using the safe navigation operator (maybe_person?.name) or non-null assertion operator (maybe_person!.name).`));
  it('should accept a safe accss to an undefined field',
     () => accept(`<div>{{maybe_person?.name.first}}</div>`));
  it('should accept a type assert to an undefined field',
     () => accept(`<div>{{maybe_person!.name.first}}</div>`));
  it('should accept a # reference', () => accept(`
          <form #f="ngForm" novalidate>
            <input name="first" ngModel required #first="ngModel">
            <input name="last" ngModel>
            <button>Submit</button>
          </form>
          <p>First name value: {{ first.value }}</p>
          <p>First name valid: {{ first.valid }}</p>
          <p>Form value: {{ f.value | json }}</p>
          <p>Form valid: {{ f.valid }}</p>
    `));
  it('should reject a misspelled field of a # reference',
     () => reject(
         `
          <form #f="ngForm" novalidate>
            <input name="first" ngModel required #first="ngModel">
            <input name="last" ngModel>
            <button>Submit</button>
          </form>
          <p>First name value: {{ first.valwe }}</p>
          <p>First name valid: {{ first.valid }}</p>
          <p>Form value: {{ f.value | json }}</p>
          <p>Form valid: {{ f.valid }}</p>
    `,
         'Identifier \'valwe\' is not defined'));
  it('should accept a call to a method', () => accept('{{getPerson().name.first}}'));
  it('should reject a misspelled field of a method result',
     () => reject('{{getPerson().nume.first}}', 'Identifier \'nume\' is not defined'));
  it('should reject calling a uncallable member',
     () => reject('{{person().name.first}}', '\'person\' is not callable'));
  it('should accept an event handler',
     () => accept('<div (click)="click($event)">{{person.name.first}}</div>'));
  it('should reject a misspelled event handler',
     () => reject(
         '<div (click)="clack($event)">{{person.name.first}}</div>',
         `Identifier 'clack' is not defined. The component declaration, template variable declarations, and element references do not contain such a member`));
  it('should reject an uncalled event handler',
     () => reject(
         '<div (click)="click">{{person.name.first}}</div>', 'Unexpected callable expression'));
  describe('with comparisons between nullable and non-nullable', () => {
    it('should accept ==', () => accept(`<div>{{e == 1 ? 'a' : 'b'}}</div>`));
    it('should accept ===', () => accept(`<div>{{e === 1 ? 'a' : 'b'}}</div>`));
    it('should accept !=', () => accept(`<div>{{e != 1 ? 'a' : 'b'}}</div>`));
    it('should accept !==', () => accept(`<div>{{e !== 1 ? 'a' : 'b'}}</div>`));
    it('should accept &&', () => accept(`<div>{{e && 1 ? 'a' : 'b'}}</div>`));
    it('should accept ||', () => accept(`<div>{{e || 1 ? 'a' : 'b'}}</div>`));
    it('should reject >',
       () => reject(`<div>{{e > 1 ? 'a' : 'b'}}</div>`, 'The expression might be null'));
  });
});

const FILES: Directory = {
  'src': {
    'app': {
      'app.component.ts': `
        import { Component, NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';
        import { FormsModule } from '@angular/forms';

        export interface Person {
          name: Name;
          address: Address;
        }

        export interface Name {
          first: string;
          middle: string;
          last: string;
        }

        export interface Address {
          street: string;
          city: string;
          state: string;
          zip: string;
        }

        @Component({
          selector: 'my-app',
          templateUrl: './app.component.html'
        })
        export class AppComponent {
          person: Person;
          people: Person[];
          maybe_person?: Person;
          promised_person: Promise<Person>;
          promised_people: Promise<Person[]>;
          private private_person: Person;
          private private_people: Person[];
          e?: number;

          getPerson(): Person { return this.person; }
          click() {}
        }

        @NgModule({
          imports: [CommonModule, FormsModule],
          declarations: [AppComponent]
        })
        export class AppModule {}
      `
    }
  }
};
