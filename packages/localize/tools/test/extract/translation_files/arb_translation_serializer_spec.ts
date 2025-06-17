/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {getFileSystem, PathManipulation, runInEachFileSystem} from '@angular/compiler-cli';
import {ɵParsedMessage} from '../../../../index';

import {ArbTranslationSerializer} from '../../../src/extract/translation_files/arb_translation_serializer';

import {location, mockMessage} from './mock_message';

runInEachFileSystem(() => {
  let fs: PathManipulation;
  describe('ArbTranslationSerializer', () => {
    beforeEach(() => {
      fs = getFileSystem();
    });

    describe('renderFile()', () => {
      it('should convert a set of parsed messages into a JSON string', () => {
        const messages: ɵParsedMessage[] = [
          mockMessage('12345', ['a', 'b', 'c'], ['PH', 'PH_1'], {
            meaning: 'some meaning',
            location: location('/project/file.ts', 5, 10, 5, 12),
          }),
          mockMessage('54321', ['a', 'b', 'c'], ['PH', 'PH_1'], {
            customId: 'someId',
          }),
          mockMessage('67890', ['a', '', 'c'], ['START_TAG_SPAN', 'CLOSE_TAG_SPAN'], {
            description: 'some description',
            location: location('/project/file.ts', 5, 10, 5, 12),
          }),
          mockMessage('67890', ['a', '', 'c'], ['START_TAG_SPAN', 'CLOSE_TAG_SPAN'], {
            description: 'some description',
            location: location('/project/other.ts', 2, 10, 3, 12),
          }),
          mockMessage('13579', ['', 'b', ''], ['START_BOLD_TEXT', 'CLOSE_BOLD_TEXT'], {}),
          mockMessage('24680', ['a'], [], {meaning: 'meaning', description: 'and description'}),
          mockMessage('80808', ['multi\nlines'], [], {}),
          mockMessage('90000', ['<escape', 'me>'], ['double-quotes-"'], {}),
          mockMessage(
            '100000',
            [
              'pre-ICU {VAR_SELECT, select, a {a} b {{INTERPOLATION}} c {pre {INTERPOLATION_1} post}} post-ICU',
            ],
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
        const serializer = new ArbTranslationSerializer('xx', fs.resolve('/project'), fs);
        const output = serializer.serialize(messages);
        expect(output.split('\n')).toEqual([
          '{',
          '  "@@locale": "xx",',
          '  "someId": "a{$PH}b{$PH_1}c",',
          '  "13579": "{$START_BOLD_TEXT}b{$CLOSE_BOLD_TEXT}",',
          '  "24680": "a",',
          '  "@24680": {',
          '    "description": "and description",',
          '    "x-meaning": "meaning"',
          '  },',
          '  "80808": "multi\\nlines",',
          '  "90000": "<escape{$double-quotes-\\"}me>",',
          '  "100000": "pre-ICU {VAR_SELECT, select, a {a} b {{INTERPOLATION}} c {pre {INTERPOLATION_1} post}} post-ICU",',
          '  "100001": "{VAR_PLURAL, plural, one {{START_BOLD_TEXT}something bold{CLOSE_BOLD_TEXT}} other {pre {START_TAG_SPAN}middle{CLOSE_TAG_SPAN} post}}",',
          '  "12345": "a{$PH}b{$PH_1}c",',
          '  "@12345": {',
          '    "x-meaning": "some meaning",',
          '    "x-locations": [',
          '      {',
          '        "file": "file.ts",',
          '        "start": { "line": "5", "column": "10" },',
          '        "end": { "line": "5", "column": "12" }',
          '      }',
          '    ]',
          '  },',
          '  "67890": "a{$START_TAG_SPAN}{$CLOSE_TAG_SPAN}c",',
          '  "@67890": {',
          '    "description": "some description",',
          '    "x-locations": [',
          '      {',
          '        "file": "file.ts",',
          '        "start": { "line": "5", "column": "10" },',
          '        "end": { "line": "5", "column": "12" }',
          '      },',
          '      {',
          '        "file": "other.ts",',
          '        "start": { "line": "2", "column": "10" },',
          '        "end": { "line": "3", "column": "12" }',
          '      }',
          '    ]',
          '  }',
          '}',
        ]);
      });

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
        const serializer = new ArbTranslationSerializer('xx', fs.resolve('/root'), fs);
        const output = serializer.serialize(messages);
        expect(output.split('\n')).toEqual([
          '{',
          '  "@@locale": "xx",',
          '  "1": "message-1",',
          '  "@1": {',
          '    "x-locations": [',
          '      {',
          '        "file": "a-1.ts",',
          '        "start": { "line": "5", "column": "10" },',
          '        "end": { "line": "5", "column": "12" }',
          '      },',
          '      {',
          '        "file": "b-1.ts",',
          '        "start": { "line": "5", "column": "10" },',
          '        "end": { "line": "5", "column": "12" }',
          '      },',
          '      {',
          '        "file": "b-1.ts",',
          '        "start": { "line": "5", "column": "20" },',
          '        "end": { "line": "5", "column": "12" }',
          '      },',
          '      {',
          '        "file": "b-1.ts",',
          '        "start": { "line": "8", "column": "0" },',
          '        "end": { "line": "10", "column": "12" }',
          '      },',
          '      {',
          '        "file": "c-1.ts",',
          '        "start": { "line": "5", "column": "10" },',
          '        "end": { "line": "5", "column": "12" }',
          '      }',
          '    ]',
          '  },',
          '  "2": "message-1",',
          '  "@2": {',
          '    "x-locations": [',
          '      {',
          '        "file": "a-2.ts",',
          '        "start": { "line": "5", "column": "10" },',
          '        "end": { "line": "5", "column": "12" }',
          '      },',
          '      {',
          '        "file": "b-2.ts",',
          '        "start": { "line": "5", "column": "10" },',
          '        "end": { "line": "5", "column": "12" }',
          '      },',
          '      {',
          '        "file": "b-2.ts",',
          '        "start": { "line": "5", "column": "20" },',
          '        "end": { "line": "5", "column": "12" }',
          '      },',
          '      {',
          '        "file": "b-2.ts",',
          '        "start": { "line": "8", "column": "0" },',
          '        "end": { "line": "10", "column": "12" }',
          '      },',
          '      {',
          '        "file": "c-2.ts",',
          '        "start": { "line": "5", "column": "10" },',
          '        "end": { "line": "5", "column": "12" }',
          '      }',
          '    ]',
          '  }',
          '}',
        ]);
      });
    });
  });
});
