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

import {toh} from './test_data';
import {MockTypescriptHost} from './test_utils';

describe('definitions', () => {
  let mockHost: MockTypescriptHost;
  let service: ts.LanguageService;
  let ngHost: TypeScriptServiceHost;
  let ngService: LanguageService;

  beforeEach(() => {
    // Create a new mockHost every time to reset any files that are overridden.
    mockHost = new MockTypescriptHost(['/app/main.ts', '/app/parsing-cases.ts'], toh);
    service = ts.createLanguageService(mockHost);
    ngHost = new TypeScriptServiceHost(mockHost, service);
    ngService = createLanguageService(ngHost);
  });

  it('should be able to find field in an interpolation', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '{{«name»}}'
      })
      export class MyComponent {
        «ᐱnameᐱ: string;»
      }`);

    const marker = mockHost.getReferenceMarkerFor(fileName, 'name');
    const result = ngService.getDefinitionAt(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result !;

    expect(textSpan).toEqual(marker);
    expect(definitions).toBeDefined();
    expect(definitions !.length).toBe(1);
    const def = definitions ![0];

    expect(def.fileName).toBe(fileName);
    expect(def.name).toBe('name');
    expect(def.kind).toBe('property');
    expect(def.textSpan).toEqual(mockHost.getDefinitionMarkerFor(fileName, 'name'));
  });

  it('should be able to find a field in a attribute reference', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<input [(ngModel)]="«name»">'
      })
      export class MyComponent {
        «ᐱnameᐱ: string;»
      }`);

    const marker = mockHost.getReferenceMarkerFor(fileName, 'name');
    const result = ngService.getDefinitionAt(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result !;

    expect(textSpan).toEqual(marker);
    expect(definitions).toBeDefined();
    expect(definitions !.length).toBe(1);
    const def = definitions ![0];

    expect(def.fileName).toBe(fileName);
    expect(def.name).toBe('name');
    expect(def.kind).toBe('property');
    expect(def.textSpan).toEqual(mockHost.getDefinitionMarkerFor(fileName, 'name'));
  });

  it('should be able to find a method from a call', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<div (click)="~{start-my}«myClick»()~{end-my};"></div>'
      })
      export class MyComponent {
        «ᐱmyClickᐱ() { }»
      }`);

    const marker = mockHost.getReferenceMarkerFor(fileName, 'myClick');
    const result = ngService.getDefinitionAt(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result !;

    expect(textSpan).toEqual(mockHost.getLocationMarkerFor(fileName, 'my'));
    expect(definitions).toBeDefined();
    expect(definitions !.length).toBe(1);
    const def = definitions ![0];

    expect(def.fileName).toBe(fileName);
    expect(def.name).toBe('myClick');
    expect(def.kind).toBe('method');
    expect(def.textSpan).toEqual(mockHost.getDefinitionMarkerFor(fileName, 'myClick'));
  });

  it('should be able to find a field reference in an *ngIf', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<div *ngIf="«include»"></div>'
      })
      export class MyComponent {
        «ᐱincludeᐱ = true;»
      }`);

    const marker = mockHost.getReferenceMarkerFor(fileName, 'include');
    const result = ngService.getDefinitionAt(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result !;

    expect(textSpan).toEqual(marker);
    expect(definitions).toBeDefined();
    expect(definitions !.length).toBe(1);
    const def = definitions ![0];

    expect(def.fileName).toBe(fileName);
    expect(def.name).toBe('include');
    expect(def.kind).toBe('property');
    expect(def.textSpan).toEqual(mockHost.getDefinitionMarkerFor(fileName, 'include'));
  });

  it('should be able to find a reference to a component', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '~{start-my}<«test-comp»></test-comp>~{end-my}'
      })
      export class MyComponent { }`);

    // Get the marker for «test-comp» in the code added above.
    const marker = mockHost.getReferenceMarkerFor(fileName, 'test-comp');

    const result = ngService.getDefinitionAt(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result !;

    // Get the marker for bounded text in the code added above.
    const boundedText = mockHost.getLocationMarkerFor(fileName, 'my');
    expect(textSpan).toEqual(boundedText);

    // There should be exactly 1 definition
    expect(definitions).toBeDefined();
    expect(definitions !.length).toBe(1);
    const def = definitions ![0];

    const refFileName = '/app/parsing-cases.ts';
    expect(def.fileName).toBe(refFileName);
    expect(def.name).toBe('TestComponent');
    expect(def.kind).toBe('component');
    expect(def.textSpan).toEqual(mockHost.getLocationMarkerFor(refFileName, 'test-comp'));
  });

  it('should be able to find an event provider', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<test-comp ~{start-my}(«test»)="myHandler()"~{end-my}></div>'
      })
      export class MyComponent { myHandler() {} }`);

    // Get the marker for «test» in the code added above.
    const marker = mockHost.getReferenceMarkerFor(fileName, 'test');

    const result = ngService.getDefinitionAt(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result !;

    // Get the marker for bounded text in the code added above
    const boundedText = mockHost.getLocationMarkerFor(fileName, 'my');
    expect(textSpan).toEqual(boundedText);

    // There should be exactly 1 definition
    expect(definitions).toBeDefined();
    expect(definitions !.length).toBe(1);
    const def = definitions ![0];

    const refFileName = '/app/parsing-cases.ts';
    expect(def.fileName).toBe(refFileName);
    expect(def.name).toBe('testEvent');
    expect(def.kind).toBe('event');
    expect(def.textSpan).toEqual(mockHost.getDefinitionMarkerFor(refFileName, 'test'));
  });

  it('should be able to find an input provider', () => {
    // '/app/parsing-cases.ts', 'tcName',
    const fileName = mockHost.addCode(`
      @Component({
        template: '<test-comp ~{start-my}[«tcName»]="name"~{end-my}></div>'
      })
      export class MyComponent {
        name = 'my name';
      }`);

    // Get the marker for «test» in the code added above.
    const marker = mockHost.getReferenceMarkerFor(fileName, 'tcName');

    const result = ngService.getDefinitionAt(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result !;

    // Get the marker for bounded text in the code added above
    const boundedText = mockHost.getLocationMarkerFor(fileName, 'my');
    expect(textSpan).toEqual(boundedText);

    // There should be exactly 1 definition
    expect(definitions).toBeDefined();
    expect(definitions !.length).toBe(1);
    const def = definitions ![0];

    const refFileName = '/app/parsing-cases.ts';
    expect(def.fileName).toBe(refFileName);
    expect(def.name).toBe('name');
    expect(def.kind).toBe('property');
    expect(def.textSpan).toEqual(mockHost.getDefinitionMarkerFor(refFileName, 'tcName'));
  });

  it('should be able to find a pipe', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<div *ngIf="~{start-my}input | «async»~{end-my}"></div>'
      })
      export class MyComponent {
        input: EventEmitter;
      }`);

    // Get the marker for «test» in the code added above.
    const marker = mockHost.getReferenceMarkerFor(fileName, 'async');

    const result = ngService.getDefinitionAt(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result !;

    // Get the marker for bounded text in the code added above
    const boundedText = mockHost.getLocationMarkerFor(fileName, 'my');
    expect(textSpan).toEqual(boundedText);

    expect(definitions).toBeDefined();
    expect(definitions !.length).toBe(4);

    const refFileName = '/node_modules/@angular/common/common.d.ts';
    for (const def of definitions !) {
      expect(def.fileName).toBe(refFileName);
      expect(def.name).toBe('async');
      expect(def.kind).toBe('pipe');
      // Not asserting the textSpan of definition because it's external file
    }
  });
});
