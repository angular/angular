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

const TEST_TEMPLATE = '/app/test.ng';
const PARSING_CASES = '/app/parsing-cases.ts';

describe('definitions', () => {
  const mockHost = new MockTypescriptHost(['/app/main.ts']);
  const service = ts.createLanguageService(mockHost);
  const ngHost = new TypeScriptServiceHost(mockHost, service);
  const ngService = createLanguageService(ngHost);

  beforeEach(() => {
    mockHost.reset();
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
    const result = ngService.getDefinitionAndBoundSpan(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result!;

    expect(textSpan).toEqual(marker);
    expect(definitions).toBeDefined();
    expect(definitions!.length).toBe(1);
    const def = definitions![0];

    expect(def.fileName).toBe(fileName);
    expect(def.name).toBe('name');
    expect(def.kind).toBe('property');
    expect(def.textSpan).toEqual(mockHost.getDefinitionMarkerFor(fileName, 'name'));
  });

  it('should be able to find a field in a attribute reference', () => {
    mockHost.override(TEST_TEMPLATE, `<input [(ngModel)]="«title»">`);

    const marker = mockHost.getReferenceMarkerFor(TEST_TEMPLATE, 'title');
    const result = ngService.getDefinitionAndBoundSpan(TEST_TEMPLATE, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result!;

    expect(textSpan).toEqual(marker);
    expect(definitions).toBeDefined();

    expect(definitions!.length).toBe(1);
    const def = definitions![0];

    expect(def.fileName).toBe(PARSING_CASES);
    expect(def.name).toBe('title');
    expect(def.kind).toBe('property');

    const fileContent = mockHost.readFile(def.fileName);
    expect(fileContent!.substring(def.textSpan.start, def.textSpan.start + def.textSpan.length))
        .toEqual(`title = 'Tour of Heroes';`);
  });

  it('should be able to find a method from a call', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<div (click)="«myClick»();"></div>'
      })
      export class MyComponent {
        «ᐱmyClickᐱ() { }»
      }`);

    const marker = mockHost.getReferenceMarkerFor(fileName, 'myClick');
    const result = ngService.getDefinitionAndBoundSpan(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result!;

    expect(textSpan).toEqual(marker);
    expect(definitions).toBeDefined();
    expect(definitions!.length).toBe(1);
    const def = definitions![0];

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
    const result = ngService.getDefinitionAndBoundSpan(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result!;

    expect(textSpan).toEqual(marker);
    expect(definitions).toBeDefined();
    expect(definitions!.length).toBe(1);
    const def = definitions![0];

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

    const result = ngService.getDefinitionAndBoundSpan(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result!;

    // Get the marker for bounded text in the code added above.
    const boundedText = mockHost.getLocationMarkerFor(fileName, 'my');
    expect(textSpan).toEqual(boundedText);

    // There should be exactly 1 definition
    expect(definitions).toBeDefined();
    expect(definitions!.length).toBe(1);
    const def = definitions![0];

    const refFileName = '/app/parsing-cases.ts';
    expect(def.fileName).toBe(refFileName);
    expect(def.name).toBe('TestComponent');
    expect(def.kind).toBe('component');
    const content = mockHost.readFile(refFileName)!;
    const begin = '/*BeginTestComponent*/ ';
    const start = content.indexOf(begin) + begin.length;
    const end = content.indexOf(' /*EndTestComponent*/');
    expect(def.textSpan).toEqual({
      start,
      length: end - start,
    });
  });

  it('should be able to find an event provider', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<test-comp ~{start-my}(«test»)="myHandler()"~{end-my}></div>'
      })
      export class MyComponent { myHandler() {} }`);

    // Get the marker for «test» in the code added above.
    const marker = mockHost.getReferenceMarkerFor(fileName, 'test');

    const result = ngService.getDefinitionAndBoundSpan(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result!;

    // Get the marker for bounded text in the code added above
    const boundedText = mockHost.getLocationMarkerFor(fileName, 'my');
    expect(textSpan).toEqual(boundedText);

    // There should be exactly 1 definition
    expect(definitions).toBeDefined();
    expect(definitions!.length).toBe(1);
    const def = definitions![0];

    const refFileName = '/app/parsing-cases.ts';
    expect(def.fileName).toBe(refFileName);
    expect(def.name).toBe('testEvent');
    expect(def.kind).toBe('event');
    const content = mockHost.readFile(refFileName)!;
    const ref = `@Output('test') testEvent = new EventEmitter();`;
    expect(def.textSpan).toEqual({
      start: content.indexOf(ref),
      length: ref.length,
    });
  });

  it('should be able to find an input provider', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<test-comp ~{start-my}[«tcName»]="name"~{end-my}></div>'
      })
      export class MyComponent {
        name = 'my name';
      }`);

    // Get the marker for «test» in the code added above.
    const marker = mockHost.getReferenceMarkerFor(fileName, 'tcName');

    const result = ngService.getDefinitionAndBoundSpan(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result!;

    // Get the marker for bounded text in the code added above
    const boundedText = mockHost.getLocationMarkerFor(fileName, 'my');
    expect(textSpan).toEqual(boundedText);

    // There should be exactly 1 definition
    expect(definitions).toBeDefined();
    expect(definitions!.length).toBe(1);
    const def = definitions![0];

    const refFileName = '/app/parsing-cases.ts';
    expect(def.fileName).toBe(refFileName);
    expect(def.name).toBe('name');
    expect(def.kind).toBe('property');
    const content = mockHost.readFile(refFileName)!;
    const ref = `@Input('tcName') name = 'test';`;
    expect(def.textSpan).toEqual({
      start: content.indexOf(ref),
      length: ref.length,
    });
  });

  it('should be able to find a pipe', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<div *ngIf="input | «async»"></div>'
      })
      export class MyComponent {
        input: EventEmitter;
      }`);

    // Get the marker for «async» in the code added above.
    const marker = mockHost.getReferenceMarkerFor(fileName, 'async');
    const result = ngService.getDefinitionAndBoundSpan(fileName, marker.start);

    expect(result).toBeDefined();
    const {textSpan, definitions} = result!;
    expect(textSpan).toEqual(marker);

    expect(definitions).toBeDefined();
    expect(definitions!.length).toBe(3);

    const refFileName = '/node_modules/@angular/common/common.d.ts';
    for (const def of definitions!) {
      expect(def.fileName).toBe(refFileName);
      expect(def.name).toBe('async');
      expect(def.kind).toBe('pipe');
      // Not asserting the textSpan of definition because it's external file
    }
  });

  // https://github.com/angular/vscode-ng-language-service/issues/677
  it('should be able to find a pipe with arguments', () => {
    mockHost.override(TEST_TEMPLATE, `{{birthday | «date»: "MM/dd/yy"}}`);

    const marker = mockHost.getReferenceMarkerFor(TEST_TEMPLATE, 'date');
    const result = ngService.getDefinitionAndBoundSpan(TEST_TEMPLATE, marker.start);

    expect(result).toBeDefined();
    const {textSpan, definitions} = result!;
    expect(textSpan).toEqual(marker);

    expect(definitions).toBeDefined();
    expect(definitions!.length).toBe(3);

    const refFileName = '/node_modules/@angular/common/common.d.ts';
    for (const def of definitions!) {
      expect(def.fileName).toBe(refFileName);
      expect(def.name).toBe('date');
      expect(def.kind).toBe('pipe');
    }
  });

  describe('in structural directive', () => {
    it('should be able to find the directive', () => {
      mockHost.override(
          TEST_TEMPLATE, `<div ~{start-my}*«ngFor»="let item of heroes;"~{end-my}></div>`);

      // Get the marker for ngFor in the code added above.
      const marker = mockHost.getReferenceMarkerFor(TEST_TEMPLATE, 'ngFor');

      const result = ngService.getDefinitionAndBoundSpan(TEST_TEMPLATE, marker.start);
      expect(result).toBeDefined();
      const {textSpan, definitions} = result!;

      // Get the marker for bounded text in the code added above
      const boundedText = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'my');
      expect(textSpan).toEqual(boundedText);

      expect(definitions).toBeDefined();
      expect(definitions!.length).toBe(1);

      const refFileName = '/node_modules/@angular/common/common.d.ts';
      const def = definitions![0];
      expect(def.fileName).toBe(refFileName);
      expect(def.name).toBe('NgForOf');
      expect(def.kind).toBe('directive');
      // Not asserting the textSpan of definition because it's external file
    });

    it('should be able to find the directive property', () => {
      mockHost.override(TEST_TEMPLATE, `<div *ngFor="let item of heroes; «trackBy»: test;"></div>`);

      // Get the marker for trackBy in the code added above.
      const marker = mockHost.getReferenceMarkerFor(TEST_TEMPLATE, 'trackBy');

      const result = ngService.getDefinitionAndBoundSpan(TEST_TEMPLATE, marker.start);
      expect(result).toBeDefined();
      const {textSpan, definitions} = result!;

      // Get the marker for bounded text in the code added above
      expect(textSpan).toEqual(marker);

      expect(definitions).toBeDefined();
      // The two definitions are setter and getter of 'ngForTrackBy'.
      expect(definitions!.length).toBe(2);

      const refFileName = '/node_modules/@angular/common/common.d.ts';
      definitions!.forEach(def => {
        expect(def.fileName).toBe(refFileName);
        expect(def.name).toBe('ngForTrackBy');
        expect(def.kind).toBe('method');
      });
      // Not asserting the textSpan of definition because it's external file
    });

    it('should be able to find the property value', () => {
      mockHost.override(TEST_TEMPLATE, `<div *ngFor="let item of «heroes»; trackBy: test;"></div>`);

      // Get the marker for heroes in the code added above.
      const marker = mockHost.getReferenceMarkerFor(TEST_TEMPLATE, 'heroes');

      const result = ngService.getDefinitionAndBoundSpan(TEST_TEMPLATE, marker.start);
      expect(result).toBeDefined();
      const {textSpan, definitions} = result!;

      expect(textSpan).toEqual(marker);

      expect(definitions).toBeDefined();
      expect(definitions!.length).toBe(1);

      const refFileName = '/app/parsing-cases.ts';
      const def = definitions![0];
      expect(def.fileName).toBe(refFileName);
      expect(def.name).toBe('heroes');
      expect(def.kind).toBe('property');
      const content = mockHost.readFile(refFileName)!;
      expect(content.substring(def.textSpan.start, def.textSpan.start + def.textSpan.length))
          .toEqual(`heroes: Hero[] = [this.hero];`);
    });
  });

  it('should be able to find a two-way binding', () => {
    mockHost.override(
        TEST_TEMPLATE,
        `<test-comp string-model ~{start-my}[(«model»)]="title"~{end-my}></test-comp>`);
    // Get the marker for «model» in the code added above.
    const marker = mockHost.getReferenceMarkerFor(TEST_TEMPLATE, 'model');

    const result = ngService.getDefinitionAndBoundSpan(TEST_TEMPLATE, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result!;

    // Get the marker for bounded text in the code added above
    const boundedText = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'my');
    expect(textSpan).toEqual(boundedText);

    expect(definitions).toBeDefined();
    expect(definitions!.length).toBe(2);
    const [def1, def2] = definitions!;

    const refFileName = '/app/parsing-cases.ts';
    expect(def1.fileName).toBe(refFileName);
    expect(def1.name).toBe('model');
    expect(def1.kind).toBe('property');
    let content = mockHost.readFile(refFileName)!;
    expect(content.substring(def1.textSpan.start, def1.textSpan.start + def1.textSpan.length))
        .toEqual(`@Input() model: string = 'model';`);

    expect(def2.fileName).toBe(refFileName);
    expect(def2.name).toBe('modelChange');
    expect(def2.kind).toBe('event');
    content = mockHost.readFile(refFileName)!;
    expect(content.substring(def2.textSpan.start, def2.textSpan.start + def2.textSpan.length))
        .toEqual(`@Output() modelChange: EventEmitter<string> = new EventEmitter();`);
  });

  it('should be able to find a template from a url', () => {
    const fileName = mockHost.addCode(`
	      @Component({
	        templateUrl: './«test».ng',
	      })
	      export class MyComponent {}`);

    const marker = mockHost.getReferenceMarkerFor(fileName, 'test');
    const result = ngService.getDefinitionAndBoundSpan(fileName, marker.start);

    expect(result).toBeDefined();
    const {textSpan, definitions} = result!;

    expect(textSpan).toEqual({start: marker.start - 2, length: 9});

    expect(definitions).toBeDefined();
    expect(definitions!.length).toBe(1);
    const [def] = definitions!;
    expect(def.fileName).toBe('/app/test.ng');
    expect(def.textSpan).toEqual({start: 0, length: 0});
  });

  it('should be able to find a template from an absolute url', () => {
    const fileName = mockHost.addCode(`
      @Component({
        templateUrl: '${TEST_TEMPLATE}',
      })
      export class MyComponent {}`);

    const marker = mockHost.readFile(fileName)!.indexOf(TEST_TEMPLATE);
    const result = ngService.getDefinitionAndBoundSpan(fileName, marker);

    expect(result?.definitions?.[0].fileName).toBe(TEST_TEMPLATE);
  });

  it('should be able to find a stylesheet from a url', () => {
    const fileName = mockHost.addCode(`
	      @Component({
	        templateUrl: './test.ng',
                styleUrls: ['./«test».css'],
	      })
	      export class MyComponent {}`);

    const marker = mockHost.getReferenceMarkerFor(fileName, 'test');
    const result = ngService.getDefinitionAndBoundSpan(fileName, marker.start);

    expect(result).toBeDefined();
    const {textSpan, definitions} = result!;

    expect(textSpan).toEqual({start: marker.start - 2, length: 10});

    expect(definitions).toBeDefined();
    expect(definitions!.length).toBe(1);
    const [def] = definitions!;
    expect(def.fileName).toBe('/app/test.css');
    expect(def.textSpan).toEqual({start: 0, length: 0});
  });

  it('should not expand i18n templates', () => {
    const fileName = mockHost.addCode(`
      @Component({
        template: '<div i18n="@@el">{{«name»}}</div>'
      })
      export class MyComponent {
        «ᐱnameᐱ: string;»
      }`);

    const marker = mockHost.getReferenceMarkerFor(fileName, 'name');
    const result = ngService.getDefinitionAndBoundSpan(fileName, marker.start);
    expect(result).toBeDefined();
    const {textSpan, definitions} = result!;

    expect(textSpan).toEqual(marker);
    expect(definitions).toBeDefined();
    expect(definitions!.length).toBe(1);
    const def = definitions![0];

    expect(def.fileName).toBe(fileName);
    expect(def.name).toBe('name');
    expect(def.kind).toBe('property');
    expect(def.textSpan).toEqual(mockHost.getDefinitionMarkerFor(fileName, 'name'));
  });
});
