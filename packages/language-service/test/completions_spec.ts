/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
const TEST_TEMPLATE = '/app/test.ng';

describe('completions', () => {
  const mockHost = new MockTypescriptHost(['/app/main.ts']);
  const tsLS = ts.createLanguageService(mockHost);
  const ngHost = new TypeScriptServiceHost(mockHost, tsLS);
  const ngLS = createLanguageService(ngHost);

  beforeEach(() => {
    mockHost.reset();
  });

  it('should be able to return html elements', () => {
    mockHost.overrideInlineTemplate(APP_COMPONENT, '<~{cursor}');
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.HTML_ELEMENT, ['div', 'h1', 'h2', 'span']);
  });

  it('should be able to return component directives', () => {
    mockHost.overrideInlineTemplate(APP_COMPONENT, '<~{cursor}');
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.COMPONENT, [
      'ng-form',
      'my-app',
      'ng-component',
      'test-comp',
    ]);
  });

  it('should be able to return attribute directives', () => {
    mockHost.overrideInlineTemplate(APP_COMPONENT, '<h1 ~{cursor}>');
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.ATTRIBUTE, ['string-model', 'number-model']);
  });

  it('should be able to return angular pseudo elements', () => {
    mockHost.overrideInlineTemplate(APP_COMPONENT, `<~{cursor}`);
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.ANGULAR_ELEMENT, [
      'ng-container',
      'ng-content',
      'ng-template',
    ]);
  });

  it('should be able to return h1 attributes', () => {
    mockHost.overrideInlineTemplate(APP_COMPONENT, '<h1 ~{cursor}>');
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.HTML_ATTRIBUTE, [
      'class',
      'id',
      'onclick',
      'onmouseup',
    ]);
  });

  it('should be able to find common Angular attributes', () => {
    mockHost.overrideInlineTemplate(APP_COMPONENT, '<div ~{cursor}>');
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.ATTRIBUTE, [
      'ngClass',
      'ngForm',
      'ngModel',
      'string-model',
      'number-model',
    ]);
  });

  it('should be able to get the completions at the beginning of an interpolation', () => {
    mockHost.overrideInlineTemplate(APP_COMPONENT, '<h2>{{ ~{cursor} }}</h2>');
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.PROPERTY, ['title', 'hero']);
  });

  it('should not include private members of a class', () => {
    mockHost.overrideInlineTemplate(APP_COMPONENT, '<h2>{{ ~{cursor} }}</h2>');
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(APP_COMPONENT, marker.start);
    expect(completions).toBeDefined();
    const internal = completions!.entries.find(e => e.name === 'internal');
    expect(internal).toBeUndefined();
  });

  it('should be able to get the completions at the end of an interpolation', () => {
    mockHost.overrideInlineTemplate(APP_COMPONENT, '{{ti~{cursor}}}');
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.PROPERTY, ['title', 'hero']);
  });

  it('should be able to get the completions in a property', () => {
    mockHost.overrideInlineTemplate(APP_COMPONENT, '<h2>{{ hero.~{cursor} }}</h2>');
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.PROPERTY, ['id', 'name']);
  });

  it('should suggest template references', () => {
    mockHost.override(TEST_TEMPLATE, `<div *~{cursor}></div>`);
    const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
    expectContain(completions, CompletionKind.ATTRIBUTE, [
      'ngFor',
      'ngForOf',
      'ngIf',
      'ngSwitchCase',
      'ngSwitchDefault',
      'ngPluralCase',
      'ngTemplateOutlet',
    ]);
  });

  it('should be able to return attribute names with an incomplete attribute', () => {
    mockHost.overrideInlineTemplate(APP_COMPONENT, '<h1 h~{no-value-attribute}></h1>');
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'no-value-attribute');
    const completions = ngLS.getCompletionsAtPosition(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.HTML_ATTRIBUTE, ['id', 'class', 'dir', 'lang']);
  });

  it('should be able to return attributes of an incomplete element', () => {
    mockHost.overrideInlineTemplate(APP_COMPONENT, `
      <h1>
        Some <~{incomplete-open-lt}a~{incomplete-open-a} ~{incomplete-open-attr} text
      </h1>`);

    const m1 = mockHost.getLocationMarkerFor(APP_COMPONENT, 'incomplete-open-lt');
    const c1 = ngLS.getCompletionsAtPosition(APP_COMPONENT, m1.start);
    expectContain(c1, CompletionKind.HTML_ELEMENT, ['a', 'div', 'p', 'span']);

    const m2 = mockHost.getLocationMarkerFor(APP_COMPONENT, 'incomplete-open-a');
    const c2 = ngLS.getCompletionsAtPosition(APP_COMPONENT, m2.start);
    expectContain(c2, CompletionKind.HTML_ELEMENT, ['a', 'div', 'p', 'span']);

    const m3 = mockHost.getLocationMarkerFor(APP_COMPONENT, 'incomplete-open-attr');
    const c3 = ngLS.getCompletionsAtPosition(APP_COMPONENT, m3.start);
    expectContain(c3, CompletionKind.HTML_ATTRIBUTE, ['id', 'class', 'href', 'name']);
  });

  it('should be able to return completions with a missing closing tag', () => {
    mockHost.overrideInlineTemplate(APP_COMPONENT, '<h1>Some <a> ~{missing-closing} text</h1>');
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'missing-closing');
    const completions = ngLS.getCompletionsAtPosition(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.HTML_ELEMENT, ['a', 'div', 'p', 'span', 'h1', 'h2']);
  });

  it('should be able to return common attributes of an unknown tag', () => {
    mockHost.overrideInlineTemplate(
        APP_COMPONENT, '<h1>Some <unknown ~{unknown-element}> text</h1>');
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'unknown-element');
    const completions = ngLS.getCompletionsAtPosition(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.HTML_ATTRIBUTE, ['id', 'dir', 'lang']);
  });

  it('should be able to get completions in an empty interpolation', () => {
    mockHost.override(TEST_TEMPLATE, `{{ ~{cursor} }}`);
    const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
    expectContain(completions, CompletionKind.PROPERTY, ['title', 'hero']);
  });

  it('should suggest $any() type cast function in an interpolation', () => {
    mockHost.overrideInlineTemplate(APP_COMPONENT, '{{ ~{cursor} }}');
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(APP_COMPONENT, marker.start);
    expectContain(completions, CompletionKind.METHOD, ['$any']);
  });

  it('should suggest attribute values', () => {
    mockHost.override(TEST_TEMPLATE, `<div [id]="~{cursor}"></div>`);
    const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
    expectContain(completions, CompletionKind.PROPERTY, [
      'title',
      'hero',
      'heroes',
      'league',
      'anyValue',
    ]);
  });

  it('should suggest event handlers', () => {
    mockHost.override(TEST_TEMPLATE, `<div (click)="~{cursor}"></div>`);
    const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
    expectContain(completions, CompletionKind.METHOD, ['myClick']);
  });

  it('for methods should include parentheses', () => {
    mockHost.override(TEST_TEMPLATE, `<div (click)="~{cursor}"></div>`);
    const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
    expect(completions).toBeDefined();
    expect(completions!.entries).toContain(jasmine.objectContaining({
      name: 'myClick',
      kind: CompletionKind.METHOD as any,
      insertText: 'myClick()',
    }));
  });

  it('for methods of pipe should not include parentheses', () => {
    mockHost.override(TEST_TEMPLATE, `<h1>{{title | lowe~{pipe-method} }}`);
    const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'pipe-method');
    const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
    expect(completions).toBeDefined();
    expect(completions!.entries).toContain(jasmine.objectContaining({
      name: 'lowercase',
      kind: CompletionKind.PIPE as any,
      insertText: 'lowercase',
    }));
  });

  describe('in external template', () => {
    it('should not return html elements', () => {
      mockHost.override(TEST_TEMPLATE, '<~{cursor}');
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expect(completions).toBeDefined();
      const {entries} = completions!;
      expect(entries).not.toContain(jasmine.objectContaining({name: 'div'}));
      expect(entries).not.toContain(jasmine.objectContaining({name: 'h1'}));
      expect(entries).not.toContain(jasmine.objectContaining({name: 'h2'}));
      expect(entries).not.toContain(jasmine.objectContaining({name: 'span'}));
    });

    it('should be able to return element directives', () => {
      mockHost.override(TEST_TEMPLATE, '<~{cursor}');
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.COMPONENT, [
        'ng-form',
        'my-app',
        'ng-component',
        'test-comp',
      ]);
    });

    it('should not return html attributes', () => {
      mockHost.override(TEST_TEMPLATE, '<h1 ~{cursor}>');
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expect(completions).toBeDefined();
      const {entries} = completions!;
      expect(entries).not.toContain(jasmine.objectContaining({name: 'class'}));
      expect(entries).not.toContain(jasmine.objectContaining({name: 'id'}));
      expect(entries).not.toContain(jasmine.objectContaining({name: 'onclick'}));
      expect(entries).not.toContain(jasmine.objectContaining({name: 'onmouseup'}));
    });

    it('should be able to find common Angular attributes', () => {
      mockHost.override(TEST_TEMPLATE, `<div ~{cursor}></div>`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.ATTRIBUTE, [
        'ngClass',
        'ngForm',
        'ngModel',
        'string-model',
        'number-model',
      ]);
    });
  });

  describe('with a *ngIf', () => {
    it('should be able to get completions for exported *ngIf variable', () => {
      mockHost.override(TEST_TEMPLATE, `
        <div *ngIf="heroP | async as h">
          {{ h.~{cursor} }}
        </div>
      `);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['id', 'name']);
    });
  });

  describe('with a *ngFor', () => {
    it('should suggest NgForRow members for let initialization expression', () => {
      mockHost.override(TEST_TEMPLATE, `<div *ngFor="let i=~{cursor}"></div>`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
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

    it('should not provide suggestion before the = sign', () => {
      mockHost.override(TEST_TEMPLATE, `<div *ngFor="let i~{cursor}="></div>`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expect(completions).toBeUndefined();
    });

    describe('template binding: key expression', () => {
      it('should complete the RHS of a template key expression without an expression value', () => {
        mockHost.override(
            TEST_TEMPLATE, `<div *ngFor="let x of ~{cursor}"></div>`);  // value is undefined
        const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
        const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
        expectContain(completions, CompletionKind.PROPERTY, ['title', 'heroes', 'league']);
        // the symbol 'x' declared in *ngFor is also in scope. This asserts that
        // we are actually taking the AST into account and not just referring to
        // the symbol table of the Component.
        expectContain(completions, CompletionKind.VARIABLE, ['x']);
      });

      it('should complete the RHS of a template key expression with an expression value', () => {
        mockHost.override(
            TEST_TEMPLATE, `<div *ngFor="let x of t~{cursor}"></div>`);  // value is defined
        const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
        const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
        expectContain(completions, CompletionKind.PROPERTY, ['title', 'heroes', 'league']);
        // the symbol 'x' declared in *ngFor is also in scope. This asserts that
        // we are actually taking the AST into account and not just referring to
        // the symbol table of the Component.
        expectContain(completions, CompletionKind.VARIABLE, ['x']);
      });
    });

    it('should include expression completions', () => {
      mockHost.override(TEST_TEMPLATE, `<div *ngFor="let x of hero.~{expr-property-read}"></div>`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'expr-property-read');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['name']);
    });

    it('should include variable in the let scope in interpolation', () => {
      mockHost.override(TEST_TEMPLATE, `
        <div *ngFor="let h of heroes">
          {{~{cursor}}}
        </div>
      `);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.VARIABLE, ['h']);
    });

    it('should be able to infer the type of a ngForOf', () => {
      mockHost.override(TEST_TEMPLATE, `
        <div *ngFor="let h of heroes">
          {{ h.~{cursor} }}
        </div>
      `);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['id', 'name']);
    });

    it('should be able to infer the type of a ngForOf with an async pipe', () => {
      mockHost.override(TEST_TEMPLATE, `
        <div *ngFor="let h of heroesP | async">
          {{ h.~{cursor} }}
        </div>
      `);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['id', 'name']);
    });

    it('should be able to resolve variable in nested loop', () => {
      mockHost.override(TEST_TEMPLATE, `
        <div *ngFor="let leagueMembers of league">
          <div *ngFor="let member of leagueMembers">
            {{member.~{position}}}
          </div>
        </div>
      `);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'position');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      // member variable of type Hero has properties 'id' and 'name'.
      expectContain(completions, CompletionKind.PROPERTY, ['id', 'name']);
    });
  });

  describe('data binding', () => {
    it('should be able to complete property value', () => {
      mockHost.override(TEST_TEMPLATE, `<h1 [model]="~{cursor}"></h1>`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['title']);
    });

    it('should be able to complete property read', () => {
      mockHost.override(TEST_TEMPLATE, `<h1 [model]="hero.~{property-read}"></h1>`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'property-read');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['id', 'name']);
    });

    it('should be able to complete an event', () => {
      mockHost.override(TEST_TEMPLATE, `<h1 (model)="~{cursor}"></h1>`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.METHOD, ['myClick']);
    });

    it('should be able to complete a the LHS of a two-way binding', () => {
      mockHost.override(TEST_TEMPLATE, `<div [(~{cursor})]></div>`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.ATTRIBUTE, ['ngModel']);
    });

    it('should be able to complete a the RHS of a two-way binding', () => {
      mockHost.override(TEST_TEMPLATE, `<h1 [(model)]="~{cursor}"></h1>`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['title']);
    });

    it('should suggest property binding for input', () => {
      // Property binding via []
      mockHost.override(TEST_TEMPLATE, `<div number-model [~{cursor}]></div>`);
      const m1 = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const c1 = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, m1.start);
      expectContain(c1, CompletionKind.ATTRIBUTE, ['inputAlias']);

      // Property binding via bind-
      mockHost.override(TEST_TEMPLATE, `<div number-model bind-~{cursor}></div>`);
      const m2 = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const c2 = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, m2.start);
      expectContain(c2, CompletionKind.ATTRIBUTE, ['inputAlias']);
    });

    it('should suggest event binding for output', () => {
      // Event binding via ()
      mockHost.override(TEST_TEMPLATE, `<div number-model (~{cursor})></div>`);
      const m1 = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const c1 = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, m1.start);
      expectContain(c1, CompletionKind.ATTRIBUTE, ['outputAlias']);

      // Event binding via on-
      mockHost.override(TEST_TEMPLATE, `<div number-mode on-~{cursor}></div>`);
      const m2 = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const c2 = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, m2.start);
      expectContain(c2, CompletionKind.ATTRIBUTE, ['outputAlias']);
    });

    it('should suggest two-way binding for input and output', () => {
      // Banana-in-a-box via [()]
      mockHost.override(TEST_TEMPLATE, `<div string-model [(~{cursor})]></div>`);
      const m1 = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const c1 = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, m1.start);
      expectContain(c1, CompletionKind.ATTRIBUTE, ['model']);

      // Banana-in-a-box via bindon-
      mockHost.override(TEST_TEMPLATE, `<div string-model bindon-~{cursor}></div>`);
      const m2 = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const c2 = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, m2.start);
      expectContain(c2, CompletionKind.ATTRIBUTE, ['model']);
    });
  });

  describe('for pipes', () => {
    it('should be able to get a list of pipe values', () => {
      // TODO(kyliau): does not work for case {{ title | ~{cursor} }}
      //                  space before and after pipe ^^^
      mockHost.override(TEST_TEMPLATE, `{{ title|~{cursor} }}`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.PIPE, [
        'async',
        'lowercase',
        'slice',
        'titlecase',
        'uppercase',
      ]);
    });

    it('should be able to resolve lowercase', () => {
      mockHost.override(TEST_TEMPLATE, `{{ (title | lowercase).~{cursor} }}`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
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
      mockHost.override(TEST_TEMPLATE, `
        <div #myDiv>
          <test-comp #test1>
            {{ ~{cursor} }}
          </test-comp>
        </div>
        <test-comp #test2></test-comp>
      `);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.REFERENCE, ['myDiv', 'test1', 'test2']);
    });

    it('should reference the component', () => {
      mockHost.override(TEST_TEMPLATE, `
        <test-comp #test1>
          {{ test1.~{cursor} }}
        </test-comp>
      `);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['name', 'testEvent']);
    });

    it('should get reference property completions in a data binding', () => {
      mockHost.override(TEST_TEMPLATE, `
        <test-comp #test></test-comp>
        <div (click)="test.~{property-read}"></div>
      `);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'property-read');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['name', 'testEvent']);
    });

    // TODO: Enable when we have a flag that indicates the project targets the DOM
    // it('should reference the element if no component', () => {
    //   const marker = mockHost.getLocationMarkerFor(PARSING_CASES, 'test-comp-after-div');
    //   const completions = ngLS.getCompletionsAtPosition(PARSING_CASES, marker.start);
    //   expectContain(completions, CompletionKind.PROPERTY, ['innerText']);
    // });
  });

  describe('replacement span', () => {
    it('should not generate replacement entries for zero-length replacements', () => {
      const fileName = mockHost.addCode(`
        @Component({
          selector: 'foo-component',
          template: \`
            <div>{{obj.~{key}}}</div>
          \`,
        })
        export class FooComponent {
          obj: {key: 'value'};
        }
      `);
      const location = mockHost.getLocationMarkerFor(fileName, 'key');
      const completions = ngLS.getCompletionsAtPosition(fileName, location.start)!;
      expect(completions).toBeDefined();
      const completion = completions.entries.find(entry => entry.name === 'key')!;
      expect(completion).toBeDefined();
      expect(completion.kind).toBe('property');
      expect(completion.replacementSpan).toBeUndefined();
    });

    it('should work for start of template', () => {
      const fileName = mockHost.addCode(`
        @Component({
          selector: 'foo-component',
          template: \`~{start}abc\`,
        })
        export class FooComponent {}
      `);
      const location = mockHost.getLocationMarkerFor(fileName, 'start');
      const completions = ngLS.getCompletionsAtPosition(fileName, location.start)!;
      expect(completions).toBeDefined();
      const completion = completions.entries.find(entry => entry.name === 'acronym')!;
      expect(completion).toBeDefined();
      expect(completion.kind).toBe('html element');
      expect(completion.replacementSpan).toEqual({start: location.start, length: 3});
    });

    it('should work for end of template', () => {
      const fileName = mockHost.addCode(`
        @Component({
          selector: 'foo-component',
          template: \`acro~{end}\`,
        })
        export class FooComponent {}
      `);
      const location = mockHost.getLocationMarkerFor(fileName, 'end');
      const completions = ngLS.getCompletionsAtPosition(fileName, location.start)!;
      expect(completions).toBeDefined();
      const completion = completions.entries.find(entry => entry.name === 'acronym')!;
      expect(completion).toBeDefined();
      expect(completion.kind).toBe('html element');
      expect(completion.replacementSpan).toEqual({start: location.start - 4, length: 4});
    });

    it('should work for middle-word replacements', () => {
      const fileName = mockHost.addCode(`
        @Component({
          selector: 'foo-component',
          template: \`
            <div>{{obj.ke~{key}key}}</div>
          \`,
        })
        export class FooComponent {
          obj: {key: 'value'};
        }
      `);
      const location = mockHost.getLocationMarkerFor(fileName, 'key');
      const completions = ngLS.getCompletionsAtPosition(fileName, location.start)!;
      expect(completions).toBeDefined();
      const completion = completions.entries.find(entry => entry.name === 'key')!;
      expect(completion).toBeDefined();
      expect(completion.kind).toBe('property');
      expect(completion.replacementSpan).toEqual({start: location.start - 2, length: 5});
    });

    it('should work for all kinds of identifier characters', () => {
      const fileName = mockHost.addCode(`
        @Component({
          selector: 'foo-component',
          template: \`
            <div>{{~{field}$title_1}}</div>
          \`,
        })
        export class FooComponent {
          $title_1: string;
        }
      `);
      const location = mockHost.getLocationMarkerFor(fileName, 'field');
      const completions = ngLS.getCompletionsAtPosition(fileName, location.start)!;
      expect(completions).toBeDefined();
      const completion = completions.entries.find(entry => entry.name === '$title_1')!;
      expect(completion).toBeDefined();
      expect(completion.kind).toBe('property');
      expect(completion.replacementSpan).toEqual({start: location.start, length: 8});
    });

    it('should work for attributes', () => {
      const fileName = mockHost.addCode(`
        @Component({
          selector: 'foo-component',
          template: \`
            <div (cl~{click})></div>
          \`,
        })
        export class FooComponent {}
      `);
      const location = mockHost.getLocationMarkerFor(fileName, 'click');
      const completions = ngLS.getCompletionsAtPosition(fileName, location.start)!;
      expect(completions).toBeDefined();
      const completion = completions.entries.find(entry => entry.name === 'click')!;
      expect(completion).toBeDefined();
      expect(completion.kind).toBe(CompletionKind.ATTRIBUTE);
      expect(completion.replacementSpan).toEqual({start: location.start - 2, length: 2});
    });

    it('should work for events', () => {
      const fileName = mockHost.addCode(`
        @Component({
          selector: 'foo-component',
          template: \`
            <div (click)="han~{handleClick}"></div>
          \`,
        })
        export class FooComponent {
          handleClick() {}
        }
      `);
      const location = mockHost.getLocationMarkerFor(fileName, 'handleClick');
      const completions = ngLS.getCompletionsAtPosition(fileName, location.start)!;
      expect(completions).toBeDefined();
      const completion = completions.entries.find(entry => entry.name === 'handleClick')!;
      expect(completion).toBeDefined();
      expect(completion.kind).toBe('method');
      expect(completion.replacementSpan).toEqual({start: location.start - 3, length: 3});
    });

    it('should work for element names', () => {
      const fileName = mockHost.addCode(`
        @Component({
          selector: 'foo-component',
          template: \`
            <test-comp~{test-comp}></test-comp>
          \`,
        })
        export class FooComponent {}
      `);
      const location = mockHost.getLocationMarkerFor(fileName, 'test-comp');
      const completions = ngLS.getCompletionsAtPosition(fileName, location.start)!;
      expect(completions).toBeDefined();
      const completion = completions.entries.find(entry => entry.name === 'test-comp')!;
      expect(completion).toBeDefined();
      expect(completion.kind).toBe('component');
      expect(completion.replacementSpan).toEqual({start: location.start - 9, length: 9});
    });

    it('should work for bindings', () => {
      const fileName = mockHost.addCode(`
        @Component({
          selector: 'foo-component',
          template: \`
            <input [(ngMod~{model})] />
          \`,
        })
        export class FooComponent {}
      `);
      const location = mockHost.getLocationMarkerFor(fileName, 'model');
      const completions = ngLS.getCompletionsAtPosition(fileName, location.start)!;
      expect(completions).toBeDefined();
      const completion = completions.entries.find(entry => entry.name === 'ngModel')!;
      expect(completion).toBeDefined();
      expect(completion.kind).toBe(CompletionKind.ATTRIBUTE);
      expect(completion.replacementSpan).toEqual({start: location.start - 5, length: 5});
    });
  });

  describe('property completions for members of an indexed type', () => {
    it('should work with numeric index signatures (arrays)', () => {
      mockHost.override(TEST_TEMPLATE, `{{ heroes[0].~{heroes-number-index}}}`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'heroes-number-index');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['id', 'name']);
    });

    it('should work with numeric index signatures (tuple arrays)', () => {
      mockHost.override(TEST_TEMPLATE, `{{ tupleArray[1].~{tuple-array-number-index}}}`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'tuple-array-number-index');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.PROPERTY, ['id', 'name']);
    });

    describe('with string index signatures', () => {
      it('should work with index notation', () => {
        mockHost.override(TEST_TEMPLATE, `{{ heroesByName['Jacky'].~{heroes-string-index}}}`);
        const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'heroes-string-index');
        const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
        expectContain(completions, CompletionKind.PROPERTY, ['id', 'name']);
      });

      it('should work with dot notation', () => {
        mockHost.override(TEST_TEMPLATE, `{{ heroesByName.jacky.~{heroes-string-index}}}`);
        const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'heroes-string-index');
        const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
        expectContain(completions, CompletionKind.PROPERTY, ['id', 'name']);
      });

      it('should work with dot notation if stringIndexType is a primitive type', () => {
        mockHost.override(TEST_TEMPLATE, `{{ primitiveIndexType.test.~{string-primitive-type}}}`);
        const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'string-primitive-type');
        const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
        expectContain(completions, CompletionKind.METHOD, ['substring']);
      });
    });

    describe('with template reference variables', () => {
      it('should be able to get the completions (ref- prefix)', () => {
        mockHost.override(TEST_TEMPLATE, `<form ref-itemForm="ngF~{reference}"></form>`);
        const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'reference');
        const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start)!;
        expectContain(completions, CompletionKind.REFERENCE, ['ngForm']);
      });

      it('should be able to get the completions (# prefix)', () => {
        mockHost.override(TEST_TEMPLATE, `<form #itemForm="ngF~{reference}"></form>`);
        const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'reference');
        const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start)!;
        expectContain(completions, CompletionKind.REFERENCE, ['ngForm']);
      });
    });
  });

  it('should not expand i18n templates', () => {
    mockHost.override(TEST_TEMPLATE, `<div i18n="@@el">{{~{cursor}}}</div>`);
    const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
    expectContain(completions, CompletionKind.PROPERTY, ['title']);
  });

  describe('$event completions', () => {
    it('should suggest $event in event bindings', () => {
      mockHost.override(TEST_TEMPLATE, `<div (click)="myClick(~{cursor});"></div>`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.VARIABLE, ['$event']);
    });
  });

  describe('$event completions', () => {
    it('should suggest $event in event bindings', () => {
      mockHost.override(TEST_TEMPLATE, `<div (click)="myClick(~{cursor});"></div>`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      expectContain(completions, CompletionKind.VARIABLE, ['$event']);
    });

    it('should suggest $event completions in output bindings', () => {
      mockHost.override(TEST_TEMPLATE, `<div string-model (modelChange)="$event.~{cursor}"></div>`);
      const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
      const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      // Expect string properties
      expectContain(completions, CompletionKind.METHOD, ['charAt', 'substring']);
    });
  });

  it('should select the right signature for a pipe given exact type', () => {
    mockHost.override(TEST_TEMPLATE, '{{ ("world" | prefixPipe:"hello").~{cursor} }}');
    const m1 = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
    const c1 = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, m1.start);
    // should resolve to transform(value: string, prefix: string): string
    expectContain(c1, CompletionKind.METHOD, ['charCodeAt', 'trim']);

    mockHost.override(TEST_TEMPLATE, '{{ (456 | prefixPipe:123).~{cursor} }}');
    const m2 = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
    const c2 = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, m2.start);
    // should resolve to transform(value: number, prefix: number): number
    expectContain(c2, CompletionKind.METHOD, ['toFixed', 'toExponential']);
  });

  it('should work in the conditional operator', () => {
    mockHost.override(TEST_TEMPLATE, '{{ title ? title.~{cursor} }}');
    const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
    expectContain(completions, CompletionKind.METHOD, [
      'trim',
    ]);
  });

  it('should not return any results for unknown symbol', () => {
    mockHost.override(TEST_TEMPLATE, '{{ doesnotexist.~{cursor} }}');
    const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
    expect(completions).toBeUndefined();
  });

  it('should not provide completions for string', () => {
    mockHost.override(TEST_TEMPLATE, `<div [ngClass]="'str~{cursor}'"></div>`);
    const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
    expect(completions).toBeUndefined();
  });
});

function expectContain(
    completions: ts.CompletionInfo|undefined, kind: CompletionKind, names: string[]) {
  expect(completions).toBeDefined();
  for (const name of names) {
    expect(completions!.entries).toContain(jasmine.objectContaining({name, kind} as any));
  }
}
