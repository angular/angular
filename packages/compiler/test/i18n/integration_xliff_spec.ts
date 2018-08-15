/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Xliff} from '@angular/compiler/src/i18n/serializers/xliff';
import {waitForAsync} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

import {configureCompiler, createComponent, HTML, serializeTranslations, validateHtml} from './integration_common';

describe('i18n XLIFF integration spec', () => {
  describe('(with LF line endings)', () => {
    beforeEach(
        waitForAsync(() => configureCompiler(XLIFF_TOMERGE + LF_LINE_ENDING_XLIFF_TOMERGE, 'xlf')));

    it('should extract from templates', () => {
      const serializer = new Xliff();
      const serializedXliff = serializeTranslations(HTML, serializer);

      XLIFF_EXTRACTED.forEach(x => {
        expect(serializedXliff).toContain(x);
      });
      expect(serializedXliff).toContain(LF_LINE_ENDING_XLIFF_EXTRACTED);
    });

    it('should translate templates', () => {
      const {tb, cmp, el} = createComponent(HTML);
      validateHtml(tb, cmp, el);
    });
  });

  describe('(with CRLF line endings', () => {
    beforeEach(waitForAsync(
        () => configureCompiler(XLIFF_TOMERGE + CRLF_LINE_ENDING_XLIFF_TOMERGE, 'xlf')));

    it('should extract from templates (with CRLF line endings)', () => {
      const serializer = new Xliff();
      const serializedXliff = serializeTranslations(HTML.replace(/\n/g, '\r\n'), serializer);

      XLIFF_EXTRACTED.forEach(x => {
        expect(serializedXliff).toContain(x);
      });
      expect(serializedXliff).toContain(CRLF_LINE_ENDING_XLIFF_EXTRACTED);
    });

    it('should translate templates (with CRLF line endings)', () => {
      const {tb, cmp, el} = createComponent(HTML.replace(/\n/g, '\r\n'));
      validateHtml(tb, cmp, el);
    });
  });
});

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
        <source><x id="START_ITALIC_TEXT" ctype="x-i" equiv-text="&lt;i&gt;"/>with placeholders<x id="CLOSE_ITALIC_TEXT" ctype="x-i" equiv-text="&lt;/i&gt;"/></source>
        <target><x id="START_ITALIC_TEXT" ctype="x-i"/>avec des espaces réservés<x id="CLOSE_ITALIC_TEXT" ctype="x-i"/></target>
      </trans-unit>
      <trans-unit id="651d7249d3a225037eb66f3433d98ad4a86f0a22" datatype="html">
        <source><x id="START_TAG_DIV" ctype="x-div"/>with <x id="START_TAG_DIV" ctype="x-div"/>nested<x id="CLOSE_TAG_DIV" ctype="x-div"/> placeholders<x id="CLOSE_TAG_DIV" ctype="x-div"/></source>
        <target><x id="START_TAG_DIV" ctype="x-div"/>with <x id="START_TAG_DIV" ctype="x-div"/>nested<x id="CLOSE_TAG_DIV" ctype="x-div"/> placeholders<x id="CLOSE_TAG_DIV" ctype="x-div"/></target>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">11</context>
        </context-group>
      </trans-unit>
      <trans-unit id="1fe4616cce80a57c7707bac1c97054aa8e244a67" datatype="html">
        <source>on not translatable node</source>
        <target>sur des balises non traductibles</target>
      </trans-unit>
      <trans-unit id="480aaeeea1570bc1dde6b8404e380dee11ed0759" datatype="html">
        <source>&lt;b&gt;bold&lt;/b&gt;</source>
        <target>&lt;b&gt;gras&lt;/b&gt;</target>
      </trans-unit>
      <trans-unit id="67162b5af5f15fd0eb6480c88688dafdf952b93a" datatype="html">
        <source>on translatable node</source>
        <target>sur des balises traductibles</target>
      </trans-unit>
      <trans-unit id="dc5536bb9e0e07291c185a0d306601a2ecd4813f" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<x id="START_BOLD_TEXT" ctype="x-b" equiv-text="&lt;b&gt;"/>many<x id="CLOSE_BOLD_TEXT" ctype="x-b" equiv-text="&lt;/b&gt;"/>} }</source>
        <target>{VAR_PLURAL, plural, =0 {zero} =1 {un} =2 {deux} other {<x id="START_BOLD_TEXT" ctype="x-b"/>beaucoup<x id="CLOSE_BOLD_TEXT" ctype="x-b"/>} }</target>
      </trans-unit>
      <trans-unit id="49feb201083cbd2c8bfc48a4ae11f105fb984876" datatype="html">
        <source>
        <x id="ICU" equiv-text="{sex, select, male {...} female {...}}"/>
    </source>
        <target><x id="ICU"/></target>
      </trans-unit>
      <trans-unit id="f3be30eb9a18f6e336cc3ca4dd66bbc3a35c5f97" datatype="html">
        <source>{VAR_SELECT, select, other {other} male {m} female {f} }</source>
        <target>{VAR_SELECT, select, other {autre} male {homme} female {femme}}</target>
      </trans-unit>
      <trans-unit id="cc16e9745fa0b95b2ebc2f18b47ed8e64fe5f0f9" datatype="html">
        <source>
        <x id="ICU" equiv-text="{sexB, select, m {...} f {...}}"/>
    </source>
        <target><x id="ICU"/></target>
      </trans-unit>
      <trans-unit id="4573f2edb0329d69afc2ab8c73c71e2f8b08f807" datatype="html">
        <source>{VAR_SELECT, select, male {m} female {f} }</source>
        <target>{VAR_SELECT, select, male {homme} female {femme} }</target>
      </trans-unit>
      <trans-unit id="d9879678f727b244bc7c7e20f22b63d98cb14890" datatype="html">
        <source><x id="INTERPOLATION" equiv-text="{{ &quot;count = &quot; + count }}"/></source>
        <target><x id="INTERPOLATION"/></target>
      </trans-unit>
      <trans-unit id="50dac33dc6fc0578884baac79d875785ed77c928" datatype="html">
        <source>sex = <x id="INTERPOLATION" equiv-text="{{ sex }}"/></source>
        <target>sexe = <x id="INTERPOLATION"/></target>
      </trans-unit>
      <trans-unit id="a46f833b1fe6ca49e8b97c18f4b7ea0b930c9383" datatype="html">
        <source><x id="CUSTOM_NAME" equiv-text="{{ &quot;custom name&quot; //i18n(ph=&quot;CUSTOM_NAME&quot;) }}"/></source>
        <target><x id="CUSTOM_NAME"/></target>
      </trans-unit>
      <trans-unit id="2ec983b4893bcd5b24af33bebe3ecba63868453c" datatype="html">
        <source>in a translatable section</source>
        <target>dans une section traductible</target>
      </trans-unit>
      <trans-unit id="7f6272480ea8e7ffab548da885ab8105ee2caa93" datatype="html">
        <source>
    <x id="START_HEADING_LEVEL1" ctype="x-h1" equiv-text="&lt;h1&gt;"/>Markers in html comments<x id="CLOSE_HEADING_LEVEL1" ctype="x-h1" equiv-text="&lt;/h1&gt;"/>
    <x id="START_TAG_DIV" ctype="x-div" equiv-text="&lt;div&gt;"/><x id="CLOSE_TAG_DIV" ctype="x-div" equiv-text="&lt;/div&gt;"/>
    <x id="START_TAG_DIV_1" ctype="x-div" equiv-text="&lt;div&gt;"/><x id="ICU" equiv-text="{count, plural, =0 {...} =1 {...} =2 {...} other {...}}"/><x id="CLOSE_TAG_DIV" ctype="x-div" equiv-text="&lt;/div&gt;"/>
</source>
        <target>
    <x id="START_HEADING_LEVEL1" ctype="x-h1"/>Balises dans les commentaires html<x id="CLOSE_HEADING_LEVEL1" ctype="x-h1"/>
    <x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/>
    <x id="START_TAG_DIV_1" ctype="x-div"/><x id="ICU"/><x id="CLOSE_TAG_DIV" ctype="x-div"/>
</target>
      </trans-unit>
      <trans-unit id="93a30c67d4e6c9b37aecfe2ac0f2b5d366d7b520" datatype="html">
        <source>it <x id="START_BOLD_TEXT" ctype="x-b" equiv-text="&lt;b&gt;"/>should<x id="CLOSE_BOLD_TEXT" ctype="x-b" equiv-text="&lt;/b&gt;"/> work</source>
        <target>ca <x id="START_BOLD_TEXT" ctype="x-b"/>devrait<x id="CLOSE_BOLD_TEXT" ctype="x-b"/> marcher</target>
      </trans-unit>
      <trans-unit id="i18n16" datatype="html">
        <source>with an explicit ID</source>
        <target>avec un ID explicite</target>
      </trans-unit>
      <trans-unit id="i18n17" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<x id="START_BOLD_TEXT" ctype="x-b" equiv-text="&lt;b&gt;"/>many<x id="CLOSE_BOLD_TEXT" ctype="x-b" equiv-text="&lt;/b&gt;"/>} }</source>
        <target>{VAR_PLURAL, plural, =0 {zero} =1 {un} =2 {deux} other {<x id="START_BOLD_TEXT" ctype="x-b"/>beaucoup<x id="CLOSE_BOLD_TEXT" ctype="x-b"/>} }</target>
      </trans-unit>
      <trans-unit id="296ab5eab8d370822488c152586db3a5875ee1a2" datatype="html">
        <source>foo<x id="START_LINK" ctype="x-a" equiv-text="&lt;a&gt;"/>bar<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/></source>
        <target>FOO<x id="START_LINK" ctype="x-a"/>BAR<x id="CLOSE_LINK" ctype=" x-a"/></target>
      </trans-unit>
      <trans-unit id="2e013b311caa0916478941a985887e091d8288b6" datatype="html">
        <source><x id="MAP NAME" equiv-text="{{ &apos;test&apos; //i18n(ph=&quot;map name&quot;) }}"/></source>
        <target><x id="MAP NAME"/></target>
      </trans-unit>`;

const LF_LINE_ENDING_XLIFF_TOMERGE =
    `      <trans-unit id="2370d995bdcc1e7496baa32df20654aff65c2d10" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {Found no results} =1 {Found one result} other {Found <x id="INTERPOLATION" equiv-text="{{response.getItemsList().length}}"/> results} }</source>
        <target>{VAR_PLURAL, plural, =0 {Pas de réponse} =1 {Une réponse} other {<x id="INTERPOLATION"/> réponses} }</target>
        <note priority="1" from="description">desc</note>
      </trans-unit>`;

const CRLF_LINE_ENDING_XLIFF_TOMERGE =
    `      <trans-unit id="73a09babbde7a003ece74b02acfd22057507717b" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {Found no results} =1 {Found one result} other {Found <x id="INTERPOLATION" equiv-text="{{response.getItemsList().length}}"/> results} }</source>
        <target>{VAR_PLURAL, plural, =0 {Pas de réponse} =1 {Une réponse} other {<x id="INTERPOLATION"/> réponses} }</target>
        <note priority="1" from="description">desc</note>
      </trans-unit>`;

const XLIFF_EXTRACTED: string[] = [
  `      <trans-unit id="3cb04208df1c2f62553ed48e75939cf7107f9dad" datatype="html">
        <source>i18n attribute on tags</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">3</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="52895b1221effb3f3585b689f049d2784d714952" datatype="html">
        <source>nested</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">5</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="88d5f22050a9df477ee5646153558b3a4862d47e" datatype="html">
        <source>nested</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">7</context>
        </context-group>
        <note priority="1" from="meaning">different meaning</note>
      </trans-unit>`,
  `<trans-unit id="34fec9cc62e28e8aa6ffb306fa8569ef0a8087fe" datatype="html">
        <source><x id="START_ITALIC_TEXT" ctype="x-i" equiv-text="&lt;i&gt;"/>with placeholders<x id="CLOSE_ITALIC_TEXT" ctype="x-i" equiv-text="&lt;/i&gt;"/></source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">9</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">10</context>
        </context-group>
      </trans-unit>`,
  `    <trans-unit id="651d7249d3a225037eb66f3433d98ad4a86f0a22" datatype="html">
        <source><x id="START_TAG_DIV" ctype="x-div" equiv-text="&lt;div&gt;"/>with <x id="START_TAG_DIV" ctype="x-div" equiv-text="&lt;div&gt;"/>nested<x id="CLOSE_TAG_DIV" ctype="x-div" equiv-text="&lt;/div&gt;"/> placeholders<x id="CLOSE_TAG_DIV" ctype="x-div" equiv-text="&lt;/div&gt;"/></source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">11</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="1fe4616cce80a57c7707bac1c97054aa8e244a67" datatype="html">
        <source>on not translatable node</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">14</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="480aaeeea1570bc1dde6b8404e380dee11ed0759" datatype="html">
        <source>&lt;b&gt;bold&lt;/b&gt;</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">14</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="67162b5af5f15fd0eb6480c88688dafdf952b93a" datatype="html">
        <source>on translatable node</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">15</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="dc5536bb9e0e07291c185a0d306601a2ecd4813f" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<x id="START_BOLD_TEXT" ctype="x-b" equiv-text="&lt;b&gt;"/>many<x id="CLOSE_BOLD_TEXT" ctype="x-b" equiv-text="&lt;/b&gt;"/>} }</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">20</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">37</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="49feb201083cbd2c8bfc48a4ae11f105fb984876" datatype="html">
        <source>
        <x id="ICU" equiv-text="{sex, select, male {...} female {...} other {...}}"/>
    </source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">22</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="f3be30eb9a18f6e336cc3ca4dd66bbc3a35c5f97" datatype="html">
        <source>{VAR_SELECT, select, male {m} female {f} other {other} }</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">23</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="cc16e9745fa0b95b2ebc2f18b47ed8e64fe5f0f9" datatype="html">
        <source>
        <x id="ICU" equiv-text="{sexB, select, male {...} female {...}}"/>
    </source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">25</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="4573f2edb0329d69afc2ab8c73c71e2f8b08f807" datatype="html">
        <source>{VAR_SELECT, select, male {m} female {f} }</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">26</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="d9879678f727b244bc7c7e20f22b63d98cb14890" datatype="html">
        <source><x id="INTERPOLATION" equiv-text="{{ &quot;count = &quot; + count }}"/></source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">29</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="50dac33dc6fc0578884baac79d875785ed77c928" datatype="html">
        <source>sex = <x id="INTERPOLATION" equiv-text="{{ sex }}"/></source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">30</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="a46f833b1fe6ca49e8b97c18f4b7ea0b930c9383" datatype="html">
        <source><x id="CUSTOM_NAME" equiv-text="{{ &quot;custom name&quot; //i18n(ph=&quot;CUSTOM_NAME&quot;) }}"/></source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">31</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="2ec983b4893bcd5b24af33bebe3ecba63868453c" datatype="html">
        <source>in a translatable section</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">36</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">54</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="7f6272480ea8e7ffab548da885ab8105ee2caa93" datatype="html">
        <source>
    <x id="START_HEADING_LEVEL1" ctype="x-h1" equiv-text="&lt;h1&gt;"/>Markers in html comments<x id="CLOSE_HEADING_LEVEL1" ctype="x-h1" equiv-text="&lt;/h1&gt;"/>
    <x id="START_TAG_DIV" ctype="x-div" equiv-text="&lt;div&gt;"/><x id="CLOSE_TAG_DIV" ctype="x-div" equiv-text="&lt;/div&gt;"/>
    <x id="START_TAG_DIV_1" ctype="x-div" equiv-text="&lt;div&gt;"/><x id="ICU" equiv-text="{count, plural, =0 {...} =1 {...} =2 {...} other {...}}"/><x id="CLOSE_TAG_DIV" ctype="x-div" equiv-text="&lt;/div&gt;"/>
</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">34</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="93a30c67d4e6c9b37aecfe2ac0f2b5d366d7b520" datatype="html">
        <source>it <x id="START_BOLD_TEXT" ctype="x-b" equiv-text="&lt;b&gt;"/>should<x id="CLOSE_BOLD_TEXT" ctype="x-b" equiv-text="&lt;/b&gt;"/> work</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">40</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="i18n16" datatype="html">
        <source>with an explicit ID</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">42</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="i18n17" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<x id="START_BOLD_TEXT" ctype="x-b" equiv-text="&lt;b&gt;"/>many<x id="CLOSE_BOLD_TEXT" ctype="x-b" equiv-text="&lt;/b&gt;"/>} }</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">43</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="296ab5eab8d370822488c152586db3a5875ee1a2" datatype="html">
        <source>foo<x id="START_LINK" ctype="x-a" equiv-text="&lt;a&gt;"/>bar<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/></source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">54</context>
        </context-group>
      </trans-unit>`,
  `      <trans-unit id="2e013b311caa0916478941a985887e091d8288b6" datatype="html">
        <source><x id="MAP NAME" equiv-text="{{ &apos;test&apos; //i18n(ph=&quot;map name&quot;) }}"/></source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">56</context>
        </context-group>
      </trans-unit>`
];

const LF_LINE_ENDING_XLIFF_EXTRACTED =
    `      <trans-unit id="2370d995bdcc1e7496baa32df20654aff65c2d10" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {Found no results} =1 {Found one result} other {Found <x id="INTERPOLATION" equiv-text="{{response.getItemsList().length}}"/> results} }</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">46</context>
        </context-group>
        <note priority="1" from="description">desc</note>
      </trans-unit>`;

const CRLF_LINE_ENDING_XLIFF_EXTRACTED =
    `      <trans-unit id="73a09babbde7a003ece74b02acfd22057507717b" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {Found no results} =1 {Found one result} other {Found <x id="INTERPOLATION" equiv-text="{{response.getItemsList().length}}"/> results} }</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">46</context>
        </context-group>
        <note priority="1" from="description">desc</note>
      </trans-unit>`;
