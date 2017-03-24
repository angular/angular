/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getHtmlTagDefinition} from '../../src/ml_parser/html_tags';
import {InterpolationConfig} from '../../src/ml_parser/interpolation_config';
import * as lex from '../../src/ml_parser/lexer';
import {ParseLocation, ParseSourceFile, ParseSourceSpan} from '../../src/parse_util';

export function main() {
  describe('HtmlLexer', () => {
    describe('line/column numbers', () => {
      it('should work without newlines', () => {
        expect(tokenizeAndHumanizeLineColumn('<t>a</t>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '0:0'],
          [lex.TokenType.TAG_OPEN_END, '0:2'],
          [lex.TokenType.TEXT, '0:3'],
          [lex.TokenType.TAG_CLOSE, '0:4'],
          [lex.TokenType.EOF, '0:8'],
        ]);
      });

      it('should work with one newline', () => {
        expect(tokenizeAndHumanizeLineColumn('<t>\na</t>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '0:0'],
          [lex.TokenType.TAG_OPEN_END, '0:2'],
          [lex.TokenType.TEXT, '0:3'],
          [lex.TokenType.TAG_CLOSE, '1:1'],
          [lex.TokenType.EOF, '1:5'],
        ]);
      });

      it('should work with multiple newlines', () => {
        expect(tokenizeAndHumanizeLineColumn('<t\n>\na</t>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '0:0'],
          [lex.TokenType.TAG_OPEN_END, '1:0'],
          [lex.TokenType.TEXT, '1:1'],
          [lex.TokenType.TAG_CLOSE, '2:1'],
          [lex.TokenType.EOF, '2:5'],
        ]);
      });

      it('should work with CR and LF', () => {
        expect(tokenizeAndHumanizeLineColumn('<t\n>\r\na\r</t>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '0:0'],
          [lex.TokenType.TAG_OPEN_END, '1:0'],
          [lex.TokenType.TEXT, '1:1'],
          [lex.TokenType.TAG_CLOSE, '2:1'],
          [lex.TokenType.EOF, '2:5'],
        ]);
      });
    });

    describe('comments', () => {
      it('should parse comments', () => {
        expect(tokenizeAndHumanizeParts('<!--t\ne\rs\r\nt-->')).toEqual([
          [lex.TokenType.COMMENT_START],
          [lex.TokenType.RAW_TEXT, 't\ne\ns\nt'],
          [lex.TokenType.COMMENT_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans('<!--t\ne\rs\r\nt-->')).toEqual([
          [lex.TokenType.COMMENT_START, '<!--'],
          [lex.TokenType.RAW_TEXT, 't\ne\rs\r\nt'],
          [lex.TokenType.COMMENT_END, '-->'],
          [lex.TokenType.EOF, ''],
        ]);
      });

      it('should report <!- without -', () => {
        expect(tokenizeAndHumanizeErrors('<!-a')).toEqual([
          [lex.TokenType.COMMENT_START, 'Unexpected character "a"', '0:3']
        ]);
      });

      it('should report missing end comment', () => {
        expect(tokenizeAndHumanizeErrors('<!--')).toEqual([
          [lex.TokenType.RAW_TEXT, 'Unexpected character "EOF"', '0:4']
        ]);
      });

      it('should accept comments finishing by too many dashes (even number)', () => {
        expect(tokenizeAndHumanizeSourceSpans('<!-- test ---->')).toEqual([
          [lex.TokenType.COMMENT_START, '<!--'],
          [lex.TokenType.RAW_TEXT, ' test --'],
          [lex.TokenType.COMMENT_END, '-->'],
          [lex.TokenType.EOF, ''],
        ]);
      });

      it('should accept comments finishing by too many dashes (odd number)', () => {
        expect(tokenizeAndHumanizeSourceSpans('<!-- test --->')).toEqual([
          [lex.TokenType.COMMENT_START, '<!--'],
          [lex.TokenType.RAW_TEXT, ' test -'],
          [lex.TokenType.COMMENT_END, '-->'],
          [lex.TokenType.EOF, ''],
        ]);
      });
    });

    describe('doctype', () => {
      it('should parse doctypes', () => {
        expect(tokenizeAndHumanizeParts('<!doctype html>')).toEqual([
          [lex.TokenType.DOC_TYPE, 'doctype html'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans('<!doctype html>')).toEqual([
          [lex.TokenType.DOC_TYPE, '<!doctype html>'],
          [lex.TokenType.EOF, ''],
        ]);
      });

      it('should report missing end doctype', () => {
        expect(tokenizeAndHumanizeErrors('<!')).toEqual([
          [lex.TokenType.DOC_TYPE, 'Unexpected character "EOF"', '0:2']
        ]);
      });
    });

    describe('CDATA', () => {
      it('should parse CDATA', () => {
        expect(tokenizeAndHumanizeParts('<![CDATA[t\ne\rs\r\nt]]>')).toEqual([
          [lex.TokenType.CDATA_START],
          [lex.TokenType.RAW_TEXT, 't\ne\ns\nt'],
          [lex.TokenType.CDATA_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans('<![CDATA[t\ne\rs\r\nt]]>')).toEqual([
          [lex.TokenType.CDATA_START, '<![CDATA['],
          [lex.TokenType.RAW_TEXT, 't\ne\rs\r\nt'],
          [lex.TokenType.CDATA_END, ']]>'],
          [lex.TokenType.EOF, ''],
        ]);
      });

      it('should report <![ without CDATA[', () => {
        expect(tokenizeAndHumanizeErrors('<![a')).toEqual([
          [lex.TokenType.CDATA_START, 'Unexpected character "a"', '0:3']
        ]);
      });

      it('should report missing end cdata', () => {
        expect(tokenizeAndHumanizeErrors('<![CDATA[')).toEqual([
          [lex.TokenType.RAW_TEXT, 'Unexpected character "EOF"', '0:9']
        ]);
      });
    });

    describe('open tags', () => {
      it('should parse open tags without prefix', () => {
        expect(tokenizeAndHumanizeParts('<test>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 'test'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse namespace prefix', () => {
        expect(tokenizeAndHumanizeParts('<ns1:test>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, 'ns1', 'test'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse void tags', () => {
        expect(tokenizeAndHumanizeParts('<test/>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 'test'],
          [lex.TokenType.TAG_OPEN_END_VOID],
          [lex.TokenType.EOF],
        ]);
      });

      it('should allow whitespace after the tag name', () => {
        expect(tokenizeAndHumanizeParts('<test >')).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 'test'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans('<test>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '<test'],
          [lex.TokenType.TAG_OPEN_END, '>'],
          [lex.TokenType.EOF, ''],
        ]);
      });

    });

    describe('attributes', () => {
      it('should parse attributes without prefix', () => {
        expect(tokenizeAndHumanizeParts('<t a>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 't'],
          [lex.TokenType.ATTR_NAME, null, 'a'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse attributes with interpolation', () => {
        expect(tokenizeAndHumanizeParts('<t a="{{v}}" b="s{{m}}e" c="s{{m//c}}e">')).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 't'],
          [lex.TokenType.ATTR_NAME, null, 'a'],
          [lex.TokenType.ATTR_VALUE, '{{v}}'],
          [lex.TokenType.ATTR_NAME, null, 'b'],
          [lex.TokenType.ATTR_VALUE, 's{{m}}e'],
          [lex.TokenType.ATTR_NAME, null, 'c'],
          [lex.TokenType.ATTR_VALUE, 's{{m//c}}e'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse attributes with prefix', () => {
        expect(tokenizeAndHumanizeParts('<t ns1:a>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 't'],
          [lex.TokenType.ATTR_NAME, 'ns1', 'a'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse attributes whose prefix is not valid', () => {
        expect(tokenizeAndHumanizeParts('<t (ns1:a)>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 't'],
          [lex.TokenType.ATTR_NAME, null, '(ns1:a)'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse attributes with single quote value', () => {
        expect(tokenizeAndHumanizeParts('<t a=\'b\'>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 't'],
          [lex.TokenType.ATTR_NAME, null, 'a'],
          [lex.TokenType.ATTR_VALUE, 'b'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse attributes with double quote value', () => {
        expect(tokenizeAndHumanizeParts('<t a="b">')).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 't'],
          [lex.TokenType.ATTR_NAME, null, 'a'],
          [lex.TokenType.ATTR_VALUE, 'b'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse attributes with unquoted value', () => {
        expect(tokenizeAndHumanizeParts('<t a=b>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 't'],
          [lex.TokenType.ATTR_NAME, null, 'a'],
          [lex.TokenType.ATTR_VALUE, 'b'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should allow whitespace', () => {
        expect(tokenizeAndHumanizeParts('<t a = b >')).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 't'],
          [lex.TokenType.ATTR_NAME, null, 'a'],
          [lex.TokenType.ATTR_VALUE, 'b'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse attributes with entities in values', () => {
        expect(tokenizeAndHumanizeParts('<t a="&#65;&#x41;">')).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 't'],
          [lex.TokenType.ATTR_NAME, null, 'a'],
          [lex.TokenType.ATTR_VALUE, 'AA'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should not decode entities without trailing ";"', () => {
        expect(tokenizeAndHumanizeParts('<t a="&amp" b="c&&d">')).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 't'],
          [lex.TokenType.ATTR_NAME, null, 'a'],
          [lex.TokenType.ATTR_VALUE, '&amp'],
          [lex.TokenType.ATTR_NAME, null, 'b'],
          [lex.TokenType.ATTR_VALUE, 'c&&d'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse attributes with "&" in values', () => {
        expect(tokenizeAndHumanizeParts('<t a="b && c &">')).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 't'],
          [lex.TokenType.ATTR_NAME, null, 'a'],
          [lex.TokenType.ATTR_VALUE, 'b && c &'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse values with CR and LF', () => {
        expect(tokenizeAndHumanizeParts('<t a=\'t\ne\rs\r\nt\'>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 't'],
          [lex.TokenType.ATTR_NAME, null, 'a'],
          [lex.TokenType.ATTR_VALUE, 't\ne\ns\nt'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans('<t a=b>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '<t'],
          [lex.TokenType.ATTR_NAME, 'a'],
          [lex.TokenType.ATTR_VALUE, 'b'],
          [lex.TokenType.TAG_OPEN_END, '>'],
          [lex.TokenType.EOF, ''],
        ]);
      });

    });

    describe('closing tags', () => {
      it('should parse closing tags without prefix', () => {
        expect(tokenizeAndHumanizeParts('</test>')).toEqual([
          [lex.TokenType.TAG_CLOSE, null, 'test'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse closing tags with prefix', () => {
        expect(tokenizeAndHumanizeParts('</ns1:test>')).toEqual([
          [lex.TokenType.TAG_CLOSE, 'ns1', 'test'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should allow whitespace', () => {
        expect(tokenizeAndHumanizeParts('</ test >')).toEqual([
          [lex.TokenType.TAG_CLOSE, null, 'test'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans('</test>')).toEqual([
          [lex.TokenType.TAG_CLOSE, '</test>'],
          [lex.TokenType.EOF, ''],
        ]);
      });

      it('should report missing name after </', () => {
        expect(tokenizeAndHumanizeErrors('</')).toEqual([
          [lex.TokenType.TAG_CLOSE, 'Unexpected character "EOF"', '0:2']
        ]);
      });

      it('should report missing >', () => {
        expect(tokenizeAndHumanizeErrors('</test')).toEqual([
          [lex.TokenType.TAG_CLOSE, 'Unexpected character "EOF"', '0:6']
        ]);
      });
    });

    describe('entities', () => {
      it('should parse named entities', () => {
        expect(tokenizeAndHumanizeParts('a&amp;b')).toEqual([
          [lex.TokenType.TEXT, 'a&b'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse hexadecimal entities', () => {
        expect(tokenizeAndHumanizeParts('&#x41;&#X41;')).toEqual([
          [lex.TokenType.TEXT, 'AA'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse decimal entities', () => {
        expect(tokenizeAndHumanizeParts('&#65;')).toEqual([
          [lex.TokenType.TEXT, 'A'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans('a&amp;b')).toEqual([
          [lex.TokenType.TEXT, 'a&amp;b'],
          [lex.TokenType.EOF, ''],
        ]);
      });

      it('should report malformed/unknown entities', () => {
        expect(tokenizeAndHumanizeErrors('&tbo;')).toEqual([[
          lex.TokenType.TEXT,
          'Unknown entity "tbo" - use the "&#<decimal>;" or  "&#x<hex>;" syntax', '0:0'
        ]]);
        expect(tokenizeAndHumanizeErrors('&#asdf;')).toEqual([
          [lex.TokenType.TEXT, 'Unexpected character "s"', '0:3']
        ]);
        expect(tokenizeAndHumanizeErrors('&#xasdf;')).toEqual([
          [lex.TokenType.TEXT, 'Unexpected character "s"', '0:4']
        ]);

        expect(tokenizeAndHumanizeErrors('&#xABC')).toEqual([
          [lex.TokenType.TEXT, 'Unexpected character "EOF"', '0:6']
        ]);
      });
    });

    describe('regular text', () => {
      it('should parse text', () => {
        expect(tokenizeAndHumanizeParts('a')).toEqual([
          [lex.TokenType.TEXT, 'a'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse interpolation', () => {
        expect(tokenizeAndHumanizeParts('{{ a }}b{{ c // comment }}')).toEqual([
          [lex.TokenType.TEXT, '{{ a }}b{{ c // comment }}'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse interpolation with custom markers', () => {
        expect(tokenizeAndHumanizeParts('{% a %}', null !, {start: '{%', end: '%}'})).toEqual([
          [lex.TokenType.TEXT, '{% a %}'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should handle CR & LF', () => {
        expect(tokenizeAndHumanizeParts('t\ne\rs\r\nt')).toEqual([
          [lex.TokenType.TEXT, 't\ne\ns\nt'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse entities', () => {
        expect(tokenizeAndHumanizeParts('a&amp;b')).toEqual([
          [lex.TokenType.TEXT, 'a&b'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse text starting with "&"', () => {
        expect(tokenizeAndHumanizeParts('a && b &')).toEqual([
          [lex.TokenType.TEXT, 'a && b &'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans('a')).toEqual([
          [lex.TokenType.TEXT, 'a'],
          [lex.TokenType.EOF, ''],
        ]);
      });

      it('should allow "<" in text nodes', () => {
        expect(tokenizeAndHumanizeParts('{{ a < b ? c : d }}')).toEqual([
          [lex.TokenType.TEXT, '{{ a < b ? c : d }}'],
          [lex.TokenType.EOF],
        ]);

        expect(tokenizeAndHumanizeSourceSpans('<p>a<b</p>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '<p'],
          [lex.TokenType.TAG_OPEN_END, '>'],
          [lex.TokenType.TEXT, 'a<b'],
          [lex.TokenType.TAG_CLOSE, '</p>'],
          [lex.TokenType.EOF, ''],
        ]);

        expect(tokenizeAndHumanizeParts('< a>')).toEqual([
          [lex.TokenType.TEXT, '< a>'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse valid start tag in interpolation', () => {
        expect(tokenizeAndHumanizeParts('{{ a <b && c > d }}')).toEqual([
          [lex.TokenType.TEXT, '{{ a '],
          [lex.TokenType.TAG_OPEN_START, null, 'b'],
          [lex.TokenType.ATTR_NAME, null, '&&'],
          [lex.TokenType.ATTR_NAME, null, 'c'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.TEXT, ' d }}'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should be able to escape {', () => {
        expect(tokenizeAndHumanizeParts('{{ "{" }}')).toEqual([
          [lex.TokenType.TEXT, '{{ "{" }}'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should be able to escape {{', () => {
        expect(tokenizeAndHumanizeParts('{{ "{{" }}')).toEqual([
          [lex.TokenType.TEXT, '{{ "{{" }}'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should treat expansion form as text when they are not parsed', () => {
        expect(tokenizeAndHumanizeParts('<span>{a, b, =4 {c}}</span>', false)).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 'span'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.TEXT, '{a, b, =4 {c}}'],
          [lex.TokenType.TAG_CLOSE, null, 'span'],
          [lex.TokenType.EOF],
        ]);
      });
    });

    describe('raw text', () => {
      it('should parse text', () => {
        expect(tokenizeAndHumanizeParts(`<script>t\ne\rs\r\nt</script>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 'script'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.RAW_TEXT, 't\ne\ns\nt'],
          [lex.TokenType.TAG_CLOSE, null, 'script'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should not detect entities', () => {
        expect(tokenizeAndHumanizeParts(`<script>&amp;</SCRIPT>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 'script'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.RAW_TEXT, '&amp;'],
          [lex.TokenType.TAG_CLOSE, null, 'script'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should ignore other opening tags', () => {
        expect(tokenizeAndHumanizeParts(`<script>a<div></script>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 'script'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.RAW_TEXT, 'a<div>'],
          [lex.TokenType.TAG_CLOSE, null, 'script'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should ignore other closing tags', () => {
        expect(tokenizeAndHumanizeParts(`<script>a</test></script>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 'script'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.RAW_TEXT, 'a</test>'],
          [lex.TokenType.TAG_CLOSE, null, 'script'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans(`<script>a</script>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, '<script'],
          [lex.TokenType.TAG_OPEN_END, '>'],
          [lex.TokenType.RAW_TEXT, 'a'],
          [lex.TokenType.TAG_CLOSE, '</script>'],
          [lex.TokenType.EOF, ''],
        ]);
      });
    });

    describe('escapable raw text', () => {
      it('should parse text', () => {
        expect(tokenizeAndHumanizeParts(`<title>t\ne\rs\r\nt</title>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 'title'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.ESCAPABLE_RAW_TEXT, 't\ne\ns\nt'],
          [lex.TokenType.TAG_CLOSE, null, 'title'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should detect entities', () => {
        expect(tokenizeAndHumanizeParts(`<title>&amp;</title>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 'title'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.ESCAPABLE_RAW_TEXT, '&'],
          [lex.TokenType.TAG_CLOSE, null, 'title'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should ignore other opening tags', () => {
        expect(tokenizeAndHumanizeParts(`<title>a<div></title>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 'title'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.ESCAPABLE_RAW_TEXT, 'a<div>'],
          [lex.TokenType.TAG_CLOSE, null, 'title'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should ignore other closing tags', () => {
        expect(tokenizeAndHumanizeParts(`<title>a</test></title>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 'title'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.ESCAPABLE_RAW_TEXT, 'a</test>'],
          [lex.TokenType.TAG_CLOSE, null, 'title'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans(`<title>a</title>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, '<title'],
          [lex.TokenType.TAG_OPEN_END, '>'],
          [lex.TokenType.ESCAPABLE_RAW_TEXT, 'a'],
          [lex.TokenType.TAG_CLOSE, '</title>'],
          [lex.TokenType.EOF, ''],
        ]);
      });

    });

    describe('expansion forms', () => {
      it('should parse an expansion form', () => {
        expect(tokenizeAndHumanizeParts('{one.two, three, =4 {four} =5 {five} foo {bar} }', true))
            .toEqual([
              [lex.TokenType.EXPANSION_FORM_START],
              [lex.TokenType.RAW_TEXT, 'one.two'],
              [lex.TokenType.RAW_TEXT, 'three'],
              [lex.TokenType.EXPANSION_CASE_VALUE, '=4'],
              [lex.TokenType.EXPANSION_CASE_EXP_START],
              [lex.TokenType.TEXT, 'four'],
              [lex.TokenType.EXPANSION_CASE_EXP_END],
              [lex.TokenType.EXPANSION_CASE_VALUE, '=5'],
              [lex.TokenType.EXPANSION_CASE_EXP_START],
              [lex.TokenType.TEXT, 'five'],
              [lex.TokenType.EXPANSION_CASE_EXP_END],
              [lex.TokenType.EXPANSION_CASE_VALUE, 'foo'],
              [lex.TokenType.EXPANSION_CASE_EXP_START],
              [lex.TokenType.TEXT, 'bar'],
              [lex.TokenType.EXPANSION_CASE_EXP_END],
              [lex.TokenType.EXPANSION_FORM_END],
              [lex.TokenType.EOF],
            ]);
      });

      it('should parse an expansion form with text elements surrounding it', () => {
        expect(tokenizeAndHumanizeParts('before{one.two, three, =4 {four}}after', true)).toEqual([
          [lex.TokenType.TEXT, 'before'],
          [lex.TokenType.EXPANSION_FORM_START],
          [lex.TokenType.RAW_TEXT, 'one.two'],
          [lex.TokenType.RAW_TEXT, 'three'],
          [lex.TokenType.EXPANSION_CASE_VALUE, '=4'],
          [lex.TokenType.EXPANSION_CASE_EXP_START],
          [lex.TokenType.TEXT, 'four'],
          [lex.TokenType.EXPANSION_CASE_EXP_END],
          [lex.TokenType.EXPANSION_FORM_END],
          [lex.TokenType.TEXT, 'after'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse an expansion form as a tag single child', () => {
        expect(tokenizeAndHumanizeParts('<div><span>{a, b, =4 {c}}</span></div>', true)).toEqual([
          [lex.TokenType.TAG_OPEN_START, null, 'div'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.TAG_OPEN_START, null, 'span'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EXPANSION_FORM_START],
          [lex.TokenType.RAW_TEXT, 'a'],
          [lex.TokenType.RAW_TEXT, 'b'],
          [lex.TokenType.EXPANSION_CASE_VALUE, '=4'],
          [lex.TokenType.EXPANSION_CASE_EXP_START],
          [lex.TokenType.TEXT, 'c'],
          [lex.TokenType.EXPANSION_CASE_EXP_END],
          [lex.TokenType.EXPANSION_FORM_END],
          [lex.TokenType.TAG_CLOSE, null, 'span'],
          [lex.TokenType.TAG_CLOSE, null, 'div'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse an expansion forms with elements in it', () => {
        expect(tokenizeAndHumanizeParts('{one.two, three, =4 {four <b>a</b>}}', true)).toEqual([
          [lex.TokenType.EXPANSION_FORM_START],
          [lex.TokenType.RAW_TEXT, 'one.two'],
          [lex.TokenType.RAW_TEXT, 'three'],
          [lex.TokenType.EXPANSION_CASE_VALUE, '=4'],
          [lex.TokenType.EXPANSION_CASE_EXP_START],
          [lex.TokenType.TEXT, 'four '],
          [lex.TokenType.TAG_OPEN_START, null, 'b'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.TEXT, 'a'],
          [lex.TokenType.TAG_CLOSE, null, 'b'],
          [lex.TokenType.EXPANSION_CASE_EXP_END],
          [lex.TokenType.EXPANSION_FORM_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse an expansion forms containing an interpolation', () => {
        expect(tokenizeAndHumanizeParts('{one.two, three, =4 {four {{a}}}}', true)).toEqual([
          [lex.TokenType.EXPANSION_FORM_START],
          [lex.TokenType.RAW_TEXT, 'one.two'],
          [lex.TokenType.RAW_TEXT, 'three'],
          [lex.TokenType.EXPANSION_CASE_VALUE, '=4'],
          [lex.TokenType.EXPANSION_CASE_EXP_START],
          [lex.TokenType.TEXT, 'four {{a}}'],
          [lex.TokenType.EXPANSION_CASE_EXP_END],
          [lex.TokenType.EXPANSION_FORM_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse nested expansion forms', () => {
        expect(tokenizeAndHumanizeParts(`{one.two, three, =4 { {xx, yy, =x {one}} }}`, true))
            .toEqual([
              [lex.TokenType.EXPANSION_FORM_START],
              [lex.TokenType.RAW_TEXT, 'one.two'],
              [lex.TokenType.RAW_TEXT, 'three'],
              [lex.TokenType.EXPANSION_CASE_VALUE, '=4'],
              [lex.TokenType.EXPANSION_CASE_EXP_START],
              [lex.TokenType.EXPANSION_FORM_START],
              [lex.TokenType.RAW_TEXT, 'xx'],
              [lex.TokenType.RAW_TEXT, 'yy'],
              [lex.TokenType.EXPANSION_CASE_VALUE, '=x'],
              [lex.TokenType.EXPANSION_CASE_EXP_START],
              [lex.TokenType.TEXT, 'one'],
              [lex.TokenType.EXPANSION_CASE_EXP_END],
              [lex.TokenType.EXPANSION_FORM_END],
              [lex.TokenType.TEXT, ' '],
              [lex.TokenType.EXPANSION_CASE_EXP_END],
              [lex.TokenType.EXPANSION_FORM_END],
              [lex.TokenType.EOF],
            ]);
      });
    });

    describe('errors', () => {
      it('should report unescaped "{" on error', () => {
        expect(tokenizeAndHumanizeErrors(`<p>before { after</p>`, true)).toEqual([[
          lex.TokenType.RAW_TEXT,
          `Unexpected character "EOF" (Do you have an unescaped "{" in your template? Use "{{ '{' }}") to escape it.)`,
          '0:21',
        ]]);
      });

      it('should include 2 lines of context in message', () => {
        const src = '111\n222\n333\nE\n444\n555\n666\n';
        const file = new ParseSourceFile(src, 'file://');
        const location = new ParseLocation(file, 12, 123, 456);
        const span = new ParseSourceSpan(location, location);
        const error = new lex.TokenError('**ERROR**', null !, span);
        expect(error.toString())
            .toEqual(`**ERROR** ("\n222\n333\n[ERROR ->]E\n444\n555\n"): file://@123:456`);
      });
    });

    describe('unicode characters', () => {
      it('should support unicode characters', () => {
        expect(tokenizeAndHumanizeSourceSpans(`<p>İ</p>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, '<p'],
          [lex.TokenType.TAG_OPEN_END, '>'],
          [lex.TokenType.TEXT, 'İ'],
          [lex.TokenType.TAG_CLOSE, '</p>'],
          [lex.TokenType.EOF, ''],
        ]);
      });
    });

  });
}

function tokenizeWithoutErrors(
    input: string, tokenizeExpansionForms: boolean = false,
    interpolationConfig?: InterpolationConfig): lex.Token[] {
  const tokenizeResult = lex.tokenize(
      input, 'someUrl', getHtmlTagDefinition, tokenizeExpansionForms, interpolationConfig);

  if (tokenizeResult.errors.length > 0) {
    const errorString = tokenizeResult.errors.join('\n');
    throw new Error(`Unexpected parse errors:\n${errorString}`);
  }

  return tokenizeResult.tokens;
}

function tokenizeAndHumanizeParts(
    input: string, tokenizeExpansionForms: boolean = false,
    interpolationConfig?: InterpolationConfig): any[] {
  return tokenizeWithoutErrors(input, tokenizeExpansionForms, interpolationConfig)
      .map(token => [<any>token.type].concat(token.parts));
}

function tokenizeAndHumanizeSourceSpans(input: string): any[] {
  return tokenizeWithoutErrors(input).map(token => [<any>token.type, token.sourceSpan.toString()]);
}

function humanizeLineColumn(location: ParseLocation): string {
  return `${location.line}:${location.col}`;
}

function tokenizeAndHumanizeLineColumn(input: string): any[] {
  return tokenizeWithoutErrors(input).map(
      token => [<any>token.type, humanizeLineColumn(token.sourceSpan.start)]);
}

function tokenizeAndHumanizeErrors(input: string, tokenizeExpansionForms: boolean = false): any[] {
  return lex.tokenize(input, 'someUrl', getHtmlTagDefinition, tokenizeExpansionForms)
      .errors.map(e => [<any>e.tokenType, e.msg, humanizeLineColumn(e.span.start)]);
}
