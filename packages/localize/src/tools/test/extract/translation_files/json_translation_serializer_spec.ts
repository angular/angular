/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {JsonTranslationSerializer} from '../../../src/extract/translation_files/json_translation_serializer';
import {ParsedMessage} from '../../../src/utils';
import {mockMessage} from './mock_message';

describe('JsonTranslationSerializer', () => {
  it('should convert a set of parsed messages into a JSON string', () => {
    const messages: ParsedMessage[] = [
      mockMessage('12345', ['a', 'b', 'c'], ['PH', 'PH_1'], 'some meaning'),
      mockMessage(
          '67890', ['a', '', 'c'], ['START_TAG_SPAN', 'CLOSE_TAG_SPAN'], '', 'some description'),
      mockMessage('13579', ['', 'b', ''], ['START_BOLD_TEXT', 'CLOSE_BOLD_TEXT']),
      mockMessage('24680', ['a'], [], 'meaning', 'and description'),
      mockMessage('80808', ['multi\nlines'], []),
    ];
    const serializer = new JsonTranslationSerializer();
    const output = serializer.renderFile(messages);
    expect(output).toEqual(`{
  "locale": "en",
  "translations": {
    "12345": "a{$PH}b{$PH_1}c",
    "13579": "{$START_BOLD_TEXT}b{$CLOSE_BOLD_TEXT}",
    "24680": "a",
    "67890": "a{$START_TAG_SPAN}{$CLOSE_TAG_SPAN}c",
    "80808": "multi\\nlines"
  }
}`);
  });
});
