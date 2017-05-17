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
      <trans-unit id="615790887472569365" datatype="html">
        <source>i18n attribute on tags</source>
        <target>attributs i18n sur les balises</target>
      </trans-unit>
      <trans-unit id="3707494640264351337" datatype="html">
        <source>nested</source>
        <target>imbriqué</target>
      </trans-unit>
      <trans-unit id="5539162898278769904" datatype="html">
        <source>nested</source>
        <target>imbriqué</target>
        <note priority="1" from="meaning">different meaning</note>
      </trans-unit>
      <trans-unit id="3780349238193953556" datatype="html">
        <source><x id="START_ITALIC_TEXT" ctype="x-i"/>with placeholders<x id="CLOSE_ITALIC_TEXT" ctype="x-i"/></source>
        <target><x id="START_ITALIC_TEXT" ctype="x-i"/>avec des espaces réservés<x id="CLOSE_ITALIC_TEXT" ctype="x-i"/></target>
      </trans-unit>
      <trans-unit id="5525133077318024839" datatype="html">
        <source>on not translatable node</source>
        <target>sur des balises non traductibles</target>
      </trans-unit>
      <trans-unit id="8670732454866344690" datatype="html">
        <source>on translatable node</source>
        <target>sur des balises traductibles</target>
      </trans-unit>
      <trans-unit id="4593805537723189714" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<x id="START_BOLD_TEXT" ctype="x-b"/>many<x id="CLOSE_BOLD_TEXT" ctype="x-b"/>} }</source>
        <target>{VAR_PLURAL, plural, =0 {zero} =1 {un} =2 {deux} other {<x id="START_BOLD_TEXT" ctype="x-b"/>beaucoup<x id="CLOSE_BOLD_TEXT" ctype="x-b"/>} }</target>
      </trans-unit>
      <trans-unit id="1746565782635215" datatype="html">
        <source>
        <x id="ICU"/>
    </source>
        <target><x id="ICU"/></target>
      </trans-unit>
      <trans-unit id="5868084092545682515" datatype="html">
        <source>{VAR_SELECT, select, m {male} f {female} }</source>
        <target>{VAR_SELECT, select, m {homme} f {femme} }</target>
      </trans-unit>
      <trans-unit id="149534432019771748" datatype="html">
        <source><x id="INTERPOLATION"/></source>
        <target><x id="INTERPOLATION"/></target>
      </trans-unit>
      <trans-unit id="8079133655095026576" datatype="html">
        <source>sex = <x id="INTERPOLATION"/></source>
        <target>sexe = <x id="INTERPOLATION"/></target>
      </trans-unit>
      <trans-unit id="5814148305629875495" datatype="html">
        <source><x id="CUSTOM_NAME"/></source>
        <target><x id="CUSTOM_NAME"/></target>
      </trans-unit>
      <trans-unit id="7685649297917455806" datatype="html">
        <source>in a translatable section</source>
        <target>dans une section traductible</target>
      </trans-unit>
      <trans-unit id="2387287228265107305" datatype="html">
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
      <trans-unit id="1491627405349178954" datatype="html">
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
      <trans-unit id="4145741808362736700" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {Found no results} =1 {Found one result} other {Found <x id="INTERPOLATION"/> results} }</source>
        <target>{VAR_PLURAL, plural, =0 {Pas de réponse} =1 {une réponse} other {Found <x id="INTERPOLATION"/> réponse} }</target>
        <note priority="1" from="description">desc</note>
      </trans-unit>
      <trans-unit id="4035252431381981115" datatype="html">
        <source>foo<x id="START_LINK" ctype="x-a"/>bar<x id="CLOSE_LINK" ctype="x-a"/></source>
        <target>FOO<x id="START_LINK" ctype="x-a"/>BAR<x id="CLOSE_LINK" ctype="x-a"/></target>
      </trans-unit>
      <trans-unit id="2041147397701197124" datatype="html">
        <source><x id="MAP NAME"/></source>
        <target><x id="MAP NAME"/></target>
      </trans-unit>`;

const XLIFF_EXTRACTED = `
      <trans-unit id="615790887472569365" datatype="html">
        <source>i18n attribute on tags</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">3</context>
        </context-group>
      </trans-unit>
      <trans-unit id="3707494640264351337" datatype="html">
        <source>nested</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">5</context>
        </context-group>
      </trans-unit>
      <trans-unit id="5539162898278769904" datatype="html">
        <source>nested</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">7</context>
        </context-group>
        <note priority="1" from="meaning">different meaning</note>
      </trans-unit>
      <trans-unit id="3780349238193953556" datatype="html">
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
      <trans-unit id="5525133077318024839" datatype="html">
        <source>on not translatable node</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">13</context>
        </context-group>
      </trans-unit>
      <trans-unit id="8670732454866344690" datatype="html">
        <source>on translatable node</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">14</context>
        </context-group>
      </trans-unit>
      <trans-unit id="4593805537723189714" datatype="html">
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
      <trans-unit id="1746565782635215" datatype="html">
        <source>
        <x id="ICU"/>
    </source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">21</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">24</context>
        </context-group>
      </trans-unit>
      <trans-unit id="5868084092545682515" datatype="html">
        <source>{VAR_SELECT, select, m {male} f {female} }</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">22</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">25</context>
        </context-group>
      </trans-unit>
      <trans-unit id="149534432019771748" datatype="html">
        <source><x id="INTERPOLATION"/></source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">28</context>
        </context-group>
      </trans-unit>
      <trans-unit id="8079133655095026576" datatype="html">
        <source>sex = <x id="INTERPOLATION"/></source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">29</context>
        </context-group>
      </trans-unit>
      <trans-unit id="5814148305629875495" datatype="html">
        <source><x id="CUSTOM_NAME"/></source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">30</context>
        </context-group>
      </trans-unit>
      <trans-unit id="7685649297917455806" datatype="html">
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
      <trans-unit id="2387287228265107305" datatype="html">
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
      <trans-unit id="1491627405349178954" datatype="html">
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
      <trans-unit id="4145741808362736700" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {Found no results} =1 {Found one result} other {Found <x id="INTERPOLATION"/> results} }</source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">45</context>
        </context-group>
        <note priority="1" from="description">desc</note>
      </trans-unit>
      <trans-unit id="4035252431381981115" datatype="html">
        <source>foo<x id="START_LINK" ctype="x-a"/>bar<x id="CLOSE_LINK" ctype="x-a"/></source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">53</context>
        </context-group>
      </trans-unit>
      <trans-unit id="2041147397701197124" datatype="html">
        <source><x id="MAP NAME"/></source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">55</context>
        </context-group>
      </trans-unit>`;
