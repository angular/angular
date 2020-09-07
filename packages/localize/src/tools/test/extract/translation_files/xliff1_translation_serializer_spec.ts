/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {runInEachFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {ɵParsedMessage, ɵSourceLocation} from '@angular/localize';

import {FormatOptions} from '../../../src/extract/translation_files/format_options';
import {Xliff1TranslationSerializer} from '../../../src/extract/translation_files/xliff1_translation_serializer';

import {mockMessage} from './mock_message';
import {toAttributes} from './utils';

runInEachFileSystem(() => {
  describe('Xliff1TranslationSerializer', () => {
    ([{}, {'xml:space': 'preserve'}] as FormatOptions[]).forEach(options => {
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
                location: {
                  file: absoluteFrom('/project/file.ts'),
                  start: {line: 5, column: 10},
                  end: {line: 5, column: 12}
                },
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
              mockMessage('38705', ['a', '', 'c'], ['START_TAG_SPAN', 'CLOSE_TAG_SPAN'], {
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
            const serializer = new Xliff1TranslationSerializer(
                'xx', absoluteFrom('/project'), useLegacyIds, options);
            const output = serializer.serialize(messages);
            expect(output).toEqual([
              `<?xml version="1.0" encoding="UTF-8" ?>`,
              `<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">`,
              `  <file source-language="xx" datatype="plaintext" original="ng2.template"${
                  toAttributes(options)}>`,
              `    <body>`,
              `      <trans-unit id="${
                  useLegacyIds ? '1234567890ABCDEF1234567890ABCDEF12345678' :
                                 '12345'}" datatype="html">`,
              `        <source>a<x id="PH"/>b<x id="PH_1"/>c</source>`,
              `        <context-group purpose="location">`,
              `          <context context-type="sourcefile">file.ts</context>`,
              `          <context context-type="linenumber">6</context>`,
              `        </context-group>`,
              `        <note priority="1" from="meaning">some meaning</note>`,
              `      </trans-unit>`,
              `      <trans-unit id="someId" datatype="html">`,
              `        <source>a<x id="PH" equiv-text="placeholder + 1"/>b<x id="PH_1"/>c</source>`,
              `      </trans-unit>`,
              `      <trans-unit id="67890" datatype="html">`,
              `        <source>a<x id="START_TAG_SPAN"/><x id="CLOSE_TAG_SPAN"/>c</source>`,
              `        <note priority="1" from="description">some description</note>`,
              `      </trans-unit>`,
              `      <trans-unit id="38705" datatype="html">`,
              `        <source>a<x id="START_TAG_SPAN"/><x id="CLOSE_TAG_SPAN"/>c</source>`,
              `        <context-group purpose="location">`,
              `          <context context-type="sourcefile">file.ts</context>`,
              `          <context context-type="linenumber">3,4</context>`,
              `        </context-group>`,
              `      </trans-unit>`,
              `      <trans-unit id="13579" datatype="html">`,
              `        <source><x id="START_BOLD_TEXT"/>b<x id="CLOSE_BOLD_TEXT"/></source>`,
              `      </trans-unit>`,
              `      <trans-unit id="24680" datatype="html">`,
              `        <source>a</source>`,
              `        <note priority="1" from="description">and description</note>`,
              `        <note priority="1" from="meaning">meaning</note>`,
              `      </trans-unit>`,
              `      <trans-unit id="80808" datatype="html">`,
              `        <source>multi`,
              `lines</source>`,
              `      </trans-unit>`,
              `      <trans-unit id="90000" datatype="html">`,
              `        <source>&lt;escape<x id="double-quotes-&quot;"/>me&gt;</source>`,
              `      </trans-unit>`,
              `      <trans-unit id="100000" datatype="html">`,
              `        <source>pre-ICU {VAR_SELECT, select, a {a} b {<x id="INTERPOLATION"/>} c {pre <x id="INTERPOLATION_1"/> post}} post-ICU</source>`,
              `      </trans-unit>`,
              `      <trans-unit id="100001" datatype="html">`,
              `        <source>{VAR_PLURAL, plural, one {<x id="START_BOLD_TEXT"/>something bold<x id="CLOSE_BOLD_TEXT"/>} other {pre <x id="START_TAG_SPAN"/>middle<x id="CLOSE_TAG_SPAN"/> post}}</source>`,
              `      </trans-unit>`,
              `    </body>`,
              `  </file>`,
              `</xliff>\n`,
            ].join('\n'));
          });
        });
      });
    });
  });
});
