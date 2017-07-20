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
import {Xliff} from '@angular/compiler/src/i18n/serializers/xliff';
import {HtmlParser} from '@angular/compiler/src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '@angular/compiler/src/ml_parser/interpolation_config';
import {DebugElement, TRANSLATIONS, TRANSLATIONS_FORMAT} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

import {SpyResourceLoader} from '../spies';

import {FrLocalization, HTML, I18nComponent, validateHtml} from './integration_common';

export function main() {
  describe('i18n XLIFF integration spec', () => {

    beforeEach(async(() => {
      TestBed.configureCompiler({
        providers: [
          {provide: ResourceLoader, useClass: SpyResourceLoader},
          {provide: NgLocalization, useClass: FrLocalization},
          {provide: TRANSLATIONS, useValue: XLIFF_TOMERGE},
          {provide: TRANSLATIONS_FORMAT, useValue: 'xliff'},
        ]
      });

      TestBed.configureTestingModule({declarations: [I18nComponent]});
    }));

    it('should extract from templates', () => {
      const catalog = new MessageBundle(new HtmlParser, [], {});
      const serializer = new Xliff();
      catalog.updateFromTemplate(HTML, 'file.ts', DEFAULT_INTERPOLATION_CONFIG);

      expect(catalog.write(serializer)).toContain(XLIFF_EXTRACTED);
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

const XLIFF_TOMERGE = `
      <trans-unit id="3cb04208df1c2f62553ed48e75939cf7107f9dad" datatype="html">
        <source>i18n attribute on tags</source>
        <target>attributs i18n sur les balises</target>
      </trans-unit>
      <trans-unit id="52895b1221effb3f3585b689f049d2784d714952" datatype="html">
        <source>nested</source>
        <target>imbriqué</target>
      </trans-unit>
      <trans-unit id="88d5f22050a9df477ee5646153558b3a4862d47e" datatype="html">
        <source>nested</source>
        <target>imbriqué</target>
        <note priority="1" from="meaning">different meaning</note>
      </trans-unit>
      <trans-unit id="34fec9cc62e28e8aa6ffb306fa8569ef0a8087fe" datatype="html">
        <source><x id="START_ITALIC_TEXT" ctype="x-i"/>with placeholders<x id="CLOSE_ITALIC_TEXT" ctype="x-i"/></source>
        <target><x id="START_ITALIC_TEXT" ctype="x-i"/>avec des espaces réservés<x id="CLOSE_ITALIC_TEXT" ctype="x-i"/></target>
      </trans-unit>
      <trans-unit id="1fe4616cce80a57c7707bac1c97054aa8e244a67" datatype="html">
        <source>on not translatable node</source>
        <target>sur des balises non traductibles</target>
      </trans-unit>
      <trans-unit id="67162b5af5f15fd0eb6480c88688dafdf952b93a" datatype="html">
        <source>on translatable node</source>
        <target>sur des balises traductibles</target>
      </trans-unit>
      <trans-unit id="dc5536bb9e0e07291c185a0d306601a2ecd4813f" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<x id="START_BOLD_TEXT" ctype="x-b"/>many<x id="CLOSE_BOLD_TEXT" ctype="x-b"/>} }</source>
        <target>{VAR_PLURAL, plural, =0 {zero} =1 {un} =2 {deux} other {<x id="START_BOLD_TEXT" ctype="x-b"/>beaucoup<x id="CLOSE_BOLD_TEXT" ctype="x-b"/>} }</target>
      </trans-unit>
      <trans-unit id="85ef51de59fe5a8d13fba977b6689f164420c8ca" datatype="html">
        <source>
        <x id="ICU"/>
    </source>
        <target><x id="ICU"/></target>
      </trans-unit>
      <trans-unit id="c0ca5e58fe954d528bbfa516007a5a11690a7e99" datatype="html">
        <source>{VAR_SELECT, select, m {male} f {female} }</source>
        <target>{VAR_SELECT, select, m {homme} f {femme} }</target>
      </trans-unit>
      <trans-unit id="078b7089573c5f66a2f78dce0adaa55e6715beb1" datatype="html">
        <source>
        <x id="ICU"/>
    </source>
        <target><x id="ICU"/></target>
      </trans-unit>
      <trans-unit id="a25cf2e21a299f30be1392e731163825233edc61" datatype="html">
        <source>{VAR_SELECT, select, m {male} f {female} }</source>
        <target>{VAR_SELECT, select, m {homme} f {femme} }</target>
      </trans-unit>
      <trans-unit id="d9879678f727b244bc7c7e20f22b63d98cb14890" datatype="html">
        <source><x id="INTERPOLATION"/></source>
        <target><x id="INTERPOLATION"/></target>
      </trans-unit>
      <trans-unit id="50dac33dc6fc0578884baac79d875785ed77c928" datatype="html">
        <source>sex = <x id="INTERPOLATION"/></source>
        <target>sexe = <x id="INTERPOLATION"/></target>
      </trans-unit>
      <trans-unit id="a46f833b1fe6ca49e8b97c18f4b7ea0b930c9383" datatype="html">
        <source><x id="CUSTOM_NAME"/></source>
        <target><x id="CUSTOM_NAME"/></target>
      </trans-unit>
      <trans-unit id="2ec983b4893bcd5b24af33bebe3ecba63868453c" datatype="html">
        <source>in a translatable section</source>
        <target>dans une section traductible</target>
      </trans-unit>
      <trans-unit id="eee74a5be8a75881a4785905bd8302a71f7d9f75" datatype="html">
        <source>
    <x id="START_HEADING_LEVEL1" ctype="x-h1"/>Markers in html comments<x id="CLOSE_HEADING_LEVEL1" ctype="x-h1"/>   
    <x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/>
    <x id="START_TAG_DIV_1" ctype="x-div"/><x id="ICU"/><x id="CLOSE_TAG_DIV" ctype="x-div"/>
</source>
        <target>
    <x id="START_HEADING_LEVEL1" ctype="x-h1"/>Balises dans les commentaires html<x id="CLOSE_HEADING_LEVEL1" ctype="x-h1"/>   
    <x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/>
    <x id="START_TAG_DIV_1" ctype="x-div"/><x id="ICU"/><x id="CLOSE_TAG_DIV" ctype="x-div"/>
</target>
      </trans-unit>
      <trans-unit id="93a30c67d4e6c9b37aecfe2ac0f2b5d366d7b520" datatype="html">
        <source>it <x id="START_BOLD_TEXT" ctype="x-b"/>should<x id="CLOSE_BOLD_TEXT" ctype="x-b"/> work</source>
        <target>ca <x id="START_BOLD_TEXT" ctype="x-b"/>devrait<x id="CLOSE_BOLD_TEXT" ctype="x-b"/> marcher</target>
      </trans-unit>
      <trans-unit id="i18n16" datatype="html">
        <source>with an explicit ID</source>
        <target>avec un ID explicite</target>
      </trans-unit>
      <trans-unit id="i18n17" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<x id="START_BOLD_TEXT" ctype="x-b"/>many<x id="CLOSE_BOLD_TEXT" ctype="x-b"/>} }</source>
        <target>{VAR_PLURAL, plural, =0 {zero} =1 {un} =2 {deux} other {<x id="START_BOLD_TEXT" ctype="x-b"/>beaucoup<x id="CLOSE_BOLD_TEXT" ctype="x-b"/>} }</target>
      </trans-unit>
      <trans-unit id="2370d995bdcc1e7496baa32df20654aff65c2d10" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {Found no results} =1 {Found one result} other {Found <x id="INTERPOLATION"/> results} }</source>
        <target>{VAR_PLURAL, plural, =0 {Pas de réponse} =1 {une réponse} other {Found <x id="INTERPOLATION"/> réponse} }</target>
        <note priority="1" from="description">desc</note>
      </trans-unit>
      <trans-unit id="296ab5eab8d370822488c152586db3a5875ee1a2" datatype="html">
        <source>foo<x id="START_LINK" ctype="x-a"/>bar<x id="CLOSE_LINK" ctype="x-a"/></source>
        <target>FOO<x id="START_LINK" ctype="x-a"/>BAR<x id="CLOSE_LINK" ctype="x-a"/></target>
      </trans-unit>
      <trans-unit id="2e013b311caa0916478941a985887e091d8288b6" datatype="html">
        <source><x id="MAP NAME"/></source>
        <target><x id="MAP NAME"/></target>
      </trans-unit>`;

const XLIFF_EXTRACTED = `
      <trans-unit id="3cb04208df1c2f62553ed48e75939cf7107f9dad" datatype="html">
        <source>i18n attribute on tags</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">3</context>
        </context-group>
      </trans-unit>
      <trans-unit id="52895b1221effb3f3585b689f049d2784d714952" datatype="html">
        <source>nested</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">5</context>
        </context-group>
      </trans-unit>
      <trans-unit id="88d5f22050a9df477ee5646153558b3a4862d47e" datatype="html">
        <source>nested</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">7</context>
        </context-group>
        <note priority="1" from="meaning">different meaning</note>
      </trans-unit>
      <trans-unit id="34fec9cc62e28e8aa6ffb306fa8569ef0a8087fe" datatype="html">
        <source><x id="START_ITALIC_TEXT" ctype="x-i"/>with placeholders<x id="CLOSE_ITALIC_TEXT" ctype="x-i"/></source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">9</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">10</context>
        </context-group>
      </trans-unit>
      <trans-unit id="1fe4616cce80a57c7707bac1c97054aa8e244a67" datatype="html">
        <source>on not translatable node</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">13</context>
        </context-group>
      </trans-unit>
      <trans-unit id="67162b5af5f15fd0eb6480c88688dafdf952b93a" datatype="html">
        <source>on translatable node</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">14</context>
        </context-group>
      </trans-unit>
      <trans-unit id="dc5536bb9e0e07291c185a0d306601a2ecd4813f" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<x id="START_BOLD_TEXT" ctype="x-b"/>many<x id="CLOSE_BOLD_TEXT" ctype="x-b"/>} }</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">19</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">36</context>
        </context-group>
      </trans-unit>
      <trans-unit id="85ef51de59fe5a8d13fba977b6689f164420c8ca" datatype="html">
        <source>
        <x id="ICU"/>
    </source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">21</context>
        </context-group>
      </trans-unit>
      <trans-unit id="c0ca5e58fe954d528bbfa516007a5a11690a7e99" datatype="html">
        <source>{VAR_SELECT, select, m {male} f {female} }</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">22</context>
        </context-group>
      </trans-unit>
      <trans-unit id="078b7089573c5f66a2f78dce0adaa55e6715beb1" datatype="html">
        <source>
        <x id="ICU"/>
    </source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">24</context>
        </context-group>
      </trans-unit>
      <trans-unit id="a25cf2e21a299f30be1392e731163825233edc61" datatype="html">
        <source>{VAR_SELECT, select, m {male} f {female} }</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">25</context>
        </context-group>
      </trans-unit>
      <trans-unit id="d9879678f727b244bc7c7e20f22b63d98cb14890" datatype="html">
        <source><x id="INTERPOLATION"/></source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">28</context>
        </context-group>
      </trans-unit>
      <trans-unit id="50dac33dc6fc0578884baac79d875785ed77c928" datatype="html">
        <source>sex = <x id="INTERPOLATION"/></source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">29</context>
        </context-group>
      </trans-unit>
      <trans-unit id="a46f833b1fe6ca49e8b97c18f4b7ea0b930c9383" datatype="html">
        <source><x id="CUSTOM_NAME"/></source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">30</context>
        </context-group>
      </trans-unit>
      <trans-unit id="2ec983b4893bcd5b24af33bebe3ecba63868453c" datatype="html">
        <source>in a translatable section</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">35</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">53</context>
        </context-group>
      </trans-unit>
      <trans-unit id="eee74a5be8a75881a4785905bd8302a71f7d9f75" datatype="html">
        <source>
    <x id="START_HEADING_LEVEL1" ctype="x-h1"/>Markers in html comments<x id="CLOSE_HEADING_LEVEL1" ctype="x-h1"/>   
    <x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/>
    <x id="START_TAG_DIV_1" ctype="x-div"/><x id="ICU"/><x id="CLOSE_TAG_DIV" ctype="x-div"/>
</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">33</context>
        </context-group>
      </trans-unit>
      <trans-unit id="93a30c67d4e6c9b37aecfe2ac0f2b5d366d7b520" datatype="html">
        <source>it <x id="START_BOLD_TEXT" ctype="x-b"/>should<x id="CLOSE_BOLD_TEXT" ctype="x-b"/> work</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">39</context>
        </context-group>
      </trans-unit>
      <trans-unit id="i18n16" datatype="html">
        <source>with an explicit ID</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">41</context>
        </context-group>
      </trans-unit>
      <trans-unit id="i18n17" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<x id="START_BOLD_TEXT" ctype="x-b"/>many<x id="CLOSE_BOLD_TEXT" ctype="x-b"/>} }</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">42</context>
        </context-group>
      </trans-unit>
      <trans-unit id="2370d995bdcc1e7496baa32df20654aff65c2d10" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {Found no results} =1 {Found one result} other {Found <x id="INTERPOLATION"/> results} }</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">45</context>
        </context-group>
        <note priority="1" from="description">desc</note>
      </trans-unit>
      <trans-unit id="296ab5eab8d370822488c152586db3a5875ee1a2" datatype="html">
        <source>foo<x id="START_LINK" ctype="x-a"/>bar<x id="CLOSE_LINK" ctype="x-a"/></source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">53</context>
        </context-group>
      </trans-unit>
      <trans-unit id="2e013b311caa0916478941a985887e091d8288b6" datatype="html">
        <source><x id="MAP NAME"/></source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">55</context>
        </context-group>
      </trans-unit>`;
