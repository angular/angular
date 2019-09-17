/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {createLanguageService} from '../src/language_service';
import * as ng from '../src/types';
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

describe('diagnostics', () => {
  let mockHost: MockTypescriptHost;
  let ngHost: TypeScriptServiceHost;
  let tsLS: ts.LanguageService;
  let ngLS: ng.LanguageService;

  beforeEach(() => {
    mockHost = new MockTypescriptHost(['/app/main.ts', '/app/parsing-cases.ts']);
    tsLS = ts.createLanguageService(mockHost);
    ngHost = new TypeScriptServiceHost(mockHost, tsLS);
    ngLS = createLanguageService(ngHost);
  });

  it('should produce no diagnostics for test.ng', () => {
    // there should not be any errors on existing external template
    expect(ngLS.getDiagnostics('/app/test.ng')).toEqual([]);
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
      const ngDiags = ngLS.getDiagnostics(file);
      expect(ngDiags).toEqual([]);
    }
  });

  // #17611
  it('should not report diagnostic on iteration of any', () => {
    const fileName = '/app/test.ng';
    mockHost.override(fileName, '<div *ngFor="let value of anyValue">{{value.someField}}</div>');
    const diagnostics = ngLS.getDiagnostics(fileName);
    expect(diagnostics).toEqual([]);
  });

  describe('with $event', () => {
    it('should accept an event', () => {
      const fileName = '/app/test.ng';
      mockHost.override(fileName, '<div (click)="myClick($event)">Click me!</div>');
      const diagnostics = ngLS.getDiagnostics(fileName);
      expect(diagnostics).toEqual([]);
    });

    it('should reject it when not in an event binding', () => {
      const fileName = '/app/test.ng';
      const content = mockHost.override(fileName, '<div [tabIndex]="$event"></div>');
      const diagnostics = ngLS.getDiagnostics(fileName) !;
      expect(diagnostics.length).toBe(1);
      const {messageText, start, length} = diagnostics[0];
      expect(messageText)
          .toBe(
              `Identifier '$event' is not defined. The component declaration, template variable declarations, and element references do not contain such a member`);
      const keyword = '$event';
      expect(start).toBe(content.lastIndexOf(keyword));
      expect(length).toBe(keyword.length);
    });
  });

  it('should not crash with a incomplete *ngFor', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<div *ngFor></div> ~{after-div}'
      })
      export class MyComponent {}`);
    expect(() => ngLS.getDiagnostics(fileName)).not.toThrow();
  });

  it('should report a component not in a module', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<div></div>'
      })
      export class MyComponent {}`);
    const diagnostics = ngLS.getDiagnostics(fileName) !;
    expect(diagnostics.length).toBe(1);
    const {messageText, start, length} = diagnostics[0];
    expect(messageText)
        .toBe(
            `Component 'MyComponent' is not included in a module and will not be available inside a template. Consider adding it to a NgModule declaration.`);
    const content = mockHost.getFileContent(fileName) !;
    const keyword = '@Component';
    expect(start).toBe(content.lastIndexOf(keyword) + 1);  // exclude leading '@'
    expect(length).toBe(keyword.length - 1);               // exclude leading '@'
  });


  it(`should not report an error for a form's host directives`, () => {
    const fileName = '/app/app.component.ts';
    mockHost.override(fileName, `
      import { Component } from '@angular/core';

      @Component({
        template: '<form></form>'})
      export class AppComponent {}`);
    const tsDiags = tsLS.getSemanticDiagnostics(fileName);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getDiagnostics(fileName);
    expect(ngDiags).toEqual([]);
  });

  it('should not throw getting diagnostics for an index expression', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<a *ngIf="(auth.isAdmin | async) || (event.leads && event.leads[(auth.uid | async)])"></a>'
      })
      export class MyComponent {}`);
    expect(() => ngLS.getDiagnostics(fileName)).not.toThrow();
  });

  it('should not throw using a directive with no value', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<form><input [(ngModel)]="name" required /></form>'
      })
      export class MyComponent {
        name = 'some name';
      }`);
    expect(() => ngLS.getDiagnostics(fileName)).not.toThrow();
  });

  it('should report an error for invalid metadata', () => {
    const fileName = '/app/app.component.ts';
    const content = mockHost.override(fileName, `
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
    const tsDiags = tsLS.getSemanticDiagnostics(fileName);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getDiagnostics(fileName) !;
    expect(ngDiags.length).toBe(1);
    const {messageText, start, length} = ngDiags[0];
    const keyword = `() => 'foo'`;
    expect(start).toBe(content.lastIndexOf(keyword));
    expect(length).toBe(keyword.length);
    // messageText is a three-part chain
    const firstPart = messageText as ts.DiagnosticMessageChain;
    expect(firstPart.messageText).toBe(`Error during template compile of 'AppComponent'`);
    const secondPart = firstPart.next !;
    expect(secondPart.messageText).toBe('Function expressions are not supported in decorators');
    const thirdPart = secondPart.next !;
    expect(thirdPart.messageText)
        .toBe('Consider changing the function expression into an exported function');
    expect(thirdPart.next).toBeFalsy();
  });

  it('should not throw for an invalid class', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: ''
      }) class`);
    expect(() => ngLS.getDiagnostics(fileName)).not.toThrow();
  });

  it('should not report an error for sub-types of string', () => {
    const fileName = '/app/app.component.ts';
    mockHost.override(fileName, `
      import { Component } from '@angular/core';

      @Component({
        template: \`<div *ngIf="something === 'foo'"></div>\`
      })
      export class AppComponent {
        something: 'foo' | 'bar';
      }`);
    const tsDiags = tsLS.getSemanticDiagnostics(fileName);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getDiagnostics(fileName);
    expect(ngDiags).toEqual([]);
  });

  it('should not report an error for sub-types of number', () => {
    const fileName = '/app/app.component.ts';
    mockHost.override(fileName, `
      import { Component } from '@angular/core';

      @Component({
        template: '<div *ngIf="something === 123"></div>'
      })
      export class AppComponent {
        something: 123 | 456;
      }`);
    const tsDiags = tsLS.getSemanticDiagnostics(fileName);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getDiagnostics(fileName);
    expect(ngDiags).toEqual([]);
  });

  it('should report a warning if an event results in a callable expression', () => {
    const fileName = '/app/app.component.ts';
    const content = mockHost.override(fileName, `
      import { Component } from '@angular/core';

      @Component({
        template: '<div (click)="onClick"></div>'
      })
      export class MyComponent {
        onClick() { }
      }`);
    const diagnostics = ngLS.getDiagnostics(fileName) !;
    const {messageText, start, length} = diagnostics[0];
    expect(messageText).toBe('Unexpected callable expression. Expected a method call');
    const keyword = `"onClick"`;
    expect(start).toBe(content.lastIndexOf(keyword) + 1);  // exclude leading quote
    expect(length).toBe(keyword.length - 2);               // exclude leading and trailing quotes
  });

  // #13412
  it('should not report an error for using undefined', () => {
    const fileName = '/app/app.component.ts';
    mockHost.override(fileName, `
      import { Component } from '@angular/core';

      @Component({
        template: '<div *ngIf="something === undefined"></div>'
      })
      export class AppComponent {
        something = 'foo';
      }`);
    const tsDiags = tsLS.getSemanticDiagnostics(fileName);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getDiagnostics(fileName);
    expect(ngDiags).toEqual([]);
  });

  // Issue #13326
  it('should report a narrow span for invalid pipes', () => {
    const fileName = '/app/app.component.ts';
    const content = mockHost.override(fileName, `
      import { Component } from '@angular/core';

      @Component({
        template: '<p> Using an invalid pipe {{data | dat}} </p>'
      })
      export class AppComponent {
        data = 'some data';
      }`);
    const tsDiags = tsLS.getSemanticDiagnostics(fileName);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getDiagnostics(fileName);
    expect(ngDiags.length).toBe(1);
    const {messageText, start, length} = ngDiags[0];
    expect(messageText).toBe(`The pipe 'dat' could not be found`);
    const keyword = 'data | dat';
    expect(start).toBe(content.lastIndexOf(keyword));
    expect(length).toBe(keyword.length);
  });

  // Issue #19406
  it('should allow empty template', () => {
    const fileName = '/app/app.component.ts';
    mockHost.override(fileName, `
      import { Component } from '@angular/core';

      @Component({
        template : '',
      })
      export class AppComponent {}`);
    const tsDiags = tsLS.getSemanticDiagnostics(fileName);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getDiagnostics(fileName);
    expect(ngDiags).toEqual([]);
  });

  // Issue #15460
  it('should be able to find members defined on an ancestor type', () => {
    const fileName = '/app/app.component.ts';
    mockHost.override(fileName, `
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
    const tsDiags = tsLS.getSemanticDiagnostics(fileName);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getDiagnostics(fileName);
    expect(ngDiags).toEqual([]);
  });

  it('should report an error for invalid providers', () => {
    const fileName = '/app/app.component.ts';
    const content = mockHost.override(fileName, `
      import { Component } from '@angular/core';

      @Component({
        template: '',
        providers: [null]
      })
      export class AppComponent {}`);
    const tsDiags = tsLS.getSemanticDiagnostics(fileName);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getDiagnostics(fileName);
    expect(ngDiags.length).toBe(1);
    const {messageText, start, length} = ngDiags[0];
    expect(messageText)
        .toBe(
            'Invalid providers for "AppComponent in /app/app.component.ts" - only instances of Provider and Type are allowed, got: [?null?]');
    // TODO: Looks like this is the wrong span. Should point to 'null' instead.
    const keyword = '@Component';
    expect(start).toBe(content.lastIndexOf(keyword) + 1);  // exclude leading '@'
    expect(length).toBe(keyword.length - 1);               // exclude leading '@
  });

  // Issue #15768
  it('should be able to parse a template reference', () => {
    const fileName = '/app/app.component.ts';
    mockHost.override(fileName, `
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
    const tsDiags = tsLS.getSemanticDiagnostics(fileName);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getDiagnostics(fileName);
    expect(ngDiags).toEqual([]);
  });

  // Issue #15625
  it('should not report errors for localization syntax', () => {
    const fileName = '/app/app.component.ts';
    mockHost.override(fileName, `
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
        fieldCount: number;
      }`);
    const tsDiags = tsLS.getSemanticDiagnostics(fileName);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getDiagnostics(fileName);
    expect(ngDiags).toEqual([]);
  });

  // Issue #15885
  it('should be able to remove null and undefined from a type', () => {
    mockHost.overrideOptions(options => {
      options.strictNullChecks = true;
      return options;
    });
    const fileName = '/app/app.component.ts';
    mockHost.override(fileName, `
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
    const tsDiags = tsLS.getSemanticDiagnostics(fileName);
    expect(tsDiags).toEqual([]);
    const ngDiags = ngLS.getDiagnostics(fileName);
    expect(ngDiags).toEqual([]);
  });

  it('should be able to resolve modules using baseUrl', () => {
    const fileName = '/app/app.component.ts';
    mockHost.override(fileName, `
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
    mockHost.overrideOptions(options => {
      options.baseUrl = '/other/files';
      return options;
    });
    const tsDiags = tsLS.getSemanticDiagnostics(fileName);
    expect(tsDiags).toEqual([]);
    const diagnostic = ngLS.getDiagnostics(fileName);
    expect(diagnostic).toEqual([]);
  });

  it('should report errors for using the now removed OpaqueToken (deprecated)', () => {
    const fileName = '/app/app.component.ts';
    mockHost.override(fileName, `
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
    const tsDiags = tsLS.getSemanticDiagnostics(fileName);
    expect(tsDiags.length).toBe(1);
    expect(tsDiags[0].messageText)
        .toBe(
            `Module '"../node_modules/@angular/core/core"' has no exported member 'OpaqueToken'.`);
  });

  describe('templates', () => {
    it('should report errors for invalid templateUrls', () => {
      const fileName = mockHost.addCode(`
	@Component({
          templateUrl: '«notAFile»',
        })
        export class MyComponent {}`);

      const marker = mockHost.getReferenceMarkerFor(fileName, 'notAFile');

      const diagnostics = ngLS.getDiagnostics(fileName) !;
      const urlDiagnostic =
          diagnostics.find(d => d.messageText === 'URL does not point to a valid file');
      expect(urlDiagnostic).toBeDefined();

      const {start, length} = urlDiagnostic !;
      expect(start).toBe(marker.start);
      expect(length).toBe(marker.length);
    });

    it('should not report errors for valid templateUrls', () => {
      const fileName = mockHost.addCode(`
	@Component({
          templateUrl: './test.ng',
	})
	export class MyComponent {}`);

      const diagnostics = ngLS.getDiagnostics(fileName) !;
      const urlDiagnostic =
          diagnostics.find(d => d.messageText === 'URL does not point to a valid file');
      expect(urlDiagnostic).toBeUndefined();
    });

    it('should report diagnostic for missing template or templateUrl', () => {
      const fileName = '/app/app.component.ts';
      const content = mockHost.override(fileName, `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-example',
        })
        export class AppComponent {}`);
      const diags = ngLS.getDiagnostics(fileName);
      expect(diags.length).toBe(1);
      const {file, messageText, start, length} = diags[0];
      expect(file !.fileName).toBe(fileName);
      expect(messageText).toBe(`Component 'AppComponent' must have a template or templateUrl`);
      expect(start).toBe(content.indexOf(`@Component`) + 1);
      expect(length).toBe('Component'.length);
    });

    it('should report diagnostic for both template and templateUrl', () => {
      const fileName = '/app/app.component.ts';
      const content = mockHost.override(fileName, `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-example',
          template: '<div></div>',
          templateUrl: './test.ng',
        })
        export class AppComponent {}`);
      const diags = ngLS.getDiagnostics(fileName);
      expect(diags.length).toBe(1);
      const {file, messageText, start, length} = diags[0];
      expect(file !.fileName).toBe(fileName);
      expect(messageText)
          .toBe(`Component 'AppComponent' must not have both template and templateUrl`);
      expect(start).toBe(content.indexOf(`@Component`) + 1);
      expect(length).toBe('Component'.length);
    });

    it('should report errors for invalid styleUrls', () => {
      const fileName = mockHost.addCode(`
        @Component({
          styleUrls: ['«notAFile»'],
        })
        export class MyComponent {}`);

      const marker = mockHost.getReferenceMarkerFor(fileName, 'notAFile');

      const diagnostics = ngLS.getDiagnostics(fileName) !;
      const urlDiagnostic =
          diagnostics.find(d => d.messageText === 'URL does not point to a valid file');
      expect(urlDiagnostic).toBeDefined();

      const {start, length} = urlDiagnostic !;
      expect(start).toBe(marker.start);
      expect(length).toBe(marker.length);
    });

    it('should not report errors for valid styleUrls', () => {
      const fileName = '/app/app.component.ts';
      mockHost.override(fileName, `
        @Component({
          styleUrls: ['./test.css', './test.css'],
        })
        export class MyComponent {}`);

      const diagnostics = ngLS.getDiagnostics(fileName) !;
      expect(diagnostics.length).toBe(0);
    });
  });

  // https://github.com/angular/vscode-ng-language-service/issues/235
  // There is no easy fix for this issue currently due to the way template
  // tokenization is done. In the example below, the whole string
  // `\r\n{{line0}}\r\n{{line1}}\r\n{{line2}}` is tokenized as a whole, and then
  // CR characters are stripped from it. Source span information is lost in the
  // process. For more discussion, see the link above.
  /*
  it('should work correctly with CRLF endings', () => {
    const fileName = '/app/test.ng';
    const content = mockHost.override(fileName,
  '\r\n<div>\r\n{{line0}}\r\n{{line1}}\r\n{{line2}}\r\n</div>');
    const ngDiags = ngLS.getDiagnostics(fileName);
    expect(ngDiags.length).toBe(3);
    for (let i = 0; i < 3; ++i) {
      const {messageText, start, length} = ngDiags[i];
      expect(messageText)
          .toBe(
              `Identifier 'line${i}' is not defined. The component declaration, template variable
  declarations, and element references do not contain such a member`);
      // Assert that the span is actually highlight the bounded text. The span
      // would be off if CRLF endings are not handled properly.
      expect(content.substring(start !, start ! + length !)).toBe(`line${i}`);
    }
  });
  */

});
