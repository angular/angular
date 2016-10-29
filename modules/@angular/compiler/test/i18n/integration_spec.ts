/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgLocalization} from '@angular/common';
import {ResourceLoader} from '@angular/compiler';
import {Component, DebugElement, TRANSLATIONS, TRANSLATIONS_FORMAT} from '@angular/core';
import {TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {stringifyElement} from '@angular/platform-browser/testing/browser_util';
import {expect} from '@angular/platform-browser/testing/matchers';

import {SpyResourceLoader} from '../spies';

export function main() {
  describe('i18n integration spec', () => {

    beforeEach(async(() => {
      TestBed.configureCompiler({
        providers: [
          {provide: ResourceLoader, useClass: SpyResourceLoader},
          {provide: NgLocalization, useClass: FrLocalization},
          {provide: TRANSLATIONS, useValue: XTB},
          {provide: TRANSLATIONS_FORMAT, useValue: 'xtb'},
        ]
      });

      TestBed.configureTestingModule({declarations: [I18nComponent]});
    }));


    it('translate templates', () => {
      const tb = TestBed.createComponent(I18nComponent);
      const cmp = tb.componentInstance;
      const el = tb.debugElement;

      expectHtml(el, 'h1').toBe('<h1>attributs i18n sur les balises</h1>');
      expectHtml(el, '#i18n-1').toBe('<div id="i18n-1"><p>imbriqué</p></div>');
      expectHtml(el, '#i18n-2').toBe('<div id="i18n-2"><p>imbriqué</p></div>');
      expectHtml(el, '#i18n-3')
          .toBe('<div id="i18n-3"><p><i>avec des espaces réservés</i></p></div>');
      expectHtml(el, '#i18n-4')
          .toBe('<p id="i18n-4" title="sur des balises non traductibles"></p>');
      expectHtml(el, '#i18n-5').toBe('<p id="i18n-5" title="sur des balises traductibles"></p>');
      expectHtml(el, '#i18n-6').toBe('<p id="i18n-6" title=""></p>');

      cmp.count = 0;
      tb.detectChanges();
      expect(el.query(By.css('#i18n-7')).nativeElement).toHaveText('zero');
      expect(el.query(By.css('#i18n-14')).nativeElement).toHaveText('zero');
      cmp.count = 1;
      tb.detectChanges();
      expect(el.query(By.css('#i18n-7')).nativeElement).toHaveText('un');
      expect(el.query(By.css('#i18n-14')).nativeElement).toHaveText('un');
      cmp.count = 2;
      tb.detectChanges();
      expect(el.query(By.css('#i18n-7')).nativeElement).toHaveText('deux');
      expect(el.query(By.css('#i18n-14')).nativeElement).toHaveText('deux');
      cmp.count = 3;
      tb.detectChanges();
      expect(el.query(By.css('#i18n-7')).nativeElement).toHaveText('beaucoup');
      expect(el.query(By.css('#i18n-14')).nativeElement).toHaveText('beaucoup');

      cmp.sex = 'm';
      tb.detectChanges();
      expect(el.query(By.css('#i18n-8')).nativeElement).toHaveText('homme');
      cmp.sex = 'f';
      tb.detectChanges();
      expect(el.query(By.css('#i18n-8')).nativeElement).toHaveText('femme');

      cmp.count = 123;
      tb.detectChanges();
      expectHtml(el, '#i18n-9').toEqual('<div id="i18n-9">count = 123</div>');

      cmp.sex = 'f';
      tb.detectChanges();
      expectHtml(el, '#i18n-10').toEqual('<div id="i18n-10">sexe = f</div>');

      expectHtml(el, '#i18n-11').toEqual('<div id="i18n-11">custom name</div>');
      expectHtml(el, '#i18n-12')
          .toEqual('<h1 id="i18n-12">Balises dans les commentaires html</h1>');
      expectHtml(el, '#i18n-13')
          .toBe('<div id="i18n-13" title="dans une section traductible"></div>');

      expectHtml(el, '#i18n-15').toMatch(/ca <b>devrait<\/b> marcher/);
    });
  });
}

function expectHtml(el: DebugElement, cssSelector: string): any {
  return expect(stringifyElement(el.query(By.css(cssSelector)).nativeElement));
}

@Component({
  selector: 'i18n-cmp',
  template: `
<div>
    <h1 i18n>i18n attribute on tags</h1>
    
    <div id="i18n-1"><p i18n>nested</p></div>
    
    <div id="i18n-2"><p i18n="different meaning|">nested</p></div>
    
    <div id="i18n-3"><p i18n><i>with placeholders</i></p></div>
    
    <div>
        <p id="i18n-4" i18n-title title="on not translatable node"></p>
        <p id="i18n-5" i18n i18n-title title="on translatable node"></p>
        <p id="i18n-6" i18n-title title></p>
    </div>
    
    <!-- no ph below because the ICU node is the only child of the div, i.e. no text nodes --> 
    <div i18n id="i18n-7">{count, plural, =0 {zero} =1 {one} =2 {two} other {<b>many</b>}}</div>
    
    <div i18n id="i18n-8">
        {sex, sex, m {male} f {female}}
    </div>
    
    <div i18n id="i18n-9">{{ "count = " + count }}</div>
    <div i18n id="i18n-10">sex = {{ sex }}</div>
    <div i18n id="i18n-11">{{ "custom name" //i18n(ph="CUSTOM_NAME") }}</div>    
</div>

<!-- i18n -->
    <h1 id="i18n-12" >Markers in html comments</h1>   
    <div id="i18n-13" i18n-title title="in a translatable section"></div>
    <div id="i18n-14">{count, plural, =0 {zero} =1 {one} =2 {two} other {<b>many</b>}}</div>
<!-- /i18n -->

<div id="i18n-15"><ng-container i18n>it <b>should</b> work</ng-container></div>
`
})
class I18nComponent {
  count: number = 0;
  sex: string = 'm';
}

class FrLocalization extends NgLocalization {
  getPluralCategory(value: number): string {
    switch (value) {
      case 0:
      case 1:
        return 'one';
      default:
        return 'other';
    }
  }
}

const XTB = `
<translationbundle>
  <translation id="7613717798286137988">attributs i18n sur les balises</translation>
  <translation id="496143996034957490">imbriqué</translation>
  <translation id="4275167479475215567">imbriqué</translation>
  <translation id="7210334813789040330"><ph name="START_ITALIC_TEXT"/>avec des espaces réservés<ph name="CLOSE_ITALIC_TEXT"/></translation>
  <translation id="4769680004784140786">sur des balises non traductibles</translation>
  <translation id="4033143013932333681">sur des balises traductibles</translation>
  <translation id="6304278477201429103">{count, plural, =0 {zero} =1 {un} =2 {deux} other {<ph name="START_BOLD_TEXT"/>beaucoup<ph name="CLOSE_BOLD_TEXT"/>}}</translation>
  <translation id="7235359853951837339"><ph name="ICU"/></translation>
  <translation id="6141976475800220872">{sex, sex, m {homme} f {femme}}</translation>
  <translation id="5917557396782931034"><ph name="INTERPOLATION"/></translation>
  <translation id="4687596778889597732">sexe = <ph name="INTERPOLATION"/></translation>
  <translation id="2505882222003102347"><ph name="CUSTOM_NAME"/></translation>
  <translation id="5340176214595489533">dans une section traductible</translation>
  <translation id="8173674801943621225">
    <ph name="START_HEADING_LEVEL1"/>Balises dans les commentaires html<ph name="CLOSE_HEADING_LEVEL1"/>   
    <ph name="START_TAG_DIV"/><ph name="CLOSE_TAG_DIV"/>
    <ph name="START_TAG_DIV_1"/><ph name="ICU"/><ph name="CLOSE_TAG_DIV"></ph>
</translation>
  <translation id="1309478472899123444">ca <ph name="START_BOLD_TEXT"/>devrait<ph name="CLOSE_BOLD_TEXT"/> marcher</translation>
</translationbundle>`;

// unused, for reference only
// can be generated from xmb_spec as follow:
// `fit('extract xmb', () => { console.log(toXmb(HTML)); });`
const XMB = `
<messagebundle>
  <msg id="7613717798286137988">i18n attribute on tags</msg>
  <msg id="496143996034957490">nested</msg>
  <msg id="4275167479475215567" meaning="different meaning">nested</msg>
  <msg id="7210334813789040330"><ph name="START_ITALIC_TEXT"><ex>&lt;i&gt;</ex></ph>with placeholders<ph name="CLOSE_ITALIC_TEXT"><ex>&lt;/i&gt;</ex></ph></msg>
  <msg id="4769680004784140786">on not translatable node</msg>
  <msg id="4033143013932333681">on translatable node</msg>
  <msg id="6304278477201429103">{count, plural, =0 {zero} =1 {one} =2 {two} other {<ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>many<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph>} }</msg>
  <msg id="7235359853951837339">
        <ph name="ICU"/>
    </msg>
  <msg id="6141976475800220872">{sex, sex, m {male} f {female} }</msg>
  <msg id="5917557396782931034"><ph name="INTERPOLATION"/></msg>
  <msg id="4687596778889597732">sex = <ph name="INTERPOLATION"/></msg>
  <msg id="2505882222003102347"><ph name="CUSTOM_NAME"/></msg>
  <msg id="5340176214595489533">in a translatable section</msg>
  <msg id="8173674801943621225">
    <ph name="START_HEADING_LEVEL1"><ex>&lt;h1&gt;</ex></ph>Markers in html comments<ph name="CLOSE_HEADING_LEVEL1"><ex>&lt;/h1&gt;</ex></ph>   
    <ph name="START_TAG_DIV"><ex>&lt;div&gt;</ex></ph><ph name="CLOSE_TAG_DIV"><ex>&lt;/div&gt;</ex></ph>
    <ph name="START_TAG_DIV_1"><ex>&lt;div&gt;</ex></ph><ph name="ICU"/><ph name="CLOSE_TAG_DIV"><ex>&lt;/div&gt;</ex></ph>
</msg>
  <msg id="1309478472899123444">it <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>should<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph> work</msg>
</messagebundle>
`;
