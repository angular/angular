/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {findEndOfBlock, makeTemplateObject, parseMessage, parseMetadata, splitBlock} from '..';

describe('messages utils', () => {
  describe('parseMessage', () => {
    it('should use the message-id parsed from the metadata if available', () => {
      const message = parseMessage(
          makeTemplateObject(
              [':@@custom-message-id:a', ':one:b', ':two:c'],
              [':@@custom-message-id:a', ':one:b', ':two:c']),
          [1, 2]);
      expect(message.messageId).toEqual('custom-message-id');
    });

    it('should compute the translation key if no metadata', () => {
      const message = parseMessage(
          makeTemplateObject(['a', ':one:b', ':two:c'], ['a', ':one:b', ':two:c']), [1, 2]);
      expect(message.messageId).toEqual('8865273085679272414');
    });

    it('should compute the translation key if no id in the metadata', () => {
      const message = parseMessage(
          makeTemplateObject(
              [':description:a', ':one:b', ':two:c'], [':description:a', ':one:b', ':two:c']),
          [1, 2]);
      expect(message.messageId).toEqual('8865273085679272414');
    });

    it('should compute a different id if the meaning changes', () => {
      const message1 = parseMessage(makeTemplateObject(['abc'], ['abc']), []);
      const message2 = parseMessage(makeTemplateObject([':meaning1|:abc'], [':meaning1|:abc']), []);
      const message3 = parseMessage(makeTemplateObject([':meaning2|:abc'], [':meaning2|:abc']), []);
      expect(message1.messageId).not.toEqual(message2.messageId);
      expect(message2.messageId).not.toEqual(message3.messageId);
      expect(message3.messageId).not.toEqual(message1.messageId);
    });

    it('should infer placeholder names if not given', () => {
      const parts1 = ['a', 'b', 'c'];
      const message1 = parseMessage(makeTemplateObject(parts1, parts1), [1, 2]);
      expect(message1.messageId).toEqual('8107531564991075946');

      const parts2 = ['a', ':custom1:b', ':custom2:c'];
      const message2 = parseMessage(makeTemplateObject(parts2, parts2), [1, 2]);
      expect(message2.messageId).toEqual('1822117095464505589');

      // Note that the placeholder names are part of the message so affect the message id.
      expect(message1.messageId).not.toEqual(message2.messageId);
      expect(message1.messageString).not.toEqual(message2.messageString);
    });

    it('should ignore placeholder blocks whose markers have been escaped', () => {
      const message = parseMessage(
          makeTemplateObject(['a', ':one:b', ':two:c'], ['a', '\\:one:b', '\\:two:c']), [1, 2]);
      expect(message.messageId).toEqual('2623373088949454037');
    });

    it('should handle raw values that are empty (from synthesized AST)', () => {
      const message =
          parseMessage(makeTemplateObject(['a', ':one:b', ':two:c'], ['', '', '']), [1, 2]);
      expect(message.messageId).toEqual('8865273085679272414');
    });

    it('should extract the meaning, description and placeholder names', () => {
      const message1 = parseMessage(makeTemplateObject(['abc'], ['abc']), []);
      expect(message1.messageParts).toEqual(['abc']);
      expect(message1.meaning).toEqual('');
      expect(message1.description).toEqual('');
      expect(message1.placeholderNames).toEqual([]);

      const message2 = parseMessage(
          makeTemplateObject([':meaning|description:abc'], [':meaning|description:abc']), []);
      expect(message2.messageParts).toEqual(['abc']);
      expect(message2.meaning).toEqual('meaning');
      expect(message2.description).toEqual('description');
      expect(message2.placeholderNames).toEqual([]);

      const message3 = parseMessage(
          makeTemplateObject(['a', ':custom:b', 'c'], ['a', ':custom:b', 'c']), [0, 1]);
      expect(message3.messageParts).toEqual(['a', 'b', 'c']);
      expect(message3.meaning).toEqual('');
      expect(message3.description).toEqual('');
      expect(message3.placeholderNames).toEqual(['custom', 'PH_1']);
    });

    it('should build a map of named placeholders to expressions', () => {
      const message = parseMessage(
          makeTemplateObject(['a', ':one:b', ':two:c'], ['a', ':one:b', ':two:c']), [1, 2]);
      expect(message.substitutions).toEqual({one: 1, two: 2});
    });

    it('should build a map of implied placeholders to expressions', () => {
      const message = parseMessage(makeTemplateObject(['a', 'b', 'c'], ['a', 'b', 'c']), [1, 2]);
      expect(message.substitutions).toEqual({PH: 1, PH_1: 2});
    });

  });

  describe('splitBlock()', () => {
    it('should return just the text if there is no block',
       () => { expect(splitBlock('abc def', 'abc def')).toEqual({text: 'abc def'}); });

    it('should return just the text and block if there is one', () => {
      expect(splitBlock(':block info:abc def', ':block info:abc def'))
          .toEqual({text: 'abc def', block: 'block info'});
    });

    it('should handle an empty block if there is one', () => {
      expect(splitBlock('::abc def', '::abc def')).toEqual({text: 'abc def', block: ''});
    });

    it('should error on an unterminated block', () => {
      expect(() => splitBlock(':abc def', ':abc def'))
          .toThrowError('Unterminated $localize metadata block in ":abc def".');
    });

    it('should handle escaped block markers', () => {
      expect(splitBlock(':part of the message:abc def', '\\:part of the message:abc def')).toEqual({
        text: ':part of the message:abc def'
      });
      expect(splitBlock(
                 ':block with escaped : in it:abc def', ':block with escaped \\: in it:abc def'))
          .toEqual({text: 'abc def', block: 'block with escaped : in it'});
    });

    it('should handle the empty raw part', () => {
      expect(splitBlock(':block info:abc def', '')).toEqual({text: 'abc def', block: 'block info'});
    });
  });

  describe('findEndOfBlock()', () => {
    it('should throw error if there is no end of block marker', () => {
      expect(() => findEndOfBlock(':some text', ':some text'))
          .toThrowError('Unterminated $localize metadata block in ":some text".');
      expect(() => findEndOfBlock(':escaped colon:', ':escaped colon\\:'))
          .toThrowError('Unterminated $localize metadata block in ":escaped colon\\:".');
    });

    it('should return index of the end of block marker', () => {
      expect(findEndOfBlock(':block:', ':block:')).toEqual(6);
      expect(findEndOfBlock(':block::', ':block::')).toEqual(6);
      expect(findEndOfBlock(':block:some text', ':block:some text')).toEqual(6);
      expect(findEndOfBlock(':block:some text:more text', ':block:some text:more text')).toEqual(6);
      expect(findEndOfBlock('::::', ':\\:\\::')).toEqual(3);
      expect(findEndOfBlock(':block::', ':block\\::')).toEqual(7);
      expect(findEndOfBlock(':block:more:some text', ':block\\:more:some text')).toEqual(11);
      expect(findEndOfBlock(':block:more:and-more:some text', ':block\\:more\\:and-more:some text'))
          .toEqual(20);
    });
  });

  describe('parseMetadata()', () => {
    it('should return just the text if there is no block', () => {
      expect(parseMetadata('abc def', 'abc def'))
          .toEqual({text: 'abc def', meaning: undefined, description: undefined, id: undefined});
    });

    it('should extract the metadata if provided', () => {
      expect(parseMetadata(':description:abc def', ':description:abc def'))
          .toEqual(
              {text: 'abc def', description: 'description', meaning: undefined, id: undefined});
      expect(parseMetadata(':meaning|:abc def', ':meaning|:abc def'))
          .toEqual({text: 'abc def', description: undefined, meaning: 'meaning', id: undefined});
      expect(parseMetadata(':@@message-id:abc def', ':@@message-id:abc def'))
          .toEqual({text: 'abc def', description: undefined, meaning: undefined, id: 'message-id'});
      expect(parseMetadata(':meaning|description:abc def', ':meaning|description:abc def'))
          .toEqual(
              {text: 'abc def', description: 'description', meaning: 'meaning', id: undefined});
      expect(parseMetadata(':description@@message-id:abc def', ':description@@message-id:abc def'))
          .toEqual(
              {text: 'abc def', description: 'description', meaning: undefined, id: 'message-id'});
      expect(parseMetadata(':meaning|@@message-id:abc def', ':meaning|@@message-id:abc def'))
          .toEqual({text: 'abc def', description: undefined, meaning: 'meaning', id: 'message-id'});
    });

    it('should handle an empty block if there is one', () => {
      expect(parseMetadata('::abc def', '::abc def'))
          .toEqual({text: 'abc def', meaning: undefined, description: undefined, id: undefined});
    });

    it('should handle escaped block markers', () => {
      expect(parseMetadata(':part of the message:abc def', '\\:part of the message:abc def'))
          .toEqual({
            text: ':part of the message:abc def',
            meaning: undefined,
            description: undefined,
            id: undefined
          });
    });

    it('should handle the empty raw part', () => {
      expect(parseMetadata(':description:abc def', ''))
          .toEqual(
              {text: 'abc def', meaning: undefined, description: 'description', id: undefined});
    });
  });
});
