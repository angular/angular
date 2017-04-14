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
import {DebugElement, TRANSLATIONS, TRANSLATIONS_FORMAT} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

import {SpyResourceLoader} from '../spies';

import {FrLocalization, HTML, I18nComponent, validateHtml} from './integration_common';

export function main() {
  describe('i18n XMB/XTB integration spec', () => {

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
      catalog.updateFromTemplate(HTML, 'file.ts', DEFAULT_INTERPOLATION_CONFIG);

      expect(catalog.write(serializer)).toContain(XMB);
    });

    it('should translate templates', () => {
      const tb: ComponentFixture<I18nComponent> =
          TestBed.overrideTemplate(I18nComponent, HTML).createComponent(I18nComponent);
      const cmp: I18nComponent = tb.componentInstance;
      const el: DebugElement = tb.debugElement;

      validateHtml(tb, cmp, el);
    });
  });
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
  <translation id="5339604010413301604"><ph name="MAP_NAME"><ex>MAP_NAME</ex></ph></translation>
</translationbundle>`;

const XMB = ` <msg id="615790887472569365"><source>file.ts:3</source>i18n attribute on tags</msg>
  <msg id="3707494640264351337"><source>file.ts:5</source>nested</msg>
  <msg id="5539162898278769904" meaning="different meaning"><source>file.ts:7</source>nested</msg>
  <msg id="3780349238193953556"><source>file.ts:9</source><source>file.ts:10</source><ph name="START_ITALIC_TEXT"><ex>&lt;i&gt;</ex></ph>with placeholders<ph name="CLOSE_ITALIC_TEXT"><ex>&lt;/i&gt;</ex></ph></msg>
  <msg id="5525133077318024839"><source>file.ts:13</source>on not translatable node</msg>
  <msg id="8670732454866344690"><source>file.ts:14</source>on translatable node</msg>
  <msg id="4593805537723189714"><source>file.ts:19</source><source>file.ts:36</source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>many<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph>} }</msg>
  <msg id="1746565782635215"><source>file.ts:21,23</source><source>file.ts:24,26</source>
        <ph name="ICU"><ex>ICU</ex></ph>
    </msg>
  <msg id="5868084092545682515"><source>file.ts:22</source><source>file.ts:25</source>{VAR_SELECT, select, m {male} f {female} }</msg>
  <msg id="4851788426695310455"><source>file.ts:28</source><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></msg>
  <msg id="9013357158046221374"><source>file.ts:29</source>sex = <ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></msg>
  <msg id="8324617391167353662"><source>file.ts:30</source><ph name="CUSTOM_NAME"><ex>CUSTOM_NAME</ex></ph></msg>
  <msg id="7685649297917455806"><source>file.ts:35</source><source>file.ts:53</source>in a translatable section</msg>
  <msg id="2387287228265107305"><source>file.ts:33,37</source>
    <ph name="START_HEADING_LEVEL1"><ex>&lt;h1&gt;</ex></ph>Markers in html comments<ph name="CLOSE_HEADING_LEVEL1"><ex>&lt;/h1&gt;</ex></ph>   
    <ph name="START_TAG_DIV"><ex>&lt;div&gt;</ex></ph><ph name="CLOSE_TAG_DIV"><ex>&lt;/div&gt;</ex></ph>
    <ph name="START_TAG_DIV_1"><ex>&lt;div&gt;</ex></ph><ph name="ICU"><ex>ICU</ex></ph><ph name="CLOSE_TAG_DIV"><ex>&lt;/div&gt;</ex></ph>
</msg>
  <msg id="1491627405349178954"><source>file.ts:39</source>it <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>should<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph> work</msg>
  <msg id="i18n16"><source>file.ts:41</source>with an explicit ID</msg>
  <msg id="i18n17"><source>file.ts:42</source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>many<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph>} }</msg>
  <msg id="4085484936881858615" desc="desc"><source>file.ts:45,51</source>{VAR_PLURAL, plural, =0 {Found no results} =1 {Found one result} other {Found <ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph> results} }</msg>
  <msg id="4035252431381981115"><source>file.ts:53</source>foo<ph name="START_LINK"><ex>&lt;a&gt;</ex></ph>bar<ph name="CLOSE_LINK"><ex>&lt;/a&gt;</ex></ph></msg>
  <msg id="5339604010413301604"><source>file.ts:55</source><ph name="MAP_NAME"><ex>MAP_NAME</ex></ph></msg>`;
