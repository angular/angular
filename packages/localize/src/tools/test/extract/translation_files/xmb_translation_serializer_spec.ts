/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {runInEachFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {ɵParsedMessage} from '@angular/localize';

import {XmbTranslationSerializer} from '../../../src/extract/translation_files/xmb_translation_serializer';

import {mockMessage} from './mock_message';

runInEachFileSystem(() => {
  describe('XmbTranslationSerializer', () => {
    [false, true].forEach(useLegacyIds => {
      describe(`renderFile() [using ${useLegacyIds ? 'legacy' : 'canonical'} ids]`, () => {
        it('should convert a set of parsed messages into an XML string', () => {
          const messages: ɵParsedMessage[] = [
            mockMessage('12345', ['a', 'b', 'c'], ['PH', 'PH_1'], {
              meaning: 'some meaning',
              legacyIds: ['1234567890ABCDEF1234567890ABCDEF12345678', '615790887472569365'],
            }),
            mockMessage(
                '67890', ['a', '', 'c'], ['START_TAG_SPAN', 'CLOSE_TAG_SPAN'],
                {description: 'some description'}),
            mockMessage('13579', ['', 'b', ''], ['START_BOLD_TEXT', 'CLOSE_BOLD_TEXT'], {}),
            mockMessage('24680', ['a'], [], {meaning: 'meaning', description: 'and description'}),
            mockMessage('80808', ['multi\nlines'], [], {}),
            mockMessage('90000', ['<escape', 'me>'], ['double-quotes-"'], {}),
          ];
          const serializer = new XmbTranslationSerializer(absoluteFrom('/project'), useLegacyIds);
          const output = serializer.serialize(messages);
          expect(output).toContain([
            `<messagebundle>`,
            `  <msg id="${
                useLegacyIds ?
                    '615790887472569365' :
                    '12345'}" meaning="some meaning">a<ph name="PH"/>b<ph name="PH_1"/>c</msg>`,
            `  <msg id="67890" desc="some description">a<ph name="START_TAG_SPAN"/><ph name="CLOSE_TAG_SPAN"/>c</msg>`,
            `  <msg id="13579"><ph name="START_BOLD_TEXT"/>b<ph name="CLOSE_BOLD_TEXT"/></msg>`,
            `  <msg id="24680" desc="and description" meaning="meaning">a</msg>`,
            `  <msg id="80808">multi`, `lines</msg>`,
            `  <msg id="90000">&lt;escape<ph name="double-quotes-&quot;"/>me&gt;</msg>`,
            `</messagebundle>\n`
          ].join('\n'));
        });
      });
    });
  });
});
