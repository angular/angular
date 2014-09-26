import {List, ListWrapper, SetWrapper} from "facade/collection";
import {FIELD, NumberWrapper, StringJoiner, StringWrapper} from "facade/lang";

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
  @FIELD('final _intValue:int')
  @FIELD('final _strValue:int')
  constructor(index:number/*int*/, type:number/*int*/, intValue:number/*int*/, strValue:string) {
    /**
     * NOTE: To ensure that this constructor creates the same hidden class each time, ensure that
     * all the fields are assigned to in the exact same order in each run of this constructor.
     */
    this.index = index;
    this.type = type;
    this._intValue = intValue;
    this._strValue = strValue;
  }

  isCharacter(code:number/*int*/):boolean {
    return (this.type == TOKEN_TYPE_CHARACTER && this._intValue == code);
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

  toNumber():number/*int*/ {
    // -1 instead of NULL ok?
    return (this.type == TOKEN_TYPE_NUMBER) ? this._intValue : -1;
  }

  toString():string {
    var type:number/*int*/ = this.type;
    if (type >= TOKEN_TYPE_CHARACTER && type <= TOKEN_TYPE_STRING) {
      return this._strValue;
    } else if (type == TOKEN_TYPE_NUMBER) {
      return this._intValue.toString();
    } else {
      return null;
    }
  }
}

function newCharacterToken(index:number/*int*/, code:number/*int*/):Token {
  return new Token(index, TOKEN_TYPE_CHARACTER, code, StringWrapper.fromCharCode(code));
}

function newIdentifierToken(index:number/*int*/, text:string):Token {
  return new Token(index, TOKEN_TYPE_IDENTIFIER, 0, text);
}

function newKeywordToken(index:number/*int*/, text:string):Token {
  return new Token(index, TOKEN_TYPE_KEYWORD, 0, text);
}

function newOperatorToken(index:number/*int*/, text:string):Token {
  return new Token(index, TOKEN_TYPE_OPERATOR, 0, text);
}

function newStringToken(index:number/*int*/, text:string):Token {
  return new Token(index, TOKEN_TYPE_STRING, 0, text);
}

function newNumberToken(index:number/*int*/, n:number/*int*/):Token {
  return new Token(index, TOKEN_TYPE_NUMBER, n, "");
}


var EOF:Token = new Token(-1, 0, 0, "");

// TODO(chirayu): Rewrite as consts when possible.
var $EOF       = 0;
var $TAB       = 9;
var $LF        = 10;
var $VTAB      = 11;
var $FF        = 12;
var $CR        = 13;
var $SPACE     = 32;
var $BANG      = 33;
var $DQ        = 34;
var $$         = 36;
var $PERCENT   = 37;
var $AMPERSAND = 38;
var $SQ        = 39;
var $LPAREN    = 40;
var $RPAREN    = 41;
var $STAR      = 42;
var $PLUS      = 43;
var $COMMA     = 44;
var $MINUS     = 45;
var $PERIOD    = 46;
var $SLASH     = 47;
var $COLON     = 58;
var $SEMICOLON = 59;
var $LT        = 60;
var $EQ        = 61;
var $GT        = 62;
var $QUESTION  = 63;

var $0 = 48;
var $9 = 57;

var $A = 65, $B = 66, $C = 67, $D = 68, $E = 69, $F = 70, $G = 71, $H = 72,
    $I = 73, $J = 74, $K = 75, $L = 76, $M = 77, $N = 78, $O = 79, $P = 80,
    $Q = 81, $R = 82, $S = 83, $T = 84, $U = 85, $V = 86, $W = 87, $X = 88,
    $Y = 89, $Z = 90;

var $LBRACKET  = 91;
var $BACKSLASH = 92;
var $RBRACKET  = 93;
var $CARET     = 94;
var $_         = 95;

var $a =  97, $b =  98, $c =  99, $d = 100, $e = 101, $f = 102, $g = 103,
    $h = 104, $i = 105, $j = 106, $k = 107, $l = 108, $m = 109, $n = 110,
    $o = 111, $p = 112, $q = 113, $r = 114, $s = 115, $t = 116, $u = 117,
    $v = 118, $w = 119, $x = 120, $y = 121, $z = 122;

var $LBRACE = 123;
var $BAR    = 124;
var $RBRACE = 125;
var $TILDE  = 126;
var $NBSP   = 160;



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

    var start:number/*int*/ = index;
    switch (peek) {
      case $PERIOD:
        this.advance();
        return isDigit(peek) ? scanNumber(start) :
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

    this.error('Unexpected character [$' + StringWrapper.fromCharCode(peek) + ']');
    return null;
  }

  scanCharacter(start:number/*int*/, code:number/*int*/):Token {
    assert(this.peek == code);
    this.advance();
    return newCharacterToken(start, code);
  }


  scanOperator(start:number/*int*/, str:string):Token {
    assert(this.peek == StringWrapper.charCodeAt(str, 0));
    assert(SetWrapper.has(OPERATORS, str));
    this.advance();
    return newOperatorToken(start, str);
  }

  scanComplexOperator(start:number/*int*/, code:number/*int*/, one:string, two:string):Token {
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
    var start:number/*int*/ = this.index;
    this.advance();
    while (isIdentifierPart(this.peek)) this.advance();
    var str:string = this.input.substring(start, this.index);
    if (SetWrapper.has(KEYWORDS, str)) {
      return newKeywordToken(start, str);
    } else {
      return newIdentifierToken(start, str);
    }
  }

  scanNumber(start:number/*int*/):Token {
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
        if (!isDigit(this.peek)) this.error('Invalid exponent');
        simple = false;
      } else {
        break;
      }
      this.advance();
    }
    var str:string = this.input.substring(start, this.index);
    // TODO
    var value:number = simple ? NumberWrapper.parseIntAutoRadix(str) : NumberWrapper.parseDouble(str);
    return newNumberToken(start, value);
  }

  scanString():Token {
    assert(this.peek == $SQ || this.peek == $DQ);
    var start:number/*int*/ = this.index;
    var quote:number/*int*/ = this.peek;
    this.advance();  // Skip initial quote.

    var buffer:StringJoiner; //ckck
    var marker:number/*int*/ = this.index;
    var input:string = this.input;

    while (this.peek != quote) {
      if (this.peek == $BACKSLASH) {
        if (buffer == null) buffer = new StringJoiner();
        buffer.add(input.substring(marker, this.index));
        this.advance();
        var unescapedCode:number/*int*/;
        if (this.peek == $u) {
          // 4 character hex code for unicode character.
          var hex:string = input.substring(this.index + 1, this.index + 5);
          unescapedCode = NumberWrapper.parseInt(hex, 16);
          for (var i:number/*int*/ = 0; i < 5; i++) {
            this.advance();
          }
        } else {
          unescapedCode = unescape(this.peek);
          this.advance();
        }
        buffer.add(StringWrapper.fromCharCode(unescapedCode));
        marker = this.index;
      } else if (this.peek == $EOF) {
        this.error('Unterminated quote');
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

  error(message:string) {
    var position:number/*int*/ = this.index + this.offset;
    throw `Lexer Error: ${message} at column ${position} in expression [${input}]`;
  }
}

function isWhitespace(code:number/*int*/):boolean {
  return (code >= $TAB && code <= $SPACE) || (code == $NBSP);
}

function isIdentifierStart(code:number/*int*/):boolean {
  return ($a <= code && code <= $z) ||
         ($A <= code && code <= $Z) ||
         (code == $_) ||
         (code == $$);
}

function isIdentifierPart(code:number/*int*/):boolean {
  return ($a <= code && code <= $z) ||
         ($A <= code && code <= $Z) ||
         ($0 <= code && code <= $9) ||
         (code == $_) ||
         (code == $$);
}

function isDigit(code:number/*int*/):boolean {
  return $0 <= code && code <= $9;
}

function isExponentStart(code:number/*int*/):boolean {
  return code == $e || code == $E;
}

function isExponentSign(code:number/*int*/):boolean {
  return code == $MINUS || code == $PLUS;
}

function unescape(code:number/*int*/):number/*int*/ {
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


export function Lexer(text:string):List {
  var scanner:Scanner = new Scanner(text);
  var tokens:List<Token> = [];
  var token:Token = scanner.scanToken();
  while (token != null) {
    ListWrapper.push(tokens, token);
    token = scanner.scanToken();
  }
  return tokens;
}
