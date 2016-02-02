import {NumberWrapper, StringWrapper, isPresent, resolveEnumToken} from "angular2/src/facade/lang";
import {BaseException} from 'angular2/src/facade/exceptions';

import {
  isWhitespace,
  $EOF,
  $HASH,
  $TILDA,
  $CARET,
  $PERCENT,
  $$,
  $_,
  $COLON,
  $SQ,
  $DQ,
  $EQ,
  $SLASH,
  $BACKSLASH,
  $PERIOD,
  $STAR,
  $PLUS,
  $LPAREN,
  $RPAREN,
  $LBRACE,
  $RBRACE,
  $LBRACKET,
  $RBRACKET,
  $PIPE,
  $COMMA,
  $SEMICOLON,
  $MINUS,
  $BANG,
  $QUESTION,
  $AT,
  $AMPERSAND,
  $GT,
  $a,
  $A,
  $z,
  $Z,
  $0,
  $9,
  $FF,
  $CR,
  $LF,
  $VTAB
} from "angular2/src/compiler/chars";

export {
  $EOF,
  $AT,
  $RBRACE,
  $LBRACE,
  $LBRACKET,
  $RBRACKET,
  $LPAREN,
  $RPAREN,
  $COMMA,
  $COLON,
  $SEMICOLON,
  isWhitespace
} from "angular2/src/compiler/chars";

export enum CssTokenType {
  EOF,
  String,
  Comment,
  Identifier,
  Number,
  IdentifierOrNumber,
  AtKeyword,
  Character,
  Whitespace,
  Invalid
}

export enum CssLexerMode {
  ALL,
  ALL_TRACK_WS,
  SELECTOR,
  PSEUDO_SELECTOR,
  ATTRIBUTE_SELECTOR,
  AT_RULE_QUERY,
  MEDIA_QUERY,
  BLOCK,
  KEYFRAME_BLOCK,
  STYLE_BLOCK,
  STYLE_VALUE,
  STYLE_VALUE_FUNCTION,
  STYLE_CALC_FUNCTION
}

export class LexedCssResult {
  constructor(public error: CssScannerError, public token: CssToken) {}
}

export function generateErrorMessage(input, message, errorValue, index, row, column) {
  return `${message} at column ${row}:${column} in expression [` +
         findProblemCode(input, errorValue, index, column) + ']';
}

export function findProblemCode(input, errorValue, index, column) {
  var endOfProblemLine = index;
  var current = charCode(input, index);
  while (current > 0 && !isNewline(current)) {
    current = charCode(input, ++endOfProblemLine);
  }
  var choppedString = input.substring(0, endOfProblemLine);
  var pointerPadding = "";
  for (var i = 0; i < column; i++) {
    pointerPadding += " ";
  }
  var pointerString = "";
  for (var i = 0; i < errorValue.length; i++) {
    pointerString += "^";
  }
  return choppedString + "\n" + pointerPadding + pointerString + "\n";
}

export class CssToken {
  numValue: number;
  constructor(public index: number, public column: number, public line: number,
              public type: CssTokenType, public strValue: string) {
    this.numValue = charCode(strValue, 0);
  }
}

export class CssLexer {
  scan(text: string, trackComments: boolean = false): CssScanner {
    return new CssScanner(text, trackComments);
  }
}

export class CssScannerError extends BaseException {
  public rawMessage: string;
  public message: string;

  constructor(public token: CssToken, message) {
    super('Css Parse Error: ' + message);
    this.rawMessage = message;
  }

  toString(): string { return this.message; }
}

function _trackWhitespace(mode: CssLexerMode) {
  switch (mode) {
    case CssLexerMode.SELECTOR:
    case CssLexerMode.ALL_TRACK_WS:
    case CssLexerMode.STYLE_VALUE:
      return true;

    default:
      return false;
  }
}

export class CssScanner {
  peek: number;
  peekPeek: number;
  length: number = 0;
  index: number = -1;
  column: number = -1;
  line: number = 0;

  _currentMode: CssLexerMode = CssLexerMode.BLOCK;
  _currentError: CssScannerError = null;

  constructor(public input: string, private _trackComments: boolean = false) {
    this.length = this.input.length;
    this.peekPeek = this.peekAt(0);
    this.advance();
  }

  getMode(): CssLexerMode { return this._currentMode; }

  setMode(mode: CssLexerMode) {
    if (this._currentMode != mode) {
      if (_trackWhitespace(this._currentMode)) {
        this.consumeWhitespace();
      }
      this._currentMode = mode;
    }
  }

  advance(): void {
    if (isNewline(this.peek)) {
      this.column = 0;
      this.line++;
    } else {
      this.column++;
    }

    this.index++;
    this.peek = this.peekPeek;
    this.peekPeek = this.peekAt(this.index + 1);
  }

  peekAt(index): number {
    return index >= this.length ? $EOF : StringWrapper.charCodeAt(this.input, index);
  }

  consumeEmptyStatements(): void {
    this.consumeWhitespace();
    while (this.peek == $SEMICOLON) {
      this.advance();
      this.consumeWhitespace();
    }
  }

  consumeWhitespace(): void {
    while (isWhitespace(this.peek) || isNewline(this.peek)) {
      this.advance();
      if (!this._trackComments && isCommentStart(this.peek, this.peekPeek)) {
        this.advance();  // /
        this.advance();  // *
        while (!isCommentEnd(this.peek, this.peekPeek)) {
          if (this.peek == $EOF) {
            this.error('Unterminated comment');
          }
          this.advance();
        }
        this.advance();  // *
        this.advance();  // /
      }
    }
  }

  consume(type: CssTokenType, value: string = null): LexedCssResult {
    var mode = this._currentMode;
    this.setMode(CssLexerMode.ALL);

    var previousIndex = this.index;
    var previousLine = this.line;
    var previousColumn = this.column;

    var output = this.scan();

    // just incase the inner scan method returned an error
    if (isPresent(output.error)) {
      this.setMode(mode);
      return output;
    }

    var next = output.token;
    if (!isPresent(next)) {
      next = new CssToken(0, 0, 0, CssTokenType.EOF, "end of file");
    }

    var isMatchingType;
    if (type == CssTokenType.IdentifierOrNumber) {
      // TODO (matsko): implement array traversal for lookup here
      isMatchingType = next.type == CssTokenType.Number || next.type == CssTokenType.Identifier;
    } else {
      isMatchingType = next.type == type;
    }

    // before throwing the error we need to bring back the former
    // mode so that the parser can recover...
    this.setMode(mode);

    var error = null;
    if (!isMatchingType || (isPresent(value) && value != next.strValue)) {
      var errorMessage = resolveEnumToken(CssTokenType, next.type) + " does not match expected " +
                         resolveEnumToken(CssTokenType, type) + " value";

      if (isPresent(value)) {
        errorMessage += ' ("' + next.strValue + '" should match "' + value + '")';
      }

      error = new CssScannerError(
          next, generateErrorMessage(this.input, errorMessage, next.strValue, previousIndex,
                                     previousLine, previousColumn));
    }

    return new LexedCssResult(error, next);
  }


  scan(): LexedCssResult {
    var trackWS = _trackWhitespace(this._currentMode);
    if (this.index == 0 && !trackWS) {  // first scan
      this.consumeWhitespace();
    }

    var token = this._scan();
    if (token == null) return null;

    var error = this._currentError;
    this._currentError = null;

    if (!trackWS) {
      this.consumeWhitespace();
    }
    return new LexedCssResult(error, token);
  }

  _scan(): CssToken {
    var peek = this.peek;
    var peekPeek = this.peekPeek;
    if (peek == $EOF) return null;

    if (isCommentStart(peek, peekPeek)) {
      // even if comments are not tracked we still lex the
      // comment so we can move the pointer forward
      var commentToken = this.scanComment();
      if (this._trackComments) {
        return commentToken;
      }
    }

    if (_trackWhitespace(this._currentMode) && (isWhitespace(peek) || isNewline(peek))) {
      return this.scanWhitespace();
    }

    peek = this.peek;
    peekPeek = this.peekPeek;
    if (peek == $EOF) return null;

    if (isStringStart(peek, peekPeek)) {
      return this.scanString();
    }

    // something like url(cool)
    if (this._currentMode == CssLexerMode.STYLE_VALUE_FUNCTION) {
      return this.scanCssValueFunction();
    }

    var isModifier = peek == $PLUS || peek == $MINUS;
    var digitA = isModifier ? false : isDigit(peek);
    var digitB = isDigit(peekPeek);
    if (digitA || (isModifier && (peekPeek == $PERIOD || digitB)) || (peek == $PERIOD && digitB)) {
      return this.scanNumber();
    }

    if (peek == $AT) {
      return this.scanAtExpression();
    }

    if (isIdentifierStart(peek, peekPeek)) {
      return this.scanIdentifier();
    }

    if (isValidCssCharacter(peek, this._currentMode)) {
      return this.scanCharacter();
    }

    return this.error(`Unexpected character [${StringWrapper.fromCharCode(peek)}]`);
  }

  scanComment() {
    if (this.assertCondition(isCommentStart(this.peek, this.peekPeek),
                             "Expected comment start value")) {
      return null;
    }

    var start = this.index;
    var startingColumn = this.column;
    var startingLine = this.line;

    this.advance();  // /
    this.advance();  // *

    while (!isCommentEnd(this.peek, this.peekPeek)) {
      if (this.peek == $EOF) {
        this.error('Unterminated comment');
      }
      this.advance();
    }

    this.advance();  // *
    this.advance();  // /

    var str = this.input.substring(start, this.index);
    return new CssToken(start, startingColumn, startingLine, CssTokenType.Comment, str);
  }

  scanWhitespace() {
    var start = this.index;
    var startingColumn = this.column;
    var startingLine = this.line;
    while (isWhitespace(this.peek) && this.peek != $EOF) {
      this.advance();
    }
    var str = this.input.substring(start, this.index);
    return new CssToken(start, startingColumn, startingLine, CssTokenType.Whitespace, str);
  }

  scanString() {
    if (this.assertCondition(isStringStart(this.peek, this.peekPeek),
                             "Unexpected non-string starting value")) {
      return null;
    }

    var target = this.peek;
    var start = this.index;
    var startingColumn = this.column;
    var startingLine = this.line;
    var previous = target;
    this.advance();

    while (!isCharMatch(target, previous, this.peek)) {
      if (this.peek == $EOF || isNewline(this.peek)) {
        this.error('Unterminated quote');
      }
      previous = this.peek;
      this.advance();
    }

    if (this.assertCondition(this.peek == target, "Unterminated quote")) {
      return null;
    }
    this.advance();

    var str = this.input.substring(start, this.index);
    return new CssToken(start, startingColumn, startingLine, CssTokenType.String, str);
  }

  scanNumber() {
    var start = this.index;
    var startingColumn = this.column;
    if (this.peek == $PLUS || this.peek == $MINUS) {
      this.advance();
    }
    var periodUsed = false;
    while (isDigit(this.peek) || this.peek == $PERIOD) {
      if (this.peek == $PERIOD) {
        if (periodUsed) {
          this.error('Unexpected use of a second period value');
        }
        periodUsed = true;
      }
      this.advance();
    }
    var strValue = this.input.substring(start, this.index);
    return new CssToken(start, startingColumn, this.line, CssTokenType.Number, strValue);
  }

  scanIdentifier() {
    if (this.assertCondition(isIdentifierStart(this.peek, this.peekPeek),
                             'Expected identifier starting value')) {
      return null;
    }

    var start = this.index;
    var startingColumn = this.column;
    while (isIdentifierPart(this.peek)) {
      this.advance();
    }
    var strValue = this.input.substring(start, this.index);
    return new CssToken(start, startingColumn, this.line, CssTokenType.Identifier, strValue);
  }

  scanCssValueFunction() {
    var start = this.index;
    var startingColumn = this.column;
    while (this.peek != $EOF && this.peek != $RPAREN) {
      this.advance();
    }
    var strValue = this.input.substring(start, this.index);
    return new CssToken(start, startingColumn, this.line, CssTokenType.Identifier, strValue);
  }

  scanCharacter() {
    var start = this.index;
    var startingColumn = this.column;
    if (this.assertCondition(isValidCssCharacter(this.peek, this._currentMode),
                             charStr(this.peek) + ' is not a valid CSS character')) {
      return null;
    }

    var c = this.input.substring(start, start + 1);
    this.advance();

    return new CssToken(start, startingColumn, this.line, CssTokenType.Character, c);
  }

  scanAtExpression() {
    if (this.assertCondition(this.peek == $AT, 'Expected @ value')) {
      return null;
    }

    var start = this.index;
    var startingColumn = this.column;
    this.advance();
    if (isIdentifierStart(this.peek, this.peekPeek)) {
      var ident = this.scanIdentifier();
      var strValue = '@' + ident.strValue;
      return new CssToken(start, startingColumn, this.line, CssTokenType.AtKeyword, strValue);
    } else {
      return this.scanCharacter();
    }
  }

  assertCondition(status: boolean, errorMessage: string): boolean {
    if (!status) {
      this.error(errorMessage);
      return true;
    }
    return false;
  }

  error(message: string, errorTokenValue: string = null, doNotAdvance: boolean = false): CssToken {
    var index: number = this.index;
    var column: number = this.column;
    var line: number = this.line;
    errorTokenValue =
        isPresent(errorTokenValue) ? errorTokenValue : StringWrapper.fromCharCode(this.peek);
    var invalidToken = new CssToken(index, column, line, CssTokenType.Invalid, errorTokenValue);
    var errorMessage =
        generateErrorMessage(this.input, message, errorTokenValue, index, line, column);
    if (!doNotAdvance) {
      this.advance();
    }
    this._currentError = new CssScannerError(invalidToken, errorMessage);
    return invalidToken;
  }
}

function isAtKeyword(current: CssToken, next: CssToken): boolean {
  return current.numValue == $AT && next.type == CssTokenType.Identifier;
}

function isCharMatch(target: number, previous: number, code: number) {
  return code == target && previous != $BACKSLASH;
}

function isDigit(code: number): boolean {
  return $0 <= code && code <= $9;
}

function isCommentStart(code: number, next: number) {
  return code == $SLASH && next == $STAR;
}

function isCommentEnd(code: number, next: number) {
  return code == $STAR && next == $SLASH;
}

function isStringStart(code: number, next: number): boolean {
  var target = code;
  if (target == $BACKSLASH) {
    target = next;
  }
  return target == $DQ || target == $SQ;
}

function isIdentifierStart(code: number, next: number): boolean {
  var target = code;
  if (target == $MINUS) {
    target = next;
  }

  return ($a <= target && target <= $z) || ($A <= target && target <= $Z) || target == $BACKSLASH ||
         target == $MINUS || target == $_;
}

function isIdentifierPart(target: number) {
  return ($a <= target && target <= $z) || ($A <= target && target <= $Z) || target == $BACKSLASH ||
         target == $MINUS || target == $_ || isDigit(target);
}

function isValidPseudoSelectorCharacter(code: number) {
  switch (code) {
    case $LPAREN:
    case $RPAREN:
      return true;
    default:
      return false;
  }
}

function isValidKeyframeBlockCharacter(code: number) {
  return code == $PERCENT;
}

function isValidAttributeSelectorCharacter(code: number) {
  // value^*|$~=something
  switch (code) {
    case $$:
    case $PIPE:
    case $CARET:
    case $TILDA:
    case $STAR:
    case $EQ:
      return true;
    default:
      return false;
  }
}

function isValidSelectorCharacter(code: number) {
  // selector [ key   = value ]
  // IDENT    C IDENT C IDENT C
  // #id, .class, *+~>
  // tag:PSEUDO
  switch (code) {
    case $HASH:
    case $PERIOD:
    case $TILDA:
    case $STAR:
    case $PLUS:
    case $GT:
    case $COLON:
    case $PIPE:
    case $COMMA:
      return true;
    default:
      return false;
  }
}

function isValidStyleBlockCharacter(code: number) {
  // key:value;
  // key:calc(something ... )
  switch (code) {
    case $HASH:
    case $SEMICOLON:
    case $COLON:
    case $PERCENT:
    case $SLASH:
    case $BACKSLASH:
    case $BANG:
    case $PERIOD:
    case $LPAREN:
    case $RPAREN:
      return true;
    default:
      return false;
  }
}

function isValidMediaQueryRuleCharacter(code: number) {
  // (min-width: 7.5em) and (orientation: landscape)
  switch (code) {
    case $LPAREN:
    case $RPAREN:
    case $COLON:
    case $PERCENT:
    case $PERIOD:
      return true;
    default:
      return false;
  }
}

function isValidAtRuleCharacter(code: number) {
  // @document url(http://www.w3.org/page?something=on#hash),
  switch (code) {
    case $LPAREN:
    case $RPAREN:
    case $COLON:
    case $PERCENT:
    case $PERIOD:
    case $SLASH:
    case $BACKSLASH:
    case $HASH:
    case $EQ:
    case $QUESTION:
    case $AMPERSAND:
    case $STAR:
    case $COMMA:
    case $MINUS:
    case $PLUS:
      return true;
    default:
      return false;
  }
}

function isValidStyleFunctionCharacter(code: number) {
  switch (code) {
    case $PERIOD:
    case $MINUS:
    case $PLUS:
    case $STAR:
    case $SLASH:
    case $LPAREN:
    case $RPAREN:
    case $COMMA:
      return true;
    default:
      return false;
  }
}

function isValidBlockCharacter(code: number) {
  // @something { }
  // IDENT
  return code == $AT;
}

function isValidCssCharacter(code: number, mode: CssLexerMode): boolean {
  switch (mode) {
    case CssLexerMode.ALL:
    case CssLexerMode.ALL_TRACK_WS:
      return true;

    case CssLexerMode.SELECTOR:
      return isValidSelectorCharacter(code);

    case CssLexerMode.PSEUDO_SELECTOR:
      return isValidPseudoSelectorCharacter(code);

    case CssLexerMode.ATTRIBUTE_SELECTOR:
      return isValidAttributeSelectorCharacter(code);

    case CssLexerMode.MEDIA_QUERY:
      return isValidMediaQueryRuleCharacter(code);

    case CssLexerMode.AT_RULE_QUERY:
      return isValidAtRuleCharacter(code);

    case CssLexerMode.KEYFRAME_BLOCK:
      return isValidKeyframeBlockCharacter(code);

    case CssLexerMode.STYLE_BLOCK:
    case CssLexerMode.STYLE_VALUE:
      return isValidStyleBlockCharacter(code);

    case CssLexerMode.STYLE_CALC_FUNCTION:
      return isValidStyleFunctionCharacter(code);

    case CssLexerMode.BLOCK:
      return isValidBlockCharacter(code);

    default:
      return false;
  }
}

function charCode(input, index): number {
  return index >= input.length ? $EOF : StringWrapper.charCodeAt(input, index);
}

function charStr(code: number): string {
  return StringWrapper.fromCharCode(code);
}

export function isNewline(code): boolean {
  switch (code) {
    case $FF:
    case $CR:
    case $LF:
    case $VTAB:
      return true;

    default:
      return false;
  }
}
