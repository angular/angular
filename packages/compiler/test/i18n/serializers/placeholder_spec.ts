/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PlaceholderRegistry} from '../../../src/i18n/serializers/placeholder';

describe('PlaceholderRegistry', () => {
  let reg: PlaceholderRegistry;

  beforeEach(() => {
    reg = new PlaceholderRegistry();
  });

  describe('tag placeholder', () => {
    it('should generate names for well known tags', () => {
      expect(reg.getStartTagPlaceholderName('p', {}, false)).toEqual('START_PARAGRAPH');
      expect(reg.getCloseTagPlaceholderName('p')).toEqual('CLOSE_PARAGRAPH');
    });

    it('should generate names for custom tags', () => {
      expect(reg.getStartTagPlaceholderName('my-cmp', {}, false)).toEqual('START_TAG_MY-CMP');
      expect(reg.getCloseTagPlaceholderName('my-cmp')).toEqual('CLOSE_TAG_MY-CMP');
    });

    it('should generate the same name for the same tag', () => {
      expect(reg.getStartTagPlaceholderName('p', {}, false)).toEqual('START_PARAGRAPH');
      expect(reg.getStartTagPlaceholderName('p', {}, false)).toEqual('START_PARAGRAPH');
    });

    it('should be case sensitive for tag name', () => {
      expect(reg.getStartTagPlaceholderName('p', {}, false)).toEqual('START_PARAGRAPH');
      expect(reg.getStartTagPlaceholderName('P', {}, false)).toEqual('START_PARAGRAPH_1');
      expect(reg.getCloseTagPlaceholderName('p')).toEqual('CLOSE_PARAGRAPH');
      expect(reg.getCloseTagPlaceholderName('P')).toEqual('CLOSE_PARAGRAPH_1');
    });

    it('should generate the same name for the same tag with the same attributes', () => {
      expect(reg.getStartTagPlaceholderName('p', {foo: 'a', bar: 'b'}, false)).toEqual(
        'START_PARAGRAPH',
      );
      expect(reg.getStartTagPlaceholderName('p', {foo: 'a', bar: 'b'}, false)).toEqual(
        'START_PARAGRAPH',
      );
      expect(reg.getStartTagPlaceholderName('p', {bar: 'b', foo: 'a'}, false)).toEqual(
        'START_PARAGRAPH',
      );
    });

    it('should generate different names for the same tag with different attributes', () => {
      expect(reg.getStartTagPlaceholderName('p', {foo: 'a', bar: 'b'}, false)).toEqual(
        'START_PARAGRAPH',
      );
      expect(reg.getStartTagPlaceholderName('p', {foo: 'a'}, false)).toEqual('START_PARAGRAPH_1');
    });

    it('should be case sensitive for attributes', () => {
      expect(reg.getStartTagPlaceholderName('p', {foo: 'a', bar: 'b'}, false)).toEqual(
        'START_PARAGRAPH',
      );
      expect(reg.getStartTagPlaceholderName('p', {fOo: 'a', bar: 'b'}, false)).toEqual(
        'START_PARAGRAPH_1',
      );
      expect(reg.getStartTagPlaceholderName('p', {fOo: 'a', bAr: 'b'}, false)).toEqual(
        'START_PARAGRAPH_2',
      );
    });

    it('should support void tags', () => {
      expect(reg.getStartTagPlaceholderName('p', {}, true)).toEqual('PARAGRAPH');
      expect(reg.getStartTagPlaceholderName('p', {}, true)).toEqual('PARAGRAPH');
      expect(reg.getStartTagPlaceholderName('p', {other: 'true'}, true)).toEqual('PARAGRAPH_1');
    });
  });

  describe('arbitrary placeholders', () => {
    it('should generate the same name given the same name and content', () => {
      expect(reg.getPlaceholderName('name', 'content')).toEqual('NAME');
      expect(reg.getPlaceholderName('name', 'content')).toEqual('NAME');
    });

    it('should generate a different name given different content', () => {
      expect(reg.getPlaceholderName('name', 'content1')).toEqual('NAME');
      expect(reg.getPlaceholderName('name', 'content2')).toEqual('NAME_1');
      expect(reg.getPlaceholderName('name', 'content3')).toEqual('NAME_2');
    });

    it('should generate a different name given different names', () => {
      expect(reg.getPlaceholderName('name1', 'content')).toEqual('NAME1');
      expect(reg.getPlaceholderName('name2', 'content')).toEqual('NAME2');
    });
  });

  describe('block placeholders', () => {
    it('should generate placeholders for a plain block', () => {
      expect(reg.getStartBlockPlaceholderName('if', [])).toBe('START_BLOCK_IF');
      expect(reg.getCloseBlockPlaceholderName('if')).toBe('CLOSE_BLOCK_IF');
    });

    it('should generate placeholders for a block with spaces in its name', () => {
      expect(reg.getStartBlockPlaceholderName('else if', [])).toBe('START_BLOCK_ELSE_IF');
      expect(reg.getCloseBlockPlaceholderName('else if')).toBe('CLOSE_BLOCK_ELSE_IF');
    });
  });
});
