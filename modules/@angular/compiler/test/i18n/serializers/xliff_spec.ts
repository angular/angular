/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {escapeRegExp} from '@angular/core/src/facade/lang';

import {serializeNodes} from '../../../src/i18n/digest';
import {MessageBundle} from '../../../src/i18n/message_bundle';
import {Xliff} from '../../../src/i18n/serializers/xliff';
import {HtmlParser} from '../../../src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../../src/ml_parser/interpolation_config';

const HTML = `
<p i18n-title title="translatable attribute">not translatable</p>
<p i18n>translatable element <b>with placeholders</b> {{ interpolation}}</p>
<p i18n="m|d">foo</p>
<p i18n="m|d@@i">foo</p>
<p i18n="@@bar">foo</p>
<p i18n="ph names"><br><img><div></div></p>
`;

const WRITE_XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="983775b9a51ce14b036be72d4cfd65d68d64e231" datatype="html">
        <source>translatable attribute</source>
        <target/>
      </trans-unit>
      <trans-unit id="ec1d033f2436133c14ab038286c4f5df4697484a" datatype="html">
        <source>translatable element <x id="START_BOLD_TEXT" ctype="x-b"/>with placeholders<x id="CLOSE_BOLD_TEXT" ctype="x-b"/> <x id="INTERPOLATION"/></source>
        <target/>
      </trans-unit>
      <trans-unit id="db3e0a6a5a96481f60aec61d98c3eecddef5ac23" datatype="html">
        <source>foo</source>
        <target/>
        <note priority="1" from="description">d</note>
        <note priority="1" from="meaning">m</note>
      </trans-unit>
      <trans-unit id="i" datatype="html">
        <source>foo</source>
        <target/>
        <note priority="1" from="description">d</note>
        <note priority="1" from="meaning">m</note>
      </trans-unit>
      <trans-unit id="bar" datatype="html">
        <source>foo</source>
        <target/>
      </trans-unit>
      <trans-unit id="d7fa2d59aaedcaa5309f13028c59af8c85b8c49d" datatype="html">
        <source><x id="LINE_BREAK" ctype="lb"/><x id="TAG_IMG" ctype="image"/><x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/></source>
        <target/>
        <note priority="1" from="description">ph names</note>
      </trans-unit>
    </body>
  </file>
</xliff>
`;

const LOAD_XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="983775b9a51ce14b036be72d4cfd65d68d64e231" datatype="html">
        <source>translatable attribute</source>
        <target>etubirtta elbatalsnart</target>
      </trans-unit>
      <trans-unit id="ec1d033f2436133c14ab038286c4f5df4697484a" datatype="html">
        <source>translatable element <x id="START_BOLD_TEXT" ctype="b"/>with placeholders<x id="CLOSE_BOLD_TEXT" ctype="b"/> <x id="INTERPOLATION"/></source>
        <target><x id="INTERPOLATION"/> footnemele elbatalsnart <x id="START_BOLD_TEXT" ctype="x-b"/>sredlohecalp htiw<x id="CLOSE_BOLD_TEXT" ctype="x-b"/></target>
      </trans-unit>
      <trans-unit id="db3e0a6a5a96481f60aec61d98c3eecddef5ac23" datatype="html">
        <source>foo</source>
        <target>oof</target>
        <note priority="1" from="description">d</note>
        <note priority="1" from="meaning">m</note>
      </trans-unit>
      <trans-unit id="i" datatype="html">
        <source>foo</source>
        <target>toto</target>
        <note priority="1" from="description">d</note>
        <note priority="1" from="meaning">m</note>
      </trans-unit>
      <trans-unit id="bar" datatype="html">
        <source>foo</source>
        <target>tata</target>
      </trans-unit>
      <trans-unit id="d7fa2d59aaedcaa5309f13028c59af8c85b8c49d" datatype="html">
        <source><x id="LINE_BREAK" ctype="lb"/><x id="TAG_IMG" ctype="image"/><x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/></source>
        <target><x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/><x id="TAG_IMG" ctype="image"/><x id="LINE_BREAK" ctype="lb"/></target>
        <note priority="1" from="description">ph names</note>
      </trans-unit>            
    </body>
  </file>
</xliff>
`;

export function main(): void {
  const serializer = new Xliff();

  function toXliff(html: string): string {
    const catalog = new MessageBundle(new HtmlParser, [], {});
    catalog.updateFromTemplate(html, '', DEFAULT_INTERPOLATION_CONFIG);
    return catalog.write(serializer);
  }

  function loadAsMap(xliff: string): {[id: string]: string} {
    const i18nNodesByMsgId = serializer.load(xliff, 'url');
    const msgMap: {[id: string]: string} = {};
    Object.keys(i18nNodesByMsgId)
        .forEach(id => msgMap[id] = serializeNodes(i18nNodesByMsgId[id]).join(''));

    return msgMap;
  }

  describe('XLIFF serializer', () => {
    describe('write', () => {
      it('should write a valid xliff file', () => { expect(toXliff(HTML)).toEqual(WRITE_XLIFF); });
    });

    describe('load', () => {
      it('should load XLIFF files', () => {
        expect(loadAsMap(LOAD_XLIFF)).toEqual({
          '983775b9a51ce14b036be72d4cfd65d68d64e231': 'etubirtta elbatalsnart',
          'ec1d033f2436133c14ab038286c4f5df4697484a':
              '<ph name="INTERPOLATION"/> footnemele elbatalsnart <ph name="START_BOLD_TEXT"/>sredlohecalp htiw<ph name="CLOSE_BOLD_TEXT"/>',
          'db3e0a6a5a96481f60aec61d98c3eecddef5ac23': 'oof',
          'i': 'toto',
          'bar': 'tata',
          'd7fa2d59aaedcaa5309f13028c59af8c85b8c49d':
              '<ph name="START_TAG_DIV"/><ph name="CLOSE_TAG_DIV"/><ph name="TAG_IMG"/><ph name="LINE_BREAK"/>',
        });
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

          expect(() => { loadAsMap(XLIFF); })
              .toThrowError(
                  new RegExp(escapeRegExp(`[ERROR ->]<b>msg should contain only ph tags</b>`)));
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
}