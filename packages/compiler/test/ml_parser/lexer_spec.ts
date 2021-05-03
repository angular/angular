/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getHtmlTagDefinition} from '../../src/ml_parser/html_tags';
import * as lex from '../../src/ml_parser/lexer';
import {ParseLocation, ParseSourceFile, ParseSourceSpan} from '../../src/parse_util';

{
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

      it('should skip over leading trivia for source-span start', () => {
        expect(
            tokenizeAndHumanizeFullStart('<t>\n \t a</t>', {leadingTriviaChars: ['\n', ' ', '\t']}))
            .toEqual([
              [lex.TokenType.TAG_OPEN_START, '0:0', '0:0'],
              [lex.TokenType.TAG_OPEN_END, '0:2', '0:2'],
              [lex.TokenType.TEXT, '1:3', '0:3'],
              [lex.TokenType.TAG_CLOSE, '1:4', '1:4'],
              [lex.TokenType.EOF, '1:8', '1:8'],
            ]);
      });
    });

    describe('content ranges', () => {
      it('should only process the text within the range', () => {
        expect(tokenizeAndHumanizeSourceSpans(
                   'pre 1\npre 2\npre 3 `line 1\nline 2\nline 3` post 1\n post 2\n post 3',
                   {range: {startPos: 19, startLine: 2, startCol: 7, endPos: 39}}))
            .toEqual([
              [lex.TokenType.TEXT, 'line 1\nline 2\nline 3'],
              [lex.TokenType.EOF, ''],
            ]);
      });

      it('should take into account preceding (non-processed) lines and columns', () => {
        expect(tokenizeAndHumanizeLineColumn(
                   'pre 1\npre 2\npre 3 `line 1\nline 2\nline 3` post 1\n post 2\n post 3',
                   {range: {startPos: 19, startLine: 2, startCol: 7, endPos: 39}}))
            .toEqual([
              [lex.TokenType.TEXT, '2:7'],
              [lex.TokenType.EOF, '4:6'],
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
          [lex.TokenType.TAG_OPEN_START, '', 'test'],
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
          [lex.TokenType.TAG_OPEN_START, '', 'test'],
          [lex.TokenType.TAG_OPEN_END_VOID],
          [lex.TokenType.EOF],
        ]);
      });

      it('should allow whitespace after the tag name', () => {
        expect(tokenizeAndHumanizeParts('<test >')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 'test'],
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

      describe('tags', () => {
        it('terminated with EOF', () => {
          expect(tokenizeAndHumanizeSourceSpans('<div')).toEqual([
            [lex.TokenType.INCOMPLETE_TAG_OPEN, '<div'],
            [lex.TokenType.EOF, ''],
          ]);
        });

        it('after tag name', () => {
          expect(tokenizeAndHumanizeSourceSpans('<div<span><div</span>')).toEqual([
            [lex.TokenType.INCOMPLETE_TAG_OPEN, '<div'],
            [lex.TokenType.TAG_OPEN_START, '<span'],
            [lex.TokenType.TAG_OPEN_END, '>'],
            [lex.TokenType.INCOMPLETE_TAG_OPEN, '<div'],
            [lex.TokenType.TAG_CLOSE, '</span>'],
            [lex.TokenType.EOF, ''],
          ]);
        });

        it('in attribute', () => {
          expect(tokenizeAndHumanizeSourceSpans('<div class="hi" sty<span></span>')).toEqual([
            [lex.TokenType.INCOMPLETE_TAG_OPEN, '<div'],
            [lex.TokenType.ATTR_NAME, 'class'],
            [lex.TokenType.ATTR_QUOTE, '"'],
            [lex.TokenType.ATTR_VALUE, 'hi'],
            [lex.TokenType.ATTR_QUOTE, '"'],
            [lex.TokenType.ATTR_NAME, 'sty'],
            [lex.TokenType.TAG_OPEN_START, '<span'],
            [lex.TokenType.TAG_OPEN_END, '>'],
            [lex.TokenType.TAG_CLOSE, '</span>'],
            [lex.TokenType.EOF, ''],
          ]);
        });

        it('after quote', () => {
          expect(tokenizeAndHumanizeSourceSpans('<div "<span></span>')).toEqual([
            [lex.TokenType.INCOMPLETE_TAG_OPEN, '<div'],
            [lex.TokenType.TEXT, '"'],
            [lex.TokenType.TAG_OPEN_START, '<span'],
            [lex.TokenType.TAG_OPEN_END, '>'],
            [lex.TokenType.TAG_CLOSE, '</span>'],
            [lex.TokenType.EOF, ''],
          ]);
        });
      });
    });

    describe('attributes', () => {
      it('should parse attributes without prefix', () => {
        expect(tokenizeAndHumanizeParts('<t a>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'],
          [lex.TokenType.ATTR_NAME, '', 'a'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse attributes with interpolation', () => {
        expect(tokenizeAndHumanizeParts('<t a="{{v}}" b="s{{m}}e" c="s{{m//c}}e">')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'],
          [lex.TokenType.ATTR_NAME, '', 'a'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.ATTR_VALUE, '{{v}}'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.ATTR_NAME, '', 'b'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.ATTR_VALUE, 's{{m}}e'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.ATTR_NAME, '', 'c'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.ATTR_VALUE, 's{{m//c}}e'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse attributes with prefix', () => {
        expect(tokenizeAndHumanizeParts('<t ns1:a>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'],
          [lex.TokenType.ATTR_NAME, 'ns1', 'a'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse attributes whose prefix is not valid', () => {
        expect(tokenizeAndHumanizeParts('<t (ns1:a)>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'],
          [lex.TokenType.ATTR_NAME, '', '(ns1:a)'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse attributes with single quote value', () => {
        expect(tokenizeAndHumanizeParts('<t a=\'b\'>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'],
          [lex.TokenType.ATTR_NAME, '', 'a'],
          [lex.TokenType.ATTR_QUOTE, '\''],
          [lex.TokenType.ATTR_VALUE, 'b'],
          [lex.TokenType.ATTR_QUOTE, '\''],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse attributes with double quote value', () => {
        expect(tokenizeAndHumanizeParts('<t a="b">')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'],
          [lex.TokenType.ATTR_NAME, '', 'a'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.ATTR_VALUE, 'b'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse attributes with unquoted value', () => {
        expect(tokenizeAndHumanizeParts('<t a=b>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'],
          [lex.TokenType.ATTR_NAME, '', 'a'],
          [lex.TokenType.ATTR_VALUE, 'b'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should allow whitespace', () => {
        expect(tokenizeAndHumanizeParts('<t a = b >')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'],
          [lex.TokenType.ATTR_NAME, '', 'a'],
          [lex.TokenType.ATTR_VALUE, 'b'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse attributes with entities in values', () => {
        expect(tokenizeAndHumanizeParts('<t a="&#65;&#x41;">')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'],
          [lex.TokenType.ATTR_NAME, '', 'a'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.ATTR_VALUE, 'AA'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should not decode entities without trailing ";"', () => {
        expect(tokenizeAndHumanizeParts('<t a="&amp" b="c&&d">')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'],
          [lex.TokenType.ATTR_NAME, '', 'a'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.ATTR_VALUE, '&amp'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.ATTR_NAME, '', 'b'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.ATTR_VALUE, 'c&&d'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse attributes with "&" in values', () => {
        expect(tokenizeAndHumanizeParts('<t a="b && c &">')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'],
          [lex.TokenType.ATTR_NAME, '', 'a'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.ATTR_VALUE, 'b && c &'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse values with CR and LF', () => {
        expect(tokenizeAndHumanizeParts('<t a=\'t\ne\rs\r\nt\'>')).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'],
          [lex.TokenType.ATTR_NAME, '', 'a'],
          [lex.TokenType.ATTR_QUOTE, '\''],
          [lex.TokenType.ATTR_VALUE, 't\ne\ns\nt'],
          [lex.TokenType.ATTR_QUOTE, '\''],
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

      it('should report missing closing single quote', () => {
        expect(tokenizeAndHumanizeErrors('<t a=\'b>')).toEqual([
          [lex.TokenType.ATTR_VALUE, 'Unexpected character "EOF"', '0:8'],
        ]);
      });

      it('should report missing closing double quote', () => {
        expect(tokenizeAndHumanizeErrors('<t a="b>')).toEqual([
          [lex.TokenType.ATTR_VALUE, 'Unexpected character "EOF"', '0:8'],
        ]);
      });
    });

    describe('closing tags', () => {
      it('should parse closing tags without prefix', () => {
        expect(tokenizeAndHumanizeParts('</test>')).toEqual([
          [lex.TokenType.TAG_CLOSE, '', 'test'],
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
          [lex.TokenType.TAG_CLOSE, '', 'test'],
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
        expect(tokenizeAndHumanizeErrors('&#3sdf;')).toEqual([[
          lex.TokenType.TEXT,
          'Unable to parse entity "&#3s" - decimal character reference entities must end with ";"',
          '0:4'
        ]]);
        expect(tokenizeAndHumanizeErrors('&#xasdf;')).toEqual([[
          lex.TokenType.TEXT,
          'Unable to parse entity "&#xas" - hexadecimal character reference entities must end with ";"',
          '0:5'
        ]]);

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
        expect(tokenizeAndHumanizeParts('{% a %}', {interpolationConfig: {start: '{%', end: '%}'}}))
            .toEqual([
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
          [lex.TokenType.TEXT, 'a'],
          [lex.TokenType.INCOMPLETE_TAG_OPEN, '<b'],
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
          [lex.TokenType.TAG_OPEN_START, '', 'b'],
          [lex.TokenType.ATTR_NAME, '', '&&'],
          [lex.TokenType.ATTR_NAME, '', 'c'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.TEXT, ' d }}'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse start tags quotes in place of an attribute name as text', () => {
        expect(tokenizeAndHumanizeParts('<t ">')).toEqual([
          [lex.TokenType.INCOMPLETE_TAG_OPEN, '', 't'],
          [lex.TokenType.TEXT, '">'],
          [lex.TokenType.EOF],
        ]);

        expect(tokenizeAndHumanizeParts('<t \'>')).toEqual([
          [lex.TokenType.INCOMPLETE_TAG_OPEN, '', 't'],
          [lex.TokenType.TEXT, '\'>'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse start tags quotes in place of an attribute name (after a valid attribute)',
         () => {
           expect(tokenizeAndHumanizeParts('<t a="b" ">')).toEqual([
             [lex.TokenType.INCOMPLETE_TAG_OPEN, '', 't'],
             [lex.TokenType.ATTR_NAME, '', 'a'],
             [lex.TokenType.ATTR_QUOTE, '"'],
             [lex.TokenType.ATTR_VALUE, 'b'],
             [lex.TokenType.ATTR_QUOTE, '"'],
             // TODO(ayazhafiz): the " symbol should be a synthetic attribute,
             // allowing us to complete the opening tag correctly.
             [lex.TokenType.TEXT, '">'],
             [lex.TokenType.EOF],
           ]);

           expect(tokenizeAndHumanizeParts('<t a=\'b\' \'>')).toEqual([
             [lex.TokenType.INCOMPLETE_TAG_OPEN, '', 't'],
             [lex.TokenType.ATTR_NAME, '', 'a'],
             [lex.TokenType.ATTR_QUOTE, '\''],
             [lex.TokenType.ATTR_VALUE, 'b'],
             [lex.TokenType.ATTR_QUOTE, '\''],
             // TODO(ayazhafiz): the ' symbol should be a synthetic attribute,
             // allowing us to complete the opening tag correctly.
             [lex.TokenType.TEXT, '\'>'],
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
        expect(tokenizeAndHumanizeParts(
                   '<span>{a, b, =4 {c}}</span>', {tokenizeExpansionForms: false}))
            .toEqual([
              [lex.TokenType.TAG_OPEN_START, '', 'span'],
              [lex.TokenType.TAG_OPEN_END],
              [lex.TokenType.TEXT, '{a, b, =4 {c}}'],
              [lex.TokenType.TAG_CLOSE, '', 'span'],
              [lex.TokenType.EOF],
            ]);
      });
    });

    describe('raw text', () => {
      it('should parse text', () => {
        expect(tokenizeAndHumanizeParts(`<script>t\ne\rs\r\nt</script>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 'script'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.RAW_TEXT, 't\ne\ns\nt'],
          [lex.TokenType.TAG_CLOSE, '', 'script'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should not detect entities', () => {
        expect(tokenizeAndHumanizeParts(`<script>&amp;</SCRIPT>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 'script'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.RAW_TEXT, '&amp;'],
          [lex.TokenType.TAG_CLOSE, '', 'script'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should ignore other opening tags', () => {
        expect(tokenizeAndHumanizeParts(`<script>a<div></script>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 'script'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.RAW_TEXT, 'a<div>'],
          [lex.TokenType.TAG_CLOSE, '', 'script'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should ignore other closing tags', () => {
        expect(tokenizeAndHumanizeParts(`<script>a</test></script>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 'script'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.RAW_TEXT, 'a</test>'],
          [lex.TokenType.TAG_CLOSE, '', 'script'],
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
          [lex.TokenType.TAG_OPEN_START, '', 'title'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.ESCAPABLE_RAW_TEXT, 't\ne\ns\nt'],
          [lex.TokenType.TAG_CLOSE, '', 'title'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should detect entities', () => {
        expect(tokenizeAndHumanizeParts(`<title>&amp;</title>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 'title'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.ESCAPABLE_RAW_TEXT, '&'],
          [lex.TokenType.TAG_CLOSE, '', 'title'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should ignore other opening tags', () => {
        expect(tokenizeAndHumanizeParts(`<title>a<div></title>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 'title'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.ESCAPABLE_RAW_TEXT, 'a<div>'],
          [lex.TokenType.TAG_CLOSE, '', 'title'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should ignore other closing tags', () => {
        expect(tokenizeAndHumanizeParts(`<title>a</test></title>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 'title'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.ESCAPABLE_RAW_TEXT, 'a</test>'],
          [lex.TokenType.TAG_CLOSE, '', 'title'],
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

    describe('parsable data', () => {
      it('should parse an SVG <title> tag', () => {
        expect(tokenizeAndHumanizeParts(`<svg:title>test</svg:title>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, 'svg', 'title'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.TEXT, 'test'],
          [lex.TokenType.TAG_CLOSE, 'svg', 'title'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse an SVG <title> tag with children', () => {
        expect(tokenizeAndHumanizeParts(`<svg:title><f>test</f></svg:title>`)).toEqual([
          [lex.TokenType.TAG_OPEN_START, 'svg', 'title'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.TAG_OPEN_START, '', 'f'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.TEXT, 'test'],
          [lex.TokenType.TAG_CLOSE, '', 'f'],
          [lex.TokenType.TAG_CLOSE, 'svg', 'title'],
          [lex.TokenType.EOF],
        ]);
      });
    });

    describe('expansion forms', () => {
      it('should parse an expansion form', () => {
        expect(
            tokenizeAndHumanizeParts(
                '{one.two, three, =4 {four} =5 {five} foo {bar} }', {tokenizeExpansionForms: true}))
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
        expect(tokenizeAndHumanizeParts(
                   'before{one.two, three, =4 {four}}after', {tokenizeExpansionForms: true}))
            .toEqual([
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
        expect(tokenizeAndHumanizeParts(
                   '<div><span>{a, b, =4 {c}}</span></div>', {tokenizeExpansionForms: true}))
            .toEqual([
              [lex.TokenType.TAG_OPEN_START, '', 'div'],
              [lex.TokenType.TAG_OPEN_END],
              [lex.TokenType.TAG_OPEN_START, '', 'span'],
              [lex.TokenType.TAG_OPEN_END],
              [lex.TokenType.EXPANSION_FORM_START],
              [lex.TokenType.RAW_TEXT, 'a'],
              [lex.TokenType.RAW_TEXT, 'b'],
              [lex.TokenType.EXPANSION_CASE_VALUE, '=4'],
              [lex.TokenType.EXPANSION_CASE_EXP_START],
              [lex.TokenType.TEXT, 'c'],
              [lex.TokenType.EXPANSION_CASE_EXP_END],
              [lex.TokenType.EXPANSION_FORM_END],
              [lex.TokenType.TAG_CLOSE, '', 'span'],
              [lex.TokenType.TAG_CLOSE, '', 'div'],
              [lex.TokenType.EOF],
            ]);
      });

      it('should parse an expansion form with whitespace surrounding it', () => {
        expect(tokenizeAndHumanizeParts(
                   '<div><span> {a, b, =4 {c}} </span></div>', {tokenizeExpansionForms: true}))
            .toEqual([
              [lex.TokenType.TAG_OPEN_START, '', 'div'],
              [lex.TokenType.TAG_OPEN_END],
              [lex.TokenType.TAG_OPEN_START, '', 'span'],
              [lex.TokenType.TAG_OPEN_END],
              [lex.TokenType.TEXT, ' '],
              [lex.TokenType.EXPANSION_FORM_START],
              [lex.TokenType.RAW_TEXT, 'a'],
              [lex.TokenType.RAW_TEXT, 'b'],
              [lex.TokenType.EXPANSION_CASE_VALUE, '=4'],
              [lex.TokenType.EXPANSION_CASE_EXP_START],
              [lex.TokenType.TEXT, 'c'],
              [lex.TokenType.EXPANSION_CASE_EXP_END],
              [lex.TokenType.EXPANSION_FORM_END],
              [lex.TokenType.TEXT, ' '],
              [lex.TokenType.TAG_CLOSE, '', 'span'],
              [lex.TokenType.TAG_CLOSE, '', 'div'],
              [lex.TokenType.EOF],
            ]);
      });

      it('should parse an expansion forms with elements in it', () => {
        expect(tokenizeAndHumanizeParts(
                   '{one.two, three, =4 {four <b>a</b>}}', {tokenizeExpansionForms: true}))
            .toEqual([
              [lex.TokenType.EXPANSION_FORM_START],
              [lex.TokenType.RAW_TEXT, 'one.two'],
              [lex.TokenType.RAW_TEXT, 'three'],
              [lex.TokenType.EXPANSION_CASE_VALUE, '=4'],
              [lex.TokenType.EXPANSION_CASE_EXP_START],
              [lex.TokenType.TEXT, 'four '],
              [lex.TokenType.TAG_OPEN_START, '', 'b'],
              [lex.TokenType.TAG_OPEN_END],
              [lex.TokenType.TEXT, 'a'],
              [lex.TokenType.TAG_CLOSE, '', 'b'],
              [lex.TokenType.EXPANSION_CASE_EXP_END],
              [lex.TokenType.EXPANSION_FORM_END],
              [lex.TokenType.EOF],
            ]);
      });

      it('should parse an expansion forms containing an interpolation', () => {
        expect(tokenizeAndHumanizeParts(
                   '{one.two, three, =4 {four {{a}}}}', {tokenizeExpansionForms: true}))
            .toEqual([
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
        expect(tokenizeAndHumanizeParts(
                   `{one.two, three, =4 { {xx, yy, =x {one}} }}`, {tokenizeExpansionForms: true}))
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

      describe('[line ending normalization', () => {
        describe('{escapedString: true}', () => {
          it('should normalize line-endings in expansion forms if `i18nNormalizeLineEndingsInICUs` is true',
             () => {
               const result = tokenizeWithoutErrors(
                   `{\r\n` +
                       `    messages.length,\r\n` +
                       `    plural,\r\n` +
                       `    =0 {You have \r\nno\r\n messages}\r\n` +
                       `    =1 {One {{message}}}}\r\n`,
                   {
                     tokenizeExpansionForms: true,
                     escapedString: true,
                     i18nNormalizeLineEndingsInICUs: true
                   });

               expect(humanizeParts(result.tokens)).toEqual([
                 [lex.TokenType.EXPANSION_FORM_START],
                 [lex.TokenType.RAW_TEXT, '\n    messages.length'],
                 [lex.TokenType.RAW_TEXT, 'plural'],
                 [lex.TokenType.EXPANSION_CASE_VALUE, '=0'],
                 [lex.TokenType.EXPANSION_CASE_EXP_START],
                 [lex.TokenType.TEXT, 'You have \nno\n messages'],
                 [lex.TokenType.EXPANSION_CASE_EXP_END],
                 [lex.TokenType.EXPANSION_CASE_VALUE, '=1'],
                 [lex.TokenType.EXPANSION_CASE_EXP_START],
                 [lex.TokenType.TEXT, 'One {{message}}'],
                 [lex.TokenType.EXPANSION_CASE_EXP_END],
                 [lex.TokenType.EXPANSION_FORM_END],
                 [lex.TokenType.TEXT, '\n'],
                 [lex.TokenType.EOF],
               ]);

               expect(result.nonNormalizedIcuExpressions).toEqual([]);
             });

          it('should not normalize line-endings in ICU expressions when `i18nNormalizeLineEndingsInICUs` is not defined',
             () => {
               const result = tokenizeWithoutErrors(
                   `{\r\n` +
                       `    messages.length,\r\n` +
                       `    plural,\r\n` +
                       `    =0 {You have \r\nno\r\n messages}\r\n` +
                       `    =1 {One {{message}}}}\r\n`,
                   {tokenizeExpansionForms: true, escapedString: true});

               expect(humanizeParts(result.tokens)).toEqual([
                 [lex.TokenType.EXPANSION_FORM_START],
                 [lex.TokenType.RAW_TEXT, '\r\n    messages.length'],
                 [lex.TokenType.RAW_TEXT, 'plural'],
                 [lex.TokenType.EXPANSION_CASE_VALUE, '=0'],
                 [lex.TokenType.EXPANSION_CASE_EXP_START],
                 [lex.TokenType.TEXT, 'You have \nno\n messages'],
                 [lex.TokenType.EXPANSION_CASE_EXP_END],
                 [lex.TokenType.EXPANSION_CASE_VALUE, '=1'],
                 [lex.TokenType.EXPANSION_CASE_EXP_START],
                 [lex.TokenType.TEXT, 'One {{message}}'],
                 [lex.TokenType.EXPANSION_CASE_EXP_END],
                 [lex.TokenType.EXPANSION_FORM_END],
                 [lex.TokenType.TEXT, '\n'],
                 [lex.TokenType.EOF],
               ]);

               expect(result.nonNormalizedIcuExpressions!.length).toBe(1);
               expect(result.nonNormalizedIcuExpressions![0].sourceSpan.toString())
                   .toEqual('\r\n    messages.length');
             });

          it('should not normalize line endings in nested expansion forms when `i18nNormalizeLineEndingsInICUs` is not defined',
             () => {
               const result = tokenizeWithoutErrors(
                   `{\r\n` +
                       `  messages.length, plural,\r\n` +
                       `  =0 { zero \r\n` +
                       `       {\r\n` +
                       `         p.gender, select,\r\n` +
                       `         male {m}\r\n` +
                       `       }\r\n` +
                       `     }\r\n` +
                       `}`,
                   {tokenizeExpansionForms: true, escapedString: true});
               expect(humanizeParts(result.tokens)).toEqual([
                 [lex.TokenType.EXPANSION_FORM_START],
                 [lex.TokenType.RAW_TEXT, '\r\n  messages.length'],
                 [lex.TokenType.RAW_TEXT, 'plural'],
                 [lex.TokenType.EXPANSION_CASE_VALUE, '=0'],
                 [lex.TokenType.EXPANSION_CASE_EXP_START],
                 [lex.TokenType.TEXT, 'zero \n       '],

                 [lex.TokenType.EXPANSION_FORM_START],
                 [lex.TokenType.RAW_TEXT, '\r\n         p.gender'],
                 [lex.TokenType.RAW_TEXT, 'select'],
                 [lex.TokenType.EXPANSION_CASE_VALUE, 'male'],
                 [lex.TokenType.EXPANSION_CASE_EXP_START],
                 [lex.TokenType.TEXT, 'm'],
                 [lex.TokenType.EXPANSION_CASE_EXP_END],
                 [lex.TokenType.EXPANSION_FORM_END],

                 [lex.TokenType.TEXT, '\n     '],
                 [lex.TokenType.EXPANSION_CASE_EXP_END],
                 [lex.TokenType.EXPANSION_FORM_END],
                 [lex.TokenType.EOF],
               ]);

               expect(result.nonNormalizedIcuExpressions!.length).toBe(2);
               expect(result.nonNormalizedIcuExpressions![0].sourceSpan.toString())
                   .toEqual('\r\n  messages.length');
               expect(result.nonNormalizedIcuExpressions![1].sourceSpan.toString())
                   .toEqual('\r\n         p.gender');
             });
        });

        describe('{escapedString: false}', () => {
          it('should normalize line-endings in expansion forms if `i18nNormalizeLineEndingsInICUs` is true',
             () => {
               const result = tokenizeWithoutErrors(
                   `{\r\n` +
                       `    messages.length,\r\n` +
                       `    plural,\r\n` +
                       `    =0 {You have \r\nno\r\n messages}\r\n` +
                       `    =1 {One {{message}}}}\r\n`,
                   {
                     tokenizeExpansionForms: true,
                     escapedString: false,
                     i18nNormalizeLineEndingsInICUs: true
                   });

               expect(humanizeParts(result.tokens)).toEqual([
                 [lex.TokenType.EXPANSION_FORM_START],
                 [lex.TokenType.RAW_TEXT, '\n    messages.length'],
                 [lex.TokenType.RAW_TEXT, 'plural'],
                 [lex.TokenType.EXPANSION_CASE_VALUE, '=0'],
                 [lex.TokenType.EXPANSION_CASE_EXP_START],
                 [lex.TokenType.TEXT, 'You have \nno\n messages'],
                 [lex.TokenType.EXPANSION_CASE_EXP_END],
                 [lex.TokenType.EXPANSION_CASE_VALUE, '=1'],
                 [lex.TokenType.EXPANSION_CASE_EXP_START],
                 [lex.TokenType.TEXT, 'One {{message}}'],
                 [lex.TokenType.EXPANSION_CASE_EXP_END],
                 [lex.TokenType.EXPANSION_FORM_END],
                 [lex.TokenType.TEXT, '\n'],
                 [lex.TokenType.EOF],
               ]);

               expect(result.nonNormalizedIcuExpressions).toEqual([]);
             });

          it('should not normalize line-endings in ICU expressions when `i18nNormalizeLineEndingsInICUs` is not defined',
             () => {
               const result = tokenizeWithoutErrors(
                   `{\r\n` +
                       `    messages.length,\r\n` +
                       `    plural,\r\n` +
                       `    =0 {You have \r\nno\r\n messages}\r\n` +
                       `    =1 {One {{message}}}}\r\n`,
                   {tokenizeExpansionForms: true, escapedString: false});

               expect(humanizeParts(result.tokens)).toEqual([
                 [lex.TokenType.EXPANSION_FORM_START],
                 [lex.TokenType.RAW_TEXT, '\r\n    messages.length'],
                 [lex.TokenType.RAW_TEXT, 'plural'],
                 [lex.TokenType.EXPANSION_CASE_VALUE, '=0'],
                 [lex.TokenType.EXPANSION_CASE_EXP_START],
                 [lex.TokenType.TEXT, 'You have \nno\n messages'],
                 [lex.TokenType.EXPANSION_CASE_EXP_END],
                 [lex.TokenType.EXPANSION_CASE_VALUE, '=1'],
                 [lex.TokenType.EXPANSION_CASE_EXP_START],
                 [lex.TokenType.TEXT, 'One {{message}}'],
                 [lex.TokenType.EXPANSION_CASE_EXP_END],
                 [lex.TokenType.EXPANSION_FORM_END],
                 [lex.TokenType.TEXT, '\n'],
                 [lex.TokenType.EOF],
               ]);

               expect(result.nonNormalizedIcuExpressions!.length).toBe(1);
               expect(result.nonNormalizedIcuExpressions![0].sourceSpan.toString())
                   .toEqual('\r\n    messages.length');
             });

          it('should not normalize line endings in nested expansion forms when `i18nNormalizeLineEndingsInICUs` is not defined',
             () => {
               const result = tokenizeWithoutErrors(
                   `{\r\n` +
                       `  messages.length, plural,\r\n` +
                       `  =0 { zero \r\n` +
                       `       {\r\n` +
                       `         p.gender, select,\r\n` +
                       `         male {m}\r\n` +
                       `       }\r\n` +
                       `     }\r\n` +
                       `}`,
                   {tokenizeExpansionForms: true});

               expect(humanizeParts(result.tokens)).toEqual([
                 [lex.TokenType.EXPANSION_FORM_START],
                 [lex.TokenType.RAW_TEXT, '\r\n  messages.length'],
                 [lex.TokenType.RAW_TEXT, 'plural'],
                 [lex.TokenType.EXPANSION_CASE_VALUE, '=0'],
                 [lex.TokenType.EXPANSION_CASE_EXP_START],
                 [lex.TokenType.TEXT, 'zero \n       '],

                 [lex.TokenType.EXPANSION_FORM_START],
                 [lex.TokenType.RAW_TEXT, '\r\n         p.gender'],
                 [lex.TokenType.RAW_TEXT, 'select'],
                 [lex.TokenType.EXPANSION_CASE_VALUE, 'male'],
                 [lex.TokenType.EXPANSION_CASE_EXP_START],
                 [lex.TokenType.TEXT, 'm'],
                 [lex.TokenType.EXPANSION_CASE_EXP_END],
                 [lex.TokenType.EXPANSION_FORM_END],

                 [lex.TokenType.TEXT, '\n     '],
                 [lex.TokenType.EXPANSION_CASE_EXP_END],
                 [lex.TokenType.EXPANSION_FORM_END],
                 [lex.TokenType.EOF],
               ]);

               expect(result.nonNormalizedIcuExpressions!.length).toBe(2);
               expect(result.nonNormalizedIcuExpressions![0].sourceSpan.toString())
                   .toEqual('\r\n  messages.length');
               expect(result.nonNormalizedIcuExpressions![1].sourceSpan.toString())
                   .toEqual('\r\n         p.gender');
             });
        });
      });
    });


    describe('errors', () => {
      it('should report unescaped "{" on error', () => {
        expect(tokenizeAndHumanizeErrors(`<p>before { after</p>`, {tokenizeExpansionForms: true}))
            .toEqual([[
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
        const error = new lex.TokenError('**ERROR**', null!, span);
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

    describe('(processing escaped strings)', () => {
      it('should unescape standard escape sequences', () => {
        expect(tokenizeAndHumanizeParts('\\\' \\\' \\\'', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, '\' \' \''],
          [lex.TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\" \\" \\"', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, '\" \" \"'],
          [lex.TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\` \\` \\`', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, '\` \` \`'],
          [lex.TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\\\ \\\\ \\\\', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, '\\ \\ \\'],
          [lex.TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\n \\n \\n', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, '\n \n \n'],
          [lex.TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\r \\r \\r', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, '\n \n \n'],  // post processing converts `\r` to `\n`
          [lex.TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\v \\v \\v', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, '\v \v \v'],
          [lex.TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\t \\t \\t', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, '\t \t \t'],
          [lex.TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\b \\b \\b', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, '\b \b \b'],
          [lex.TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\f \\f \\f', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, '\f \f \f'],
          [lex.TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts(
                   '\\\' \\" \\` \\\\ \\n \\r \\v \\t \\b \\f', {escapedString: true}))
            .toEqual([
              [lex.TokenType.TEXT, '\' \" \` \\ \n \n \v \t \b \f'],
              [lex.TokenType.EOF],
            ]);
      });

      it('should unescape null sequences', () => {
        expect(tokenizeAndHumanizeParts('\\0', {escapedString: true})).toEqual([
          [lex.TokenType.EOF],
        ]);
        // \09 is not an octal number so the \0 is taken as EOF
        expect(tokenizeAndHumanizeParts('\\09', {escapedString: true})).toEqual([
          [lex.TokenType.EOF],
        ]);
      });

      it('should unescape octal sequences', () => {
        // \19 is read as an octal `\1` followed by a normal char `9`
        // \1234 is read as an octal `\123` followed by a normal char `4`
        // \999 is not an octal number so its backslash just gets removed.
        expect(tokenizeAndHumanizeParts(
                   '\\001 \\01 \\1 \\12 \\223 \\19 \\2234 \\999', {escapedString: true}))
            .toEqual([
              [lex.TokenType.TEXT, '\x01 \x01 \x01 \x0A \x93 \x019 \x934 999'],
              [lex.TokenType.EOF],
            ]);
      });

      it('should unescape hex sequences', () => {
        expect(tokenizeAndHumanizeParts('\\x12 \\x4F \\xDC', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, '\x12 \x4F \xDC'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should report an error on an invalid hex sequence', () => {
        expect(tokenizeAndHumanizeErrors('\\xGG', {escapedString: true})).toEqual([
          [null, 'Invalid hexadecimal escape sequence', '0:2']
        ]);

        expect(tokenizeAndHumanizeErrors('abc \\x xyz', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, 'Invalid hexadecimal escape sequence', '0:6']
        ]);

        expect(tokenizeAndHumanizeErrors('abc\\x', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, 'Unexpected character "EOF"', '0:5']
        ]);
      });

      it('should unescape fixed length Unicode sequences', () => {
        expect(tokenizeAndHumanizeParts('\\u0123 \\uABCD', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, '\u0123 \uABCD'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should error on an invalid fixed length Unicode sequence', () => {
        expect(tokenizeAndHumanizeErrors('\\uGGGG', {escapedString: true})).toEqual([
          [null, 'Invalid hexadecimal escape sequence', '0:2']
        ]);
      });

      it('should unescape variable length Unicode sequences', () => {
        expect(tokenizeAndHumanizeParts(
                   '\\u{01} \\u{ABC} \\u{1234} \\u{123AB}', {escapedString: true}))
            .toEqual([
              [lex.TokenType.TEXT, '\u{01} \u{ABC} \u{1234} \u{123AB}'],
              [lex.TokenType.EOF],
            ]);
      });

      it('should error on an invalid variable length Unicode sequence', () => {
        expect(tokenizeAndHumanizeErrors('\\u{GG}', {escapedString: true})).toEqual([
          [null, 'Invalid hexadecimal escape sequence', '0:3']
        ]);
      });

      it('should unescape line continuations', () => {
        expect(tokenizeAndHumanizeParts('abc\\\ndef', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, 'abcdef'],
          [lex.TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\\nx\\\ny\\\n', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, 'xy'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should remove backslash from "non-escape" sequences', () => {
        expect(tokenizeAndHumanizeParts('\a \g \~', {escapedString: true})).toEqual([
          [lex.TokenType.TEXT, 'a g ~'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should unescape sequences in plain text', () => {
        expect(tokenizeAndHumanizeParts('abc\ndef\\nghi\\tjkl\\`\\\'\\"mno', {escapedString: true}))
            .toEqual([
              [lex.TokenType.TEXT, 'abc\ndef\nghi\tjkl`\'"mno'],
              [lex.TokenType.EOF],
            ]);
      });

      it('should unescape sequences in raw text', () => {
        expect(tokenizeAndHumanizeParts(
                   '<script>abc\ndef\\nghi\\tjkl\\`\\\'\\"mno</script>', {escapedString: true}))
            .toEqual([
              [lex.TokenType.TAG_OPEN_START, '', 'script'],
              [lex.TokenType.TAG_OPEN_END],
              [lex.TokenType.RAW_TEXT, 'abc\ndef\nghi\tjkl`\'"mno'],
              [lex.TokenType.TAG_CLOSE, '', 'script'],
              [lex.TokenType.EOF],
            ]);
      });

      it('should unescape sequences in escapable raw text', () => {
        expect(tokenizeAndHumanizeParts(
                   '<title>abc\ndef\\nghi\\tjkl\\`\\\'\\"mno</title>', {escapedString: true}))
            .toEqual([
              [lex.TokenType.TAG_OPEN_START, '', 'title'],
              [lex.TokenType.TAG_OPEN_END],
              [lex.TokenType.ESCAPABLE_RAW_TEXT, 'abc\ndef\nghi\tjkl`\'"mno'],
              [lex.TokenType.TAG_CLOSE, '', 'title'],
              [lex.TokenType.EOF],
            ]);
      });

      it('should parse over escape sequences in tag definitions', () => {
        expect(tokenizeAndHumanizeParts('<t a=\\"b\\" \\n c=\\\'d\\\'>', {escapedString: true}))
            .toEqual([
              [lex.TokenType.TAG_OPEN_START, '', 't'],
              [lex.TokenType.ATTR_NAME, '', 'a'],
              [lex.TokenType.ATTR_QUOTE, '"'],
              [lex.TokenType.ATTR_VALUE, 'b'],
              [lex.TokenType.ATTR_QUOTE, '"'],
              [lex.TokenType.ATTR_NAME, '', 'c'],
              [lex.TokenType.ATTR_QUOTE, '\''],
              [lex.TokenType.ATTR_VALUE, 'd'],
              [lex.TokenType.ATTR_QUOTE, '\''],
              [lex.TokenType.TAG_OPEN_END],
              [lex.TokenType.EOF],
            ]);
      });

      it('should parse over escaped new line in tag definitions', () => {
        const text = '<t\\n></t>';
        expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.TAG_CLOSE, '', 't'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse over escaped characters in tag definitions', () => {
        const text = '<t\u{000013}></t>';
        expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.TAG_CLOSE, '', 't'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should unescape characters in tag names', () => {
        const text = '<t\\x64></t\\x64>';
        expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 'td'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.TAG_CLOSE, '', 'td'],
          [lex.TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeSourceSpans(text, {escapedString: true})).toEqual([
          [lex.TokenType.TAG_OPEN_START, '<t\\x64'],
          [lex.TokenType.TAG_OPEN_END, '>'],
          [lex.TokenType.TAG_CLOSE, '</t\\x64>'],
          [lex.TokenType.EOF, ''],
        ]);
      });

      it('should unescape characters in attributes', () => {
        const text = '<t \\x64="\\x65"></t>';
        expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'],
          [lex.TokenType.ATTR_NAME, '', 'd'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.ATTR_VALUE, 'e'],
          [lex.TokenType.ATTR_QUOTE, '"'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.TAG_CLOSE, '', 't'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should parse over escaped new line in attribute values', () => {
        const text = '<t a=b\\n></t>';
        expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'],
          [lex.TokenType.ATTR_NAME, '', 'a'],
          [lex.TokenType.ATTR_VALUE, 'b'],
          [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.TAG_CLOSE, '', 't'],
          [lex.TokenType.EOF],
        ]);
      });

      it('should tokenize the correct span when there are escape sequences', () => {
        const text =
            'selector: "app-root",\ntemplate: "line 1\\n\\"line 2\\"\\nline 3",\ninputs: []';
        const range = {
          startPos: 33,
          startLine: 1,
          startCol: 10,
          endPos: 59,
        };
        expect(tokenizeAndHumanizeParts(text, {range, escapedString: true})).toEqual([
          [lex.TokenType.TEXT, 'line 1\n"line 2"\nline 3'],
          [lex.TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeSourceSpans(text, {range, escapedString: true})).toEqual([
          [lex.TokenType.TEXT, 'line 1\\n\\"line 2\\"\\nline 3'],
          [lex.TokenType.EOF, ''],
        ]);
      });

      it('should account for escape sequences when computing source spans ', () => {
        const text = '<t>line 1</t>\n' +  // <- unescaped line break
            '<t>line 2</t>\\n' +          // <- escaped line break
            '<t>line 3\\\n' +             // <- line continuation
            '</t>';
        expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
          [lex.TokenType.TAG_OPEN_START, '', 't'], [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.TEXT, 'line 1'], [lex.TokenType.TAG_CLOSE, '', 't'],
          [lex.TokenType.TEXT, '\n'],

          [lex.TokenType.TAG_OPEN_START, '', 't'], [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.TEXT, 'line 2'], [lex.TokenType.TAG_CLOSE, '', 't'],
          [lex.TokenType.TEXT, '\n'],

          [lex.TokenType.TAG_OPEN_START, '', 't'], [lex.TokenType.TAG_OPEN_END],
          [lex.TokenType.TEXT, 'line 3'],  // <- line continuation does not appear in token
          [lex.TokenType.TAG_CLOSE, '', 't'],

          [lex.TokenType.EOF]
        ]);
        expect(tokenizeAndHumanizeLineColumn(text, {escapedString: true})).toEqual([
          [lex.TokenType.TAG_OPEN_START, '0:0'],
          [lex.TokenType.TAG_OPEN_END, '0:2'],
          [lex.TokenType.TEXT, '0:3'],
          [lex.TokenType.TAG_CLOSE, '0:9'],
          [lex.TokenType.TEXT, '0:13'],  // <- real newline increments the row

          [lex.TokenType.TAG_OPEN_START, '1:0'],
          [lex.TokenType.TAG_OPEN_END, '1:2'],
          [lex.TokenType.TEXT, '1:3'],
          [lex.TokenType.TAG_CLOSE, '1:9'],
          [lex.TokenType.TEXT, '1:13'],  // <- escaped newline does not increment the row

          [lex.TokenType.TAG_OPEN_START, '1:15'],
          [lex.TokenType.TAG_OPEN_END, '1:17'],
          [lex.TokenType.TEXT, '1:18'],  // <- the line continuation increments the row
          [lex.TokenType.TAG_CLOSE, '2:0'],

          [lex.TokenType.EOF, '2:4'],
        ]);
        expect(tokenizeAndHumanizeSourceSpans(text, {escapedString: true})).toEqual([
          [lex.TokenType.TAG_OPEN_START, '<t'], [lex.TokenType.TAG_OPEN_END, '>'],
          [lex.TokenType.TEXT, 'line 1'], [lex.TokenType.TAG_CLOSE, '</t>'],
          [lex.TokenType.TEXT, '\n'],

          [lex.TokenType.TAG_OPEN_START, '<t'], [lex.TokenType.TAG_OPEN_END, '>'],
          [lex.TokenType.TEXT, 'line 2'], [lex.TokenType.TAG_CLOSE, '</t>'],
          [lex.TokenType.TEXT, '\\n'],

          [lex.TokenType.TAG_OPEN_START, '<t'], [lex.TokenType.TAG_OPEN_END, '>'],
          [lex.TokenType.TEXT, 'line 3\\\n'], [lex.TokenType.TAG_CLOSE, '</t>'],

          [lex.TokenType.EOF, '']
        ]);
      });
    });
  });
}

function tokenizeWithoutErrors(input: string, options?: lex.TokenizeOptions): lex.TokenizeResult {
  const tokenizeResult = lex.tokenize(input, 'someUrl', getHtmlTagDefinition, options);

  if (tokenizeResult.errors.length > 0) {
    const errorString = tokenizeResult.errors.join('\n');
    throw new Error(`Unexpected parse errors:\n${errorString}`);
  }

  return tokenizeResult;
}

function humanizeParts(tokens: lex.Token[]) {
  return tokens.map(token => [token.type, ...token.parts] as [lex.TokenType, ...string[]]);
}

function tokenizeAndHumanizeParts(input: string, options?: lex.TokenizeOptions): any[] {
  return humanizeParts(tokenizeWithoutErrors(input, options).tokens);
}

function tokenizeAndHumanizeSourceSpans(input: string, options?: lex.TokenizeOptions): any[] {
  return tokenizeWithoutErrors(input, options)
      .tokens.map(token => [<any>token.type, token.sourceSpan.toString()]);
}

function humanizeLineColumn(location: ParseLocation): string {
  return `${location.line}:${location.col}`;
}

function tokenizeAndHumanizeLineColumn(input: string, options?: lex.TokenizeOptions): any[] {
  return tokenizeWithoutErrors(input, options)
      .tokens.map(token => [<any>token.type, humanizeLineColumn(token.sourceSpan.start)]);
}

function tokenizeAndHumanizeFullStart(input: string, options?: lex.TokenizeOptions): any[] {
  return tokenizeWithoutErrors(input, options)
      .tokens.map(
          token =>
              [<any>token.type, humanizeLineColumn(token.sourceSpan.start),
               humanizeLineColumn(token.sourceSpan.fullStart)]);
}

function tokenizeAndHumanizeErrors(input: string, options?: lex.TokenizeOptions): any[] {
  return lex.tokenize(input, 'someUrl', getHtmlTagDefinition, options)
      .errors.map(e => [<any>e.tokenType, e.msg, humanizeLineColumn(e.span.start)]);
}
