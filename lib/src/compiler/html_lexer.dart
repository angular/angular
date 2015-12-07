library angular2.src.compiler.html_lexer;

import "package:angular2/src/facade/lang.dart"
    show StringWrapper, NumberWrapper, isPresent, isBlank, serializeEnum;
import "parse_util.dart"
    show ParseLocation, ParseError, ParseSourceFile, ParseSourceSpan;
import "html_tags.dart"
    show getHtmlTagDefinition, HtmlTagContentType, NAMED_ENTITIES;

enum HtmlTokenType {
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

class HtmlToken {
  HtmlTokenType type;
  List<String> parts;
  ParseSourceSpan sourceSpan;
  HtmlToken(this.type, this.parts, this.sourceSpan) {}
}

class HtmlTokenError extends ParseError {
  HtmlTokenType tokenType;
  HtmlTokenError(String errorMsg, this.tokenType, ParseLocation location)
      : super(location, errorMsg) {
    /* super call moved to initializer */;
  }
}

class HtmlTokenizeResult {
  List<HtmlToken> tokens;
  List<HtmlTokenError> errors;
  HtmlTokenizeResult(this.tokens, this.errors) {}
}

HtmlTokenizeResult tokenizeHtml(String sourceContent, String sourceUrl) {
  return new _HtmlTokenizer(new ParseSourceFile(sourceContent, sourceUrl))
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
const $A = 65;
const $Z = 90;
const $LBRACKET = 91;
const $RBRACKET = 93;
const $a = 97;
const $f = 102;
const $z = 122;
const $x = 120;
const $NBSP = 160;
var CRLF_REGEXP = new RegExp(r'\r\n');
var CR_REGEXP = new RegExp(r'\r');
String unexpectedCharacterErrorMsg(num charCode) {
  var char =
      identical(charCode, $EOF) ? "EOF" : StringWrapper.fromCharCode(charCode);
  return '''Unexpected character "${ char}"''';
}

String unknownEntityErrorMsg(String entitySrc) {
  return '''Unknown entity "${ entitySrc}" - use the "&#<decimal>;" or  "&#x<hex>;" syntax''';
}

class ControlFlowError {
  HtmlTokenError error;
  ControlFlowError(this.error) {}
}

// See http://www.w3.org/TR/html51/syntax.html#writing
class _HtmlTokenizer {
  ParseSourceFile file;
  String input;
  String inputLowercase;
  num length;
  // Note: this is always lowercase!
  num peek = -1;
  num index = -1;
  num line = 0;
  num column = -1;
  ParseLocation currentTokenStart;
  HtmlTokenType currentTokenType;
  List<HtmlToken> tokens = [];
  List<HtmlTokenError> errors = [];
  _HtmlTokenizer(this.file) {
    this.input = file.content;
    this.inputLowercase = file.content.toLowerCase();
    this.length = file.content.length;
    this._advance();
  }
  String _processCarriageReturns(String content) {
    // http://www.w3.org/TR/html5/syntax.html#preprocessing-the-input-stream

    // In order to keep the original position in the source, we can not pre-process it.

    // Instead CRs are processed right before instantiating the tokens.
    content = StringWrapper.replaceAll(content, CRLF_REGEXP, "\r");
    return StringWrapper.replaceAll(content, CR_REGEXP, "\n");
  }

  HtmlTokenizeResult tokenize() {
    while (!identical(this.peek, $EOF)) {
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
        } else {
          this._consumeText();
        }
      } catch (e, e_stack) {
        if (e is ControlFlowError) {
          this.errors.add(e.error);
        } else {
          rethrow;
        }
      }
    }
    this._beginToken(HtmlTokenType.EOF);
    this._endToken([]);
    return new HtmlTokenizeResult(this.tokens, this.errors);
  }

  ParseLocation _getLocation() {
    return new ParseLocation(this.file, this.index, this.line, this.column);
  }

  _beginToken(HtmlTokenType type, [ParseLocation start = null]) {
    if (isBlank(start)) {
      start = this._getLocation();
    }
    this.currentTokenStart = start;
    this.currentTokenType = type;
  }

  HtmlToken _endToken(List<String> parts, [ParseLocation end = null]) {
    if (isBlank(end)) {
      end = this._getLocation();
    }
    var token = new HtmlToken(this.currentTokenType, parts,
        new ParseSourceSpan(this.currentTokenStart, end));
    this.tokens.add(token);
    this.currentTokenStart = null;
    this.currentTokenType = null;
    return token;
  }

  ControlFlowError _createError(String msg, ParseLocation position) {
    var error = new HtmlTokenError(msg, this.currentTokenType, position);
    this.currentTokenStart = null;
    this.currentTokenType = null;
    return new ControlFlowError(error);
  }

  _advance() {
    if (this.index >= this.length) {
      throw this
          ._createError(unexpectedCharacterErrorMsg($EOF), this._getLocation());
    }
    if (identical(this.peek, $LF)) {
      this.line++;
      this.column = 0;
    } else if (!identical(this.peek, $LF) && !identical(this.peek, $CR)) {
      this.column++;
    }
    this.index++;
    this.peek = this.index >= this.length
        ? $EOF
        : StringWrapper.charCodeAt(this.inputLowercase, this.index);
  }

  bool _attemptChar(num charCode) {
    if (identical(this.peek, charCode)) {
      this._advance();
      return true;
    }
    return false;
  }

  _requireChar(num charCode) {
    var location = this._getLocation();
    if (!this._attemptChar(charCode)) {
      throw this._createError(unexpectedCharacterErrorMsg(this.peek), location);
    }
  }

  bool _attemptChars(String chars) {
    for (var i = 0; i < chars.length; i++) {
      if (!this._attemptChar(StringWrapper.charCodeAt(chars, i))) {
        return false;
      }
    }
    return true;
  }

  _requireChars(String chars) {
    var location = this._getLocation();
    if (!this._attemptChars(chars)) {
      throw this._createError(unexpectedCharacterErrorMsg(this.peek), location);
    }
  }

  _attemptUntilFn(Function predicate) {
    while (!predicate(this.peek)) {
      this._advance();
    }
  }

  _requireUntilFn(Function predicate, num len) {
    var start = this._getLocation();
    this._attemptUntilFn(predicate);
    if (this.index - start.offset < len) {
      throw this._createError(unexpectedCharacterErrorMsg(this.peek), start);
    }
  }

  _attemptUntilChar(num char) {
    while (!identical(this.peek, char)) {
      this._advance();
    }
  }

  String _readChar(bool decodeEntities) {
    if (decodeEntities && identical(this.peek, $AMPERSAND)) {
      return this._decodeEntity();
    } else {
      var index = this.index;
      this._advance();
      return this.input[index];
    }
  }

  String _decodeEntity() {
    var start = this._getLocation();
    this._advance();
    if (this._attemptChar($HASH)) {
      var isHex = this._attemptChar($x);
      var numberStart = this._getLocation().offset;
      this._attemptUntilFn(isDigitEntityEnd);
      if (this.peek != $SEMICOLON) {
        throw this._createError(
            unexpectedCharacterErrorMsg(this.peek), this._getLocation());
      }
      this._advance();
      var strNum = this.input.substring(numberStart, this.index - 1);
      try {
        var charCode = NumberWrapper.parseInt(strNum, isHex ? 16 : 10);
        return StringWrapper.fromCharCode(charCode);
      } catch (e, e_stack) {
        var entity = this.input.substring(start.offset + 1, this.index - 1);
        throw this._createError(unknownEntityErrorMsg(entity), start);
      }
    } else {
      var startPosition = this._savePosition();
      this._attemptUntilFn(isNamedEntityEnd);
      if (this.peek != $SEMICOLON) {
        this._restorePosition(startPosition);
        return "&";
      }
      this._advance();
      var name = this.input.substring(start.offset + 1, this.index - 1);
      var char = NAMED_ENTITIES[name];
      if (isBlank(char)) {
        throw this._createError(unknownEntityErrorMsg(name), start);
      }
      return char;
    }
  }

  HtmlToken _consumeRawText(
      bool decodeEntities, num firstCharOfEnd, Function attemptEndRest) {
    var tagCloseStart;
    var textStart = this._getLocation();
    this._beginToken(
        decodeEntities
            ? HtmlTokenType.ESCAPABLE_RAW_TEXT
            : HtmlTokenType.RAW_TEXT,
        textStart);
    var parts = [];
    while (true) {
      tagCloseStart = this._getLocation();
      if (this._attemptChar(firstCharOfEnd) && attemptEndRest()) {
        break;
      }
      if (this.index > tagCloseStart.offset) {
        parts.add(this.input.substring(tagCloseStart.offset, this.index));
      }
      while (!identical(this.peek, firstCharOfEnd)) {
        parts.add(this._readChar(decodeEntities));
      }
    }
    return this._endToken(
        [this._processCarriageReturns(parts.join(""))], tagCloseStart);
  }

  _consumeComment(ParseLocation start) {
    this._beginToken(HtmlTokenType.COMMENT_START, start);
    this._requireChar($MINUS);
    this._endToken([]);
    var textToken =
        this._consumeRawText(false, $MINUS, () => this._attemptChars("->"));
    this._beginToken(HtmlTokenType.COMMENT_END, textToken.sourceSpan.end);
    this._endToken([]);
  }

  _consumeCdata(ParseLocation start) {
    this._beginToken(HtmlTokenType.CDATA_START, start);
    this._requireChars("cdata[");
    this._endToken([]);
    var textToken =
        this._consumeRawText(false, $RBRACKET, () => this._attemptChars("]>"));
    this._beginToken(HtmlTokenType.CDATA_END, textToken.sourceSpan.end);
    this._endToken([]);
  }

  _consumeDocType(ParseLocation start) {
    this._beginToken(HtmlTokenType.DOC_TYPE, start);
    this._attemptUntilChar($GT);
    this._advance();
    this._endToken([this.input.substring(start.offset + 2, this.index - 1)]);
  }

  List<String> _consumePrefixAndName() {
    var nameOrPrefixStart = this.index;
    var prefix = null;
    while (!identical(this.peek, $COLON) && !isPrefixEnd(this.peek)) {
      this._advance();
    }
    var nameStart;
    if (identical(this.peek, $COLON)) {
      this._advance();
      prefix = this.input.substring(nameOrPrefixStart, this.index - 1);
      nameStart = this.index;
    } else {
      nameStart = nameOrPrefixStart;
    }
    this._requireUntilFn(isNameEnd, identical(this.index, nameStart) ? 1 : 0);
    var name = this.input.substring(nameStart, this.index);
    return [prefix, name];
  }

  _consumeTagOpen(ParseLocation start) {
    this._attemptUntilFn(isNotWhitespace);
    var nameStart = this.index;
    this._consumeTagOpenStart(start);
    var lowercaseTagName = this.inputLowercase.substring(nameStart, this.index);
    this._attemptUntilFn(isNotWhitespace);
    while (!identical(this.peek, $SLASH) && !identical(this.peek, $GT)) {
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
    if (identical(contentTokenType, HtmlTagContentType.RAW_TEXT)) {
      this._consumeRawTextWithTagClose(lowercaseTagName, false);
    } else if (identical(
        contentTokenType, HtmlTagContentType.ESCAPABLE_RAW_TEXT)) {
      this._consumeRawTextWithTagClose(lowercaseTagName, true);
    }
  }

  _consumeRawTextWithTagClose(String lowercaseTagName, bool decodeEntities) {
    var textToken = this._consumeRawText(decodeEntities, $LT, () {
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

  _consumeTagOpenStart(ParseLocation start) {
    this._beginToken(HtmlTokenType.TAG_OPEN_START, start);
    var parts = this._consumePrefixAndName();
    this._endToken(parts);
  }

  _consumeAttributeName() {
    this._beginToken(HtmlTokenType.ATTR_NAME);
    var prefixAndName = this._consumePrefixAndName();
    this._endToken(prefixAndName);
  }

  _consumeAttributeValue() {
    this._beginToken(HtmlTokenType.ATTR_VALUE);
    var value;
    if (identical(this.peek, $SQ) || identical(this.peek, $DQ)) {
      var quoteChar = this.peek;
      this._advance();
      var parts = [];
      while (!identical(this.peek, quoteChar)) {
        parts.add(this._readChar(true));
      }
      value = parts.join("");
      this._advance();
    } else {
      var valueStart = this.index;
      this._requireUntilFn(isNameEnd, 1);
      value = this.input.substring(valueStart, this.index);
    }
    this._endToken([this._processCarriageReturns(value)]);
  }

  _consumeTagOpenEnd() {
    var tokenType = this._attemptChar($SLASH)
        ? HtmlTokenType.TAG_OPEN_END_VOID
        : HtmlTokenType.TAG_OPEN_END;
    this._beginToken(tokenType);
    this._requireChar($GT);
    this._endToken([]);
  }

  _consumeTagClose(ParseLocation start) {
    this._beginToken(HtmlTokenType.TAG_CLOSE, start);
    this._attemptUntilFn(isNotWhitespace);
    var prefixAndName;
    prefixAndName = this._consumePrefixAndName();
    this._attemptUntilFn(isNotWhitespace);
    this._requireChar($GT);
    this._endToken(prefixAndName);
  }

  _consumeText() {
    var start = this._getLocation();
    this._beginToken(HtmlTokenType.TEXT, start);
    var parts = [this._readChar(true)];
    while (!isTextEnd(this.peek)) {
      parts.add(this._readChar(true));
    }
    this._endToken([this._processCarriageReturns(parts.join(""))]);
  }

  List<num> _savePosition() {
    return [this.peek, this.index, this.column, this.line];
  }

  void _restorePosition(List<num> position) {
    this.peek = position[0];
    this.index = position[1];
    this.column = position[2];
    this.line = position[3];
  }
}

bool isNotWhitespace(num code) {
  return !isWhitespace(code) || identical(code, $EOF);
}

bool isWhitespace(num code) {
  return (code >= $TAB && code <= $SPACE) || (identical(code, $NBSP));
}

bool isNameEnd(num code) {
  return isWhitespace(code) ||
      identical(code, $GT) ||
      identical(code, $SLASH) ||
      identical(code, $SQ) ||
      identical(code, $DQ) ||
      identical(code, $EQ);
}

bool isPrefixEnd(num code) {
  return (code < $a || $z < code) &&
      (code < $A || $Z < code) &&
      (code < $0 || code > $9);
}

bool isDigitEntityEnd(num code) {
  return code == $SEMICOLON || code == $EOF || !isAsciiHexDigit(code);
}

bool isNamedEntityEnd(num code) {
  return code == $SEMICOLON || code == $EOF || !isAsciiLetter(code);
}

bool isTextEnd(num code) {
  return identical(code, $LT) || identical(code, $EOF);
}

bool isAsciiLetter(num code) {
  return code >= $a && code <= $z;
}

bool isAsciiHexDigit(num code) {
  return code >= $a && code <= $f || code >= $0 && code <= $9;
}
