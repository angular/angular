/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Xliff} from '@angular/compiler/src/i18n/serializers/xliff';
import {beforeEach, describe, expect, it} from '@angular/core/testing/testing_internal';
import {MessageBundle} from '../../../src/i18n/message_bundle';
import {HtmlParser} from '../../../src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../../src/ml_parser/interpolation_config';
import {serializeNodes} from '../../ml_parser/ast_serializer_spec';

const HTML = `
<p i18n-title title="translatable attribute">not translatable</p>
<p i18n>translatable element <b>with placeholders</b> {{ interpolation}}</p>
<p i18n="m|d">foo</p>
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
  let serializer: Xliff;
  let htmlParser: HtmlParser;

  function toXliff(html: string): string {
    let catalog = new MessageBundle(new HtmlParser, [], {});
    catalog.updateFromTemplate(html, '', DEFAULT_INTERPOLATION_CONFIG);
    return catalog.write(serializer);
  }

  function loadAsText(template: string, xliff: string): {[id: string]: string} {
    let messageBundle = new MessageBundle(htmlParser, [], {});
    messageBundle.updateFromTemplate(template, 'url', DEFAULT_INTERPOLATION_CONFIG);

    const asAst = serializer.load(xliff, 'url', messageBundle);
    let asText: {[id: string]: string} = {};
    Object.keys(asAst).forEach(id => { asText[id] = serializeNodes(asAst[id]).join(''); });

    return asText;
  }

  describe('XLIFF serializer', () => {

    beforeEach(() => {
      htmlParser = new HtmlParser();
      serializer = new Xliff(htmlParser, DEFAULT_INTERPOLATION_CONFIG);
    });


    describe('write', () => {
      it('should write a valid xliff file', () => { expect(toXliff(HTML)).toEqual(WRITE_XLIFF); });
    });

    describe('load', () => {
      it('should load XLIFF files', () => {
        expect(loadAsText(HTML, LOAD_XLIFF)).toEqual({
          '983775b9a51ce14b036be72d4cfd65d68d64e231': 'etubirtta elbatalsnart',
          'ec1d033f2436133c14ab038286c4f5df4697484a':
              '{{ interpolation}} footnemele elbatalsnart <b>sredlohecalp htiw</b>',
          'db3e0a6a5a96481f60aec61d98c3eecddef5ac23': 'oof',
          'd7fa2d59aaedcaa5309f13028c59af8c85b8c49d': '<div></div><img/><br/>',
        });
      });
    });
  });
}