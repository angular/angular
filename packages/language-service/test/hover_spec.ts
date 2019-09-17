/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {createLanguageService} from '../src/language_service';
import {LanguageService} from '../src/types';
import {TypeScriptServiceHost} from '../src/typescript_host';

import {MockTypescriptHost} from './test_utils';

describe('hover', () => {
  let mockHost: MockTypescriptHost;
  let tsLS: ts.LanguageService;
  let ngLSHost: TypeScriptServiceHost;
  let ngLS: LanguageService;

  beforeEach(() => {
    mockHost = new MockTypescriptHost(['/app/main.ts', '/app/parsing-cases.ts']);
    tsLS = ts.createLanguageService(mockHost);
    ngLSHost = new TypeScriptServiceHost(mockHost, tsLS);
    ngLS = createLanguageService(ngLSHost);
  });

  it('should be able to find field in an interpolation', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '{{«name»}}'
      })
      export class MyComponent {
        name: string;
      }`);
    const marker = mockHost.getReferenceMarkerFor(fileName, 'name');
    const quickInfo = ngLS.getHoverAt(fileName, marker.start);
    expect(quickInfo).toBeTruthy();
    const {textSpan, displayParts} = quickInfo !;
    expect(textSpan).toEqual(marker);
    expect(toText(displayParts)).toBe('(property) MyComponent.name');
  });

  it('should be able to find a field in a attribute reference', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<input [(ngModel)]="«name»">'
      })
      export class MyComponent {
        name: string;
      }`);
    const marker = mockHost.getReferenceMarkerFor(fileName, 'name');
    const quickInfo = ngLS.getHoverAt(fileName, marker.start);
    expect(quickInfo).toBeTruthy();
    const {textSpan, displayParts} = quickInfo !;
    expect(textSpan).toEqual(marker);
    expect(toText(displayParts)).toBe('(property) MyComponent.name');
  });

  it('should be able to find a method from a call', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<div (click)="«ᐱmyClickᐱ()»;"></div>'
      })
      export class MyComponent {
        myClick() { }
      }`);
    const marker = mockHost.getDefinitionMarkerFor(fileName, 'myClick');
    const quickInfo = ngLS.getHoverAt(fileName, marker.start);
    expect(quickInfo).toBeTruthy();
    const {textSpan, displayParts} = quickInfo !;
    expect(textSpan).toEqual(marker);
    expect(textSpan.length).toBe('myClick()'.length);
    expect(toText(displayParts)).toBe('(method) MyComponent.myClick');
  });

  it('should be able to find a field reference in an *ngIf', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<div *ngIf="«include»"></div>'
      })
      export class MyComponent {
        include = true;
      }`);
    const marker = mockHost.getReferenceMarkerFor(fileName, 'include');
    const quickInfo = ngLS.getHoverAt(fileName, marker.start);
    expect(quickInfo).toBeTruthy();
    const {textSpan, displayParts} = quickInfo !;
    expect(textSpan).toEqual(marker);
    expect(toText(displayParts)).toBe('(property) MyComponent.include');
  });

  it('should be able to find a reference to a component', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '«<ᐱtestᐱ-comp></test-comp>»'
      })
      export class MyComponent { }`);
    const marker = mockHost.getDefinitionMarkerFor(fileName, 'test');
    const quickInfo = ngLS.getHoverAt(fileName, marker.start);
    expect(quickInfo).toBeTruthy();
    const {textSpan, displayParts} = quickInfo !;
    expect(textSpan).toEqual(marker);
    expect(toText(displayParts)).toBe('(component) TestComponent');
  });

  it('should be able to find an event provider', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<test-comp «(ᐱtestᐱ)="myHandler()"»></div>'
      })
      export class MyComponent {
        myHandler() {}
      }`);
    const marker = mockHost.getDefinitionMarkerFor(fileName, 'test');
    const quickInfo = ngLS.getHoverAt(fileName, marker.start);
    expect(quickInfo).toBeTruthy();
    const {textSpan, displayParts} = quickInfo !;
    expect(textSpan).toEqual(marker);
    expect(toText(displayParts)).toBe('(event) TestComponent.testEvent');
  });

  it('should be able to find an input provider', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<test-comp «[ᐱtcNameᐱ]="name"»></div>'
      })
      export class MyComponent {
        name = 'my name';
      }`);
    const marker = mockHost.getDefinitionMarkerFor(fileName, 'tcName');
    const quickInfo = ngLS.getHoverAt(fileName, marker.start);
    expect(quickInfo).toBeTruthy();
    const {textSpan, displayParts} = quickInfo !;
    expect(textSpan).toEqual(marker);
    expect(toText(displayParts)).toBe('(property) TestComponent.name');
  });

  it('should be able to ignore a reference declaration', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<div #«chart»></div>'
      })
      export class MyComponent {  }`);
    const marker = mockHost.getReferenceMarkerFor(fileName, 'chart');
    const quickInfo = ngLS.getHoverAt(fileName, marker.start);
    expect(quickInfo).toBeUndefined();
  });

  it('should be able to find a directive module', () => {
    const fileName = '/app/app.component.ts';
    mockHost.override(fileName, `
      import {Component} from '@angular/core';

      @Component({
        template: '<div></div>'
      })
      export class «AppComponent» {
        name: string;
      }`);
    const marker = mockHost.getReferenceMarkerFor(fileName, 'AppComponent');
    const quickInfo = ngLS.getHoverAt(fileName, marker.start);
    expect(quickInfo).toBeTruthy();
    const {textSpan, displayParts} = quickInfo !;
    expect(textSpan).toEqual(marker);
    expect(toText(displayParts)).toBe('(directive) AppModule.AppComponent: class');
  });
});

function toText(displayParts?: ts.SymbolDisplayPart[]): string {
  return (displayParts || []).map(p => p.text).join('');
}
