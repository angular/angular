/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Xliff2} from '@angular/compiler/src/i18n/serializers/xliff2';
import {waitForAsync} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

import {configureCompiler, createComponent, HTML, serializeTranslations, validateHtml} from './integration_common';

describe('i18n XLIFF integration spec', () => {
  describe('(with LF line endings)', () => {
    beforeEach(waitForAsync(
        () => configureCompiler(XLIFF2_TOMERGE + LF_LINE_ENDING_XLIFF2_TOMERGE, 'xlf2')));

    it('should extract from templates', () => {
      const serializer = new Xliff2();
      const serializedXliff2 = serializeTranslations(HTML, serializer);

      XLIFF2_EXTRACTED.forEach(x => {
        expect(serializedXliff2).toContain(x);
      });
      expect(serializedXliff2).toContain(LF_LINE_ENDING_XLIFF2_EXTRACTED);
    });

    it('should translate templates', () => {
      const {tb, cmp, el} = createComponent(HTML);
      validateHtml(tb, cmp, el);
    });
  });

  describe('(with CRLF line endings', () => {
    beforeEach(waitForAsync(
        () => configureCompiler(XLIFF2_TOMERGE + CRLF_LINE_ENDING_XLIFF2_TOMERGE, 'xlf2')));

    it('should extract from templates (with CRLF line endings)', () => {
      const serializer = new Xliff2();
      const serializedXliff = serializeTranslations(HTML.replace(/\n/g, '\r\n'), serializer);

      XLIFF2_EXTRACTED.forEach(x => {
        expect(serializedXliff).toContain(x);
      });
      expect(serializedXliff).toContain(CRLF_LINE_ENDING_XLIFF2_EXTRACTED);
    });

    it('should translate templates (with CRLF line endings)', () => {
      const {tb, cmp, el} = createComponent(HTML.replace(/\n/g, '\r\n'));
      validateHtml(tb, cmp, el);
    });
  });
});

const XLIFF2_TOMERGE = `
      <unit id="615790887472569365">
      <segment>
        <source>i18n attribute on tags</source>
        <target>attributs i18n sur les balises</target>
      </segment>
    </unit>
    <unit id="3707494640264351337">
      <segment>
        <source>nested</source>
        <target>imbriqué</target>
      </segment>
    </unit>
    <unit id="5539162898278769904">
      <segment>
        <source>nested</source>
        <target>imbriqué</target>
      </segment>
    </unit>
    <unit id="3780349238193953556">
      <segment>
        <source><pc id="0" equivStart="START_ITALIC_TEXT" equivEnd="CLOSE_ITALIC_TEXT" type="fmt" dispStart="&lt;i&gt;" dispEnd="&lt;/i&gt;">with placeholders</pc></source>
        <target><pc id="0" equivStart="START_ITALIC_TEXT" equivEnd="CLOSE_ITALIC_TEXT" type="fmt" dispStart="&lt;i&gt;" dispEnd="&lt;/i&gt;">avec des espaces réservés</pc></target>
      </segment>
    </unit>
    <unit id="5415448997399451992">
      <notes>
        <note category="location">file.ts:11</note>
      </notes>
      <segment>
        <source><pc id="0" equivStart="START_TAG_DIV" equivEnd="CLOSE_TAG_DIV" type="other" dispStart="&lt;div&gt;" dispEnd="&lt;/div&gt;">with <pc id="1" equivStart="START_TAG_DIV" equivEnd="CLOSE_TAG_DIV" type="other" dispStart="&lt;div&gt;" dispEnd="&lt;/div&gt;">nested</pc> placeholders</pc></source>
        <target><pc id="0" equivStart="START_TAG_DIV" equivEnd="CLOSE_TAG_DIV" type="other" dispStart="&lt;div&gt;" dispEnd="&lt;/div&gt;">avec <pc id="1" equivStart="START_TAG_DIV" equivEnd="CLOSE_TAG_DIV" type="other" dispStart="&lt;div&gt;" dispEnd="&lt;/div&gt;">espaces réservés</pc> imbriqués</pc></target>
      </segment>
    </unit>
    <unit id="5525133077318024839">
      <segment>
        <source>on not translatable node</source>
        <target>sur des balises non traductibles</target>
      </segment>
    </unit>
    <unit id="2174788525135228764">
      <segment>
        <source>&lt;b&gt;bold&lt;/b&gt;</source>
        <target>&lt;b&gt;gras&lt;/b&gt;</target>
      </segment>
    </unit>
    <unit id="8670732454866344690">
      <segment>
        <source>on translatable node</source>
        <target>sur des balises traductibles</target>
      </segment>
    </unit>
    <unit id="4593805537723189714">
      <segment>
        <source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">many</pc>} }</source>
        <target>{VAR_PLURAL, plural, =0 {zero} =1 {un} =2 {deux} other {<pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">beaucoup</pc>} }</target>
      </segment>
    </unit>
    <unit id="703464324060964421">
      <segment>
        <source>
        <ph id="0" equiv="ICU" disp="{sex, select, other {...} male {...} female {...}}"/>
    </source>
        <target><ph id="0" equiv="ICU" disp="{sex, select, other {...} male {...} female {...}}"/></target>
      </segment>
    </unit>
    <unit id="5430374139308914421">
      <notes>
        <note category="location">file.ts:23</note>
      </notes>
      <segment>
        <source>{VAR_SELECT, select, other {other} male {m} female {female} }</source>
        <target>{VAR_SELECT, select, other {autre} male {homme} female {femme} }</target>
      </segment>
    </unit>
    <unit id="1300564767229037107">
      <notes>
        <note category="location">file.ts:25,27</note>
      </notes>
      <segment>
        <source>
        <ph id="0" equiv="ICU" disp="{sexB, select, male {...} female {...}}"/>
    </source>
      <target><ph id="0" equiv="ICU" disp="{sexB, select, male {...} female {...}}"/></target>
      </segment>
    </unit>
    <unit id="2500580913783245106">
      <segment>
        <source>{VAR_SELECT, select, male {m} female {f} }</source>
        <target>{VAR_SELECT, select, male {homme} female {femme} }</target>
      </segment>
    </unit>
    <unit id="4851788426695310455">
      <segment>
        <source><ph id="0" equiv="INTERPOLATION" disp="{{ &quot;count = &quot; + count }}"/></source>
        <target><ph id="0" equiv="INTERPOLATION" disp="{{ &quot;count = &quot; + count }}"/></target>
      </segment>
    </unit>
    <unit id="9013357158046221374">
      <segment>
        <source>sex = <ph id="0" equiv="INTERPOLATION" disp="{{ sex }}"/></source>
        <target>sexe = <ph id="0" equiv="INTERPOLATION" disp="{{ sex }}"/></target>
      </segment>
    </unit>
    <unit id="8324617391167353662">
      <segment>
        <source><ph id="0" equiv="CUSTOM_NAME" disp="{{ &quot;custom name&quot; //i18n(ph=&quot;CUSTOM_NAME&quot;) }}"/></source>
        <target><ph id="0" equiv="CUSTOM_NAME" disp="{{ &quot;custom name&quot; //i18n(ph=&quot;CUSTOM_NAME&quot;) }}"/></target>
      </segment>
    </unit>
    <unit id="7685649297917455806">
      <segment>
        <source>in a translatable section</source>
        <target>dans une section traductible</target>
      </segment>
    </unit>
    <unit id="2329001734457059408">
      <segment>
        <source>
    <pc id="0" equivStart="START_HEADING_LEVEL1" equivEnd="CLOSE_HEADING_LEVEL1" type="other" dispStart="&lt;h1&gt;" dispEnd="&lt;/h1&gt;">Markers in html comments</pc>
    <pc id="1" equivStart="START_TAG_DIV" equivEnd="CLOSE_TAG_DIV" type="other" dispStart="&lt;div&gt;" dispEnd="&lt;/div&gt;"></pc>
    <pc id="2" equivStart="START_TAG_DIV_1" equivEnd="CLOSE_TAG_DIV" type="other" dispStart="&lt;div&gt;" dispEnd="&lt;/div&gt;"><ph id="3" equiv="ICU" disp="{count, plural, =0 {...} =1 {...} =2 {...} other {...}}"/></pc>
</source>
        <target>
    <pc id="0" equivStart="START_HEADING_LEVEL1" equivEnd="CLOSE_HEADING_LEVEL1" type="other" dispStart="&lt;h1&gt;" dispEnd="&lt;/h1&gt;">Balises dans les commentaires html</pc>
    <pc id="1" equivStart="START_TAG_DIV" equivEnd="CLOSE_TAG_DIV" type="other" dispStart="&lt;div&gt;" dispEnd="&lt;/div&gt;"></pc>
    <pc id="2" equivStart="START_TAG_DIV_1" equivEnd="CLOSE_TAG_DIV" type="other" dispStart="&lt;div&gt;" dispEnd="&lt;/div&gt;"><ph id="3" equiv="ICU" disp="{count, plural, =0 {...} =1 {...} =2 {...} other {...}}"/></pc>
</target>
      </segment>
    </unit>
    <unit id="1491627405349178954">
      <segment>
        <source>it <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">should</pc> work</source>
        <target>ca <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">devrait</pc> marcher</target>
      </segment>
    </unit>
    <unit id="i18n16">
      <segment>
        <source>with an explicit ID</source>
        <target>avec un ID explicite</target>
      </segment>
    </unit>
    <unit id="i18n17">
      <segment>
        <source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">many</pc>} }</source>
        <target>{VAR_PLURAL, plural, =0 {zero} =1 {un} =2 {deux} other {<pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">beaucoup</pc>} }</target>
      </segment>
    </unit>
    <unit id="4035252431381981115">
      <segment>
        <source>foo<pc id="0" equivStart="START_LINK" equivEnd="CLOSE_LINK" type="link" dispStart="&lt;a&gt;" dispEnd="&lt;/a&gt;">bar</pc></source>
        <target>FOO<pc id="0" equivStart="START_LINK" equivEnd="CLOSE_LINK" type="link" dispStart="&lt;a&gt;" dispEnd="&lt;/a&gt;">BAR</pc></target>
      </segment>
    </unit>
    <unit id="5339604010413301604">
      <segment>
        <source><ph id="0" equiv="MAP NAME" disp="{{ &apos;test&apos; //i18n(ph=&quot;map name&quot;) }}"/></source>
        <target><ph id="0" equiv="MAP NAME" disp="{{ &apos;test&apos; //i18n(ph=&quot;map name&quot;) }}"/></target>
      </segment>
    </unit>`;

const LF_LINE_ENDING_XLIFF2_TOMERGE = `    <unit id="4085484936881858615">
      <segment>
        <source>{VAR_PLURAL, plural, =0 {Found no results} =1 {Found one result} other {Found <ph id="0" equiv="INTERPOLATION" disp="{{response.getItemsList().length}}"/> results} }</source>
        <target>{VAR_PLURAL, plural, =0 {Pas de réponse} =1 {Une réponse} other {<ph id="0" equiv="INTERPOLATION" disp="{{response.getItemsList().length}}"/> réponses} }</target>
      </segment>
    </unit>
`;

const CRLF_LINE_ENDING_XLIFF2_TOMERGE = `    <unit id="4085484936881858615">
      <segment>
        <source>{VAR_PLURAL, plural, =0 {Found no results} =1 {Found one result} other {Found <ph id="0" equiv="INTERPOLATION" disp="{{response.getItemsList().length}}"/> results} }</source>
        <target>{VAR_PLURAL, plural, =0 {Pas de réponse} =1 {Une réponse} other {<ph id="0" equiv="INTERPOLATION" disp="{{response.getItemsList().length}}"/> réponses} }</target>
      </segment>
    </unit>
`;

const XLIFF2_EXTRACTED = [
  `    <unit id="615790887472569365">
      <notes>
        <note category="location">file.ts:3</note>
      </notes>
      <segment>
        <source>i18n attribute on tags</source>
      </segment>
    </unit>`,
  `    <unit id="3707494640264351337">
      <notes>
        <note category="location">file.ts:5</note>
      </notes>
      <segment>
        <source>nested</source>
      </segment>
    </unit>`,
  `    <unit id="5539162898278769904">
      <notes>
        <note category="meaning">different meaning</note>
        <note category="location">file.ts:7</note>
      </notes>
      <segment>
        <source>nested</source>
      </segment>
    </unit>`,
  `    <unit id="3780349238193953556">
      <notes>
        <note category="location">file.ts:9</note>
        <note category="location">file.ts:10</note>
      </notes>
      <segment>
        <source><pc id="0" equivStart="START_ITALIC_TEXT" equivEnd="CLOSE_ITALIC_TEXT" type="fmt" dispStart="&lt;i&gt;" dispEnd="&lt;/i&gt;">with placeholders</pc></source>
      </segment>
    </unit>`,
  `    <unit id="5415448997399451992">
      <notes>
        <note category="location">file.ts:11</note>
      </notes>
      <segment>
        <source><pc id="0" equivStart="START_TAG_DIV" equivEnd="CLOSE_TAG_DIV" type="other" dispStart="&lt;div&gt;" dispEnd="&lt;/div&gt;">with <pc id="1" equivStart="START_TAG_DIV" equivEnd="CLOSE_TAG_DIV" type="other" dispStart="&lt;div&gt;" dispEnd="&lt;/div&gt;">nested</pc> placeholders</pc></source>
      </segment>
    </unit>`,
  `    <unit id="5525133077318024839">
      <notes>
        <note category="location">file.ts:14</note>
      </notes>
      <segment>
        <source>on not translatable node</source>
      </segment>
    </unit>`,
  `    <unit id="2174788525135228764">
      <notes>
        <note category="location">file.ts:14</note>
      </notes>
      <segment>
        <source>&lt;b&gt;bold&lt;/b&gt;</source>
      </segment>
    </unit>`,
  `    <unit id="8670732454866344690">
      <notes>
        <note category="location">file.ts:15</note>
      </notes>
      <segment>
        <source>on translatable node</source>
      </segment>
    </unit>`,
  `    <unit id="4593805537723189714">
      <notes>
        <note category="location">file.ts:20</note>
        <note category="location">file.ts:37</note>
      </notes>
      <segment>
        <source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">many</pc>} }</source>
      </segment>
    </unit>`,
  `    <unit id="703464324060964421">
      <notes>
        <note category="location">file.ts:22,24</note>
      </notes>
      <segment>
        <source>
        <ph id="0" equiv="ICU" disp="{sex, select, male {...} female {...} other {...}}"/>
    </source>
      </segment>
    </unit>`,
  `    <unit id="5430374139308914421">
      <notes>
        <note category="location">file.ts:23</note>
      </notes>
      <segment>
        <source>{VAR_SELECT, select, male {m} female {f} other {other} }</source>
      </segment>
    </unit>`,
  `    <unit id="1300564767229037107">
      <notes>
        <note category="location">file.ts:25,27</note>
      </notes>
      <segment>
        <source>
        <ph id="0" equiv="ICU" disp="{sexB, select, male {...} female {...}}"/>
    </source>
      </segment>
    </unit>`,
  `    <unit id="2500580913783245106">
      <notes>
        <note category="location">file.ts:26</note>
      </notes>
      <segment>
        <source>{VAR_SELECT, select, male {m} female {f} }</source>
      </segment>
    </unit>`,
  `    <unit id="4851788426695310455">
      <notes>
        <note category="location">file.ts:29</note>
      </notes>
      <segment>
        <source><ph id="0" equiv="INTERPOLATION" disp="{{ &quot;count = &quot; + count }}"/></source>
      </segment>
    </unit>`,
  `    <unit id="9013357158046221374">
      <notes>
        <note category="location">file.ts:30</note>
      </notes>
      <segment>
        <source>sex = <ph id="0" equiv="INTERPOLATION" disp="{{ sex }}"/></source>
      </segment>
    </unit>`,
  `    <unit id="8324617391167353662">
      <notes>
        <note category="location">file.ts:31</note>
      </notes>
      <segment>
        <source><ph id="0" equiv="CUSTOM_NAME" disp="{{ &quot;custom name&quot; //i18n(ph=&quot;CUSTOM_NAME&quot;) }}"/></source>
      </segment>
    </unit>`,
  `    <unit id="7685649297917455806">
      <notes>
        <note category="location">file.ts:36</note>
        <note category="location">file.ts:54</note>
      </notes>
      <segment>
        <source>in a translatable section</source>
      </segment>
    </unit>`,
  `    <unit id="2329001734457059408">
      <notes>
        <note category="location">file.ts:34,38</note>
      </notes>
      <segment>
        <source>
    <pc id="0" equivStart="START_HEADING_LEVEL1" equivEnd="CLOSE_HEADING_LEVEL1" type="other" dispStart="&lt;h1&gt;" dispEnd="&lt;/h1&gt;">Markers in html comments</pc>
    <pc id="1" equivStart="START_TAG_DIV" equivEnd="CLOSE_TAG_DIV" type="other" dispStart="&lt;div&gt;" dispEnd="&lt;/div&gt;"></pc>
    <pc id="2" equivStart="START_TAG_DIV_1" equivEnd="CLOSE_TAG_DIV" type="other" dispStart="&lt;div&gt;" dispEnd="&lt;/div&gt;"><ph id="3" equiv="ICU" disp="{count, plural, =0 {...} =1 {...} =2 {...} other {...}}"/></pc>
</source>
      </segment>
    </unit>`,
  `    <unit id="1491627405349178954">
      <notes>
        <note category="location">file.ts:40</note>
      </notes>
      <segment>
        <source>it <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">should</pc> work</source>
      </segment>
    </unit>`,
  `    <unit id="i18n16">
      <notes>
        <note category="location">file.ts:42</note>
      </notes>
      <segment>
        <source>with an explicit ID</source>
      </segment>
    </unit>`,
  `    <unit id="i18n17">
      <notes>
        <note category="location">file.ts:43</note>
      </notes>
      <segment>
        <source>{VAR_PLURAL, plural, =0 {zero} =1 {one} =2 {two} other {<pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">many</pc>} }</source>
      </segment>
    </unit>`,
  `    <unit id="4035252431381981115">
      <notes>
        <note category="location">file.ts:54</note>
      </notes>
      <segment>
        <source>foo<pc id="0" equivStart="START_LINK" equivEnd="CLOSE_LINK" type="link" dispStart="&lt;a&gt;" dispEnd="&lt;/a&gt;">bar</pc></source>
      </segment>
    </unit>`,
  `    <unit id="5339604010413301604">
      <notes>
        <note category="location">file.ts:56</note>
      </notes>
      <segment>
        <source><ph id="0" equiv="MAP NAME" disp="{{ &apos;test&apos; //i18n(ph=&quot;map name&quot;) }}"/></source>
      </segment>
    </unit>`
];

const LF_LINE_ENDING_XLIFF2_EXTRACTED = `    <unit id="4085484936881858615">
      <notes>
        <note category="description">desc</note>
        <note category="location">file.ts:46,52</note>
      </notes>
      <segment>
        <source>{VAR_PLURAL, plural, =0 {Found no results} =1 {Found one result} other {Found <ph id="0" equiv="INTERPOLATION" disp="{{response.getItemsList().length}}"/> results} }</source>
      </segment>
    </unit>`;

const CRLF_LINE_ENDING_XLIFF2_EXTRACTED = `    <unit id="4085484936881858615">
      <notes>
        <note category="description">desc</note>
        <note category="location">file.ts:46,52</note>
      </notes>
      <segment>
        <source>{VAR_PLURAL, plural, =0 {Found no results} =1 {Found one result} other {Found <ph id="0" equiv="INTERPOLATION" disp="{{response.getItemsList().length}}"/> results} }</source>
      </segment>
    </unit>`;
