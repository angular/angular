/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {createLanguageService} from '../src/language_service';
import {Span} from '../src/types';
import {TypeScriptServiceHost} from '../src/typescript_host';

import {toh} from './test_data';

import {MockTypescriptHost,} from './test_utils';

describe('definitions', () => {
  let documentRegistry = ts.createDocumentRegistry();
  let mockHost = new MockTypescriptHost(['/app/main.ts', '/app/parsing-cases.ts'], toh);
  let service = ts.createLanguageService(mockHost, documentRegistry);
  let ngHost = new TypeScriptServiceHost(mockHost, service);
  let ngService = createLanguageService(ngHost);
  ngHost.setSite(ngService);

  it('should be able to find field in an interpolation', () => {
    localReference(
        ` @Component({template: '{{«name»}}'}) export class MyComponent { «∆name∆: string;» }`);
  });

  it('should be able to find a field in a attribute reference', () => {
    localReference(
        ` @Component({template: '<input [(ngModel)]="«name»">'}) export class MyComponent { «∆name∆: string;» }`);
  });

  it('should be able to find a method from a call', () => {
    localReference(
        ` @Component({template: '<div (click)="«myClick»();"></div>'}) export class MyComponent { «∆myClick∆() { }»}`);
  });

  it('should be able to find a field reference in an *ngIf', () => {
    localReference(
        ` @Component({template: '<div *ngIf="«include»"></div>'}) export class MyComponent { «∆include∆ = true;»}`);
  });

  it('should be able to find a reference to a component', () => {
    reference(
        'parsing-cases.ts',
        ` @Component({template: '<«test-comp»></test-comp>'}) export class MyComponent { }`);
  });

  it('should be able to find an event provider', () => {
    reference(
        '/app/parsing-cases.ts', 'test',
        ` @Component({template: '<test-comp («test»)="myHandler()"></div>'}) export class MyComponent { myHandler() {} }`);
  });

  it('should be able to find an input provider', () => {
    reference(
        '/app/parsing-cases.ts', 'tcName',
        ` @Component({template: '<test-comp [«tcName»]="name"></div>'}) export class MyComponent { name = 'my name'; }`);
  });

  it('should be able to find a pipe', () => {
    reference(
        'async_pipe.d.ts',
        ` @Component({template: '<div *ngIf="input | «async»"></div>'}) export class MyComponent { input: EventEmitter; }`);
  });

  function localReference(code: string) {
    addCode(code, fileName => {
      const refResult = mockHost.getReferenceMarkers(fileName) !;
      for (const name in refResult.references) {
        const references = refResult.references[name];
        const definitions = refResult.definitions[name];
        expect(definitions).toBeDefined();  // If this fails the test data is wrong.
        for (const reference of references) {
          const definition = ngService.getDefinitionAt(fileName, reference.start);
          if (definition) {
            definition.forEach(d => expect(d.fileName).toEqual(fileName));
            const match = matchingSpan(definition.map(d => d.span), definitions);
            if (!match) {
              throw new Error(
                  `Expected one of ${stringifySpans(definition.map(d => d.span))} to match one of ${stringifySpans(definitions)}`);
            }
          } else {
            throw new Error('Expected a definition');
          }
        }
      }
    });
  }

  function reference(referencedFile: string, code: string): void;
  function reference(referencedFile: string, span: Span, code: string): void;
  function reference(referencedFile: string, definition: string, code: string): void;
  function reference(referencedFile: string, p1?: any, p2?: any): void {
    const code: string = p2 ? p2 : p1;
    const definition: string = p2 ? p1 : undefined;
    let span: Span = p2 && p1.start != null ? p1 : undefined;
    if (definition && !span) {
      const referencedFileMarkers = mockHost.getReferenceMarkers(referencedFile) !;
      expect(referencedFileMarkers).toBeDefined();  // If this fails the test data is wrong.
      const spans = referencedFileMarkers.definitions[definition];
      expect(spans).toBeDefined();  // If this fails the test data is wrong.
      span = spans[0];
    }
    addCode(code, fileName => {
      const refResult = mockHost.getReferenceMarkers(fileName) !;
      let tests = 0;
      for (const name in refResult.references) {
        const references = refResult.references[name];
        expect(reference).toBeDefined();  // If this fails the test data is wrong.
        for (const reference of references) {
          tests++;
          const definition = ngService.getDefinitionAt(fileName, reference.start);
          if (definition) {
            definition.forEach(d => {
              if (d.fileName.indexOf(referencedFile) < 0) {
                throw new Error(
                    `Expected reference to file ${referencedFile}, received ${d.fileName}`);
              }
              if (span) {
                expect(d.span).toEqual(span);
              }
            });
          } else {
            throw new Error('Expected a definition');
          }
        }
      }
      if (!tests) {
        throw new Error('Expected at least one reference (test data error)');
      }
    });
  }

  function addCode(code: string, cb: (fileName: string, content?: string) => void) {
    const fileName = '/app/app.component.ts';
    const originalContent = mockHost.getFileContent(fileName);
    const newContent = originalContent + code;
    mockHost.override(fileName, originalContent + code);
    try {
      cb(fileName, newContent);
    } finally {
      mockHost.override(fileName, undefined !);
    }
  }
});

function matchingSpan(aSpans: Span[], bSpans: Span[]): Span|undefined {
  for (const a of aSpans) {
    for (const b of bSpans) {
      if (a.start == b.start && a.end == b.end) {
        return a;
      }
    }
  }
}

function stringifySpan(span: Span) {
  return span ? `(${span.start}-${span.end})` : '<undefined>';
}

function stringifySpans(spans: Span[]) {
  return spans ? `[${spans.map(stringifySpan).join(', ')}]` : '<empty>';
}