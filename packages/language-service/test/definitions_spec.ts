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
    const fileName = addCode(`
      @Component({
        template: '{{«name»}}'
      })
      export class MyComponent {
        «ᐱnameᐱ: string;»
      }`);

    const marker = getReferenceMarkerFor(fileName, 'name');
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
    expect(def.textSpan).toEqual(getDefinitionMarkerFor(fileName, 'name'));
  });

  it('should be able to find a field in a attribute reference', () => {
    const fileName = addCode(`
      @Component({
        template: '<input [(ngModel)]="«name»">'
      })
      export class MyComponent {
        «ᐱnameᐱ: string;»
      }`);

    const marker = getReferenceMarkerFor(fileName, 'name');
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
    expect(def.textSpan).toEqual(getDefinitionMarkerFor(fileName, 'name'));
  });

  it('should be able to find a method from a call', () => {
    const fileName = addCode(`
      @Component({
        template: '<div (click)="~{start-my}«myClick»()~{end-my};"></div>'
      })
      export class MyComponent {
        «ᐱmyClickᐱ() { }»
      }`);

    const marker = getReferenceMarkerFor(fileName, 'myClick');
    const result = ngService.getDefinitionAt(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result !;

    expect(textSpan).toEqual(getLocationMarkerFor(fileName, 'my'));
    expect(definitions).toBeDefined();
    expect(definitions !.length).toBe(1);
    const def = definitions ![0];

    expect(def.fileName).toBe(fileName);
    expect(def.name).toBe('myClick');
    expect(def.kind).toBe('method');
    expect(def.textSpan).toEqual(getDefinitionMarkerFor(fileName, 'myClick'));
  });

  it('should be able to find a field reference in an *ngIf', () => {
    const fileName = addCode(`
      @Component({
        template: '<div *ngIf="«include»"></div>'
      })
      export class MyComponent {
        «ᐱincludeᐱ = true;»
      }`);

    const marker = getReferenceMarkerFor(fileName, 'include');
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
    expect(def.textSpan).toEqual(getDefinitionMarkerFor(fileName, 'include'));
  });

  it('should be able to find a reference to a component', () => {
    const fileName = addCode(`
      @Component({
        template: '~{start-my}<«test-comp»></test-comp>~{end-my}'
      })
      export class MyComponent { }`);

    // Get the marker for «test-comp» in the code added above.
    const marker = getReferenceMarkerFor(fileName, 'test-comp');

    const result = ngService.getDefinitionAt(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result !;

    // Get the marker for bounded text in the code added above.
    const boundedText = getLocationMarkerFor(fileName, 'my');
    expect(textSpan).toEqual(boundedText);

    // There should be exactly 1 definition
    expect(definitions).toBeDefined();
    expect(definitions !.length).toBe(1);
    const def = definitions ![0];

    const refFileName = '/app/parsing-cases.ts';
    expect(def.fileName).toBe(refFileName);
    expect(def.name).toBe('TestComponent');
    expect(def.kind).toBe('component');
    expect(def.textSpan).toEqual(getLocationMarkerFor(refFileName, 'test-comp'));
  });

  it('should be able to find an event provider', () => {
    const fileName = addCode(`
      @Component({
        template: '<test-comp ~{start-my}(«test»)="myHandler()"~{end-my}></div>'
      })
      export class MyComponent { myHandler() {} }`);

    // Get the marker for «test» in the code added above.
    const marker = getReferenceMarkerFor(fileName, 'test');

    const result = ngService.getDefinitionAt(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result !;

    // Get the marker for bounded text in the code added above
    const boundedText = getLocationMarkerFor(fileName, 'my');
    expect(textSpan).toEqual(boundedText);

    // There should be exactly 1 definition
    expect(definitions).toBeDefined();
    expect(definitions !.length).toBe(1);
    const def = definitions ![0];

    const refFileName = '/app/parsing-cases.ts';
    expect(def.fileName).toBe(refFileName);
    expect(def.name).toBe('testEvent');
    expect(def.kind).toBe('event');
    expect(def.textSpan).toEqual(getDefinitionMarkerFor(refFileName, 'test'));
  });

  it('should be able to find an input provider', () => {
    // '/app/parsing-cases.ts', 'tcName',
    const fileName = addCode(`
      @Component({
        template: '<test-comp ~{start-my}[«tcName»]="name"~{end-my}></div>'
      })
      export class MyComponent {
        name = 'my name';
      }`);

    // Get the marker for «test» in the code added above.
    const marker = getReferenceMarkerFor(fileName, 'tcName');

    const result = ngService.getDefinitionAt(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result !;

    // Get the marker for bounded text in the code added above
    const boundedText = getLocationMarkerFor(fileName, 'my');
    expect(textSpan).toEqual(boundedText);

    // There should be exactly 1 definition
    expect(definitions).toBeDefined();
    expect(definitions !.length).toBe(1);
    const def = definitions ![0];

    const refFileName = '/app/parsing-cases.ts';
    expect(def.fileName).toBe(refFileName);
    expect(def.name).toBe('name');
    expect(def.kind).toBe('property');
    expect(def.textSpan).toEqual(getDefinitionMarkerFor(refFileName, 'tcName'));
  });

  it('should be able to find a pipe', () => {
    const fileName = addCode(`
      @Component({
        template: '<div *ngIf="~{start-my}input | «async»~{end-my}"></div>'
      })
      export class MyComponent {
        input: EventEmitter;
      }`);

    // Get the marker for «test» in the code added above.
    const marker = getReferenceMarkerFor(fileName, 'async');

    const result = ngService.getDefinitionAt(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result !;

    // Get the marker for bounded text in the code added above
    const boundedText = getLocationMarkerFor(fileName, 'my');
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

  it('should be able to find a template from a url', () => {
    const fileName = addCode(`
      @Component({
        templateUrl: './«test».ng',
      })
      export class MyComponent {}`);

    const marker = getReferenceMarkerFor(fileName, 'test');
    const result = ngService.getDefinitionAt(fileName, marker.start);

    expect(result).toBeDefined();
    const {textSpan, definitions} = result !;

    expect(textSpan).toEqual({start: marker.start - 2, length: 9});

    expect(definitions).toBeDefined();
    expect(definitions !.length).toBe(1);
    const [def] = definitions !;
    expect(def.fileName).toBe('/app/test.ng');
    expect(def.textSpan).toEqual({start: 0, length: 0});
  });

  /**
   * Append a snippet of code to `app.component.ts` and return the file name.
   * There must not be any name collision with existing code.
   * @param code Snippet of code
   */
  function addCode(code: string) {
    const fileName = '/app/app.component.ts';
    const originalContent = mockHost.getFileContent(fileName);
    const newContent = originalContent + code;
    mockHost.override(fileName, newContent);
    return fileName;
  }

  /**
   * Returns the definition marker ᐱselectorᐱ for the specified 'selector'.
   * Asserts that marker exists.
   * @param fileName name of the file
   * @param selector name of the marker
   */
  function getDefinitionMarkerFor(fileName: string, selector: string): ts.TextSpan {
    const markers = mockHost.getReferenceMarkers(fileName);
    expect(markers).toBeDefined();
    expect(Object.keys(markers !.definitions)).toContain(selector);
    expect(markers !.definitions[selector].length).toBe(1);
    const marker = markers !.definitions[selector][0];
    expect(marker.start).toBeLessThanOrEqual(marker.end);
    return {
      start: marker.start,
      length: marker.end - marker.start,
    };
  }

  /**
   * Returns the reference marker «selector» for the specified 'selector'.
   * Asserts that marker exists.
   * @param fileName name of the file
   * @param selector name of the marker
   */
  function getReferenceMarkerFor(fileName: string, selector: string): ts.TextSpan {
    const markers = mockHost.getReferenceMarkers(fileName);
    expect(markers).toBeDefined();
    expect(Object.keys(markers !.references)).toContain(selector);
    expect(markers !.references[selector].length).toBe(1);
    const marker = markers !.references[selector][0];
    expect(marker.start).toBeLessThanOrEqual(marker.end);
    return {
      start: marker.start,
      length: marker.end - marker.start,
    };
  }

  /**
   * Returns the location marker ~{selector} for the specified 'selector'.
   * Asserts that marker exists.
   * @param fileName name of the file
   * @param selector name of the marker
   */
  function getLocationMarkerFor(fileName: string, selector: string): ts.TextSpan {
    const markers = mockHost.getMarkerLocations(fileName);
    expect(markers).toBeDefined();
    const start = markers ![`start-${selector}`];
    expect(start).toBeDefined();
    const end = markers ![`end-${selector}`];
    expect(end).toBeDefined();
    expect(start).toBeLessThanOrEqual(end);
    return {
      start: start,
      length: end - start,
    };
  }
});
