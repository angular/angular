/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {parseMessage} from '../../src/utils/messages';
import {makeTemplateObject} from '../../src/utils/translations';

describe('messages utils', () => {
  describe('parseMessage', () => {
    it('should compute the translation key', () => {
      const message = parseMessage(
          makeTemplateObject(['a', ':one:b', ':two:c'], ['a', ':one:b', ':two:c']), [1, 2]);
      expect(message.messageId).toEqual('a{$one}b{$two}c');
    });

    it('should compute the translation key, inferring placeholder names if not given', () => {
      const message = parseMessage(makeTemplateObject(['a', 'b', 'c'], ['a', 'b', 'c']), [1, 2]);
      expect(message.messageId).toEqual('a{$ph_1}b{$ph_2}c');
    });

    it('should compute the translation key, ignoring escaped placeholder names', () => {
      const message = parseMessage(
          makeTemplateObject(['a', ':one:b', ':two:c'], ['a', '\\:one:b', '\\:two:c']), [1, 2]);
      expect(message.messageId).toEqual('a{$ph_1}:one:b{$ph_2}:two:c');
    });

    it('should compute the translation key, handling empty raw values', () => {
      const message =
          parseMessage(makeTemplateObject(['a', ':one:b', ':two:c'], ['', '', '']), [1, 2]);
      expect(message.messageId).toEqual('a{$one}b{$two}c');
    });

    it('should build a map of named placeholders to expressions', () => {
      const message = parseMessage(
          makeTemplateObject(['a', ':one:b', ':two:c'], ['a', ':one:b', ':two:c']), [1, 2]);
      expect(message.substitutions).toEqual({one: 1, two: 2});
    });

    it('should build a map of implied placeholders to expressions', () => {
      const message = parseMessage(makeTemplateObject(['a', 'b', 'c'], ['a', 'b', 'c']), [1, 2]);
      expect(message.substitutions).toEqual({ph_1: 1, ph_2: 2});
    });
  });
});
