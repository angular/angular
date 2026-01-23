/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵParsedMessage} from '../../../../index';

import {SimpleJsonTranslationSerializer} from '../../../src/extract/translation_files/json_translation_serializer';

import {mockMessage} from './mock_message';

describe('JsonTranslationSerializer', () => {
  describe('renderFile()', () => {
    it('should convert a set of parsed messages into a JSON string', () => {
      const messages: ɵParsedMessage[] = [
        mockMessage('12345', ['a', 'b', 'c'], ['PH', 'PH_1'], {meaning: 'some meaning'}),
        mockMessage('54321', ['a', 'b', 'c'], ['PH', 'PH_1'], {
          customId: 'someId',
        }),
        mockMessage('67890', ['a', '', 'c'], ['START_TAG_SPAN', 'CLOSE_TAG_SPAN'], {
          description: 'some description',
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
      const serializer = new SimpleJsonTranslationSerializer('xx');
      const output = serializer.serialize(messages);
      expect(output).toEqual(
        [
          `{`,
          `  "locale": "xx",`,
          `  "translations": {`,
          `    "12345": "a{$PH}b{$PH_1}c",`,
          `    "13579": "{$START_BOLD_TEXT}b{$CLOSE_BOLD_TEXT}",`,
          `    "24680": "a",`,
          `    "67890": "a{$START_TAG_SPAN}{$CLOSE_TAG_SPAN}c",`,
          `    "80808": "multi\\nlines",`,
          `    "90000": "<escape{$double-quotes-\\"}me>",`,
          `    "100000": "pre-ICU {VAR_SELECT, select, a {a} b {{INTERPOLATION}} c {pre {INTERPOLATION_1} post}} post-ICU",`,
          `    "100001": "{VAR_PLURAL, plural, one {{START_BOLD_TEXT}something bold{CLOSE_BOLD_TEXT}} other {pre {START_TAG_SPAN}middle{CLOSE_TAG_SPAN} post}}",`,
          `    "someId": "a{$PH}b{$PH_1}c"`,
          `  }`,
          `}`,
        ].join('\n'),
      );
    });
  });
});
