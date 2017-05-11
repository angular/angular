/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '@angular/compiler';
import {AngularCompilerOptions, CompilerHost} from '@angular/compiler-cli';
import * as ts from 'typescript';

import {getExpressionDiagnostics, getTemplateExpressionDiagnostics} from '../../src/diagnostics/expression_diagnostics';
import {Directory} from '../mocks';

import {DiagnosticContext, MockLanguageServiceHost, getDiagnosticTemplateInfo} from './mocks';

describe('expression diagnostics', () => {
  let registry: ts.DocumentRegistry;
  let host: MockLanguageServiceHost;
  let compilerHost: CompilerHost;
  let service: ts.LanguageService;
  let context: DiagnosticContext;
  let aotHost: CompilerHost;
  let type: StaticSymbol;

  beforeAll(() => {
    registry = ts.createDocumentRegistry(false, '/src');
    host = new MockLanguageServiceHost(['app/app.component.ts'], FILES, '/src');
    service = ts.createLanguageService(host, registry);
    const program = service.getProgram();
    const checker = program.getTypeChecker();
    const options: AngularCompilerOptions = Object.create(host.getCompilationSettings());
    options.genDir = '/dist';
    options.basePath = '/src';
    aotHost = new CompilerHost(program, options, host, {verboseInvalidExpression: true});
    context = new DiagnosticContext(service, program, checker, aotHost);
    type = context.getStaticSymbol('app/app.component.ts', 'AppComponent');
  });

  it('should have no diagnostics in default app', () => {
    function messageToString(messageText: string | ts.DiagnosticMessageChain): string {
      if (typeof messageText == 'string') {
        return messageText;
      } else {
        if (messageText.next) return messageText.messageText + messageToString(messageText.next);
        return messageText.messageText;
      }
    }

    function expectNoDiagnostics(diagnostics: ts.Diagnostic[]) {
      if (diagnostics && diagnostics.length) {
        const message =
            'messags: ' + diagnostics.map(d => messageToString(d.messageText)).join('\n');
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

  function reject(template: string, expected: string | RegExp) {
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
  it('should accept an *ngFor', () => accept(`
      <div *ngFor="let p of people">
        {{p.name.first}} {{p.name.last}}
      </div>
    `));
  it('should reject misspelled field in *ngFor', () => reject(
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
  it('should reject misspelled field an async *ngFor', () => reject(
                                                           `
      <div *ngFor="let p of promised_people | async">
        {{p.name.first}} {{p.nume.last}}
      </div>
    `,
                                                           'Identifier \'nume\' is not defined'));
  it('should reject access to potentially undefined field',
     () => reject(`<div>{{maybe_person.name.first}}`, 'The expression might be null'));
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
     () => reject('{{person().name.first}}', 'Member \'person\' is not callable'));
  it('should accept an event handler',
     () => accept('<div (click)="click($event)">{{person.name.first}}</div>'));
  it('should reject a misspelled event handler',
     () => reject(
         '<div (click)="clack($event)">{{person.name.first}}</div>', 'Unknown method \'clack\''));
  it('should reject an uncalled event handler',
     () => reject(
         '<div (click)="click">{{person.name.first}}</div>', 'Unexpected callable expression'));

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