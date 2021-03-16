/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {createLanguageService} from '../src/language_service';
import {TypeScriptServiceHost} from '../src/typescript_host';
import {MockTypescriptHost} from './test_utils';

/**
 * Note: If we want to test that a specific diagnostic message is emitted, then
 * use the `mockHost.addCode()` helper method to add code to an existing file and check
 * that the diagnostic messages contain the expected output.
 *
 * If the goal is to assert that there is no error in a specific file, then use
 * `mockHost.override()` method to completely override an existing file, and
 * make sure no diagnostics are produced. When doing so, be extra cautious
 * about import statements and make sure to assert empty TS diagnostic messages
 * as well.
 */

const TEST_TEMPLATE = '/app/test.ng';
const APP_COMPONENT = '/app/app.component.ts';

describe('diagnostics', () => {
  const mockHost = new MockTypescriptHost(['/app/main.ts', '/app/parsing-cases.ts']);
  const tsLS = ts.createLanguageService(mockHost);
  const ngHost = new TypeScriptServiceHost(mockHost, tsLS);
  const ngLS = createLanguageService(ngHost);

  beforeEach(() => {
    mockHost.reset();
  });

  it('should produce no diagnostics for test.ng', () => {
    // there should not be any errors on existing external template
    expect(ngLS.getSemanticDiagnostics('/app/test.ng')).toEqual([]);
  });

  it('should not return TS and NG errors for existing files', () => {
    const files = [
      '/app/app.component.ts',
      '/app/main.ts',
    ];
    for (const file of files) {
      const syntaxDiags = tsLS.getSyntacticDiagnostics(file);
      expect(syntaxDiags).toEqual([]);
      const semanticDiags = tsLS.getSemanticDiagnostics(file);
      expect(semanticDiags).toEqual([]);
      const ngDiags = ngLS.getSemanticDiagnostics(file);
      expect(ngDiags).toEqual([]);
    }
  });

  it('should report error for unexpected end of expression', () => {
    const content = mockHost.override(TEST_TEMPLATE, `{{ 5 / }}`);
    const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(diags.length).toBe(1);
    const {messageText, start, length} = diags[0];
    expect(messageText)
        .toBe(
            'Parser Error: Unexpected end of expression: {{ 5 / }} ' +
            'at the end of the expression [{{ 5 / }}] in /app/test.ng@0:0');
    expect(start).toBe(0);
    expect(length).toBe(content.length);
  });

  // https://github.com/angular/vscode-ng-language-service/issues/242
  it('should support $any() type cast function', () => {
    mockHost.override(TEST_TEMPLATE, `<div>{{$any(title).xyz}}</div>`);
    const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(diags).toEqual([]);
  });

  it('should report error for $any() with incorrect number of arguments', () => {
    const templates = [
      '<div>{{$any().xyz}}</div>',              // no argument
      '<div>{{$any(title, title).xyz}}</div>',  // two arguments
    ];
    for (const template of templates) {
      mockHost.override(TEST_TEMPLATE, template);
      const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe('Unable to resolve signature for call of $any');
    }
  });

  it('should not produce diagnostics for absolute template url', () => {
    mockHost.override(APP_COMPONENT, `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: '${TEST_TEMPLATE}',
      })
      export class AppComponent {}
    `);
    const diags = ngLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(diags).toEqual([]);
  });

  it('should not produce diagnostics for slice pipe with arguments', () => {
    mockHost.override(TEST_TEMPLATE, `
      <div *ngFor="let h of heroes | slice:0:1">
        {{h.name}}
      </div>`);
    const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(diags).toEqual([]);
  });

  it('should produce diagnostics for slice pipe with args when member is invalid', () => {
    mockHost.override(TEST_TEMPLATE, `
      <div *ngFor="let h of heroes | slice:0:1">
        {{h.age}}
      </div>`);
    const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(diags.length).toBe(1);
    expect(diags[0].messageText)
        .toBe(`Identifier 'age' is not defined. 'Hero' does not contain such a member`);
  });

  it('should not report error for variable initialized as class method', () => {
    mockHost.override(TEST_TEMPLATE, `
      <ng-template let-greet="myClick">
        <span (click)="greet()"></span>
      </ng-template>
    `);
    const diagnostics = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(diagnostics).toEqual([]);
  });

  describe('diagnostics for expression comparisons', () => {
    for (let [left, right, leftTy, rightTy] of [
             ['\'abc\'', 1, 'string', 'number'],
             ['hero', 2, 'object', 'number'],
             ['strOrNumber', 'hero', 'string|number', 'object'],
    ]) {
      it(`it should report errors for mismtched types in a comparison: ${leftTy} and ${rightTy}`,
         () => {
           mockHost.override(TEST_TEMPLATE, `{{ ${left} != ${right} }}`);
           const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
           expect(diags.length).toBe(1);
           expect(diags[0].messageText).toBe(`Expected operands to be of comparable types or any`);
         });
    }

    for (let [left, right, leftTy, rightTy] of [
             ['\'abc\'', 'anyValue', 'string', 'any'],
             ['\'abc\'', null, 'string', 'null'],
             ['\'abc\'', undefined, 'string', 'undefined'],
             [null, null, 'null', 'null'],
             ['{a: 1}', '{b: 2}', 'object', 'object'],
             ['strOrNumber', '1', 'string|number', 'number'],
    ]) {
      it(`it should not report errors for compatible types in a comparison: ${leftTy} and ${
             rightTy}`,
         () => {
           mockHost.override(TEST_TEMPLATE, `{{ ${left} != ${right} }}`);
           const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
           expect(diags.length).toBe(0);
         });
    }
  });

  describe('diagnostics for ngFor exported values', () => {
    it('should report errors for mismatched exported types', () => {
      mockHost.override(TEST_TEMPLATE, `
        <div *ngFor="let hero of heroes; let i = index; let isFirst = first">
            'i' is a number; 'isFirst' is a boolean
          {{ i === isFirst }}
        </div>
      `);
      const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Expected operands to be of comparable types or any`);
    });

    it('should not report errors for matching exported type', () => {
      mockHost.override(TEST_TEMPLATE, `
        <div *ngFor="let hero of heroes; let i = index">
            'i' is a number
          {{ i < 2 }}
        </div>
      `);
      const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(diags.length).toBe(0);
    });
  });

  describe('diagnostics for ngIf exported values', () => {
    it('should infer the type of an implicit value in an NgIf context', () => {
      mockHost.override(TEST_TEMPLATE, `
        <div *ngIf="title; let titleProxy;">
            'titleProxy' is a string
          {{titleProxy.~{start-err}notAProperty~{end-err}}}
        </div>
      `);
      const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(diags.length).toBe(1);
      const {messageText, start, length} = diags[0];
      expect(messageText)
          .toBe(
              `Identifier 'notAProperty' is not defined. 'string' does not contain such a member`);
      const span = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'err');
      expect(start).toBe(span.start);
      expect(length).toBe(span.length);
    });

    it('should infer the type of an ngIf value in an NgIf context', () => {
      mockHost.override(TEST_TEMPLATE, `
        <div *ngIf="title as titleProxy">
            'titleProxy' is a string
          {{titleProxy.~{start-err}notAProperty~{end-err}}}
        </div>
      `);
      const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(diags.length).toBe(1);
      const {messageText, start, length} = diags[0];
      expect(messageText)
          .toBe(
              `Identifier 'notAProperty' is not defined. 'string' does not contain such a member`);
      const span = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'err');
      expect(start).toBe(span.start);
      expect(length).toBe(span.length);
    });
  });

  describe('diagnostics for invalid indexed type property access', () => {
    it('should work with numeric index signatures (arrays)', () => {
      mockHost.override(TEST_TEMPLATE, `
        {{heroes[0].badProperty}}`);
      const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(diags.length).toBe(1);
      expect(diags[0].messageText)
          .toBe(`Identifier 'badProperty' is not defined. 'Hero' does not contain such a member`);
    });

    describe('with string index signatures', () => {
      it('should work with index notation', () => {
        mockHost.override(TEST_TEMPLATE, `
        {{heroesByName['Jacky'].badProperty}}`);
        const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toBe(`Identifier 'badProperty' is not defined. 'Hero' does not contain such a member`);
      });

      it('should work with dot notation', () => {
        mockHost.override(TEST_TEMPLATE, `
        {{heroesByName.jacky.badProperty}}`);
        const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toBe(`Identifier 'badProperty' is not defined. 'Hero' does not contain such a member`);
      });

      it('should not produce errors with dot notation if stringIndexType is a primitive type',
         () => {
           mockHost.override(TEST_TEMPLATE, `{{primitiveIndexType.test}}`);
           const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
           expect(diags.length).toBe(0);
         });
    });
  });

  it('should produce diagnostics for invalid tuple type property access', () => {
    mockHost.override(TEST_TEMPLATE, `
        {{tupleArray[1].badProperty}}`);
    const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(diags.length).toBe(1);
    expect(diags[0].messageText)
        .toBe(`Identifier 'badProperty' is not defined. 'Hero' does not contain such a member`);
  });

  it('should not produce errors if tuple array index out of bound', () => {
    mockHost.override(TEST_TEMPLATE, `
        {{tupleArray[2].badProperty}}`);
    const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(diags).toEqual([]);
  });

  it('should not produce errors on function.bind()', () => {
    mockHost.override(TEST_TEMPLATE, `
      <test-comp (test)="myClick.bind(this)">
      </test-comp>`);
    const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(diags).toEqual([]);
  });

  it('should report access to an unknown field', () => {
    mockHost.override(TEST_TEMPLATE, `{{ foo }}`);
    const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE).map(d => d.messageText);
    expect(diags).toContain(
        `Identifier 'foo' is not defined. ` +
        `The component declaration, template variable declarations, ` +
        `and element references do not contain such a member`);
  });

  it('should report access to an unknown sub-field', () => {
    mockHost.override(TEST_TEMPLATE, `{{ hero.nam }}`);
    const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE).map(d => d.messageText);
    expect(diags).toContain(
        `Identifier 'nam' is not defined. 'Hero' does not contain such a member`);
  });

  it('should report access to a private member', () => {
    mockHost.override(TEST_TEMPLATE, `{{ myField }}`);
    const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE).map(d => d.messageText);
    expect(diags).toContain(`Identifier 'myField' refers to a private member of the component`);
  });

  it('should report numeric operator errors', () => {
    mockHost.override(TEST_TEMPLATE, `{{ 'a' % 2 }}`);
    const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE).map(d => d.messageText);
    expect(diags).toContain('Expected a number type');
  });

  it('should report an unknown field', () => {
    mockHost.override(TEST_TEMPLATE, `<div *ngFor="let person of people"></div>`);
    const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE).map(d => d.messageText);
    expect(diags).toContain(
        `Identifier 'people' is not defined. ` +
        `The component declaration, template variable declarations, ` +
        `and element references do not contain such a member`);
  });

  it('should report an unknown value in a key expression', () => {
    mockHost.override(TEST_TEMPLATE, `<div *ngFor="let hero of heroes; trackBy: trackByFn"></div>`);
    const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE).map(d => d.messageText);
    expect(diags).toContain(
        `Identifier 'trackByFn' is not defined. ` +
        `The component declaration, template variable declarations, ` +
        `and element references do not contain such a member`);
  });

  describe('embedded templates', () => {
    it('should suggest refining a template context missing a property', () => {
      mockHost.override(
          TEST_TEMPLATE,
          `<button type="button" *counter="~{start-emb}let hero ~{end-emb}of heroes"></button>`);
      const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(diags.length).toBe(1);
      const {messageText, start, length, category} = diags[0];
      expect(category).toBe(ts.DiagnosticCategory.Suggestion);
      expect(messageText)
          .toBe(
              `The template context of 'CounterDirective' does not define an implicit value.\n` +
                  `If the context type is a base type or 'any', consider refining it to a more specific type.`,
          );

      const span = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'emb');
      expect(start).toBe(span.start);
      expect(length).toBe(span.length);
    });

    it('should report an unknown context reference', () => {
      mockHost.override(
          TEST_TEMPLATE,
          `<div *ngFor="let hero of heroes; ~{start-emb}let e = even_1~{end-emb}"></div>`);
      const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(diags.length).toBe(1);
      const {messageText, start, length, category} = diags[0];
      expect(category).toBe(ts.DiagnosticCategory.Suggestion);
      expect(messageText)
          .toBe(
              `The template context of 'NgForOf' does not define a member called 'even_1'.\n` +
              `If the context type is a base type or 'any', consider refining it to a more specific type.`);

      const span = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'emb');
      expect(start).toBe(span.start);
      expect(length).toBe(span.length);
    });

    it('report an unknown field in $implicit context', () => {
      mockHost.override(TEST_TEMPLATE, `
        <div *withContext="let myVar">
          {{ myVar.~{start-emb}missingField~{end-emb} }}
        </div>
      `);
      const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(diags.length).toBe(1);
      const {messageText, start, length, category} = diags[0];
      expect(category).toBe(ts.DiagnosticCategory.Error);
      expect(messageText)
          .toBe(
              `Identifier 'missingField' is not defined. '{ implicitPerson: Hero; }' does not contain such a member`,
          );
      const span = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'emb');
      expect(start).toBe(span.start);
      expect(length).toBe(span.length);
    });

    it('report an unknown field in non implicit context', () => {
      mockHost.override(TEST_TEMPLATE, `
        <div *withContext="let myVar = nonImplicitPerson">
          {{ myVar.~{start-emb}missingField~{end-emb} }}
        </div>
      `);
      const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(diags.length).toBe(1);
      const {messageText, start, length, category} = diags[0];
      expect(category).toBe(ts.DiagnosticCategory.Error);
      expect(messageText)
          .toBe(
              `Identifier 'missingField' is not defined. 'Hero' does not contain such a member`,
          );
      const span = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'emb');
      expect(start).toBe(span.start);
      expect(length).toBe(span.length);
    });
  });

  // #17611
  it('should not report diagnostic on iteration of any', () => {
    const fileName = '/app/test.ng';
    mockHost.override(fileName, '<div *ngFor="let value of anyValue">{{value.someField}}</div>');
    const diagnostics = ngLS.getSemanticDiagnostics(fileName);
    expect(diagnostics).toEqual([]);
  });

  it('should report diagnostic for invalid property in nested ngFor', () => {
    const content = mockHost.override(TEST_TEMPLATE, `
      <div *ngFor="let leagueMembers of league">
        <div *ngFor="let member of leagueMembers">
          {{member.xyz}}
        </div>
      </div>
    `);
    const diagnostics = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(diagnostics.length).toBe(1);
    const {messageText, start, length} = diagnostics[0];
    expect(messageText)
        .toBe(`Identifier 'xyz' is not defined. 'Hero' does not contain such a member`);
    expect(content.substring(start!, start! + length!)).toBe('xyz');
  });

  describe('with $event', () => {
    it('should accept an event', () => {
      mockHost.override(TEST_TEMPLATE, '<div (click)="myClick($event)">Click me!</div>');
      const diagnostics = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(diagnostics).toEqual([]);
    });

    it('should reject it when not in an event binding', () => {
      const content = mockHost.override(TEST_TEMPLATE, '<div [tabIndex]="$event"></div>');
      const diagnostics = ngLS.getSemanticDiagnostics(TEST_TEMPLATE)!;
      expect(diagnostics.length).toBe(1);
      const {messageText, start, length} = diagnostics[0];
      expect(messageText)
          .toBe(
              `Identifier '$event' is not defined. The component declaration, template variable declarations, and element references do not contain such a member`);
      const keyword = '$event';
      expect(start).toBe(content.lastIndexOf(keyword));
      expect(length).toBe(keyword.length);
    });

    it('should reject invalid properties on an event type', () => {
      const content = mockHost.override(
          TEST_TEMPLATE, '<div string-model (modelChange)="$event.notSubstring()"></div>');
      const diagnostics = ngLS.getSemanticDiagnostics(TEST_TEMPLATE)!;
      expect(diagnostics.length).toBe(1);
      const {messageText, start, length} = diagnostics[0];
      expect(messageText)
          .toBe(
              `Identifier 'notSubstring' is not defined. 'string' does not contain such a member`);
      expect(content.substring(start!, start! + length!)).toBe('notSubstring');
    });
  });

  it('should not crash with a incomplete *ngFor', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<div *ngFor></div> ~{after-div}'
      })
      export class MyComponent {}`);
    expect(() => ngLS.getSemanticDiagnostics(fileName)).not.toThrow();
  });

  it('should report a component not in a module', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<div></div>'
      })
      export class MyComponent {}`);
    const diagnostics = ngLS.getSemanticDiagnostics(fileName)!;
    expect(diagnostics.length).toBe(1);
    const {messageText, start, length} = diagnostics[0];
    expect(messageText)
        .toBe(
            `Component 'MyComponent' is not included in a module and will not be available inside a template. Consider adding it to a NgModule declaration.`);
    const content = mockHost.readFile(fileName)!;
    expect(content.substring(start!, start! + length!)).toBe('MyComponent');
  });


  it(`should not report an error for a form's host directives`, () => {
    mockHost.override(APP_COMPONENT, `
      import { Component } from '@angular/core';

      @Component({
        template: '<form></form>'})
      export class AppComponent {}`);
    const tsDiags = tsLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(ngDiags).toEqual([]);
  });

  it('should not throw getting diagnostics for an index expression', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<a *ngIf="(auth.isAdmin | async) || (event.leads && event.leads[(auth.uid | async)])"></a>'
      })
      export class MyComponent {}`);
    expect(() => ngLS.getSemanticDiagnostics(fileName)).not.toThrow();
  });

  it('should not throw using a directive with no value', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<form><input [(ngModel)]="name" required /></form>'
      })
      export class MyComponent {
        name = 'some name';
      }`);
    expect(() => ngLS.getSemanticDiagnostics(fileName)).not.toThrow();
  });

  it('should report an error for invalid metadata', () => {
    const content = mockHost.override(APP_COMPONENT, `
      import { Component } from '@angular/core';

      @Component({
        template: '<div></div>',
        providers: [
          {provide: 'foo', useFactory: () => 'foo' }
        ]
      })
      export class AppComponent {
        name = 'some name';
      }`);
    const tsDiags = tsLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getSemanticDiagnostics(APP_COMPONENT)!;
    expect(ngDiags.length).toBe(1);
    const {messageText, start, length} = ngDiags[0];
    const keyword = `() => 'foo'`;
    expect(start).toBe(content.lastIndexOf(keyword));
    expect(length).toBe(keyword.length);
    // messageText is a three-part chain
    const firstPart = messageText as ts.DiagnosticMessageChain;
    expect(firstPart.messageText).toBe(`Error during template compile of 'AppComponent'`);
    const secondPart = firstPart.next!;
    expect(secondPart[0].messageText).toBe('Function expressions are not supported in decorators');
    const thirdPart = secondPart[0].next!;
    expect(thirdPart[0].messageText)
        .toBe('Consider changing the function expression into an exported function');
    expect(thirdPart[0].next).toBeFalsy();
  });

  it('should not throw for an invalid class', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: ''
      }) class`);
    expect(() => ngLS.getSemanticDiagnostics(fileName)).not.toThrow();
  });

  it('should not report an error for sub-types of string in non-strict mode', () => {
    mockHost.override(APP_COMPONENT, `
      import { Component } from '@angular/core';

      @Component({
        template: \`<div *ngIf="something === 'foo'"></div>\`
      })
      export class AppComponent {
        something: 'foo' | 'bar';
      }`);
    mockHost.overrideOptions({
      strict: false,  // TODO: this test fails in strict mode
    });
    const tsDiags = tsLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(ngDiags).toEqual([]);
  });

  it('should not report an error for sub-types of number in non-strict mode', () => {
    mockHost.override(APP_COMPONENT, `
      import { Component } from '@angular/core';

      @Component({
        template: '<div *ngIf="something === 123"></div>'
      })
      export class AppComponent {
        something: 123 | 456;
      }`);
    mockHost.overrideOptions({
      strict: false,  // TODO: This test fails in strict mode
    });
    const tsDiags = tsLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(ngDiags).toEqual([]);
  });

  it('should report a warning if an event results in a callable expression', () => {
    const content = mockHost.override(APP_COMPONENT, `
      import { Component } from '@angular/core';

      @Component({
        template: '<div (click)="onClick"></div>'
      })
      export class AppComponent {
        onClick() { }
      }`);
    const diagnostics = ngLS.getSemanticDiagnostics(APP_COMPONENT)!;
    const {messageText, start, length} = diagnostics[0];
    expect(messageText).toBe('Unexpected callable expression. Expected a method call');
    const keyword = `"onClick"`;
    expect(start).toBe(content.lastIndexOf(keyword) + 1);  // exclude leading quote
    expect(length).toBe(keyword.length - 2);               // exclude leading and trailing quotes
  });

  // Issue #13326
  it('should report a narrow span for invalid pipes', () => {
    const content = mockHost.override(APP_COMPONENT, `
      import { Component } from '@angular/core';

      @Component({
        template: '<p> Using an invalid pipe {{data | dat}} </p>'
      })
      export class AppComponent {
        data = 'some data';
      }`);
    const tsDiags = tsLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(ngDiags.length).toBe(1);
    const {messageText, start, length} = ngDiags[0];
    expect(messageText).toBe(`The pipe 'dat' could not be found`);
    const keyword = 'data | dat';
    expect(start).toBe(content.lastIndexOf(keyword));
    expect(length).toBe(keyword.length);
  });

  // Issue #19406
  it('should allow empty template', () => {
    mockHost.override(APP_COMPONENT, `
      import { Component } from '@angular/core';

      @Component({
        template : '',
      })
      export class AppComponent {}`);
    const tsDiags = tsLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(ngDiags).toEqual([]);
  });

  // Issue #15460
  it('should be able to find members defined on an ancestor type', () => {
    mockHost.override(APP_COMPONENT, `
      import { Component } from '@angular/core';
      import { NgForm } from '@angular/forms';

      @Component({
        selector: 'example-app',
        template: \`
           <form #f="ngForm" (ngSubmit)="onSubmit(f)" novalidate>
            <input name="first" ngModel required #first="ngModel">
            <input name="last" ngModel>
            <button>Submit</button>
          </form>
          <p>First name value: {{ first.value }}</p>
          <p>First name valid: {{ first.valid }}</p>
          <p>Form value: {{ f.value | json }}</p>
          <p>Form valid: {{ f.valid }}</p>
       \`,
      })
      export class AppComponent {
        onSubmit(form: NgForm) {}
      }`);
    const tsDiags = tsLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(ngDiags).toEqual([]);
  });

  it('should report an error for invalid providers', () => {
    const content = mockHost.override(APP_COMPONENT, `
      import { Component } from '@angular/core';

      @Component({
        template: '',
        providers: [null]
      })
      export class AppComponent {}`);
    const tsDiags = tsLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(tsDiags.length).toBe(1);
    const msgText = ts.flattenDiagnosticMessageText(tsDiags[0].messageText, '\n');
    expect(msgText).toBe(`Type 'null' is not assignable to type 'Provider'.`);
    const ngDiags = ngLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(ngDiags.length).toBe(1);
    const {messageText, start, length} = ngDiags[0];
    expect(messageText)
        .toBe(
            'Invalid providers for "AppComponent in /app/app.component.ts" - only instances of Provider and Type are allowed, got: [?null?]');
    // TODO: Looks like this is the wrong span. Should point to 'null' instead.
    expect(content.substring(start!, start! + length!)).toBe('AppComponent');
  });

  // Issue #15768
  it('should be able to parse a template reference', () => {
    mockHost.override(APP_COMPONENT, `
      import { Component } from '@angular/core';

      @Component({
        selector: 'my-component',
        template: \`
          <div *ngIf="comps | async; let comps; else loading">
          </div>
          <ng-template #loading>Loading comps...</ng-template>
        \`
      })
      export class AppComponent {}`);
    const tsDiags = tsLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(ngDiags).toEqual([]);
  });

  // Issue #15625
  it('should not report errors for localization syntax', () => {
    mockHost.override(APP_COMPONENT, `
      import { Component } from '@angular/core';

      @Component({
        selector: 'my-component',
        template: \`
        <div>
            {fieldCount, plural, =0 {no fields} =1 {1 field} other {{{fieldCount}} fields}}
        </div>
        \`
      })
      export class AppComponent {
        fieldCount: number = 0;
      }`);
    const tsDiags = tsLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(ngDiags).toEqual([]);
  });

  // Issue #15885
  it('should be able to remove null and undefined from a type', () => {
    mockHost.overrideOptions({
      strictNullChecks: true,
    });
    mockHost.override(APP_COMPONENT, `
      import { Component } from '@angular/core';

      @Component({
        selector: 'my-component',
        template: '{{test?.a}}',
      })
      export class AppComponent {
        test: {a: number, b: number} | null = {
          a: 1,
          b: 2,
        };
      }`);
    const tsDiags = tsLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(ngDiags).toEqual([]);
  });

  // Issue https://github.com/angular/angular/issues/34874
  it('should recognize inputs and outputs listed inside directive decorators', () => {
    mockHost.override(
        TEST_TEMPLATE, `<div hint-model [hint]="title" (hintChange)="myClick($event)"></div>`);
    const ngDiags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(ngDiags).toEqual([]);
  });

  it('should be able to resolve modules using baseUrl', () => {
    mockHost.override(APP_COMPONENT, `
      import { Component } from '@angular/core';
      import { NgForm } from '@angular/forms';
      import { Server } from 'app/server';

      @Component({
        selector: 'example-app',
        template: '...',
        providers: [Server]
      })
      export class AppComponent {
        onSubmit(form: NgForm) {}
      }`);
    mockHost.addScript('/other/files/app/server.ts', 'export class Server {}');
    mockHost.overrideOptions({
      baseUrl: '/other/files',
    });
    const tsDiags = tsLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(tsDiags).toEqual([]);
    const diagnostic = ngLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(diagnostic).toEqual([]);
  });

  it('should report errors for using the now removed OpaqueToken (deprecated)', () => {
    mockHost.override(APP_COMPONENT, `
      import { Component, Inject, OpaqueToken } from '@angular/core';
      import { NgForm } from '@angular/forms';

      export const token = new OpaqueToken('some token');

      @Component({
        selector: 'example-app',
        template: '...'
      })
      export class AppComponent {
        constructor (@Inject(token) value: string) {}
        onSubmit(form: NgForm) {}
      }`);
    const tsDiags = tsLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(tsDiags.length).toBe(1);
    expect(tsDiags[0].messageText)
        .toBe(`Module '"@angular/core"' has no exported member 'OpaqueToken'.`);
  });

  describe('templates', () => {
    it('should report errors for invalid templateUrls', () => {
      const fileName = mockHost.addCode(`
        @Component({
          templateUrl: '«notAFile»',
        })
        export class MyComponent {}`);

      const marker = mockHost.getReferenceMarkerFor(fileName, 'notAFile');

      const diagnostics = ngLS.getSemanticDiagnostics(fileName)!;
      const urlDiagnostic =
          diagnostics.find(d => d.messageText === 'URL does not point to a valid file');
      expect(urlDiagnostic).toBeDefined();

      const {start, length} = urlDiagnostic!;
      expect(start).toBe(marker.start);
      expect(length).toBe(marker.length);
    });

    it('should not report errors for valid templateUrls', () => {
      const fileName = mockHost.addCode(`
        @Component({
          templateUrl: './test.ng',
        })
        export class MyComponent {}`);

      const diagnostics = ngLS.getSemanticDiagnostics(fileName)!;
      const urlDiagnostic =
          diagnostics.find(d => d.messageText === 'URL does not point to a valid file');
      expect(urlDiagnostic).toBeUndefined();
    });

    it('should report diagnostic for missing template or templateUrl', () => {
      const content = mockHost.override(APP_COMPONENT, `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-example',
        })
        export class AppComponent {}`);
      const diags = ngLS.getSemanticDiagnostics(APP_COMPONENT);
      expect(diags.length).toBe(1);
      const {file, messageText, start, length} = diags[0];
      expect(file!.fileName).toBe(APP_COMPONENT);
      expect(messageText).toBe(`Component 'AppComponent' must have a template or templateUrl`);
      expect(content.substring(start!, start! + length!)).toBe('AppComponent');
    });

    it('should report diagnostic for both template and templateUrl', () => {
      const content = mockHost.override(APP_COMPONENT, `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-example',
          template: '<div></div>',
          templateUrl: './test.ng',
        })
        export class AppComponent {}`);
      const diags = ngLS.getSemanticDiagnostics(APP_COMPONENT);
      expect(diags.length).toBe(1);
      const {file, messageText, start, length} = diags[0];
      expect(file!.fileName).toBe(APP_COMPONENT);
      expect(messageText)
          .toBe(`Component 'AppComponent' must not have both template and templateUrl`);
      expect(content.substring(start!, start! + length!)).toBe('AppComponent');
    });

    it('should report errors for invalid styleUrls', () => {
      const fileName = mockHost.addCode(`
        @Component({
          styleUrls: ['«notAFile»'],
        })
        export class MyComponent {}`);

      const marker = mockHost.getReferenceMarkerFor(fileName, 'notAFile');

      const diagnostics = ngLS.getSemanticDiagnostics(fileName)!;
      const urlDiagnostic =
          diagnostics.find(d => d.messageText === 'URL does not point to a valid file');
      expect(urlDiagnostic).toBeDefined();

      const {start, length} = urlDiagnostic!;
      expect(start).toBe(marker.start);
      expect(length).toBe(marker.length);
    });

    it('should not report errors for valid styleUrls', () => {
      mockHost.override(APP_COMPONENT, `
        import {Component} from '@angular/core';

        @Component({
          template: '<div></div>',
          styleUrls: ['./test.css', './test.css'],
        })
        export class AppComponent {}`);

      const diagnostics = ngLS.getSemanticDiagnostics(APP_COMPONENT)!;
      expect(diagnostics.length).toBe(0);
    });
  });

  it('should work correctly with CRLF endings in external template', () => {
    // https://github.com/angular/vscode-ng-language-service/issues/235
    // In the example below, the string
    // `\r\n{{line0}}\r\n{{line1}}\r\n{{line2}}` is tokenized as a whole,
    // and then CRLF characters are converted to LF.
    // Source span information is lost in the process.
    const content = mockHost.override(
        TEST_TEMPLATE, '\r\n<div>\r\n{{line0}}\r\n{{line1}}\r\n{{line2}}\r\n</div>');
    const ngDiags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(ngDiags.length).toBe(3);
    for (let i = 0; i < 3; ++i) {
      const {messageText, start, length} = ngDiags[i];
      expect(messageText)
          .toBe(
              `Identifier 'line${i}' is not defined. ` +
              `The component declaration, template variable declarations, and ` +
              `element references do not contain such a member`);
      // Assert that the span is actually highlight the bounded text. The span
      // would be off if CRLF endings are not handled properly.
      expect(content.substring(start!, start! + length!)).toBe(`line${i}`);
    }
  });

  it('should work correctly with CRLF endings in inline template', () => {
    const fileName = mockHost.addCode(
        '\n@Component({template:`\r\n\r\n{{line}}`})export class ComponentCRLF {}');
    const content = mockHost.readFile(fileName)!;
    const ngDiags = ngLS.getSemanticDiagnostics(fileName);
    expect(ngDiags.length).toBeGreaterThan(0);
    const {messageText, start, length} = ngDiags[0];
    expect(messageText)
        .toBe(
            `Identifier 'line' is not defined. ` +
            `The component declaration, template variable declarations, and ` +
            `element references do not contain such a member`);
    expect(content.substring(start!, start! + length!)).toBe('line');
  });

  it('should not produce diagnostics for non-exported directives', () => {
    const fileName = '/app/test.component.ts';
    mockHost.addScript(fileName, `
      import {Component} from '@angular/core';

      @Component({
        template: '<test-comp></test-comp>'
      })
      class TestHostComponent {}
    `);
    const tsDiags = tsLS.getSemanticDiagnostics(fileName);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getSemanticDiagnostics(fileName);
    expect(ngDiags).toEqual([]);
  });

  it('should suggest ? or ! operator if method receiver is nullable', () => {
    const content = mockHost.override(TEST_TEMPLATE, `{{optional && optional.toLowerCase()}}`);
    const ngDiags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(ngDiags.length).toBe(1);
    const {start, length, messageText, category} = ngDiags[0];
    expect(messageText)
        .toBe(
            `'optional' is possibly undefined. ` +
            `Consider using the safe navigation operator (optional?.toLowerCase) ` +
            `or non-null assertion operator (optional!.toLowerCase).`);
    expect(category).toBe(ts.DiagnosticCategory.Suggestion);
    expect(content.substring(start!, start! + length!)).toBe('toLowerCase');
  });

  it('should suggest ? or ! operator if property receiver is nullable', () => {
    const content = mockHost.override(TEST_TEMPLATE, `{{optional && optional.length}}`);
    const ngDiags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(ngDiags.length).toBe(1);
    const {start, length, messageText, category} = ngDiags[0];
    expect(messageText)
        .toBe(
            `'optional' is possibly undefined. ` +
            `Consider using the safe navigation operator (optional?.length) ` +
            `or non-null assertion operator (optional!.length).`);
    expect(category).toBe(ts.DiagnosticCategory.Suggestion);
    expect(content.substring(start!, start! + length!)).toBe('length');
  });

  it('should report error if method is not found on non-nullable receivers', () => {
    const expressions = [
      'optional?',
      'optional!',
    ];
    for (const expression of expressions) {
      const content = mockHost.override(TEST_TEMPLATE, `{{ ${expression}.someMethod() }}`);
      const ngDiags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(ngDiags.length).toBe(1);
      const {start, length, messageText, category} = ngDiags[0];
      expect(messageText)
          .toBe(`Identifier 'someMethod' is not defined. 'string' does not contain such a member`);
      expect(category).toBe(ts.DiagnosticCategory.Error);
      expect(content.substring(start!, start! + length!)).toBe('someMethod');
    }
  });

  it('should report error if property is not found on non-nullable receivers', () => {
    const expressions = [
      'optional?',
      'optional!',
    ];
    for (const expression of expressions) {
      const content = mockHost.override(TEST_TEMPLATE, `{{ ${expression}.someProp }}`);
      const ngDiags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(ngDiags.length).toBe(1);
      const {start, length, messageText, category} = ngDiags[0];
      expect(messageText)
          .toBe(`Identifier 'someProp' is not defined. 'string' does not contain such a member`);
      expect(category).toBe(ts.DiagnosticCategory.Error);
      expect(content.substring(start!, start! + length!)).toBe('someProp');
    }
  });

  describe('function calls', () => {
    it('should report error for non-callable function call', () => {
      mockHost.override(TEST_TEMPLATE, `
        <p>{{myClick()()}}</p>
      `);

      const content = mockHost.readFile(TEST_TEMPLATE)!;
      const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(diags.length).toBe(1);
      const {messageText, start, length} = diags[0]!;
      expect(messageText).toBe(`Call target 'myClick()' has non-callable type 'void'.`);
      expect(content.substring(start!, start! + length!)).toBe('myClick()()');
    });
  });
});
