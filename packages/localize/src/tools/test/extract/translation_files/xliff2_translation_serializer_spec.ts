/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {computeMsgId} from '@angular/compiler';
import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {runInEachFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {ɵParsedMessage} from '@angular/localize';

import {Xliff2TranslationSerializer} from '../../../src/extract/translation_files/xliff2_translation_serializer';

import {mockMessage} from './mock_message';

runInEachFileSystem(() => {
  describe('Xliff2TranslationSerializer', () => {
    [false, true].forEach(useLegacyIds => {
      describe(`renderFile() [using ${useLegacyIds ? 'legacy' : 'canonical'} ids]`, () => {
        it('should convert a set of parsed messages into an XML string', () => {
          const messages: ɵParsedMessage[] = [
            mockMessage('12345', ['a', 'b', 'c'], ['PH', 'PH_1'], {
              meaning: 'some meaning',
              location: {
                file: absoluteFrom('/project/file.ts'),
                start: {line: 5, column: 0},
                end: {line: 5, column: 3}
              },
              legacyIds: ['1234567890ABCDEF1234567890ABCDEF12345678', '615790887472569365'],
            }),
            mockMessage('67890', ['a', '', 'c'], ['START_TAG_SPAN', 'CLOSE_TAG_SPAN'], {
              description: 'some description',
              location: {
                file: absoluteFrom('/project/file.ts'),
                start: {line: 2, column: 7},
                end: {line: 3, column: 2}
              }
            }),
            mockMessage('13579', ['', 'b', ''], ['START_BOLD_TEXT', 'CLOSE_BOLD_TEXT'], {}),
            mockMessage('24680', ['a'], [], {meaning: 'meaning', description: 'and description'}),
            mockMessage('80808', ['multi\nlines'], [], {}),
            mockMessage('90000', ['<escape', 'me>'], ['double-quotes-"'], {}),
            mockMessage(
                '100000',
                [
                  'pre-ICU {VAR_SELECT, select, a {a} b {{INTERPOLATION}} c {pre {INTERPOLATION_1} post}} post-ICU'
                ],
                [], {}),
            mockMessage(
                '100001',
                [
                  '{VAR_PLURAL, plural, one {{START_BOLD_TEXT}something bold{CLOSE_BOLD_TEXT}} other {pre {START_TAG_SPAN}middle{CLOSE_TAG_SPAN} post}}'
                ],
                [], {}),
          ];
          const serializer =
              new Xliff2TranslationSerializer('xx', absoluteFrom('/project'), useLegacyIds);
          const output = serializer.serialize(messages);
          expect(output).toEqual([
            `<?xml version="1.0" encoding="UTF-8" ?>`,
            `<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="xx">`,
            `  <file>`,
            `    <unit id="${useLegacyIds ? '615790887472569365' : '12345'}">`,
            `      <notes>`,
            `        <note category="location">file.ts:6</note>`,
            `        <note category="meaning">some meaning</note>`,
            `      </notes>`,
            `      <segment>`,
            `        <source>a<ph id="0" equiv="PH"/>b<ph id="1" equiv="PH_1"/>c</source>`,
            `      </segment>`,
            `    </unit>`,
            `    <unit id="67890">`,
            `      <notes>`,
            `        <note category="location">file.ts:3,4</note>`,
            `        <note category="description">some description</note>`,
            `      </notes>`,
            `      <segment>`,
            `        <source>a<pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN"></pc>c</source>`,
            `      </segment>`,
            `    </unit>`,
            `    <unit id="13579">`,
            `      <segment>`,
            `        <source><pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT">b</pc></source>`,
            `      </segment>`,
            `    </unit>`,
            `    <unit id="24680">`,
            `      <notes>`,
            `        <note category="description">and description</note>`,
            `        <note category="meaning">meaning</note>`,
            `      </notes>`,
            `      <segment>`,
            `        <source>a</source>`,
            `      </segment>`,
            `    </unit>`,
            `    <unit id="80808">`,
            `      <segment>`,
            `        <source>multi`,
            `lines</source>`,
            `      </segment>`,
            `    </unit>`,
            `    <unit id="90000">`,
            `      <segment>`,
            `        <source>&lt;escape<ph id="0" equiv="double-quotes-&quot;"/>me&gt;</source>`,
            `      </segment>`,
            `    </unit>`,
            `    <unit id="100000">`,
            `      <segment>`,
            `        <source>pre-ICU {VAR_SELECT, select, a {a} b {<ph id="0" equiv="INTERPOLATION"/>} c {pre <ph id="1" equiv="INTERPOLATION_1"/> post}} post-ICU</source>`,
            `      </segment>`,
            `    </unit>`,
            `    <unit id="100001">`,
            `      <segment>`,
            `        <source>{VAR_PLURAL, plural, one {<pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT">something bold</pc>} other {pre <pc id="1" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN">middle</pc> post}}</source>`,
            `      </segment>`,
            `    </unit>`,
            `  </file>`,
            `</xliff>\n`,
          ].join('\n'));
        });
      });
    });
  });
});
