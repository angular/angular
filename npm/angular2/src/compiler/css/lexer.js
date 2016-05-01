'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require("angular2/src/facade/lang");
var exceptions_1 = require('angular2/src/facade/exceptions');
var chars_1 = require("angular2/src/compiler/chars");
var chars_2 = require("angular2/src/compiler/chars");
exports.$EOF = chars_2.$EOF;
exports.$AT = chars_2.$AT;
exports.$RBRACE = chars_2.$RBRACE;
exports.$LBRACE = chars_2.$LBRACE;
exports.$LBRACKET = chars_2.$LBRACKET;
exports.$RBRACKET = chars_2.$RBRACKET;
exports.$LPAREN = chars_2.$LPAREN;
exports.$RPAREN = chars_2.$RPAREN;
exports.$COMMA = chars_2.$COMMA;
exports.$COLON = chars_2.$COLON;
exports.$SEMICOLON = chars_2.$SEMICOLON;
exports.isWhitespace = chars_2.isWhitespace;
(function (CssTokenType) {
    CssTokenType[CssTokenType["EOF"] = 0] = "EOF";
    CssTokenType[CssTokenType["String"] = 1] = "String";
    CssTokenType[CssTokenType["Comment"] = 2] = "Comment";
    CssTokenType[CssTokenType["Identifier"] = 3] = "Identifier";
    CssTokenType[CssTokenType["Number"] = 4] = "Number";
    CssTokenType[CssTokenType["IdentifierOrNumber"] = 5] = "IdentifierOrNumber";
    CssTokenType[CssTokenType["AtKeyword"] = 6] = "AtKeyword";
    CssTokenType[CssTokenType["Character"] = 7] = "Character";
    CssTokenType[CssTokenType["Whitespace"] = 8] = "Whitespace";
    CssTokenType[CssTokenType["Invalid"] = 9] = "Invalid";
})(exports.CssTokenType || (exports.CssTokenType = {}));
var CssTokenType = exports.CssTokenType;
(function (CssLexerMode) {
    CssLexerMode[CssLexerMode["ALL"] = 0] = "ALL";
    CssLexerMode[CssLexerMode["ALL_TRACK_WS"] = 1] = "ALL_TRACK_WS";
    CssLexerMode[CssLexerMode["SELECTOR"] = 2] = "SELECTOR";
    CssLexerMode[CssLexerMode["PSEUDO_SELECTOR"] = 3] = "PSEUDO_SELECTOR";
    CssLexerMode[CssLexerMode["ATTRIBUTE_SELECTOR"] = 4] = "ATTRIBUTE_SELECTOR";
    CssLexerMode[CssLexerMode["AT_RULE_QUERY"] = 5] = "AT_RULE_QUERY";
    CssLexerMode[CssLexerMode["MEDIA_QUERY"] = 6] = "MEDIA_QUERY";
    CssLexerMode[CssLexerMode["BLOCK"] = 7] = "BLOCK";
    CssLexerMode[CssLexerMode["KEYFRAME_BLOCK"] = 8] = "KEYFRAME_BLOCK";
    CssLexerMode[CssLexerMode["STYLE_BLOCK"] = 9] = "STYLE_BLOCK";
    CssLexerMode[CssLexerMode["STYLE_VALUE"] = 10] = "STYLE_VALUE";
    CssLexerMode[CssLexerMode["STYLE_VALUE_FUNCTION"] = 11] = "STYLE_VALUE_FUNCTION";
    CssLexerMode[CssLexerMode["STYLE_CALC_FUNCTION"] = 12] = "STYLE_CALC_FUNCTION";
})(exports.CssLexerMode || (exports.CssLexerMode = {}));
var CssLexerMode = exports.CssLexerMode;
var LexedCssResult = (function () {
    function LexedCssResult(error, token) {
        this.error = error;
        this.token = token;
    }
    return LexedCssResult;
}());
exports.LexedCssResult = LexedCssResult;
function generateErrorMessage(input, message, errorValue, index, row, column) {
    return (message + " at column " + row + ":" + column + " in expression [") +
        findProblemCode(input, errorValue, index, column) + ']';
}
exports.generateErrorMessage = generateErrorMessage;
function findProblemCode(input, errorValue, index, column) {
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
exports.findProblemCode = findProblemCode;
var CssToken = (function () {
    function CssToken(index, column, line, type, strValue) {
        this.index = index;
        this.column = column;
        this.line = line;
        this.type = type;
        this.strValue = strValue;
        this.numValue = charCode(strValue, 0);
    }
    return CssToken;
}());
exports.CssToken = CssToken;
var CssLexer = (function () {
    function CssLexer() {
    }
    CssLexer.prototype.scan = function (text, trackComments) {
        if (trackComments === void 0) { trackComments = false; }
        return new CssScanner(text, trackComments);
    };
    return CssLexer;
}());
exports.CssLexer = CssLexer;
var CssScannerError = (function (_super) {
    __extends(CssScannerError, _super);
    function CssScannerError(token, message) {
        _super.call(this, 'Css Parse Error: ' + message);
        this.token = token;
        this.rawMessage = message;
    }
    CssScannerError.prototype.toString = function () { return this.message; };
    return CssScannerError;
}(exceptions_1.BaseException));
exports.CssScannerError = CssScannerError;
function _trackWhitespace(mode) {
    switch (mode) {
        case CssLexerMode.SELECTOR:
        case CssLexerMode.ALL_TRACK_WS:
        case CssLexerMode.STYLE_VALUE:
            return true;
        default:
            return false;
    }
}
var CssScanner = (function () {
    function CssScanner(input, _trackComments) {
        if (_trackComments === void 0) { _trackComments = false; }
        this.input = input;
        this._trackComments = _trackComments;
        this.length = 0;
        this.index = -1;
        this.column = -1;
        this.line = 0;
        /** @internal */
        this._currentMode = CssLexerMode.BLOCK;
        /** @internal */
        this._currentError = null;
        this.length = this.input.length;
        this.peekPeek = this.peekAt(0);
        this.advance();
    }
    CssScanner.prototype.getMode = function () { return this._currentMode; };
    CssScanner.prototype.setMode = function (mode) {
        if (this._currentMode != mode) {
            if (_trackWhitespace(this._currentMode)) {
                this.consumeWhitespace();
            }
            this._currentMode = mode;
        }
    };
    CssScanner.prototype.advance = function () {
        if (isNewline(this.peek)) {
            this.column = 0;
            this.line++;
        }
        else {
            this.column++;
        }
        this.index++;
        this.peek = this.peekPeek;
        this.peekPeek = this.peekAt(this.index + 1);
    };
    CssScanner.prototype.peekAt = function (index) {
        return index >= this.length ? chars_1.$EOF : lang_1.StringWrapper.charCodeAt(this.input, index);
    };
    CssScanner.prototype.consumeEmptyStatements = function () {
        this.consumeWhitespace();
        while (this.peek == chars_1.$SEMICOLON) {
            this.advance();
            this.consumeWhitespace();
        }
    };
    CssScanner.prototype.consumeWhitespace = function () {
        while (chars_1.isWhitespace(this.peek) || isNewline(this.peek)) {
            this.advance();
            if (!this._trackComments && isCommentStart(this.peek, this.peekPeek)) {
                this.advance(); // /
                this.advance(); // *
                while (!isCommentEnd(this.peek, this.peekPeek)) {
                    if (this.peek == chars_1.$EOF) {
                        this.error('Unterminated comment');
                    }
                    this.advance();
                }
                this.advance(); // *
                this.advance(); // /
            }
        }
    };
    CssScanner.prototype.consume = function (type, value) {
        if (value === void 0) { value = null; }
        var mode = this._currentMode;
        this.setMode(CssLexerMode.ALL);
        var previousIndex = this.index;
        var previousLine = this.line;
        var previousColumn = this.column;
        var output = this.scan();
        // just incase the inner scan method returned an error
        if (lang_1.isPresent(output.error)) {
            this.setMode(mode);
            return output;
        }
        var next = output.token;
        if (!lang_1.isPresent(next)) {
            next = new CssToken(0, 0, 0, CssTokenType.EOF, "end of file");
        }
        var isMatchingType;
        if (type == CssTokenType.IdentifierOrNumber) {
            // TODO (matsko): implement array traversal for lookup here
            isMatchingType = next.type == CssTokenType.Number || next.type == CssTokenType.Identifier;
        }
        else {
            isMatchingType = next.type == type;
        }
        // before throwing the error we need to bring back the former
        // mode so that the parser can recover...
        this.setMode(mode);
        var error = null;
        if (!isMatchingType || (lang_1.isPresent(value) && value != next.strValue)) {
            var errorMessage = lang_1.resolveEnumToken(CssTokenType, next.type) + " does not match expected " +
                lang_1.resolveEnumToken(CssTokenType, type) + " value";
            if (lang_1.isPresent(value)) {
                errorMessage += ' ("' + next.strValue + '" should match "' + value + '")';
            }
            error = new CssScannerError(next, generateErrorMessage(this.input, errorMessage, next.strValue, previousIndex, previousLine, previousColumn));
        }
        return new LexedCssResult(error, next);
    };
    CssScanner.prototype.scan = function () {
        var trackWS = _trackWhitespace(this._currentMode);
        if (this.index == 0 && !trackWS) {
            this.consumeWhitespace();
        }
        var token = this._scan();
        if (token == null)
            return null;
        var error = this._currentError;
        this._currentError = null;
        if (!trackWS) {
            this.consumeWhitespace();
        }
        return new LexedCssResult(error, token);
    };
    /** @internal */
    CssScanner.prototype._scan = function () {
        var peek = this.peek;
        var peekPeek = this.peekPeek;
        if (peek == chars_1.$EOF)
            return null;
        if (isCommentStart(peek, peekPeek)) {
            // even if comments are not tracked we still lex the
            // comment so we can move the pointer forward
            var commentToken = this.scanComment();
            if (this._trackComments) {
                return commentToken;
            }
        }
        if (_trackWhitespace(this._currentMode) && (chars_1.isWhitespace(peek) || isNewline(peek))) {
            return this.scanWhitespace();
        }
        peek = this.peek;
        peekPeek = this.peekPeek;
        if (peek == chars_1.$EOF)
            return null;
        if (isStringStart(peek, peekPeek)) {
            return this.scanString();
        }
        // something like url(cool)
        if (this._currentMode == CssLexerMode.STYLE_VALUE_FUNCTION) {
            return this.scanCssValueFunction();
        }
        var isModifier = peek == chars_1.$PLUS || peek == chars_1.$MINUS;
        var digitA = isModifier ? false : isDigit(peek);
        var digitB = isDigit(peekPeek);
        if (digitA || (isModifier && (peekPeek == chars_1.$PERIOD || digitB)) || (peek == chars_1.$PERIOD && digitB)) {
            return this.scanNumber();
        }
        if (peek == chars_1.$AT) {
            return this.scanAtExpression();
        }
        if (isIdentifierStart(peek, peekPeek)) {
            return this.scanIdentifier();
        }
        if (isValidCssCharacter(peek, this._currentMode)) {
            return this.scanCharacter();
        }
        return this.error("Unexpected character [" + lang_1.StringWrapper.fromCharCode(peek) + "]");
    };
    CssScanner.prototype.scanComment = function () {
        if (this.assertCondition(isCommentStart(this.peek, this.peekPeek), "Expected comment start value")) {
            return null;
        }
        var start = this.index;
        var startingColumn = this.column;
        var startingLine = this.line;
        this.advance(); // /
        this.advance(); // *
        while (!isCommentEnd(this.peek, this.peekPeek)) {
            if (this.peek == chars_1.$EOF) {
                this.error('Unterminated comment');
            }
            this.advance();
        }
        this.advance(); // *
        this.advance(); // /
        var str = this.input.substring(start, this.index);
        return new CssToken(start, startingColumn, startingLine, CssTokenType.Comment, str);
    };
    CssScanner.prototype.scanWhitespace = function () {
        var start = this.index;
        var startingColumn = this.column;
        var startingLine = this.line;
        while (chars_1.isWhitespace(this.peek) && this.peek != chars_1.$EOF) {
            this.advance();
        }
        var str = this.input.substring(start, this.index);
        return new CssToken(start, startingColumn, startingLine, CssTokenType.Whitespace, str);
    };
    CssScanner.prototype.scanString = function () {
        if (this.assertCondition(isStringStart(this.peek, this.peekPeek), "Unexpected non-string starting value")) {
            return null;
        }
        var target = this.peek;
        var start = this.index;
        var startingColumn = this.column;
        var startingLine = this.line;
        var previous = target;
        this.advance();
        while (!isCharMatch(target, previous, this.peek)) {
            if (this.peek == chars_1.$EOF || isNewline(this.peek)) {
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
    };
    CssScanner.prototype.scanNumber = function () {
        var start = this.index;
        var startingColumn = this.column;
        if (this.peek == chars_1.$PLUS || this.peek == chars_1.$MINUS) {
            this.advance();
        }
        var periodUsed = false;
        while (isDigit(this.peek) || this.peek == chars_1.$PERIOD) {
            if (this.peek == chars_1.$PERIOD) {
                if (periodUsed) {
                    this.error('Unexpected use of a second period value');
                }
                periodUsed = true;
            }
            this.advance();
        }
        var strValue = this.input.substring(start, this.index);
        return new CssToken(start, startingColumn, this.line, CssTokenType.Number, strValue);
    };
    CssScanner.prototype.scanIdentifier = function () {
        if (this.assertCondition(isIdentifierStart(this.peek, this.peekPeek), 'Expected identifier starting value')) {
            return null;
        }
        var start = this.index;
        var startingColumn = this.column;
        while (isIdentifierPart(this.peek)) {
            this.advance();
        }
        var strValue = this.input.substring(start, this.index);
        return new CssToken(start, startingColumn, this.line, CssTokenType.Identifier, strValue);
    };
    CssScanner.prototype.scanCssValueFunction = function () {
        var start = this.index;
        var startingColumn = this.column;
        while (this.peek != chars_1.$EOF && this.peek != chars_1.$RPAREN) {
            this.advance();
        }
        var strValue = this.input.substring(start, this.index);
        return new CssToken(start, startingColumn, this.line, CssTokenType.Identifier, strValue);
    };
    CssScanner.prototype.scanCharacter = function () {
        var start = this.index;
        var startingColumn = this.column;
        if (this.assertCondition(isValidCssCharacter(this.peek, this._currentMode), charStr(this.peek) + ' is not a valid CSS character')) {
            return null;
        }
        var c = this.input.substring(start, start + 1);
        this.advance();
        return new CssToken(start, startingColumn, this.line, CssTokenType.Character, c);
    };
    CssScanner.prototype.scanAtExpression = function () {
        if (this.assertCondition(this.peek == chars_1.$AT, 'Expected @ value')) {
            return null;
        }
        var start = this.index;
        var startingColumn = this.column;
        this.advance();
        if (isIdentifierStart(this.peek, this.peekPeek)) {
            var ident = this.scanIdentifier();
            var strValue = '@' + ident.strValue;
            return new CssToken(start, startingColumn, this.line, CssTokenType.AtKeyword, strValue);
        }
        else {
            return this.scanCharacter();
        }
    };
    CssScanner.prototype.assertCondition = function (status, errorMessage) {
        if (!status) {
            this.error(errorMessage);
            return true;
        }
        return false;
    };
    CssScanner.prototype.error = function (message, errorTokenValue, doNotAdvance) {
        if (errorTokenValue === void 0) { errorTokenValue = null; }
        if (doNotAdvance === void 0) { doNotAdvance = false; }
        var index = this.index;
        var column = this.column;
        var line = this.line;
        errorTokenValue =
            lang_1.isPresent(errorTokenValue) ? errorTokenValue : lang_1.StringWrapper.fromCharCode(this.peek);
        var invalidToken = new CssToken(index, column, line, CssTokenType.Invalid, errorTokenValue);
        var errorMessage = generateErrorMessage(this.input, message, errorTokenValue, index, line, column);
        if (!doNotAdvance) {
            this.advance();
        }
        this._currentError = new CssScannerError(invalidToken, errorMessage);
        return invalidToken;
    };
    return CssScanner;
}());
exports.CssScanner = CssScanner;
function isAtKeyword(current, next) {
    return current.numValue == chars_1.$AT && next.type == CssTokenType.Identifier;
}
function isCharMatch(target, previous, code) {
    return code == target && previous != chars_1.$BACKSLASH;
}
function isDigit(code) {
    return chars_1.$0 <= code && code <= chars_1.$9;
}
function isCommentStart(code, next) {
    return code == chars_1.$SLASH && next == chars_1.$STAR;
}
function isCommentEnd(code, next) {
    return code == chars_1.$STAR && next == chars_1.$SLASH;
}
function isStringStart(code, next) {
    var target = code;
    if (target == chars_1.$BACKSLASH) {
        target = next;
    }
    return target == chars_1.$DQ || target == chars_1.$SQ;
}
function isIdentifierStart(code, next) {
    var target = code;
    if (target == chars_1.$MINUS) {
        target = next;
    }
    return (chars_1.$a <= target && target <= chars_1.$z) || (chars_1.$A <= target && target <= chars_1.$Z) || target == chars_1.$BACKSLASH ||
        target == chars_1.$MINUS || target == chars_1.$_;
}
function isIdentifierPart(target) {
    return (chars_1.$a <= target && target <= chars_1.$z) || (chars_1.$A <= target && target <= chars_1.$Z) || target == chars_1.$BACKSLASH ||
        target == chars_1.$MINUS || target == chars_1.$_ || isDigit(target);
}
function isValidPseudoSelectorCharacter(code) {
    switch (code) {
        case chars_1.$LPAREN:
        case chars_1.$RPAREN:
            return true;
        default:
            return false;
    }
}
function isValidKeyframeBlockCharacter(code) {
    return code == chars_1.$PERCENT;
}
function isValidAttributeSelectorCharacter(code) {
    // value^*|$~=something
    switch (code) {
        case chars_1.$$:
        case chars_1.$PIPE:
        case chars_1.$CARET:
        case chars_1.$TILDA:
        case chars_1.$STAR:
        case chars_1.$EQ:
            return true;
        default:
            return false;
    }
}
function isValidSelectorCharacter(code) {
    // selector [ key   = value ]
    // IDENT    C IDENT C IDENT C
    // #id, .class, *+~>
    // tag:PSEUDO
    switch (code) {
        case chars_1.$HASH:
        case chars_1.$PERIOD:
        case chars_1.$TILDA:
        case chars_1.$STAR:
        case chars_1.$PLUS:
        case chars_1.$GT:
        case chars_1.$COLON:
        case chars_1.$PIPE:
        case chars_1.$COMMA:
            return true;
        default:
            return false;
    }
}
function isValidStyleBlockCharacter(code) {
    // key:value;
    // key:calc(something ... )
    switch (code) {
        case chars_1.$HASH:
        case chars_1.$SEMICOLON:
        case chars_1.$COLON:
        case chars_1.$PERCENT:
        case chars_1.$SLASH:
        case chars_1.$BACKSLASH:
        case chars_1.$BANG:
        case chars_1.$PERIOD:
        case chars_1.$LPAREN:
        case chars_1.$RPAREN:
            return true;
        default:
            return false;
    }
}
function isValidMediaQueryRuleCharacter(code) {
    // (min-width: 7.5em) and (orientation: landscape)
    switch (code) {
        case chars_1.$LPAREN:
        case chars_1.$RPAREN:
        case chars_1.$COLON:
        case chars_1.$PERCENT:
        case chars_1.$PERIOD:
            return true;
        default:
            return false;
    }
}
function isValidAtRuleCharacter(code) {
    // @document url(http://www.w3.org/page?something=on#hash),
    switch (code) {
        case chars_1.$LPAREN:
        case chars_1.$RPAREN:
        case chars_1.$COLON:
        case chars_1.$PERCENT:
        case chars_1.$PERIOD:
        case chars_1.$SLASH:
        case chars_1.$BACKSLASH:
        case chars_1.$HASH:
        case chars_1.$EQ:
        case chars_1.$QUESTION:
        case chars_1.$AMPERSAND:
        case chars_1.$STAR:
        case chars_1.$COMMA:
        case chars_1.$MINUS:
        case chars_1.$PLUS:
            return true;
        default:
            return false;
    }
}
function isValidStyleFunctionCharacter(code) {
    switch (code) {
        case chars_1.$PERIOD:
        case chars_1.$MINUS:
        case chars_1.$PLUS:
        case chars_1.$STAR:
        case chars_1.$SLASH:
        case chars_1.$LPAREN:
        case chars_1.$RPAREN:
        case chars_1.$COMMA:
            return true;
        default:
            return false;
    }
}
function isValidBlockCharacter(code) {
    // @something { }
    // IDENT
    return code == chars_1.$AT;
}
function isValidCssCharacter(code, mode) {
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
function charCode(input, index) {
    return index >= input.length ? chars_1.$EOF : lang_1.StringWrapper.charCodeAt(input, index);
}
function charStr(code) {
    return lang_1.StringWrapper.fromCharCode(code);
}
function isNewline(code) {
    switch (code) {
        case chars_1.$FF:
        case chars_1.$CR:
        case chars_1.$LF:
        case chars_1.$VTAB:
            return true;
        default:
            return false;
    }
}
exports.isNewline = isNewline;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvY3NzL2xleGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHFCQUF3RSwwQkFBMEIsQ0FBQyxDQUFBO0FBQ25HLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTdELHNCQTJDTyw2QkFBNkIsQ0FBQyxDQUFBO0FBRXJDLHNCQWFPLDZCQUE2QixDQUFDO0FBWm5DLDRCQUFJO0FBQ0osMEJBQUc7QUFDSCxrQ0FBTztBQUNQLGtDQUFPO0FBQ1Asc0NBQVM7QUFDVCxzQ0FBUztBQUNULGtDQUFPO0FBQ1Asa0NBQU87QUFDUCxnQ0FBTTtBQUNOLGdDQUFNO0FBQ04sd0NBQVU7QUFDViw0Q0FDbUM7QUFFckMsV0FBWSxZQUFZO0lBQ3RCLDZDQUFHLENBQUE7SUFDSCxtREFBTSxDQUFBO0lBQ04scURBQU8sQ0FBQTtJQUNQLDJEQUFVLENBQUE7SUFDVixtREFBTSxDQUFBO0lBQ04sMkVBQWtCLENBQUE7SUFDbEIseURBQVMsQ0FBQTtJQUNULHlEQUFTLENBQUE7SUFDVCwyREFBVSxDQUFBO0lBQ1YscURBQU8sQ0FBQTtBQUNULENBQUMsRUFYVyxvQkFBWSxLQUFaLG9CQUFZLFFBV3ZCO0FBWEQsSUFBWSxZQUFZLEdBQVosb0JBV1gsQ0FBQTtBQUVELFdBQVksWUFBWTtJQUN0Qiw2Q0FBRyxDQUFBO0lBQ0gsK0RBQVksQ0FBQTtJQUNaLHVEQUFRLENBQUE7SUFDUixxRUFBZSxDQUFBO0lBQ2YsMkVBQWtCLENBQUE7SUFDbEIsaUVBQWEsQ0FBQTtJQUNiLDZEQUFXLENBQUE7SUFDWCxpREFBSyxDQUFBO0lBQ0wsbUVBQWMsQ0FBQTtJQUNkLDZEQUFXLENBQUE7SUFDWCw4REFBVyxDQUFBO0lBQ1gsZ0ZBQW9CLENBQUE7SUFDcEIsOEVBQW1CLENBQUE7QUFDckIsQ0FBQyxFQWRXLG9CQUFZLEtBQVosb0JBQVksUUFjdkI7QUFkRCxJQUFZLFlBQVksR0FBWixvQkFjWCxDQUFBO0FBRUQ7SUFDRSx3QkFBbUIsS0FBc0IsRUFBUyxLQUFlO1FBQTlDLFVBQUssR0FBTCxLQUFLLENBQWlCO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBVTtJQUFHLENBQUM7SUFDdkUscUJBQUM7QUFBRCxDQUFDLEFBRkQsSUFFQztBQUZZLHNCQUFjLGlCQUUxQixDQUFBO0FBRUQsOEJBQXFDLEtBQWEsRUFBRSxPQUFlLEVBQUUsVUFBa0IsRUFDbEQsS0FBYSxFQUFFLEdBQVcsRUFBRSxNQUFjO0lBQzdFLE1BQU0sQ0FBQyxDQUFHLE9BQU8sbUJBQWMsR0FBRyxTQUFJLE1BQU0sc0JBQWtCO1FBQ3ZELGVBQWUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDakUsQ0FBQztBQUplLDRCQUFvQix1QkFJbkMsQ0FBQTtBQUVELHlCQUFnQyxLQUFhLEVBQUUsVUFBa0IsRUFBRSxLQUFhLEVBQ2hELE1BQWM7SUFDNUMsSUFBSSxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7SUFDN0IsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNyQyxPQUFPLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUMxQyxPQUFPLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUNELElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDekQsSUFBSSxjQUFjLEdBQUcsRUFBRSxDQUFDO0lBQ3hCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDaEMsY0FBYyxJQUFJLEdBQUcsQ0FBQztJQUN4QixDQUFDO0lBQ0QsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQzNDLGFBQWEsSUFBSSxHQUFHLENBQUM7SUFDdkIsQ0FBQztJQUNELE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLGNBQWMsR0FBRyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQ3RFLENBQUM7QUFqQmUsdUJBQWUsa0JBaUI5QixDQUFBO0FBRUQ7SUFFRSxrQkFBbUIsS0FBYSxFQUFTLE1BQWMsRUFBUyxJQUFZLEVBQ3pELElBQWtCLEVBQVMsUUFBZ0I7UUFEM0MsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUFTLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ3pELFNBQUksR0FBSixJQUFJLENBQWM7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQzVELElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBQ0gsZUFBQztBQUFELENBQUMsQUFORCxJQU1DO0FBTlksZ0JBQVEsV0FNcEIsQ0FBQTtBQUVEO0lBQUE7SUFJQSxDQUFDO0lBSEMsdUJBQUksR0FBSixVQUFLLElBQVksRUFBRSxhQUE4QjtRQUE5Qiw2QkFBOEIsR0FBOUIscUJBQThCO1FBQy9DLE1BQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUNILGVBQUM7QUFBRCxDQUFDLEFBSkQsSUFJQztBQUpZLGdCQUFRLFdBSXBCLENBQUE7QUFFRDtJQUFxQyxtQ0FBYTtJQUloRCx5QkFBbUIsS0FBZSxFQUFFLE9BQU87UUFDekMsa0JBQU0sbUJBQW1CLEdBQUcsT0FBTyxDQUFDLENBQUM7UUFEcEIsVUFBSyxHQUFMLEtBQUssQ0FBVTtRQUVoQyxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQztJQUM1QixDQUFDO0lBRUQsa0NBQVEsR0FBUixjQUFxQixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDN0Msc0JBQUM7QUFBRCxDQUFDLEFBVkQsQ0FBcUMsMEJBQWEsR0FVakQ7QUFWWSx1QkFBZSxrQkFVM0IsQ0FBQTtBQUVELDBCQUEwQixJQUFrQjtJQUMxQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2IsS0FBSyxZQUFZLENBQUMsUUFBUSxDQUFDO1FBQzNCLEtBQUssWUFBWSxDQUFDLFlBQVksQ0FBQztRQUMvQixLQUFLLFlBQVksQ0FBQyxXQUFXO1lBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFFZDtZQUNFLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakIsQ0FBQztBQUNILENBQUM7QUFFRDtJQWFFLG9CQUFtQixLQUFhLEVBQVUsY0FBK0I7UUFBdkMsOEJBQXVDLEdBQXZDLHNCQUF1QztRQUF0RCxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVUsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1FBVnpFLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFDbkIsVUFBSyxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ25CLFdBQU0sR0FBVyxDQUFDLENBQUMsQ0FBQztRQUNwQixTQUFJLEdBQVcsQ0FBQyxDQUFDO1FBRWpCLGdCQUFnQjtRQUNoQixpQkFBWSxHQUFpQixZQUFZLENBQUMsS0FBSyxDQUFDO1FBQ2hELGdCQUFnQjtRQUNoQixrQkFBYSxHQUFvQixJQUFJLENBQUM7UUFHcEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRCw0QkFBTyxHQUFQLGNBQTBCLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztJQUVyRCw0QkFBTyxHQUFQLFVBQVEsSUFBa0I7UUFDeEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzlCLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzNCLENBQUM7WUFDRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUMzQixDQUFDO0lBQ0gsQ0FBQztJQUVELDRCQUFPLEdBQVA7UUFDRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUNoQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDZCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDaEIsQ0FBQztRQUVELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsMkJBQU0sR0FBTixVQUFPLEtBQWE7UUFDbEIsTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLFlBQUksR0FBRyxvQkFBYSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFFRCwyQ0FBc0IsR0FBdEI7UUFDRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUN6QixPQUFPLElBQUksQ0FBQyxJQUFJLElBQUksa0JBQVUsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzNCLENBQUM7SUFDSCxDQUFDO0lBRUQsc0NBQWlCLEdBQWpCO1FBQ0UsT0FBTyxvQkFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDdkQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2YsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFFLElBQUk7Z0JBQ3JCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFFLElBQUk7Z0JBQ3JCLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztvQkFDL0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxZQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7b0JBQ3JDLENBQUM7b0JBQ0QsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNqQixDQUFDO2dCQUNELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFFLElBQUk7Z0JBQ3JCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFFLElBQUk7WUFDdkIsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsNEJBQU8sR0FBUCxVQUFRLElBQWtCLEVBQUUsS0FBb0I7UUFBcEIscUJBQW9CLEdBQXBCLFlBQW9CO1FBQzlDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDN0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFL0IsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUMvQixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzdCLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFakMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXpCLHNEQUFzRDtRQUN0RCxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuQixNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ3hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxHQUFHLElBQUksUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQVksQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVELElBQUksY0FBYyxDQUFDO1FBQ25CLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQzVDLDJEQUEyRDtZQUMzRCxjQUFjLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxZQUFZLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksWUFBWSxDQUFDLFVBQVUsQ0FBQztRQUM1RixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixjQUFjLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7UUFDckMsQ0FBQztRQUVELDZEQUE2RDtRQUM3RCx5Q0FBeUM7UUFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVuQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDakIsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLElBQUksQ0FBQyxnQkFBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLElBQUksWUFBWSxHQUFHLHVCQUFnQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsMkJBQTJCO2dCQUN2RSx1QkFBZ0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDO1lBRW5FLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixZQUFZLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsa0JBQWtCLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQztZQUM1RSxDQUFDO1lBRUQsS0FBSyxHQUFHLElBQUksZUFBZSxDQUN2QixJQUFJLEVBQUUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQ3RELFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFHRCx5QkFBSSxHQUFKO1FBQ0UsSUFBSSxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2xELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRUQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3pCLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBRS9CLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFFMUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2IsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLGNBQWMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELGdCQUFnQjtJQUNoQiwwQkFBSyxHQUFMO1FBQ0UsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzdCLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxZQUFJLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBRTlCLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLG9EQUFvRDtZQUNwRCw2Q0FBNkM7WUFDN0MsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3RDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixNQUFNLENBQUMsWUFBWSxDQUFDO1lBQ3RCLENBQUM7UUFDSCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsb0JBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkYsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMvQixDQUFDO1FBRUQsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDakIsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDekIsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLFlBQUksQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFFOUIsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRUQsMkJBQTJCO1FBQzNCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksWUFBWSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUMzRCxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDckMsQ0FBQztRQUVELElBQUksVUFBVSxHQUFHLElBQUksSUFBSSxhQUFLLElBQUksSUFBSSxJQUFJLGNBQU0sQ0FBQztRQUNqRCxJQUFJLE1BQU0sR0FBRyxVQUFVLEdBQUcsS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0IsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsUUFBUSxJQUFJLGVBQU8sSUFBSSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLGVBQU8sSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0YsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLFdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDL0IsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDOUIsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLDJCQUF5QixvQkFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBRyxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUVELGdDQUFXLEdBQVg7UUFDRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsRUFDeEMsOEJBQThCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekQsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3ZCLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDakMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUU3QixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBRSxJQUFJO1FBQ3JCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFFLElBQUk7UUFFckIsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQy9DLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksWUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ3JDLENBQUM7WUFDRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFFLElBQUk7UUFDckIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUUsSUFBSTtRQUVyQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3RGLENBQUM7SUFFRCxtQ0FBYyxHQUFkO1FBQ0UsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN2QixJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ2pDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDN0IsT0FBTyxvQkFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLFlBQUksRUFBRSxDQUFDO1lBQ3BELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBQ0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsRCxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsWUFBWSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRUQsK0JBQVUsR0FBVjtRQUNFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUN2QyxzQ0FBc0MsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRSxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN2QixJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ2pDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDN0IsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVmLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNqRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLFlBQUksSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ25DLENBQUM7WUFDRCxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNyQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEUsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFZixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFRCwrQkFBVSxHQUFWO1FBQ0UsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN2QixJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ2pDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksYUFBSyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksY0FBTSxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQztRQUNELElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN2QixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxlQUFPLEVBQUUsQ0FBQztZQUNsRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLGVBQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBQ2YsSUFBSSxDQUFDLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO2dCQUN4RCxDQUFDO2dCQUNELFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDcEIsQ0FBQztZQUNELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBQ0QsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2RCxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdkYsQ0FBQztJQUVELG1DQUFjLEdBQWQ7UUFDRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUMzQyxvQ0FBb0MsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvRCxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdkIsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNqQyxPQUFPLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBQ0QsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2RCxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDM0YsQ0FBQztJQUVELHlDQUFvQixHQUFwQjtRQUNFLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdkIsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNqQyxPQUFPLElBQUksQ0FBQyxJQUFJLElBQUksWUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksZUFBTyxFQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFDRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMzRixDQUFDO0lBRUQsa0NBQWEsR0FBYjtRQUNFLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdkIsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNqQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUNqRCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLCtCQUErQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9FLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFZixNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUVELHFDQUFnQixHQUFoQjtRQUNFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxXQUFHLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0QsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3ZCLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDakMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2YsRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNsQyxJQUFJLFFBQVEsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztZQUNwQyxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUYsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM5QixDQUFDO0lBQ0gsQ0FBQztJQUVELG9DQUFlLEdBQWYsVUFBZ0IsTUFBZSxFQUFFLFlBQW9CO1FBQ25ELEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNaLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELDBCQUFLLEdBQUwsVUFBTSxPQUFlLEVBQUUsZUFBOEIsRUFBRSxZQUE2QjtRQUE3RCwrQkFBOEIsR0FBOUIsc0JBQThCO1FBQUUsNEJBQTZCLEdBQTdCLG9CQUE2QjtRQUNsRixJQUFJLEtBQUssR0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQy9CLElBQUksTUFBTSxHQUFXLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDakMsSUFBSSxJQUFJLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUM3QixlQUFlO1lBQ1gsZ0JBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRyxlQUFlLEdBQUcsb0JBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pGLElBQUksWUFBWSxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDNUYsSUFBSSxZQUFZLEdBQ1osb0JBQW9CLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDcEYsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBQ0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLGVBQWUsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDckUsTUFBTSxDQUFDLFlBQVksQ0FBQztJQUN0QixDQUFDO0lBQ0gsaUJBQUM7QUFBRCxDQUFDLEFBM1dELElBMldDO0FBM1dZLGtCQUFVLGFBMld0QixDQUFBO0FBRUQscUJBQXFCLE9BQWlCLEVBQUUsSUFBYztJQUNwRCxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxXQUFHLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxZQUFZLENBQUMsVUFBVSxDQUFDO0FBQ3pFLENBQUM7QUFFRCxxQkFBcUIsTUFBYyxFQUFFLFFBQWdCLEVBQUUsSUFBWTtJQUNqRSxNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sSUFBSSxRQUFRLElBQUksa0JBQVUsQ0FBQztBQUNsRCxDQUFDO0FBRUQsaUJBQWlCLElBQVk7SUFDM0IsTUFBTSxDQUFDLFVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLFVBQUUsQ0FBQztBQUNsQyxDQUFDO0FBRUQsd0JBQXdCLElBQVksRUFBRSxJQUFZO0lBQ2hELE1BQU0sQ0FBQyxJQUFJLElBQUksY0FBTSxJQUFJLElBQUksSUFBSSxhQUFLLENBQUM7QUFDekMsQ0FBQztBQUVELHNCQUFzQixJQUFZLEVBQUUsSUFBWTtJQUM5QyxNQUFNLENBQUMsSUFBSSxJQUFJLGFBQUssSUFBSSxJQUFJLElBQUksY0FBTSxDQUFDO0FBQ3pDLENBQUM7QUFFRCx1QkFBdUIsSUFBWSxFQUFFLElBQVk7SUFDL0MsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxrQkFBVSxDQUFDLENBQUMsQ0FBQztRQUN6QixNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDRCxNQUFNLENBQUMsTUFBTSxJQUFJLFdBQUcsSUFBSSxNQUFNLElBQUksV0FBRyxDQUFDO0FBQ3hDLENBQUM7QUFFRCwyQkFBMkIsSUFBWSxFQUFFLElBQVk7SUFDbkQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxjQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxDQUFDLFVBQUUsSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLFVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBRSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksVUFBRSxDQUFDLElBQUksTUFBTSxJQUFJLGtCQUFVO1FBQ3hGLE1BQU0sSUFBSSxjQUFNLElBQUksTUFBTSxJQUFJLFVBQUUsQ0FBQztBQUMxQyxDQUFDO0FBRUQsMEJBQTBCLE1BQWM7SUFDdEMsTUFBTSxDQUFDLENBQUMsVUFBRSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksVUFBRSxDQUFDLElBQUksQ0FBQyxVQUFFLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxVQUFFLENBQUMsSUFBSSxNQUFNLElBQUksa0JBQVU7UUFDeEYsTUFBTSxJQUFJLGNBQU0sSUFBSSxNQUFNLElBQUksVUFBRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3RCxDQUFDO0FBRUQsd0NBQXdDLElBQVk7SUFDbEQsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNiLEtBQUssZUFBTyxDQUFDO1FBQ2IsS0FBSyxlQUFPO1lBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkO1lBQ0UsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0FBQ0gsQ0FBQztBQUVELHVDQUF1QyxJQUFZO0lBQ2pELE1BQU0sQ0FBQyxJQUFJLElBQUksZ0JBQVEsQ0FBQztBQUMxQixDQUFDO0FBRUQsMkNBQTJDLElBQVk7SUFDckQsdUJBQXVCO0lBQ3ZCLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDYixLQUFLLFVBQUUsQ0FBQztRQUNSLEtBQUssYUFBSyxDQUFDO1FBQ1gsS0FBSyxjQUFNLENBQUM7UUFDWixLQUFLLGNBQU0sQ0FBQztRQUNaLEtBQUssYUFBSyxDQUFDO1FBQ1gsS0FBSyxXQUFHO1lBQ04sTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkO1lBQ0UsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0FBQ0gsQ0FBQztBQUVELGtDQUFrQyxJQUFZO0lBQzVDLDZCQUE2QjtJQUM3Qiw2QkFBNkI7SUFDN0Isb0JBQW9CO0lBQ3BCLGFBQWE7SUFDYixNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2IsS0FBSyxhQUFLLENBQUM7UUFDWCxLQUFLLGVBQU8sQ0FBQztRQUNiLEtBQUssY0FBTSxDQUFDO1FBQ1osS0FBSyxhQUFLLENBQUM7UUFDWCxLQUFLLGFBQUssQ0FBQztRQUNYLEtBQUssV0FBRyxDQUFDO1FBQ1QsS0FBSyxjQUFNLENBQUM7UUFDWixLQUFLLGFBQUssQ0FBQztRQUNYLEtBQUssY0FBTTtZQUNULE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDZDtZQUNFLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakIsQ0FBQztBQUNILENBQUM7QUFFRCxvQ0FBb0MsSUFBWTtJQUM5QyxhQUFhO0lBQ2IsMkJBQTJCO0lBQzNCLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDYixLQUFLLGFBQUssQ0FBQztRQUNYLEtBQUssa0JBQVUsQ0FBQztRQUNoQixLQUFLLGNBQU0sQ0FBQztRQUNaLEtBQUssZ0JBQVEsQ0FBQztRQUNkLEtBQUssY0FBTSxDQUFDO1FBQ1osS0FBSyxrQkFBVSxDQUFDO1FBQ2hCLEtBQUssYUFBSyxDQUFDO1FBQ1gsS0FBSyxlQUFPLENBQUM7UUFDYixLQUFLLGVBQU8sQ0FBQztRQUNiLEtBQUssZUFBTztZQUNWLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDZDtZQUNFLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakIsQ0FBQztBQUNILENBQUM7QUFFRCx3Q0FBd0MsSUFBWTtJQUNsRCxrREFBa0Q7SUFDbEQsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNiLEtBQUssZUFBTyxDQUFDO1FBQ2IsS0FBSyxlQUFPLENBQUM7UUFDYixLQUFLLGNBQU0sQ0FBQztRQUNaLEtBQUssZ0JBQVEsQ0FBQztRQUNkLEtBQUssZUFBTztZQUNWLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDZDtZQUNFLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakIsQ0FBQztBQUNILENBQUM7QUFFRCxnQ0FBZ0MsSUFBWTtJQUMxQywyREFBMkQ7SUFDM0QsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNiLEtBQUssZUFBTyxDQUFDO1FBQ2IsS0FBSyxlQUFPLENBQUM7UUFDYixLQUFLLGNBQU0sQ0FBQztRQUNaLEtBQUssZ0JBQVEsQ0FBQztRQUNkLEtBQUssZUFBTyxDQUFDO1FBQ2IsS0FBSyxjQUFNLENBQUM7UUFDWixLQUFLLGtCQUFVLENBQUM7UUFDaEIsS0FBSyxhQUFLLENBQUM7UUFDWCxLQUFLLFdBQUcsQ0FBQztRQUNULEtBQUssaUJBQVMsQ0FBQztRQUNmLEtBQUssa0JBQVUsQ0FBQztRQUNoQixLQUFLLGFBQUssQ0FBQztRQUNYLEtBQUssY0FBTSxDQUFDO1FBQ1osS0FBSyxjQUFNLENBQUM7UUFDWixLQUFLLGFBQUs7WUFDUixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2Q7WUFDRSxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2pCLENBQUM7QUFDSCxDQUFDO0FBRUQsdUNBQXVDLElBQVk7SUFDakQsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNiLEtBQUssZUFBTyxDQUFDO1FBQ2IsS0FBSyxjQUFNLENBQUM7UUFDWixLQUFLLGFBQUssQ0FBQztRQUNYLEtBQUssYUFBSyxDQUFDO1FBQ1gsS0FBSyxjQUFNLENBQUM7UUFDWixLQUFLLGVBQU8sQ0FBQztRQUNiLEtBQUssZUFBTyxDQUFDO1FBQ2IsS0FBSyxjQUFNO1lBQ1QsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkO1lBQ0UsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0FBQ0gsQ0FBQztBQUVELCtCQUErQixJQUFZO0lBQ3pDLGlCQUFpQjtJQUNqQixRQUFRO0lBQ1IsTUFBTSxDQUFDLElBQUksSUFBSSxXQUFHLENBQUM7QUFDckIsQ0FBQztBQUVELDZCQUE2QixJQUFZLEVBQUUsSUFBa0I7SUFDM0QsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNiLEtBQUssWUFBWSxDQUFDLEdBQUcsQ0FBQztRQUN0QixLQUFLLFlBQVksQ0FBQyxZQUFZO1lBQzVCLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFFZCxLQUFLLFlBQVksQ0FBQyxRQUFRO1lBQ3hCLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV4QyxLQUFLLFlBQVksQ0FBQyxlQUFlO1lBQy9CLE1BQU0sQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU5QyxLQUFLLFlBQVksQ0FBQyxrQkFBa0I7WUFDbEMsTUFBTSxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWpELEtBQUssWUFBWSxDQUFDLFdBQVc7WUFDM0IsTUFBTSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTlDLEtBQUssWUFBWSxDQUFDLGFBQWE7WUFDN0IsTUFBTSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXRDLEtBQUssWUFBWSxDQUFDLGNBQWM7WUFDOUIsTUFBTSxDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTdDLEtBQUssWUFBWSxDQUFDLFdBQVcsQ0FBQztRQUM5QixLQUFLLFlBQVksQ0FBQyxXQUFXO1lBQzNCLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUxQyxLQUFLLFlBQVksQ0FBQyxtQkFBbUI7WUFDbkMsTUFBTSxDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTdDLEtBQUssWUFBWSxDQUFDLEtBQUs7WUFDckIsTUFBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXJDO1lBQ0UsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0FBQ0gsQ0FBQztBQUVELGtCQUFrQixLQUFLLEVBQUUsS0FBSztJQUM1QixNQUFNLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsWUFBSSxHQUFHLG9CQUFhLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMvRSxDQUFDO0FBRUQsaUJBQWlCLElBQVk7SUFDM0IsTUFBTSxDQUFDLG9CQUFhLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFFRCxtQkFBMEIsSUFBSTtJQUM1QixNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2IsS0FBSyxXQUFHLENBQUM7UUFDVCxLQUFLLFdBQUcsQ0FBQztRQUNULEtBQUssV0FBRyxDQUFDO1FBQ1QsS0FBSyxhQUFLO1lBQ1IsTUFBTSxDQUFDLElBQUksQ0FBQztRQUVkO1lBQ0UsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0FBQ0gsQ0FBQztBQVhlLGlCQUFTLFlBV3hCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge051bWJlcldyYXBwZXIsIFN0cmluZ1dyYXBwZXIsIGlzUHJlc2VudCwgcmVzb2x2ZUVudW1Ub2tlbn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZ1wiO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuXG5pbXBvcnQge1xuICBpc1doaXRlc3BhY2UsXG4gICRFT0YsXG4gICRIQVNILFxuICAkVElMREEsXG4gICRDQVJFVCxcbiAgJFBFUkNFTlQsXG4gICQkLFxuICAkXyxcbiAgJENPTE9OLFxuICAkU1EsXG4gICREUSxcbiAgJEVRLFxuICAkU0xBU0gsXG4gICRCQUNLU0xBU0gsXG4gICRQRVJJT0QsXG4gICRTVEFSLFxuICAkUExVUyxcbiAgJExQQVJFTixcbiAgJFJQQVJFTixcbiAgJExCUkFDRSxcbiAgJFJCUkFDRSxcbiAgJExCUkFDS0VULFxuICAkUkJSQUNLRVQsXG4gICRQSVBFLFxuICAkQ09NTUEsXG4gICRTRU1JQ09MT04sXG4gICRNSU5VUyxcbiAgJEJBTkcsXG4gICRRVUVTVElPTixcbiAgJEFULFxuICAkQU1QRVJTQU5ELFxuICAkR1QsXG4gICRhLFxuICAkQSxcbiAgJHosXG4gICRaLFxuICAkMCxcbiAgJDksXG4gICRGRixcbiAgJENSLFxuICAkTEYsXG4gICRWVEFCXG59IGZyb20gXCJhbmd1bGFyMi9zcmMvY29tcGlsZXIvY2hhcnNcIjtcblxuZXhwb3J0IHtcbiAgJEVPRixcbiAgJEFULFxuICAkUkJSQUNFLFxuICAkTEJSQUNFLFxuICAkTEJSQUNLRVQsXG4gICRSQlJBQ0tFVCxcbiAgJExQQVJFTixcbiAgJFJQQVJFTixcbiAgJENPTU1BLFxuICAkQ09MT04sXG4gICRTRU1JQ09MT04sXG4gIGlzV2hpdGVzcGFjZVxufSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2NoYXJzXCI7XG5cbmV4cG9ydCBlbnVtIENzc1Rva2VuVHlwZSB7XG4gIEVPRixcbiAgU3RyaW5nLFxuICBDb21tZW50LFxuICBJZGVudGlmaWVyLFxuICBOdW1iZXIsXG4gIElkZW50aWZpZXJPck51bWJlcixcbiAgQXRLZXl3b3JkLFxuICBDaGFyYWN0ZXIsXG4gIFdoaXRlc3BhY2UsXG4gIEludmFsaWRcbn1cblxuZXhwb3J0IGVudW0gQ3NzTGV4ZXJNb2RlIHtcbiAgQUxMLFxuICBBTExfVFJBQ0tfV1MsXG4gIFNFTEVDVE9SLFxuICBQU0VVRE9fU0VMRUNUT1IsXG4gIEFUVFJJQlVURV9TRUxFQ1RPUixcbiAgQVRfUlVMRV9RVUVSWSxcbiAgTUVESUFfUVVFUlksXG4gIEJMT0NLLFxuICBLRVlGUkFNRV9CTE9DSyxcbiAgU1RZTEVfQkxPQ0ssXG4gIFNUWUxFX1ZBTFVFLFxuICBTVFlMRV9WQUxVRV9GVU5DVElPTixcbiAgU1RZTEVfQ0FMQ19GVU5DVElPTlxufVxuXG5leHBvcnQgY2xhc3MgTGV4ZWRDc3NSZXN1bHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXJyb3I6IENzc1NjYW5uZXJFcnJvciwgcHVibGljIHRva2VuOiBDc3NUb2tlbikge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlRXJyb3JNZXNzYWdlKGlucHV0OiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZywgZXJyb3JWYWx1ZTogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiBudW1iZXIsIHJvdzogbnVtYmVyLCBjb2x1bW46IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiBgJHttZXNzYWdlfSBhdCBjb2x1bW4gJHtyb3d9OiR7Y29sdW1ufSBpbiBleHByZXNzaW9uIFtgICtcbiAgICAgICAgIGZpbmRQcm9ibGVtQ29kZShpbnB1dCwgZXJyb3JWYWx1ZSwgaW5kZXgsIGNvbHVtbikgKyAnXSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kUHJvYmxlbUNvZGUoaW5wdXQ6IHN0cmluZywgZXJyb3JWYWx1ZTogc3RyaW5nLCBpbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW46IG51bWJlcik6IHN0cmluZyB7XG4gIHZhciBlbmRPZlByb2JsZW1MaW5lID0gaW5kZXg7XG4gIHZhciBjdXJyZW50ID0gY2hhckNvZGUoaW5wdXQsIGluZGV4KTtcbiAgd2hpbGUgKGN1cnJlbnQgPiAwICYmICFpc05ld2xpbmUoY3VycmVudCkpIHtcbiAgICBjdXJyZW50ID0gY2hhckNvZGUoaW5wdXQsICsrZW5kT2ZQcm9ibGVtTGluZSk7XG4gIH1cbiAgdmFyIGNob3BwZWRTdHJpbmcgPSBpbnB1dC5zdWJzdHJpbmcoMCwgZW5kT2ZQcm9ibGVtTGluZSk7XG4gIHZhciBwb2ludGVyUGFkZGluZyA9IFwiXCI7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY29sdW1uOyBpKyspIHtcbiAgICBwb2ludGVyUGFkZGluZyArPSBcIiBcIjtcbiAgfVxuICB2YXIgcG9pbnRlclN0cmluZyA9IFwiXCI7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZXJyb3JWYWx1ZS5sZW5ndGg7IGkrKykge1xuICAgIHBvaW50ZXJTdHJpbmcgKz0gXCJeXCI7XG4gIH1cbiAgcmV0dXJuIGNob3BwZWRTdHJpbmcgKyBcIlxcblwiICsgcG9pbnRlclBhZGRpbmcgKyBwb2ludGVyU3RyaW5nICsgXCJcXG5cIjtcbn1cblxuZXhwb3J0IGNsYXNzIENzc1Rva2VuIHtcbiAgbnVtVmFsdWU6IG51bWJlcjtcbiAgY29uc3RydWN0b3IocHVibGljIGluZGV4OiBudW1iZXIsIHB1YmxpYyBjb2x1bW46IG51bWJlciwgcHVibGljIGxpbmU6IG51bWJlcixcbiAgICAgICAgICAgICAgcHVibGljIHR5cGU6IENzc1Rva2VuVHlwZSwgcHVibGljIHN0clZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLm51bVZhbHVlID0gY2hhckNvZGUoc3RyVmFsdWUsIDApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NMZXhlciB7XG4gIHNjYW4odGV4dDogc3RyaW5nLCB0cmFja0NvbW1lbnRzOiBib29sZWFuID0gZmFsc2UpOiBDc3NTY2FubmVyIHtcbiAgICByZXR1cm4gbmV3IENzc1NjYW5uZXIodGV4dCwgdHJhY2tDb21tZW50cyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1NjYW5uZXJFcnJvciBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBwdWJsaWMgcmF3TWVzc2FnZTogc3RyaW5nO1xuICBwdWJsaWMgbWVzc2FnZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0b2tlbjogQ3NzVG9rZW4sIG1lc3NhZ2UpIHtcbiAgICBzdXBlcignQ3NzIFBhcnNlIEVycm9yOiAnICsgbWVzc2FnZSk7XG4gICAgdGhpcy5yYXdNZXNzYWdlID0gbWVzc2FnZTtcbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLm1lc3NhZ2U7IH1cbn1cblxuZnVuY3Rpb24gX3RyYWNrV2hpdGVzcGFjZShtb2RlOiBDc3NMZXhlck1vZGUpIHtcbiAgc3dpdGNoIChtb2RlKSB7XG4gICAgY2FzZSBDc3NMZXhlck1vZGUuU0VMRUNUT1I6XG4gICAgY2FzZSBDc3NMZXhlck1vZGUuQUxMX1RSQUNLX1dTOlxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLlNUWUxFX1ZBTFVFOlxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NTY2FubmVyIHtcbiAgcGVlazogbnVtYmVyO1xuICBwZWVrUGVlazogbnVtYmVyO1xuICBsZW5ndGg6IG51bWJlciA9IDA7XG4gIGluZGV4OiBudW1iZXIgPSAtMTtcbiAgY29sdW1uOiBudW1iZXIgPSAtMTtcbiAgbGluZTogbnVtYmVyID0gMDtcblxuICAvKiogQGludGVybmFsICovXG4gIF9jdXJyZW50TW9kZTogQ3NzTGV4ZXJNb2RlID0gQ3NzTGV4ZXJNb2RlLkJMT0NLO1xuICAvKiogQGludGVybmFsICovXG4gIF9jdXJyZW50RXJyb3I6IENzc1NjYW5uZXJFcnJvciA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGlucHV0OiBzdHJpbmcsIHByaXZhdGUgX3RyYWNrQ29tbWVudHM6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIHRoaXMubGVuZ3RoID0gdGhpcy5pbnB1dC5sZW5ndGg7XG4gICAgdGhpcy5wZWVrUGVlayA9IHRoaXMucGVla0F0KDApO1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICB9XG5cbiAgZ2V0TW9kZSgpOiBDc3NMZXhlck1vZGUgeyByZXR1cm4gdGhpcy5fY3VycmVudE1vZGU7IH1cblxuICBzZXRNb2RlKG1vZGU6IENzc0xleGVyTW9kZSkge1xuICAgIGlmICh0aGlzLl9jdXJyZW50TW9kZSAhPSBtb2RlKSB7XG4gICAgICBpZiAoX3RyYWNrV2hpdGVzcGFjZSh0aGlzLl9jdXJyZW50TW9kZSkpIHtcbiAgICAgICAgdGhpcy5jb25zdW1lV2hpdGVzcGFjZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY3VycmVudE1vZGUgPSBtb2RlO1xuICAgIH1cbiAgfVxuXG4gIGFkdmFuY2UoKTogdm9pZCB7XG4gICAgaWYgKGlzTmV3bGluZSh0aGlzLnBlZWspKSB7XG4gICAgICB0aGlzLmNvbHVtbiA9IDA7XG4gICAgICB0aGlzLmxpbmUrKztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb2x1bW4rKztcbiAgICB9XG5cbiAgICB0aGlzLmluZGV4Kys7XG4gICAgdGhpcy5wZWVrID0gdGhpcy5wZWVrUGVlaztcbiAgICB0aGlzLnBlZWtQZWVrID0gdGhpcy5wZWVrQXQodGhpcy5pbmRleCArIDEpO1xuICB9XG5cbiAgcGVla0F0KGluZGV4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBpbmRleCA+PSB0aGlzLmxlbmd0aCA/ICRFT0YgOiBTdHJpbmdXcmFwcGVyLmNoYXJDb2RlQXQodGhpcy5pbnB1dCwgaW5kZXgpO1xuICB9XG5cbiAgY29uc3VtZUVtcHR5U3RhdGVtZW50cygpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnN1bWVXaGl0ZXNwYWNlKCk7XG4gICAgd2hpbGUgKHRoaXMucGVlayA9PSAkU0VNSUNPTE9OKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHRoaXMuY29uc3VtZVdoaXRlc3BhY2UoKTtcbiAgICB9XG4gIH1cblxuICBjb25zdW1lV2hpdGVzcGFjZSgpOiB2b2lkIHtcbiAgICB3aGlsZSAoaXNXaGl0ZXNwYWNlKHRoaXMucGVlaykgfHwgaXNOZXdsaW5lKHRoaXMucGVlaykpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgaWYgKCF0aGlzLl90cmFja0NvbW1lbnRzICYmIGlzQ29tbWVudFN0YXJ0KHRoaXMucGVlaywgdGhpcy5wZWVrUGVlaykpIHtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7ICAvLyAvXG4gICAgICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gKlxuICAgICAgICB3aGlsZSAoIWlzQ29tbWVudEVuZCh0aGlzLnBlZWssIHRoaXMucGVla1BlZWspKSB7XG4gICAgICAgICAgaWYgKHRoaXMucGVlayA9PSAkRU9GKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9yKCdVbnRlcm1pbmF0ZWQgY29tbWVudCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFkdmFuY2UoKTsgIC8vICpcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7ICAvLyAvXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3VtZSh0eXBlOiBDc3NUb2tlblR5cGUsIHZhbHVlOiBzdHJpbmcgPSBudWxsKTogTGV4ZWRDc3NSZXN1bHQge1xuICAgIHZhciBtb2RlID0gdGhpcy5fY3VycmVudE1vZGU7XG4gICAgdGhpcy5zZXRNb2RlKENzc0xleGVyTW9kZS5BTEwpO1xuXG4gICAgdmFyIHByZXZpb3VzSW5kZXggPSB0aGlzLmluZGV4O1xuICAgIHZhciBwcmV2aW91c0xpbmUgPSB0aGlzLmxpbmU7XG4gICAgdmFyIHByZXZpb3VzQ29sdW1uID0gdGhpcy5jb2x1bW47XG5cbiAgICB2YXIgb3V0cHV0ID0gdGhpcy5zY2FuKCk7XG5cbiAgICAvLyBqdXN0IGluY2FzZSB0aGUgaW5uZXIgc2NhbiBtZXRob2QgcmV0dXJuZWQgYW4gZXJyb3JcbiAgICBpZiAoaXNQcmVzZW50KG91dHB1dC5lcnJvcikpIHtcbiAgICAgIHRoaXMuc2V0TW9kZShtb2RlKTtcbiAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfVxuXG4gICAgdmFyIG5leHQgPSBvdXRwdXQudG9rZW47XG4gICAgaWYgKCFpc1ByZXNlbnQobmV4dCkpIHtcbiAgICAgIG5leHQgPSBuZXcgQ3NzVG9rZW4oMCwgMCwgMCwgQ3NzVG9rZW5UeXBlLkVPRiwgXCJlbmQgb2YgZmlsZVwiKTtcbiAgICB9XG5cbiAgICB2YXIgaXNNYXRjaGluZ1R5cGU7XG4gICAgaWYgKHR5cGUgPT0gQ3NzVG9rZW5UeXBlLklkZW50aWZpZXJPck51bWJlcikge1xuICAgICAgLy8gVE9ETyAobWF0c2tvKTogaW1wbGVtZW50IGFycmF5IHRyYXZlcnNhbCBmb3IgbG9va3VwIGhlcmVcbiAgICAgIGlzTWF0Y2hpbmdUeXBlID0gbmV4dC50eXBlID09IENzc1Rva2VuVHlwZS5OdW1iZXIgfHwgbmV4dC50eXBlID09IENzc1Rva2VuVHlwZS5JZGVudGlmaWVyO1xuICAgIH0gZWxzZSB7XG4gICAgICBpc01hdGNoaW5nVHlwZSA9IG5leHQudHlwZSA9PSB0eXBlO1xuICAgIH1cblxuICAgIC8vIGJlZm9yZSB0aHJvd2luZyB0aGUgZXJyb3Igd2UgbmVlZCB0byBicmluZyBiYWNrIHRoZSBmb3JtZXJcbiAgICAvLyBtb2RlIHNvIHRoYXQgdGhlIHBhcnNlciBjYW4gcmVjb3Zlci4uLlxuICAgIHRoaXMuc2V0TW9kZShtb2RlKTtcblxuICAgIHZhciBlcnJvciA9IG51bGw7XG4gICAgaWYgKCFpc01hdGNoaW5nVHlwZSB8fCAoaXNQcmVzZW50KHZhbHVlKSAmJiB2YWx1ZSAhPSBuZXh0LnN0clZhbHVlKSkge1xuICAgICAgdmFyIGVycm9yTWVzc2FnZSA9IHJlc29sdmVFbnVtVG9rZW4oQ3NzVG9rZW5UeXBlLCBuZXh0LnR5cGUpICsgXCIgZG9lcyBub3QgbWF0Y2ggZXhwZWN0ZWQgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmVFbnVtVG9rZW4oQ3NzVG9rZW5UeXBlLCB0eXBlKSArIFwiIHZhbHVlXCI7XG5cbiAgICAgIGlmIChpc1ByZXNlbnQodmFsdWUpKSB7XG4gICAgICAgIGVycm9yTWVzc2FnZSArPSAnIChcIicgKyBuZXh0LnN0clZhbHVlICsgJ1wiIHNob3VsZCBtYXRjaCBcIicgKyB2YWx1ZSArICdcIiknO1xuICAgICAgfVxuXG4gICAgICBlcnJvciA9IG5ldyBDc3NTY2FubmVyRXJyb3IoXG4gICAgICAgICAgbmV4dCwgZ2VuZXJhdGVFcnJvck1lc3NhZ2UodGhpcy5pbnB1dCwgZXJyb3JNZXNzYWdlLCBuZXh0LnN0clZhbHVlLCBwcmV2aW91c0luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzTGluZSwgcHJldmlvdXNDb2x1bW4pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IExleGVkQ3NzUmVzdWx0KGVycm9yLCBuZXh0KTtcbiAgfVxuXG5cbiAgc2NhbigpOiBMZXhlZENzc1Jlc3VsdCB7XG4gICAgdmFyIHRyYWNrV1MgPSBfdHJhY2tXaGl0ZXNwYWNlKHRoaXMuX2N1cnJlbnRNb2RlKTtcbiAgICBpZiAodGhpcy5pbmRleCA9PSAwICYmICF0cmFja1dTKSB7ICAvLyBmaXJzdCBzY2FuXG4gICAgICB0aGlzLmNvbnN1bWVXaGl0ZXNwYWNlKCk7XG4gICAgfVxuXG4gICAgdmFyIHRva2VuID0gdGhpcy5fc2NhbigpO1xuICAgIGlmICh0b2tlbiA9PSBudWxsKSByZXR1cm4gbnVsbDtcblxuICAgIHZhciBlcnJvciA9IHRoaXMuX2N1cnJlbnRFcnJvcjtcbiAgICB0aGlzLl9jdXJyZW50RXJyb3IgPSBudWxsO1xuXG4gICAgaWYgKCF0cmFja1dTKSB7XG4gICAgICB0aGlzLmNvbnN1bWVXaGl0ZXNwYWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTGV4ZWRDc3NSZXN1bHQoZXJyb3IsIHRva2VuKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3NjYW4oKTogQ3NzVG9rZW4ge1xuICAgIHZhciBwZWVrID0gdGhpcy5wZWVrO1xuICAgIHZhciBwZWVrUGVlayA9IHRoaXMucGVla1BlZWs7XG4gICAgaWYgKHBlZWsgPT0gJEVPRikgcmV0dXJuIG51bGw7XG5cbiAgICBpZiAoaXNDb21tZW50U3RhcnQocGVlaywgcGVla1BlZWspKSB7XG4gICAgICAvLyBldmVuIGlmIGNvbW1lbnRzIGFyZSBub3QgdHJhY2tlZCB3ZSBzdGlsbCBsZXggdGhlXG4gICAgICAvLyBjb21tZW50IHNvIHdlIGNhbiBtb3ZlIHRoZSBwb2ludGVyIGZvcndhcmRcbiAgICAgIHZhciBjb21tZW50VG9rZW4gPSB0aGlzLnNjYW5Db21tZW50KCk7XG4gICAgICBpZiAodGhpcy5fdHJhY2tDb21tZW50cykge1xuICAgICAgICByZXR1cm4gY29tbWVudFRva2VuO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChfdHJhY2tXaGl0ZXNwYWNlKHRoaXMuX2N1cnJlbnRNb2RlKSAmJiAoaXNXaGl0ZXNwYWNlKHBlZWspIHx8IGlzTmV3bGluZShwZWVrKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnNjYW5XaGl0ZXNwYWNlKCk7XG4gICAgfVxuXG4gICAgcGVlayA9IHRoaXMucGVlaztcbiAgICBwZWVrUGVlayA9IHRoaXMucGVla1BlZWs7XG4gICAgaWYgKHBlZWsgPT0gJEVPRikgcmV0dXJuIG51bGw7XG5cbiAgICBpZiAoaXNTdHJpbmdTdGFydChwZWVrLCBwZWVrUGVlaykpIHtcbiAgICAgIHJldHVybiB0aGlzLnNjYW5TdHJpbmcoKTtcbiAgICB9XG5cbiAgICAvLyBzb21ldGhpbmcgbGlrZSB1cmwoY29vbClcbiAgICBpZiAodGhpcy5fY3VycmVudE1vZGUgPT0gQ3NzTGV4ZXJNb2RlLlNUWUxFX1ZBTFVFX0ZVTkNUSU9OKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuQ3NzVmFsdWVGdW5jdGlvbigpO1xuICAgIH1cblxuICAgIHZhciBpc01vZGlmaWVyID0gcGVlayA9PSAkUExVUyB8fCBwZWVrID09ICRNSU5VUztcbiAgICB2YXIgZGlnaXRBID0gaXNNb2RpZmllciA/IGZhbHNlIDogaXNEaWdpdChwZWVrKTtcbiAgICB2YXIgZGlnaXRCID0gaXNEaWdpdChwZWVrUGVlayk7XG4gICAgaWYgKGRpZ2l0QSB8fCAoaXNNb2RpZmllciAmJiAocGVla1BlZWsgPT0gJFBFUklPRCB8fCBkaWdpdEIpKSB8fCAocGVlayA9PSAkUEVSSU9EICYmIGRpZ2l0QikpIHtcbiAgICAgIHJldHVybiB0aGlzLnNjYW5OdW1iZXIoKTtcbiAgICB9XG5cbiAgICBpZiAocGVlayA9PSAkQVQpIHtcbiAgICAgIHJldHVybiB0aGlzLnNjYW5BdEV4cHJlc3Npb24oKTtcbiAgICB9XG5cbiAgICBpZiAoaXNJZGVudGlmaWVyU3RhcnQocGVlaywgcGVla1BlZWspKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuSWRlbnRpZmllcigpO1xuICAgIH1cblxuICAgIGlmIChpc1ZhbGlkQ3NzQ2hhcmFjdGVyKHBlZWssIHRoaXMuX2N1cnJlbnRNb2RlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2NhbkNoYXJhY3RlcigpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmVycm9yKGBVbmV4cGVjdGVkIGNoYXJhY3RlciBbJHtTdHJpbmdXcmFwcGVyLmZyb21DaGFyQ29kZShwZWVrKX1dYCk7XG4gIH1cblxuICBzY2FuQ29tbWVudCgpOiBDc3NUb2tlbiB7XG4gICAgaWYgKHRoaXMuYXNzZXJ0Q29uZGl0aW9uKGlzQ29tbWVudFN0YXJ0KHRoaXMucGVlaywgdGhpcy5wZWVrUGVlayksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRXhwZWN0ZWQgY29tbWVudCBzdGFydCB2YWx1ZVwiKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgc3RhcnRpbmdDb2x1bW4gPSB0aGlzLmNvbHVtbjtcbiAgICB2YXIgc3RhcnRpbmdMaW5lID0gdGhpcy5saW5lO1xuXG4gICAgdGhpcy5hZHZhbmNlKCk7ICAvLyAvXG4gICAgdGhpcy5hZHZhbmNlKCk7ICAvLyAqXG5cbiAgICB3aGlsZSAoIWlzQ29tbWVudEVuZCh0aGlzLnBlZWssIHRoaXMucGVla1BlZWspKSB7XG4gICAgICBpZiAodGhpcy5wZWVrID09ICRFT0YpIHtcbiAgICAgICAgdGhpcy5lcnJvcignVW50ZXJtaW5hdGVkIGNvbW1lbnQnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cblxuICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gKlxuICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gL1xuXG4gICAgdmFyIHN0ciA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCB0aGlzLmluZGV4KTtcbiAgICByZXR1cm4gbmV3IENzc1Rva2VuKHN0YXJ0LCBzdGFydGluZ0NvbHVtbiwgc3RhcnRpbmdMaW5lLCBDc3NUb2tlblR5cGUuQ29tbWVudCwgc3RyKTtcbiAgfVxuXG4gIHNjYW5XaGl0ZXNwYWNlKCk6IENzc1Rva2VuIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIHZhciBzdGFydGluZ0xpbmUgPSB0aGlzLmxpbmU7XG4gICAgd2hpbGUgKGlzV2hpdGVzcGFjZSh0aGlzLnBlZWspICYmIHRoaXMucGVlayAhPSAkRU9GKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdmFyIHN0ciA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCB0aGlzLmluZGV4KTtcbiAgICByZXR1cm4gbmV3IENzc1Rva2VuKHN0YXJ0LCBzdGFydGluZ0NvbHVtbiwgc3RhcnRpbmdMaW5lLCBDc3NUb2tlblR5cGUuV2hpdGVzcGFjZSwgc3RyKTtcbiAgfVxuXG4gIHNjYW5TdHJpbmcoKTogQ3NzVG9rZW4ge1xuICAgIGlmICh0aGlzLmFzc2VydENvbmRpdGlvbihpc1N0cmluZ1N0YXJ0KHRoaXMucGVlaywgdGhpcy5wZWVrUGVlayksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiVW5leHBlY3RlZCBub24tc3RyaW5nIHN0YXJ0aW5nIHZhbHVlXCIpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgdGFyZ2V0ID0gdGhpcy5wZWVrO1xuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHN0YXJ0aW5nQ29sdW1uID0gdGhpcy5jb2x1bW47XG4gICAgdmFyIHN0YXJ0aW5nTGluZSA9IHRoaXMubGluZTtcbiAgICB2YXIgcHJldmlvdXMgPSB0YXJnZXQ7XG4gICAgdGhpcy5hZHZhbmNlKCk7XG5cbiAgICB3aGlsZSAoIWlzQ2hhck1hdGNoKHRhcmdldCwgcHJldmlvdXMsIHRoaXMucGVlaykpIHtcbiAgICAgIGlmICh0aGlzLnBlZWsgPT0gJEVPRiB8fCBpc05ld2xpbmUodGhpcy5wZWVrKSkge1xuICAgICAgICB0aGlzLmVycm9yKCdVbnRlcm1pbmF0ZWQgcXVvdGUnKTtcbiAgICAgIH1cbiAgICAgIHByZXZpb3VzID0gdGhpcy5wZWVrO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYXNzZXJ0Q29uZGl0aW9uKHRoaXMucGVlayA9PSB0YXJnZXQsIFwiVW50ZXJtaW5hdGVkIHF1b3RlXCIpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5hZHZhbmNlKCk7XG5cbiAgICB2YXIgc3RyID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCBzdGFydGluZ0xpbmUsIENzc1Rva2VuVHlwZS5TdHJpbmcsIHN0cik7XG4gIH1cblxuICBzY2FuTnVtYmVyKCk6IENzc1Rva2VuIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIGlmICh0aGlzLnBlZWsgPT0gJFBMVVMgfHwgdGhpcy5wZWVrID09ICRNSU5VUykge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHZhciBwZXJpb2RVc2VkID0gZmFsc2U7XG4gICAgd2hpbGUgKGlzRGlnaXQodGhpcy5wZWVrKSB8fCB0aGlzLnBlZWsgPT0gJFBFUklPRCkge1xuICAgICAgaWYgKHRoaXMucGVlayA9PSAkUEVSSU9EKSB7XG4gICAgICAgIGlmIChwZXJpb2RVc2VkKSB7XG4gICAgICAgICAgdGhpcy5lcnJvcignVW5leHBlY3RlZCB1c2Ugb2YgYSBzZWNvbmQgcGVyaW9kIHZhbHVlJyk7XG4gICAgICAgIH1cbiAgICAgICAgcGVyaW9kVXNlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdmFyIHN0clZhbHVlID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCB0aGlzLmxpbmUsIENzc1Rva2VuVHlwZS5OdW1iZXIsIHN0clZhbHVlKTtcbiAgfVxuXG4gIHNjYW5JZGVudGlmaWVyKCk6IENzc1Rva2VuIHtcbiAgICBpZiAodGhpcy5hc3NlcnRDb25kaXRpb24oaXNJZGVudGlmaWVyU3RhcnQodGhpcy5wZWVrLCB0aGlzLnBlZWtQZWVrKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0V4cGVjdGVkIGlkZW50aWZpZXIgc3RhcnRpbmcgdmFsdWUnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgc3RhcnRpbmdDb2x1bW4gPSB0aGlzLmNvbHVtbjtcbiAgICB3aGlsZSAoaXNJZGVudGlmaWVyUGFydCh0aGlzLnBlZWspKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdmFyIHN0clZhbHVlID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCB0aGlzLmxpbmUsIENzc1Rva2VuVHlwZS5JZGVudGlmaWVyLCBzdHJWYWx1ZSk7XG4gIH1cblxuICBzY2FuQ3NzVmFsdWVGdW5jdGlvbigpOiBDc3NUb2tlbiB7XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgc3RhcnRpbmdDb2x1bW4gPSB0aGlzLmNvbHVtbjtcbiAgICB3aGlsZSAodGhpcy5wZWVrICE9ICRFT0YgJiYgdGhpcy5wZWVrICE9ICRSUEFSRU4pIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB2YXIgc3RyVmFsdWUgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhzdGFydCwgdGhpcy5pbmRleCk7XG4gICAgcmV0dXJuIG5ldyBDc3NUb2tlbihzdGFydCwgc3RhcnRpbmdDb2x1bW4sIHRoaXMubGluZSwgQ3NzVG9rZW5UeXBlLklkZW50aWZpZXIsIHN0clZhbHVlKTtcbiAgfVxuXG4gIHNjYW5DaGFyYWN0ZXIoKTogQ3NzVG9rZW4ge1xuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHN0YXJ0aW5nQ29sdW1uID0gdGhpcy5jb2x1bW47XG4gICAgaWYgKHRoaXMuYXNzZXJ0Q29uZGl0aW9uKGlzVmFsaWRDc3NDaGFyYWN0ZXIodGhpcy5wZWVrLCB0aGlzLl9jdXJyZW50TW9kZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJTdHIodGhpcy5wZWVrKSArICcgaXMgbm90IGEgdmFsaWQgQ1NTIGNoYXJhY3RlcicpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgYyA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCBzdGFydCArIDEpO1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuXG4gICAgcmV0dXJuIG5ldyBDc3NUb2tlbihzdGFydCwgc3RhcnRpbmdDb2x1bW4sIHRoaXMubGluZSwgQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgYyk7XG4gIH1cblxuICBzY2FuQXRFeHByZXNzaW9uKCk6IENzc1Rva2VuIHtcbiAgICBpZiAodGhpcy5hc3NlcnRDb25kaXRpb24odGhpcy5wZWVrID09ICRBVCwgJ0V4cGVjdGVkIEAgdmFsdWUnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgc3RhcnRpbmdDb2x1bW4gPSB0aGlzLmNvbHVtbjtcbiAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAoaXNJZGVudGlmaWVyU3RhcnQodGhpcy5wZWVrLCB0aGlzLnBlZWtQZWVrKSkge1xuICAgICAgdmFyIGlkZW50ID0gdGhpcy5zY2FuSWRlbnRpZmllcigpO1xuICAgICAgdmFyIHN0clZhbHVlID0gJ0AnICsgaWRlbnQuc3RyVmFsdWU7XG4gICAgICByZXR1cm4gbmV3IENzc1Rva2VuKHN0YXJ0LCBzdGFydGluZ0NvbHVtbiwgdGhpcy5saW5lLCBDc3NUb2tlblR5cGUuQXRLZXl3b3JkLCBzdHJWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnNjYW5DaGFyYWN0ZXIoKTtcbiAgICB9XG4gIH1cblxuICBhc3NlcnRDb25kaXRpb24oc3RhdHVzOiBib29sZWFuLCBlcnJvck1lc3NhZ2U6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghc3RhdHVzKSB7XG4gICAgICB0aGlzLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCBlcnJvclRva2VuVmFsdWU6IHN0cmluZyA9IG51bGwsIGRvTm90QWR2YW5jZTogYm9vbGVhbiA9IGZhbHNlKTogQ3NzVG9rZW4ge1xuICAgIHZhciBpbmRleDogbnVtYmVyID0gdGhpcy5pbmRleDtcbiAgICB2YXIgY29sdW1uOiBudW1iZXIgPSB0aGlzLmNvbHVtbjtcbiAgICB2YXIgbGluZTogbnVtYmVyID0gdGhpcy5saW5lO1xuICAgIGVycm9yVG9rZW5WYWx1ZSA9XG4gICAgICAgIGlzUHJlc2VudChlcnJvclRva2VuVmFsdWUpID8gZXJyb3JUb2tlblZhbHVlIDogU3RyaW5nV3JhcHBlci5mcm9tQ2hhckNvZGUodGhpcy5wZWVrKTtcbiAgICB2YXIgaW52YWxpZFRva2VuID0gbmV3IENzc1Rva2VuKGluZGV4LCBjb2x1bW4sIGxpbmUsIENzc1Rva2VuVHlwZS5JbnZhbGlkLCBlcnJvclRva2VuVmFsdWUpO1xuICAgIHZhciBlcnJvck1lc3NhZ2UgPVxuICAgICAgICBnZW5lcmF0ZUVycm9yTWVzc2FnZSh0aGlzLmlucHV0LCBtZXNzYWdlLCBlcnJvclRva2VuVmFsdWUsIGluZGV4LCBsaW5lLCBjb2x1bW4pO1xuICAgIGlmICghZG9Ob3RBZHZhbmNlKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdGhpcy5fY3VycmVudEVycm9yID0gbmV3IENzc1NjYW5uZXJFcnJvcihpbnZhbGlkVG9rZW4sIGVycm9yTWVzc2FnZSk7XG4gICAgcmV0dXJuIGludmFsaWRUb2tlbjtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0F0S2V5d29yZChjdXJyZW50OiBDc3NUb2tlbiwgbmV4dDogQ3NzVG9rZW4pOiBib29sZWFuIHtcbiAgcmV0dXJuIGN1cnJlbnQubnVtVmFsdWUgPT0gJEFUICYmIG5leHQudHlwZSA9PSBDc3NUb2tlblR5cGUuSWRlbnRpZmllcjtcbn1cblxuZnVuY3Rpb24gaXNDaGFyTWF0Y2godGFyZ2V0OiBudW1iZXIsIHByZXZpb3VzOiBudW1iZXIsIGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gY29kZSA9PSB0YXJnZXQgJiYgcHJldmlvdXMgIT0gJEJBQ0tTTEFTSDtcbn1cblxuZnVuY3Rpb24gaXNEaWdpdChjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuICQwIDw9IGNvZGUgJiYgY29kZSA8PSAkOTtcbn1cblxuZnVuY3Rpb24gaXNDb21tZW50U3RhcnQoY29kZTogbnVtYmVyLCBuZXh0OiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvZGUgPT0gJFNMQVNIICYmIG5leHQgPT0gJFNUQVI7XG59XG5cbmZ1bmN0aW9uIGlzQ29tbWVudEVuZChjb2RlOiBudW1iZXIsIG5leHQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gY29kZSA9PSAkU1RBUiAmJiBuZXh0ID09ICRTTEFTSDtcbn1cblxuZnVuY3Rpb24gaXNTdHJpbmdTdGFydChjb2RlOiBudW1iZXIsIG5leHQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICB2YXIgdGFyZ2V0ID0gY29kZTtcbiAgaWYgKHRhcmdldCA9PSAkQkFDS1NMQVNIKSB7XG4gICAgdGFyZ2V0ID0gbmV4dDtcbiAgfVxuICByZXR1cm4gdGFyZ2V0ID09ICREUSB8fCB0YXJnZXQgPT0gJFNRO1xufVxuXG5mdW5jdGlvbiBpc0lkZW50aWZpZXJTdGFydChjb2RlOiBudW1iZXIsIG5leHQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICB2YXIgdGFyZ2V0ID0gY29kZTtcbiAgaWYgKHRhcmdldCA9PSAkTUlOVVMpIHtcbiAgICB0YXJnZXQgPSBuZXh0O1xuICB9XG5cbiAgcmV0dXJuICgkYSA8PSB0YXJnZXQgJiYgdGFyZ2V0IDw9ICR6KSB8fCAoJEEgPD0gdGFyZ2V0ICYmIHRhcmdldCA8PSAkWikgfHwgdGFyZ2V0ID09ICRCQUNLU0xBU0ggfHxcbiAgICAgICAgIHRhcmdldCA9PSAkTUlOVVMgfHwgdGFyZ2V0ID09ICRfO1xufVxuXG5mdW5jdGlvbiBpc0lkZW50aWZpZXJQYXJ0KHRhcmdldDogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiAoJGEgPD0gdGFyZ2V0ICYmIHRhcmdldCA8PSAkeikgfHwgKCRBIDw9IHRhcmdldCAmJiB0YXJnZXQgPD0gJFopIHx8IHRhcmdldCA9PSAkQkFDS1NMQVNIIHx8XG4gICAgICAgICB0YXJnZXQgPT0gJE1JTlVTIHx8IHRhcmdldCA9PSAkXyB8fCBpc0RpZ2l0KHRhcmdldCk7XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRQc2V1ZG9TZWxlY3RvckNoYXJhY3Rlcihjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkTFBBUkVOOlxuICAgIGNhc2UgJFJQQVJFTjpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWxpZEtleWZyYW1lQmxvY2tDaGFyYWN0ZXIoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb2RlID09ICRQRVJDRU5UO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkQXR0cmlidXRlU2VsZWN0b3JDaGFyYWN0ZXIoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIC8vIHZhbHVlXip8JH49c29tZXRoaW5nXG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJCQ6XG4gICAgY2FzZSAkUElQRTpcbiAgICBjYXNlICRDQVJFVDpcbiAgICBjYXNlICRUSUxEQTpcbiAgICBjYXNlICRTVEFSOlxuICAgIGNhc2UgJEVROlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkU2VsZWN0b3JDaGFyYWN0ZXIoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIC8vIHNlbGVjdG9yIFsga2V5ICAgPSB2YWx1ZSBdXG4gIC8vIElERU5UICAgIEMgSURFTlQgQyBJREVOVCBDXG4gIC8vICNpZCwgLmNsYXNzLCAqK34+XG4gIC8vIHRhZzpQU0VVRE9cbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkSEFTSDpcbiAgICBjYXNlICRQRVJJT0Q6XG4gICAgY2FzZSAkVElMREE6XG4gICAgY2FzZSAkU1RBUjpcbiAgICBjYXNlICRQTFVTOlxuICAgIGNhc2UgJEdUOlxuICAgIGNhc2UgJENPTE9OOlxuICAgIGNhc2UgJFBJUEU6XG4gICAgY2FzZSAkQ09NTUE6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRTdHlsZUJsb2NrQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAvLyBrZXk6dmFsdWU7XG4gIC8vIGtleTpjYWxjKHNvbWV0aGluZyAuLi4gKVxuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRIQVNIOlxuICAgIGNhc2UgJFNFTUlDT0xPTjpcbiAgICBjYXNlICRDT0xPTjpcbiAgICBjYXNlICRQRVJDRU5UOlxuICAgIGNhc2UgJFNMQVNIOlxuICAgIGNhc2UgJEJBQ0tTTEFTSDpcbiAgICBjYXNlICRCQU5HOlxuICAgIGNhc2UgJFBFUklPRDpcbiAgICBjYXNlICRMUEFSRU46XG4gICAgY2FzZSAkUlBBUkVOOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkTWVkaWFRdWVyeVJ1bGVDaGFyYWN0ZXIoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIC8vIChtaW4td2lkdGg6IDcuNWVtKSBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpXG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJExQQVJFTjpcbiAgICBjYXNlICRSUEFSRU46XG4gICAgY2FzZSAkQ09MT046XG4gICAgY2FzZSAkUEVSQ0VOVDpcbiAgICBjYXNlICRQRVJJT0Q6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRBdFJ1bGVDaGFyYWN0ZXIoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIC8vIEBkb2N1bWVudCB1cmwoaHR0cDovL3d3dy53My5vcmcvcGFnZT9zb21ldGhpbmc9b24jaGFzaCksXG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJExQQVJFTjpcbiAgICBjYXNlICRSUEFSRU46XG4gICAgY2FzZSAkQ09MT046XG4gICAgY2FzZSAkUEVSQ0VOVDpcbiAgICBjYXNlICRQRVJJT0Q6XG4gICAgY2FzZSAkU0xBU0g6XG4gICAgY2FzZSAkQkFDS1NMQVNIOlxuICAgIGNhc2UgJEhBU0g6XG4gICAgY2FzZSAkRVE6XG4gICAgY2FzZSAkUVVFU1RJT046XG4gICAgY2FzZSAkQU1QRVJTQU5EOlxuICAgIGNhc2UgJFNUQVI6XG4gICAgY2FzZSAkQ09NTUE6XG4gICAgY2FzZSAkTUlOVVM6XG4gICAgY2FzZSAkUExVUzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWxpZFN0eWxlRnVuY3Rpb25DaGFyYWN0ZXIoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJFBFUklPRDpcbiAgICBjYXNlICRNSU5VUzpcbiAgICBjYXNlICRQTFVTOlxuICAgIGNhc2UgJFNUQVI6XG4gICAgY2FzZSAkU0xBU0g6XG4gICAgY2FzZSAkTFBBUkVOOlxuICAgIGNhc2UgJFJQQVJFTjpcbiAgICBjYXNlICRDT01NQTpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWxpZEJsb2NrQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAvLyBAc29tZXRoaW5nIHsgfVxuICAvLyBJREVOVFxuICByZXR1cm4gY29kZSA9PSAkQVQ7XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRDc3NDaGFyYWN0ZXIoY29kZTogbnVtYmVyLCBtb2RlOiBDc3NMZXhlck1vZGUpOiBib29sZWFuIHtcbiAgc3dpdGNoIChtb2RlKSB7XG4gICAgY2FzZSBDc3NMZXhlck1vZGUuQUxMOlxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLkFMTF9UUkFDS19XUzpcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuU0VMRUNUT1I6XG4gICAgICByZXR1cm4gaXNWYWxpZFNlbGVjdG9yQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuUFNFVURPX1NFTEVDVE9SOlxuICAgICAgcmV0dXJuIGlzVmFsaWRQc2V1ZG9TZWxlY3RvckNoYXJhY3Rlcihjb2RlKTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLkFUVFJJQlVURV9TRUxFQ1RPUjpcbiAgICAgIHJldHVybiBpc1ZhbGlkQXR0cmlidXRlU2VsZWN0b3JDaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5NRURJQV9RVUVSWTpcbiAgICAgIHJldHVybiBpc1ZhbGlkTWVkaWFRdWVyeVJ1bGVDaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5BVF9SVUxFX1FVRVJZOlxuICAgICAgcmV0dXJuIGlzVmFsaWRBdFJ1bGVDaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5LRVlGUkFNRV9CTE9DSzpcbiAgICAgIHJldHVybiBpc1ZhbGlkS2V5ZnJhbWVCbG9ja0NoYXJhY3Rlcihjb2RlKTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLlNUWUxFX0JMT0NLOlxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLlNUWUxFX1ZBTFVFOlxuICAgICAgcmV0dXJuIGlzVmFsaWRTdHlsZUJsb2NrQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuU1RZTEVfQ0FMQ19GVU5DVElPTjpcbiAgICAgIHJldHVybiBpc1ZhbGlkU3R5bGVGdW5jdGlvbkNoYXJhY3Rlcihjb2RlKTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLkJMT0NLOlxuICAgICAgcmV0dXJuIGlzVmFsaWRCbG9ja0NoYXJhY3Rlcihjb2RlKTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hhckNvZGUoaW5wdXQsIGluZGV4KTogbnVtYmVyIHtcbiAgcmV0dXJuIGluZGV4ID49IGlucHV0Lmxlbmd0aCA/ICRFT0YgOiBTdHJpbmdXcmFwcGVyLmNoYXJDb2RlQXQoaW5wdXQsIGluZGV4KTtcbn1cblxuZnVuY3Rpb24gY2hhclN0cihjb2RlOiBudW1iZXIpOiBzdHJpbmcge1xuICByZXR1cm4gU3RyaW5nV3JhcHBlci5mcm9tQ2hhckNvZGUoY29kZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05ld2xpbmUoY29kZSk6IGJvb2xlYW4ge1xuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRGRjpcbiAgICBjYXNlICRDUjpcbiAgICBjYXNlICRMRjpcbiAgICBjYXNlICRWVEFCOlxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=