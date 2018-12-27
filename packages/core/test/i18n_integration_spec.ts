/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy, polyfillGoogGetMsg} from '@angular/private/testing';

@Component({selector: 'my-comp', template: ''})
class MyComp {
  name = 'John Doe';
  items = ['1', '2', '3'];
}

const TRANSFORMS: any = {
  'Welcome {{ name }}': 'Welcome {$interpolation}',
  'Welcome {% name %}': 'Welcome {$interpolation}',
  'Item {{ id }}': 'Item {$interpolation}'
};

const TRANSLATIONS: any = {
  'Welcome': 'Bonjour',
  'Welcome {$interpolation}': 'Bonjour {$interpolation}',
  'Item {$interpolation}': 'Article {$interpolation}',
  '\'Single quotes\' and "Double quotes"': '\'Guillemets simples\' et "Guillemets doubles"'
};

const translate = (label: string, interpolations: any[] = []): string => {
  const placeholders = interpolations.reduce((acc: any, value: any, idx: number): any => {
    acc[`interpolation${idx > 0 ? idx : ''}`] = value;
    return acc;
  }, {});
  return goog.getMsg(TRANSFORMS[label] || label, placeholders);
};

const getFixtureWithOverrides = (overrides = {}) => {
  TestBed.overrideComponent(MyComp, {set: overrides});
  const fixture = TestBed.createComponent(MyComp);
  fixture.detectChanges();
  return fixture;
};

onlyInIvy('Ivy i18n logic').fdescribe('i18n', function() {

  beforeEach(() => {
    polyfillGoogGetMsg(TRANSLATIONS);
    TestBed.configureTestingModule({declarations: [MyComp]});
  });

  describe('attributes', () => {
    it('should translate static attributes', () => {
      const title = 'Welcome';
      const template = `<div i18n-title="m|d" title="${title}"></div>`;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      expect(element.title).toBe(translate(title));
    });

    it('should support interpolation', () => {
      const title = 'Welcome {{ name }}';
      const template = `<div i18n-title="m|d" title="${title}"></div>`;
      const fixture = getFixtureWithOverrides({template});

      const element = fixture.nativeElement.firstChild;
      expect(element.title).toBe(translate(title, [fixture.componentInstance.name]));
    });

    it('should support interpolation with custom interpolation config', () => {
      const title = 'Welcome {% name %}';
      const template = `<div i18n-title="m|d" title="${title}"></div>`;
      const interpolation = ['{%', '%}'] as[string, string];
      const fixture = getFixtureWithOverrides({template, interpolation});

      const element = fixture.nativeElement.firstChild;
      expect(element.title).toBe(translate(title, [fixture.componentInstance.name]));
    });

    // FW-903: i18n attributes in nested templates throws at runtime
    xit('should correctly bind to context in nested template', () => {
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
        expect((child as any).innerHTML).toBe(`<div title="${translate(title, [i + 1])}"></div>`);
      }
    });

    describe('nested nodes', () => {
      it('should handle static content', () => {
        const content = 'Welcome';
        const template = `<div i18n>${content}</div>`;
        const fixture = getFixtureWithOverrides({template});

        const element = fixture.nativeElement.firstChild;
        expect(element).toHaveText(translate(content));
      });

      it('should support interpolation', () => {
        const content = 'Welcome {{ name }}';
        const template = `<div i18n>${content}</div>`;
        const fixture = getFixtureWithOverrides({template});

        const element = fixture.nativeElement.firstChild;
        expect(element).toHaveText(translate(content, [fixture.componentInstance.name]));
      });

      it('should support interpolation with custom interpolation config', () => {
        const content = 'Welcome {% name %}';
        const template = `<div i18n>${content}</div>`;
        const interpolation = ['{%', '%}'] as[string, string];
        const fixture = getFixtureWithOverrides({template, interpolation});

        const element = fixture.nativeElement.firstChild;
        expect(element).toHaveText(translate(content, [fixture.componentInstance.name]));
      });

      it('should properly escape quotes in content', () => {
        const content = `'Single quotes' and "Double quotes"`;
        const template = `<div i18n>${content}</div>`;
        const fixture = getFixtureWithOverrides({template});

        const element = fixture.nativeElement.firstChild;
        expect(element).toHaveText(translate(content));
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
          expect(child).toHaveText(translate(content, [i + 1]));
        }
      });

      it('should handle i18n attributes inside i18n section', () => {
        const title = 'Welcome {{ name }}';
        const template = `
          <div i18n>
            <div i18n-title="m|d" title="${title}"></div>
          </div>
        `;
        const fixture = getFixtureWithOverrides({template});

        const element = fixture.nativeElement.firstChild;
        const content = `<div title="${translate(title, [fixture.componentInstance.name])}"></div>`;
        expect(element.innerHTML).toBe(content);
      });
    });
  });
});