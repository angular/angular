/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgLocalization} from '@angular/common';
import {ResourceLoader} from '@angular/compiler';
import {MessageBundle} from '@angular/compiler/src/i18n/message_bundle';
import {Xmb} from '@angular/compiler/src/i18n/serializers/xmb';
import {HtmlParser} from '@angular/compiler/src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '@angular/compiler/src/ml_parser/interpolation_config';
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

    it('should extract from templates', () => {
      const catalog = new MessageBundle(new HtmlParser, [], {});
      const serializer = new Xmb();
      catalog.updateFromTemplate(HTML, '', DEFAULT_INTERPOLATION_CONFIG);

      expect(catalog.write(serializer)).toContain(XMB);
    });

    it('should translate templates', () => {
      const tb = TestBed.overrideTemplate(I18nComponent, HTML).createComponent(I18nComponent);
      const cmp = tb.componentInstance;
      const el = tb.debugElement;

      expectHtml(el, 'h1').toBe('<h1>attributs i18n sur les balises</h1>');
      expectHtml(el, '#i18n-1').toBe('<div id="i18n-1"><p>imbriqué</p></div>');
      expectHtml(el, '#i18n-2').toBe('<div id="i18n-2"><p>imbriqué</p></div>');
      expectHtml(el, '#i18n-3')
          .toBe('<div id="i18n-3"><p><i>avec des espaces réservés</i></p></div>');
      expectHtml(el, '#i18n-3b')
          .toBe(
              '<div id="i18n-3b"><p><i class="preserved-on-placeholders">avec des espaces réservés</i></p></div>');
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
      expect(el.query(By.css('#i18n-17')).nativeElement).toHaveText('un');
      cmp.count = 2;
      tb.detectChanges();
      expect(el.query(By.css('#i18n-7')).nativeElement).toHaveText('deux');
      expect(el.query(By.css('#i18n-14')).nativeElement).toHaveText('deux');
      expect(el.query(By.css('#i18n-17')).nativeElement).toHaveText('deux');
      cmp.count = 3;
      tb.detectChanges();
      expect(el.query(By.css('#i18n-7')).nativeElement).toHaveText('beaucoup');
      expect(el.query(By.css('#i18n-14')).nativeElement).toHaveText('beaucoup');
      expect(el.query(By.css('#i18n-17')).nativeElement).toHaveText('beaucoup');

      cmp.sex = 'm';
      cmp.sexB = 'f';
      tb.detectChanges();
      expect(el.query(By.css('#i18n-8')).nativeElement).toHaveText('homme');
      expect(el.query(By.css('#i18n-8b')).nativeElement).toHaveText('femme');
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
      expectHtml(el, '#i18n-16').toMatch(/avec un ID explicite/);
      expectHtml(el, '#i18n-18')
          .toEqual('<div id="i18n-18">FOO<a title="dans une section traductible">BAR</a></div>');
    });
  });
}

function expectHtml(el: DebugElement, cssSelector: string): any {
  return expect(stringifyElement(el.query(By.css(cssSelector)).nativeElement));
}

@Component({
  selector: 'i18n-cmp',
  template: '',
})
class I18nComponent {
  count: number;
  sex: string;
  sexB: string;
  response: any = {getItemsList: (): any[] => []};
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
  <translation id="615790887472569365">attributs i18n sur les balises</translation>
  <translation id="3707494640264351337">imbriqué</translation>
  <translation id="5539162898278769904">imbriqué</translation>
  <translation id="3780349238193953556"><ph name="START_ITALIC_TEXT"/>avec des espaces réservés<ph name="CLOSE_ITALIC_TEXT"/></translation>
  <translation id="5525133077318024839">sur des balises non traductibles</translation>
  <translation id="8670732454866344690">sur des balises traductibles</translation>
  <translation id="4593805537723189714">{VAR_PLURAL, plural, =0 {zero} =1 {un} =2 {deux} other {<ph name="START_BOLD_TEXT"/>beaucoup<ph name="CLOSE_BOLD_TEXT"/>}}</translation>
  <translation id="1746565782635215"><ph name="ICU"/></translation>
  <translation id="5868084092545682515">{VAR_SELECT, select, m {homme} f {femme}}</translation>
  <translation id="4851788426695310455"><ph name="INTERPOLATION"/></translation>
  <translation id="9013357158046221374">sexe = <ph name="INTERPOLATION"/></translation>
  <translation id="8324617391167353662"><ph name="CUSTOM_NAME"/></translation>
  <translation id="7685649297917455806">dans une section traductible</translation>
  <translation id="2387287228265107305">
    <ph name="START_HEADING_LEVEL1"/>Balises dans les commentaires html<ph name="CLOSE_HEADING_LEVEL1"/>   
    <ph name="START_TAG_DIV"/><ph name="CLOSE_TAG_DIV"/>
    <ph name="START_TAG_DIV_1"/><ph name="ICU"/><ph name="CLOSE_TAG_DIV"></ph>
</translation>
  <translation id="1491627405349178954">ca <ph name="START_BOLD_TEXT"/>devrait<ph name="CLOSE_BOLD_TEXT"/> marcher</translation>
  <translation id="i18n16">avec un ID explicite</translation>
  <translation id="i18n17">{VAR_PLURAL, plural, =0 {zero} =1 {un} =2 {deux} other {<ph 
  name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>beaucoup<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph>} }</translation>
  <translation id="4085484936881858615">{VAR_PLURAL, plural, =0 {Pas de réponse} =1 {une réponse} other {<ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph> réponse} }</translation>
  <translation id="4035252431381981115">FOO<ph name="START_LINK"><ex>&lt;a&gt;</ex></ph>BAR<ph name="CLOSE_LINK"><ex>&lt;/a&gt;</ex></ph></translation>
</translationbundle>`;

const XMB = ` <msg id="615790887472569365">i18n attribute on tags</msg>
  <msg id="3707494640264351337">nested</msg>
  <msg id="5539162898278769904" meaning="different meaning">nested</msg>
  <msg id="3780349238193953556"><ph name="START_ITALIC_TEXT"><ex>&lt;i&gt;</ex></ph>with placeholders<ph name="CLOSE_ITALIC_TEXT"><ex>&lt;/i&gt;</ex></ph></msg>
  <msg id="5525133077318024839">on not translatable node</msg>
  <msg id="8670732454866344690">on translatable node</msg>
  <msg id="4593805537723189714">{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>many<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph>} }</msg>
  <msg id="1746565782635215">
        <ph name="ICU"><ex>ICU</ex></ph>
    </msg>
  <msg id="5868084092545682515">{VAR_SELECT, select, m {male} f {female} }</msg>
  <msg id="4851788426695310455"><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></msg>
  <msg id="9013357158046221374">sex = <ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></msg>
  <msg id="8324617391167353662"><ph name="CUSTOM_NAME"><ex>CUSTOM_NAME</ex></ph></msg>
  <msg id="7685649297917455806">in a translatable section</msg>
  <msg id="2387287228265107305">
    <ph name="START_HEADING_LEVEL1"><ex>&lt;h1&gt;</ex></ph>Markers in html comments<ph name="CLOSE_HEADING_LEVEL1"><ex>&lt;/h1&gt;</ex></ph>   
    <ph name="START_TAG_DIV"><ex>&lt;div&gt;</ex></ph><ph name="CLOSE_TAG_DIV"><ex>&lt;/div&gt;</ex></ph>
    <ph name="START_TAG_DIV_1"><ex>&lt;div&gt;</ex></ph><ph name="ICU"><ex>ICU</ex></ph><ph name="CLOSE_TAG_DIV"><ex>&lt;/div&gt;</ex></ph>
</msg>
  <msg id="1491627405349178954">it <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>should<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph> work</msg>
  <msg id="i18n16">with an explicit ID</msg>
  <msg id="i18n17">{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>many<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph>} }</msg>
  <msg id="4085484936881858615" desc="desc">{VAR_PLURAL, plural, =0 {Found no results} =1 {Found one result} other {Found <ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph> results} }</msg>
  <msg id="4035252431381981115">foo<ph name="START_LINK"><ex>&lt;a&gt;</ex></ph>bar<ph name="CLOSE_LINK"><ex>&lt;/a&gt;</ex></ph></msg>`;

const HTML = `
<div>
    <h1 i18n>i18n attribute on tags</h1>
    
    <div id="i18n-1"><p i18n>nested</p></div>
    
    <div id="i18n-2"><p i18n="different meaning|">nested</p></div>
    
    <div id="i18n-3"><p i18n><i>with placeholders</i></p></div>
    <div id="i18n-3b"><p i18n><i class="preserved-on-placeholders">with placeholders</i></p></div>
    
    <div>
        <p id="i18n-4" i18n-title title="on not translatable node"></p>
        <p id="i18n-5" i18n i18n-title title="on translatable node"></p>
        <p id="i18n-6" i18n-title title></p>
    </div>
    
    <!-- no ph below because the ICU node is the only child of the div, i.e. no text nodes --> 
    <div i18n id="i18n-7">{count, plural, =0 {zero} =1 {one} =2 {two} other {<b>many</b>}}</div>
    
    <div i18n id="i18n-8">
        {sex, select, m {male} f {female}}
    </div>
    <div i18n id="i18n-8b">
        {sexB, select, m {male} f {female}}
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

<div id="i18n-16" i18n="@@i18n16">with an explicit ID</div>
<div id="i18n-17" i18n="@@i18n17">{count, plural, =0 {zero} =1 {one} =2 {two} other {<b>many</b>}}</div>

<!-- make sure that ICU messages are not treated as text nodes -->
<div i18n="desc">{
    response.getItemsList().length,
    plural,
    =0 {Found no results}
    =1 {Found one result}
    other {Found {{response.getItemsList().length}} results}
}</div>

<div i18n id="i18n-18">foo<a i18n-title title="in a translatable section">bar</a></div>
`;
