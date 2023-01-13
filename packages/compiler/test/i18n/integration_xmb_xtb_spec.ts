/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Xmb} from '@angular/compiler/src/i18n/serializers/xmb';
import {waitForAsync} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

import {configureCompiler, createComponent, HTML, serializeTranslations, validateHtml} from './integration_common';

// TODO(alxhub): figure out if this test is still relevant.
xdescribe('i18n XMB/XTB integration spec', () => {
  describe('(with LF line endings)', () => {
    beforeEach(waitForAsync(() => configureCompiler(XTB + LF_LINE_ENDING_XTB, 'xtb')));

    it('should extract from templates', () => {
      const serializer = new Xmb();
      const serializedXmb = serializeTranslations(HTML, serializer);

      XMB.forEach(x => {
        expect(serializedXmb).toContain(x);
      });
      expect(serializedXmb).toContain(LF_LINE_ENDING_XMB);
    });

    it('should translate templates', () => {
      const {tb, cmp, el} = createComponent(HTML);
      validateHtml(tb, cmp, el);
    });
  });

  describe('(with CRLF line endings', () => {
    beforeEach(waitForAsync(() => configureCompiler(XTB + CRLF_LINE_ENDING_XTB, 'xtb')));

    it('should extract from templates (with CRLF line endings)', () => {
      const serializer = new Xmb();
      const serializedXmb = serializeTranslations(HTML.replace(/\n/g, '\r\n'), serializer);

      XMB.forEach(x => {
        expect(serializedXmb).toContain(x);
      });
      expect(serializedXmb).toContain(CRLF_LINE_ENDING_XMB);
    });

    it('should translate templates (with CRLF line endings)', () => {
      const {tb, cmp, el} = createComponent(HTML.replace(/\n/g, '\r\n'));
      validateHtml(tb, cmp, el);
    });
  });
});


const XTB = `
<translationbundle>
  <translation id="615790887472569365">attributs i18n sur les balises</translation>
  <translation id="3707494640264351337">imbriqué</translation>
  <translation id="5539162898278769904">imbriqué</translation>
  <translation id="3780349238193953556"><ph name="START_ITALIC_TEXT"/>avec des espaces réservés<ph name="CLOSE_ITALIC_TEXT"/></translation>
  <translation id="5415448997399451992"><ph name="START_TAG_DIV"><ex>&lt;div&gt;</ex></ph>avec <ph name="START_TAG_DIV"><ex>&lt;div&gt;</ex></ph>des espaces réservés<ph name="CLOSE_TAG_DIV"><ex>&lt;/div&gt;</ex></ph> imbriqués<ph name="CLOSE_TAG_DIV"><ex>&lt;/div&gt;</ex></ph></translation>
  <translation id="5525133077318024839">sur des balises non traductibles</translation>
  <translation id="2174788525135228764">&lt;b&gt;gras&lt;/b&gt;</translation>
  <translation id="8670732454866344690">sur des balises traductibles</translation>
  <translation id="4593805537723189714">{VAR_PLURAL, plural, =0 {zero} =1 {un} =2 {deux} other {<ph name="START_BOLD_TEXT"/>beaucoup<ph name="CLOSE_BOLD_TEXT"/>}}</translation>
  <translation id="703464324060964421"><ph name="ICU"/></translation>
  <translation id="5430374139308914421">{VAR_SELECT, select, male {homme} female {femme} other {autre}}</translation>
  <translation id="1300564767229037107"><ph name="ICU"/></translation>
  <translation id="2500580913783245106">{VAR_SELECT, select, male {homme} female {femme}}</translation>
  <translation id="4851788426695310455"><ph name="INTERPOLATION"/></translation>
  <translation id="9013357158046221374">sexe = <ph name="INTERPOLATION"/></translation>
  <translation id="8324617391167353662"><ph name="CUSTOM_NAME"/></translation>
  <translation id="7685649297917455806">dans une section traductible</translation>
  <translation id="2329001734457059408">
    <ph name="START_HEADING_LEVEL1"/>Balises dans les commentaires html<ph name="CLOSE_HEADING_LEVEL1"/>
    <ph name="START_TAG_DIV"/><ph name="CLOSE_TAG_DIV"/>
    <ph name="START_TAG_DIV_1"/><ph name="ICU"/><ph name="CLOSE_TAG_DIV"></ph>
</translation>
  <translation id="1491627405349178954">ca <ph name="START_BOLD_TEXT"/>devrait<ph name="CLOSE_BOLD_TEXT"/> marcher</translation>
  <translation id="i18n16">avec un ID explicite</translation>
  <translation id="i18n17">{VAR_PLURAL, plural, =0 {zero} =1 {un} =2 {deux} other {<ph
  name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>beaucoup<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph>} }</translation>
  <translation id="4085484936881858615">{VAR_PLURAL, plural, =0 {Pas de réponse} =1 {Une réponse} other {<ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph> réponses} }</translation>
  <translation id="4035252431381981115">FOO<ph name="START_LINK"><ex>&lt;a&gt;</ex></ph>BAR<ph name="CLOSE_LINK"><ex>&lt;/a&gt;</ex></ph></translation>
  <translation id="5339604010413301604"><ph name="MAP_NAME"><ex>MAP_NAME</ex></ph></translation>
</translationbundle>`;

const LF_LINE_ENDING_XTB = ``;
const CRLF_LINE_ENDING_XTB = ``;

const XMB = [
  `<msg id="615790887472569365"><source>file.ts:3</source>i18n attribute on tags</msg>`,
  `<msg id="3707494640264351337"><source>file.ts:5</source>nested</msg>`,
  `<msg id="5539162898278769904" meaning="different meaning"><source>file.ts:7</source>nested</msg>`,
  `<msg id="3780349238193953556"><source>file.ts:9</source><source>file.ts:10</source><ph name="START_ITALIC_TEXT"><ex>&lt;i&gt;</ex>&lt;i&gt;</ph>with placeholders<ph name="CLOSE_ITALIC_TEXT"><ex>&lt;/i&gt;</ex>&lt;/i&gt;</ph></msg>`,
  `<msg id="5415448997399451992"><source>file.ts:11</source><ph name="START_TAG_DIV"><ex>&lt;div&gt;</ex>&lt;div&gt;</ph>with <ph name="START_TAG_DIV"><ex>&lt;div&gt;</ex>&lt;div&gt;</ph>nested<ph name="CLOSE_TAG_DIV"><ex>&lt;/div&gt;</ex>&lt;/div&gt;</ph> placeholders<ph name="CLOSE_TAG_DIV"><ex>&lt;/div&gt;</ex>&lt;/div&gt;</ph></msg>`,
  `<msg id="5525133077318024839"><source>file.ts:14</source>on not translatable node</msg>`,
  `<msg id="2174788525135228764"><source>file.ts:14</source>&lt;b&gt;bold&lt;/b&gt;</msg>`,
  `<msg id="8670732454866344690"><source>file.ts:15</source>on translatable node</msg>`,
  `<msg id="4593805537723189714"><source>file.ts:20</source><source>file.ts:37</source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex>&lt;b&gt;</ph>many<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex>&lt;/b&gt;</ph>} }</msg>`,
  `<msg id="703464324060964421"><source>file.ts:22,24</source>
        <ph name="ICU"><ex>{sex, select, male {...} female {...} other {...}}</ex>{sex, select, male {...} female {...} other {...}}</ph>
    </msg>`,
  `<msg id="5430374139308914421"><source>file.ts:23</source>{VAR_SELECT, select, male {m} female {f} other {other} }</msg>`,
  `<msg id="1300564767229037107"><source>file.ts:25,27</source>
        <ph name="ICU"><ex>{sexB, select, male {...} female {...}}</ex>{sexB, select, male {...} female {...}}</ph>
    </msg>`,
  `<msg id="2500580913783245106"><source>file.ts:26</source>{VAR_SELECT, select, male {m} female {f} }</msg>`,
  `<msg id="4851788426695310455"><source>file.ts:29</source><ph name="INTERPOLATION"><ex>{{ &quot;count = &quot; + count }}</ex>{{ &quot;count = &quot; + count }}</ph></msg>`,
  `<msg id="9013357158046221374"><source>file.ts:30</source>sex = <ph name="INTERPOLATION"><ex>{{ sex }}</ex>{{ sex }}</ph></msg>`,
  `<msg id="8324617391167353662"><source>file.ts:31</source><ph name="CUSTOM_NAME"><ex>{{ &quot;custom name&quot; //i18n(ph=&quot;CUSTOM_NAME&quot;) }}</ex>{{ &quot;custom name&quot; //i18n(ph=&quot;CUSTOM_NAME&quot;) }}</ph></msg>`,
  `<msg id="7685649297917455806"><source>file.ts:36</source><source>file.ts:54</source>in a translatable section</msg>`,
  `<msg id="2329001734457059408"><source>file.ts:34,38</source>
    <ph name="START_HEADING_LEVEL1"><ex>&lt;h1&gt;</ex>&lt;h1&gt;</ph>Markers in html comments<ph name="CLOSE_HEADING_LEVEL1"><ex>&lt;/h1&gt;</ex>&lt;/h1&gt;</ph>
    <ph name="START_TAG_DIV"><ex>&lt;div&gt;</ex>&lt;div&gt;</ph><ph name="CLOSE_TAG_DIV"><ex>&lt;/div&gt;</ex>&lt;/div&gt;</ph>
    <ph name="START_TAG_DIV_1"><ex>&lt;div&gt;</ex>&lt;div&gt;</ph><ph name="ICU"><ex>{count, plural, =0 {...} =1 {...} =2 {...} other {...}}</ex>{count, plural, =0 {...} =1 {...} =2 {...} other {...}}</ph><ph name="CLOSE_TAG_DIV"><ex>&lt;/div&gt;</ex>&lt;/div&gt;</ph>
</msg>`,
  `<msg id="1491627405349178954"><source>file.ts:40</source>it <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex>&lt;b&gt;</ph>should<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex>&lt;/b&gt;</ph> work</msg>`,
  `<msg id="i18n16"><source>file.ts:42</source>with an explicit ID</msg>`,
  `<msg id="i18n17"><source>file.ts:43</source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex>&lt;b&gt;</ph>many<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex>&lt;/b&gt;</ph>} }</msg>`,
  `<msg id="4085484936881858615" desc="desc"><source>file.ts:46,52</source>{VAR_PLURAL, plural, =0 {Found no results} =1 {Found one result} other {Found <ph name="INTERPOLATION"><ex>{{response.getItemsList().length}}</ex>{{response.getItemsList().length}}</ph> results} }</msg>`,
  `<msg id="4035252431381981115"><source>file.ts:54</source>foo<ph name="START_LINK"><ex>&lt;a&gt;</ex>&lt;a&gt;</ph>bar<ph name="CLOSE_LINK"><ex>&lt;/a&gt;</ex>&lt;/a&gt;</ph></msg>`,
  `<msg id="5339604010413301604"><source>file.ts:56</source><ph name="MAP_NAME"><ex>{{ &apos;test&apos; //i18n(ph=&quot;map name&quot;) }}</ex>{{ &apos;test&apos; //i18n(ph=&quot;map name&quot;) }}</ph></msg>`
];

const LF_LINE_ENDING_XMB = ``;
const CRLF_LINE_ENDING_XMB = ``;
