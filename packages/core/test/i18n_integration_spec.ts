/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, TemplateRef, ViewContainerRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {fixmeIvy, onlyInIvy, polyfillGoogGetMsg} from '@angular/private/testing';

@Directive({
  selector: '[tplRef]',
})
class DirectiveWithTplRef {
  constructor(public vcRef: ViewContainerRef, public tplRef: TemplateRef<{}>) {}
  ngOnInit() { this.vcRef.createEmbeddedView(this.tplRef, {}); }
}

@Component({selector: 'my-comp', template: ''})
class MyComp {
  name = 'John';
  items = ['1', '2', '3'];
  visible = true;
  age = 20;
  count = 2;
  otherLabel = 'other label';
}

const TRANSLATIONS: any = {
  'one': 'un',
  'two': 'deux',
  'more than two': 'plus que deux',
  'ten': 'dix',
  'twenty': 'vingt',
  'other': 'autres',
  'Hello': 'Bonjour',
  'Hello {$interpolation}': 'Bonjour {$interpolation}',
  'Bye': 'Au revoir',
  'Item {$interpolation}': 'Article {$interpolation}',
  '\'Single quotes\' and "Double quotes"': '\'Guillemets simples\' et "Guillemets doubles"',
  'My logo': 'Mon logo',
  '{$startTagSpan}My logo{$tagImg}{$closeTagSpan}':
      '{$startTagSpan}Mon logo{$tagImg}{$closeTagSpan}',
  '{$startTagNgTemplate} Hello {$closeTagNgTemplate}{$startTagNgContainer} Bye {$closeTagNgContainer}':
      '{$startTagNgTemplate} Bonjour {$closeTagNgTemplate}{$startTagNgContainer} Au revoir {$closeTagNgContainer}',
  '{$startTagNgTemplate}{$startTagSpan}Hello{$closeTagSpan}{$closeTagNgTemplate}{$startTagNgContainer}{$startTagSpan}Hello{$closeTagSpan}{$closeTagNgContainer}':
      '{$startTagNgTemplate}{$startTagSpan}Bonjour{$closeTagSpan}{$closeTagNgTemplate}{$startTagNgContainer}{$startTagSpan}Bonjour{$closeTagSpan}{$closeTagNgContainer}',
  '{$startTagNgTemplate}{$startTagSpan}Hello{$closeTagSpan}{$closeTagNgTemplate}{$startTagNgContainer}{$startTagSpan_1}Hello{$closeTagSpan}{$closeTagNgContainer}':
      '{$startTagNgTemplate}{$startTagSpan}Bonjour{$closeTagSpan}{$closeTagNgTemplate}{$startTagNgContainer}{$startTagSpan_1}Bonjour{$closeTagSpan}{$closeTagNgContainer}',
  '{$startTagSpan} Hello - 1 {$closeTagSpan}{$startTagSpan_1} Hello - 2 {$startTagSpan_1} Hello - 3 {$startTagSpan_1} Hello - 4 {$closeTagSpan}{$closeTagSpan}{$closeTagSpan}{$startTagSpan} Hello - 5 {$closeTagSpan}':
      '{$startTagSpan} Bonjour - 1 {$closeTagSpan}{$startTagSpan_1} Bonjour - 2 {$startTagSpan_1} Bonjour - 3 {$startTagSpan_1} Bonjour - 4 {$closeTagSpan}{$closeTagSpan}{$closeTagSpan}{$startTagSpan} Bonjour - 5 {$closeTagSpan}',
  '{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}':
      '{VAR_SELECT, select, 10 {dix} 20 {vingt} other {autres}}',
  '{VAR_SELECT, select, 1 {one} 2 {two} other {more than two}}':
      '{VAR_SELECT, select, 1 {un} 2 {deux} other {plus que deux}}',
  '{VAR_SELECT, select, 10 {10 - {$startBoldText}ten{$closeBoldText}} 20 {20 - {$startItalicText}twenty{$closeItalicText}} other {{$startTagDiv}{$startUnderlinedText}other{$closeUnderlinedText}{$closeTagDiv}}}':
      '{VAR_SELECT, select, 10 {10 - {$startBoldText}dix{$closeBoldText}} 20 {20 - {$startItalicText}vingt{$closeItalicText}} other {{$startTagDiv}{$startUnderlinedText}autres{$closeUnderlinedText}{$closeTagDiv}}}',
  '{VAR_SELECT_2, select, 10 {ten - {VAR_SELECT, select, 1 {one} 2 {two} other {more than two}}} 20 {twenty - {VAR_SELECT_1, select, 1 {one} 2 {two} other {more than two}}} other {other}}':
      '{VAR_SELECT_2, select, 10 {dix - {VAR_SELECT, select, 1 {un} 2 {deux} other {plus que deux}}} 20 {vingt - {VAR_SELECT_1, select, 1 {un} 2 {deux} other {plus que deux}}} other {autres}}'
};

const getFixtureWithOverrides = (overrides = {}) => {
  TestBed.overrideComponent(MyComp, {set: overrides});
  const fixture = TestBed.createComponent(MyComp);
  fixture.detectChanges();
  return fixture;
};

onlyInIvy('Ivy i18n logic').describe('i18n', function() {

  beforeEach(() => {
    polyfillGoogGetMsg(TRANSLATIONS);
    TestBed.configureTestingModule({declarations: [MyComp, DirectiveWithTplRef]});
  });

  describe('attributes', () => {
    it('should translate static attributes', () => {
      const title = 'Hello';
      const template = `<div i18n-title="m|d" title="${title}"></div>`;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      expect(element.title).toBe('Bonjour');
    });

    it('should support interpolation', () => {
      const title = 'Hello {{ name }}';
      const template = `<div i18n-title="m|d" title="${title}"></div>`;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      expect(element.title).toBe('Bonjour John');
    });

    it('should support interpolation with custom interpolation config', () => {
      const title = 'Hello {% name %}';
      const template = `<div i18n-title="m|d" title="${title}"></div>`;
      const interpolation = ['{%', '%}'] as[string, string];
      const fixture = getFixtureWithOverrides({template, interpolation});

      const element = fixture.nativeElement.firstChild;
      expect(element.title).toBe('Bonjour John');
    });

    it('should correctly bind to context in nested template', () => {
      const title = 'Item {{ id }}';
      const template = `
        <div *ngFor='let id of items'>
          <div i18n-title='m|d' title='${title}'></div>
        </div>
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement;
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i];
        expect((child as any).innerHTML).toBe(`<div title="Article ${i + 1}"></div>`);
      }
    });

    it('should work correctly when placed on i18n root node', () => {
      const title = 'Hello {{ name }}';
      const content = 'Hello';
      const template = `
            <div i18n i18n-title="m|d" title="${title}">${content}</div>
          `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      expect(element.title).toBe('Bonjour John');
      expect(element).toHaveText('Bonjour');
    });

    it('should add i18n attributes on self-closing tags', () => {
      const title = 'Hello {{ name }}';
      const template = `<img src="logo.png" i18n-title title="${title}">`;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      expect(element.title).toBe('Bonjour John');
    });
  });

  describe('nested nodes', () => {
    it('should handle static content', () => {
      const content = 'Hello';
      const template = `<div i18n>${content}</div>`;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      expect(element).toHaveText('Bonjour');
    });

    it('should support interpolation', () => {
      const content = 'Hello {{ name }}';
      const template = `<div i18n>${content}</div>`;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      expect(element).toHaveText('Bonjour John');
    });

    it('should support interpolation with custom interpolation config', () => {
      const content = 'Hello {% name %}';
      const template = `<div i18n>${content}</div>`;
      const interpolation = ['{%', '%}'] as[string, string];
      const fixture = getFixtureWithOverrides({template, interpolation});

      const element = fixture.nativeElement.firstChild;
      expect(element).toHaveText('Bonjour John');
    });

    it('should properly escape quotes in content', () => {
      const content = `'Single quotes' and "Double quotes"`;
      const template = `<div i18n>${content}</div>`;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      expect(element).toHaveText('\'Guillemets simples\' et "Guillemets doubles"');
    });

    it('should correctly bind to context in nested template', () => {
      const content = 'Item {{ id }}';
      const template = `
          <div *ngFor='let id of items'>
            <div i18n>${content}</div>
          </div>
        `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement;
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i];
        expect(child).toHaveText(`Article ${i + 1}`);
      }
    });

    it('should handle i18n attributes inside i18n section', () => {
      const title = 'Hello {{ name }}';
      const template = `
          <div i18n>
            <div i18n-title="m|d" title="${title}"></div>
          </div>
        `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      const content = `<div title="Bonjour John"></div>`;
      expect(element.innerHTML).toBe(content);
    });

    it('should handle i18n blocks in nested templates', () => {
      const content = 'Hello {{ name }}';
      const template = `
        <div *ngIf="visible">
          <div i18n>${content}</div>
        </div>
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      expect(element.children[0]).toHaveText('Bonjour John');
    });

    it('should ignore i18n attributes on self-closing tags', () => {
      const template = '<img src="logo.png" i18n>';
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement;
      expect(element.innerHTML).toBe(template.replace(' i18n', ''));
    });

    it('should handle i18n attribute with directives', () => {
      const content = 'Hello {{ name }}';
      const template = `
        <div *ngIf="visible" i18n>${content}</div>
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      expect(element).toHaveText('Bonjour John');
    });
  });

  describe('ng-container and ng-template support', () => {
    it('should handle single translation message within ng-container', () => {
      const content = 'Hello {{ name }}';
      const template = `
        <ng-container i18n>${content}</ng-container>
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      expect(element).toHaveText('Bonjour John');
    });

    it('should handle single translation message within ng-template', () => {
      const content = 'Hello {{ name }}';
      const template = `
        <ng-template i18n tplRef>${content}</ng-template>
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement;
      expect(element).toHaveText('Bonjour John');
    });

    it('should be able to act as child elements inside i18n block (plain text content)', () => {
      const hello = 'Hello';
      const bye = 'Bye';
      const template = `
        <div i18n>
          <ng-template tplRef>
            ${hello}
          </ng-template>
          <ng-container>
            ${bye}
          </ng-container>
        </div>
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      expect(element.textContent.replace(/\s+/g, ' ').trim()).toBe('Bonjour Au revoir');
    });

    it('should be able to act as child elements inside i18n block (text + tags)', () => {
      const content = 'Hello';
      const template = `
        <div i18n>
          <ng-template tplRef>
            <span>${content}</span>
          </ng-template>
          <ng-container>
            <span>${content}</span>
          </ng-container>
        </div>
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement;
      const spans = element.getElementsByTagName('span');
      for (let i = 0; i < spans.length; i++) {
        expect(spans[i]).toHaveText('Bonjour');
      }
    });

    it('should be able to handle deep nested levels with templates', () => {
      const content = 'Hello';
      const template = `
        <div i18n>
          <span>
            ${content} - 1
          </span>
          <span *ngIf="visible">
            ${content} - 2
            <span *ngIf="visible">
              ${content} - 3
              <span *ngIf="visible">
                ${content} - 4
              </span>
            </span>
          </span>
          <span>
            ${content} - 5
          </span>
        </div>
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement;
      const spans = element.getElementsByTagName('span');
      for (let i = 0; i < spans.length; i++) {
        expect(spans[i].innerHTML).toContain(`Bonjour - ${i + 1}`);
      }
    });

    it('should handle self-closing tags as content', () => {
      const label = 'My logo';
      const content = `${label}<img src="logo.png" title="Logo">`;
      const template = `
        <ng-container i18n>
          <span>${content}</span>
        </ng-container>
        <ng-template i18n tplRef>
          <span>${content}</span>
        </ng-template>
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement;
      const spans = element.getElementsByTagName('span');
      for (let i = 0; i < spans.length; i++) {
        const child = spans[i];
        expect(child).toHaveText('Mon logo');
      }
    });
  });

  describe('ICU logic', () => {
    it('should handle single ICUs', () => {
      const template = `
        <div i18n>{age, select, 10 {ten} 20 {twenty} other {other}}</div>
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement;
      expect(element).toHaveText('vingt');
    });

    it('should support ICU-only templates', () => {
      const template = `
        {age, select, 10 {ten} 20 {twenty} other {other}}
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement;
      expect(element).toHaveText('vingt');
    });

    it('should support ICUs generated outside of i18n blocks', () => {
      const template = `
        <div>{age, select, 10 {ten} 20 {twenty} other {other}}</div>
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement;
      expect(element).toHaveText('vingt');
    });

    it('should support interpolation', () => {
      const template = `
        <div i18n>{age, select, 10 {ten} other {{{ otherLabel }}}}</div>
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement;
      expect(element).toHaveText(fixture.componentInstance.otherLabel);
    });

    it('should support interpolation with custom interpolation config', () => {
      const template = `
        <div i18n>{age, select, 10 {ten} other {{% otherLabel %}}}</div>
      `;
      const interpolation = ['{%', '%}'] as[string, string];
      const fixture = getFixtureWithOverrides({template, interpolation});

      const element = fixture.nativeElement;
      expect(element).toHaveText(fixture.componentInstance.otherLabel);
    });

    it('should handle ICUs with HTML tags inside', () => {
      const template = `
        <div i18n>
          {age, select, 10 {10 - <b>ten</b>} 20 {20 - <i>twenty</i>} other {<div class="other"><u>other</u></div>}}
        </div>
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      const italicTags = element.getElementsByTagName('i');
      expect(italicTags.length).toBe(1);
      expect(italicTags[0].innerHTML).toBe('vingt');
    });

    it('should handle multiple ICUs in one block', () => {
      const template = `
            <div i18n>
              {age, select, 10 {ten} 20 {twenty} other {other}} - 
              {count, select, 1 {one} 2 {two} other {more than two}}
            </div>
          `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      expect(element).toHaveText('vingt - deux');
    });

    it('should handle multiple ICUs in one i18n block wrapped in HTML elements', () => {
      const template = `
            <div i18n>
              <span>
                {age, select, 10 {ten} 20 {twenty} other {other}}
              </span>
              <span>
                {count, select, 1 {one} 2 {two} other {more than two}}
              </span>
            </div>
          `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      const spans = element.getElementsByTagName('span');
      expect(spans.length).toBe(2);
      expect(spans[0]).toHaveText('vingt');
      expect(spans[1]).toHaveText('deux');
    });

    it('should handle ICUs inside a template in i18n block', () => {
      const template = `
            <div i18n>
              <span *ngIf="visible">
                {age, select, 10 {ten} 20 {twenty} other {other}}
              </span>
            </div>
          `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      const spans = element.getElementsByTagName('span');
      expect(spans.length).toBe(1);
      expect(spans[0]).toHaveText('vingt');
    });

    it('should handle nested icus', () => {
      const template = `
        <div i18n>
          {age, select,
            10 {ten - {count, select, 1 {one} 2 {two} other {more than two}}}
            20 {twenty - {count, select, 1 {one} 2 {two} other {more than two}}}
            other {other}}
        </div>
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      expect(element).toHaveText('vingt - deux');
    });

    it('should handle ICUs inside <ng-container>', () => {
      const template = `
        <ng-container i18n>
          {age, select, 10 {ten} 20 {twenty} other {other}}
        </ng-container>
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement;
      expect(element).toHaveText('vingt');
    });

    it('should handle ICUs inside <ng-template>', () => {
      const template = `
        <ng-template i18n tplRef>
          {age, select, 10 {ten} 20 {twenty} other {other}}
        </ng-template>
      `;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement;
      expect(element).toHaveText('vingt');
    });
  });
});
