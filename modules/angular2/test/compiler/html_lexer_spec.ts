import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach
} from 'angular2/testing_internal';
import {BaseException} from 'angular2/src/facade/exceptions';

import {
  tokenizeHtml,
  HtmlToken,
  HtmlTokenType,
  HtmlTokenError
} from 'angular2/src/compiler/html_lexer';
import {ParseSourceSpan, ParseLocation, ParseSourceFile} from 'angular2/src/compiler/parse_util';

export function main() {
  describe('HtmlLexer', () => {
    describe('line/column numbers', () => {
      it('should work without newlines', () => {
        expect(tokenizeAndHumanizeLineColumn('<t>a</t>'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, '0:0'],
              [HtmlTokenType.TAG_OPEN_END, '0:2'],
              [HtmlTokenType.TEXT, '0:3'],
              [HtmlTokenType.TAG_CLOSE, '0:4'],
              [HtmlTokenType.EOF, '0:8']
            ]);
      });

      it('should work with one newline', () => {
        expect(tokenizeAndHumanizeLineColumn('<t>\na</t>'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, '0:0'],
              [HtmlTokenType.TAG_OPEN_END, '0:2'],
              [HtmlTokenType.TEXT, '0:3'],
              [HtmlTokenType.TAG_CLOSE, '1:1'],
              [HtmlTokenType.EOF, '1:5']
            ]);
      });

      it('should work with multiple newlines', () => {
        expect(tokenizeAndHumanizeLineColumn('<t\n>\na</t>'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, '0:0'],
              [HtmlTokenType.TAG_OPEN_END, '1:0'],
              [HtmlTokenType.TEXT, '1:1'],
              [HtmlTokenType.TAG_CLOSE, '2:1'],
              [HtmlTokenType.EOF, '2:5']
            ]);
      });

      it('should work with CR and LF', () => {
        expect(tokenizeAndHumanizeLineColumn('<t\n>\r\na\r</t>'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, '0:0'],
              [HtmlTokenType.TAG_OPEN_END, '1:0'],
              [HtmlTokenType.TEXT, '1:1'],
              [HtmlTokenType.TAG_CLOSE, '2:1'],
              [HtmlTokenType.EOF, '2:5']
            ]);
      });
    });

    describe('expression', () => {
      it('should parse expression', () => {
        expect(tokenizeAndHumanizeParts('{{ exp }}'))
            .toEqual([
              [HtmlTokenType.TEXT, '{{ exp }}'],
              [HtmlTokenType.EOF],
            ]);
      });

      it('should decode entities', () => {
        expect(tokenizeAndHumanizeParts('{{ &amp; }}'))
            .toEqual([
              [HtmlTokenType.TEXT, '{{ & }}'],
              [HtmlTokenType.EOF],
            ]);
      });

      it('should consume raw text', () => {
        expect(tokenizeAndHumanizeParts('{{ <a></a> }}'))
            .toEqual([
              [HtmlTokenType.TEXT, '{{ <a></a> }}'],
              [HtmlTokenType.EOF],
            ]);
      });

      it('should handle new lines', () => {
        expect(tokenizeAndHumanizeParts('{{ -\n-\r-\r\n- }}'))
            .toEqual([
              [HtmlTokenType.TEXT, '{{ -\n-\n-\n- }}'],
              [HtmlTokenType.EOF],
            ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans('foo{{exp1}}{{}}'))
            .toEqual([
              [HtmlTokenType.TEXT, 'foo{{exp1}}{{}}'],
              [HtmlTokenType.EOF, ''],
            ]);
      });

      it('should report missing end delimiter', () => {
        expect(tokenizeAndHumanizeErrors('{{ exp'))
            .toEqual([[HtmlTokenType.TEXT, 'Unexpected character "EOF"', '0:6']]);
      });
    });

    describe('comments', () => {
      it('should parse comments', () => {
        expect(tokenizeAndHumanizeParts('<!--t\ne\rs\r\nt-->'))
            .toEqual([
              [HtmlTokenType.COMMENT_START],
              [HtmlTokenType.RAW_TEXT, 't\ne\ns\nt'],
              [HtmlTokenType.COMMENT_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should parse comments with "-"', () => {
        expect(tokenizeAndHumanizeParts('<!-- -- -->'))
            .toEqual([
              [HtmlTokenType.COMMENT_START],
              [HtmlTokenType.RAW_TEXT, ' -- '],
              [HtmlTokenType.COMMENT_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should store the locations',
         () => {expect(tokenizeAndHumanizeSourceSpans('<!--t\ne\rs\r\nt-->'))
                    .toEqual([
                      [HtmlTokenType.COMMENT_START, '<!--'],
                      [HtmlTokenType.RAW_TEXT, 't\ne\rs\r\nt'],
                      [HtmlTokenType.COMMENT_END, '-->'],
                      [HtmlTokenType.EOF, '']
                    ])});

      it('should report <!- without -', () => {
        expect(tokenizeAndHumanizeErrors('<!-a'))
            .toEqual([[HtmlTokenType.COMMENT_START, 'Unexpected character "a"', '0:3']]);
      });

      it('should report missing end comment', () => {
        expect(tokenizeAndHumanizeErrors('<!--'))
            .toEqual([[HtmlTokenType.RAW_TEXT, 'Unexpected character "EOF"', '0:4']]);
      });
    });

    describe('doctype', () => {
      it('should parse doctypes', () => {
        expect(tokenizeAndHumanizeParts('<!doctype html>'))
            .toEqual([[HtmlTokenType.DOC_TYPE, 'doctype html'], [HtmlTokenType.EOF]]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans('<!doctype html>'))
            .toEqual([[HtmlTokenType.DOC_TYPE, '<!doctype html>'], [HtmlTokenType.EOF, '']]);
      });

      it('should report missing end doctype', () => {
        expect(tokenizeAndHumanizeErrors('<!'))
            .toEqual([[HtmlTokenType.DOC_TYPE, 'Unexpected character "EOF"', '0:2']]);
      });
    });

    describe('cdata', () => {
      it('should parse cdata', () => {
        expect(tokenizeAndHumanizeParts('<![cdata[t\ne\rs\r\nt]]>'))
            .toEqual([
              [HtmlTokenType.CDATA_START],
              [HtmlTokenType.RAW_TEXT, 't\ne\ns\nt'],
              [HtmlTokenType.CDATA_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans('<![cdata[t\ne\rs\r\nt]]>'))
            .toEqual([
              [HtmlTokenType.CDATA_START, '<![cdata['],
              [HtmlTokenType.RAW_TEXT, 't\ne\rs\r\nt'],
              [HtmlTokenType.CDATA_END, ']]>'],
              [HtmlTokenType.EOF, '']
            ]);
      });

      it('should report <![ without cdata[', () => {
        expect(tokenizeAndHumanizeErrors('<![a'))
            .toEqual([[HtmlTokenType.CDATA_START, 'Unexpected character "a"', '0:3']]);
      });

      it('should report missing end cdata', () => {
        expect(tokenizeAndHumanizeErrors('<![cdata['))
            .toEqual([[HtmlTokenType.RAW_TEXT, 'Unexpected character "EOF"', '0:9']]);
      });
    });

    describe('open tags', () => {
      it('should parse open tags without prefix', () => {
        expect(tokenizeAndHumanizeParts('<test>'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 'test'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should parse namespace prefix', () => {
        expect(tokenizeAndHumanizeParts('<ns1:test>'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, 'ns1', 'test'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should parse void tags', () => {
        expect(tokenizeAndHumanizeParts('<test/>'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 'test'],
              [HtmlTokenType.TAG_OPEN_END_VOID],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should allow whitespace after the tag name', () => {
        expect(tokenizeAndHumanizeParts('<test >'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 'test'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans('<test>'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, '<test'],
              [HtmlTokenType.TAG_OPEN_END, '>'],
              [HtmlTokenType.EOF, '']
            ]);
      });

      it('should report missing name after <', () => {
        expect(tokenizeAndHumanizeErrors('<'))
            .toEqual([[HtmlTokenType.TAG_OPEN_START, 'Unexpected character "EOF"', '0:1']]);
      });

      it('should report missing >', () => {
        expect(tokenizeAndHumanizeErrors('<name'))
            .toEqual([[HtmlTokenType.TAG_OPEN_START, 'Unexpected character "EOF"', '0:5']]);
      });

    });

    describe('attributes', () => {
      it('should parse attributes without prefix', () => {
        expect(tokenizeAndHumanizeParts('<t a>'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 't'],
              [HtmlTokenType.ATTR_NAME, null, 'a'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should parse attributes with prefix', () => {
        expect(tokenizeAndHumanizeParts('<t ns1:a>'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 't'],
              [HtmlTokenType.ATTR_NAME, 'ns1', 'a'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should parse attributes whose prefix is not valid', () => {
        expect(tokenizeAndHumanizeParts('<t (ns1:a)>'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 't'],
              [HtmlTokenType.ATTR_NAME, null, '(ns1:a)'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should parse attributes with single quote value', () => {
        expect(tokenizeAndHumanizeParts("<t a='b'>"))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 't'],
              [HtmlTokenType.ATTR_NAME, null, 'a'],
              [HtmlTokenType.ATTR_VALUE, 'b'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should parse attributes with double quote value', () => {
        expect(tokenizeAndHumanizeParts('<t a="b">'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 't'],
              [HtmlTokenType.ATTR_NAME, null, 'a'],
              [HtmlTokenType.ATTR_VALUE, 'b'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should parse attributes with unquoted value', () => {
        expect(tokenizeAndHumanizeParts('<t a=b>'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 't'],
              [HtmlTokenType.ATTR_NAME, null, 'a'],
              [HtmlTokenType.ATTR_VALUE, 'b'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should allow whitespace', () => {
        expect(tokenizeAndHumanizeParts('<t a = b >'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 't'],
              [HtmlTokenType.ATTR_NAME, null, 'a'],
              [HtmlTokenType.ATTR_VALUE, 'b'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should parse attributes with entities in values', () => {
        expect(tokenizeAndHumanizeParts('<t a="&#65;&#x41;">'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 't'],
              [HtmlTokenType.ATTR_NAME, null, 'a'],
              [HtmlTokenType.ATTR_VALUE, 'AA'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should not decode entities without trailing ";"', () => {
        expect(tokenizeAndHumanizeParts('<t a="&amp" b="c&&d">'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 't'],
              [HtmlTokenType.ATTR_NAME, null, 'a'],
              [HtmlTokenType.ATTR_VALUE, '&amp'],
              [HtmlTokenType.ATTR_NAME, null, 'b'],
              [HtmlTokenType.ATTR_VALUE, 'c&&d'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should parse attributes with "&" in values', () => {
        expect(tokenizeAndHumanizeParts('<t a="b && c &">'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 't'],
              [HtmlTokenType.ATTR_NAME, null, 'a'],
              [HtmlTokenType.ATTR_VALUE, 'b && c &'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should parse values with CR and LF', () => {
        expect(tokenizeAndHumanizeParts("<t a='t\ne\rs\r\nt'>"))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 't'],
              [HtmlTokenType.ATTR_NAME, null, 'a'],
              [HtmlTokenType.ATTR_VALUE, 't\ne\ns\nt'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans('<t a=b>'))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, '<t'],
              [HtmlTokenType.ATTR_NAME, 'a'],
              [HtmlTokenType.ATTR_VALUE, 'b'],
              [HtmlTokenType.TAG_OPEN_END, '>'],
              [HtmlTokenType.EOF, '']
            ]);
      });

      it('should report missing value after =', () => {
        expect(tokenizeAndHumanizeErrors('<name a='))
            .toEqual([[HtmlTokenType.ATTR_VALUE, 'Unexpected character "EOF"', '0:8']]);
      });

      it('should report missing end quote for \'', () => {
        expect(tokenizeAndHumanizeErrors('<name a=\''))
            .toEqual([[HtmlTokenType.ATTR_VALUE, 'Unexpected character "EOF"', '0:9']]);
      });

      it('should report missing end quote for "', () => {
        expect(tokenizeAndHumanizeErrors('<name a="'))
            .toEqual([[HtmlTokenType.ATTR_VALUE, 'Unexpected character "EOF"', '0:9']]);
      });

    });

    describe('closing tags', () => {
      it('should parse closing tags without prefix', () => {
        expect(tokenizeAndHumanizeParts('</test>'))
            .toEqual([[HtmlTokenType.TAG_CLOSE, null, 'test'], [HtmlTokenType.EOF]]);
      });

      it('should parse closing tags with prefix', () => {
        expect(tokenizeAndHumanizeParts('</ns1:test>'))
            .toEqual([[HtmlTokenType.TAG_CLOSE, 'ns1', 'test'], [HtmlTokenType.EOF]]);
      });

      it('should allow whitespace', () => {
        expect(tokenizeAndHumanizeParts('</ test >'))
            .toEqual([[HtmlTokenType.TAG_CLOSE, null, 'test'], [HtmlTokenType.EOF]]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans('</test>'))
            .toEqual([[HtmlTokenType.TAG_CLOSE, '</test>'], [HtmlTokenType.EOF, '']]);
      });

      it('should report missing name after </', () => {
        expect(tokenizeAndHumanizeErrors('</'))
            .toEqual([[HtmlTokenType.TAG_CLOSE, 'Unexpected character "EOF"', '0:2']]);
      });

      it('should report missing >', () => {
        expect(tokenizeAndHumanizeErrors('</test'))
            .toEqual([[HtmlTokenType.TAG_CLOSE, 'Unexpected character "EOF"', '0:6']]);
      });
    });

    describe('entities', () => {
      it('should parse named entities', () => {
        expect(tokenizeAndHumanizeParts('a&amp;b'))
            .toEqual([[HtmlTokenType.TEXT, 'a&b'], [HtmlTokenType.EOF]]);
      });

      it('should parse hexadecimal entities', () => {
        expect(tokenizeAndHumanizeParts('&#x41;'))
            .toEqual([[HtmlTokenType.TEXT, 'A'], [HtmlTokenType.EOF]]);
      });

      it('should parse decimal entities', () => {
        expect(tokenizeAndHumanizeParts('&#65;'))
            .toEqual([[HtmlTokenType.TEXT, 'A'], [HtmlTokenType.EOF]]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans('a&amp;b'))
            .toEqual([[HtmlTokenType.TEXT, 'a&amp;b'], [HtmlTokenType.EOF, '']]);
      });

      it('should report malformed/unknown entities', () => {
        expect(tokenizeAndHumanizeErrors('&tbo;'))
            .toEqual([
              [
                HtmlTokenType.TEXT,
                'Unknown entity "tbo" - use the "&#<decimal>;" or  "&#x<hex>;" syntax',
                '0:0'
              ]
            ]);
        expect(tokenizeAndHumanizeErrors('&#asdf;'))
            .toEqual([[HtmlTokenType.TEXT, 'Unexpected character "s"', '0:3']]);
        expect(tokenizeAndHumanizeErrors('&#xasdf;'))
            .toEqual([[HtmlTokenType.TEXT, 'Unexpected character "s"', '0:4']]);

        expect(tokenizeAndHumanizeErrors('&#xABC'))
            .toEqual([[HtmlTokenType.TEXT, 'Unexpected character "EOF"', '0:6']]);
      });
    });

    describe('regular text', () => {
      it('should parse text', () => {
        expect(tokenizeAndHumanizeParts('a'))
            .toEqual([[HtmlTokenType.TEXT, 'a'], [HtmlTokenType.EOF]]);
      });

      it('should handle CR & LF', () => {
        expect(tokenizeAndHumanizeParts('t\ne\rs\r\nt'))
            .toEqual([[HtmlTokenType.TEXT, 't\ne\ns\nt'], [HtmlTokenType.EOF]]);
      });

      it('should parse entities', () => {
        expect(tokenizeAndHumanizeParts('a&amp;b'))
            .toEqual([[HtmlTokenType.TEXT, 'a&b'], [HtmlTokenType.EOF]]);
      });

      it('should parse text starting with "&"', () => {
        expect(tokenizeAndHumanizeParts('a && b &'))
            .toEqual([[HtmlTokenType.TEXT, 'a && b &'], [HtmlTokenType.EOF]]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans('a'))
            .toEqual([[HtmlTokenType.TEXT, 'a'], [HtmlTokenType.EOF, '']]);
      });
    });

    describe('raw text', () => {
      it('should parse text', () => {
        expect(tokenizeAndHumanizeParts(`<script>t\ne\rs\r\nt</script>`))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 'script'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.RAW_TEXT, 't\ne\ns\nt'],
              [HtmlTokenType.TAG_CLOSE, null, 'script'],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should not detect entities', () => {
        expect(tokenizeAndHumanizeParts(`<script>&amp;</script>`))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 'script'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.RAW_TEXT, '&amp;'],
              [HtmlTokenType.TAG_CLOSE, null, 'script'],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should ignore other opening tags', () => {
        expect(tokenizeAndHumanizeParts(`<script>a<div></script>`))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 'script'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.RAW_TEXT, 'a<div>'],
              [HtmlTokenType.TAG_CLOSE, null, 'script'],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should ignore other closing tags', () => {
        expect(tokenizeAndHumanizeParts(`<script>a</test></script>`))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 'script'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.RAW_TEXT, 'a</test>'],
              [HtmlTokenType.TAG_CLOSE, null, 'script'],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans(`<script>a</script>`))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, '<script'],
              [HtmlTokenType.TAG_OPEN_END, '>'],
              [HtmlTokenType.RAW_TEXT, 'a'],
              [HtmlTokenType.TAG_CLOSE, '</script>'],
              [HtmlTokenType.EOF, '']
            ]);
      });

    });

    describe('escapable raw text', () => {
      it('should parse text', () => {
        expect(tokenizeAndHumanizeParts(`<title>t\ne\rs\r\nt</title>`))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 'title'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.ESCAPABLE_RAW_TEXT, 't\ne\ns\nt'],
              [HtmlTokenType.TAG_CLOSE, null, 'title'],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should detect entities', () => {
        expect(tokenizeAndHumanizeParts(`<title>&amp;</title>`))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 'title'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.ESCAPABLE_RAW_TEXT, '&'],
              [HtmlTokenType.TAG_CLOSE, null, 'title'],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should ignore other opening tags', () => {
        expect(tokenizeAndHumanizeParts(`<title>a<div></title>`))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 'title'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.ESCAPABLE_RAW_TEXT, 'a<div>'],
              [HtmlTokenType.TAG_CLOSE, null, 'title'],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should ignore other closing tags', () => {
        expect(tokenizeAndHumanizeParts(`<title>a</test></title>`))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, null, 'title'],
              [HtmlTokenType.TAG_OPEN_END],
              [HtmlTokenType.ESCAPABLE_RAW_TEXT, 'a</test>'],
              [HtmlTokenType.TAG_CLOSE, null, 'title'],
              [HtmlTokenType.EOF]
            ]);
      });

      it('should store the locations', () => {
        expect(tokenizeAndHumanizeSourceSpans(`<title>a</title>`))
            .toEqual([
              [HtmlTokenType.TAG_OPEN_START, '<title'],
              [HtmlTokenType.TAG_OPEN_END, '>'],
              [HtmlTokenType.ESCAPABLE_RAW_TEXT, 'a'],
              [HtmlTokenType.TAG_CLOSE, '</title>'],
              [HtmlTokenType.EOF, '']
            ]);
      });

    });

    describe('errors', () => {
      it('should include 2 lines of context in message', () => {
        let src = "111\n222\n333\nE\n444\n555\n666\n";
        let file = new ParseSourceFile(src, 'file://');
        let location = new ParseLocation(file, 12, 123, 456);
        let error = new HtmlTokenError('**ERROR**', null, location);
        expect(error.toString())
            .toEqual(`**ERROR** ("\n222\n333\n[ERROR ->]E\n444\n555\n"): file://@123:456`);
      });
    });

  });
}

function tokenizeWithoutErrors(input: string): HtmlToken[] {
  var tokenizeResult = tokenizeHtml(input, 'someUrl');
  if (tokenizeResult.errors.length > 0) {
    var errorString = tokenizeResult.errors.join('\n');
    throw new BaseException(`Unexpected parse errors:\n${errorString}`);
  }
  return tokenizeResult.tokens;
}

function tokenizeAndHumanizeParts(input: string): any[] {
  return tokenizeWithoutErrors(input).map(token => [<any>token.type].concat(token.parts));
}

function tokenizeAndHumanizeSourceSpans(input: string): any[] {
  return tokenizeWithoutErrors(input).map(token => [<any>token.type, token.sourceSpan.toString()]);
}

function humanizeLineColumn(location: ParseLocation): string {
  return `${location.line}:${location.col}`;
}

function tokenizeAndHumanizeLineColumn(input: string): any[] {
  return tokenizeWithoutErrors(input)
      .map(token => [<any>token.type, humanizeLineColumn(token.sourceSpan.start)]);
}

function tokenizeAndHumanizeErrors(input: string): any[] {
  return tokenizeHtml(input, 'someUrl')
      .errors.map(
          tokenError =>
              [<any>tokenError.tokenType, tokenError.msg, humanizeLineColumn(tokenError.location)]);
}
