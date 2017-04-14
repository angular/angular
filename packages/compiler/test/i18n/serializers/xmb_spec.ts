/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MessageBundle} from '@angular/compiler/src/i18n/message_bundle';
import {Xmb} from '@angular/compiler/src/i18n/serializers/xmb';
import {HtmlParser} from '@angular/compiler/src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '@angular/compiler/src/ml_parser/interpolation_config';

export function main(): void {
  describe('XMB serializer', () => {
    const HTML = `
<p>not translatable</p>
<p i18n>translatable element <b>with placeholders</b> {{ interpolation}}</p>
<!-- i18n -->{ count, plural, =0 {<p>test</p>}}<!-- /i18n -->
<p i18n="m|d">foo</p>
<p i18n="m|d@@i">foo</p>
<p i18n="@@bar">foo</p>
<p i18n="@@baz">{ count, plural, =0 { { sex, select, other {<p>deeply nested</p>}} }}</p>
<p i18n>{ count, plural, =0 { { sex, select, other {<p>deeply nested</p>}} }}</p>
<p i18n>multi
lines</p>`;

    const XMB = `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE messagebundle [
<!ELEMENT messagebundle (msg)*>
<!ATTLIST messagebundle class CDATA #IMPLIED>

<!ELEMENT msg (#PCDATA|ph|source)*>
<!ATTLIST msg id CDATA #IMPLIED>
<!ATTLIST msg seq CDATA #IMPLIED>
<!ATTLIST msg name CDATA #IMPLIED>
<!ATTLIST msg desc CDATA #IMPLIED>
<!ATTLIST msg meaning CDATA #IMPLIED>
<!ATTLIST msg obsolete (obsolete) #IMPLIED>
<!ATTLIST msg xml:space (default|preserve) "default">
<!ATTLIST msg is_hidden CDATA #IMPLIED>

<!ELEMENT source (#PCDATA)>

<!ELEMENT ph (#PCDATA|ex)*>
<!ATTLIST ph name CDATA #REQUIRED>

<!ELEMENT ex (#PCDATA)>
]>
<messagebundle>
  <msg id="7056919470098446707"><source>file.ts:3</source>translatable element <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>with placeholders<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph> <ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></msg>
  <msg id="2981514368455622387"><source>file.ts:4</source>{VAR_PLURAL, plural, =0 {<ph name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>test<ph name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>} }</msg>
  <msg id="7999024498831672133" desc="d" meaning="m"><source>file.ts:5</source>foo</msg>
  <msg id="i" desc="d" meaning="m"><source>file.ts:6</source>foo</msg>
  <msg id="bar"><source>file.ts:7</source>foo</msg>
  <msg id="baz"><source>file.ts:8</source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<ph name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>deeply nested<ph name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>} } } }</msg>
  <msg id="2015957479576096115"><source>file.ts:9</source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<ph name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>deeply nested<ph name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>} } } }</msg>
  <msg id="2340165783990709777"><source>file.ts:10,11</source>multi
lines</msg>
</messagebundle>
`;

    it('should write a valid xmb file', () => {
      expect(toXmb(HTML, 'file.ts')).toEqual(XMB);
      // the locale is not specified in the xmb file
      expect(toXmb(HTML, 'file.ts', 'fr')).toEqual(XMB);
    });

    it('should throw when trying to load an xmb file', () => {
      expect(() => {
        const serializer = new Xmb();
        serializer.load(XMB, 'url');
      }).toThrowError(/Unsupported/);
    });
  });
}

function toXmb(html: string, url: string, locale: string | null = null): string {
  const catalog = new MessageBundle(new HtmlParser, [], {}, locale);
  const serializer = new Xmb();

  catalog.updateFromTemplate(html, url, DEFAULT_INTERPOLATION_CONFIG);

  return catalog.write(serializer);
}
