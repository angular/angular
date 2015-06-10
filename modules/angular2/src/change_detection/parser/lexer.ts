import {Injectable} from 'angular2/src/di/decorators';
import {List, ListWrapper, SetWrapper} from "angular2/src/facade/collection";
import {
  NumberWrapper,
  StringJoiner,
  StringWrapper,
  BaseException,
  isPresent
} from "angular2/src/facade/lang";

export const TOKEN_TYPE_CHARACTER = 1;
export const TOKEN_TYPE_IDENTIFIER = 2;
export const TOKEN_TYPE_KEYWORD = 3;
export const TOKEN_TYPE_STRING = 4;
export const TOKEN_TYPE_OPERATOR = 5;
export const TOKEN_TYPE_NUMBER = 6;

@Injectable()
export class Lexer {
  tokenize(text: string): List<any> {
    var scanner = new _Scanner(text);
    var tokens = [];
    var token = scanner.scanToken();
    while (token != null) {
      ListWrapper.push(tokens, token);
      token = scanner.scanToken();
    }
    return tokens;
  }
}

export class Token {
  constructor(public index: number, public type: number, public numValue: number,
              public strValue: string) {}

  isCharacter(code: number): boolean {
    return (this.type == TOKEN_TYPE_CHARACTER && this.numValue == code);
  }

  isNumber(): boolean { return (this.type == TOKEN_TYPE_NUMBER); }

  isString(): boolean { return (this.type == TOKEN_TYPE_STRING); }

  isOperator(operater: string): boolean {
    return (this.type == TOKEN_TYPE_OPERATOR && this.strValue == operater);
  }

  isIdentifier(): boolean { return (this.type == TOKEN_TYPE_IDENTIFIER); }

  isKeyword(): boolean { return (this.type == TOKEN_TYPE_KEYWORD); }

  isKeywordVar(): boolean { return (this.type == TOKEN_TYPE_KEYWORD && this.strValue == "var"); }

  isKeywordNull(): boolean { return (this.type == TOKEN_TYPE_KEYWORD && this.strValue == "null"); }

  isKeywordUndefined(): boolean {
    return (this.type == TOKEN_TYPE_KEYWORD && this.strValue == "undefined");
  }

  isKeywordTrue(): boolean { return (this.type == TOKEN_TYPE_KEYWORD && this.strValue == "true"); }

  isKeywordIf(): boolean { return (this.type == TOKEN_TYPE_KEYWORD && this.strValue == "if"); }

  isKeywordElse(): boolean { return (this.type == TOKEN_TYPE_KEYWORD && this.strValue == "else"); }

  isKeywordFalse(): boolean {
    return (this.type == TOKEN_TYPE_KEYWORD && this.strValue == "false");
  }

  toNumber(): number {
    // -1 instead of NULL ok?
    return (this.type == TOKEN_TYPE_NUMBER) ? this.numValue : -1;
  }

  toString(): string {
    var t: number = this.type;
    if (t >= TOKEN_TYPE_CHARACTER && t <= TOKEN_TYPE_STRING) {
      return this.strValue;
    } else if (t == TOKEN_TYPE_NUMBER) {
      return this.numValue.toString();
    } else {
      return null;
    }
  }
}

function newCharacterToken(index: number, code: number): Token {
  return new Token(index, TOKEN_TYPE_CHARACTER, code, StringWrapper.fromCharCode(code));
}

function newIdentifierToken(index: number, text: string): Token {
  return new Token(index, TOKEN_TYPE_IDENTIFIER, 0, text);
}

function newKeywordToken(index: number, text: string): Token {
  return new Token(index, TOKEN_TYPE_KEYWORD, 0, text);
}

function newOperatorToken(index: number, text: string): Token {
  return new Token(index, TOKEN_TYPE_OPERATOR, 0, text);
}

function newStringToken(index: number, text: string): Token {
  return new Token(index, TOKEN_TYPE_STRING, 0, text);
}

function newNumberToken(index: number, n: number): Token {
  return new Token(index, TOKEN_TYPE_NUMBER, n, "");
}


export var EOF: Token = new Token(-1, 0, 0, "");

export const $EOF = 0;
export const $TAB = 9;
export const $LF = 10;
export const $VTAB = 11;
export const $FF = 12;
export const $CR = 13;
export const $SPACE = 32;
export const $BANG = 33;
export const $DQ = 34;
export const $HASH = 35;
export const $$ = 36;
export const $PERCENT = 37;
export const $AMPERSAND = 38;
export const $SQ = 39;
export const $LPAREN = 40;
export const $RPAREN = 41;
export const $STAR = 42;
export const $PLUS = 43;
export const $COMMA = 44;
export const $MINUS = 45;
export const $PERIOD = 46;
export const $SLASH = 47;
export const $COLON = 58;
export const $SEMICOLON = 59;
export const $LT = 60;
export const $EQ = 61;
export const $GT = 62;
export const $QUESTION = 63;

const $0 = 48;
const $9 = 57;

const $A = 65, $E = 69, $Z = 90;

export const $LBRACKET = 91;
export const $BACKSLASH = 92;
export const $RBRACKET = 93;
const $CARET = 94;
const $_ = 95;

const $a = 97, $e = 101, $f = 102, $n = 110, $r = 114, $t = 116, $u = 117, $v = 118, $z = 122;

export const $LBRACE = 123;
export const $BAR = 124;
export const $RBRACE = 125;
const $NBSP = 160;


export class ScannerError extends BaseException {
  message: string;
  constructor(message) {
    super();
    this.message = message;
  }

  toString() { return this.message; }
}

class _Scanner {
  length: number;
  peek: number;
  index: number;

  constructor(public input: string) {
    this.length = input.length;
    this.peek = 0;
    this.index = -1;
    this.advance();
  }

  advance() {
    this.peek =
        ++this.index >= this.length ? $EOF : StringWrapper.charCodeAt(this.input, this.index);
  }

  scanToken(): Token {
    var input = this.input, length = this.length, peek = this.peek, index = this.index;

    // Skip whitespace.
    while (peek <= $SPACE) {
      if (++index >= length) {
        peek = $EOF;
        break;
      } else {
        peek = StringWrapper.charCodeAt(input, index);
      }
    }

    this.peek = peek;
    this.index = index;

    if (index >= length) {
      return null;
    }

    // Handle identifiers and numbers.
    if (isIdentifierStart(peek)) return this.scanIdentifier();
    if (isDigit(peek)) return this.scanNumber(index);

    var start: number = index;
    switch (peek) {
      case $PERIOD:
        this.advance();
        return isDigit(this.peek) ? this.scanNumber(start) : newCharacterToken(start, $PERIOD);
      case $LPAREN:
      case $RPAREN:
      case $LBRACE:
      case $RBRACE:
      case $LBRACKET:
      case $RBRACKET:
      case $COMMA:
      case $COLON:
      case $SEMICOLON:
        return this.scanCharacter(start, peek);
      case $SQ:
      case $DQ:
        return this.scanString();
      case $HASH:
      case $PLUS:
      case $MINUS:
      case $STAR:
      case $SLASH:
      case $PERCENT:
      case $CARET:
        return this.scanOperator(start, StringWrapper.fromCharCode(peek));
      case $QUESTION:
        return this.scanComplexOperator(start, '?', $PERIOD, '.');
      case $LT:
      case $GT:
        return this.scanComplexOperator(start, StringWrapper.fromCharCode(peek), $EQ, '=');
      case $BANG:
      case $EQ:
        return this.scanComplexOperator(start, StringWrapper.fromCharCode(peek), $EQ, '=', $EQ,
                                        '=');
      case $AMPERSAND:
        return this.scanComplexOperator(start, '&', $AMPERSAND, '&');
      case $BAR:
        return this.scanComplexOperator(start, '|', $BAR, '|');
      case $NBSP:
        while (isWhitespace(this.peek)) this.advance();
        return this.scanToken();
    }

    this.error(`Unexpected character [${StringWrapper.fromCharCode(peek)}]`, 0);
    return null;
  }

  scanCharacter(start: number, code: number): Token {
    assert(this.peek == code);
    this.advance();
    return newCharacterToken(start, code);
  }


  scanOperator(start: number, str: string): Token {
    assert(this.peek == StringWrapper.charCodeAt(str, 0));
    assert(SetWrapper.has(OPERATORS, str));
    this.advance();
    return newOperatorToken(start, str);
  }

  /**
   * Tokenize a 2/3 char long operator
   *
   * @param start start index in the expression
   * @param one first symbol (always part of the operator)
   * @param twoCode code point for the second symbol
   * @param two second symbol (part of the operator when the second code point matches)
   * @param threeCode code point for the third symbol
   * @param three third symbol (part of the operator when provided and matches source expression)
   * @returns {Token}
   */
  scanComplexOperator(start: number, one: string, twoCode: number, two: string, threeCode?: number,
                      three?: string): Token {
    assert(this.peek == StringWrapper.charCodeAt(one, 0));
    this.advance();
    var str: string = one;
    if (this.peek == twoCode) {
      this.advance();
      str += two;
    }
    if (isPresent(threeCode) && this.peek == threeCode) {
      this.advance();
      str += three;
    }
    assert(SetWrapper.has(OPERATORS, str));
    return newOperatorToken(start, str);
  }

  scanIdentifier(): Token {
    assert(isIdentifierStart(this.peek));
    var start: number = this.index;
    this.advance();
    while (isIdentifierPart(this.peek)) this.advance();
    var str: string = this.input.substring(start, this.index);
    if (SetWrapper.has(KEYWORDS, str)) {
      return newKeywordToken(start, str);
    } else {
      return newIdentifierToken(start, str);
    }
  }

  scanNumber(start: number): Token {
    assert(isDigit(this.peek));
    var simple: boolean = (this.index === start);
    this.advance();  // Skip initial digit.
    while (true) {
      if (isDigit(this.peek)) {
        // Do nothing.
      } else if (this.peek == $PERIOD) {
        simple = false;
      } else if (isExponentStart(this.peek)) {
        this.advance();
        if (isExponentSign(this.peek)) this.advance();
        if (!isDigit(this.peek)) this.error('Invalid exponent', -1);
        simple = false;
      } else {
        break;
      }
      this.advance();
    }
    var str: string = this.input.substring(start, this.index);
    // TODO
    var value: number =
        simple ? NumberWrapper.parseIntAutoRadix(str) : NumberWrapper.parseFloat(str);
    return newNumberToken(start, value);
  }

  scanString(): Token {
    assert(this.peek == $SQ || this.peek == $DQ);
    var start: number = this.index;
    var quote: number = this.peek;
    this.advance();  // Skip initial quote.

    var buffer: StringJoiner;
    var marker: number = this.index;
    var input: string = this.input;

    while (this.peek != quote) {
      if (this.peek == $BACKSLASH) {
        if (buffer == null) buffer = new StringJoiner();
        buffer.add(input.substring(marker, this.index));
        this.advance();
        var unescapedCode: number;
        if (this.peek == $u) {
          // 4 character hex code for unicode character.
          var hex: string = input.substring(this.index + 1, this.index + 5);
          try {
            unescapedCode = NumberWrapper.parseInt(hex, 16);
          } catch (e) {
            this.error(`Invalid unicode escape [\\u${hex}]`, 0);
          }
          for (var i: number = 0; i < 5; i++) {
            this.advance();
          }
        } else {
          unescapedCode = unescape(this.peek);
          this.advance();
        }
        buffer.add(StringWrapper.fromCharCode(unescapedCode));
        marker = this.index;
      } else if (this.peek == $EOF) {
        this.error('Unterminated quote', 0);
      } else {
        this.advance();
      }
    }

    var last: string = input.substring(marker, this.index);
    this.advance();  // Skip terminating quote.

    // Compute the unescaped string value.
    var unescaped: string = last;
    if (buffer != null) {
      buffer.add(last);
      unescaped = buffer.toString();
    }
    return newStringToken(start, unescaped);
  }

  error(message: string, offset: number) {
    var position: number = this.index + offset;
    throw new ScannerError(
        `Lexer Error: ${message} at column ${position} in expression [${this.input}]`);
  }
}

function isWhitespace(code: number): boolean {
  return (code >= $TAB && code <= $SPACE) || (code == $NBSP);
}

function isIdentifierStart(code: number): boolean {
  return ($a <= code && code <= $z) || ($A <= code && code <= $Z) || (code == $_) || (code == $$);
}

function isIdentifierPart(code: number): boolean {
  return ($a <= code && code <= $z) || ($A <= code && code <= $Z) || ($0 <= code && code <= $9) ||
         (code == $_) || (code == $$);
}

function isDigit(code: number): boolean {
  return $0 <= code && code <= $9;
}

function isExponentStart(code: number): boolean {
  return code == $e || code == $E;
}

function isExponentSign(code: number): boolean {
  return code == $MINUS || code == $PLUS;
}

function unescape(code: number): number {
  switch (code) {
    case $n:
      return $LF;
    case $f:
      return $FF;
    case $r:
      return $CR;
    case $t:
      return $TAB;
    case $v:
      return $VTAB;
    default:
      return code;
  }
}

var OPERATORS = SetWrapper.createFromList([
  '+',
  '-',
  '*',
  '/',
  '%',
  '^',
  '=',
  '==',
  '!=',
  '===',
  '!==',
  '<',
  '>',
  '<=',
  '>=',
  '&&',
  '||',
  '&',
  '|',
  '!',
  '?',
  '#',
  '?.'
]);


var KEYWORDS =
    SetWrapper.createFromList(['var', 'null', 'undefined', 'true', 'false', 'if', 'else']);
