/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getHtmlTagDefinition} from '../../src/ml_parser/html_tags';
import {tokenize, TokenizeOptions, TokenizeResult} from '../../src/ml_parser/lexer';
import {Token, TokenType} from '../../src/ml_parser/tokens';
import {ParseError, ParseLocation, ParseSourceFile, ParseSourceSpan} from '../../src/parse_util';

describe('HtmlLexer', () => {
  describe('line/column numbers', () => {
    it('should work without newlines', () => {
      expect(tokenizeAndHumanizeLineColumn('<t>a</t>')).toEqual([
        [TokenType.TAG_OPEN_START, '0:0'],
        [TokenType.TAG_OPEN_END, '0:2'],
        [TokenType.TEXT, '0:3'],
        [TokenType.TAG_CLOSE, '0:4'],
        [TokenType.EOF, '0:8'],
      ]);
    });

    it('should work with one newline', () => {
      expect(tokenizeAndHumanizeLineColumn('<t>\na</t>')).toEqual([
        [TokenType.TAG_OPEN_START, '0:0'],
        [TokenType.TAG_OPEN_END, '0:2'],
        [TokenType.TEXT, '0:3'],
        [TokenType.TAG_CLOSE, '1:1'],
        [TokenType.EOF, '1:5'],
      ]);
    });

    it('should work with multiple newlines', () => {
      expect(tokenizeAndHumanizeLineColumn('<t\n>\na</t>')).toEqual([
        [TokenType.TAG_OPEN_START, '0:0'],
        [TokenType.TAG_OPEN_END, '1:0'],
        [TokenType.TEXT, '1:1'],
        [TokenType.TAG_CLOSE, '2:1'],
        [TokenType.EOF, '2:5'],
      ]);
    });

    it('should work with CR and LF', () => {
      expect(tokenizeAndHumanizeLineColumn('<t\n>\r\na\r</t>')).toEqual([
        [TokenType.TAG_OPEN_START, '0:0'],
        [TokenType.TAG_OPEN_END, '1:0'],
        [TokenType.TEXT, '1:1'],
        [TokenType.TAG_CLOSE, '2:1'],
        [TokenType.EOF, '2:5'],
      ]);
    });

    it('should skip over leading trivia for source-span start', () => {
      expect(
        tokenizeAndHumanizeFullStart('<t>\n \t a</t>', {leadingTriviaChars: ['\n', ' ', '\t']}),
      ).toEqual([
        [TokenType.TAG_OPEN_START, '0:0', '0:0'],
        [TokenType.TAG_OPEN_END, '0:2', '0:2'],
        [TokenType.TEXT, '1:3', '0:3'],
        [TokenType.TAG_CLOSE, '1:4', '1:4'],
        [TokenType.EOF, '1:8', '1:8'],
      ]);
    });
  });

  describe('content ranges', () => {
    it('should only process the text within the range', () => {
      expect(
        tokenizeAndHumanizeSourceSpans(
          'pre 1\npre 2\npre 3 `line 1\nline 2\nline 3` post 1\n post 2\n post 3',
          {range: {startPos: 19, startLine: 2, startCol: 7, endPos: 39}},
        ),
      ).toEqual([
        [TokenType.TEXT, 'line 1\nline 2\nline 3'],
        [TokenType.EOF, ''],
      ]);
    });

    it('should take into account preceding (non-processed) lines and columns', () => {
      expect(
        tokenizeAndHumanizeLineColumn(
          'pre 1\npre 2\npre 3 `line 1\nline 2\nline 3` post 1\n post 2\n post 3',
          {range: {startPos: 19, startLine: 2, startCol: 7, endPos: 39}},
        ),
      ).toEqual([
        [TokenType.TEXT, '2:7'],
        [TokenType.EOF, '4:6'],
      ]);
    });
  });

  describe('comments', () => {
    it('should parse comments', () => {
      expect(tokenizeAndHumanizeParts('<!--t\ne\rs\r\nt-->')).toEqual([
        [TokenType.COMMENT_START],
        [TokenType.RAW_TEXT, 't\ne\ns\nt'],
        [TokenType.COMMENT_END],
        [TokenType.EOF],
      ]);
    });

    it('should store the locations', () => {
      expect(tokenizeAndHumanizeSourceSpans('<!--t\ne\rs\r\nt-->')).toEqual([
        [TokenType.COMMENT_START, '<!--'],
        [TokenType.RAW_TEXT, 't\ne\rs\r\nt'],
        [TokenType.COMMENT_END, '-->'],
        [TokenType.EOF, ''],
      ]);
    });

    it('should report <!- without -', () => {
      expect(tokenizeAndHumanizeErrors('<!-a')).toEqual([['Unexpected character "a"', '0:3']]);
    });

    it('should report missing end comment', () => {
      expect(tokenizeAndHumanizeErrors('<!--')).toEqual([['Unexpected character "EOF"', '0:4']]);
    });

    it('should accept comments finishing by too many dashes (even number)', () => {
      expect(tokenizeAndHumanizeSourceSpans('<!-- test ---->')).toEqual([
        [TokenType.COMMENT_START, '<!--'],
        [TokenType.RAW_TEXT, ' test --'],
        [TokenType.COMMENT_END, '-->'],
        [TokenType.EOF, ''],
      ]);
    });

    it('should accept comments finishing by too many dashes (odd number)', () => {
      expect(tokenizeAndHumanizeSourceSpans('<!-- test --->')).toEqual([
        [TokenType.COMMENT_START, '<!--'],
        [TokenType.RAW_TEXT, ' test -'],
        [TokenType.COMMENT_END, '-->'],
        [TokenType.EOF, ''],
      ]);
    });
  });

  describe('doctype', () => {
    it('should parse doctypes', () => {
      expect(tokenizeAndHumanizeParts('<!DOCTYPE html>')).toEqual([
        [TokenType.DOC_TYPE, 'DOCTYPE html'],
        [TokenType.EOF],
      ]);
    });

    it('should store the locations', () => {
      expect(tokenizeAndHumanizeSourceSpans('<!DOCTYPE html>')).toEqual([
        [TokenType.DOC_TYPE, '<!DOCTYPE html>'],
        [TokenType.EOF, ''],
      ]);
    });

    it('should report missing end doctype', () => {
      expect(tokenizeAndHumanizeErrors('<!')).toEqual([['Unexpected character "EOF"', '0:2']]);
    });
  });

  describe('CDATA', () => {
    it('should parse CDATA', () => {
      expect(tokenizeAndHumanizeParts('<![CDATA[t\ne\rs\r\nt]]>')).toEqual([
        [TokenType.CDATA_START],
        [TokenType.RAW_TEXT, 't\ne\ns\nt'],
        [TokenType.CDATA_END],
        [TokenType.EOF],
      ]);
    });

    it('should store the locations', () => {
      expect(tokenizeAndHumanizeSourceSpans('<![CDATA[t\ne\rs\r\nt]]>')).toEqual([
        [TokenType.CDATA_START, '<![CDATA['],
        [TokenType.RAW_TEXT, 't\ne\rs\r\nt'],
        [TokenType.CDATA_END, ']]>'],
        [TokenType.EOF, ''],
      ]);
    });

    it('should report <![ without CDATA[', () => {
      expect(tokenizeAndHumanizeErrors('<![a')).toEqual([['Unexpected character "a"', '0:3']]);
    });

    it('should report missing end cdata', () => {
      expect(tokenizeAndHumanizeErrors('<![CDATA[')).toEqual([
        ['Unexpected character "EOF"', '0:9'],
      ]);
    });
  });

  describe('open tags', () => {
    it('should parse open tags without prefix', () => {
      expect(tokenizeAndHumanizeParts('<test>')).toEqual([
        [TokenType.TAG_OPEN_START, '', 'test'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse namespace prefix', () => {
      expect(tokenizeAndHumanizeParts('<ns1:test>')).toEqual([
        [TokenType.TAG_OPEN_START, 'ns1', 'test'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse void tags', () => {
      expect(tokenizeAndHumanizeParts('<test/>')).toEqual([
        [TokenType.TAG_OPEN_START, '', 'test'],
        [TokenType.TAG_OPEN_END_VOID],
        [TokenType.EOF],
      ]);
    });

    it('should allow whitespace after the tag name', () => {
      expect(tokenizeAndHumanizeParts('<test >')).toEqual([
        [TokenType.TAG_OPEN_START, '', 'test'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should store the locations', () => {
      expect(tokenizeAndHumanizeSourceSpans('<test>')).toEqual([
        [TokenType.TAG_OPEN_START, '<test'],
        [TokenType.TAG_OPEN_END, '>'],
        [TokenType.EOF, ''],
      ]);
    });

    describe('tags', () => {
      it('terminated with EOF', () => {
        expect(tokenizeAndHumanizeSourceSpans('<div')).toEqual([
          [TokenType.INCOMPLETE_TAG_OPEN, '<div'],
          [TokenType.EOF, ''],
        ]);
      });

      it('after tag name', () => {
        expect(tokenizeAndHumanizeSourceSpans('<div<span><div</span>')).toEqual([
          [TokenType.INCOMPLETE_TAG_OPEN, '<div'],
          [TokenType.TAG_OPEN_START, '<span'],
          [TokenType.TAG_OPEN_END, '>'],
          [TokenType.INCOMPLETE_TAG_OPEN, '<div'],
          [TokenType.TAG_CLOSE, '</span>'],
          [TokenType.EOF, ''],
        ]);
      });

      it('in attribute', () => {
        expect(tokenizeAndHumanizeSourceSpans('<div class="hi" sty<span></span>')).toEqual([
          [TokenType.INCOMPLETE_TAG_OPEN, '<div'],
          [TokenType.ATTR_NAME, 'class'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, 'hi'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_NAME, 'sty'],
          [TokenType.TAG_OPEN_START, '<span'],
          [TokenType.TAG_OPEN_END, '>'],
          [TokenType.TAG_CLOSE, '</span>'],
          [TokenType.EOF, ''],
        ]);
      });

      it('after quote', () => {
        expect(tokenizeAndHumanizeSourceSpans('<div "<span></span>')).toEqual([
          [TokenType.INCOMPLETE_TAG_OPEN, '<div'],
          [TokenType.TEXT, '"'],
          [TokenType.TAG_OPEN_START, '<span'],
          [TokenType.TAG_OPEN_END, '>'],
          [TokenType.TAG_CLOSE, '</span>'],
          [TokenType.EOF, ''],
        ]);
      });
    });

    describe('component tags', () => {
      const options: TokenizeOptions = {selectorlessEnabled: true};

      it('should parse a basic component tag', () => {
        expect(tokenizeAndHumanizeParts('<MyComp>hello</MyComp>', options)).toEqual([
          [TokenType.COMPONENT_OPEN_START, 'MyComp', '', ''],
          [TokenType.COMPONENT_OPEN_END],
          [TokenType.TEXT, 'hello'],
          [TokenType.COMPONENT_CLOSE, 'MyComp', '', ''],
          [TokenType.EOF],
        ]);
      });

      it('should parse a component tag with a tag name', () => {
        expect(tokenizeAndHumanizeParts('<MyComp:button>hello</MyComp:button>', options)).toEqual([
          [TokenType.COMPONENT_OPEN_START, 'MyComp', '', 'button'],
          [TokenType.COMPONENT_OPEN_END],
          [TokenType.TEXT, 'hello'],
          [TokenType.COMPONENT_CLOSE, 'MyComp', '', 'button'],
          [TokenType.EOF],
        ]);
      });

      it('should parse a component tag with a tag name and namespace', () => {
        expect(
          tokenizeAndHumanizeParts('<MyComp:svg:title>hello</MyComp:svg:title>', options),
        ).toEqual([
          [TokenType.COMPONENT_OPEN_START, 'MyComp', 'svg', 'title'],
          [TokenType.COMPONENT_OPEN_END],
          [TokenType.TEXT, 'hello'],
          [TokenType.COMPONENT_CLOSE, 'MyComp', 'svg', 'title'],
          [TokenType.EOF],
        ]);
      });

      it('should parse a self-closing component tag', () => {
        expect(tokenizeAndHumanizeParts('<MyComp/>', options)).toEqual([
          [TokenType.COMPONENT_OPEN_START, 'MyComp', '', ''],
          [TokenType.COMPONENT_OPEN_END_VOID],
          [TokenType.EOF],
        ]);
      });

      it('should produce spans for component tags', () => {
        expect(
          tokenizeAndHumanizeSourceSpans('<MyComp:svg:title>hello</MyComp:svg:title>', options),
        ).toEqual([
          [TokenType.COMPONENT_OPEN_START, '<MyComp:svg:title'],
          [TokenType.COMPONENT_OPEN_END, '>'],
          [TokenType.TEXT, 'hello'],
          [TokenType.COMPONENT_CLOSE, '</MyComp:svg:title>'],
          [TokenType.EOF, ''],
        ]);
      });

      it('should parse an incomplete component open tag', () => {
        expect(
          tokenizeAndHumanizeParts('<MyComp:span class="hi" sty<span></span>', options),
        ).toEqual([
          [TokenType.INCOMPLETE_COMPONENT_OPEN, 'MyComp', '', 'span'],
          [TokenType.ATTR_NAME, '', 'class'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, 'hi'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_NAME, '', 'sty'],
          [TokenType.TAG_OPEN_START, '', 'span'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TAG_CLOSE, '', 'span'],
          [TokenType.EOF],
        ]);
      });

      it('should parse a component tag with raw text', () => {
        expect(
          tokenizeAndHumanizeParts(`<MyComp:script>t\ne\rs\r\nt</MyComp:script>`, options),
        ).toEqual([
          [TokenType.COMPONENT_OPEN_START, 'MyComp', '', 'script'],
          [TokenType.COMPONENT_OPEN_END],
          [TokenType.RAW_TEXT, 't\ne\ns\nt'],
          [TokenType.COMPONENT_CLOSE, 'MyComp', '', 'script'],
          [TokenType.EOF],
        ]);
      });

      it('should parse a component tag with escapable raw text', () => {
        expect(
          tokenizeAndHumanizeParts(`<MyComp:title>t\ne\rs\r\nt</MyComp:title>`, options),
        ).toEqual([
          [TokenType.COMPONENT_OPEN_START, 'MyComp', '', 'title'],
          [TokenType.COMPONENT_OPEN_END],
          [TokenType.ESCAPABLE_RAW_TEXT, 't\ne\ns\nt'],
          [TokenType.COMPONENT_CLOSE, 'MyComp', '', 'title'],
          [TokenType.EOF],
        ]);
      });
    });

    describe('selectorless directives', () => {
      const options: TokenizeOptions = {selectorlessEnabled: true};

      it('should parse a basic directive', () => {
        expect(tokenizeAndHumanizeParts('<div @MyDir></div>', options)).toEqual([
          [TokenType.TAG_OPEN_START, '', 'div'],
          [TokenType.DIRECTIVE_NAME, 'MyDir'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TAG_CLOSE, '', 'div'],
          [TokenType.EOF],
        ]);
      });

      it('should parse a directive with parentheses, but no attributes', () => {
        expect(tokenizeAndHumanizeParts('<div @MyDir()></div>', options)).toEqual([
          [TokenType.TAG_OPEN_START, '', 'div'],
          [TokenType.DIRECTIVE_NAME, 'MyDir'],
          [TokenType.DIRECTIVE_OPEN],
          [TokenType.DIRECTIVE_CLOSE],
          [TokenType.TAG_OPEN_END],
          [TokenType.TAG_CLOSE, '', 'div'],
          [TokenType.EOF],
        ]);
      });

      it('should parse a directive with a single attribute without a value', () => {
        expect(tokenizeAndHumanizeParts('<div @MyDir(foo)></div>', options)).toEqual([
          [TokenType.TAG_OPEN_START, '', 'div'],
          [TokenType.DIRECTIVE_NAME, 'MyDir'],
          [TokenType.DIRECTIVE_OPEN],
          [TokenType.ATTR_NAME, '', 'foo'],
          [TokenType.DIRECTIVE_CLOSE],
          [TokenType.TAG_OPEN_END],
          [TokenType.TAG_CLOSE, '', 'div'],
          [TokenType.EOF],
        ]);
      });

      it('should parse a directive with attributes', () => {
        const tokens = tokenizeAndHumanizeParts(
          '<div @MyDir(static="one" [bound]="expr" [(twoWay)]="expr" #ref="name" (click)="handler()")></div>',
          options,
        );

        expect(tokens).toEqual([
          [TokenType.TAG_OPEN_START, '', 'div'],
          [TokenType.DIRECTIVE_NAME, 'MyDir'],
          [TokenType.DIRECTIVE_OPEN],
          [TokenType.ATTR_NAME, '', 'static'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, 'one'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_NAME, '', '[bound]'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, 'expr'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_NAME, '', '[(twoWay)]'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, 'expr'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_NAME, '', '#ref'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, 'name'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_NAME, '', '(click)'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, 'handler()'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.DIRECTIVE_CLOSE],
          [TokenType.TAG_OPEN_END],
          [TokenType.TAG_CLOSE, '', 'div'],
          [TokenType.EOF],
        ]);
      });

      it('should parse a directive mixed in with other attributes', () => {
        const tokens = tokenizeAndHumanizeParts(
          '<div before="value" @OneDir([one]="1" two="2") middle @TwoDir @ThreeDir((three)="handleThree()") after="value"></div>',
          options,
        );

        expect(tokens).toEqual([
          [TokenType.TAG_OPEN_START, '', 'div'],
          [TokenType.ATTR_NAME, '', 'before'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, 'value'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.DIRECTIVE_NAME, 'OneDir'],
          [TokenType.DIRECTIVE_OPEN],
          [TokenType.ATTR_NAME, '', '[one]'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, '1'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_NAME, '', 'two'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, '2'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.DIRECTIVE_CLOSE],
          [TokenType.ATTR_NAME, '', 'middle'],
          [TokenType.DIRECTIVE_NAME, 'TwoDir'],
          [TokenType.DIRECTIVE_NAME, 'ThreeDir'],
          [TokenType.DIRECTIVE_OPEN],
          [TokenType.ATTR_NAME, '', '(three)'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, 'handleThree()'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.DIRECTIVE_CLOSE],
          [TokenType.ATTR_NAME, '', 'after'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, 'value'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TAG_CLOSE, '', 'div'],
          [TokenType.EOF],
        ]);
      });

      it('should not pick up selectorless-like text inside a tag', () => {
        expect(tokenizeAndHumanizeParts('<div>@MyDir()</div>', options)).toEqual([
          [TokenType.TAG_OPEN_START, '', 'div'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TEXT, '@MyDir()'],
          [TokenType.TAG_CLOSE, '', 'div'],
          [TokenType.EOF],
        ]);
      });

      it('should not pick up selectorless-like text inside an attribute', () => {
        expect(tokenizeAndHumanizeParts('<div hello="@MyDir"></div>', options)).toEqual([
          [TokenType.TAG_OPEN_START, '', 'div'],
          [TokenType.ATTR_NAME, '', 'hello'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, '@MyDir'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TAG_CLOSE, '', 'div'],
          [TokenType.EOF],
        ]);
      });

      it('should produce spans for directives', () => {
        const tokens = tokenizeAndHumanizeSourceSpans(
          '<div @Empty @NoAttrs() @WithAttr([one]="1" two="2") @WithSimpleAttr(simple)></div>',
          options,
        );

        expect(tokens).toEqual([
          [TokenType.TAG_OPEN_START, '<div'],
          [TokenType.DIRECTIVE_NAME, '@Empty'],
          [TokenType.DIRECTIVE_NAME, '@NoAttrs'],
          [TokenType.DIRECTIVE_OPEN, '('],
          [TokenType.DIRECTIVE_CLOSE, ')'],
          [TokenType.DIRECTIVE_NAME, '@WithAttr'],
          [TokenType.DIRECTIVE_OPEN, '('],
          [TokenType.ATTR_NAME, '[one]'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, '1'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_NAME, 'two'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, '2'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.DIRECTIVE_CLOSE, ')'],
          [TokenType.DIRECTIVE_NAME, '@WithSimpleAttr'],
          [TokenType.DIRECTIVE_OPEN, '('],
          [TokenType.ATTR_NAME, 'simple'],
          [TokenType.DIRECTIVE_CLOSE, ')'],
          [TokenType.TAG_OPEN_END, '>'],
          [TokenType.TAG_CLOSE, '</div>'],
          [TokenType.EOF, ''],
        ]);
      });

      it('should not capture whitespace in directive spans', () => {
        const tokens = tokenizeAndHumanizeSourceSpans(
          '<div    @Dir   (  one="1"    (two)="handleTwo()"     )     ></div>',
          options,
        );

        expect(tokens).toEqual([
          [TokenType.TAG_OPEN_START, '<div'],
          [TokenType.DIRECTIVE_NAME, '@Dir'],
          [TokenType.DIRECTIVE_OPEN, '('],
          [TokenType.ATTR_NAME, 'one'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, '1'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_NAME, '(two)'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, 'handleTwo()'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.DIRECTIVE_CLOSE, ')'],
          [TokenType.TAG_OPEN_END, '>'],
          [TokenType.TAG_CLOSE, '</div>'],
          [TokenType.EOF, ''],
        ]);
      });
    });

    describe('escapable raw text', () => {
      it('should parse text', () => {
        expect(tokenizeAndHumanizeParts(`<title>t\ne\rs\r\nt</title>`)).toEqual([
          [TokenType.TAG_OPEN_START, '', 'title'],
          [TokenType.TAG_OPEN_END],
          [TokenType.ESCAPABLE_RAW_TEXT, 't\ne\ns\nt'],
          [TokenType.TAG_CLOSE, '', 'title'],
          [TokenType.EOF],
        ]);
      });

      it('should detect entities', () => {
        expect(tokenizeAndHumanizeParts(`<title>&amp;</title>`)).toEqual([
          [TokenType.TAG_OPEN_START, '', 'title'],
          [TokenType.TAG_OPEN_END],
          [TokenType.ESCAPABLE_RAW_TEXT, ''],
          [TokenType.ENCODED_ENTITY, '&', '&amp;'],
          [TokenType.ESCAPABLE_RAW_TEXT, ''],
          [TokenType.TAG_CLOSE, '', 'title'],
          [TokenType.EOF],
        ]);
      });

      it('should ignore other opening tags', () => {
        expect(tokenizeAndHumanizeParts(`<title>a<div></title>`)).toEqual([
          [TokenType.TAG_OPEN_START, '', 'title'],
          [TokenType.TAG_OPEN_END],
          [TokenType.ESCAPABLE_RAW_TEXT, 'a<div>'],
          [TokenType.TAG_CLOSE, '', 'title'],
          [TokenType.EOF],
        ]);
      });

      it('should ignore other closing tags', () => {
        expect(tokenizeAndHumanizeParts(`<title>a</test></title>`)).toEqual([
          [TokenType.TAG_OPEN_START, '', 'title'],
          [TokenType.TAG_OPEN_END],
          [TokenType.ESCAPABLE_RAW_TEXT, 'a</test>'],
          [TokenType.TAG_CLOSE, '', 'title'],
          [TokenType.EOF],
        ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans(`<title>a</title>`)).toEqual([
          [TokenType.TAG_OPEN_START, '<title'],
          [TokenType.TAG_OPEN_END, '>'],
          [TokenType.ESCAPABLE_RAW_TEXT, 'a'],
          [TokenType.TAG_CLOSE, '</title>'],
          [TokenType.EOF, ''],
        ]);
      });
    });

    describe('parsable data', () => {
      it('should parse an SVG <title> tag', () => {
        expect(tokenizeAndHumanizeParts(`<svg:title>test</svg:title>`)).toEqual([
          [TokenType.TAG_OPEN_START, 'svg', 'title'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TEXT, 'test'],
          [TokenType.TAG_CLOSE, 'svg', 'title'],
          [TokenType.EOF],
        ]);
      });

      it('should parse an SVG <title> tag with children', () => {
        expect(tokenizeAndHumanizeParts(`<svg:title><f>test</f></svg:title>`)).toEqual([
          [TokenType.TAG_OPEN_START, 'svg', 'title'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TAG_OPEN_START, '', 'f'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TEXT, 'test'],
          [TokenType.TAG_CLOSE, '', 'f'],
          [TokenType.TAG_CLOSE, 'svg', 'title'],
          [TokenType.EOF],
        ]);
      });
    });

    describe('expansion forms', () => {
      it('should parse an expansion form', () => {
        expect(
          tokenizeAndHumanizeParts('{one.two, three, =4 {four} =5 {five} foo {bar} }', {
            tokenizeExpansionForms: true,
          }),
        ).toEqual([
          [TokenType.EXPANSION_FORM_START],
          [TokenType.RAW_TEXT, 'one.two'],
          [TokenType.RAW_TEXT, 'three'],
          [TokenType.EXPANSION_CASE_VALUE, '=4'],
          [TokenType.EXPANSION_CASE_EXP_START],
          [TokenType.TEXT, 'four'],
          [TokenType.EXPANSION_CASE_EXP_END],
          [TokenType.EXPANSION_CASE_VALUE, '=5'],
          [TokenType.EXPANSION_CASE_EXP_START],
          [TokenType.TEXT, 'five'],
          [TokenType.EXPANSION_CASE_EXP_END],
          [TokenType.EXPANSION_CASE_VALUE, 'foo'],
          [TokenType.EXPANSION_CASE_EXP_START],
          [TokenType.TEXT, 'bar'],
          [TokenType.EXPANSION_CASE_EXP_END],
          [TokenType.EXPANSION_FORM_END],
          [TokenType.EOF],
        ]);
      });

      it('should parse an expansion form with text elements surrounding it', () => {
        expect(
          tokenizeAndHumanizeParts('before{one.two, three, =4 {four}}after', {
            tokenizeExpansionForms: true,
          }),
        ).toEqual([
          [TokenType.TEXT, 'before'],
          [TokenType.EXPANSION_FORM_START],
          [TokenType.RAW_TEXT, 'one.two'],
          [TokenType.RAW_TEXT, 'three'],
          [TokenType.EXPANSION_CASE_VALUE, '=4'],
          [TokenType.EXPANSION_CASE_EXP_START],
          [TokenType.TEXT, 'four'],
          [TokenType.EXPANSION_CASE_EXP_END],
          [TokenType.EXPANSION_FORM_END],
          [TokenType.TEXT, 'after'],
          [TokenType.EOF],
        ]);
      });

      it('should parse an expansion form as a tag single child', () => {
        expect(
          tokenizeAndHumanizeParts('<div><span>{a, b, =4 {c}}</span></div>', {
            tokenizeExpansionForms: true,
          }),
        ).toEqual([
          [TokenType.TAG_OPEN_START, '', 'div'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TAG_OPEN_START, '', 'span'],
          [TokenType.TAG_OPEN_END],
          [TokenType.EXPANSION_FORM_START],
          [TokenType.RAW_TEXT, 'a'],
          [TokenType.RAW_TEXT, 'b'],
          [TokenType.EXPANSION_CASE_VALUE, '=4'],
          [TokenType.EXPANSION_CASE_EXP_START],
          [TokenType.TEXT, 'c'],
          [TokenType.EXPANSION_CASE_EXP_END],
          [TokenType.EXPANSION_FORM_END],
          [TokenType.TAG_CLOSE, '', 'span'],
          [TokenType.TAG_CLOSE, '', 'div'],
          [TokenType.EOF],
        ]);
      });

      it('should parse an expansion form with whitespace surrounding it', () => {
        expect(
          tokenizeAndHumanizeParts('<div><span> {a, b, =4 {c}} </span></div>', {
            tokenizeExpansionForms: true,
          }),
        ).toEqual([
          [TokenType.TAG_OPEN_START, '', 'div'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TAG_OPEN_START, '', 'span'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TEXT, ' '],
          [TokenType.EXPANSION_FORM_START],
          [TokenType.RAW_TEXT, 'a'],
          [TokenType.RAW_TEXT, 'b'],
          [TokenType.EXPANSION_CASE_VALUE, '=4'],
          [TokenType.EXPANSION_CASE_EXP_START],
          [TokenType.TEXT, 'c'],
          [TokenType.EXPANSION_CASE_EXP_END],
          [TokenType.EXPANSION_FORM_END],
          [TokenType.TEXT, ' '],
          [TokenType.TAG_CLOSE, '', 'span'],
          [TokenType.TAG_CLOSE, '', 'div'],
          [TokenType.EOF],
        ]);
      });

      it('should parse an expansion forms with elements in it', () => {
        expect(
          tokenizeAndHumanizeParts('{one.two, three, =4 {four <b>a</b>}}', {
            tokenizeExpansionForms: true,
          }),
        ).toEqual([
          [TokenType.EXPANSION_FORM_START],
          [TokenType.RAW_TEXT, 'one.two'],
          [TokenType.RAW_TEXT, 'three'],
          [TokenType.EXPANSION_CASE_VALUE, '=4'],
          [TokenType.EXPANSION_CASE_EXP_START],
          [TokenType.TEXT, 'four '],
          [TokenType.TAG_OPEN_START, '', 'b'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TEXT, 'a'],
          [TokenType.TAG_CLOSE, '', 'b'],
          [TokenType.EXPANSION_CASE_EXP_END],
          [TokenType.EXPANSION_FORM_END],
          [TokenType.EOF],
        ]);
      });

      it('should parse an expansion forms containing an interpolation', () => {
        expect(
          tokenizeAndHumanizeParts('{one.two, three, =4 {four {{a}}}}', {
            tokenizeExpansionForms: true,
          }),
        ).toEqual([
          [TokenType.EXPANSION_FORM_START],
          [TokenType.RAW_TEXT, 'one.two'],
          [TokenType.RAW_TEXT, 'three'],
          [TokenType.EXPANSION_CASE_VALUE, '=4'],
          [TokenType.EXPANSION_CASE_EXP_START],
          [TokenType.TEXT, 'four '],
          [TokenType.INTERPOLATION, '{{', 'a', '}}'],
          [TokenType.TEXT, ''],
          [TokenType.EXPANSION_CASE_EXP_END],
          [TokenType.EXPANSION_FORM_END],
          [TokenType.EOF],
        ]);
      });

      it('should parse nested expansion forms', () => {
        expect(
          tokenizeAndHumanizeParts(`{one.two, three, =4 { {xx, yy, =x {one}} }}`, {
            tokenizeExpansionForms: true,
          }),
        ).toEqual([
          [TokenType.EXPANSION_FORM_START],
          [TokenType.RAW_TEXT, 'one.two'],
          [TokenType.RAW_TEXT, 'three'],
          [TokenType.EXPANSION_CASE_VALUE, '=4'],
          [TokenType.EXPANSION_CASE_EXP_START],
          [TokenType.EXPANSION_FORM_START],
          [TokenType.RAW_TEXT, 'xx'],
          [TokenType.RAW_TEXT, 'yy'],
          [TokenType.EXPANSION_CASE_VALUE, '=x'],
          [TokenType.EXPANSION_CASE_EXP_START],
          [TokenType.TEXT, 'one'],
          [TokenType.EXPANSION_CASE_EXP_END],
          [TokenType.EXPANSION_FORM_END],
          [TokenType.TEXT, ' '],
          [TokenType.EXPANSION_CASE_EXP_END],
          [TokenType.EXPANSION_FORM_END],
          [TokenType.EOF],
        ]);
      });

      describe('[line ending normalization', () => {
        describe('{escapedString: true}', () => {
          it('should normalize line-endings in expansion forms if `i18nNormalizeLineEndingsInICUs` is true', () => {
            const result = tokenizeWithoutErrors(
              `{\r\n` +
                `    messages.length,\r\n` +
                `    plural,\r\n` +
                `    =0 {You have \r\nno\r\n messages}\r\n` +
                `    =1 {One {{message}}}}\r\n`,
              {
                tokenizeExpansionForms: true,
                escapedString: true,
                i18nNormalizeLineEndingsInICUs: true,
              },
            );

            expect(humanizeParts(result.tokens)).toEqual([
              [TokenType.EXPANSION_FORM_START],
              [TokenType.RAW_TEXT, '\n    messages.length'],
              [TokenType.RAW_TEXT, 'plural'],
              [TokenType.EXPANSION_CASE_VALUE, '=0'],
              [TokenType.EXPANSION_CASE_EXP_START],
              [TokenType.TEXT, 'You have \nno\n messages'],
              [TokenType.EXPANSION_CASE_EXP_END],
              [TokenType.EXPANSION_CASE_VALUE, '=1'],
              [TokenType.EXPANSION_CASE_EXP_START],
              [TokenType.TEXT, 'One '],
              [TokenType.INTERPOLATION, '{{', 'message', '}}'],
              [TokenType.TEXT, ''],
              [TokenType.EXPANSION_CASE_EXP_END],
              [TokenType.EXPANSION_FORM_END],
              [TokenType.TEXT, '\n'],
              [TokenType.EOF],
            ]);

            expect(result.nonNormalizedIcuExpressions).toEqual([]);
          });

          it('should not normalize line-endings in ICU expressions when `i18nNormalizeLineEndingsInICUs` is not defined', () => {
            const result = tokenizeWithoutErrors(
              `{\r\n` +
                `    messages.length,\r\n` +
                `    plural,\r\n` +
                `    =0 {You have \r\nno\r\n messages}\r\n` +
                `    =1 {One {{message}}}}\r\n`,
              {tokenizeExpansionForms: true, escapedString: true},
            );

            expect(humanizeParts(result.tokens)).toEqual([
              [TokenType.EXPANSION_FORM_START],
              [TokenType.RAW_TEXT, '\r\n    messages.length'],
              [TokenType.RAW_TEXT, 'plural'],
              [TokenType.EXPANSION_CASE_VALUE, '=0'],
              [TokenType.EXPANSION_CASE_EXP_START],
              [TokenType.TEXT, 'You have \nno\n messages'],
              [TokenType.EXPANSION_CASE_EXP_END],
              [TokenType.EXPANSION_CASE_VALUE, '=1'],
              [TokenType.EXPANSION_CASE_EXP_START],
              [TokenType.TEXT, 'One '],
              [TokenType.INTERPOLATION, '{{', 'message', '}}'],
              [TokenType.TEXT, ''],
              [TokenType.EXPANSION_CASE_EXP_END],
              [TokenType.EXPANSION_FORM_END],
              [TokenType.TEXT, '\n'],
              [TokenType.EOF],
            ]);

            expect(result.nonNormalizedIcuExpressions!.length).toBe(1);
            expect(result.nonNormalizedIcuExpressions![0].sourceSpan.toString()).toEqual(
              '\r\n    messages.length',
            );
          });

          it('should not normalize line endings in nested expansion forms when `i18nNormalizeLineEndingsInICUs` is not defined', () => {
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
              {tokenizeExpansionForms: true, escapedString: true},
            );
            expect(humanizeParts(result.tokens)).toEqual([
              [TokenType.EXPANSION_FORM_START],
              [TokenType.RAW_TEXT, '\r\n  messages.length'],
              [TokenType.RAW_TEXT, 'plural'],
              [TokenType.EXPANSION_CASE_VALUE, '=0'],
              [TokenType.EXPANSION_CASE_EXP_START],
              [TokenType.TEXT, 'zero \n       '],

              [TokenType.EXPANSION_FORM_START],
              [TokenType.RAW_TEXT, '\r\n         p.gender'],
              [TokenType.RAW_TEXT, 'select'],
              [TokenType.EXPANSION_CASE_VALUE, 'male'],
              [TokenType.EXPANSION_CASE_EXP_START],
              [TokenType.TEXT, 'm'],
              [TokenType.EXPANSION_CASE_EXP_END],
              [TokenType.EXPANSION_FORM_END],

              [TokenType.TEXT, '\n     '],
              [TokenType.EXPANSION_CASE_EXP_END],
              [TokenType.EXPANSION_FORM_END],
              [TokenType.EOF],
            ]);

            expect(result.nonNormalizedIcuExpressions!.length).toBe(2);
            expect(result.nonNormalizedIcuExpressions![0].sourceSpan.toString()).toEqual(
              '\r\n  messages.length',
            );
            expect(result.nonNormalizedIcuExpressions![1].sourceSpan.toString()).toEqual(
              '\r\n         p.gender',
            );
          });
        });

        describe('{escapedString: false}', () => {
          it('should normalize line-endings in expansion forms if `i18nNormalizeLineEndingsInICUs` is true', () => {
            const result = tokenizeWithoutErrors(
              `{\r\n` +
                `    messages.length,\r\n` +
                `    plural,\r\n` +
                `    =0 {You have \r\nno\r\n messages}\r\n` +
                `    =1 {One {{message}}}}\r\n`,
              {
                tokenizeExpansionForms: true,
                escapedString: false,
                i18nNormalizeLineEndingsInICUs: true,
              },
            );

            expect(humanizeParts(result.tokens)).toEqual([
              [TokenType.EXPANSION_FORM_START],
              [TokenType.RAW_TEXT, '\n    messages.length'],
              [TokenType.RAW_TEXT, 'plural'],
              [TokenType.EXPANSION_CASE_VALUE, '=0'],
              [TokenType.EXPANSION_CASE_EXP_START],
              [TokenType.TEXT, 'You have \nno\n messages'],
              [TokenType.EXPANSION_CASE_EXP_END],
              [TokenType.EXPANSION_CASE_VALUE, '=1'],
              [TokenType.EXPANSION_CASE_EXP_START],
              [TokenType.TEXT, 'One '],
              [TokenType.INTERPOLATION, '{{', 'message', '}}'],
              [TokenType.TEXT, ''],
              [TokenType.EXPANSION_CASE_EXP_END],
              [TokenType.EXPANSION_FORM_END],
              [TokenType.TEXT, '\n'],
              [TokenType.EOF],
            ]);

            expect(result.nonNormalizedIcuExpressions).toEqual([]);
          });

          it('should not normalize line-endings in ICU expressions when `i18nNormalizeLineEndingsInICUs` is not defined', () => {
            const result = tokenizeWithoutErrors(
              `{\r\n` +
                `    messages.length,\r\n` +
                `    plural,\r\n` +
                `    =0 {You have \r\nno\r\n messages}\r\n` +
                `    =1 {One {{message}}}}\r\n`,
              {tokenizeExpansionForms: true, escapedString: false},
            );

            expect(humanizeParts(result.tokens)).toEqual([
              [TokenType.EXPANSION_FORM_START],
              [TokenType.RAW_TEXT, '\r\n    messages.length'],
              [TokenType.RAW_TEXT, 'plural'],
              [TokenType.EXPANSION_CASE_VALUE, '=0'],
              [TokenType.EXPANSION_CASE_EXP_START],
              [TokenType.TEXT, 'You have \nno\n messages'],
              [TokenType.EXPANSION_CASE_EXP_END],
              [TokenType.EXPANSION_CASE_VALUE, '=1'],
              [TokenType.EXPANSION_CASE_EXP_START],
              [TokenType.TEXT, 'One '],
              [TokenType.INTERPOLATION, '{{', 'message', '}}'],
              [TokenType.TEXT, ''],
              [TokenType.EXPANSION_CASE_EXP_END],
              [TokenType.EXPANSION_FORM_END],
              [TokenType.TEXT, '\n'],
              [TokenType.EOF],
            ]);

            expect(result.nonNormalizedIcuExpressions!.length).toBe(1);
            expect(result.nonNormalizedIcuExpressions![0].sourceSpan.toString()).toEqual(
              '\r\n    messages.length',
            );
          });

          it('should not normalize line endings in nested expansion forms when `i18nNormalizeLineEndingsInICUs` is not defined', () => {
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
              {tokenizeExpansionForms: true},
            );

            expect(humanizeParts(result.tokens)).toEqual([
              [TokenType.EXPANSION_FORM_START],
              [TokenType.RAW_TEXT, '\r\n  messages.length'],
              [TokenType.RAW_TEXT, 'plural'],
              [TokenType.EXPANSION_CASE_VALUE, '=0'],
              [TokenType.EXPANSION_CASE_EXP_START],
              [TokenType.TEXT, 'zero \n       '],

              [TokenType.EXPANSION_FORM_START],
              [TokenType.RAW_TEXT, '\r\n         p.gender'],
              [TokenType.RAW_TEXT, 'select'],
              [TokenType.EXPANSION_CASE_VALUE, 'male'],
              [TokenType.EXPANSION_CASE_EXP_START],
              [TokenType.TEXT, 'm'],
              [TokenType.EXPANSION_CASE_EXP_END],
              [TokenType.EXPANSION_FORM_END],

              [TokenType.TEXT, '\n     '],
              [TokenType.EXPANSION_CASE_EXP_END],
              [TokenType.EXPANSION_FORM_END],
              [TokenType.EOF],
            ]);

            expect(result.nonNormalizedIcuExpressions!.length).toBe(2);
            expect(result.nonNormalizedIcuExpressions![0].sourceSpan.toString()).toEqual(
              '\r\n  messages.length',
            );
            expect(result.nonNormalizedIcuExpressions![1].sourceSpan.toString()).toEqual(
              '\r\n         p.gender',
            );
          });
        });
      });
    });

    describe('errors', () => {
      it('should report unescaped "{" on error', () => {
        expect(
          tokenizeAndHumanizeErrors(`<p>before { after</p>`, {tokenizeExpansionForms: true}),
        ).toEqual([
          [
            `Unexpected character "EOF" (Do you have an unescaped "{" in your template? Use "{{ '{' }}") to escape it.)`,
            '0:21',
          ],
        ]);
      });

      it('should report unescaped "{" as an error, even after a prematurely terminated interpolation', () => {
        expect(
          tokenizeAndHumanizeErrors(`<code>{{b}<!---->}</code><pre>import {a} from 'a';</pre>`, {
            tokenizeExpansionForms: true,
          }),
        ).toEqual([
          [
            `Unexpected character "EOF" (Do you have an unescaped "{" in your template? Use "{{ '{' }}") to escape it.)`,
            '0:56',
          ],
        ]);
      });

      it('should include 2 lines of context in message', () => {
        const src = '111\n222\n333\nE\n444\n555\n666\n';
        const file = new ParseSourceFile(src, 'file://');
        const location = new ParseLocation(file, 12, 123, 456);
        const span = new ParseSourceSpan(location, location);
        const error = new ParseError(span, '**ERROR**');
        expect(error.toString()).toEqual(
          `**ERROR** ("\n222\n333\n[ERROR ->]E\n444\n555\n"): file://@123:456`,
        );
      });
    });

    describe('unicode characters', () => {
      it('should support unicode characters', () => {
        expect(tokenizeAndHumanizeSourceSpans(`<p>İ</p>`)).toEqual([
          [TokenType.TAG_OPEN_START, '<p'],
          [TokenType.TAG_OPEN_END, '>'],
          [TokenType.TEXT, 'İ'],
          [TokenType.TAG_CLOSE, '</p>'],
          [TokenType.EOF, ''],
        ]);
      });
    });

    describe('(processing escaped strings)', () => {
      it('should unescape standard escape sequences', () => {
        expect(tokenizeAndHumanizeParts("\\' \\' \\'", {escapedString: true})).toEqual([
          [TokenType.TEXT, "' ' '"],
          [TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\" \\" \\"', {escapedString: true})).toEqual([
          [TokenType.TEXT, '" " "'],
          [TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\` \\` \\`', {escapedString: true})).toEqual([
          [TokenType.TEXT, '` ` `'],
          [TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\\\ \\\\ \\\\', {escapedString: true})).toEqual([
          [TokenType.TEXT, '\\ \\ \\'],
          [TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\n \\n \\n', {escapedString: true})).toEqual([
          [TokenType.TEXT, '\n \n \n'],
          [TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\r{{\\r}}\\r', {escapedString: true})).toEqual([
          // post processing converts `\r` to `\n`
          [TokenType.TEXT, '\n'],
          [TokenType.INTERPOLATION, '{{', '\n', '}}'],
          [TokenType.TEXT, '\n'],
          [TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\v \\v \\v', {escapedString: true})).toEqual([
          [TokenType.TEXT, '\v \v \v'],
          [TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\t \\t \\t', {escapedString: true})).toEqual([
          [TokenType.TEXT, '\t \t \t'],
          [TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\b \\b \\b', {escapedString: true})).toEqual([
          [TokenType.TEXT, '\b \b \b'],
          [TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\f \\f \\f', {escapedString: true})).toEqual([
          [TokenType.TEXT, '\f \f \f'],
          [TokenType.EOF],
        ]);
        expect(
          tokenizeAndHumanizeParts('\\\' \\" \\` \\\\ \\n \\r \\v \\t \\b \\f', {
            escapedString: true,
          }),
        ).toEqual([[TokenType.TEXT, '\' " ` \\ \n \n \v \t \b \f'], [TokenType.EOF]]);
      });

      it('should unescape null sequences', () => {
        expect(tokenizeAndHumanizeParts('\\0', {escapedString: true})).toEqual([[TokenType.EOF]]);
        // \09 is not an octal number so the \0 is taken as EOF
        expect(tokenizeAndHumanizeParts('\\09', {escapedString: true})).toEqual([[TokenType.EOF]]);
      });

      it('should unescape octal sequences', () => {
        // \19 is read as an octal `\1` followed by a normal char `9`
        // \1234 is read as an octal `\123` followed by a normal char `4`
        // \999 is not an octal number so its backslash just gets removed.
        expect(
          tokenizeAndHumanizeParts('\\001 \\01 \\1 \\12 \\223 \\19 \\2234 \\999', {
            escapedString: true,
          }),
        ).toEqual([[TokenType.TEXT, '\x01 \x01 \x01 \x0A \x93 \x019 \x934 999'], [TokenType.EOF]]);
      });

      it('should unescape hex sequences', () => {
        expect(tokenizeAndHumanizeParts('\\x12 \\x4F \\xDC', {escapedString: true})).toEqual([
          [TokenType.TEXT, '\x12 \x4F \xDC'],
          [TokenType.EOF],
        ]);
      });

      it('should report an error on an invalid hex sequence', () => {
        expect(tokenizeAndHumanizeErrors('\\xGG', {escapedString: true})).toEqual([
          ['Invalid hexadecimal escape sequence', '0:2'],
        ]);

        expect(tokenizeAndHumanizeErrors('abc \\x xyz', {escapedString: true})).toEqual([
          ['Invalid hexadecimal escape sequence', '0:6'],
        ]);

        expect(tokenizeAndHumanizeErrors('abc\\x', {escapedString: true})).toEqual([
          ['Unexpected character "EOF"', '0:5'],
        ]);
      });

      it('should unescape fixed length Unicode sequences', () => {
        expect(tokenizeAndHumanizeParts('\\u0123 \\uABCD', {escapedString: true})).toEqual([
          [TokenType.TEXT, '\u0123 \uABCD'],
          [TokenType.EOF],
        ]);
      });

      it('should error on an invalid fixed length Unicode sequence', () => {
        expect(tokenizeAndHumanizeErrors('\\uGGGG', {escapedString: true})).toEqual([
          ['Invalid hexadecimal escape sequence', '0:2'],
        ]);
      });

      it('should unescape variable length Unicode sequences', () => {
        expect(
          tokenizeAndHumanizeParts('\\u{01} \\u{ABC} \\u{1234} \\u{123AB}', {escapedString: true}),
        ).toEqual([[TokenType.TEXT, '\u{01} \u{ABC} \u{1234} \u{123AB}'], [TokenType.EOF]]);
      });

      it('should error on an invalid variable length Unicode sequence', () => {
        expect(tokenizeAndHumanizeErrors('\\u{GG}', {escapedString: true})).toEqual([
          ['Invalid hexadecimal escape sequence', '0:3'],
        ]);
      });

      it('should unescape line continuations', () => {
        expect(tokenizeAndHumanizeParts('abc\\\ndef', {escapedString: true})).toEqual([
          [TokenType.TEXT, 'abcdef'],
          [TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeParts('\\\nx\\\ny\\\n', {escapedString: true})).toEqual([
          [TokenType.TEXT, 'xy'],
          [TokenType.EOF],
        ]);
      });

      it('should remove backslash from "non-escape" sequences', () => {
        expect(tokenizeAndHumanizeParts('a g ~', {escapedString: true})).toEqual([
          [TokenType.TEXT, 'a g ~'],
          [TokenType.EOF],
        ]);
      });

      it('should unescape sequences in plain text', () => {
        expect(
          tokenizeAndHumanizeParts('abc\ndef\\nghi\\tjkl\\`\\\'\\"mno', {escapedString: true}),
        ).toEqual([[TokenType.TEXT, 'abc\ndef\nghi\tjkl`\'"mno'], [TokenType.EOF]]);
      });

      it('should unescape sequences in raw text', () => {
        expect(
          tokenizeAndHumanizeParts('<script>abc\ndef\\nghi\\tjkl\\`\\\'\\"mno</script>', {
            escapedString: true,
          }),
        ).toEqual([
          [TokenType.TAG_OPEN_START, '', 'script'],
          [TokenType.TAG_OPEN_END],
          [TokenType.RAW_TEXT, 'abc\ndef\nghi\tjkl`\'"mno'],
          [TokenType.TAG_CLOSE, '', 'script'],
          [TokenType.EOF],
        ]);
      });

      it('should unescape sequences in escapable raw text', () => {
        expect(
          tokenizeAndHumanizeParts('<title>abc\ndef\\nghi\\tjkl\\`\\\'\\"mno</title>', {
            escapedString: true,
          }),
        ).toEqual([
          [TokenType.TAG_OPEN_START, '', 'title'],
          [TokenType.TAG_OPEN_END],
          [TokenType.ESCAPABLE_RAW_TEXT, 'abc\ndef\nghi\tjkl`\'"mno'],
          [TokenType.TAG_CLOSE, '', 'title'],
          [TokenType.EOF],
        ]);
      });

      it('should parse over escape sequences in tag definitions', () => {
        expect(
          tokenizeAndHumanizeParts('<t a=\\"b\\" \\n c=\\\'d\\\'>', {escapedString: true}),
        ).toEqual([
          [TokenType.TAG_OPEN_START, '', 't'],
          [TokenType.ATTR_NAME, '', 'a'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, 'b'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_NAME, '', 'c'],
          [TokenType.ATTR_QUOTE, "'"],
          [TokenType.ATTR_VALUE_TEXT, 'd'],
          [TokenType.ATTR_QUOTE, "'"],
          [TokenType.TAG_OPEN_END],
          [TokenType.EOF],
        ]);
      });

      it('should parse over escaped new line in tag definitions', () => {
        const text = '<t\\n></t>';
        expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
          [TokenType.TAG_OPEN_START, '', 't'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TAG_CLOSE, '', 't'],
          [TokenType.EOF],
        ]);
      });

      it('should parse over escaped characters in tag definitions', () => {
        const text = '<t\u{000013}></t>';
        expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
          [TokenType.TAG_OPEN_START, '', 't'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TAG_CLOSE, '', 't'],
          [TokenType.EOF],
        ]);
      });

      it('should unescape characters in tag names', () => {
        const text = '<t\\x64></t\\x64>';
        expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
          [TokenType.TAG_OPEN_START, '', 'td'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TAG_CLOSE, '', 'td'],
          [TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeSourceSpans(text, {escapedString: true})).toEqual([
          [TokenType.TAG_OPEN_START, '<t\\x64'],
          [TokenType.TAG_OPEN_END, '>'],
          [TokenType.TAG_CLOSE, '</t\\x64>'],
          [TokenType.EOF, ''],
        ]);
      });

      it('should unescape characters in attributes', () => {
        const text = '<t \\x64="\\x65"></t>';
        expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
          [TokenType.TAG_OPEN_START, '', 't'],
          [TokenType.ATTR_NAME, '', 'd'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.ATTR_VALUE_TEXT, 'e'],
          [TokenType.ATTR_QUOTE, '"'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TAG_CLOSE, '', 't'],
          [TokenType.EOF],
        ]);
      });

      it('should parse over escaped new line in attribute values', () => {
        const text = '<t a=b\\n></t>';
        expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
          [TokenType.TAG_OPEN_START, '', 't'],
          [TokenType.ATTR_NAME, '', 'a'],
          [TokenType.ATTR_VALUE_TEXT, 'b'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TAG_CLOSE, '', 't'],
          [TokenType.EOF],
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
          [TokenType.TEXT, 'line 1\n"line 2"\nline 3'],
          [TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeSourceSpans(text, {range, escapedString: true})).toEqual([
          [TokenType.TEXT, 'line 1\\n\\"line 2\\"\\nline 3'],
          [TokenType.EOF, ''],
        ]);
      });

      it('should account for escape sequences when computing source spans ', () => {
        const text =
          '<t>line 1</t>\n' + // <- unescaped line break
          '<t>line 2</t>\\n' + // <- escaped line break
          '<t>line 3\\\n' + // <- line continuation
          '</t>';
        expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
          [TokenType.TAG_OPEN_START, '', 't'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TEXT, 'line 1'],
          [TokenType.TAG_CLOSE, '', 't'],
          [TokenType.TEXT, '\n'],

          [TokenType.TAG_OPEN_START, '', 't'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TEXT, 'line 2'],
          [TokenType.TAG_CLOSE, '', 't'],
          [TokenType.TEXT, '\n'],

          [TokenType.TAG_OPEN_START, '', 't'],
          [TokenType.TAG_OPEN_END],
          [TokenType.TEXT, 'line 3'], // <- line continuation does not appear in token
          [TokenType.TAG_CLOSE, '', 't'],

          [TokenType.EOF],
        ]);
        expect(tokenizeAndHumanizeLineColumn(text, {escapedString: true})).toEqual([
          [TokenType.TAG_OPEN_START, '0:0'],
          [TokenType.TAG_OPEN_END, '0:2'],
          [TokenType.TEXT, '0:3'],
          [TokenType.TAG_CLOSE, '0:9'],
          [TokenType.TEXT, '0:13'], // <- real newline increments the row

          [TokenType.TAG_OPEN_START, '1:0'],
          [TokenType.TAG_OPEN_END, '1:2'],
          [TokenType.TEXT, '1:3'],
          [TokenType.TAG_CLOSE, '1:9'],
          [TokenType.TEXT, '1:13'], // <- escaped newline does not increment the row

          [TokenType.TAG_OPEN_START, '1:15'],
          [TokenType.TAG_OPEN_END, '1:17'],
          [TokenType.TEXT, '1:18'], // <- the line continuation increments the row
          [TokenType.TAG_CLOSE, '2:0'],

          [TokenType.EOF, '2:4'],
        ]);
        expect(tokenizeAndHumanizeSourceSpans(text, {escapedString: true})).toEqual([
          [TokenType.TAG_OPEN_START, '<t'],
          [TokenType.TAG_OPEN_END, '>'],
          [TokenType.TEXT, 'line 1'],
          [TokenType.TAG_CLOSE, '</t>'],
          [TokenType.TEXT, '\n'],

          [TokenType.TAG_OPEN_START, '<t'],
          [TokenType.TAG_OPEN_END, '>'],
          [TokenType.TEXT, 'line 2'],
          [TokenType.TAG_CLOSE, '</t>'],
          [TokenType.TEXT, '\\n'],

          [TokenType.TAG_OPEN_START, '<t'],
          [TokenType.TAG_OPEN_END, '>'],
          [TokenType.TEXT, 'line 3\\\n'],
          [TokenType.TAG_CLOSE, '</t>'],

          [TokenType.EOF, ''],
        ]);
      });
    });
  });

  describe('@let declarations', () => {
    it('should parse a @let declaration', () => {
      expect(tokenizeAndHumanizeParts('@let foo = 123 + 456;')).toEqual([
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, '123 + 456'],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse @let declarations with arbitrary number of spaces', () => {
      const expected = [
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, '123 + 456'],
        [TokenType.LET_END],
        [TokenType.EOF],
      ];

      expect(
        tokenizeAndHumanizeParts('@let               foo       =          123 + 456;'),
      ).toEqual(expected);
      expect(tokenizeAndHumanizeParts('@let foo=123 + 456;')).toEqual(expected);
      expect(tokenizeAndHumanizeParts('@let foo =123 + 456;')).toEqual(expected);
      expect(tokenizeAndHumanizeParts('@let foo=   123 + 456;')).toEqual(expected);
    });

    it('should parse a @let declaration with newlines before/after its name', () => {
      const expected = [
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, '123'],
        [TokenType.LET_END],
        [TokenType.EOF],
      ];

      expect(tokenizeAndHumanizeParts('@let\nfoo = 123;')).toEqual(expected);
      expect(tokenizeAndHumanizeParts('@let    \nfoo = 123;')).toEqual(expected);
      expect(tokenizeAndHumanizeParts('@let    \n              foo = 123;')).toEqual(expected);
      expect(tokenizeAndHumanizeParts('@let foo\n= 123;')).toEqual(expected);
      expect(tokenizeAndHumanizeParts('@let foo\n       = 123;')).toEqual(expected);
      expect(tokenizeAndHumanizeParts('@let foo   \n   = 123;')).toEqual(expected);
      expect(tokenizeAndHumanizeParts('@let  \n   foo   \n   = 123;')).toEqual(expected);
    });

    it('should parse a @let declaration with new lines in its value', () => {
      expect(tokenizeAndHumanizeParts('@let foo = \n123 + \n 456 + \n789\n;')).toEqual([
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, '123 + \n 456 + \n789\n'],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse a @let declaration inside of a block', () => {
      expect(tokenizeAndHumanizeParts('@defer {@let foo = 123 + 456;}')).toEqual([
        [TokenType.BLOCK_OPEN_START, 'defer'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, '123 + 456'],
        [TokenType.LET_END],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should parse @let declaration using semicolon inside of a string', () => {
      expect(tokenizeAndHumanizeParts(`@let foo = 'a; b';`)).toEqual([
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, `'a; b'`],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);

      expect(tokenizeAndHumanizeParts(`@let foo = "';'";`)).toEqual([
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, `"';'"`],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse @let declaration using escaped quotes in a string', () => {
      const markup = `@let foo = '\\';\\'' + "\\",";`;

      expect(tokenizeAndHumanizeParts(markup)).toEqual([
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, `'\\';\\'' + "\\","`],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse @let declaration using function calls in its value', () => {
      const markup = '@let foo = fn(a, b) + fn2(c, d, e);';

      expect(tokenizeAndHumanizeParts(markup)).toEqual([
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, 'fn(a, b) + fn2(c, d, e)'],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse @let declarations using array literals in their value', () => {
      expect(tokenizeAndHumanizeParts('@let foo = [1, 2, 3];')).toEqual([
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, '[1, 2, 3]'],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);

      expect(tokenizeAndHumanizeParts('@let foo = [0, [foo[1]], 3];')).toEqual([
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, '[0, [foo[1]], 3]'],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse @let declarations using object literals', () => {
      expect(tokenizeAndHumanizeParts('@let foo = {a: 1, b: {c: something + 2}};')).toEqual([
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, '{a: 1, b: {c: something + 2}}'],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('@let foo = {};')).toEqual([
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, '{}'],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('@let foo = {foo: ";"};')).toEqual([
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, '{foo: ";"}'],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse a @let declaration containing complex expression', () => {
      const markup = '@let foo = fn({a: 1, b: [otherFn([{c: ";"}], 321, {d: [\',\']})]});';

      expect(tokenizeAndHumanizeParts(markup)).toEqual([
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, 'fn({a: 1, b: [otherFn([{c: ";"}], 321, {d: [\',\']})]})'],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);
    });

    it('should handle @let declaration with invalid syntax in the value', () => {
      expect(tokenizeAndHumanizeErrors(`@let foo = ";`)).toEqual([
        ['Unexpected character "EOF"', '0:13'],
      ]);

      expect(tokenizeAndHumanizeParts(`@let foo = {a: 1,;`)).toEqual([
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, '{a: 1,'],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);

      expect(tokenizeAndHumanizeParts(`@let foo = [1, ;`)).toEqual([
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, '[1, '],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);

      expect(tokenizeAndHumanizeParts(`@let foo = fn(;`)).toEqual([
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, 'fn('],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);
    });

    // This case is a bit odd since an `@let` without a value is invalid,
    // but it will be validated further down in the parsing pipeline.
    it('should parse a @let declaration without a value', () => {
      expect(tokenizeAndHumanizeParts('@let foo =;')).toEqual([
        [TokenType.LET_START, 'foo'],
        [TokenType.LET_VALUE, ''],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);
    });

    it('should handle no space after @let', () => {
      expect(tokenizeAndHumanizeParts('@letFoo = 123;')).toEqual([
        [TokenType.INCOMPLETE_LET, '@let'],
        [TokenType.TEXT, 'Foo = 123;'],
        [TokenType.EOF],
      ]);
    });

    it('should handle unsupported characters in the name of @let', () => {
      expect(tokenizeAndHumanizeParts('@let foo\\bar = 123;')).toEqual([
        [TokenType.INCOMPLETE_LET, 'foo'],
        [TokenType.TEXT, '\\bar = 123;'],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('@let #foo = 123;')).toEqual([
        [TokenType.INCOMPLETE_LET, ''],
        [TokenType.TEXT, '#foo = 123;'],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('@let foo\nbar = 123;')).toEqual([
        [TokenType.INCOMPLETE_LET, 'foo'],
        [TokenType.TEXT, 'bar = 123;'],
        [TokenType.EOF],
      ]);
    });

    it('should handle digits in the name of an @let', () => {
      expect(tokenizeAndHumanizeParts('@let a123 = foo;')).toEqual([
        [TokenType.LET_START, 'a123'],
        [TokenType.LET_VALUE, 'foo'],
        [TokenType.LET_END],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('@let 123a = 123;')).toEqual([
        [TokenType.INCOMPLETE_LET, ''],
        [TokenType.TEXT, '123a = 123;'],
        [TokenType.EOF],
      ]);
    });

    it('should handle an @let declaration without an ending token', () => {
      expect(tokenizeAndHumanizeParts('@let foo = 123 + 456')).toEqual([
        [TokenType.INCOMPLETE_LET, 'foo'],
        [TokenType.LET_VALUE, '123 + 456'],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('@let foo = 123 + 456                  ')).toEqual([
        [TokenType.INCOMPLETE_LET, 'foo'],
        [TokenType.LET_VALUE, '123 + 456                  '],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('@let foo = 123, bar = 456')).toEqual([
        [TokenType.INCOMPLETE_LET, 'foo'],
        [TokenType.LET_VALUE, '123, bar = 456'],
        [TokenType.EOF],
      ]);
    });

    it('should not parse @let inside an interpolation', () => {
      expect(tokenizeAndHumanizeParts('{{ @let foo = 123; }}')).toEqual([
        [TokenType.TEXT, ''],
        [TokenType.INTERPOLATION, '{{', ' @let foo = 123; ', '}}'],
        [TokenType.TEXT, ''],
        [TokenType.EOF],
      ]);
    });
  });

  describe('attributes', () => {
    it('should parse attributes without prefix', () => {
      expect(tokenizeAndHumanizeParts('<t a>')).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse attributes with interpolation', () => {
      expect(tokenizeAndHumanizeParts('<t a="{{v}}" b="s{{m}}e" c="s{{m//c}}e">')).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, ''],
        [TokenType.ATTR_VALUE_INTERPOLATION, '{{', 'v', '}}'],
        [TokenType.ATTR_VALUE_TEXT, ''],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_NAME, '', 'b'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, 's'],
        [TokenType.ATTR_VALUE_INTERPOLATION, '{{', 'm', '}}'],
        [TokenType.ATTR_VALUE_TEXT, 'e'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_NAME, '', 'c'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, 's'],
        [TokenType.ATTR_VALUE_INTERPOLATION, '{{', 'm//c', '}}'],
        [TokenType.ATTR_VALUE_TEXT, 'e'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should end interpolation on an unescaped matching quote', () => {
      expect(tokenizeAndHumanizeParts('<t a="{{ a \\" \' b ">')).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, ''],
        [TokenType.ATTR_VALUE_INTERPOLATION, '{{', ' a \\" \' b '],
        [TokenType.ATTR_VALUE_TEXT, ''],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);

      expect(tokenizeAndHumanizeParts("<t a='{{ a \" \\' b '>")).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_QUOTE, "'"],
        [TokenType.ATTR_VALUE_TEXT, ''],
        [TokenType.ATTR_VALUE_INTERPOLATION, '{{', ' a " \\\' b '],
        [TokenType.ATTR_VALUE_TEXT, ''],
        [TokenType.ATTR_QUOTE, "'"],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse attributes with prefix', () => {
      expect(tokenizeAndHumanizeParts('<t ns1:a>')).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, 'ns1', 'a'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse attributes whose prefix is not valid', () => {
      expect(tokenizeAndHumanizeParts('<t (ns1:a)>')).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', '(ns1:a)'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse attributes with single quote value', () => {
      expect(tokenizeAndHumanizeParts("<t a='b'>")).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_QUOTE, "'"],
        [TokenType.ATTR_VALUE_TEXT, 'b'],
        [TokenType.ATTR_QUOTE, "'"],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse attributes with double quote value', () => {
      expect(tokenizeAndHumanizeParts('<t a="b">')).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, 'b'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse attributes with unquoted value', () => {
      expect(tokenizeAndHumanizeParts('<t a=b>')).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_VALUE_TEXT, 'b'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse attributes with unquoted interpolation value', () => {
      expect(tokenizeAndHumanizeParts('<a a={{link.text}}>')).toEqual([
        [TokenType.TAG_OPEN_START, '', 'a'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_VALUE_TEXT, ''],
        [TokenType.ATTR_VALUE_INTERPOLATION, '{{', 'link.text', '}}'],
        [TokenType.ATTR_VALUE_TEXT, ''],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse bound inputs with expressions containing newlines', () => {
      expect(
        tokenizeAndHumanizeParts(`<app-component
        [attr]="[
        {text: 'some text',url:'//www.google.com'},
        {text:'other text',url:'//www.google.com'}]">`),
      ).toEqual([
        [TokenType.TAG_OPEN_START, '', 'app-component'],
        [TokenType.ATTR_NAME, '', '[attr]'],
        [TokenType.ATTR_QUOTE, '"'],
        [
          TokenType.ATTR_VALUE_TEXT,
          '[\n' +
            "        {text: 'some text',url:'//www.google.com'},\n" +
            "        {text:'other text',url:'//www.google.com'}]",
        ],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse attributes with empty quoted value', () => {
      expect(tokenizeAndHumanizeParts('<t a="">')).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, ''],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse bound inputs with expressions containing newlines', () => {
      expect(
        tokenizeAndHumanizeParts(`<app-component
        [attr]="[
        {text: 'some text',url:'//www.google.com'},
        {text:'other text',url:'//www.google.com'}]">`),
      ).toEqual([
        [TokenType.TAG_OPEN_START, '', 'app-component'],
        [TokenType.ATTR_NAME, '', '[attr]'],
        [TokenType.ATTR_QUOTE, '"'],
        [
          TokenType.ATTR_VALUE_TEXT,
          '[\n' +
            "        {text: 'some text',url:'//www.google.com'},\n" +
            "        {text:'other text',url:'//www.google.com'}]",
        ],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should allow whitespace', () => {
      expect(tokenizeAndHumanizeParts('<t a = b >')).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_VALUE_TEXT, 'b'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse attributes with entities in values', () => {
      expect(tokenizeAndHumanizeParts('<t a="&#65;&#x41;">')).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, ''],
        [TokenType.ENCODED_ENTITY, 'A', '&#65;'],
        [TokenType.ATTR_VALUE_TEXT, ''],
        [TokenType.ENCODED_ENTITY, 'A', '&#x41;'],
        [TokenType.ATTR_VALUE_TEXT, ''],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should not decode entities without trailing ";"', () => {
      expect(tokenizeAndHumanizeParts('<t a="&amp" b="c&&d">')).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, '&amp'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_NAME, '', 'b'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, 'c&&d'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse attributes with "&" in values', () => {
      expect(tokenizeAndHumanizeParts('<t a="b && c &">')).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, 'b && c &'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse values with CR and LF', () => {
      expect(tokenizeAndHumanizeParts("<t a='t\ne\rs\r\nt'>")).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_QUOTE, "'"],
        [TokenType.ATTR_VALUE_TEXT, 't\ne\ns\nt'],
        [TokenType.ATTR_QUOTE, "'"],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should store the locations', () => {
      expect(tokenizeAndHumanizeSourceSpans('<t a=b>')).toEqual([
        [TokenType.TAG_OPEN_START, '<t'],
        [TokenType.ATTR_NAME, 'a'],
        [TokenType.ATTR_VALUE_TEXT, 'b'],
        [TokenType.TAG_OPEN_END, '>'],
        [TokenType.EOF, ''],
      ]);
    });

    it('should report missing closing single quote', () => {
      expect(tokenizeAndHumanizeErrors("<t a='b>")).toEqual([
        ['Unexpected character "EOF"', '0:8'],
      ]);
    });

    it('should report missing closing double quote', () => {
      expect(tokenizeAndHumanizeErrors('<t a="b>')).toEqual([
        ['Unexpected character "EOF"', '0:8'],
      ]);
    });

    it('should permit more characters in square-bracketed attributes', () => {
      expect(tokenizeAndHumanizeParts('<foo [class.text-primary/80]="expr"/>')).toEqual([
        [TokenType.TAG_OPEN_START, '', 'foo'],
        [TokenType.ATTR_NAME, '', '[class.text-primary/80]'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, 'expr'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END_VOID],
        [TokenType.EOF],
      ]);
      expect(
        tokenizeAndHumanizeParts('<foo [class.data-active:text-green-300/80]="expr"/>'),
      ).toEqual([
        [TokenType.TAG_OPEN_START, '', 'foo'],
        [TokenType.ATTR_NAME, '', '[class.data-active:text-green-300/80]'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, 'expr'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END_VOID],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts(`<foo [class.data-[size='large']:p-8] = "expr"/>`)).toEqual([
        [TokenType.TAG_OPEN_START, '', 'foo'],
        [TokenType.ATTR_NAME, '', "[class.data-[size='large']:p-8]"],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, 'expr'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END_VOID],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts(`<foo [class.data-[size='large']:p-8]/>`)).toEqual([
        [TokenType.TAG_OPEN_START, '', 'foo'],
        [TokenType.ATTR_NAME, '', "[class.data-[size='large']:p-8]"],
        [TokenType.TAG_OPEN_END_VOID],
        [TokenType.EOF],
      ]);
      expect(
        tokenizeAndHumanizeParts(`<foo [class.data-[size='hello white space']]="expr"/>`),
      ).toEqual([
        [TokenType.TAG_OPEN_START, '', 'foo'],
        [TokenType.ATTR_NAME, '', "[class.data-[size='hello white space']]"],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, 'expr'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END_VOID],
        [TokenType.EOF],
      ]);
      expect(
        tokenizeAndHumanizeParts(
          `<foo [class.text-primary/80]="expr" ` +
            `[class.data-active:text-green-300/80]="expr2" ` +
            `[class.data-[size='large']:p-8] = "expr3" some-attr/>`,
        ),
      ).toEqual([
        [TokenType.TAG_OPEN_START, '', 'foo'],
        [TokenType.ATTR_NAME, '', '[class.text-primary/80]'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, 'expr'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_NAME, '', '[class.data-active:text-green-300/80]'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, 'expr2'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_NAME, '', `[class.data-[size='large']:p-8]`],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, 'expr3'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_NAME, '', `some-attr`],
        [TokenType.TAG_OPEN_END_VOID],
        [TokenType.EOF],
      ]);
    });

    it('should allow mismatched square brackets in attribute name', () => {
      expect(tokenizeAndHumanizeParts(`<foo [class.a]b]c]="expr"/>`)).toEqual([
        [TokenType.TAG_OPEN_START, '', 'foo'],
        [TokenType.ATTR_NAME, '', '[class.a]b]c]'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, 'expr'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END_VOID],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts(`<foo [class.a[]][[]]b]][c]/>`)).toEqual([
        [TokenType.TAG_OPEN_START, '', 'foo'],
        [TokenType.ATTR_NAME, '', '[class.a[]][[]]b]][c]'],
        [TokenType.TAG_OPEN_END_VOID],
        [TokenType.EOF],
      ]);
    });

    it('should stop permissive parsing of square brackets on new line', () => {
      expect(tokenizeAndHumanizeParts(`<foo [class.text-\nprimary/80]="expr"/>`)).toEqual([
        [TokenType.INCOMPLETE_TAG_OPEN, '', 'foo'],
        [TokenType.ATTR_NAME, '', '[class.text-'],
        [TokenType.ATTR_NAME, '', 'primary'],
        [TokenType.TEXT, '80]="expr"/>'],
        [TokenType.EOF],
      ]);
    });
  });

  describe('closing tags', () => {
    it('should parse closing tags without prefix', () => {
      expect(tokenizeAndHumanizeParts('</test>')).toEqual([
        [TokenType.TAG_CLOSE, '', 'test'],
        [TokenType.EOF],
      ]);
    });

    it('should parse closing tags with prefix', () => {
      expect(tokenizeAndHumanizeParts('</ns1:test>')).toEqual([
        [TokenType.TAG_CLOSE, 'ns1', 'test'],
        [TokenType.EOF],
      ]);
    });

    it('should allow whitespace', () => {
      expect(tokenizeAndHumanizeParts('</ test >')).toEqual([
        [TokenType.TAG_CLOSE, '', 'test'],
        [TokenType.EOF],
      ]);
    });

    it('should store the locations', () => {
      expect(tokenizeAndHumanizeSourceSpans('</test>')).toEqual([
        [TokenType.TAG_CLOSE, '</test>'],
        [TokenType.EOF, ''],
      ]);
    });

    it('should report missing name after </', () => {
      expect(tokenizeAndHumanizeErrors('</')).toEqual([['Unexpected character "EOF"', '0:2']]);
    });

    it('should report missing >', () => {
      expect(tokenizeAndHumanizeErrors('</test')).toEqual([['Unexpected character "EOF"', '0:6']]);
    });
  });

  describe('entities', () => {
    it('should parse named entities', () => {
      expect(tokenizeAndHumanizeParts('a&amp;b')).toEqual([
        [TokenType.TEXT, 'a'],
        [TokenType.ENCODED_ENTITY, '&', '&amp;'],
        [TokenType.TEXT, 'b'],
        [TokenType.EOF],
      ]);
    });

    it('should parse hexadecimal entities', () => {
      expect(tokenizeAndHumanizeParts('&#x41;&#X41;')).toEqual([
        [TokenType.TEXT, ''],
        [TokenType.ENCODED_ENTITY, 'A', '&#x41;'],
        [TokenType.TEXT, ''],
        [TokenType.ENCODED_ENTITY, 'A', '&#X41;'],
        [TokenType.TEXT, ''],
        [TokenType.EOF],
      ]);
    });

    it('should parse decimal entities', () => {
      expect(tokenizeAndHumanizeParts('&#65;')).toEqual([
        [TokenType.TEXT, ''],
        [TokenType.ENCODED_ENTITY, 'A', '&#65;'],
        [TokenType.TEXT, ''],
        [TokenType.EOF],
      ]);
    });

    it('should store the locations', () => {
      expect(tokenizeAndHumanizeSourceSpans('a&amp;b')).toEqual([
        [TokenType.TEXT, 'a'],
        [TokenType.ENCODED_ENTITY, '&amp;'],
        [TokenType.TEXT, 'b'],
        [TokenType.EOF, ''],
      ]);
    });

    it('should report malformed/unknown entities', () => {
      expect(tokenizeAndHumanizeErrors('&tbo;')).toEqual([
        ['Unknown entity "tbo" - use the "&#<decimal>;" or  "&#x<hex>;" syntax', '0:0'],
      ]);
      expect(tokenizeAndHumanizeErrors('&#3sdf;')).toEqual([
        [
          'Unable to parse entity "&#3s" - decimal character reference entities must end with ";"',
          '0:4',
        ],
      ]);
      expect(tokenizeAndHumanizeErrors('&#xasdf;')).toEqual([
        [
          'Unable to parse entity "&#xas" - hexadecimal character reference entities must end with ";"',
          '0:5',
        ],
      ]);

      expect(tokenizeAndHumanizeErrors('&#xABC')).toEqual([['Unexpected character "EOF"', '0:6']]);
    });

    it('should not parse js object methods', () => {
      expect(tokenizeAndHumanizeErrors('&valueOf;')).toEqual([
        ['Unknown entity "valueOf" - use the "&#<decimal>;" or  "&#x<hex>;" syntax', '0:0'],
      ]);
    });
  });

  describe('regular text', () => {
    it('should parse text', () => {
      expect(tokenizeAndHumanizeParts('a')).toEqual([[TokenType.TEXT, 'a'], [TokenType.EOF]]);
    });

    it('should parse interpolation', () => {
      expect(
        tokenizeAndHumanizeParts('{{ a }}b{{ c // comment }}d{{ e "}} \' " f }}g{{ h // " i }}'),
      ).toEqual([
        [TokenType.TEXT, ''],
        [TokenType.INTERPOLATION, '{{', ' a ', '}}'],
        [TokenType.TEXT, 'b'],
        [TokenType.INTERPOLATION, '{{', ' c // comment ', '}}'],
        [TokenType.TEXT, 'd'],
        [TokenType.INTERPOLATION, '{{', ' e "}} \' " f ', '}}'],
        [TokenType.TEXT, 'g'],
        [TokenType.INTERPOLATION, '{{', ' h // " i ', '}}'],
        [TokenType.TEXT, ''],
        [TokenType.EOF],
      ]);

      expect(tokenizeAndHumanizeSourceSpans('{{ a }}b{{ c // comment }}')).toEqual([
        [TokenType.TEXT, ''],
        [TokenType.INTERPOLATION, '{{ a }}'],
        [TokenType.TEXT, 'b'],
        [TokenType.INTERPOLATION, '{{ c // comment }}'],
        [TokenType.TEXT, ''],
        [TokenType.EOF, ''],
      ]);
    });

    it('should parse interpolation with custom markers', () => {
      expect(
        tokenizeAndHumanizeParts('{% a %}', {interpolationConfig: {start: '{%', end: '%}'}}),
      ).toEqual([
        [TokenType.TEXT, ''],
        [TokenType.INTERPOLATION, '{%', ' a ', '%}'],
        [TokenType.TEXT, ''],
        [TokenType.EOF],
      ]);
    });

    it('should handle CR & LF in text', () => {
      expect(tokenizeAndHumanizeParts('t\ne\rs\r\nt')).toEqual([
        [TokenType.TEXT, 't\ne\ns\nt'],
        [TokenType.EOF],
      ]);

      expect(tokenizeAndHumanizeSourceSpans('t\ne\rs\r\nt')).toEqual([
        [TokenType.TEXT, 't\ne\rs\r\nt'],
        [TokenType.EOF, ''],
      ]);
    });

    it('should handle CR & LF in interpolation', () => {
      expect(tokenizeAndHumanizeParts('{{t\ne\rs\r\nt}}')).toEqual([
        [TokenType.TEXT, ''],
        [TokenType.INTERPOLATION, '{{', 't\ne\ns\nt', '}}'],
        [TokenType.TEXT, ''],
        [TokenType.EOF],
      ]);

      expect(tokenizeAndHumanizeSourceSpans('{{t\ne\rs\r\nt}}')).toEqual([
        [TokenType.TEXT, ''],
        [TokenType.INTERPOLATION, '{{t\ne\rs\r\nt}}'],
        [TokenType.TEXT, ''],
        [TokenType.EOF, ''],
      ]);
    });

    it('should parse entities', () => {
      expect(tokenizeAndHumanizeParts('a&amp;b')).toEqual([
        [TokenType.TEXT, 'a'],
        [TokenType.ENCODED_ENTITY, '&', '&amp;'],
        [TokenType.TEXT, 'b'],
        [TokenType.EOF],
      ]);

      expect(tokenizeAndHumanizeSourceSpans('a&amp;b')).toEqual([
        [TokenType.TEXT, 'a'],
        [TokenType.ENCODED_ENTITY, '&amp;'],
        [TokenType.TEXT, 'b'],
        [TokenType.EOF, ''],
      ]);
    });

    it('should parse text starting with "&"', () => {
      expect(tokenizeAndHumanizeParts('a && b &')).toEqual([
        [TokenType.TEXT, 'a && b &'],
        [TokenType.EOF],
      ]);
    });

    it('should store the locations', () => {
      expect(tokenizeAndHumanizeSourceSpans('a')).toEqual([
        [TokenType.TEXT, 'a'],
        [TokenType.EOF, ''],
      ]);
    });

    it('should allow "<" in text nodes', () => {
      expect(tokenizeAndHumanizeParts('{{ a < b ? c : d }}')).toEqual([
        [TokenType.TEXT, ''],
        [TokenType.INTERPOLATION, '{{', ' a < b ? c : d ', '}}'],
        [TokenType.TEXT, ''],
        [TokenType.EOF],
      ]);

      expect(tokenizeAndHumanizeSourceSpans('<p>a<b</p>')).toEqual([
        [TokenType.TAG_OPEN_START, '<p'],
        [TokenType.TAG_OPEN_END, '>'],
        [TokenType.TEXT, 'a'],
        [TokenType.INCOMPLETE_TAG_OPEN, '<b'],
        [TokenType.TAG_CLOSE, '</p>'],
        [TokenType.EOF, ''],
      ]);

      expect(tokenizeAndHumanizeParts('< a>')).toEqual([[TokenType.TEXT, '< a>'], [TokenType.EOF]]);
    });

    it('should break out of interpolation in text token on valid start tag', () => {
      expect(tokenizeAndHumanizeParts('{{ a <b && c > d }}')).toEqual([
        [TokenType.TEXT, ''],
        [TokenType.INTERPOLATION, '{{', ' a '],
        [TokenType.TEXT, ''],
        [TokenType.TAG_OPEN_START, '', 'b'],
        [TokenType.ATTR_NAME, '', '&&'],
        [TokenType.ATTR_NAME, '', 'c'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TEXT, ' d '],
        [TokenType.BLOCK_CLOSE],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should break out of interpolation in text token on valid comment', () => {
      expect(tokenizeAndHumanizeParts('{{ a }<!---->}')).toEqual([
        [TokenType.TEXT, ''],
        [TokenType.INTERPOLATION, '{{', ' a }'],
        [TokenType.TEXT, ''],
        [TokenType.COMMENT_START],
        [TokenType.RAW_TEXT, ''],
        [TokenType.COMMENT_END],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should end interpolation on a valid closing tag', () => {
      expect(tokenizeAndHumanizeParts('<p>{{ a </p>')).toEqual([
        [TokenType.TAG_OPEN_START, '', 'p'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TEXT, ''],
        [TokenType.INTERPOLATION, '{{', ' a '],
        [TokenType.TEXT, ''],
        [TokenType.TAG_CLOSE, '', 'p'],
        [TokenType.EOF],
      ]);
    });

    it('should break out of interpolation in text token on valid CDATA', () => {
      expect(tokenizeAndHumanizeParts('{{ a }<![CDATA[]]>}')).toEqual([
        [TokenType.TEXT, ''],
        [TokenType.INTERPOLATION, '{{', ' a }'],
        [TokenType.TEXT, ''],
        [TokenType.CDATA_START],
        [TokenType.RAW_TEXT, ''],
        [TokenType.CDATA_END],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should ignore invalid start tag in interpolation', () => {
      // Note that if the `<=` is considered an "end of text" then the following `{` would
      // incorrectly be considered part of an ICU.
      expect(
        tokenizeAndHumanizeParts(`<code>{{'<={'}}</code>`, {tokenizeExpansionForms: true}),
      ).toEqual([
        [TokenType.TAG_OPEN_START, '', 'code'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TEXT, ''],
        [TokenType.INTERPOLATION, '{{', "'<={'", '}}'],
        [TokenType.TEXT, ''],
        [TokenType.TAG_CLOSE, '', 'code'],
        [TokenType.EOF],
      ]);
    });

    it('should parse start tags quotes in place of an attribute name as text', () => {
      expect(tokenizeAndHumanizeParts('<t ">')).toEqual([
        [TokenType.INCOMPLETE_TAG_OPEN, '', 't'],
        [TokenType.TEXT, '">'],
        [TokenType.EOF],
      ]);

      expect(tokenizeAndHumanizeParts("<t '>")).toEqual([
        [TokenType.INCOMPLETE_TAG_OPEN, '', 't'],
        [TokenType.TEXT, "'>"],
        [TokenType.EOF],
      ]);
    });

    it('should parse start tags quotes in place of an attribute name (after a valid attribute)', () => {
      expect(tokenizeAndHumanizeParts('<t a="b" ">')).toEqual([
        [TokenType.INCOMPLETE_TAG_OPEN, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, 'b'],
        [TokenType.ATTR_QUOTE, '"'],
        // TODO(ayazhafiz): the " symbol should be a synthetic attribute,
        // allowing us to complete the opening tag correctly.
        [TokenType.TEXT, '">'],
        [TokenType.EOF],
      ]);

      expect(tokenizeAndHumanizeParts("<t a='b' '>")).toEqual([
        [TokenType.INCOMPLETE_TAG_OPEN, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_QUOTE, "'"],
        [TokenType.ATTR_VALUE_TEXT, 'b'],
        [TokenType.ATTR_QUOTE, "'"],
        // TODO(ayazhafiz): the ' symbol should be a synthetic attribute,
        // allowing us to complete the opening tag correctly.
        [TokenType.TEXT, "'>"],
        [TokenType.EOF],
      ]);
    });

    it('should be able to escape {', () => {
      expect(tokenizeAndHumanizeParts('{{ "{" }}')).toEqual([
        [TokenType.TEXT, ''],
        [TokenType.INTERPOLATION, '{{', ' "{" ', '}}'],
        [TokenType.TEXT, ''],
        [TokenType.EOF],
      ]);
    });

    it('should be able to escape {{', () => {
      expect(tokenizeAndHumanizeParts('{{ "{{" }}')).toEqual([
        [TokenType.TEXT, ''],
        [TokenType.INTERPOLATION, '{{', ' "{{" ', '}}'],
        [TokenType.TEXT, ''],
        [TokenType.EOF],
      ]);
    });

    it('should capture everything up to the end of file in the interpolation expression part if there are mismatched quotes', () => {
      expect(tokenizeAndHumanizeParts('{{ "{{a}}\' }}')).toEqual([
        [TokenType.TEXT, ''],
        [TokenType.INTERPOLATION, '{{', ' "{{a}}\' }}'],
        [TokenType.TEXT, ''],
        [TokenType.EOF],
      ]);
    });

    it('should treat expansion form as text when they are not parsed', () => {
      expect(
        tokenizeAndHumanizeParts('<span>{a, b, =4 {c}}</span>', {
          tokenizeExpansionForms: false,
          tokenizeBlocks: false,
        }),
      ).toEqual([
        [TokenType.TAG_OPEN_START, '', 'span'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TEXT, '{a, b, =4 {c}}'],
        [TokenType.TAG_CLOSE, '', 'span'],
        [TokenType.EOF],
      ]);
    });
  });

  describe('raw text', () => {
    it('should parse text', () => {
      expect(tokenizeAndHumanizeParts(`<script>t\ne\rs\r\nt</script>`)).toEqual([
        [TokenType.TAG_OPEN_START, '', 'script'],
        [TokenType.TAG_OPEN_END],
        [TokenType.RAW_TEXT, 't\ne\ns\nt'],
        [TokenType.TAG_CLOSE, '', 'script'],
        [TokenType.EOF],
      ]);
    });

    it('should not detect entities', () => {
      expect(tokenizeAndHumanizeParts(`<script>&amp;</SCRIPT>`)).toEqual([
        [TokenType.TAG_OPEN_START, '', 'script'],
        [TokenType.TAG_OPEN_END],
        [TokenType.RAW_TEXT, '&amp;'],
        [TokenType.TAG_CLOSE, '', 'script'],
        [TokenType.EOF],
      ]);
    });

    it('should ignore other opening tags', () => {
      expect(tokenizeAndHumanizeParts(`<script>a<div></script>`)).toEqual([
        [TokenType.TAG_OPEN_START, '', 'script'],
        [TokenType.TAG_OPEN_END],
        [TokenType.RAW_TEXT, 'a<div>'],
        [TokenType.TAG_CLOSE, '', 'script'],
        [TokenType.EOF],
      ]);
    });

    it('should ignore other closing tags', () => {
      expect(tokenizeAndHumanizeParts(`<script>a</test></script>`)).toEqual([
        [TokenType.TAG_OPEN_START, '', 'script'],
        [TokenType.TAG_OPEN_END],
        [TokenType.RAW_TEXT, 'a</test>'],
        [TokenType.TAG_CLOSE, '', 'script'],
        [TokenType.EOF],
      ]);
    });

    it('should store the locations', () => {
      expect(tokenizeAndHumanizeSourceSpans(`<script>a</script>`)).toEqual([
        [TokenType.TAG_OPEN_START, '<script'],
        [TokenType.TAG_OPEN_END, '>'],
        [TokenType.RAW_TEXT, 'a'],
        [TokenType.TAG_CLOSE, '</script>'],
        [TokenType.EOF, ''],
      ]);
    });
  });

  describe('escapable raw text', () => {
    it('should parse text', () => {
      expect(tokenizeAndHumanizeParts(`<title>t\ne\rs\r\nt</title>`)).toEqual([
        [TokenType.TAG_OPEN_START, '', 'title'],
        [TokenType.TAG_OPEN_END],
        [TokenType.ESCAPABLE_RAW_TEXT, 't\ne\ns\nt'],
        [TokenType.TAG_CLOSE, '', 'title'],
        [TokenType.EOF],
      ]);
    });

    it('should detect entities', () => {
      expect(tokenizeAndHumanizeParts(`<title>&amp;</title>`)).toEqual([
        [TokenType.TAG_OPEN_START, '', 'title'],
        [TokenType.TAG_OPEN_END],
        [TokenType.ESCAPABLE_RAW_TEXT, ''],
        [TokenType.ENCODED_ENTITY, '&', '&amp;'],
        [TokenType.ESCAPABLE_RAW_TEXT, ''],
        [TokenType.TAG_CLOSE, '', 'title'],
        [TokenType.EOF],
      ]);
    });

    it('should ignore other opening tags', () => {
      expect(tokenizeAndHumanizeParts(`<title>a<div></title>`)).toEqual([
        [TokenType.TAG_OPEN_START, '', 'title'],
        [TokenType.TAG_OPEN_END],
        [TokenType.ESCAPABLE_RAW_TEXT, 'a<div>'],
        [TokenType.TAG_CLOSE, '', 'title'],
        [TokenType.EOF],
      ]);
    });

    it('should ignore other closing tags', () => {
      expect(tokenizeAndHumanizeParts(`<title>a</test></title>`)).toEqual([
        [TokenType.TAG_OPEN_START, '', 'title'],
        [TokenType.TAG_OPEN_END],
        [TokenType.ESCAPABLE_RAW_TEXT, 'a</test>'],
        [TokenType.TAG_CLOSE, '', 'title'],
        [TokenType.EOF],
      ]);
    });

    it('should store the locations', () => {
      expect(tokenizeAndHumanizeSourceSpans(`<title>a</title>`)).toEqual([
        [TokenType.TAG_OPEN_START, '<title'],
        [TokenType.TAG_OPEN_END, '>'],
        [TokenType.ESCAPABLE_RAW_TEXT, 'a'],
        [TokenType.TAG_CLOSE, '</title>'],
        [TokenType.EOF, ''],
      ]);
    });
  });

  describe('parsable data', () => {
    it('should parse an SVG <title> tag', () => {
      expect(tokenizeAndHumanizeParts(`<svg:title>test</svg:title>`)).toEqual([
        [TokenType.TAG_OPEN_START, 'svg', 'title'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TEXT, 'test'],
        [TokenType.TAG_CLOSE, 'svg', 'title'],
        [TokenType.EOF],
      ]);
    });

    it('should parse an SVG <title> tag with children', () => {
      expect(tokenizeAndHumanizeParts(`<svg:title><f>test</f></svg:title>`)).toEqual([
        [TokenType.TAG_OPEN_START, 'svg', 'title'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TAG_OPEN_START, '', 'f'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TEXT, 'test'],
        [TokenType.TAG_CLOSE, '', 'f'],
        [TokenType.TAG_CLOSE, 'svg', 'title'],
        [TokenType.EOF],
      ]);
    });
  });

  describe('expansion forms', () => {
    it('should parse an expansion form', () => {
      expect(
        tokenizeAndHumanizeParts('{one.two, three, =4 {four} =5 {five} foo {bar} }', {
          tokenizeExpansionForms: true,
        }),
      ).toEqual([
        [TokenType.EXPANSION_FORM_START],
        [TokenType.RAW_TEXT, 'one.two'],
        [TokenType.RAW_TEXT, 'three'],
        [TokenType.EXPANSION_CASE_VALUE, '=4'],
        [TokenType.EXPANSION_CASE_EXP_START],
        [TokenType.TEXT, 'four'],
        [TokenType.EXPANSION_CASE_EXP_END],
        [TokenType.EXPANSION_CASE_VALUE, '=5'],
        [TokenType.EXPANSION_CASE_EXP_START],
        [TokenType.TEXT, 'five'],
        [TokenType.EXPANSION_CASE_EXP_END],
        [TokenType.EXPANSION_CASE_VALUE, 'foo'],
        [TokenType.EXPANSION_CASE_EXP_START],
        [TokenType.TEXT, 'bar'],
        [TokenType.EXPANSION_CASE_EXP_END],
        [TokenType.EXPANSION_FORM_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse an expansion form with text elements surrounding it', () => {
      expect(
        tokenizeAndHumanizeParts('before{one.two, three, =4 {four}}after', {
          tokenizeExpansionForms: true,
        }),
      ).toEqual([
        [TokenType.TEXT, 'before'],
        [TokenType.EXPANSION_FORM_START],
        [TokenType.RAW_TEXT, 'one.two'],
        [TokenType.RAW_TEXT, 'three'],
        [TokenType.EXPANSION_CASE_VALUE, '=4'],
        [TokenType.EXPANSION_CASE_EXP_START],
        [TokenType.TEXT, 'four'],
        [TokenType.EXPANSION_CASE_EXP_END],
        [TokenType.EXPANSION_FORM_END],
        [TokenType.TEXT, 'after'],
        [TokenType.EOF],
      ]);
    });

    it('should parse an expansion form as a tag single child', () => {
      expect(
        tokenizeAndHumanizeParts('<div><span>{a, b, =4 {c}}</span></div>', {
          tokenizeExpansionForms: true,
        }),
      ).toEqual([
        [TokenType.TAG_OPEN_START, '', 'div'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TAG_OPEN_START, '', 'span'],
        [TokenType.TAG_OPEN_END],
        [TokenType.EXPANSION_FORM_START],
        [TokenType.RAW_TEXT, 'a'],
        [TokenType.RAW_TEXT, 'b'],
        [TokenType.EXPANSION_CASE_VALUE, '=4'],
        [TokenType.EXPANSION_CASE_EXP_START],
        [TokenType.TEXT, 'c'],
        [TokenType.EXPANSION_CASE_EXP_END],
        [TokenType.EXPANSION_FORM_END],
        [TokenType.TAG_CLOSE, '', 'span'],
        [TokenType.TAG_CLOSE, '', 'div'],
        [TokenType.EOF],
      ]);
    });

    it('should parse an expansion form with whitespace surrounding it', () => {
      expect(
        tokenizeAndHumanizeParts('<div><span> {a, b, =4 {c}} </span></div>', {
          tokenizeExpansionForms: true,
        }),
      ).toEqual([
        [TokenType.TAG_OPEN_START, '', 'div'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TAG_OPEN_START, '', 'span'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TEXT, ' '],
        [TokenType.EXPANSION_FORM_START],
        [TokenType.RAW_TEXT, 'a'],
        [TokenType.RAW_TEXT, 'b'],
        [TokenType.EXPANSION_CASE_VALUE, '=4'],
        [TokenType.EXPANSION_CASE_EXP_START],
        [TokenType.TEXT, 'c'],
        [TokenType.EXPANSION_CASE_EXP_END],
        [TokenType.EXPANSION_FORM_END],
        [TokenType.TEXT, ' '],
        [TokenType.TAG_CLOSE, '', 'span'],
        [TokenType.TAG_CLOSE, '', 'div'],
        [TokenType.EOF],
      ]);
    });

    it('should parse an expansion forms with elements in it', () => {
      expect(
        tokenizeAndHumanizeParts('{one.two, three, =4 {four <b>a</b>}}', {
          tokenizeExpansionForms: true,
        }),
      ).toEqual([
        [TokenType.EXPANSION_FORM_START],
        [TokenType.RAW_TEXT, 'one.two'],
        [TokenType.RAW_TEXT, 'three'],
        [TokenType.EXPANSION_CASE_VALUE, '=4'],
        [TokenType.EXPANSION_CASE_EXP_START],
        [TokenType.TEXT, 'four '],
        [TokenType.TAG_OPEN_START, '', 'b'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TEXT, 'a'],
        [TokenType.TAG_CLOSE, '', 'b'],
        [TokenType.EXPANSION_CASE_EXP_END],
        [TokenType.EXPANSION_FORM_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse an expansion forms containing an interpolation', () => {
      expect(
        tokenizeAndHumanizeParts('{one.two, three, =4 {four {{a}}}}', {
          tokenizeExpansionForms: true,
        }),
      ).toEqual([
        [TokenType.EXPANSION_FORM_START],
        [TokenType.RAW_TEXT, 'one.two'],
        [TokenType.RAW_TEXT, 'three'],
        [TokenType.EXPANSION_CASE_VALUE, '=4'],
        [TokenType.EXPANSION_CASE_EXP_START],
        [TokenType.TEXT, 'four '],
        [TokenType.INTERPOLATION, '{{', 'a', '}}'],
        [TokenType.TEXT, ''],
        [TokenType.EXPANSION_CASE_EXP_END],
        [TokenType.EXPANSION_FORM_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse nested expansion forms', () => {
      expect(
        tokenizeAndHumanizeParts(`{one.two, three, =4 { {xx, yy, =x {one}} }}`, {
          tokenizeExpansionForms: true,
        }),
      ).toEqual([
        [TokenType.EXPANSION_FORM_START],
        [TokenType.RAW_TEXT, 'one.two'],
        [TokenType.RAW_TEXT, 'three'],
        [TokenType.EXPANSION_CASE_VALUE, '=4'],
        [TokenType.EXPANSION_CASE_EXP_START],
        [TokenType.EXPANSION_FORM_START],
        [TokenType.RAW_TEXT, 'xx'],
        [TokenType.RAW_TEXT, 'yy'],
        [TokenType.EXPANSION_CASE_VALUE, '=x'],
        [TokenType.EXPANSION_CASE_EXP_START],
        [TokenType.TEXT, 'one'],
        [TokenType.EXPANSION_CASE_EXP_END],
        [TokenType.EXPANSION_FORM_END],
        [TokenType.TEXT, ' '],
        [TokenType.EXPANSION_CASE_EXP_END],
        [TokenType.EXPANSION_FORM_END],
        [TokenType.EOF],
      ]);
    });

    describe('[line ending normalization', () => {
      describe('{escapedString: true}', () => {
        it('should normalize line-endings in expansion forms if `i18nNormalizeLineEndingsInICUs` is true', () => {
          const result = tokenizeWithoutErrors(
            `{\r\n` +
              `    messages.length,\r\n` +
              `    plural,\r\n` +
              `    =0 {You have \r\nno\r\n messages}\r\n` +
              `    =1 {One {{message}}}}\r\n`,
            {
              tokenizeExpansionForms: true,
              escapedString: true,
              i18nNormalizeLineEndingsInICUs: true,
            },
          );

          expect(humanizeParts(result.tokens)).toEqual([
            [TokenType.EXPANSION_FORM_START],
            [TokenType.RAW_TEXT, '\n    messages.length'],
            [TokenType.RAW_TEXT, 'plural'],
            [TokenType.EXPANSION_CASE_VALUE, '=0'],
            [TokenType.EXPANSION_CASE_EXP_START],
            [TokenType.TEXT, 'You have \nno\n messages'],
            [TokenType.EXPANSION_CASE_EXP_END],
            [TokenType.EXPANSION_CASE_VALUE, '=1'],
            [TokenType.EXPANSION_CASE_EXP_START],
            [TokenType.TEXT, 'One '],
            [TokenType.INTERPOLATION, '{{', 'message', '}}'],
            [TokenType.TEXT, ''],
            [TokenType.EXPANSION_CASE_EXP_END],
            [TokenType.EXPANSION_FORM_END],
            [TokenType.TEXT, '\n'],
            [TokenType.EOF],
          ]);

          expect(result.nonNormalizedIcuExpressions).toEqual([]);
        });

        it('should not normalize line-endings in ICU expressions when `i18nNormalizeLineEndingsInICUs` is not defined', () => {
          const result = tokenizeWithoutErrors(
            `{\r\n` +
              `    messages.length,\r\n` +
              `    plural,\r\n` +
              `    =0 {You have \r\nno\r\n messages}\r\n` +
              `    =1 {One {{message}}}}\r\n`,
            {tokenizeExpansionForms: true, escapedString: true},
          );

          expect(humanizeParts(result.tokens)).toEqual([
            [TokenType.EXPANSION_FORM_START],
            [TokenType.RAW_TEXT, '\r\n    messages.length'],
            [TokenType.RAW_TEXT, 'plural'],
            [TokenType.EXPANSION_CASE_VALUE, '=0'],
            [TokenType.EXPANSION_CASE_EXP_START],
            [TokenType.TEXT, 'You have \nno\n messages'],
            [TokenType.EXPANSION_CASE_EXP_END],
            [TokenType.EXPANSION_CASE_VALUE, '=1'],
            [TokenType.EXPANSION_CASE_EXP_START],
            [TokenType.TEXT, 'One '],
            [TokenType.INTERPOLATION, '{{', 'message', '}}'],
            [TokenType.TEXT, ''],
            [TokenType.EXPANSION_CASE_EXP_END],
            [TokenType.EXPANSION_FORM_END],
            [TokenType.TEXT, '\n'],
            [TokenType.EOF],
          ]);

          expect(result.nonNormalizedIcuExpressions!.length).toBe(1);
          expect(result.nonNormalizedIcuExpressions![0].sourceSpan.toString()).toEqual(
            '\r\n    messages.length',
          );
        });

        it('should not normalize line endings in nested expansion forms when `i18nNormalizeLineEndingsInICUs` is not defined', () => {
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
            {tokenizeExpansionForms: true, escapedString: true},
          );
          expect(humanizeParts(result.tokens)).toEqual([
            [TokenType.EXPANSION_FORM_START],
            [TokenType.RAW_TEXT, '\r\n  messages.length'],
            [TokenType.RAW_TEXT, 'plural'],
            [TokenType.EXPANSION_CASE_VALUE, '=0'],
            [TokenType.EXPANSION_CASE_EXP_START],
            [TokenType.TEXT, 'zero \n       '],

            [TokenType.EXPANSION_FORM_START],
            [TokenType.RAW_TEXT, '\r\n         p.gender'],
            [TokenType.RAW_TEXT, 'select'],
            [TokenType.EXPANSION_CASE_VALUE, 'male'],
            [TokenType.EXPANSION_CASE_EXP_START],
            [TokenType.TEXT, 'm'],
            [TokenType.EXPANSION_CASE_EXP_END],
            [TokenType.EXPANSION_FORM_END],

            [TokenType.TEXT, '\n     '],
            [TokenType.EXPANSION_CASE_EXP_END],
            [TokenType.EXPANSION_FORM_END],
            [TokenType.EOF],
          ]);

          expect(result.nonNormalizedIcuExpressions!.length).toBe(2);
          expect(result.nonNormalizedIcuExpressions![0].sourceSpan.toString()).toEqual(
            '\r\n  messages.length',
          );
          expect(result.nonNormalizedIcuExpressions![1].sourceSpan.toString()).toEqual(
            '\r\n         p.gender',
          );
        });
      });

      describe('{escapedString: false}', () => {
        it('should normalize line-endings in expansion forms if `i18nNormalizeLineEndingsInICUs` is true', () => {
          const result = tokenizeWithoutErrors(
            `{\r\n` +
              `    messages.length,\r\n` +
              `    plural,\r\n` +
              `    =0 {You have \r\nno\r\n messages}\r\n` +
              `    =1 {One {{message}}}}\r\n`,
            {
              tokenizeExpansionForms: true,
              escapedString: false,
              i18nNormalizeLineEndingsInICUs: true,
            },
          );

          expect(humanizeParts(result.tokens)).toEqual([
            [TokenType.EXPANSION_FORM_START],
            [TokenType.RAW_TEXT, '\n    messages.length'],
            [TokenType.RAW_TEXT, 'plural'],
            [TokenType.EXPANSION_CASE_VALUE, '=0'],
            [TokenType.EXPANSION_CASE_EXP_START],
            [TokenType.TEXT, 'You have \nno\n messages'],
            [TokenType.EXPANSION_CASE_EXP_END],
            [TokenType.EXPANSION_CASE_VALUE, '=1'],
            [TokenType.EXPANSION_CASE_EXP_START],
            [TokenType.TEXT, 'One '],
            [TokenType.INTERPOLATION, '{{', 'message', '}}'],
            [TokenType.TEXT, ''],
            [TokenType.EXPANSION_CASE_EXP_END],
            [TokenType.EXPANSION_FORM_END],
            [TokenType.TEXT, '\n'],
            [TokenType.EOF],
          ]);

          expect(result.nonNormalizedIcuExpressions).toEqual([]);
        });

        it('should not normalize line-endings in ICU expressions when `i18nNormalizeLineEndingsInICUs` is not defined', () => {
          const result = tokenizeWithoutErrors(
            `{\r\n` +
              `    messages.length,\r\n` +
              `    plural,\r\n` +
              `    =0 {You have \r\nno\r\n messages}\r\n` +
              `    =1 {One {{message}}}}\r\n`,
            {tokenizeExpansionForms: true, escapedString: false},
          );

          expect(humanizeParts(result.tokens)).toEqual([
            [TokenType.EXPANSION_FORM_START],
            [TokenType.RAW_TEXT, '\r\n    messages.length'],
            [TokenType.RAW_TEXT, 'plural'],
            [TokenType.EXPANSION_CASE_VALUE, '=0'],
            [TokenType.EXPANSION_CASE_EXP_START],
            [TokenType.TEXT, 'You have \nno\n messages'],
            [TokenType.EXPANSION_CASE_EXP_END],
            [TokenType.EXPANSION_CASE_VALUE, '=1'],
            [TokenType.EXPANSION_CASE_EXP_START],
            [TokenType.TEXT, 'One '],
            [TokenType.INTERPOLATION, '{{', 'message', '}}'],
            [TokenType.TEXT, ''],
            [TokenType.EXPANSION_CASE_EXP_END],
            [TokenType.EXPANSION_FORM_END],
            [TokenType.TEXT, '\n'],
            [TokenType.EOF],
          ]);

          expect(result.nonNormalizedIcuExpressions!.length).toBe(1);
          expect(result.nonNormalizedIcuExpressions![0].sourceSpan.toString()).toEqual(
            '\r\n    messages.length',
          );
        });

        it('should not normalize line endings in nested expansion forms when `i18nNormalizeLineEndingsInICUs` is not defined', () => {
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
            {tokenizeExpansionForms: true},
          );

          expect(humanizeParts(result.tokens)).toEqual([
            [TokenType.EXPANSION_FORM_START],
            [TokenType.RAW_TEXT, '\r\n  messages.length'],
            [TokenType.RAW_TEXT, 'plural'],
            [TokenType.EXPANSION_CASE_VALUE, '=0'],
            [TokenType.EXPANSION_CASE_EXP_START],
            [TokenType.TEXT, 'zero \n       '],

            [TokenType.EXPANSION_FORM_START],
            [TokenType.RAW_TEXT, '\r\n         p.gender'],
            [TokenType.RAW_TEXT, 'select'],
            [TokenType.EXPANSION_CASE_VALUE, 'male'],
            [TokenType.EXPANSION_CASE_EXP_START],
            [TokenType.TEXT, 'm'],
            [TokenType.EXPANSION_CASE_EXP_END],
            [TokenType.EXPANSION_FORM_END],

            [TokenType.TEXT, '\n     '],
            [TokenType.EXPANSION_CASE_EXP_END],
            [TokenType.EXPANSION_FORM_END],
            [TokenType.EOF],
          ]);

          expect(result.nonNormalizedIcuExpressions!.length).toBe(2);
          expect(result.nonNormalizedIcuExpressions![0].sourceSpan.toString()).toEqual(
            '\r\n  messages.length',
          );
          expect(result.nonNormalizedIcuExpressions![1].sourceSpan.toString()).toEqual(
            '\r\n         p.gender',
          );
        });
      });
    });
  });

  describe('errors', () => {
    it('should report unescaped "{" on error', () => {
      expect(
        tokenizeAndHumanizeErrors(`<p>before { after</p>`, {tokenizeExpansionForms: true}),
      ).toEqual([
        [
          `Unexpected character "EOF" (Do you have an unescaped "{" in your template? Use "{{ '{' }}") to escape it.)`,
          '0:21',
        ],
      ]);
    });

    it('should report unescaped "{" as an error, even after a prematurely terminated interpolation', () => {
      expect(
        tokenizeAndHumanizeErrors(`<code>{{b}<!---->}</code><pre>import {a} from 'a';</pre>`, {
          tokenizeExpansionForms: true,
        }),
      ).toEqual([
        [
          `Unexpected character "EOF" (Do you have an unescaped "{" in your template? Use "{{ '{' }}") to escape it.)`,
          '0:56',
        ],
      ]);
    });

    it('should include 2 lines of context in message', () => {
      const src = '111\n222\n333\nE\n444\n555\n666\n';
      const file = new ParseSourceFile(src, 'file://');
      const location = new ParseLocation(file, 12, 123, 456);
      const span = new ParseSourceSpan(location, location);
      const error = new ParseError(span, '**ERROR**');
      expect(error.toString()).toEqual(
        `**ERROR** ("\n222\n333\n[ERROR ->]E\n444\n555\n"): file://@123:456`,
      );
    });
  });

  describe('unicode characters', () => {
    it('should support unicode characters', () => {
      expect(tokenizeAndHumanizeSourceSpans(`<p>İ</p>`)).toEqual([
        [TokenType.TAG_OPEN_START, '<p'],
        [TokenType.TAG_OPEN_END, '>'],
        [TokenType.TEXT, 'İ'],
        [TokenType.TAG_CLOSE, '</p>'],
        [TokenType.EOF, ''],
      ]);
    });
  });

  describe('(processing escaped strings)', () => {
    it('should unescape standard escape sequences', () => {
      expect(tokenizeAndHumanizeParts("\\' \\' \\'", {escapedString: true})).toEqual([
        [TokenType.TEXT, "' ' '"],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('\\" \\" \\"', {escapedString: true})).toEqual([
        [TokenType.TEXT, '" " "'],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('\\` \\` \\`', {escapedString: true})).toEqual([
        [TokenType.TEXT, '` ` `'],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('\\\\ \\\\ \\\\', {escapedString: true})).toEqual([
        [TokenType.TEXT, '\\ \\ \\'],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('\\n \\n \\n', {escapedString: true})).toEqual([
        [TokenType.TEXT, '\n \n \n'],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('\\r{{\\r}}\\r', {escapedString: true})).toEqual([
        // post processing converts `\r` to `\n`
        [TokenType.TEXT, '\n'],
        [TokenType.INTERPOLATION, '{{', '\n', '}}'],
        [TokenType.TEXT, '\n'],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('\\v \\v \\v', {escapedString: true})).toEqual([
        [TokenType.TEXT, '\v \v \v'],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('\\t \\t \\t', {escapedString: true})).toEqual([
        [TokenType.TEXT, '\t \t \t'],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('\\b \\b \\b', {escapedString: true})).toEqual([
        [TokenType.TEXT, '\b \b \b'],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('\\f \\f \\f', {escapedString: true})).toEqual([
        [TokenType.TEXT, '\f \f \f'],
        [TokenType.EOF],
      ]);
      expect(
        tokenizeAndHumanizeParts('\\\' \\" \\` \\\\ \\n \\r \\v \\t \\b \\f', {
          escapedString: true,
        }),
      ).toEqual([[TokenType.TEXT, '\' " ` \\ \n \n \v \t \b \f'], [TokenType.EOF]]);
    });

    it('should unescape null sequences', () => {
      expect(tokenizeAndHumanizeParts('\\0', {escapedString: true})).toEqual([[TokenType.EOF]]);
      // \09 is not an octal number so the \0 is taken as EOF
      expect(tokenizeAndHumanizeParts('\\09', {escapedString: true})).toEqual([[TokenType.EOF]]);
    });

    it('should unescape octal sequences', () => {
      // \19 is read as an octal `\1` followed by a normal char `9`
      // \1234 is read as an octal `\123` followed by a normal char `4`
      // \999 is not an octal number so its backslash just gets removed.
      expect(
        tokenizeAndHumanizeParts('\\001 \\01 \\1 \\12 \\223 \\19 \\2234 \\999', {
          escapedString: true,
        }),
      ).toEqual([[TokenType.TEXT, '\x01 \x01 \x01 \x0A \x93 \x019 \x934 999'], [TokenType.EOF]]);
    });

    it('should unescape hex sequences', () => {
      expect(tokenizeAndHumanizeParts('\\x12 \\x4F \\xDC', {escapedString: true})).toEqual([
        [TokenType.TEXT, '\x12 \x4F \xDC'],
        [TokenType.EOF],
      ]);
    });

    it('should report an error on an invalid hex sequence', () => {
      expect(tokenizeAndHumanizeErrors('\\xGG', {escapedString: true})).toEqual([
        ['Invalid hexadecimal escape sequence', '0:2'],
      ]);

      expect(tokenizeAndHumanizeErrors('abc \\x xyz', {escapedString: true})).toEqual([
        ['Invalid hexadecimal escape sequence', '0:6'],
      ]);

      expect(tokenizeAndHumanizeErrors('abc\\x', {escapedString: true})).toEqual([
        ['Unexpected character "EOF"', '0:5'],
      ]);
    });

    it('should unescape fixed length Unicode sequences', () => {
      expect(tokenizeAndHumanizeParts('\\u0123 \\uABCD', {escapedString: true})).toEqual([
        [TokenType.TEXT, '\u0123 \uABCD'],
        [TokenType.EOF],
      ]);
    });

    it('should error on an invalid fixed length Unicode sequence', () => {
      expect(tokenizeAndHumanizeErrors('\\uGGGG', {escapedString: true})).toEqual([
        ['Invalid hexadecimal escape sequence', '0:2'],
      ]);
    });

    it('should unescape variable length Unicode sequences', () => {
      expect(
        tokenizeAndHumanizeParts('\\u{01} \\u{ABC} \\u{1234} \\u{123AB}', {escapedString: true}),
      ).toEqual([[TokenType.TEXT, '\u{01} \u{ABC} \u{1234} \u{123AB}'], [TokenType.EOF]]);
    });

    it('should error on an invalid variable length Unicode sequence', () => {
      expect(tokenizeAndHumanizeErrors('\\u{GG}', {escapedString: true})).toEqual([
        ['Invalid hexadecimal escape sequence', '0:3'],
      ]);
    });

    it('should unescape line continuations', () => {
      expect(tokenizeAndHumanizeParts('abc\\\ndef', {escapedString: true})).toEqual([
        [TokenType.TEXT, 'abcdef'],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeParts('\\\nx\\\ny\\\n', {escapedString: true})).toEqual([
        [TokenType.TEXT, 'xy'],
        [TokenType.EOF],
      ]);
    });

    it('should remove backslash from "non-escape" sequences', () => {
      expect(tokenizeAndHumanizeParts('a g ~', {escapedString: true})).toEqual([
        [TokenType.TEXT, 'a g ~'],
        [TokenType.EOF],
      ]);
    });

    it('should unescape sequences in plain text', () => {
      expect(
        tokenizeAndHumanizeParts('abc\ndef\\nghi\\tjkl\\`\\\'\\"mno', {escapedString: true}),
      ).toEqual([[TokenType.TEXT, 'abc\ndef\nghi\tjkl`\'"mno'], [TokenType.EOF]]);
    });

    it('should unescape sequences in raw text', () => {
      expect(
        tokenizeAndHumanizeParts('<script>abc\ndef\\nghi\\tjkl\\`\\\'\\"mno</script>', {
          escapedString: true,
        }),
      ).toEqual([
        [TokenType.TAG_OPEN_START, '', 'script'],
        [TokenType.TAG_OPEN_END],
        [TokenType.RAW_TEXT, 'abc\ndef\nghi\tjkl`\'"mno'],
        [TokenType.TAG_CLOSE, '', 'script'],
        [TokenType.EOF],
      ]);
    });

    it('should unescape sequences in escapable raw text', () => {
      expect(
        tokenizeAndHumanizeParts('<title>abc\ndef\\nghi\\tjkl\\`\\\'\\"mno</title>', {
          escapedString: true,
        }),
      ).toEqual([
        [TokenType.TAG_OPEN_START, '', 'title'],
        [TokenType.TAG_OPEN_END],
        [TokenType.ESCAPABLE_RAW_TEXT, 'abc\ndef\nghi\tjkl`\'"mno'],
        [TokenType.TAG_CLOSE, '', 'title'],
        [TokenType.EOF],
      ]);
    });

    it('should parse over escape sequences in tag definitions', () => {
      expect(
        tokenizeAndHumanizeParts('<t a=\\"b\\" \\n c=\\\'d\\\'>', {escapedString: true}),
      ).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, 'b'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_NAME, '', 'c'],
        [TokenType.ATTR_QUOTE, "'"],
        [TokenType.ATTR_VALUE_TEXT, 'd'],
        [TokenType.ATTR_QUOTE, "'"],
        [TokenType.TAG_OPEN_END],
        [TokenType.EOF],
      ]);
    });

    it('should parse over escaped new line in tag definitions', () => {
      const text = '<t\\n></t>';
      expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TAG_CLOSE, '', 't'],
        [TokenType.EOF],
      ]);
    });

    it('should parse over escaped characters in tag definitions', () => {
      const text = '<t\u{000013}></t>';
      expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TAG_CLOSE, '', 't'],
        [TokenType.EOF],
      ]);
    });

    it('should unescape characters in tag names', () => {
      const text = '<t\\x64></t\\x64>';
      expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
        [TokenType.TAG_OPEN_START, '', 'td'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TAG_CLOSE, '', 'td'],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeSourceSpans(text, {escapedString: true})).toEqual([
        [TokenType.TAG_OPEN_START, '<t\\x64'],
        [TokenType.TAG_OPEN_END, '>'],
        [TokenType.TAG_CLOSE, '</t\\x64>'],
        [TokenType.EOF, ''],
      ]);
    });

    it('should unescape characters in attributes', () => {
      const text = '<t \\x64="\\x65"></t>';
      expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', 'd'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, 'e'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TAG_CLOSE, '', 't'],
        [TokenType.EOF],
      ]);
    });

    it('should parse over escaped new line in attribute values', () => {
      const text = '<t a=b\\n></t>';
      expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_VALUE_TEXT, 'b'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TAG_CLOSE, '', 't'],
        [TokenType.EOF],
      ]);
    });

    it('should tokenize the correct span when there are escape sequences', () => {
      const text = 'selector: "app-root",\ntemplate: "line 1\\n\\"line 2\\"\\nline 3",\ninputs: []';
      const range = {
        startPos: 33,
        startLine: 1,
        startCol: 10,
        endPos: 59,
      };
      expect(tokenizeAndHumanizeParts(text, {range, escapedString: true})).toEqual([
        [TokenType.TEXT, 'line 1\n"line 2"\nline 3'],
        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeSourceSpans(text, {range, escapedString: true})).toEqual([
        [TokenType.TEXT, 'line 1\\n\\"line 2\\"\\nline 3'],
        [TokenType.EOF, ''],
      ]);
    });

    it('should account for escape sequences when computing source spans ', () => {
      const text =
        '<t>line 1</t>\n' + // <- unescaped line break
        '<t>line 2</t>\\n' + // <- escaped line break
        '<t>line 3\\\n' + // <- line continuation
        '</t>';
      expect(tokenizeAndHumanizeParts(text, {escapedString: true})).toEqual([
        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TEXT, 'line 1'],
        [TokenType.TAG_CLOSE, '', 't'],
        [TokenType.TEXT, '\n'],

        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TEXT, 'line 2'],
        [TokenType.TAG_CLOSE, '', 't'],
        [TokenType.TEXT, '\n'],

        [TokenType.TAG_OPEN_START, '', 't'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TEXT, 'line 3'], // <- line continuation does not appear in token
        [TokenType.TAG_CLOSE, '', 't'],

        [TokenType.EOF],
      ]);
      expect(tokenizeAndHumanizeLineColumn(text, {escapedString: true})).toEqual([
        [TokenType.TAG_OPEN_START, '0:0'],
        [TokenType.TAG_OPEN_END, '0:2'],
        [TokenType.TEXT, '0:3'],
        [TokenType.TAG_CLOSE, '0:9'],
        [TokenType.TEXT, '0:13'], // <- real newline increments the row

        [TokenType.TAG_OPEN_START, '1:0'],
        [TokenType.TAG_OPEN_END, '1:2'],
        [TokenType.TEXT, '1:3'],
        [TokenType.TAG_CLOSE, '1:9'],
        [TokenType.TEXT, '1:13'], // <- escaped newline does not increment the row

        [TokenType.TAG_OPEN_START, '1:15'],
        [TokenType.TAG_OPEN_END, '1:17'],
        [TokenType.TEXT, '1:18'], // <- the line continuation increments the row
        [TokenType.TAG_CLOSE, '2:0'],

        [TokenType.EOF, '2:4'],
      ]);
      expect(tokenizeAndHumanizeSourceSpans(text, {escapedString: true})).toEqual([
        [TokenType.TAG_OPEN_START, '<t'],
        [TokenType.TAG_OPEN_END, '>'],
        [TokenType.TEXT, 'line 1'],
        [TokenType.TAG_CLOSE, '</t>'],
        [TokenType.TEXT, '\n'],

        [TokenType.TAG_OPEN_START, '<t'],
        [TokenType.TAG_OPEN_END, '>'],
        [TokenType.TEXT, 'line 2'],
        [TokenType.TAG_CLOSE, '</t>'],
        [TokenType.TEXT, '\\n'],

        [TokenType.TAG_OPEN_START, '<t'],
        [TokenType.TAG_OPEN_END, '>'],
        [TokenType.TEXT, 'line 3\\\n'],
        [TokenType.TAG_CLOSE, '</t>'],

        [TokenType.EOF, ''],
      ]);
    });
  });

  describe('blocks', () => {
    it('should parse a block without parameters', () => {
      const expected = [
        [TokenType.BLOCK_OPEN_START, 'if'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ];

      expect(tokenizeAndHumanizeParts('@if {hello}')).toEqual(expected);
      expect(tokenizeAndHumanizeParts('@if () {hello}')).toEqual(expected);
      expect(tokenizeAndHumanizeParts('@if(){hello}')).toEqual(expected);
    });

    it('should parse a block with parameters', () => {
      expect(tokenizeAndHumanizeParts('@for (item of items; track item.id) {hello}')).toEqual([
        [TokenType.BLOCK_OPEN_START, 'for'],
        [TokenType.BLOCK_PARAMETER, 'item of items'],
        [TokenType.BLOCK_PARAMETER, 'track item.id'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should parse a block with a trailing semicolon after the parameters', () => {
      expect(tokenizeAndHumanizeParts('@for (item of items;) {hello}')).toEqual([
        [TokenType.BLOCK_OPEN_START, 'for'],
        [TokenType.BLOCK_PARAMETER, 'item of items'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should parse a block with a space in its name', () => {
      expect(tokenizeAndHumanizeParts('@else if {hello}')).toEqual([
        [TokenType.BLOCK_OPEN_START, 'else if'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);

      expect(tokenizeAndHumanizeParts('@else if (foo !== 2) {hello}')).toEqual([
        [TokenType.BLOCK_OPEN_START, 'else if'],
        [TokenType.BLOCK_PARAMETER, 'foo !== 2'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should parse a block with an arbitrary amount of spaces around the parentheses', () => {
      const expected = [
        [TokenType.BLOCK_OPEN_START, 'for'],
        [TokenType.BLOCK_PARAMETER, 'a'],
        [TokenType.BLOCK_PARAMETER, 'b'],
        [TokenType.BLOCK_PARAMETER, 'c'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ];

      expect(tokenizeAndHumanizeParts('@for(a; b; c){hello}')).toEqual(expected);
      expect(tokenizeAndHumanizeParts('@for      (a; b; c)      {hello}')).toEqual(expected);
      expect(tokenizeAndHumanizeParts('@for(a; b; c)      {hello}')).toEqual(expected);
      expect(tokenizeAndHumanizeParts('@for      (a; b; c){hello}')).toEqual(expected);
    });

    it('should parse a block with multiple trailing semicolons', () => {
      expect(tokenizeAndHumanizeParts('@for (item of items;;;;;) {hello}')).toEqual([
        [TokenType.BLOCK_OPEN_START, 'for'],
        [TokenType.BLOCK_PARAMETER, 'item of items'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should parse a block with trailing whitespace', () => {
      expect(tokenizeAndHumanizeParts('@defer                        {hello}')).toEqual([
        [TokenType.BLOCK_OPEN_START, 'defer'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should parse a block with no trailing semicolon', () => {
      expect(tokenizeAndHumanizeParts('@for (item of items){hello}')).toEqual([
        [TokenType.BLOCK_OPEN_START, 'for'],
        [TokenType.BLOCK_PARAMETER, 'item of items'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should handle semicolons, braces and parentheses used in a block parameter', () => {
      const input = `@for (a === ";"; b === ')'; c === "("; d === '}'; e === "{") {hello}`;
      expect(tokenizeAndHumanizeParts(input)).toEqual([
        [TokenType.BLOCK_OPEN_START, 'for'],
        [TokenType.BLOCK_PARAMETER, `a === ";"`],
        [TokenType.BLOCK_PARAMETER, `b === ')'`],
        [TokenType.BLOCK_PARAMETER, `c === "("`],
        [TokenType.BLOCK_PARAMETER, `d === '}'`],
        [TokenType.BLOCK_PARAMETER, `e === "{"`],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should handle object literals and function calls in block parameters', () => {
      expect(
        tokenizeAndHumanizeParts(
          `@defer (on a({a: 1, b: 2}, false, {c: 3}); when b({d: 4})) {hello}`,
        ),
      ).toEqual([
        [TokenType.BLOCK_OPEN_START, 'defer'],
        [TokenType.BLOCK_PARAMETER, 'on a({a: 1, b: 2}, false, {c: 3})'],
        [TokenType.BLOCK_PARAMETER, 'when b({d: 4})'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should parse block with unclosed parameters', () => {
      expect(tokenizeAndHumanizeParts(`@if (a === b {hello}`)).toEqual([
        [TokenType.INCOMPLETE_BLOCK_OPEN, 'if'],
        [TokenType.BLOCK_PARAMETER, 'a === b {hello}'],
        [TokenType.EOF],
      ]);
    });

    it('should parse block with stray parentheses in the parameter position', () => {
      expect(tokenizeAndHumanizeParts(`@if a === b) {hello}`)).toEqual([
        [TokenType.INCOMPLETE_BLOCK_OPEN, 'if a'],
        [TokenType.TEXT, '=== b) {hello'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should report invalid quotes in a parameter', () => {
      expect(tokenizeAndHumanizeErrors(`@if (a === ") {hello}`)).toEqual([
        ['Unexpected character "EOF"', '0:21'],
      ]);

      expect(tokenizeAndHumanizeErrors(`@if (a === "hi') {hello}`)).toEqual([
        ['Unexpected character "EOF"', '0:24'],
      ]);
    });

    it('should report unclosed object literal inside a parameter', () => {
      expect(tokenizeAndHumanizeParts(`@if ({invalid: true) hello}`)).toEqual([
        [TokenType.INCOMPLETE_BLOCK_OPEN, 'if'],
        [TokenType.BLOCK_PARAMETER, '{invalid: true'],
        [TokenType.TEXT, 'hello'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should handle a semicolon used in a nested string inside a block parameter', () => {
      expect(tokenizeAndHumanizeParts(`@if (condition === "';'") {hello}`)).toEqual([
        [TokenType.BLOCK_OPEN_START, 'if'],
        [TokenType.BLOCK_PARAMETER, `condition === "';'"`],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should handle a semicolon next to an escaped quote used in a block parameter', () => {
      expect(tokenizeAndHumanizeParts('@if (condition === "\\";") {hello}')).toEqual([
        [TokenType.BLOCK_OPEN_START, 'if'],
        [TokenType.BLOCK_PARAMETER, 'condition === "\\";"'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should parse mixed text and html content in a block', () => {
      expect(tokenizeAndHumanizeParts('@if (a === 1) {foo <b>bar</b> baz}')).toEqual([
        [TokenType.BLOCK_OPEN_START, 'if'],
        [TokenType.BLOCK_PARAMETER, 'a === 1'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'foo '],
        [TokenType.TAG_OPEN_START, '', 'b'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TEXT, 'bar'],
        [TokenType.TAG_CLOSE, '', 'b'],
        [TokenType.TEXT, ' baz'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should parse HTML tags with attributes containing curly braces inside blocks', () => {
      expect(tokenizeAndHumanizeParts('@if (a === 1) {<div a="}" b="{"></div>}')).toEqual([
        [TokenType.BLOCK_OPEN_START, 'if'],
        [TokenType.BLOCK_PARAMETER, 'a === 1'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TAG_OPEN_START, '', 'div'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, '}'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_NAME, '', 'b'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, '{'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TAG_CLOSE, '', 'div'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should parse HTML tags with attribute containing block syntax', () => {
      expect(tokenizeAndHumanizeParts('<div a="@if (foo) {}"></div>')).toEqual([
        [TokenType.TAG_OPEN_START, '', 'div'],
        [TokenType.ATTR_NAME, '', 'a'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.ATTR_VALUE_TEXT, '@if (foo) {}'],
        [TokenType.ATTR_QUOTE, '"'],
        [TokenType.TAG_OPEN_END],
        [TokenType.TAG_CLOSE, '', 'div'],
        [TokenType.EOF],
      ]);
    });

    it('should parse nested blocks', () => {
      expect(
        tokenizeAndHumanizeParts(
          '@if (a) {' +
            'hello a' +
            '@if {' +
            'hello unnamed' +
            '@if (b) {' +
            'hello b' +
            '@if (c) {' +
            'hello c' +
            '}' +
            '}' +
            '}' +
            '}',
        ),
      ).toEqual([
        [TokenType.BLOCK_OPEN_START, 'if'],
        [TokenType.BLOCK_PARAMETER, 'a'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello a'],
        [TokenType.BLOCK_OPEN_START, 'if'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello unnamed'],
        [TokenType.BLOCK_OPEN_START, 'if'],
        [TokenType.BLOCK_PARAMETER, 'b'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello b'],
        [TokenType.BLOCK_OPEN_START, 'if'],
        [TokenType.BLOCK_PARAMETER, 'c'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, 'hello c'],
        [TokenType.BLOCK_CLOSE],
        [TokenType.BLOCK_CLOSE],
        [TokenType.BLOCK_CLOSE],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should parse a block containing an expansion', () => {
      const result = tokenizeAndHumanizeParts(
        '@defer {{one.two, three, =4 {four} =5 {five} foo {bar} }}',
        {tokenizeExpansionForms: true},
      );

      expect(result).toEqual([
        [TokenType.BLOCK_OPEN_START, 'defer'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.EXPANSION_FORM_START],
        [TokenType.RAW_TEXT, 'one.two'],
        [TokenType.RAW_TEXT, 'three'],
        [TokenType.EXPANSION_CASE_VALUE, '=4'],
        [TokenType.EXPANSION_CASE_EXP_START],
        [TokenType.TEXT, 'four'],
        [TokenType.EXPANSION_CASE_EXP_END],
        [TokenType.EXPANSION_CASE_VALUE, '=5'],
        [TokenType.EXPANSION_CASE_EXP_START],
        [TokenType.TEXT, 'five'],
        [TokenType.EXPANSION_CASE_EXP_END],
        [TokenType.EXPANSION_CASE_VALUE, 'foo'],
        [TokenType.EXPANSION_CASE_EXP_START],
        [TokenType.TEXT, 'bar'],
        [TokenType.EXPANSION_CASE_EXP_END],
        [TokenType.EXPANSION_FORM_END],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should parse a block containing an interpolation', () => {
      expect(tokenizeAndHumanizeParts('@defer {{{message}}}')).toEqual([
        [TokenType.BLOCK_OPEN_START, 'defer'],
        [TokenType.BLOCK_OPEN_END],
        [TokenType.TEXT, ''],
        [TokenType.INTERPOLATION, '{{', 'message', '}}'],
        [TokenType.TEXT, ''],
        [TokenType.BLOCK_CLOSE],
        [TokenType.EOF],
      ]);
    });

    it('should parse an incomplete block start without parameters with surrounding text', () => {
      expect(tokenizeAndHumanizeParts('My email frodo@for.com')).toEqual([
        [TokenType.TEXT, 'My email frodo'],
        [TokenType.INCOMPLETE_BLOCK_OPEN, 'for'],
        [TokenType.TEXT, '.com'],
        [TokenType.EOF],
      ]);
    });

    it('should parse an incomplete block start at the end of the input', () => {
      expect(tokenizeAndHumanizeParts('My favorite console is @switch')).toEqual([
        [TokenType.TEXT, 'My favorite console is '],
        [TokenType.INCOMPLETE_BLOCK_OPEN, 'switch'],
        [TokenType.EOF],
      ]);
    });

    it('should parse an incomplete block start with parentheses but without params', () => {
      expect(tokenizeAndHumanizeParts('Use the @for() block')).toEqual([
        [TokenType.TEXT, 'Use the '],
        [TokenType.INCOMPLETE_BLOCK_OPEN, 'for'],
        [TokenType.TEXT, 'block'],
        [TokenType.EOF],
      ]);
    });

    it('should parse an incomplete block start with parentheses and params', () => {
      expect(tokenizeAndHumanizeParts('This is the @if({alias: "foo"}) expression')).toEqual([
        [TokenType.TEXT, 'This is the '],
        [TokenType.INCOMPLETE_BLOCK_OPEN, 'if'],
        [TokenType.BLOCK_PARAMETER, '{alias: "foo"}'],
        [TokenType.TEXT, 'expression'],
        [TokenType.EOF],
      ]);
    });

    it('should parse @ as text', () => {
      expect(tokenizeAndHumanizeParts(`@`)).toEqual([[TokenType.TEXT, '@'], [TokenType.EOF]]);
    });

    it('should parse space followed by @ as text', () => {
      expect(tokenizeAndHumanizeParts(` @`)).toEqual([[TokenType.TEXT, ' @'], [TokenType.EOF]]);
    });

    it('should parse @ followed by space as text', () => {
      expect(tokenizeAndHumanizeParts(`@ `)).toEqual([[TokenType.TEXT, '@ '], [TokenType.EOF]]);
    });

    it('should parse @ followed by newline and text as text', () => {
      expect(tokenizeAndHumanizeParts(`@\nfoo`)).toEqual([
        [TokenType.TEXT, '@\nfoo'],
        [TokenType.EOF],
      ]);
    });

    it('should parse @ in the middle of text as text', () => {
      expect(tokenizeAndHumanizeParts(`foo bar @ baz clink`)).toEqual([
        [TokenType.TEXT, 'foo bar @ baz clink'],
        [TokenType.EOF],
      ]);
    });

    it('should parse incomplete block with space, then name as text', () => {
      expect(tokenizeAndHumanizeParts(`@ if`)).toEqual([[TokenType.TEXT, '@ if'], [TokenType.EOF]]);
    });
  });
});

function tokenizeWithoutErrors(input: string, options?: TokenizeOptions): TokenizeResult {
  const tokenizeResult = tokenize(input, 'someUrl', getHtmlTagDefinition, options);

  if (tokenizeResult.errors.length > 0) {
    const errorString = tokenizeResult.errors.join('\n');
    throw new Error(`Unexpected parse errors:\n${errorString}`);
  }

  return tokenizeResult;
}

function humanizeParts(tokens: Token[]) {
  return tokens.map((token) => [token.type, ...token.parts]);
}

function tokenizeAndHumanizeParts(input: string, options?: TokenizeOptions): any[] {
  return humanizeParts(tokenizeWithoutErrors(input, options).tokens);
}

function tokenizeAndHumanizeSourceSpans(input: string, options?: TokenizeOptions): any[] {
  return tokenizeWithoutErrors(input, options).tokens.map((token) => [
    <any>token.type,
    token.sourceSpan.toString(),
  ]);
}

function humanizeLineColumn(location: ParseLocation): string {
  return `${location.line}:${location.col}`;
}

function tokenizeAndHumanizeLineColumn(input: string, options?: TokenizeOptions): any[] {
  return tokenizeWithoutErrors(input, options).tokens.map((token) => [
    <any>token.type,
    humanizeLineColumn(token.sourceSpan.start),
  ]);
}

function tokenizeAndHumanizeFullStart(input: string, options?: TokenizeOptions): any[] {
  return tokenizeWithoutErrors(input, options).tokens.map((token) => [
    <any>token.type,
    humanizeLineColumn(token.sourceSpan.start),
    humanizeLineColumn(token.sourceSpan.fullStart),
  ]);
}

function tokenizeAndHumanizeErrors(input: string, options?: TokenizeOptions): any[] {
  return tokenize(input, 'someUrl', getHtmlTagDefinition, options).errors.map((e) => [
    e.msg,
    humanizeLineColumn(e.span.start),
  ]);
}
