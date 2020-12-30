/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, getFileSystem, PathManipulation} from '@angular/compiler-cli/src/ngtsc/file_system';
import {runInEachFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {ɵParsedMessage, ɵSourceLocation} from '@angular/localize';

import {XmbTranslationSerializer} from '../../../src/extract/translation_files/xmb_translation_serializer';

import {location, mockMessage} from './mock_message';

runInEachFileSystem(() => {
  let fs: PathManipulation;
  beforeEach(() => fs = getFileSystem());
  describe('XmbTranslationSerializer', () => {
    [false, true].forEach(useLegacyIds => {
      describe(`renderFile() [using ${useLegacyIds ? 'legacy' : 'canonical'} ids]`, () => {
        it('should convert a set of parsed messages into an XML string', () => {
          const phLocation: ɵSourceLocation = {
            start: {line: 0, column: 10},
            end: {line: 1, column: 15},
            file: absoluteFrom('/project/file.ts'),
            text: 'placeholder + 1'
          };
          const messagePartLocation: ɵSourceLocation = {
            start: {line: 0, column: 5},
            end: {line: 0, column: 10},
            file: absoluteFrom('/project/file.ts'),
            text: 'message part'
          };
          const messages: ɵParsedMessage[] = [
            mockMessage('12345', ['a', 'b', 'c'], ['PH', 'PH_1'], {
              meaning: 'some meaning',
              legacyIds: ['1234567890ABCDEF1234567890ABCDEF12345678', '615790887472569365'],
            }),
            mockMessage('54321', ['a', 'b', 'c'], ['PH', 'PH_1'], {
              customId: 'someId',
              legacyIds: ['87654321FEDCBA0987654321FEDCBA0987654321', '563965274788097516'],
              messagePartLocations: [undefined, messagePartLocation, undefined],
              substitutionLocations: {'PH': phLocation, 'PH_1': undefined},
            }),
            mockMessage(
                '67890', ['a', '', 'c'], ['START_TAG_SPAN', 'CLOSE_TAG_SPAN'],
                {description: 'some description'}),
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
              new XmbTranslationSerializer(absoluteFrom('/project'), useLegacyIds, fs);
          const output = serializer.serialize(messages);
          expect(output).toContain([
            `<messagebundle>`,
            `  <msg id="${
                useLegacyIds ?
                    '615790887472569365' :
                    '12345'}" meaning="some meaning">a<ph name="PH"/>b<ph name="PH_1"/>c</msg>`,
            `  <msg id="someId">a<ph name="PH"/>b<ph name="PH_1"/>c</msg>`,
            `  <msg id="67890" desc="some description">a<ph name="START_TAG_SPAN"/><ph name="CLOSE_TAG_SPAN"/>c</msg>`,
            `  <msg id="13579"><ph name="START_BOLD_TEXT"/>b<ph name="CLOSE_BOLD_TEXT"/></msg>`,
            `  <msg id="24680" desc="and description" meaning="meaning">a</msg>`,
            `  <msg id="80808">multi`, `lines</msg>`,
            `  <msg id="90000">&lt;escape<ph name="double-quotes-&quot;"/>me&gt;</msg>`,
            `  <msg id="100000">pre-ICU {VAR_SELECT, select, a {a} b {<ph name="INTERPOLATION"/>} c {pre <ph name="INTERPOLATION_1"/> post}} post-ICU</msg>`,
            `  <msg id="100001">{VAR_PLURAL, plural, one {<ph name="START_BOLD_TEXT"/>something bold<ph name="CLOSE_BOLD_TEXT"/>} other {pre <ph name="START_TAG_SPAN"/>middle<ph name="CLOSE_TAG_SPAN"/> post}}</msg>`,
            `</messagebundle>\n`
          ].join('\n'));
        });
      });
    });
  });

  describe('renderFile()', () => {
    it('should consistently order serialized messages by location', () => {
      const messages: ɵParsedMessage[] = [
        mockMessage('1', ['message-1'], [], {location: location('/root/c-1.ts', 5, 10, 5, 12)}),
        mockMessage('2', ['message-1'], [], {location: location('/root/c-2.ts', 5, 10, 5, 12)}),
        mockMessage('1', ['message-1'], [], {location: location('/root/b-1.ts', 8, 0, 10, 12)}),
        mockMessage('2', ['message-1'], [], {location: location('/root/b-2.ts', 8, 0, 10, 12)}),
        mockMessage('1', ['message-1'], [], {location: location('/root/a-1.ts', 5, 10, 5, 12)}),
        mockMessage('2', ['message-1'], [], {location: location('/root/a-2.ts', 5, 10, 5, 12)}),
        mockMessage('1', ['message-1'], [], {location: location('/root/b-1.ts', 5, 10, 5, 12)}),
        mockMessage('2', ['message-1'], [], {location: location('/root/b-2.ts', 5, 10, 5, 12)}),
        mockMessage('1', ['message-1'], [], {location: location('/root/b-1.ts', 5, 20, 5, 12)}),
        mockMessage('2', ['message-1'], [], {location: location('/root/b-2.ts', 5, 20, 5, 12)}),
      ];
      const serializer = new XmbTranslationSerializer(absoluteFrom('/root'), false);
      const output = serializer.serialize(messages);
      expect(output.split('\n')).toEqual([
        '<?xml version="1.0" encoding="UTF-8" ?>',
        '<!DOCTYPE messagebundle [',
        '<!ELEMENT messagebundle (msg)*>',
        '<!ATTLIST messagebundle class CDATA #IMPLIED>',
        '',
        '<!ELEMENT msg (#PCDATA|ph|source)*>',
        '<!ATTLIST msg id CDATA #IMPLIED>',
        '<!ATTLIST msg seq CDATA #IMPLIED>',
        '<!ATTLIST msg name CDATA #IMPLIED>',
        '<!ATTLIST msg desc CDATA #IMPLIED>',
        '<!ATTLIST msg meaning CDATA #IMPLIED>',
        '<!ATTLIST msg obsolete (obsolete) #IMPLIED>',
        '<!ATTLIST msg xml:space (default|preserve) "default">',
        '<!ATTLIST msg is_hidden CDATA #IMPLIED>',
        '',
        '<!ELEMENT source (#PCDATA)>',
        '',
        '<!ELEMENT ph (#PCDATA|ex)*>',
        '<!ATTLIST ph name CDATA #REQUIRED>',
        '',
        '<!ELEMENT ex (#PCDATA)>',
        ']>',
        '<messagebundle>',
        '  <msg id="1"><source>a-1.ts:5</source>message-1</msg>',
        '  <msg id="2"><source>a-2.ts:5</source>message-1</msg>',
        '</messagebundle>',
        '',
      ]);
    });
  });
});
