import {
  StringWrapper,
  NumberWrapper,
  isPresent,
  isBlank,
  CONST_EXPR,
  serializeEnum,
  isString,
} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {ListWrapper} from 'angular2/src/facade/collection';
import {ParseLocation, ParseError, ParseSourceFile, ParseSourceSpan} from './parse_util';
import {getHtmlTagDefinition, HtmlTagContentType, NAMED_ENTITIES} from './html_tags';

export enum HtmlTokenType {
  TAG_OPEN_START,
  TAG_OPEN_END,
  TAG_OPEN_END_VOID,
  TAG_CLOSE,
  TEXT,
  ESCAPABLE_RAW_TEXT,
  RAW_TEXT,
  COMMENT_START,
  COMMENT_END,
  CDATA_START,
  CDATA_END,
  ATTR_NAME,
  ATTR_VALUE,
  DOC_TYPE,
  EOF
}

export class HtmlToken {
  constructor(public type: HtmlTokenType, public parts: string[],
              public sourceSpan: ParseSourceSpan) {}
}

export class HtmlTokenError extends ParseError {
  constructor(errorMsg: string, public tokenType: HtmlTokenType, location: ParseLocation) {
    super(location, errorMsg);
  }
}

export class HtmlTokenizeResult {
  constructor(public tokens: HtmlToken[], public errors: HtmlTokenError[]) {}
}

export function tokenizeHtml(sourceContent: string, sourceUrl: string): HtmlTokenizeResult {
  return new _HtmlTokenizer(new ParseSourceFile(sourceContent, sourceUrl), '{{', '}}').tokenize();
}

const $EOF = 0;
const $TAB = 9;
const $LF = 10;
const $CR = 13;

const $SPACE = 32;

const $BANG = 33;
const $DQ = 34;
const $HASH = 35;
const $AMPERSAND = 38;
const $SQ = 39;
const $MINUS = 45;
const $SLASH = 47;
const $0 = 48;

const $SEMICOLON = 59;

const $9 = 57;
const $COLON = 58;
const $LT = 60;
const $EQ = 61;
const $GT = 62;
const $A = 65;
const $Z = 90;
const $LBRACKET = 91;
const $RBRACKET = 93;
const $a = 97;
const $f = 102;
const $z = 122;
const $x = 120;

const $NBSP = 160;

var CRLF_REGEXP = /\r\n/g;
var CR_REGEXP = /\r/g;

function unexpectedCharacterErrorMsg(charCode: number): string {
  var char = charCode === $EOF ? 'EOF' : StringWrapper.fromCharCode(charCode);
  return `Unexpected character "${char}"`;
}

function unknownEntityErrorMsg(entitySrc: string): string {
  return `Unknown entity "${entitySrc}" - use the "&#<decimal>;" or  "&#x<hex>;" syntax`;
}

class ControlFlowError {
  constructor(public error: HtmlTokenError) {}
}

// See http://www.w3.org/TR/html51/syntax.html#writing
class _HtmlTokenizer {
  private _input: string;
  private _inputLowercase: string;
  private _length: number;
  // Note: this is always lowercase!
  private _peek: number = -1;
  private _index: number = -1;
  private _line: number = 0;
  private _column: number = -1;
  private _currentTokenStart: ParseLocation;
  private _currentTokenType: HtmlTokenType;

  tokens: HtmlToken[] = [];
  errors: HtmlTokenError[] = [];

  constructor(private _file: ParseSourceFile, private _expStart = null, private _expEnd = null) {
    if (isString(this._expStart) && this._expStart.length == 0) {
      this._expStart = null;
    }
    if (isString(this._expEnd) && this._expEnd.length == 0) {
      this._expEnd = null;
    }
    if (isBlank(this._expEnd) && isPresent(this._expStart)) {
      throw new BaseException(
          'An expression end delimiter is required when a start delimiter is specified');
    }

    this._input = _file.content;
    this._inputLowercase = _file.content.toLowerCase();
    this._length = _file.content.length;
    this._advance();
  }

  private _processCarriageReturns(content: string): string {
    // http://www.w3.org/TR/html5/syntax.html#preprocessing-the-input-stream
    // In order to keep the original position in the source, we can not pre-process it.
    // Instead CRs are processed right before instantiating the tokens.
    content = StringWrapper.replaceAll(content, CRLF_REGEXP, '\r');
    return StringWrapper.replaceAll(content, CR_REGEXP, '\n');
  }

  tokenize(): HtmlTokenizeResult {
    while (this._peek !== $EOF) {
      var start = this._getLocation();
      try {
        if (this._attemptChar($LT)) {
          if (this._attemptChar($BANG)) {
            if (this._attemptChar($LBRACKET)) {
              this._consumeCdata(start);
            } else if (this._attemptChar($MINUS)) {
              this._consumeComment(start);
            } else {
              this._consumeDocType(start);
            }
          } else if (this._attemptChar($SLASH)) {
            this._consumeTagClose(start);
          } else {
            this._consumeTagOpen(start);
          }
        } else if (this._peekExpStart()) {
          this._consumeExpression();
        } else {
          this._consumeText();
        }
      } catch (e) {
        if (e instanceof ControlFlowError) {
          this.errors.push(e.error);
        } else {
          throw e;
        }
      }
    }
    this._beginToken(HtmlTokenType.EOF);
    this._endToken([]);
    return new HtmlTokenizeResult(mergeTextTokens(this.tokens), this.errors);
  }

  private _getLocation(): ParseLocation {
    return new ParseLocation(this._file, this._index, this._line, this._column);
  }

  private _beginToken(type: HtmlTokenType, start: ParseLocation = null) {
    if (isBlank(start)) {
      start = this._getLocation();
    }
    this._currentTokenStart = start;
    this._currentTokenType = type;
  }

  private _endToken(parts: string[], end: ParseLocation = null): HtmlToken {
    if (isBlank(end)) {
      end = this._getLocation();
    }
    var token = new HtmlToken(this._currentTokenType, parts,
                              new ParseSourceSpan(this._currentTokenStart, end));
    this.tokens.push(token);
    this._currentTokenStart = null;
    this._currentTokenType = null;
    return token;
  }

  private _createError(msg: string, position: ParseLocation): ControlFlowError {
    var error = new HtmlTokenError(msg, this._currentTokenType, position);
    this._currentTokenStart = null;
    this._currentTokenType = null;
    return new ControlFlowError(error);
  }

  private _advance() {
    if (this._index >= this._length) {
      throw this._createError(unexpectedCharacterErrorMsg($EOF), this._getLocation());
    }
    if (this._peek === $LF) {
      this._line++;
      this._column = 0;
    } else if (this._peek !== $LF && this._peek !== $CR) {
      this._column++;
    }
    this._index++;
    this._peek = this._index >= this._length ? $EOF : StringWrapper.charCodeAt(this._inputLowercase,
                                                                               this._index);
  }

  private _peekStr(str: string): boolean {
    let charLeft = this._length - this._index;

    if (charLeft < str.length) return false;

    for (let i = 0; i < str.length; i++) {
      if (!StringWrapper.equals(this._input[this._index + i], str[i])) {
        return false;
      }
    }

    return true;
  }

  private _attemptChar(charCode: number): boolean {
    if (this._peek === charCode) {
      this._advance();
      return true;
    }
    return false;
  }

  private _requireChar(charCode: number) {
    var location = this._getLocation();
    if (!this._attemptChar(charCode)) {
      throw this._createError(unexpectedCharacterErrorMsg(this._peek), location);
    }
  }

  private _attemptChars(chars: string): boolean {
    for (var i = 0; i < chars.length; i++) {
      if (!this._attemptChar(StringWrapper.charCodeAt(chars, i))) {
        return false;
      }
    }
    return true;
  }

  private _requireChars(chars: string) {
    var location = this._getLocation();
    if (!this._attemptChars(chars)) {
      throw this._createError(unexpectedCharacterErrorMsg(this._peek), location);
    }
  }

  private _attemptUntilFn(predicate: Function) {
    while (!predicate(this._peek)) {
      this._advance();
    }
  }

  private _requireUntilFn(predicate: Function, len: number) {
    var start = this._getLocation();
    this._attemptUntilFn(predicate);
    if (this._index - start.offset < len) {
      throw this._createError(unexpectedCharacterErrorMsg(this._peek), start);
    }
  }

  private _attemptUntilChar(char: number) {
    while (this._peek !== char) {
      this._advance();
    }
  }

  private _readChar(decodeEntities: boolean): string {
    if (decodeEntities && this._peek === $AMPERSAND) {
      return this._decodeEntity();
    } else {
      var index = this._index;
      this._advance();
      return this._input[index];
    }
  }

  private _decodeEntity(): string {
    var start = this._getLocation();
    this._advance();
    if (this._attemptChar($HASH)) {
      let isHex = this._attemptChar($x);
      let numberStart = this._getLocation().offset;
      this._attemptUntilFn(isDigitEntityEnd);
      if (this._peek != $SEMICOLON) {
        throw this._createError(unexpectedCharacterErrorMsg(this._peek), this._getLocation());
      }
      this._advance();
      let strNum = this._input.substring(numberStart, this._index - 1);
      try {
        let charCode = NumberWrapper.parseInt(strNum, isHex ? 16 : 10);
        return StringWrapper.fromCharCode(charCode);
      } catch (e) {
        let entity = this._input.substring(start.offset + 1, this._index - 1);
        throw this._createError(unknownEntityErrorMsg(entity), start);
      }
    } else {
      let startPosition = this._savePosition();
      this._attemptUntilFn(isNamedEntityEnd);
      if (this._peek != $SEMICOLON) {
        this._restorePosition(startPosition);
        return '&';
      }
      this._advance();
      let name = this._input.substring(start.offset + 1, this._index - 1);
      let char = NAMED_ENTITIES[name];
      if (isBlank(char)) {
        throw this._createError(unknownEntityErrorMsg(name), start);
      }
      return char;
    }
  }

  private _consumeRawText(decodeEntities: boolean, firstCharOfEnd: number,
                          attemptEndRest: Function): HtmlToken {
    var tagCloseStart;
    this._beginToken(decodeEntities ? HtmlTokenType.ESCAPABLE_RAW_TEXT : HtmlTokenType.RAW_TEXT);
    var parts = [];
    while (true) {
      tagCloseStart = this._getLocation();
      if (this._attemptChar(firstCharOfEnd) && attemptEndRest()) {
        break;
      }
      if (this._index > tagCloseStart.offset) {
        parts.push(this._input.substring(tagCloseStart.offset, this._index));
      }
      while (this._peek !== firstCharOfEnd) {
        parts.push(this._readChar(decodeEntities));
      }
    }
    return this._endToken([this._processCarriageReturns(parts.join(''))], tagCloseStart);
  }

  private _consumeExpression(): void {
    let parts: string[] = [this._expStart];
    this._beginToken(HtmlTokenType.TEXT);
    this._requireChars(this._expStart);
    while (!this._peekStr(this._expEnd)) {
      parts.push(this._readChar(true));
    }
    this._requireChars(this._expEnd);
    parts.push(this._expEnd);

    this._endToken([this._processCarriageReturns(parts.join(''))]);
  }

  private _consumeComment(start: ParseLocation) {
    this._beginToken(HtmlTokenType.COMMENT_START, start);
    this._requireChar($MINUS);
    this._endToken([]);
    var textToken = this._consumeRawText(false, $MINUS, () => this._attemptChars('->'));
    this._beginToken(HtmlTokenType.COMMENT_END, textToken.sourceSpan.end);
    this._endToken([]);
  }

  private _consumeCdata(start: ParseLocation) {
    this._beginToken(HtmlTokenType.CDATA_START, start);
    this._requireChars('cdata[');
    this._endToken([]);
    var textToken = this._consumeRawText(false, $RBRACKET, () => this._attemptChars(']>'));
    this._beginToken(HtmlTokenType.CDATA_END, textToken.sourceSpan.end);
    this._endToken([]);
  }

  private _consumeDocType(start: ParseLocation) {
    this._beginToken(HtmlTokenType.DOC_TYPE, start);
    this._attemptUntilChar($GT);
    this._advance();
    this._endToken([this._input.substring(start.offset + 2, this._index - 1)]);
  }

  private _consumePrefixAndName(): string[] {
    var nameOrPrefixStart = this._index;
    var prefix = null;
    while (this._peek !== $COLON && !isPrefixEnd(this._peek)) {
      this._advance();
    }
    var nameStart;
    if (this._peek === $COLON) {
      this._advance();
      prefix = this._input.substring(nameOrPrefixStart, this._index - 1);
      nameStart = this._index;
    } else {
      nameStart = nameOrPrefixStart;
    }
    this._requireUntilFn(isNameEnd, this._index === nameStart ? 1 : 0);
    var name = this._input.substring(nameStart, this._index);
    return [prefix, name];
  }

  private _consumeTagOpen(start: ParseLocation) {
    let nameStart = this._index;
    this._consumeTagOpenStart(start);
    let lowercaseTagName = this._inputLowercase.substring(nameStart, this._index);
    this._attemptUntilFn(isNotWhitespace);
    while (this._peek !== $SLASH && this._peek !== $GT) {
      this._consumeAttributeName();
      this._attemptUntilFn(isNotWhitespace);
      if (this._attemptChar($EQ)) {
        this._attemptUntilFn(isNotWhitespace);
        this._consumeAttributeValue();
      }
      this._attemptUntilFn(isNotWhitespace);
    }
    this._consumeTagOpenEnd();

    var contentTokenType = getHtmlTagDefinition(lowercaseTagName).contentType;
    if (contentTokenType === HtmlTagContentType.RAW_TEXT) {
      this._consumeRawTextWithTagClose(lowercaseTagName, false);
    } else if (contentTokenType === HtmlTagContentType.ESCAPABLE_RAW_TEXT) {
      this._consumeRawTextWithTagClose(lowercaseTagName, true);
    }
  }

  private _consumeRawTextWithTagClose(lowercaseTagName: string, decodeEntities: boolean) {
    var textToken = this._consumeRawText(decodeEntities, $LT, () => {
      if (!this._attemptChar($SLASH)) return false;
      this._attemptUntilFn(isNotWhitespace);
      if (!this._attemptChars(lowercaseTagName)) return false;
      this._attemptUntilFn(isNotWhitespace);
      if (!this._attemptChar($GT)) return false;
      return true;
    });
    this._beginToken(HtmlTokenType.TAG_CLOSE, textToken.sourceSpan.end);
    this._endToken([null, lowercaseTagName]);
  }

  private _consumeTagOpenStart(start: ParseLocation) {
    this._beginToken(HtmlTokenType.TAG_OPEN_START, start);
    if (!isAsciiLetter(this._peek)) {
      throw this._createError(unexpectedCharacterErrorMsg(this._peek), this._getLocation());
    }
    var parts = this._consumePrefixAndName();
    this._endToken(parts);
  }

  private _consumeAttributeName() {
    this._beginToken(HtmlTokenType.ATTR_NAME);
    var prefixAndName = this._consumePrefixAndName();
    this._endToken(prefixAndName);
  }

  private _consumeAttributeValue() {
    this._beginToken(HtmlTokenType.ATTR_VALUE);
    var value;
    if (this._peek === $SQ || this._peek === $DQ) {
      var quoteChar = this._peek;
      this._advance();
      var parts = [];
      while (this._peek !== quoteChar) {
        parts.push(this._readChar(true));
      }
      value = parts.join('');
      this._advance();
    } else {
      var valueStart = this._index;
      this._requireUntilFn(isNameEnd, 1);
      value = this._input.substring(valueStart, this._index);
    }
    this._endToken([this._processCarriageReturns(value)]);
  }

  private _consumeTagOpenEnd() {
    var tokenType =
        this._attemptChar($SLASH) ? HtmlTokenType.TAG_OPEN_END_VOID : HtmlTokenType.TAG_OPEN_END;
    this._beginToken(tokenType);
    this._requireChar($GT);
    this._endToken([]);
  }

  private _consumeTagClose(start: ParseLocation) {
    this._beginToken(HtmlTokenType.TAG_CLOSE, start);
    this._attemptUntilFn(isNotWhitespace);
    var prefixAndName;
    prefixAndName = this._consumePrefixAndName();
    this._attemptUntilFn(isNotWhitespace);
    this._requireChar($GT);
    this._endToken(prefixAndName);
  }

  private _consumeText() {
    this._beginToken(HtmlTokenType.TEXT);
    var parts = [this._readChar(true)];
    while (!isTextEnd(this._peek) && !this._peekExpStart()) {
      parts.push(this._readChar(true));
    }
    this._endToken([this._processCarriageReturns(parts.join(''))]);
  }

  private _savePosition(): number[] {
    return [this._peek, this._index, this._column, this._line, this.tokens.length];
  }

  private _peekExpStart(): boolean {
    return isPresent(this._expStart) && this._peekStr(this._expStart);
  }

  private _restorePosition(position: number[]): void {
    this._peek = position[0];
    this._index = position[1];
    this._column = position[2];
    this._line = position[3];
    let nbTokens = position[4];
    if (nbTokens < this.tokens.length) {
      // remove any extra tokens
      this.tokens = ListWrapper.slice(this.tokens, 0, nbTokens);
    }
  }
}

function isNotWhitespace(code: number): boolean {
  return !isWhitespace(code) || code === $EOF;
}

function isWhitespace(code: number): boolean {
  return (code >= $TAB && code <= $SPACE) || (code === $NBSP);
}

function isNameEnd(code: number): boolean {
  return isWhitespace(code) || code === $GT || code === $SLASH || code === $SQ || code === $DQ ||
         code === $EQ;
}

function isPrefixEnd(code: number): boolean {
  return (code < $a || $z < code) && (code < $A || $Z < code) && (code < $0 || code > $9);
}

function isDigitEntityEnd(code: number): boolean {
  return code == $SEMICOLON || code == $EOF || !isAsciiHexDigit(code);
}

function isNamedEntityEnd(code: number): boolean {
  return code == $SEMICOLON || code == $EOF || !isAsciiLetter(code);
}

function isTextEnd(code: number): boolean {
  return code === $LT || code === $EOF;
}

function isAsciiLetter(code: number): boolean {
  return code >= $a && code <= $z;
}

function isAsciiHexDigit(code: number): boolean {
  return code >= $a && code <= $f || code >= $0 && code <= $9;
}

function mergeTextTokens(srcTokens: HtmlToken[]): HtmlToken[] {
  let dstTokens = [];
  let lastDstToken: HtmlToken;
  for (let i = 0; i < srcTokens.length; i++) {
    let token = srcTokens[i];
    if (isPresent(lastDstToken) && lastDstToken.type == HtmlTokenType.TEXT &&
        token.type == HtmlTokenType.TEXT) {
      lastDstToken.parts[0] += token.parts[0];
      lastDstToken.sourceSpan.end = token.sourceSpan.end;
    } else {
      lastDstToken = token;
      dstTokens.push(lastDstToken);
    }
  }

  return dstTokens;
}
