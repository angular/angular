/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  hyphenate,
  parse as parseStyle,
} from '../../src/template/pipeline/src/phases/parse_extracted_styles';

describe('style parsing', () => {
  it('should parse empty or blank strings', () => {
    const result1 = parseStyle('');
    expect(result1).toEqual([]);

    const result2 = parseStyle('    ');
    expect(result2).toEqual([]);
  });

  it('should parse a string into a key/value map', () => {
    const result = parseStyle('width:100px;height:200px;opacity:0');
    expect(result).toEqual(['width', '100px', 'height', '200px', 'opacity', '0']);
  });

  it('should allow empty values', () => {
    const result = parseStyle('width:;height:   ;');
    expect(result).toEqual(['width', '', 'height', '']);
  });

  it('should trim values and properties', () => {
    const result = parseStyle('width :333px ; height:666px    ; opacity: 0.5;');
    expect(result).toEqual(['width', '333px', 'height', '666px', 'opacity', '0.5']);
  });

  it('should not mess up with quoted strings that contain [:;] values', () => {
    const result = parseStyle('content: "foo; man: guy"; width: 100px');
    expect(result).toEqual(['content', '"foo; man: guy"', 'width', '100px']);
  });

  it('should not mess up with quoted strings that contain inner quote values', () => {
    const quoteStr = '"one \'two\' three "four" five"';
    const result = parseStyle(`content: ${quoteStr}; width: 123px`);
    expect(result).toEqual(['content', quoteStr, 'width', '123px']);
  });

  it('should respect parenthesis that are placed within a style', () => {
    const result = parseStyle('background-image: url("foo.jpg")');
    expect(result).toEqual(['background-image', 'url("foo.jpg")']);
  });

  it('should respect multi-level parenthesis that contain special [:;] characters', () => {
    const result = parseStyle('color: rgba(calc(50 * 4), var(--cool), :5;); height: 100px;');
    expect(result).toEqual(['color', 'rgba(calc(50 * 4), var(--cool), :5;)', 'height', '100px']);
  });

  it('should hyphenate style properties from camel case', () => {
    const result = parseStyle('borderWidth: 200px');
    expect(result).toEqual(['border-width', '200px']);
  });

  describe('should not remove quotes', () => {
    it('from string data types', () => {
      const result = parseStyle('content: "foo"');
      expect(result).toEqual(['content', '"foo"']);
    });

    it('that changes the value context from invalid to valid', () => {
      const result = parseStyle('width: "1px"');
      expect(result).toEqual(['width', '"1px"']);
    });
  });

  describe('camelCasing => hyphenation', () => {
    it('should convert a camel-cased value to a hyphenated value', () => {
      expect(hyphenate('fooBar')).toEqual('foo-bar');
      expect(hyphenate('fooBarMan')).toEqual('foo-bar-man');
      expect(hyphenate('-fooBar-man')).toEqual('-foo-bar-man');
    });

    it('should make everything lowercase', () => {
      expect(hyphenate('-WebkitAnimation')).toEqual('-webkit-animation');
    });
  });
});
