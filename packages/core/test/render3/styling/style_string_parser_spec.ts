/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {hyphenate, parseStyleString, stripUnnecessaryQuotes} from '../../../src/render3/styling/style_string_parser';

describe('style parsing', () => {
  it('should parse empty or blank strings', () => {
    const result1 = parseStyleString('');
    expect(result1).toEqual([null]);

    const result2 = parseStyleString('    ');
    expect(result2).toEqual([null]);
  });

  it('should parse a string into a key/value map', () => {
    const result = parseStyleString('width:100px;height:200px;opacity:0');
    expect(result).toEqual([null, 'width', '100px', 'height', '200px', 'opacity', '0']);
  });

  it('should trim values and properties', () => {
    const result = parseStyleString('width :333px ; height:666px    ; opacity: 0.5;');
    expect(result).toEqual([null, 'width', '333px', 'height', '666px', 'opacity', '0.5']);
  });

  it('should chomp out start/end quotes', () => {
    const result = parseStyleString(
        'content: "foo"; opacity: \'0.5\'; font-family: "Verdana", Helvetica, "sans-serif"');
    expect(result).toEqual([
      null, 'content', 'foo', 'opacity', '0.5', 'font-family', '"Verdana", Helvetica, "sans-serif"'
    ]);
  });

  it('should not mess up with quoted strings that contain [:;] values', () => {
    const result = parseStyleString('content: "foo; man: guy"; width: 100px');
    expect(result).toEqual([null, 'content', 'foo; man: guy', 'width', '100px']);
  });

  it('should not mess up with quoted strings that contain inner quote values', () => {
    const quoteStr = '"one \'two\' three \"four\" five"';
    const result = parseStyleString(`content: ${quoteStr}; width: 123px`);
    expect(result).toEqual([null, 'content', quoteStr, 'width', '123px']);
  });

  it('should respect parenthesis that are placed within a style', () => {
    const result = parseStyleString('background-image: url("foo.jpg")');
    expect(result).toEqual([null, 'background-image', 'url("foo.jpg")']);
  });

  it('should respect multi-level parenthesis that contain special [:;] characters', () => {
    const result = parseStyleString('color: rgba(calc(50 * 4), var(--cool), :5;); height: 100px;');
    expect(result).toEqual(
        [null, 'color', 'rgba(calc(50 * 4), var(--cool), :5;)', 'height', '100px']);
  });

  it('should hyphenate style properties from camel case', () => {
    const result = parseStyleString('borderWidth: 200px');
    expect(result).toEqual([null, 'border-width', '200px']);
  });

  describe('quote chomping', () => {
    it('should remove the start and end quotes', () => {
      expect(stripUnnecessaryQuotes('\'foo bar\'')).toEqual('foo bar');
      expect(stripUnnecessaryQuotes('"foo bar"')).toEqual('foo bar');
    });

    it('should not remove quotes if the quotes are not at the start and end', () => {
      expect(stripUnnecessaryQuotes('foo bar')).toEqual('foo bar');
      expect(stripUnnecessaryQuotes('   foo bar   ')).toEqual('   foo bar   ');
      expect(stripUnnecessaryQuotes('\'foo\' bar')).toEqual('\'foo\' bar');
      expect(stripUnnecessaryQuotes('foo "bar"')).toEqual('foo "bar"');
    });

    it('should not remove quotes if there are inner quotes', () => {
      const str = '"Verdana", "Helvetica"';
      expect(stripUnnecessaryQuotes(str)).toEqual(str);
    });
  });

  describe('camelCasing => hyphenation', () => {
    it('should convert a camel-cased value to a hyphenated value', () => {
      expect(hyphenate('fooBar')).toEqual('foo-bar');
      expect(hyphenate('fooBarMan')).toEqual('foo-bar-man');
      expect(hyphenate('-fooBar-man')).toEqual('-foo-bar-man');
    });

    it('should make everything lowercase',
       () => { expect(hyphenate('-WebkitAnimation')).toEqual('-webkit-animation'); });
  });
});
