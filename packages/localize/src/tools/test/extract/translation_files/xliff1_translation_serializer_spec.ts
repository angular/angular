/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Xliff1TranslationSerializer} from '../../../src/extract/translation_files/xliff1_translation_serializer';
import {ParsedMessage} from '../../../src/utils';
import {mockMessage} from './mock_message';

describe('Xliff1TranslationSerializer', () => {
  it('should convert a set of parsed messages into a XML string', () => {
    const messages: ParsedMessage[] = [
      mockMessage('12345', ['a', 'b', 'c'], ['PH', 'PH_1'], 'some meaning'),
      mockMessage(
          '67890', ['a', '', 'c'], ['START_TAG_SPAN', 'CLOSE_TAG_SPAN'], '', 'some description'),
      mockMessage('13579', ['', 'b', ''], ['START_BOLD_TEXT', 'CLOSE_BOLD_TEXT']),
      mockMessage('24680', ['a'], [], 'meaning', 'and description'),
      mockMessage('80808', ['multi\nlines'], []),
      mockMessage('90000', ['<escape', 'me>'], ['double-quotes-"'])
    ];
    const serializer = new Xliff1TranslationSerializer();
    const output = serializer.renderFile(messages);
    expect(output).toEqual(`<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext">
    <body>
      <trans-unit id="12345" datatype="html">
        <source>a<x id="PH"/>b<x id="PH_1"/>c</source>
        <note priority="1" from="meaning">some meaning</note>
      </trans-unit>
      <trans-unit id="67890" datatype="html">
        <source>a<x id="START_TAG_SPAN"/><x id="CLOSE_TAG_SPAN"/>c</source>
        <note priority="1" from="description">some description</note>
      </trans-unit>
      <trans-unit id="13579" datatype="html">
        <source><x id="START_BOLD_TEXT"/>b<x id="CLOSE_BOLD_TEXT"/></source>
      </trans-unit>
      <trans-unit id="24680" datatype="html">
        <source>a</source>
        <note priority="1" from="description">and description</note>
        <note priority="1" from="meaning">meaning</note>
      </trans-unit>
      <trans-unit id="80808" datatype="html">
        <source>multi
lines</source>
      </trans-unit>
      <trans-unit id="90000" datatype="html">
        <source>&lt;escape<x id="double-quotes-&quot;"/>me&gt;</source>
      </trans-unit>
    </body>
  </file>
</xliff>
`);
  });
});
