/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {escapeRegExp} from '../../../src/util';

import {serializeNodes} from '../../../src/i18n/digest';
import {MessageBundle} from '../../../src/i18n/message_bundle';
import {Xliff} from '../../../src/i18n/serializers/xliff';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../../src/ml_parser/defaults';
import {HtmlParser} from '../../../src/ml_parser/html_parser';

const HTML = `
<p i18n-title title="translatable attribute">not translatable</p>
<p i18n>translatable element <b>with placeholders</b> {{ interpolation}}</p>
<!-- i18n -->{ count, plural, =0 {<p>test</p>}}<!-- /i18n -->
<p i18n="m|d">foo</p>
<p i18n="m|d">foo</p>
<p i18n="m|d@@i">foo</p>
<p i18n="@@bar">foo</p>
<p i18n="ph names"><br><img><div></div></p>
<p i18n="@@baz">{ count, plural, =0 { { sex, select, other {<p>deeply nested</p>}} }}</p>
<p i18n>Test: { count, plural, =0 { { sex, select, other {<p>deeply nested</p>}} } =other {a lot}}</p>
<p i18n>multi
lines</p>
<p i18n>translatable element @if (foo) {with} @else if (bar) {blocks}</p>
`;

const WRITE_XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="983775b9a51ce14b036be72d4cfd65d68d64e231" datatype="html">
        <source>translatable attribute</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">2</context>
        </context-group>
      </trans-unit>
      <trans-unit id="ec1d033f2436133c14ab038286c4f5df4697484a" datatype="html">
        <source>translatable element <x id="START_BOLD_TEXT" ctype="x-b" equiv-text="&lt;b&gt;"/>with placeholders<x id="CLOSE_BOLD_TEXT" ctype="x-b" equiv-text="&lt;/b&gt;"/> <x id="INTERPOLATION" equiv-text="{{ interpolation}}"/></source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">3</context>
        </context-group>
      </trans-unit>
      <trans-unit id="e2ccf3d131b15f54aa1fcf1314b1ca77c14bfcc2" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {<x id="START_PARAGRAPH" ctype="x-p" equiv-text="&lt;p&gt;"/>test<x id="CLOSE_PARAGRAPH" ctype="x-p" equiv-text="&lt;/p&gt;"/>} }</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">4</context>
        </context-group>
      </trans-unit>
      <trans-unit id="db3e0a6a5a96481f60aec61d98c3eecddef5ac23" datatype="html">
        <source>foo</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">5</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">6</context>
        </context-group>
        <note priority="1" from="description">d</note>
        <note priority="1" from="meaning">m</note>
      </trans-unit>
      <trans-unit id="i" datatype="html">
        <source>foo</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">7</context>
        </context-group>
        <note priority="1" from="description">d</note>
        <note priority="1" from="meaning">m</note>
      </trans-unit>
      <trans-unit id="bar" datatype="html">
        <source>foo</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">8</context>
        </context-group>
      </trans-unit>
      <trans-unit id="d7fa2d59aaedcaa5309f13028c59af8c85b8c49d" datatype="html">
        <source><x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br/&gt;"/><x id="TAG_IMG" ctype="image" equiv-text="&lt;img/&gt;"/><x id="START_TAG_DIV" ctype="x-div" equiv-text="&lt;div&gt;"/><x id="CLOSE_TAG_DIV" ctype="x-div" equiv-text="&lt;/div&gt;"/></source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">9</context>
        </context-group>
        <note priority="1" from="description">ph names</note>
      </trans-unit>
      <trans-unit id="baz" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p" equiv-text="&lt;p&gt;"/>deeply nested<x id="CLOSE_PARAGRAPH" ctype="x-p" equiv-text="&lt;/p&gt;"/>} } } }</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">10</context>
        </context-group>
      </trans-unit>
      <trans-unit id="52ffa620dcd76247a56d5331f34e73f340a43cdb" datatype="html">
        <source>Test: <x id="ICU" equiv-text="{ count, plural, =0 {...} =other {...}}"/></source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">11</context>
        </context-group>
      </trans-unit>
      <trans-unit id="1503afd0ccc20ff01d5e2266a9157b7b342ba494" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p" equiv-text="&lt;p&gt;"/>deeply nested<x id="CLOSE_PARAGRAPH" ctype="x-p" equiv-text="&lt;/p&gt;"/>} } } =other {a lot} }</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">11</context>
        </context-group>
      </trans-unit>
      <trans-unit id="fcfa109b0e152d4c217dbc02530be0bcb8123ad1" datatype="html">
        <source>multi
lines</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">12</context>
        </context-group>
      </trans-unit>
      <trans-unit id="3e17847a6823c7777ca57c7338167badca0f4d19" datatype="html">
        <source>translatable element <x id="START_BLOCK_IF" ctype="x-if" equiv-text="@if"/>with<x id="CLOSE_BLOCK_IF" ctype="x-if" equiv-text="}"/> <x id="START_BLOCK_ELSE_IF" ctype="x-else-if" equiv-text="@else if"/>blocks<x id="CLOSE_BLOCK_ELSE_IF" ctype="x-else-if" equiv-text="}"/></source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">14</context>
        </context-group>
      </trans-unit>
    </body>
  </file>
</xliff>
`;

const LOAD_XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="983775b9a51ce14b036be72d4cfd65d68d64e231" datatype="html">
        <source>translatable attribute</source>
        <target>etubirtta elbatalsnart</target>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
      <trans-unit id="ec1d033f2436133c14ab038286c4f5df4697484a" datatype="html">
        <source>translatable element <x id="START_BOLD_TEXT" ctype="b"/>with placeholders<x id="CLOSE_BOLD_TEXT" ctype="b"/> <x id="INTERPOLATION"/></source>
        <target><x id="INTERPOLATION"/> footnemele elbatalsnart <x id="START_BOLD_TEXT" ctype="x-b"/>sredlohecalp htiw<x id="CLOSE_BOLD_TEXT" ctype="x-b"/></target>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">2</context>
        </context-group>
      </trans-unit>
      <trans-unit id="e2ccf3d131b15f54aa1fcf1314b1ca77c14bfcc2" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {<x id="START_PARAGRAPH" ctype="x-p"/>test<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} }</source>
        <target>{VAR_PLURAL, plural, =0 {<x id="START_PARAGRAPH" ctype="x-p"/>TEST<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} }</target>
      </trans-unit>
      <trans-unit id="db3e0a6a5a96481f60aec61d98c3eecddef5ac23" datatype="html">
        <source>foo</source>
        <target>oof</target>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">3</context>
        </context-group>
        <note priority="1" from="description">d</note>
        <note priority="1" from="meaning">m</note>
      </trans-unit>
      <trans-unit id="i" datatype="html">
        <source>foo</source>
        <target>toto</target>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">4</context>
        </context-group>
        <note priority="1" from="description">d</note>
        <note priority="1" from="meaning">m</note>
      </trans-unit>
      <trans-unit id="bar" datatype="html">
        <source>foo</source>
        <target>tata</target>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">5</context>
        </context-group>
      </trans-unit>
      <trans-unit id="d7fa2d59aaedcaa5309f13028c59af8c85b8c49d" datatype="html">
        <source><x id="LINE_BREAK" ctype="lb"/><x id="TAG_IMG" ctype="image"/><x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/></source>
        <target><x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/><x id="TAG_IMG" ctype="image"/><x id="LINE_BREAK" ctype="lb"/></target>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">6</context>
        </context-group>
        <note priority="1" from="description">ph names</note>
      </trans-unit>
      <trans-unit id="empty target" datatype="html">
        <source><x id="LINE_BREAK" ctype="lb"/><x id="TAG_IMG" ctype="image"/><x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/></source>
        <target/>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">6</context>
        </context-group>
        <note priority="1" from="description">ph names</note>
      </trans-unit>
      <trans-unit id="baz" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>deeply nested<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} } } }</source>
        <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>profondément imbriqué<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} } } }</target>
      </trans-unit>
      <trans-unit id="52ffa620dcd76247a56d5331f34e73f340a43cdb" datatype="html">
        <source>Test: <x id="ICU" equiv-text="{ count, plural, =0 {...} =other {...}}"/></source>
        <target>Test: <x id="ICU" equiv-text="{ count, plural, =0 {...} =other {...}}"/></target>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">11</context>
        </context-group>
      </trans-unit>
      <trans-unit id="1503afd0ccc20ff01d5e2266a9157b7b342ba494" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>deeply nested<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} } } =other {a lot} }</source>
        <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>profondément imbriqué<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} } } =other {beaucoup} }</target>
      </trans-unit>
      <trans-unit id="fcfa109b0e152d4c217dbc02530be0bcb8123ad1" datatype="html">
        <source>multi
lines</source>
        <target>multi
lignes</target>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">12</context>
        </context-group>
      </trans-unit>
      <trans-unit id="3e17847a6823c7777ca57c7338167badca0f4d19" datatype="html">
        <source>translatable element <x id="START_BLOCK_IF" ctype="x-if" equiv-text="@if"/>with<x id="CLOSE_BLOCK_IF" ctype="x-if" equiv-text="}"/> <x id="START_BLOCK_ELSE_IF" ctype="x-else-if" equiv-text="@else if"/>blocks<x id="CLOSE_BLOCK_ELSE_IF" ctype="x-else-if" equiv-text="}"/></source>
        <target>élément traduisible <x id="START_BLOCK_IF" ctype="x-if" equiv-text="@if"/>avec<x id="CLOSE_BLOCK_IF" ctype="x-if" equiv-text="}"/> <x id="START_BLOCK_ELSE_IF" ctype="x-else-if" equiv-text="@else if"/>des blocs<x id="CLOSE_BLOCK_ELSE_IF" ctype="x-else-if" equiv-text="}"/></target>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">14</context>
        </context-group>
      </trans-unit>
      <trans-unit id="mrk-test">
        <source>First sentence.</source>
        <seg-source>
          <invalid-tag>Should not be parsed</invalid-tag>
        </seg-source>
        <target>Translated <mrk mtype="seg" mid="1">first sentence</mrk>.</target>
      </trans-unit>
      <trans-unit id="mrk-test2">
        <source>First sentence. Second sentence.</source>
        <seg-source>
          <invalid-tag>Should not be parsed</invalid-tag>
        </seg-source>
        <target>Translated <mrk mtype="seg" mid="1"><mrk mtype="seg" mid="2">first</mrk> sentence</mrk>.</target>
      </trans-unit>
    </body>
  </file>
</xliff>
`;

describe('XLIFF serializer', () => {
  const serializer = new Xliff();

  function toXliff(html: string, locale: string | null = null): string {
    const catalog = new MessageBundle(new HtmlParser(), [], {}, locale);
    catalog.updateFromTemplate(html, 'file.ts', DEFAULT_INTERPOLATION_CONFIG);
    return catalog.write(serializer);
  }

  function loadAsMap(xliff: string): {[id: string]: string} {
    const {i18nNodesByMsgId} = serializer.load(xliff, 'url');

    const msgMap: {[id: string]: string} = {};
    Object.keys(i18nNodesByMsgId).forEach(
      (id) => (msgMap[id] = serializeNodes(i18nNodesByMsgId[id]).join('')),
    );

    return msgMap;
  }

  describe('write', () => {
    it('should write a valid xliff file', () => {
      expect(toXliff(HTML)).toEqual(WRITE_XLIFF);
    });
    it('should write a valid xliff file with a source language', () => {
      expect(toXliff(HTML, 'fr')).toContain('file source-language="fr"');
    });
  });

  describe('load', () => {
    it('should load XLIFF files', () => {
      expect(loadAsMap(LOAD_XLIFF)).toEqual({
        '983775b9a51ce14b036be72d4cfd65d68d64e231': 'etubirtta elbatalsnart',
        'ec1d033f2436133c14ab038286c4f5df4697484a':
          '<ph name="INTERPOLATION"/> footnemele elbatalsnart <ph name="START_BOLD_TEXT"/>sredlohecalp htiw<ph name="CLOSE_BOLD_TEXT"/>',
        'e2ccf3d131b15f54aa1fcf1314b1ca77c14bfcc2':
          '{VAR_PLURAL, plural, =0 {[<ph name="START_PARAGRAPH"/>, TEST, <ph name="CLOSE_PARAGRAPH"/>]}}',
        'db3e0a6a5a96481f60aec61d98c3eecddef5ac23': 'oof',
        'i': 'toto',
        'bar': 'tata',
        'd7fa2d59aaedcaa5309f13028c59af8c85b8c49d':
          '<ph name="START_TAG_DIV"/><ph name="CLOSE_TAG_DIV"/><ph name="TAG_IMG"/><ph name="LINE_BREAK"/>',
        'empty target': '',
        'baz':
          '{VAR_PLURAL, plural, =0 {[{VAR_SELECT, select, other {[<ph name="START_PARAGRAPH"/>, profondément imbriqué, <ph name="CLOSE_PARAGRAPH"/>]}},  ]}}',
        '52ffa620dcd76247a56d5331f34e73f340a43cdb': 'Test: <ph name="ICU"/>',
        '1503afd0ccc20ff01d5e2266a9157b7b342ba494':
          '{VAR_PLURAL, plural, =0 {[{VAR_SELECT, select, other {[<ph' +
          ' name="START_PARAGRAPH"/>, profondément imbriqué, <ph name="CLOSE_PARAGRAPH"/>]}},  ]}, =other {[beaucoup]}}',
        'fcfa109b0e152d4c217dbc02530be0bcb8123ad1': `multi
lignes`,
        '3e17847a6823c7777ca57c7338167badca0f4d19':
          'élément traduisible <ph name="START_BLOCK_IF"/>avec<ph name="CLOSE_BLOCK_IF"/> <ph name="START_BLOCK_ELSE_IF"/>des blocs<ph name="CLOSE_BLOCK_ELSE_IF"/>',
        'mrk-test': 'Translated first sentence.',
        'mrk-test2': 'Translated first sentence.',
      });
    });

    it('should return the target locale', () => {
      expect(serializer.load(LOAD_XLIFF, 'url').locale).toEqual('fr');
    });

    it('should ignore alt-trans targets', () => {
      const XLIFF = `
          <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
              <body>
                <trans-unit datatype="html" approved="no" id="registration.submit">
                  <source>Continue</source>
                  <target state="translated" xml:lang="de">Weiter</target>
                  <context-group purpose="location">
                    <context context-type="sourcefile">src/app/auth/registration-form/registration-form.component.html</context>
                    <context context-type="linenumber">69</context>
                  </context-group>
                  <?sid 1110954287-0?>
                  <alt-trans origin="autoFuzzy" tool="Swordfish" match-quality="71" ts="63">
                    <source xml:lang="en">Content</source>
                    <target state="translated" xml:lang="de">Content</target>
                  </alt-trans>
              </trans-unit>
              </body>
            </file>
          </xliff>`;

      expect(loadAsMap(XLIFF)).toEqual({'registration.submit': 'Weiter'});
    });

    describe('structure errors', () => {
      it('should throw when a trans-unit has no translation', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="missingtarget">
        <source/>
      </trans-unit>
    </body>
  </file>
</xliff>`;

        expect(() => {
          loadAsMap(XLIFF);
        }).toThrowError(/Message missingtarget misses a translation/);
      });

      it('should throw when a trans-unit has no id attribute', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit datatype="html">
        <source/>
        <target/>
      </trans-unit>
    </body>
  </file>
</xliff>`;

        expect(() => {
          loadAsMap(XLIFF);
        }).toThrowError(/<trans-unit> misses the "id" attribute/);
      });

      it('should throw on duplicate trans-unit id', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="deadbeef">
        <source/>
        <target/>
      </trans-unit>
      <trans-unit id="deadbeef">
        <source/>
        <target/>
      </trans-unit>
    </body>
  </file>
</xliff>`;

        expect(() => {
          loadAsMap(XLIFF);
        }).toThrowError(/Duplicated translations for msg deadbeef/);
      });
    });

    describe('message errors', () => {
      it('should throw on unknown message tags', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="deadbeef" datatype="html">
        <source/>
        <target><b>msg should contain only ph tags</b></target>
      </trans-unit>
    </body>
  </file>
</xliff>`;

        expect(() => {
          loadAsMap(XLIFF);
        }).toThrowError(
          new RegExp(escapeRegExp(`[ERROR ->]<b>msg should contain only ph tags</b>`)),
        );
      });

      it('should throw when a placeholder misses an id attribute', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="deadbeef" datatype="html">
        <source/>
        <target><x/></target>
      </trans-unit>
    </body>
  </file>
</xliff>`;

        expect(() => {
          loadAsMap(XLIFF);
        }).toThrowError(new RegExp(escapeRegExp(`<x> misses the "id" attribute`)));
      });
    });
  });
});
