/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {parseMessage, parseMetadata, splitBlock} from '../../src/utils/messages';
import {makeTemplateObject} from '../../src/utils/translations';

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

    it('should compute the translation key, inferring placeholder names if not given', () => {
      const message = parseMessage(makeTemplateObject(['a', 'b', 'c'], ['a', 'b', 'c']), [1, 2]);
      expect(message.messageId).toEqual('8107531564991075946');
    });

    it('should compute the translation key, ignoring escaped placeholder names', () => {
      const message = parseMessage(
          makeTemplateObject(['a', ':one:b', ':two:c'], ['a', '\\:one:b', '\\:two:c']), [1, 2]);
      expect(message.messageId).toEqual('2623373088949454037');
    });

    it('should compute the translation key, handling empty raw values', () => {
      const message =
          parseMessage(makeTemplateObject(['a', ':one:b', ':two:c'], ['', '', '']), [1, 2]);
      expect(message.messageId).toEqual('8865273085679272414');
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

    it('should handle escaped block markers', () => {
      expect(splitBlock(':part of the message:abc def', '\\:part of the message:abc def')).toEqual({
        text: ':part of the message:abc def'
      });
    });

    it('should handle the empty raw part', () => {
      expect(splitBlock(':block info:abc def', '')).toEqual({text: 'abc def', block: 'block info'});
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
