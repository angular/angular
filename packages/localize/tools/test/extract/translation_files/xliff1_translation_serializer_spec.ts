/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {absoluteFrom, runInEachFileSystem} from '@angular/compiler-cli';
import {ɵParsedMessage, ɵSourceLocation} from '../../../../index';

import {FormatOptions} from '../../../src/extract/translation_files/format_options';
import {Xliff1TranslationSerializer} from '../../../src/extract/translation_files/xliff1_translation_serializer';

import {location, mockMessage} from './mock_message';
import {toAttributes} from './utils';

runInEachFileSystem(() => {
  describe('Xliff1TranslationSerializer', () => {
    ([{}, {'xml:space': 'preserve'}] as FormatOptions[]).forEach((options) => {
      [false, true].forEach((useLegacyIds) => {
        describe(`renderFile() [using ${useLegacyIds ? 'legacy' : 'canonical'} ids]`, () => {
          it('should convert a set of parsed messages into an XML string', () => {
            const phLocation: ɵSourceLocation = {
              start: {line: 0, column: 10},
              end: {line: 1, column: 15},
              file: absoluteFrom('/project/file.ts'),
              text: 'placeholder + 1',
            };
            const messagePartLocation: ɵSourceLocation = {
              start: {line: 0, column: 5},
              end: {line: 0, column: 10},
              file: absoluteFrom('/project/file.ts'),
              text: 'message part',
            };
            const messages: ɵParsedMessage[] = [
              mockMessage('12345', ['a', 'b', 'c'], ['PH', 'PH_1'], {
                meaning: 'some meaning',
                location: {
                  file: absoluteFrom('/project/file.ts'),
                  start: {line: 5, column: 10},
                  end: {line: 5, column: 12},
                },
                legacyIds: ['1234567890ABCDEF1234567890ABCDEF12345678', '615790887472569365'],
              }),
              mockMessage('54321', ['a', 'b', 'c'], ['PH', 'PH_1'], {
                customId: 'someId',
                legacyIds: ['87654321FEDCBA0987654321FEDCBA0987654321', '563965274788097516'],
                messagePartLocations: [undefined, messagePartLocation, undefined],
                substitutionLocations: {'PH': phLocation, 'PH_1': undefined},
              }),
              mockMessage('67890', ['a', '', 'c'], ['START_TAG_SPAN', 'CLOSE_TAG_SPAN'], {
                description: 'some description',
              }),
              mockMessage('38705', ['a', '', 'c'], ['START_TAG_SPAN', 'CLOSE_TAG_SPAN'], {
                location: {
                  file: absoluteFrom('/project/file.ts'),
                  start: {line: 2, column: 7},
                  end: {line: 3, column: 2},
                },
              }),
              mockMessage('13579', ['', 'b', ''], ['START_BOLD_TEXT', 'CLOSE_BOLD_TEXT'], {}),
              mockMessage('24680', ['a'], [], {meaning: 'meaning', description: 'and description'}),
              mockMessage('80808', ['multi\nlines'], [], {}),
              mockMessage('90000', ['<escape', 'me>'], ['double-quotes-"'], {}),
              mockMessage('100000', ['pre-ICU ', ' post-ICU'], ['ICU'], {
                associatedMessageIds: {ICU: 'SOME_ICU_ID'},
              }),
              mockMessage(
                'SOME_ICU_ID',
                ['{VAR_SELECT, select, a {a} b {{INTERPOLATION}} c {pre {INTERPOLATION_1} post}}'],
                [],
                {},
              ),
              mockMessage(
                '100001',
                [
                  '{VAR_PLURAL, plural, one {{START_BOLD_TEXT}something bold{CLOSE_BOLD_TEXT}} other {pre {START_TAG_SPAN}middle{CLOSE_TAG_SPAN} post}}',
                ],
                [],
                {},
              ),
            ];
            const serializer = new Xliff1TranslationSerializer(
              'xx',
              absoluteFrom('/project'),
              useLegacyIds,
              options,
            );
            const output = serializer.serialize(messages);
            expect(output).toEqual(
              [
                `<?xml version="1.0" encoding="UTF-8" ?>`,
                `<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">`,
                `  <file source-language="xx" datatype="plaintext" original="ng2.template"${toAttributes(
                  options,
                )}>`,
                `    <body>`,
                `      <trans-unit id="someId" datatype="html">`,
                `        <source>a<x id="PH" equiv-text="placeholder + 1"/>b<x id="PH_1"/>c</source>`,
                `      </trans-unit>`,
                `      <trans-unit id="67890" datatype="html">`,
                `        <source>a<x id="START_TAG_SPAN" ctype="x-span"/><x id="CLOSE_TAG_SPAN" ctype="x-span"/>c</source>`,
                `        <note priority="1" from="description">some description</note>`,
                `      </trans-unit>`,
                `      <trans-unit id="13579" datatype="html">`,
                `        <source><x id="START_BOLD_TEXT" ctype="x-b"/>b<x id="CLOSE_BOLD_TEXT" ctype="x-b"/></source>`,
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
                `        <source>pre-ICU <x id="ICU" xid="SOME_ICU_ID"/> post-ICU</source>`,
                `      </trans-unit>`,
                `      <trans-unit id="SOME_ICU_ID" datatype="html">`,
                `        <source>{VAR_SELECT, select, a {a} b {<x id="INTERPOLATION"/>} c {pre <x id="INTERPOLATION_1"/> post}}</source>`,
                `      </trans-unit>`,
                `      <trans-unit id="100001" datatype="html">`,
                `        <source>{VAR_PLURAL, plural, one {<x id="START_BOLD_TEXT" ctype="x-b"/>something bold<x id="CLOSE_BOLD_TEXT" ctype="x-b"/>} other {pre <x id="START_TAG_SPAN" ctype="x-span"/>middle<x id="CLOSE_TAG_SPAN" ctype="x-span"/> post}}</source>`,
                `      </trans-unit>`,
                `      <trans-unit id="38705" datatype="html">`,
                `        <source>a<x id="START_TAG_SPAN" ctype="x-span"/><x id="CLOSE_TAG_SPAN" ctype="x-span"/>c</source>`,
                `        <context-group purpose="location">`,
                `          <context context-type="sourcefile">file.ts</context>`,
                `          <context context-type="linenumber">3,4</context>`,
                `        </context-group>`,
                `      </trans-unit>`,
                `      <trans-unit id="${
                  useLegacyIds ? '1234567890ABCDEF1234567890ABCDEF12345678' : '12345'
                }" datatype="html">`,
                `        <source>a<x id="PH"/>b<x id="PH_1"/>c</source>`,
                `        <context-group purpose="location">`,
                `          <context context-type="sourcefile">file.ts</context>`,
                `          <context context-type="linenumber">6</context>`,
                `        </context-group>`,
                `        <note priority="1" from="meaning">some meaning</note>`,
                `      </trans-unit>`,
                `    </body>`,
                `  </file>`,
                `</xliff>\n`,
              ].join('\n'),
            );
          });

          it('should convert a set of parsed messages into an XML string', () => {
            const messageLocation1: ɵSourceLocation = {
              start: {line: 0, column: 5},
              end: {line: 0, column: 10},
              file: absoluteFrom('/project/file-1.ts'),
              text: 'message text',
            };

            const messageLocation2: ɵSourceLocation = {
              start: {line: 3, column: 2},
              end: {line: 4, column: 7},
              file: absoluteFrom('/project/file-2.ts'),
              text: 'message text',
            };

            const messageLocation3: ɵSourceLocation = {
              start: {line: 0, column: 5},
              end: {line: 0, column: 10},
              file: absoluteFrom('/project/file-3.ts'),
              text: 'message text',
            };

            const messageLocation4: ɵSourceLocation = {
              start: {line: 3, column: 2},
              end: {line: 4, column: 7},
              file: absoluteFrom('/project/file-4.ts'),
              text: 'message text',
            };

            const messages: ɵParsedMessage[] = [
              mockMessage('1234', ['message text'], [], {location: messageLocation1}),
              mockMessage('1234', ['message text'], [], {location: messageLocation2}),
              mockMessage('1234', ['message text'], [], {
                location: messageLocation3,
                legacyIds: ['87654321FEDCBA0987654321FEDCBA0987654321', '563965274788097516'],
              }),
              mockMessage('1234', ['message text'], [], {
                location: messageLocation4,
                customId: 'other',
              }),
            ];
            const serializer = new Xliff1TranslationSerializer(
              'xx',
              absoluteFrom('/project'),
              useLegacyIds,
              options,
            );
            const output = serializer.serialize(messages);

            // Note that in this test the third message will match the first two if legacyIds is
            // false. Otherwise it will be a separate message on its own.

            expect(output).toEqual(
              [
                `<?xml version="1.0" encoding="UTF-8" ?>`,
                `<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">`,
                `  <file source-language="xx" datatype="plaintext" original="ng2.template"${toAttributes(
                  options,
                )}>`,
                `    <body>`,
                `      <trans-unit id="1234" datatype="html">`,
                `        <source>message text</source>`,
                `        <context-group purpose="location">`,
                `          <context context-type="sourcefile">file-1.ts</context>`,
                `          <context context-type="linenumber">1</context>`,
                `        </context-group>`,
                `        <context-group purpose="location">`,
                `          <context context-type="sourcefile">file-2.ts</context>`,
                `          <context context-type="linenumber">4,5</context>`,
                `        </context-group>`,
                ...(useLegacyIds
                  ? []
                  : [
                      `        <context-group purpose="location">`,
                      `          <context context-type="sourcefile">file-3.ts</context>`,
                      `          <context context-type="linenumber">1</context>`,
                      `        </context-group>`,
                    ]),
                `      </trans-unit>`,
                ...(useLegacyIds
                  ? [
                      `      <trans-unit id="87654321FEDCBA0987654321FEDCBA0987654321" datatype="html">`,
                      `        <source>message text</source>`,
                      `        <context-group purpose="location">`,
                      `          <context context-type="sourcefile">file-3.ts</context>`,
                      `          <context context-type="linenumber">1</context>`,
                      `        </context-group>`,
                      `      </trans-unit>`,
                    ]
                  : []),
                `      <trans-unit id="other" datatype="html">`,
                `        <source>message text</source>`,
                `        <context-group purpose="location">`,
                `          <context context-type="sourcefile">file-4.ts</context>`,
                `          <context context-type="linenumber">4,5</context>`,
                `        </context-group>`,
                `      </trans-unit>`,
                `    </body>`,
                `  </file>`,
                `</xliff>\n`,
              ].join('\n'),
            );
          });

          it('should render the "ctype" for line breaks', () => {
            const serializer = new Xliff1TranslationSerializer(
              'xx',
              absoluteFrom('/project'),
              useLegacyIds,
              options,
            );
            const output = serializer.serialize([mockMessage('1', ['a', 'b'], ['LINE_BREAK'], {})]);
            expect(output).toContain('<source>a<x id="LINE_BREAK" ctype="lb"/>b</source>');
          });

          it('should render the "ctype" for images', () => {
            const serializer = new Xliff1TranslationSerializer(
              'xx',
              absoluteFrom('/project'),
              useLegacyIds,
              options,
            );
            const output = serializer.serialize([mockMessage('2', ['a', 'b'], ['TAG_IMG'], {})]);
            expect(output).toContain('<source>a<x id="TAG_IMG" ctype="image"/>b</source>');
          });

          it('should render the "ctype" for bold elements', () => {
            const serializer = new Xliff1TranslationSerializer(
              'xx',
              absoluteFrom('/project'),
              useLegacyIds,
              options,
            );
            const output = serializer.serialize([
              mockMessage('3', ['a', 'b', 'c'], ['START_BOLD_TEXT', 'CLOSE_BOLD_TEXT'], {}),
            ]);
            expect(output).toContain(
              '<source>a<x id="START_BOLD_TEXT" ctype="x-b"/>b<x id="CLOSE_BOLD_TEXT" ctype="x-b"/>c</source>',
            );
          });

          it('should render the "ctype" for headings', () => {
            const serializer = new Xliff1TranslationSerializer(
              'xx',
              absoluteFrom('/project'),
              useLegacyIds,
              options,
            );
            const output = serializer.serialize([
              mockMessage(
                '4',
                ['a', 'b', 'c'],
                ['START_HEADING_LEVEL1', 'CLOSE_HEADING_LEVEL1'],
                {},
              ),
            ]);
            expect(output).toContain(
              '<source>a<x id="START_HEADING_LEVEL1" ctype="x-h1"/>b<x id="CLOSE_HEADING_LEVEL1" ctype="x-h1"/>c</source>',
            );
          });

          it('should render the "ctype" for span elements', () => {
            const serializer = new Xliff1TranslationSerializer(
              'xx',
              absoluteFrom('/project'),
              useLegacyIds,
              options,
            );
            const output = serializer.serialize([
              mockMessage('5', ['a', 'b', 'c'], ['START_TAG_SPAN', 'CLOSE_TAG_SPAN'], {}),
            ]);
            expect(output).toContain(
              '<source>a<x id="START_TAG_SPAN" ctype="x-span"/>b<x id="CLOSE_TAG_SPAN" ctype="x-span"/>c</source>',
            );
          });

          it('should render the "ctype" for div elements', () => {
            const serializer = new Xliff1TranslationSerializer(
              'xx',
              absoluteFrom('/project'),
              useLegacyIds,
              options,
            );
            const output = serializer.serialize([
              mockMessage('6', ['a', 'b', 'c'], ['START_TAG_DIV', 'CLOSE_TAG_DIV'], {}),
            ]);
            expect(output).toContain(
              '<source>a<x id="START_TAG_DIV" ctype="x-div"/>b<x id="CLOSE_TAG_DIV" ctype="x-div"/>c</source>',
            );
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
        const serializer = new Xliff1TranslationSerializer('xx', absoluteFrom('/root'), false, {});
        const output = serializer.serialize(messages);
        expect(output.split('\n')).toEqual([
          '<?xml version="1.0" encoding="UTF-8" ?>',
          '<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">',
          '  <file source-language="xx" datatype="plaintext" original="ng2.template">',
          '    <body>',
          '      <trans-unit id="1" datatype="html">',
          '        <source>message-1</source>',
          '        <context-group purpose="location">',
          '          <context context-type="sourcefile">a-1.ts</context>',
          '          <context context-type="linenumber">6</context>',
          '        </context-group>',
          '        <context-group purpose="location">',
          '          <context context-type="sourcefile">b-1.ts</context>',
          '          <context context-type="linenumber">6</context>',
          '        </context-group>',
          '        <context-group purpose="location">',
          '          <context context-type="sourcefile">b-1.ts</context>',
          '          <context context-type="linenumber">6</context>',
          '        </context-group>',
          '        <context-group purpose="location">',
          '          <context context-type="sourcefile">b-1.ts</context>',
          '          <context context-type="linenumber">9,11</context>',
          '        </context-group>',
          '        <context-group purpose="location">',
          '          <context context-type="sourcefile">c-1.ts</context>',
          '          <context context-type="linenumber">6</context>',
          '        </context-group>',
          '      </trans-unit>',
          '      <trans-unit id="2" datatype="html">',
          '        <source>message-1</source>',
          '        <context-group purpose="location">',
          '          <context context-type="sourcefile">a-2.ts</context>',
          '          <context context-type="linenumber">6</context>',
          '        </context-group>',
          '        <context-group purpose="location">',
          '          <context context-type="sourcefile">b-2.ts</context>',
          '          <context context-type="linenumber">6</context>',
          '        </context-group>',
          '        <context-group purpose="location">',
          '          <context context-type="sourcefile">b-2.ts</context>',
          '          <context context-type="linenumber">6</context>',
          '        </context-group>',
          '        <context-group purpose="location">',
          '          <context context-type="sourcefile">b-2.ts</context>',
          '          <context context-type="linenumber">9,11</context>',
          '        </context-group>',
          '        <context-group purpose="location">',
          '          <context context-type="sourcefile">c-2.ts</context>',
          '          <context context-type="linenumber">6</context>',
          '        </context-group>',
          '      </trans-unit>',
          '    </body>',
          '  </file>',
          '</xliff>',
          '',
        ]);
      });
    });
  });
});
