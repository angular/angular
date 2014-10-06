import {List, ListWrapper, SetWrapper} from "facade/collection";
import {int, FIELD, NumberWrapper, StringJoiner, StringWrapper} from "facade/lang";

// TODO(chirayu): Rewrite as consts when possible.
export var TOKEN_TYPE_CHARACTER  = 1;
export var TOKEN_TYPE_IDENTIFIER = 2;
export var TOKEN_TYPE_KEYWORD    = 3;
export var TOKEN_TYPE_STRING     = 4;
export var TOKEN_TYPE_OPERATOR   = 5;
export var TOKEN_TYPE_NUMBER     = 6;

export class Token {
  @FIELD('final index:int')
  @FIELD('final type:int')
  @FIELD('final _numValue:int')
  @FIELD('final _strValue:int')
  constructor(index:int, type:int, numValue:number, strValue:string) {
    /**
     * NOTE: To ensure that this constructor creates the same hidden class each time, ensure that
     * all the fields are assigned to in the exact same order in each run of this constructor.
     */
    this.index = index;
    this.type = type;
    this._numValue = numValue;
    this._strValue = strValue;
  }

  isCharacter(code:int):boolean {
    return (this.type == TOKEN_TYPE_CHARACTER && this._numValue == code);
  }

  isNumber():boolean {
    return (this.type == TOKEN_TYPE_NUMBER);
  }

  isString():boolean {
    return (this.type == TOKEN_TYPE_STRING);
  }

  isOperator(operater:string):boolean {
    return (this.type == TOKEN_TYPE_OPERATOR && this._strValue == operater);
  }

  isIdentifier():boolean {
    return (this.type == TOKEN_TYPE_IDENTIFIER);
  }

  isKeyword():boolean {
    return (this.type == TOKEN_TYPE_KEYWORD);
  }

  isKeywordNull():boolean {
    return (this.type == TOKEN_TYPE_KEYWORD && this._strValue == "null");
  }

  isKeywordUndefined():boolean {
    return (this.type == TOKEN_TYPE_KEYWORD && this._strValue == "undefined");
  }

  isKeywordTrue():boolean {
    return (this.type == TOKEN_TYPE_KEYWORD && this._strValue == "true");
  }

  isKeywordFalse():boolean {
    return (this.type == TOKEN_TYPE_KEYWORD && this._strValue == "false");
  }

  toNumber():number {
    // -1 instead of NULL ok?
    return (this.type == TOKEN_TYPE_NUMBER) ? this._numValue : -1;
  }

  toString():string {
    var type:int = this.type;
    if (type >= TOKEN_TYPE_CHARACTER && type <= TOKEN_TYPE_STRING) {
      return this._strValue;
    } else if (type == TOKEN_TYPE_NUMBER) {
      return this._numValue.toString();
    } else {
      return null;
    }
  }
}

function newCharacterToken(index:int, code:int):Token {
  return new Token(index, TOKEN_TYPE_CHARACTER, code, StringWrapper.fromCharCode(code));
}

function newIdentifierToken(index:int, text:string):Token {
  return new Token(index, TOKEN_TYPE_IDENTIFIER, 0, text);
}

function newKeywordToken(index:int, text:string):Token {
  return new Token(index, TOKEN_TYPE_KEYWORD, 0, text);
}

function newOperatorToken(index:int, text:string):Token {
  return new Token(index, TOKEN_TYPE_OPERATOR, 0, text);
}

function newStringToken(index:int, text:string):Token {
  return new Token(index, TOKEN_TYPE_STRING, 0, text);
}

function newNumberToken(index:int, n:number):Token {
  return new Token(index, TOKEN_TYPE_NUMBER, n, "");
}


var EOF:Token = new Token(-1, 0, 0, "");

const $EOF       = 0;
const $TAB       = 9;
const $LF        = 10;
const $VTAB      = 11;
const $FF        = 12;
const $CR        = 13;
const $SPACE     = 32;
const $BANG      = 33;
const $DQ        = 34;
const $$         = 36;
const $PERCENT   = 37;
const $AMPERSAND = 38;
const $SQ        = 39;
const $LPAREN    = 40;
const $RPAREN    = 41;
const $STAR      = 42;
const $PLUS      = 43;
const $COMMA     = 44;
const $MINUS     = 45;
const $PERIOD    = 46;
const $SLASH     = 47;
const $COLON     = 58;
const $SEMICOLON = 59;
const $LT        = 60;
const $EQ        = 61;
const $GT        = 62;
const $QUESTION  = 63;

const $0 = 48;
const $9 = 57;

const $A = 65, $B = 66, $C = 67, $D = 68, $E = 69, $F = 70, $G = 71, $H = 72,
      $I = 73, $J = 74, $K = 75, $L = 76, $M = 77, $N = 78, $O = 79, $P = 80,
      $Q = 81, $R = 82, $S = 83, $T = 84, $U = 85, $V = 86, $W = 87, $X = 88,
      $Y = 89, $Z = 90;

const $LBRACKET  = 91;
const $BACKSLASH = 92;
const $RBRACKET  = 93;
const $CARET     = 94;
const $_         = 95;

const $a =  97, $b =  98, $c =  99, $d = 100, $e = 101, $f = 102, $g = 103,
      $h = 104, $i = 105, $j = 106, $k = 107, $l = 108, $m = 109, $n = 110,
      $o = 111, $p = 112, $q = 113, $r = 114, $s = 115, $t = 116, $u = 117,
      $v = 118, $w = 119, $x = 120, $y = 121, $z = 122;

const $LBRACE = 123;
const $BAR    = 124;
const $RBRACE = 125;
const $TILDE  = 126;
const $NBSP   = 160;


export class ScannerError extends Error {
  constructor(message) {
    this.message = message;
  }

  toString() {
    return this.message;
  }
}

export class Scanner {
  @FIELD('final input:String')
  @FIELD('final length:int')
  @FIELD('peek:int')
  @FIELD('index:int')

  constructor(input:string) {
    this.input = input;
    this.length = input.length;
    this.peek = 0;
    this.index = -1;
    this.advance();
  }

  advance() {
    this.peek = ++this.index >= this.length ? $EOF : StringWrapper.charCodeAt(this.input, this.index);
  }


  scanToken():Token {
    var input = this.input,
        length = this.length,
        peek = this.peek,
        index = this.index;

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

    var start:int = index;
    switch (peek) {
      case $PERIOD:
        this.advance();
        return isDigit(this.peek) ? this.scanNumber(start) :
                                    newCharacterToken(start, $PERIOD);
      case $LPAREN:   case $RPAREN:
      case $LBRACE:   case $RBRACE:
      case $LBRACKET: case $RBRACKET:
      case $COMMA:
      case $COLON:
      case $SEMICOLON:
        return this.scanCharacter(start, peek);
      case $SQ:
      case $DQ:
        return this.scanString();
      case $PLUS:
      case $MINUS:
      case $STAR:
      case $SLASH:
      case $PERCENT:
      case $CARET:
      case $QUESTION:
        return this.scanOperator(start, StringWrapper.fromCharCode(peek));
      case $LT:
      case $GT:
      case $BANG:
      case $EQ:
        return this.scanComplexOperator(start, $EQ, StringWrapper.fromCharCode(peek), '=');
      case $AMPERSAND:
        return this.scanComplexOperator(start, $AMPERSAND, '&', '&');
      case $BAR:
        return this.scanComplexOperator(start, $BAR, '|', '|');
      case $TILDE:
        return this.scanComplexOperator(start, $SLASH, '~', '/');
      case $NBSP:
        while (isWhitespace(this.peek)) this.advance();
        return this.scanToken();
    }

    this.error(`Unexpected character [${StringWrapper.fromCharCode(peek)}]`, 0);
    return null;
  }

  scanCharacter(start:int, code:int):Token {
    assert(this.peek == code);
    this.advance();
    return newCharacterToken(start, code);
  }


  scanOperator(start:int, str:string):Token {
    assert(this.peek == StringWrapper.charCodeAt(str, 0));
    assert(SetWrapper.has(OPERATORS, str));
    this.advance();
    return newOperatorToken(start, str);
  }

  scanComplexOperator(start:int, code:int, one:string, two:string):Token {
    assert(this.peek == StringWrapper.charCodeAt(one, 0));
    this.advance();
    var str:string = one;
    if (this.peek == code) {
      this.advance();
      str += two;
    }
    assert(SetWrapper.has(OPERATORS, str));
    return newOperatorToken(start, str);
  }

  scanIdentifier():Token {
    assert(isIdentifierStart(this.peek));
    var start:int = this.index;
    this.advance();
    while (isIdentifierPart(this.peek)) this.advance();
    var str:string = this.input.substring(start, this.index);
    if (SetWrapper.has(KEYWORDS, str)) {
      return newKeywordToken(start, str);
    } else {
      return newIdentifierToken(start, str);
    }
  }

  scanNumber(start:int):Token {
    assert(isDigit(this.peek));
    var simple:boolean = (this.index === start);
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
    var str:string = this.input.substring(start, this.index);
    // TODO
    var value:number = simple ? NumberWrapper.parseIntAutoRadix(str) : NumberWrapper.parseFloat(str);
    return newNumberToken(start, value);
  }

  scanString():Token {
    assert(this.peek == $SQ || this.peek == $DQ);
    var start:int = this.index;
    var quote:int = this.peek;
    this.advance();  // Skip initial quote.

    var buffer:StringJoiner;
    var marker:int = this.index;
    var input:string = this.input;

    while (this.peek != quote) {
      if (this.peek == $BACKSLASH) {
        if (buffer == null) buffer = new StringJoiner();
        buffer.add(input.substring(marker, this.index));
        this.advance();
        var unescapedCode:int;
        if (this.peek == $u) {
          // 4 character hex code for unicode character.
          var hex:string = input.substring(this.index + 1, this.index + 5);
          try {
            unescapedCode = NumberWrapper.parseInt(hex, 16);
          } catch (e) {
            this.error(`Invalid unicode escape [\\u${hex}]`, 0);
          }
          for (var i:int = 0; i < 5; i++) {
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

    var last:string = input.substring(marker, this.index);
    this.advance();  // Skip terminating quote.
    var str:string = input.substring(start, this.index);

    // Compute the unescaped string value.
    var unescaped:string = last;
    if (buffer != null) {
      buffer.add(last);
      unescaped = buffer.toString();
    }
    return newStringToken(start, unescaped);
  }

  error(message:string, offset:int) {
    var position:int = this.index + offset;
    throw new ScannerError(`Lexer Error: ${message} at column ${position} in expression [${this.input}]`);
  }
}

function isWhitespace(code:int):boolean {
  return (code >= $TAB && code <= $SPACE) || (code == $NBSP);
}

function isIdentifierStart(code:int):boolean {
  return ($a <= code && code <= $z) ||
         ($A <= code && code <= $Z) ||
         (code == $_) ||
         (code == $$);
}

function isIdentifierPart(code:int):boolean {
  return ($a <= code && code <= $z) ||
         ($A <= code && code <= $Z) ||
         ($0 <= code && code <= $9) ||
         (code == $_) ||
         (code == $$);
}

function isDigit(code:int):boolean {
  return $0 <= code && code <= $9;
}

function isExponentStart(code:int):boolean {
  return code == $e || code == $E;
}

function isExponentSign(code:int):boolean {
  return code == $MINUS || code == $PLUS;
}

function unescape(code:int):int {
  switch(code) {
    case $n: return $LF;
    case $f: return $FF;
    case $r: return $CR;
    case $t: return $TAB;
    case $v: return $VTAB;
    default: return code;
  }
}

var OPERATORS = SetWrapper.createFromList([
  '+',
  '-',
  '*',
  '/',
  '~/',
  '%',
  '^',
  '=',
  '==',
  '!=',
  '<',
  '>',
  '<=',
  '>=',
  '&&',
  '||',
  '&',
  '|',
  '!',
  '?'
]);


var KEYWORDS = SetWrapper.createFromList([
    'null',
    'undefined',
    'true',
    'false',
]);
