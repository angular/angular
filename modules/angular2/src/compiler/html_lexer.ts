import {
  StringWrapper,
  NumberWrapper,
  isPresent,
  isBlank,
  CONST_EXPR,
  serializeEnum
} from 'angular2/src/facade/lang';
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
  EXPANSION_FORM_START,
  EXPANSION_CASE_VALUE,
  EXPANSION_CASE_EXP_START,
  EXPANSION_CASE_EXP_END,
  EXPANSION_FORM_END,
  EOF
}

export class HtmlToken {
  constructor(public type: HtmlTokenType, public parts: string[],
              public sourceSpan: ParseSourceSpan) {}
}

export class HtmlTokenError extends ParseError {
  constructor(errorMsg: string, public tokenType: HtmlTokenType, span: ParseSourceSpan) {
    super(span, errorMsg);
  }
}

export class HtmlTokenizeResult {
  constructor(public tokens: HtmlToken[], public errors: HtmlTokenError[]) {}
}

export function tokenizeHtml(sourceContent: string, sourceUrl: string,
                             tokenizeExpansionForms: boolean = false): HtmlTokenizeResult {
  return new _HtmlTokenizer(new ParseSourceFile(sourceContent, sourceUrl), tokenizeExpansionForms)
      .tokenize();
}

const $EOF = 0;
const $TAB = 9;
const $LF = 10;
const $FF = 12;
const $CR = 13;

const $SPACE = 32;

const $BANG = 33;
const $DQ = 34;
const $HASH = 35;
const $$ = 36;
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
const $QUESTION = 63;
const $LBRACKET = 91;
const $RBRACKET = 93;
const $LBRACE = 123;
const $RBRACE = 125;
const $COMMA = 44;
const $A = 65;
const $F = 70;
const $X = 88;
const $Z = 90;

const $a = 97;
const $f = 102;
const $z = 122;
const $x = 120;

const $NBSP = 160;

var CR_OR_CRLF_REGEXP = /\r\n?/g;

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
  private input: string;
  private length: number;
  // Note: this is always lowercase!
  private peek: number = -1;
  private nextPeek: number = -1;
  private index: number = -1;
  private line: number = 0;
  private column: number = -1;
  private currentTokenStart: ParseLocation;
  private currentTokenType: HtmlTokenType;

  private expansionCaseStack = [];

  tokens: HtmlToken[] = [];
  errors: HtmlTokenError[] = [];

  constructor(private file: ParseSourceFile, private tokenizeExpansionForms: boolean) {
    this.input = file.content;
    this.length = file.content.length;
    this._advance();
  }

  private _processCarriageReturns(content: string): string {
    // http://www.w3.org/TR/html5/syntax.html#preprocessing-the-input-stream
    // In order to keep the original position in the source, we can not
    // pre-process it.
    // Instead CRs are processed right before instantiating the tokens.
    return StringWrapper.replaceAll(content, CR_OR_CRLF_REGEXP, '\n');
  }

  tokenize(): HtmlTokenizeResult {
    while (this.peek !== $EOF) {
      var start = this._getLocation();
      try {
        if (this._attemptCharCode($LT)) {
          if (this._attemptCharCode($BANG)) {
            if (this._attemptCharCode($LBRACKET)) {
              this._consumeCdata(start);
            } else if (this._attemptCharCode($MINUS)) {
              this._consumeComment(start);
            } else {
              this._consumeDocType(start);
            }
          } else if (this._attemptCharCode($SLASH)) {
            this._consumeTagClose(start);
          } else {
            this._consumeTagOpen(start);
          }
        } else if (isSpecialFormStart(this.peek, this.nextPeek) && this.tokenizeExpansionForms) {
          this._consumeExpansionFormStart();

        } else if (this.peek === $EQ && this.tokenizeExpansionForms) {
          this._consumeExpansionCaseStart();

        } else if (this.peek === $RBRACE && this.isInExpansionCase() &&
                   this.tokenizeExpansionForms) {
          this._consumeExpansionCaseEnd();

        } else if (this.peek === $RBRACE && this.isInExpansionForm() &&
                   this.tokenizeExpansionForms) {
          this._consumeExpansionFormEnd();

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
    return new ParseLocation(this.file, this.index, this.line, this.column);
  }

  private _getSpan(start?: ParseLocation, end?: ParseLocation): ParseSourceSpan {
    if (isBlank(start)) {
      start = this._getLocation();
    }
    if (isBlank(end)) {
      end = this._getLocation();
    }
    return new ParseSourceSpan(start, end);
  }

  private _beginToken(type: HtmlTokenType, start: ParseLocation = null) {
    if (isBlank(start)) {
      start = this._getLocation();
    }
    this.currentTokenStart = start;
    this.currentTokenType = type;
  }

  private _endToken(parts: string[], end: ParseLocation = null): HtmlToken {
    if (isBlank(end)) {
      end = this._getLocation();
    }
    var token = new HtmlToken(this.currentTokenType, parts,
                              new ParseSourceSpan(this.currentTokenStart, end));
    this.tokens.push(token);
    this.currentTokenStart = null;
    this.currentTokenType = null;
    return token;
  }

  private _createError(msg: string, span: ParseSourceSpan): ControlFlowError {
    var error = new HtmlTokenError(msg, this.currentTokenType, span);
    this.currentTokenStart = null;
    this.currentTokenType = null;
    return new ControlFlowError(error);
  }

  private _advance() {
    if (this.index >= this.length) {
      throw this._createError(unexpectedCharacterErrorMsg($EOF), this._getSpan());
    }
    if (this.peek === $LF) {
      this.line++;
      this.column = 0;
    } else if (this.peek !== $LF && this.peek !== $CR) {
      this.column++;
    }
    this.index++;
    this.peek = this.index >= this.length ? $EOF : StringWrapper.charCodeAt(this.input, this.index);
    this.nextPeek =
        this.index + 1 >= this.length ? $EOF : StringWrapper.charCodeAt(this.input, this.index + 1);
  }

  private _attemptCharCode(charCode: number): boolean {
    if (this.peek === charCode) {
      this._advance();
      return true;
    }
    return false;
  }

  private _attemptCharCodeCaseInsensitive(charCode: number): boolean {
    if (compareCharCodeCaseInsensitive(this.peek, charCode)) {
      this._advance();
      return true;
    }
    return false;
  }

  private _requireCharCode(charCode: number) {
    var location = this._getLocation();
    if (!this._attemptCharCode(charCode)) {
      throw this._createError(unexpectedCharacterErrorMsg(this.peek),
                              this._getSpan(location, location));
    }
  }

  private _attemptStr(chars: string): boolean {
    for (var i = 0; i < chars.length; i++) {
      if (!this._attemptCharCode(StringWrapper.charCodeAt(chars, i))) {
        return false;
      }
    }
    return true;
  }

  private _attemptStrCaseInsensitive(chars: string): boolean {
    for (var i = 0; i < chars.length; i++) {
      if (!this._attemptCharCodeCaseInsensitive(StringWrapper.charCodeAt(chars, i))) {
        return false;
      }
    }
    return true;
  }

  private _requireStr(chars: string) {
    var location = this._getLocation();
    if (!this._attemptStr(chars)) {
      throw this._createError(unexpectedCharacterErrorMsg(this.peek), this._getSpan(location));
    }
  }

  private _attemptCharCodeUntilFn(predicate: Function) {
    while (!predicate(this.peek)) {
      this._advance();
    }
  }

  private _requireCharCodeUntilFn(predicate: Function, len: number) {
    var start = this._getLocation();
    this._attemptCharCodeUntilFn(predicate);
    if (this.index - start.offset < len) {
      throw this._createError(unexpectedCharacterErrorMsg(this.peek), this._getSpan(start, start));
    }
  }

  private _attemptUntilChar(char: number) {
    while (this.peek !== char) {
      this._advance();
    }
  }

  private _readChar(decodeEntities: boolean): string {
    if (decodeEntities && this.peek === $AMPERSAND) {
      return this._decodeEntity();
    } else {
      var index = this.index;
      this._advance();
      return this.input[index];
    }
  }

  private _decodeEntity(): string {
    var start = this._getLocation();
    this._advance();
    if (this._attemptCharCode($HASH)) {
      let isHex = this._attemptCharCode($x) || this._attemptCharCode($X);
      let numberStart = this._getLocation().offset;
      this._attemptCharCodeUntilFn(isDigitEntityEnd);
      if (this.peek != $SEMICOLON) {
        throw this._createError(unexpectedCharacterErrorMsg(this.peek), this._getSpan());
      }
      this._advance();
      let strNum = this.input.substring(numberStart, this.index - 1);
      try {
        let charCode = NumberWrapper.parseInt(strNum, isHex ? 16 : 10);
        return StringWrapper.fromCharCode(charCode);
      } catch (e) {
        let entity = this.input.substring(start.offset + 1, this.index - 1);
        throw this._createError(unknownEntityErrorMsg(entity), this._getSpan(start));
      }
    } else {
      let startPosition = this._savePosition();
      this._attemptCharCodeUntilFn(isNamedEntityEnd);
      if (this.peek != $SEMICOLON) {
        this._restorePosition(startPosition);
        return '&';
      }
      this._advance();
      let name = this.input.substring(start.offset + 1, this.index - 1);
      let char = NAMED_ENTITIES[name];
      if (isBlank(char)) {
        throw this._createError(unknownEntityErrorMsg(name), this._getSpan(start));
      }
      return char;
    }
  }

  private _consumeRawText(decodeEntities: boolean, firstCharOfEnd: number,
                          attemptEndRest: Function): HtmlToken {
    var tagCloseStart;
    var textStart = this._getLocation();
    this._beginToken(decodeEntities ? HtmlTokenType.ESCAPABLE_RAW_TEXT : HtmlTokenType.RAW_TEXT,
                     textStart);
    var parts = [];
    while (true) {
      tagCloseStart = this._getLocation();
      if (this._attemptCharCode(firstCharOfEnd) && attemptEndRest()) {
        break;
      }
      if (this.index > tagCloseStart.offset) {
        parts.push(this.input.substring(tagCloseStart.offset, this.index));
      }
      while (this.peek !== firstCharOfEnd) {
        parts.push(this._readChar(decodeEntities));
      }
    }
    return this._endToken([this._processCarriageReturns(parts.join(''))], tagCloseStart);
  }

  private _consumeComment(start: ParseLocation) {
    this._beginToken(HtmlTokenType.COMMENT_START, start);
    this._requireCharCode($MINUS);
    this._endToken([]);
    var textToken = this._consumeRawText(false, $MINUS, () => this._attemptStr('->'));
    this._beginToken(HtmlTokenType.COMMENT_END, textToken.sourceSpan.end);
    this._endToken([]);
  }

  private _consumeCdata(start: ParseLocation) {
    this._beginToken(HtmlTokenType.CDATA_START, start);
    this._requireStr('CDATA[');
    this._endToken([]);
    var textToken = this._consumeRawText(false, $RBRACKET, () => this._attemptStr(']>'));
    this._beginToken(HtmlTokenType.CDATA_END, textToken.sourceSpan.end);
    this._endToken([]);
  }

  private _consumeDocType(start: ParseLocation) {
    this._beginToken(HtmlTokenType.DOC_TYPE, start);
    this._attemptUntilChar($GT);
    this._advance();
    this._endToken([this.input.substring(start.offset + 2, this.index - 1)]);
  }

  private _consumePrefixAndName(): string[] {
    var nameOrPrefixStart = this.index;
    var prefix = null;
    while (this.peek !== $COLON && !isPrefixEnd(this.peek)) {
      this._advance();
    }
    var nameStart;
    if (this.peek === $COLON) {
      this._advance();
      prefix = this.input.substring(nameOrPrefixStart, this.index - 1);
      nameStart = this.index;
    } else {
      nameStart = nameOrPrefixStart;
    }
    this._requireCharCodeUntilFn(isNameEnd, this.index === nameStart ? 1 : 0);
    var name = this.input.substring(nameStart, this.index);
    return [prefix, name];
  }

  private _consumeTagOpen(start: ParseLocation) {
    let savedPos = this._savePosition();
    let lowercaseTagName;
    try {
      if (!isAsciiLetter(this.peek)) {
        throw this._createError(unexpectedCharacterErrorMsg(this.peek), this._getSpan());
      }
      var nameStart = this.index;
      this._consumeTagOpenStart(start);
      lowercaseTagName = this.input.substring(nameStart, this.index).toLowerCase();
      this._attemptCharCodeUntilFn(isNotWhitespace);
      while (this.peek !== $SLASH && this.peek !== $GT) {
        this._consumeAttributeName();
        this._attemptCharCodeUntilFn(isNotWhitespace);
        if (this._attemptCharCode($EQ)) {
          this._attemptCharCodeUntilFn(isNotWhitespace);
          this._consumeAttributeValue();
        }
        this._attemptCharCodeUntilFn(isNotWhitespace);
      }
      this._consumeTagOpenEnd();
    } catch (e) {
      if (e instanceof ControlFlowError) {
        // When the start tag is invalid, assume we want a "<"
        this._restorePosition(savedPos);
        // Back to back text tokens are merged at the end
        this._beginToken(HtmlTokenType.TEXT, start);
        this._endToken(['<']);
        return;
      }

      throw e;
    }

    var contentTokenType = getHtmlTagDefinition(lowercaseTagName).contentType;
    if (contentTokenType === HtmlTagContentType.RAW_TEXT) {
      this._consumeRawTextWithTagClose(lowercaseTagName, false);
    } else if (contentTokenType === HtmlTagContentType.ESCAPABLE_RAW_TEXT) {
      this._consumeRawTextWithTagClose(lowercaseTagName, true);
    }
  }

  private _consumeRawTextWithTagClose(lowercaseTagName: string, decodeEntities: boolean) {
    var textToken = this._consumeRawText(decodeEntities, $LT, () => {
      if (!this._attemptCharCode($SLASH)) return false;
      this._attemptCharCodeUntilFn(isNotWhitespace);
      if (!this._attemptStrCaseInsensitive(lowercaseTagName)) return false;
      this._attemptCharCodeUntilFn(isNotWhitespace);
      if (!this._attemptCharCode($GT)) return false;
      return true;
    });
    this._beginToken(HtmlTokenType.TAG_CLOSE, textToken.sourceSpan.end);
    this._endToken([null, lowercaseTagName]);
  }

  private _consumeTagOpenStart(start: ParseLocation) {
    this._beginToken(HtmlTokenType.TAG_OPEN_START, start);
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
    if (this.peek === $SQ || this.peek === $DQ) {
      var quoteChar = this.peek;
      this._advance();
      var parts = [];
      while (this.peek !== quoteChar) {
        parts.push(this._readChar(true));
      }
      value = parts.join('');
      this._advance();
    } else {
      var valueStart = this.index;
      this._requireCharCodeUntilFn(isNameEnd, 1);
      value = this.input.substring(valueStart, this.index);
    }
    this._endToken([this._processCarriageReturns(value)]);
  }

  private _consumeTagOpenEnd() {
    var tokenType = this._attemptCharCode($SLASH) ? HtmlTokenType.TAG_OPEN_END_VOID :
                                                    HtmlTokenType.TAG_OPEN_END;
    this._beginToken(tokenType);
    this._requireCharCode($GT);
    this._endToken([]);
  }

  private _consumeTagClose(start: ParseLocation) {
    this._beginToken(HtmlTokenType.TAG_CLOSE, start);
    this._attemptCharCodeUntilFn(isNotWhitespace);
    var prefixAndName;
    prefixAndName = this._consumePrefixAndName();
    this._attemptCharCodeUntilFn(isNotWhitespace);
    this._requireCharCode($GT);
    this._endToken(prefixAndName);
  }

  private _consumeExpansionFormStart() {
    this._beginToken(HtmlTokenType.EXPANSION_FORM_START, this._getLocation());
    this._requireCharCode($LBRACE);
    this._endToken([]);

    this._beginToken(HtmlTokenType.RAW_TEXT, this._getLocation());
    let condition = this._readUntil($COMMA);
    this._endToken([condition], this._getLocation());
    this._requireCharCode($COMMA);
    this._attemptCharCodeUntilFn(isNotWhitespace);

    this._beginToken(HtmlTokenType.RAW_TEXT, this._getLocation());
    let type = this._readUntil($COMMA);
    this._endToken([type], this._getLocation());
    this._requireCharCode($COMMA);
    this._attemptCharCodeUntilFn(isNotWhitespace);

    this.expansionCaseStack.push(HtmlTokenType.EXPANSION_FORM_START);
  }

  private _consumeExpansionCaseStart() {
    this._requireCharCode($EQ);

    this._beginToken(HtmlTokenType.EXPANSION_CASE_VALUE, this._getLocation());
    let value = this._readUntil($LBRACE).trim();
    this._endToken([value], this._getLocation());
    this._attemptCharCodeUntilFn(isNotWhitespace);

    this._beginToken(HtmlTokenType.EXPANSION_CASE_EXP_START, this._getLocation());
    this._requireCharCode($LBRACE);
    this._endToken([], this._getLocation());
    this._attemptCharCodeUntilFn(isNotWhitespace);

    this.expansionCaseStack.push(HtmlTokenType.EXPANSION_CASE_EXP_START);
  }

  private _consumeExpansionCaseEnd() {
    this._beginToken(HtmlTokenType.EXPANSION_CASE_EXP_END, this._getLocation());
    this._requireCharCode($RBRACE);
    this._endToken([], this._getLocation());
    this._attemptCharCodeUntilFn(isNotWhitespace);

    this.expansionCaseStack.pop();
  }

  private _consumeExpansionFormEnd() {
    this._beginToken(HtmlTokenType.EXPANSION_FORM_END, this._getLocation());
    this._requireCharCode($RBRACE);
    this._endToken([]);

    this.expansionCaseStack.pop();
  }

  private _consumeText() {
    var start = this._getLocation();
    this._beginToken(HtmlTokenType.TEXT, start);

    var parts = [];
    let interpolation = false;

    if (this.peek === $LBRACE && this.nextPeek === $LBRACE) {
      parts.push(this._readChar(true));
      parts.push(this._readChar(true));
      interpolation = true;
    } else {
      parts.push(this._readChar(true));
    }

    while (!this.isTextEnd(interpolation)) {
      if (this.peek === $LBRACE && this.nextPeek === $LBRACE) {
        parts.push(this._readChar(true));
        parts.push(this._readChar(true));
        interpolation = true;
      } else if (this.peek === $RBRACE && this.nextPeek === $RBRACE && interpolation) {
        parts.push(this._readChar(true));
        parts.push(this._readChar(true));
        interpolation = false;
      } else {
        parts.push(this._readChar(true));
      }
    }
    this._endToken([this._processCarriageReturns(parts.join(''))]);
  }

  private isTextEnd(interpolation: boolean): boolean {
    if (this.peek === $LT || this.peek === $EOF) return true;
    if (this.tokenizeExpansionForms) {
      if (isSpecialFormStart(this.peek, this.nextPeek)) return true;
      if (this.peek === $RBRACE && !interpolation &&
          (this.isInExpansionCase() || this.isInExpansionForm()))
        return true;
    }
    return false;
  }

  private _savePosition(): number[] {
    return [this.peek, this.index, this.column, this.line, this.tokens.length];
  }

  private _readUntil(char: number): string {
    let start = this.index;
    this._attemptUntilChar(char);
    return this.input.substring(start, this.index);
  }

  private _restorePosition(position: number[]): void {
    this.peek = position[0];
    this.index = position[1];
    this.column = position[2];
    this.line = position[3];
    let nbTokens = position[4];
    if (nbTokens < this.tokens.length) {
      // remove any extra tokens
      this.tokens = ListWrapper.slice(this.tokens, 0, nbTokens);
    }
  }

  private isInExpansionCase(): boolean {
    return this.expansionCaseStack.length > 0 &&
           this.expansionCaseStack[this.expansionCaseStack.length - 1] ===
               HtmlTokenType.EXPANSION_CASE_EXP_START;
  }

  private isInExpansionForm(): boolean {
    return this.expansionCaseStack.length > 0 &&
           this.expansionCaseStack[this.expansionCaseStack.length - 1] ===
               HtmlTokenType.EXPANSION_FORM_START;
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

function isSpecialFormStart(peek: number, nextPeek: number): boolean {
  return peek === $LBRACE && nextPeek != $LBRACE;
}

function isAsciiLetter(code: number): boolean {
  return code >= $a && code <= $z || code >= $A && code <= $Z;
}

function isAsciiHexDigit(code: number): boolean {
  return code >= $a && code <= $f || code >= $A && code <= $F || code >= $0 && code <= $9;
}

function compareCharCodeCaseInsensitive(code1: number, code2: number): boolean {
  return toUpperCaseCharCode(code1) == toUpperCaseCharCode(code2);
}

function toUpperCaseCharCode(code: number): number {
  return code >= $a && code <= $z ? code - $a + $A : code;
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
