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
import {Xliff2TranslationSerializer} from '../../../src/extract/translation_files/xliff2_translation_serializer';

import {location, mockMessage} from './mock_message';
import {toAttributes} from './utils';

runInEachFileSystem(() => {
  describe('Xliff2TranslationSerializer', () => {
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
                  start: {line: 5, column: 0},
                  end: {line: 5, column: 3},
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
                location: {
                  file: absoluteFrom('/project/file.ts'),
                  start: {line: 2, column: 7},
                  end: {line: 3, column: 2},
                },
              }),
              mockMessage('location-only', ['a', '', 'c'], ['START_TAG_SPAN', 'CLOSE_TAG_SPAN'], {
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
            const serializer = new Xliff2TranslationSerializer(
              'xx',
              absoluteFrom('/project'),
              useLegacyIds,
              options,
            );
            const output = serializer.serialize(messages);
            expect(output.split(/\r?\n/)).toEqual([
              `<?xml version="1.0" encoding="UTF-8" ?>`,
              `<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="xx">`,
              `  <file id="ngi18n" original="ng.template"${toAttributes(options)}>`,
              `    <unit id="someId">`,
              `      <segment>`,
              `        <source>a<ph id="0" equiv="PH" disp="placeholder + 1"/>b<ph id="1" equiv="PH_1"/>c</source>`,
              `      </segment>`,
              `    </unit>`,
              `    <unit id="13579">`,
              `      <segment>`,
              `        <source><pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt">b</pc></source>`,
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
              `        <source>pre-ICU <ph id="0" equiv="ICU" subFlows="SOME_ICU_ID"/> post-ICU</source>`,
              `      </segment>`,
              `    </unit>`,
              `    <unit id="SOME_ICU_ID">`,
              `      <segment>`,
              `        <source>{VAR_SELECT, select, a {a} b {<ph id="0" equiv="INTERPOLATION"/>} c {pre <ph id="1" equiv="INTERPOLATION_1"/> post}}</source>`,
              `      </segment>`,
              `    </unit>`,
              `    <unit id="100001">`,
              `      <segment>`,
              `        <source>{VAR_PLURAL, plural, one {<pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt">something bold</pc>} other {pre <pc id="1" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other">middle</pc> post}}</source>`,
              `      </segment>`,
              `    </unit>`,
              `    <unit id="67890">`,
              `      <notes>`,
              `        <note category="location">file.ts:3,4</note>`,
              `        <note category="description">some description</note>`,
              `      </notes>`,
              `      <segment>`,
              `        <source>a<pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other"></pc>c</source>`,
              `      </segment>`,
              `    </unit>`,
              `    <unit id="location-only">`,
              `      <notes>`,
              `        <note category="location">file.ts:3,4</note>`,
              `      </notes>`,
              `      <segment>`,
              `        <source>a<pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other"></pc>c</source>`,
              `      </segment>`,
              `    </unit>`,
              `    <unit id="${useLegacyIds ? '615790887472569365' : '12345'}">`,
              `      <notes>`,
              `        <note category="location">file.ts:6</note>`,
              `        <note category="meaning">some meaning</note>`,
              `      </notes>`,
              `      <segment>`,
              `        <source>a<ph id="0" equiv="PH"/>b<ph id="1" equiv="PH_1"/>c</source>`,
              `      </segment>`,
              `    </unit>`,
              `  </file>`,
              `</xliff>`,
              ``,
            ]);
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
            const serializer = new Xliff2TranslationSerializer(
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
                `<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="xx">`,
                `  <file id="ngi18n" original="ng.template"${toAttributes(options)}>`,
                `    <unit id="1234">`,
                `      <notes>`,
                `        <note category="location">file-1.ts:1</note>`,
                `        <note category="location">file-2.ts:4,5</note>`,
                ...(useLegacyIds ? [] : ['        <note category="location">file-3.ts:1</note>']),
                `      </notes>`,
                `      <segment>`,
                `        <source>message text</source>`,
                `      </segment>`,
                `    </unit>`,
                ...(useLegacyIds
                  ? [
                      `    <unit id="563965274788097516">`,
                      `      <notes>`,
                      `        <note category="location">file-3.ts:1</note>`,
                      `      </notes>`,
                      `      <segment>`,
                      `        <source>message text</source>`,
                      `      </segment>`,
                      `    </unit>`,
                    ]
                  : []),
                `    <unit id="other">`,
                `      <notes>`,
                `        <note category="location">file-4.ts:4,5</note>`,
                `      </notes>`,
                `      <segment>`,
                `        <source>message text</source>`,
                `      </segment>`,
                `    </unit>`,
                `  </file>`,
                `</xliff>\n`,
              ].join('\n'),
            );
          });

          it('should render the "type" for line breaks', () => {
            const serializer = new Xliff2TranslationSerializer(
              'xx',
              absoluteFrom('/project'),
              useLegacyIds,
              options,
            );
            const output = serializer.serialize([mockMessage('1', ['a', 'b'], ['LINE_BREAK'], {})]);
            expect(output).toContain(
              '<source>a<ph id="0" equiv="LINE_BREAK" type="fmt"/>b</source>',
            );
          });

          it('should render the "type" for images', () => {
            const serializer = new Xliff2TranslationSerializer(
              'xx',
              absoluteFrom('/project'),
              useLegacyIds,
              options,
            );
            const output = serializer.serialize([mockMessage('2', ['a', 'b'], ['TAG_IMG'], {})]);
            expect(output).toContain(
              '<source>a<ph id="0" equiv="TAG_IMG" type="image"/>b</source>',
            );
          });

          it('should render the "type" for bold elements', () => {
            const serializer = new Xliff2TranslationSerializer(
              'xx',
              absoluteFrom('/project'),
              useLegacyIds,
              options,
            );
            const output = serializer.serialize([
              mockMessage('3', ['a', 'b', 'c'], ['START_BOLD_TEXT', 'CLOSE_BOLD_TEXT'], {}),
            ]);
            expect(output).toContain(
              '<source>a<pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt">b</pc>c</source>',
            );
          });

          it('should render the "type" for heading elements', () => {
            const serializer = new Xliff2TranslationSerializer(
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
              '<source>a<pc id="0" equivStart="START_HEADING_LEVEL1" equivEnd="CLOSE_HEADING_LEVEL1" type="other">b</pc>c</source>',
            );
          });

          it('should render the "type" for span elements', () => {
            const serializer = new Xliff2TranslationSerializer(
              'xx',
              absoluteFrom('/project'),
              useLegacyIds,
              options,
            );
            const output = serializer.serialize([
              mockMessage('5', ['a', 'b', 'c'], ['START_TAG_SPAN', 'CLOSE_TAG_SPAN'], {}),
            ]);
            expect(output).toContain(
              '<source>a<pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other">b</pc>c</source>',
            );
          });

          it('should render the "type" for div elements', () => {
            const serializer = new Xliff2TranslationSerializer(
              'xx',
              absoluteFrom('/project'),
              useLegacyIds,
              options,
            );
            const output = serializer.serialize([
              mockMessage('6', ['a', 'b', 'c'], ['START_TAG_DIV', 'CLOSE_TAG_DIV'], {}),
            ]);
            expect(output).toContain(
              '<source>a<pc id="0" equivStart="START_TAG_DIV" equivEnd="CLOSE_TAG_DIV" type="other">b</pc>c</source>',
            );
          });

          it('should render the "type" for link elements', () => {
            const serializer = new Xliff2TranslationSerializer(
              'xx',
              absoluteFrom('/project'),
              useLegacyIds,
              options,
            );
            const output = serializer.serialize([
              mockMessage('6', ['a', 'b', 'c'], ['START_LINK', 'CLOSE_LINK'], {}),
            ]);
            expect(output).toContain(
              '<source>a<pc id="0" equivStart="START_LINK" equivEnd="CLOSE_LINK" type="link">b</pc>c</source>',
            );
          });

          it('should render generic close tag placeholders for additional elements', () => {
            const serializer = new Xliff2TranslationSerializer(
              'xx',
              absoluteFrom('/project'),
              useLegacyIds,
              options,
            );
            const output = serializer.serialize([
              mockMessage(
                '6',
                ['a', 'b', 'c', 'd', 'e'],
                ['START_LINK', 'CLOSE_LINK', 'START_LINK_1', 'CLOSE_LINK'],
                {},
              ),
            ]);
            expect(output).toContain(
              '<source>a<pc id="0" equivStart="START_LINK" equivEnd="CLOSE_LINK" type="link">b</pc>c<pc id="1" equivStart="START_LINK_1" equivEnd="CLOSE_LINK" type="link">d</pc>e</source>',
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
        const serializer = new Xliff2TranslationSerializer('xx', absoluteFrom('/root'), false, {});
        const output = serializer.serialize(messages);
        expect(output.split('\n')).toEqual([
          '<?xml version="1.0" encoding="UTF-8" ?>',
          '<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="xx">',
          '  <file id="ngi18n" original="ng.template">',
          '    <unit id="1">',
          '      <notes>',
          '        <note category="location">a-1.ts:6</note>',
          '        <note category="location">b-1.ts:6</note>',
          '        <note category="location">b-1.ts:6</note>',
          '        <note category="location">b-1.ts:9,11</note>',
          '        <note category="location">c-1.ts:6</note>',
          '      </notes>',
          '      <segment>',
          '        <source>message-1</source>',
          '      </segment>',
          '    </unit>',
          '    <unit id="2">',
          '      <notes>',
          '        <note category="location">a-2.ts:6</note>',
          '        <note category="location">b-2.ts:6</note>',
          '        <note category="location">b-2.ts:6</note>',
          '        <note category="location">b-2.ts:9,11</note>',
          '        <note category="location">c-2.ts:6</note>',
          '      </notes>',
          '      <segment>',
          '        <source>message-1</source>',
          '      </segment>',
          '    </unit>',
          '  </file>',
          '</xliff>',
          '',
        ]);
      });
    });
  });
});
