/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Xliff2TranslationSerializer} from '../../../src/extract/translation_files/xliff2_translation_serializer';
import {ParsedMessage} from '../../../src/utils';
import {mockMessage} from './mock_message';

describe('Xliff2TranslationSerializer', () => {
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
    const serializer = new Xliff2TranslationSerializer();
    const output = serializer.renderFile(messages);
    expect(output).toEqual(
        `<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file>
    <unit id="12345">
      <notes>
        <note category="meaning">some meaning</note>
      </notes>
      <segment>
        <source>a<ph id="1" equiv="PH"/>b<ph id="2" equiv="PH_1"/>c</source>
      </segment>
    </unit>
    <unit id="67890">
      <notes>
        <note category="description">some description</note>
      </notes>
      <segment>
        <source>a<pc id="1" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN"></pc>c</source>
      </segment>
    </unit>
    <unit id="13579">
      <segment>
        <source><pc id="1" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT">b</pc></source>
      </segment>
    </unit>
    <unit id="24680">
      <notes>
        <note category="description">and description</note>
        <note category="meaning">meaning</note>
      </notes>
      <segment>
        <source>a</source>
      </segment>
    </unit>
    <unit id="80808">
      <segment>
        <source>multi
lines</source>
      </segment>
    </unit>
    <unit id="90000">
      <segment>
        <source>&lt;escape<ph id="1" equiv="double-quotes-&quot;"/>me&gt;</source>
      </segment>
    </unit>
  </file>
</xliff>
`);
  });
});
