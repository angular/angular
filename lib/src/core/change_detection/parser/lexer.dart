library angular2.src.core.change_detection.parser.lexer;

import "package:angular2/src/core/di/decorators.dart" show Injectable;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, SetWrapper;
import "package:angular2/src/facade/lang.dart"
    show NumberWrapper, StringJoiner, StringWrapper, isPresent;
import "package:angular2/src/facade/exceptions.dart" show BaseException;

enum TokenType { Character, Identifier, Keyword, String, Operator, Number }

@Injectable()
class Lexer {
  List<dynamic> tokenize(String text) {
    var scanner = new _Scanner(text);
    var tokens = [];
    var token = scanner.scanToken();
    while (token != null) {
      tokens.add(token);
      token = scanner.scanToken();
    }
    return tokens;
  }
}

class Token {
  num index;
  TokenType type;
  num numValue;
  String strValue;
  Token(this.index, this.type, this.numValue, this.strValue) {}
  bool isCharacter(num code) {
    return (this.type == TokenType.Character && this.numValue == code);
  }

  bool isNumber() {
    return (this.type == TokenType.Number);
  }

  bool isString() {
    return (this.type == TokenType.String);
  }

  bool isOperator(String operater) {
    return (this.type == TokenType.Operator && this.strValue == operater);
  }

  bool isIdentifier() {
    return (this.type == TokenType.Identifier);
  }

  bool isKeyword() {
    return (this.type == TokenType.Keyword);
  }

  bool isKeywordVar() {
    return (this.type == TokenType.Keyword && this.strValue == "var");
  }

  bool isKeywordNull() {
    return (this.type == TokenType.Keyword && this.strValue == "null");
  }

  bool isKeywordUndefined() {
    return (this.type == TokenType.Keyword && this.strValue == "undefined");
  }

  bool isKeywordTrue() {
    return (this.type == TokenType.Keyword && this.strValue == "true");
  }

  bool isKeywordFalse() {
    return (this.type == TokenType.Keyword && this.strValue == "false");
  }

  num toNumber() {
    // -1 instead of NULL ok?
    return (this.type == TokenType.Number) ? this.numValue : -1;
  }

  String toString() {
    switch (this.type) {
      case TokenType.Character:
      case TokenType.Identifier:
      case TokenType.Keyword:
      case TokenType.Operator:
      case TokenType.String:
        return this.strValue;
      case TokenType.Number:
        return this.numValue.toString();
      default:
        return null;
    }
  }
}

Token newCharacterToken(num index, num code) {
  return new Token(
      index, TokenType.Character, code, StringWrapper.fromCharCode(code));
}

Token newIdentifierToken(num index, String text) {
  return new Token(index, TokenType.Identifier, 0, text);
}

Token newKeywordToken(num index, String text) {
  return new Token(index, TokenType.Keyword, 0, text);
}

Token newOperatorToken(num index, String text) {
  return new Token(index, TokenType.Operator, 0, text);
}

Token newStringToken(num index, String text) {
  return new Token(index, TokenType.String, 0, text);
}

Token newNumberToken(num index, num n) {
  return new Token(index, TokenType.Number, n, "");
}

Token EOF = new Token(-1, TokenType.Character, 0, "");
const $EOF = 0;
const $TAB = 9;
const $LF = 10;
const $VTAB = 11;
const $FF = 12;
const $CR = 13;
const $SPACE = 32;
const $BANG = 33;
const $DQ = 34;
const $HASH = 35;
const $$ = 36;
const $PERCENT = 37;
const $AMPERSAND = 38;
const $SQ = 39;
const $LPAREN = 40;
const $RPAREN = 41;
const $STAR = 42;
const $PLUS = 43;
const $COMMA = 44;
const $MINUS = 45;
const $PERIOD = 46;
const $SLASH = 47;
const $COLON = 58;
const $SEMICOLON = 59;
const $LT = 60;
const $EQ = 61;
const $GT = 62;
const $QUESTION = 63;
const $0 = 48;
const $9 = 57;
const $A = 65, $E = 69, $Z = 90;
const $LBRACKET = 91;
const $BACKSLASH = 92;
const $RBRACKET = 93;
const $CARET = 94;
const $_ = 95;
const $a = 97,
    $e = 101,
    $f = 102,
    $n = 110,
    $r = 114,
    $t = 116,
    $u = 117,
    $v = 118,
    $z = 122;
const $LBRACE = 123;
const $BAR = 124;
const $RBRACE = 125;
const $NBSP = 160;

class ScannerError extends BaseException {
  var message;
  ScannerError(this.message) : super() {
    /* super call moved to initializer */;
  }
  String toString() {
    return this.message;
  }
}

class _Scanner {
  String input;
  num length;
  num peek = 0;
  num index = -1;
  _Scanner(this.input) {
    this.length = input.length;
    this.advance();
  }
  advance() {
    this.peek = ++this.index >= this.length
        ? $EOF
        : StringWrapper.charCodeAt(this.input, this.index);
  }

  Token scanToken() {
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
    num start = index;
    switch (peek) {
      case $PERIOD:
        this.advance();
        return isDigit(this.peek)
            ? this.scanNumber(start)
            : newCharacterToken(start, $PERIOD);
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
        return this.scanComplexOperator(start, "?", $PERIOD, ".");
      case $LT:
      case $GT:
        return this.scanComplexOperator(
            start, StringWrapper.fromCharCode(peek), $EQ, "=");
      case $BANG:
      case $EQ:
        return this.scanComplexOperator(
            start, StringWrapper.fromCharCode(peek), $EQ, "=", $EQ, "=");
      case $AMPERSAND:
        return this.scanComplexOperator(start, "&", $AMPERSAND, "&");
      case $BAR:
        return this.scanComplexOperator(start, "|", $BAR, "|");
      case $NBSP:
        while (isWhitespace(this.peek)) this.advance();
        return this.scanToken();
    }
    this.error(
        '''Unexpected character [${ StringWrapper . fromCharCode ( peek )}]''',
        0);
    return null;
  }

  Token scanCharacter(num start, num code) {
    assert(this.peek == code);
    this.advance();
    return newCharacterToken(start, code);
  }

  Token scanOperator(num start, String str) {
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
  Token scanComplexOperator(num start, String one, num twoCode, String two,
      [num threeCode, String three]) {
    assert(this.peek == StringWrapper.charCodeAt(one, 0));
    this.advance();
    String str = one;
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

  Token scanIdentifier() {
    assert(isIdentifierStart(this.peek));
    num start = this.index;
    this.advance();
    while (isIdentifierPart(this.peek)) this.advance();
    String str = this.input.substring(start, this.index);
    if (SetWrapper.has(KEYWORDS, str)) {
      return newKeywordToken(start, str);
    } else {
      return newIdentifierToken(start, str);
    }
  }

  Token scanNumber(num start) {
    assert(isDigit(this.peek));
    bool simple = (identical(this.index, start));
    this.advance();
    while (true) {
      if (isDigit(this.peek)) {} else if (this.peek == $PERIOD) {
        simple = false;
      } else if (isExponentStart(this.peek)) {
        this.advance();
        if (isExponentSign(this.peek)) this.advance();
        if (!isDigit(this.peek)) this.error("Invalid exponent", -1);
        simple = false;
      } else {
        break;
      }
      this.advance();
    }
    String str = this.input.substring(start, this.index);
    // TODO
    num value = simple
        ? NumberWrapper.parseIntAutoRadix(str)
        : NumberWrapper.parseFloat(str);
    return newNumberToken(start, value);
  }

  Token scanString() {
    assert(this.peek == $SQ || this.peek == $DQ);
    num start = this.index;
    num quote = this.peek;
    this.advance();
    StringJoiner buffer;
    num marker = this.index;
    String input = this.input;
    while (this.peek != quote) {
      if (this.peek == $BACKSLASH) {
        if (buffer == null) buffer = new StringJoiner();
        buffer.add(input.substring(marker, this.index));
        this.advance();
        num unescapedCode;
        if (this.peek == $u) {
          // 4 character hex code for unicode character.
          String hex = input.substring(this.index + 1, this.index + 5);
          try {
            unescapedCode = NumberWrapper.parseInt(hex, 16);
          } catch (e, e_stack) {
            this.error('''Invalid unicode escape [\\u${ hex}]''', 0);
          }
          for (num i = 0; i < 5; i++) {
            this.advance();
          }
        } else {
          unescapedCode = unescape(this.peek);
          this.advance();
        }
        buffer.add(StringWrapper.fromCharCode(unescapedCode));
        marker = this.index;
      } else if (this.peek == $EOF) {
        this.error("Unterminated quote", 0);
      } else {
        this.advance();
      }
    }
    String last = input.substring(marker, this.index);
    this.advance();
    // Compute the unescaped string value.
    String unescaped = last;
    if (buffer != null) {
      buffer.add(last);
      unescaped = buffer.toString();
    }
    return newStringToken(start, unescaped);
  }

  error(String message, num offset) {
    num position = this.index + offset;
    throw new ScannerError(
        '''Lexer Error: ${ message} at column ${ position} in expression [${ this . input}]''');
  }
}

bool isWhitespace(num code) {
  return (code >= $TAB && code <= $SPACE) || (code == $NBSP);
}

bool isIdentifierStart(num code) {
  return ($a <= code && code <= $z) ||
      ($A <= code && code <= $Z) ||
      (code == $_) ||
      (code == $$);
}

bool isIdentifierPart(num code) {
  return ($a <= code && code <= $z) ||
      ($A <= code && code <= $Z) ||
      ($0 <= code && code <= $9) ||
      (code == $_) ||
      (code == $$);
}

bool isDigit(num code) {
  return $0 <= code && code <= $9;
}

bool isExponentStart(num code) {
  return code == $e || code == $E;
}

bool isExponentSign(num code) {
  return code == $MINUS || code == $PLUS;
}

num unescape(num code) {
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
  "+",
  "-",
  "*",
  "/",
  "%",
  "^",
  "=",
  "==",
  "!=",
  "===",
  "!==",
  "<",
  ">",
  "<=",
  ">=",
  "&&",
  "||",
  "&",
  "|",
  "!",
  "?",
  "#",
  "?."
]);
var KEYWORDS = SetWrapper.createFromList(
    ["var", "null", "undefined", "true", "false", "if", "else"]);
