/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {createLanguageService} from '../src/language_service';
import {CompletionKind} from '../src/types';
import {TypeScriptServiceHost} from '../src/typescript_host';

import {MockTypescriptHost} from './test_utils';

const APP_COMPONENT = '/app/app.component.ts';
const PARSING_CASES = '/app/parsing-cases.ts';
const TEST_TEMPLATE = '/app/test.ng';
const EXPRESSION_CASES = '/app/expression-cases.ts';

describe('completions', () => {
  const mockHost = new MockTypescriptHost(['/app/main.ts']);
  const tsLS = ts.createLanguageService(mockHost);
  const ngHost = new TypeScriptServiceHost(mockHost, tsLS);
  const ngLS = createLanguageService(ngHost);

  it('should be able to get entity completions', () => {
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'entity-amp');
    const completions = ngLS.getCompletionsAt(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.ENTITY, ['&amp;', '&gt;', '&lt;', '&iota;']);
  });

  it('should be able to return html elements', () => {
    const locations = ['empty', 'start-tag-h1', 'h1-content', 'start-tag', 'start-tag-after-h'];
    for (const location of locations) {
      const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, location);
      const completions = ngLS.getCompletionsAt(APP_COMPONENT, marker.start);
      expectContain(completions, CompletionKind.ELEMENT, ['div', 'h1', 'h2', 'span']);
    }
  });

  it('should be able to return element directives', () => {
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'empty');
    const completions = ngLS.getCompletionsAt(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.COMPONENT, [
      'ng-form',
      'my-app',
      'ng-component',
      'test-comp',
    ]);
  });

  it('should be able to return h1 attributes', () => {
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'h1-after-space');
    const completions = ngLS.getCompletionsAt(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.HTML_ATTRIBUTE, [
      'class',
      'id',
      'onclick',
      'onmouseup',
    ]);
  });

  it('should be able to find common angular attributes', () => {
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'div-attributes');
    const completions = ngLS.getCompletionsAt(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.ATTRIBUTE, [
      '(click)',
      '[ngClass]',
      '*ngIf',
      '*ngFor',
    ]);
  });

  it('should be able to get the completions at the beginning of an interpolation', () => {
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'h2-hero');
    const completions = ngLS.getCompletionsAt(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.PROPERTY, ['title', 'hero']);
  });

  it('should not include private members of a class', () => {
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'h2-hero');
    const completions = ngLS.getCompletionsAt(APP_COMPONENT, marker.start);
    expect(completions).toBeDefined();
    const internal = completions !.entries.find(e => e.name === 'internal');
    expect(internal).toBeUndefined();
  });

  it('should be able to get the completions at the end of an interpolation', () => {
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'sub-end');
    const completions = ngLS.getCompletionsAt(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.PROPERTY, ['title', 'hero']);
  });

  it('should be able to get the completions in a property', () => {
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'h2-name');
    const completions = ngLS.getCompletionsAt(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.PROPERTY, ['id', 'name']);
  });

  it('should be able to return attribute names with an incompete attribute', () => {
    const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'no-value-attribute');
    const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
    expectContain(completions, CompletionKind.HTML_ATTRIBUTE, ['id', 'class', 'dir', 'lang']);
  });

  it('should be able to return attributes of an incomplete element', () => {
    const m1 = mockHost.getLocationMarkerFor(PARSING_CASES, 'incomplete-open-lt');
    const c1 = ngLS.getCompletionsAt(PARSING_CASES, m1.start);
    expectContain(c1, CompletionKind.ELEMENT, ['a', 'div', 'p', 'span']);

    const m2 = mockHost.getLocationMarkerFor(PARSING_CASES, 'incomplete-open-a');
    const c2 = ngLS.getCompletionsAt(PARSING_CASES, m2.start);
    expectContain(c2, CompletionKind.ELEMENT, ['a', 'div', 'p', 'span']);

    const m3 = mockHost.getLocationMarkerFor(PARSING_CASES, 'incomplete-open-attr');
    const c3 = ngLS.getCompletionsAt(PARSING_CASES, m3.start);
    expectContain(c3, CompletionKind.HTML_ATTRIBUTE, ['id', 'class', 'href', 'name']);
  });

  it('should be able to return completions with a missing closing tag', () => {
    const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'missing-closing');
    const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
    expectContain(completions, CompletionKind.ELEMENT, ['a', 'div', 'p', 'span', 'h1', 'h2']);
  });

  it('should be able to return common attributes of an unknown tag', () => {
    const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'unknown-element');
    const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
    expectContain(completions, CompletionKind.HTML_ATTRIBUTE, ['id', 'dir', 'lang']);
  });

  it('should be able to get completions in an empty interpolation', () => {
    const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'empty-interpolation');
    const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
    expectContain(completions, CompletionKind.PROPERTY, ['title', 'subTitle']);
  });

  describe('in external template', () => {
    it('should be able to get entity completions in external template', () => {
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'entity-amp');
      const completions = ngLS.getCompletionsAt(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.ENTITY, ['&amp;', '&gt;', '&lt;', '&iota;']);
    });

    it('should be able to return html elements', () => {
      const locations = ['empty', 'start-tag-h1', 'h1-content', 'start-tag', 'start-tag-after-h'];
      for (const location of locations) {
        const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, location);
        const completions = ngLS.getCompletionsAt(TEST_TEMPLATE, marker.start);
        expectContain(completions, CompletionKind.ELEMENT, ['div', 'h1', 'h2', 'span']);
      }
    });

    it('should be able to return element diretives', () => {
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'empty');
      const completions = ngLS.getCompletionsAt(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.COMPONENT, [
        'ng-form',
        'my-app',
        'ng-component',
        'test-comp',
      ]);
    });

    it('should be able to return h1 attributes', () => {
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'h1-after-space');
      const completions = ngLS.getCompletionsAt(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.HTML_ATTRIBUTE, [
        'class',
        'id',
        'onclick',
        'onmouseup',
      ]);
    });

    it('should be able to find common angular attributes', () => {
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'div-attributes');
      const completions = ngLS.getCompletionsAt(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.ATTRIBUTE, [
        '(click)',
        '[ngClass]',
        '*ngIf',
        '*ngFor',
      ]);
    });
  });

  describe('with a *ngIf', () => {
    it('should be able to get completions for exported *ngIf variable', () => {
      const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'promised-person-name');
      const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['name', 'age', 'street']);
    });
  });

  describe('with a *ngFor', () => {
    it('should include a let for empty attribute', () => {
      const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'for-empty');
      const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
      expectContain(completions, CompletionKind.KEY, ['let', 'of']);
    });

    it('should suggest NgForRow members for let initialization expression', () => {
      const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'for-let-i-equal');
      const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, [
        '$implicit',
        'ngForOf',
        'index',
        'count',
        'first',
        'last',
        'even',
        'odd',
      ]);
    });

    it('should include a let', () => {
      const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'for-let');
      const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
      expectContain(completions, CompletionKind.KEY, ['let', 'of']);
    });

    it('should include an "of"', () => {
      const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'for-of');
      const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
      expectContain(completions, CompletionKind.KEY, ['let', 'of']);
    });

    it('should include field reference', () => {
      const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'for-people');
      const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['people']);
    });

    it('should include person in the let scope', () => {
      const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'for-interp-person');
      const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
      expectContain(completions, CompletionKind.VARIABLE, ['person']);
    });

    it('should be able to infer the type of a ngForOf', () => {
      for (const location of ['for-interp-name', 'for-interp-age']) {
        const marker = mockHost.getLocationMarkerFor(PARSING_CASES, location);
        const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
        expectContain(completions, CompletionKind.PROPERTY, ['name', 'age', 'street']);
      }
    });

    it('should be able to infer the type of a ngForOf with an async pipe', () => {
      const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'async-person-name');
      const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['name', 'age', 'street']);
    });
  });

  describe('data binding', () => {
    it('should be able to complete property value', () => {
      const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'property-binding-model');
      const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['test']);
    });

    it('should be able to complete an event', () => {
      const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'event-binding-model');
      const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
      expectContain(completions, CompletionKind.METHOD, ['modelChanged']);
    });

    it('should be able to complete a two-way binding', () => {
      const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'two-way-binding-model');
      const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['test']);
    });

    it('should work with input and output', () => {
      const m1 = mockHost.getLocationMarkerFor(PARSING_CASES, 'string-marker');
      const c1 = ngLS.getCompletionsAt(PARSING_CASES, m1.start);
      expectContain(c1, CompletionKind.ATTRIBUTE, ['[model]', '(model)']);

      const m2 = mockHost.getLocationMarkerFor(PARSING_CASES, 'number-marker');
      const c2 = ngLS.getCompletionsAt(PARSING_CASES, m2.start);
      expectContain(c2, CompletionKind.ATTRIBUTE, ['[inputAlias]', '(outputAlias)']);
    });
  });

  describe('for pipes', () => {
    it('should be able to get a list of pipe values', () => {
      for (const location of ['before-pipe', 'in-pipe', 'after-pipe']) {
        const marker = mockHost.getLocationMarkerFor(PARSING_CASES, location);
        const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
        expectContain(completions, CompletionKind.PIPE, [
          'async',
          'uppercase',
          'lowercase',
          'titlecase',
        ]);
      }
    });

    it('should be able to resolve lowercase', () => {
      const marker = mockHost.getLocationMarkerFor(EXPRESSION_CASES, 'string-pipe');
      const completions = ngLS.getCompletionsAt(EXPRESSION_CASES, marker.start);
      expectContain(completions, CompletionKind.METHOD, [
        'charAt',
        'replace',
        'substring',
        'toLowerCase',
      ]);
    });
  });

  describe('with references', () => {
    it('should list references', () => {
      const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'test-comp-content');
      const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
      expectContain(completions, CompletionKind.REFERENCE, ['div', 'test1', 'test2']);
    });

    it('should reference the component', () => {
      const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'test-comp-after-test');
      const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['name', 'testEvent']);
    });

    // TODO: Enable when we have a flag that indicates the project targets the DOM
    // it('should reference the element if no component', () => {
    //   const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'test-comp-after-div');
    //   const completions = ngLS.getCompletionsAt(PARSING_CASES, marker.start);
    //   expectContain(completions, CompletionKind.PROPERTY, ['innerText']);
    // });
  });
});

function expectContain(
    completions: ts.CompletionInfo | undefined, kind: CompletionKind, names: string[]) {
  expect(completions).toBeDefined();
  expect(completions !.entries).toEqual(jasmine.arrayContaining(names.map(name => {
    return jasmine.objectContaining({name, kind});
  }) as any));
}
