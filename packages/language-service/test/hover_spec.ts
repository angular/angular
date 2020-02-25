/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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

describe('hover', () => {
  const mockHost = new MockTypescriptHost(['/app/main.ts']);
  const tsLS = ts.createLanguageService(mockHost);
  const ngLSHost = new TypeScriptServiceHost(mockHost, tsLS);
  const ngLS = createLanguageService(ngLSHost);

  beforeEach(() => { mockHost.reset(); });

  describe('location of hover', () => {
    it('should find members in a text interpolation', () => {
      mockHost.override(TEST_TEMPLATE, '<div>{{«title»}}</div>');
      const marker = mockHost.getReferenceMarkerFor(TEST_TEMPLATE, 'title');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual(marker);
      expect(toText(displayParts)).toBe('(property) TemplateReference.title: string');
    });

    it('should find members in an attribute interpolation', () => {
      mockHost.override(TEST_TEMPLATE, `<div string-model model="{{«title»}}"></div>`);
      const marker = mockHost.getReferenceMarkerFor(TEST_TEMPLATE, 'title');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual(marker);
      expect(toText(displayParts)).toBe('(property) TemplateReference.title: string');
    });

    it('should find members in a property binding', () => {
      mockHost.override(TEST_TEMPLATE, `<test-comp [tcName]="«title»"></test-comp>`);
      const marker = mockHost.getReferenceMarkerFor(TEST_TEMPLATE, 'title');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual(marker);
      expect(toText(displayParts)).toBe('(property) TemplateReference.title: string');
    });

    it('should find members in an event binding', () => {
      mockHost.override(TEST_TEMPLATE, `<test-comp (test)="«title»=$event"></test-comp>`);
      const marker = mockHost.getReferenceMarkerFor(TEST_TEMPLATE, 'title');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual(marker);
      expect(toText(displayParts)).toBe('(property) TemplateReference.title: string');
    });

    it('should find members in a two-way binding', () => {
      mockHost.override(TEST_TEMPLATE, `<input [(ngModel)]="«title»" />`);
      const marker = mockHost.getReferenceMarkerFor(TEST_TEMPLATE, 'title');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual(marker);
      expect(toText(displayParts)).toBe('(property) TemplateReference.title: string');
    });

    it('should find members in a structural directive', () => {
      mockHost.override(TEST_TEMPLATE, `<div *ngIf="«anyValue»"></div>`);
      const marker = mockHost.getReferenceMarkerFor(TEST_TEMPLATE, 'anyValue');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual(marker);
      expect(toText(displayParts)).toBe('(property) TemplateReference.anyValue: any');
    });
  });

  describe('hovering on expression nodes', () => {
    it('should provide documentation', () => {
      mockHost.override(TEST_TEMPLATE, `<div>{{~{cursor}title}}</div>`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeDefined();
      const documentation = toText(quickInfo !.documentation);
      expect(documentation).toBe('This is the title of the `TemplateReference` Component.');
    });

    it('should work for property reads', () => {
      mockHost.override(TEST_TEMPLATE, `<div>{{«title»}}</div>`);
      const marker = mockHost.getReferenceMarkerFor(TEST_TEMPLATE, 'title');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual(marker);
      expect(textSpan.length).toBe('title'.length);
      expect(toText(displayParts)).toBe('(property) TemplateReference.title: string');
    });

    it('should work for method calls', () => {
      mockHost.override(TEST_TEMPLATE, `<div (click)="«ᐱmyClickᐱ($event)»"></div>`);
      const marker = mockHost.getDefinitionMarkerFor(TEST_TEMPLATE, 'myClick');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual(marker);
      expect(toText(displayParts)).toBe('(method) TemplateReference.myClick: (event: any) => void');
    });

    it('should work for structural directive inputs', () => {
      mockHost.override(
          TEST_TEMPLATE, `<div *ngFor="let item of heroes; «ᐱtrackByᐱ: test»;"></div>`);
      const marker = mockHost.getDefinitionMarkerFor(TEST_TEMPLATE, 'trackBy');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual(marker);
      expect(toText(displayParts)).toBe('(method) NgForOf<T, U>.ngForTrackBy: TrackByFunction<T>');
    });

    it('should work for members in structural directives', () => {
      mockHost.override(TEST_TEMPLATE, `<div *ngFor="let item of «heroes»; trackBy: test;"></div>`);
      const marker = mockHost.getReferenceMarkerFor(TEST_TEMPLATE, 'heroes');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual(marker);
      expect(toText(displayParts)).toBe('(property) TemplateReference.heroes: Hero[]');
    });

    it('should work for the $any() cast function', () => {
      const content = mockHost.override(TEST_TEMPLATE, '<div>{{$any(title)}}</div>');
      const position = content.indexOf('$any');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, position);
      expect(quickInfo).toBeDefined();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual({
        start: position,
        length: '$any(title)'.length,
      });
      expect(toText(displayParts)).toBe('(method) $any: $any');
    });
  });

  describe('hovering on template nodes', () => {
    it('should provide documentation', () => {
      mockHost.override(TEST_TEMPLATE, `<~{cursor}test-comp></test-comp>`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeDefined();
      const documentation = toText(quickInfo !.documentation);
      expect(documentation).toBe('This Component provides the `test-comp` selector.');
    });

    it('should work for components', () => {
      mockHost.override(TEST_TEMPLATE, '<~{cursor}test-comp></test-comp>');
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeDefined();
      const {displayParts, documentation} = quickInfo !;
      expect(toText(displayParts))
          .toBe('(component) AppModule.TestComponent: typeof TestComponent');
      expect(toText(documentation)).toBe('This Component provides the `test-comp` selector.');
    });

    it('should work for directives', () => {
      const content = mockHost.override(TEST_TEMPLATE, `<div string-model~{cursor}></div>`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeDefined();
      const {displayParts, textSpan} = quickInfo !;
      expect(toText(displayParts)).toBe('(directive) AppModule.StringModel: typeof StringModel');
      expect(content.substring(textSpan.start, textSpan.start + textSpan.length))
          .toBe('string-model');
    });

    it('should work for event providers', () => {
      mockHost.override(TEST_TEMPLATE, `<test-comp «(ᐱtestᐱ)="myClick($event)"»></div>`);
      const marker = mockHost.getDefinitionMarkerFor(TEST_TEMPLATE, 'test');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual(marker);
      expect(toText(displayParts)).toBe('(event) TestComponent.testEvent: EventEmitter<any>');
    });

    it('should work for input providers', () => {
      mockHost.override(TEST_TEMPLATE, `<test-comp «[ᐱtcNameᐱ]="name"»></div>`);
      const marker = mockHost.getDefinitionMarkerFor(TEST_TEMPLATE, 'tcName');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual(marker);
      expect(toText(displayParts)).toBe('(property) TestComponent.name: string');
    });

    it('should work for two-way binding providers', () => {
      mockHost.override(
          TEST_TEMPLATE, `<test-comp string-model «[(ᐱmodelᐱ)]="title"»></test-comp>`);
      const marker = mockHost.getDefinitionMarkerFor(TEST_TEMPLATE, 'model');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual(marker);
      expect(toText(displayParts)).toBe('(property) StringModel.model: string');
    });

    it('should work for structural directives', () => {
      mockHost.override(TEST_TEMPLATE, `<div «*ᐱngForᐱ="let item of heroes"»></div>`);
      const marker = mockHost.getDefinitionMarkerFor(TEST_TEMPLATE, 'ngFor');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual(marker);
      expect(toText(displayParts)).toBe('(directive) NgForOf: typeof NgForOf');
    });
  });

  describe('hovering on TypeScript nodes', () => {
    it('should work for component TypeScript declarations', () => {
      const content = mockHost.readFile(PARSING_CASES) !;
      const position = content.indexOf('TemplateReference');
      expect(position).toBeGreaterThan(0);
      const quickInfo = ngLS.getQuickInfoAtPosition(PARSING_CASES, position);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual({
        start: position,
        length: 'TemplateReference'.length,
      });
      expect(toText(displayParts)).toBe('(component) AppModule.TemplateReference: class');
    });

    it('should work for directive TypeScript declarations', () => {
      const content = mockHost.readFile(PARSING_CASES) !;
      const position = content.indexOf('StringModel');
      expect(position).toBeGreaterThan(0);
      const quickInfo = ngLS.getQuickInfoAtPosition(PARSING_CASES, position);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual({
        start: position,
        length: 'StringModel'.length,
      });
      expect(toText(displayParts)).toBe('(directive) AppModule.StringModel: class');
    });
  });

  describe('non-goals', () => {
    it('should ignore reference declarations', () => {
      mockHost.override(TEST_TEMPLATE, `<div #«chart»></div>`);
      const marker = mockHost.getReferenceMarkerFor(TEST_TEMPLATE, 'chart');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeUndefined();
    });

    it('should not expand i18n templates', () => {
      mockHost.override(TEST_TEMPLATE, `<div i18n="@@el">{{«title»}}</div>`);
      const marker = mockHost.getReferenceMarkerFor(TEST_TEMPLATE, 'title');
      const quickInfo = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, marker.start);
      expect(quickInfo).toBeTruthy();
      const {textSpan, displayParts} = quickInfo !;
      expect(textSpan).toEqual(marker);
      expect(toText(displayParts)).toBe('(property) TemplateReference.title: string');
    });
  });
});

function toText(displayParts?: ts.SymbolDisplayPart[]): string {
  return (displayParts || []).map(p => p.text).join('');
}
