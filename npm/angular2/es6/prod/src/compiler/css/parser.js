import { ParseSourceSpan, ParseSourceFile, ParseLocation, ParseError } from "angular2/src/compiler/parse_util";
import { bitWiseOr, bitWiseAnd, isPresent } from "angular2/src/facade/lang";
import { CssLexerMode, CssToken, CssTokenType, generateErrorMessage, $AT, $EOF, $RBRACE, $LBRACE, $LBRACKET, $RBRACKET, $LPAREN, $RPAREN, $COMMA, $COLON, $SEMICOLON, isNewline } from "angular2/src/compiler/css/lexer";
export { CssToken } from "angular2/src/compiler/css/lexer";
export var BlockType;
(function (BlockType) {
    BlockType[BlockType["Import"] = 0] = "Import";
    BlockType[BlockType["Charset"] = 1] = "Charset";
    BlockType[BlockType["Namespace"] = 2] = "Namespace";
    BlockType[BlockType["Supports"] = 3] = "Supports";
    BlockType[BlockType["Keyframes"] = 4] = "Keyframes";
    BlockType[BlockType["MediaQuery"] = 5] = "MediaQuery";
    BlockType[BlockType["Selector"] = 6] = "Selector";
    BlockType[BlockType["FontFace"] = 7] = "FontFace";
    BlockType[BlockType["Page"] = 8] = "Page";
    BlockType[BlockType["Document"] = 9] = "Document";
    BlockType[BlockType["Viewport"] = 10] = "Viewport";
    BlockType[BlockType["Unsupported"] = 11] = "Unsupported";
})(BlockType || (BlockType = {}));
const EOF_DELIM = 1;
const RBRACE_DELIM = 2;
const LBRACE_DELIM = 4;
const COMMA_DELIM = 8;
const COLON_DELIM = 16;
const SEMICOLON_DELIM = 32;
const NEWLINE_DELIM = 64;
const RPAREN_DELIM = 128;
function mergeTokens(tokens, separator = "") {
    var mainToken = tokens[0];
    var str = mainToken.strValue;
    for (var i = 1; i < tokens.length; i++) {
        str += separator + tokens[i].strValue;
    }
    return new CssToken(mainToken.index, mainToken.column, mainToken.line, mainToken.type, str);
}
function getDelimFromToken(token) {
    return getDelimFromCharacter(token.numValue);
}
function getDelimFromCharacter(code) {
    switch (code) {
        case $EOF:
            return EOF_DELIM;
        case $COMMA:
            return COMMA_DELIM;
        case $COLON:
            return COLON_DELIM;
        case $SEMICOLON:
            return SEMICOLON_DELIM;
        case $RBRACE:
            return RBRACE_DELIM;
        case $LBRACE:
            return LBRACE_DELIM;
        case $RPAREN:
            return RPAREN_DELIM;
        default:
            return isNewline(code) ? NEWLINE_DELIM : 0;
    }
}
function characterContainsDelimiter(code, delimiters) {
    return bitWiseAnd([getDelimFromCharacter(code), delimiters]) > 0;
}
export class CssAST {
    visit(visitor, context) { }
}
export class ParsedCssResult {
    constructor(errors, ast) {
        this.errors = errors;
        this.ast = ast;
    }
}
export class CssParser {
    constructor(_scanner, _fileName) {
        this._scanner = _scanner;
        this._fileName = _fileName;
        this._errors = [];
        this._file = new ParseSourceFile(this._scanner.input, _fileName);
    }
    /** @internal */
    _resolveBlockType(token) {
        switch (token.strValue) {
            case '@-o-keyframes':
            case '@-moz-keyframes':
            case '@-webkit-keyframes':
            case '@keyframes':
                return BlockType.Keyframes;
            case '@charset':
                return BlockType.Charset;
            case '@import':
                return BlockType.Import;
            case '@namespace':
                return BlockType.Namespace;
            case '@page':
                return BlockType.Page;
            case '@document':
                return BlockType.Document;
            case '@media':
                return BlockType.MediaQuery;
            case '@font-face':
                return BlockType.FontFace;
            case '@viewport':
                return BlockType.Viewport;
            case '@supports':
                return BlockType.Supports;
            default:
                return BlockType.Unsupported;
        }
    }
    parse() {
        var delimiters = EOF_DELIM;
        var ast = this._parseStyleSheet(delimiters);
        var errors = this._errors;
        this._errors = [];
        return new ParsedCssResult(errors, ast);
    }
    /** @internal */
    _parseStyleSheet(delimiters) {
        var results = [];
        this._scanner.consumeEmptyStatements();
        while (this._scanner.peek != $EOF) {
            this._scanner.setMode(CssLexerMode.BLOCK);
            results.push(this._parseRule(delimiters));
        }
        return new CssStyleSheetAST(results);
    }
    /** @internal */
    _parseRule(delimiters) {
        if (this._scanner.peek == $AT) {
            return this._parseAtRule(delimiters);
        }
        return this._parseSelectorRule(delimiters);
    }
    /** @internal */
    _parseAtRule(delimiters) {
        this._scanner.setMode(CssLexerMode.BLOCK);
        var token = this._scan();
        this._assertCondition(token.type == CssTokenType.AtKeyword, `The CSS Rule ${token.strValue} is not a valid [@] rule.`, token);
        var block, type = this._resolveBlockType(token);
        switch (type) {
            case BlockType.Charset:
            case BlockType.Namespace:
            case BlockType.Import:
                var value = this._parseValue(delimiters);
                this._scanner.setMode(CssLexerMode.BLOCK);
                this._scanner.consumeEmptyStatements();
                return new CssInlineRuleAST(type, value);
            case BlockType.Viewport:
            case BlockType.FontFace:
                block = this._parseStyleBlock(delimiters);
                return new CssBlockRuleAST(type, block);
            case BlockType.Keyframes:
                var tokens = this._collectUntilDelim(bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]));
                // keyframes only have one identifier name
                var name = tokens[0];
                return new CssKeyframeRuleAST(name, this._parseKeyframeBlock(delimiters));
            case BlockType.MediaQuery:
                this._scanner.setMode(CssLexerMode.MEDIA_QUERY);
                var tokens = this._collectUntilDelim(bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]));
                return new CssMediaQueryRuleAST(tokens, this._parseBlock(delimiters));
            case BlockType.Document:
            case BlockType.Supports:
            case BlockType.Page:
                this._scanner.setMode(CssLexerMode.AT_RULE_QUERY);
                var tokens = this._collectUntilDelim(bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]));
                return new CssBlockDefinitionRuleAST(type, tokens, this._parseBlock(delimiters));
            // if a custom @rule { ... } is used it should still tokenize the insides
            default:
                var listOfTokens = [];
                this._scanner.setMode(CssLexerMode.ALL);
                this._error(generateErrorMessage(this._scanner.input, `The CSS "at" rule "${token.strValue}" is not allowed to used here`, token.strValue, token.index, token.line, token.column), token);
                this._collectUntilDelim(bitWiseOr([delimiters, LBRACE_DELIM, SEMICOLON_DELIM]))
                    .forEach((token) => { listOfTokens.push(token); });
                if (this._scanner.peek == $LBRACE) {
                    this._consume(CssTokenType.Character, '{');
                    this._collectUntilDelim(bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]))
                        .forEach((token) => { listOfTokens.push(token); });
                    this._consume(CssTokenType.Character, '}');
                }
                return new CssUnknownTokenListAST(token, listOfTokens);
        }
    }
    /** @internal */
    _parseSelectorRule(delimiters) {
        var selectors = this._parseSelectors(delimiters);
        var block = this._parseStyleBlock(delimiters);
        this._scanner.setMode(CssLexerMode.BLOCK);
        this._scanner.consumeEmptyStatements();
        return new CssSelectorRuleAST(selectors, block);
    }
    /** @internal */
    _parseSelectors(delimiters) {
        delimiters = bitWiseOr([delimiters, LBRACE_DELIM]);
        var selectors = [];
        var isParsingSelectors = true;
        while (isParsingSelectors) {
            selectors.push(this._parseSelector(delimiters));
            isParsingSelectors = !characterContainsDelimiter(this._scanner.peek, delimiters);
            if (isParsingSelectors) {
                this._consume(CssTokenType.Character, ',');
                isParsingSelectors = !characterContainsDelimiter(this._scanner.peek, delimiters);
            }
        }
        return selectors;
    }
    /** @internal */
    _scan() {
        var output = this._scanner.scan();
        var token = output.token;
        var error = output.error;
        if (isPresent(error)) {
            this._error(error.rawMessage, token);
        }
        return token;
    }
    /** @internal */
    _consume(type, value = null) {
        var output = this._scanner.consume(type, value);
        var token = output.token;
        var error = output.error;
        if (isPresent(error)) {
            this._error(error.rawMessage, token);
        }
        return token;
    }
    /** @internal */
    _parseKeyframeBlock(delimiters) {
        delimiters = bitWiseOr([delimiters, RBRACE_DELIM]);
        this._scanner.setMode(CssLexerMode.KEYFRAME_BLOCK);
        this._consume(CssTokenType.Character, '{');
        var definitions = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            definitions.push(this._parseKeyframeDefinition(delimiters));
        }
        this._consume(CssTokenType.Character, '}');
        return new CssBlockAST(definitions);
    }
    /** @internal */
    _parseKeyframeDefinition(delimiters) {
        var stepTokens = [];
        delimiters = bitWiseOr([delimiters, LBRACE_DELIM]);
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            stepTokens.push(this._parseKeyframeLabel(bitWiseOr([delimiters, COMMA_DELIM])));
            if (this._scanner.peek != $LBRACE) {
                this._consume(CssTokenType.Character, ',');
            }
        }
        var styles = this._parseStyleBlock(bitWiseOr([delimiters, RBRACE_DELIM]));
        this._scanner.setMode(CssLexerMode.BLOCK);
        return new CssKeyframeDefinitionAST(stepTokens, styles);
    }
    /** @internal */
    _parseKeyframeLabel(delimiters) {
        this._scanner.setMode(CssLexerMode.KEYFRAME_BLOCK);
        return mergeTokens(this._collectUntilDelim(delimiters));
    }
    /** @internal */
    _parseSelector(delimiters) {
        delimiters = bitWiseOr([delimiters, COMMA_DELIM, LBRACE_DELIM]);
        this._scanner.setMode(CssLexerMode.SELECTOR);
        var selectorCssTokens = [];
        var isComplex = false;
        var wsCssToken;
        var previousToken;
        var parenCount = 0;
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            var code = this._scanner.peek;
            switch (code) {
                case $LPAREN:
                    parenCount++;
                    break;
                case $RPAREN:
                    parenCount--;
                    break;
                case $COLON:
                    this._scanner.setMode(CssLexerMode.PSEUDO_SELECTOR);
                    previousToken = this._consume(CssTokenType.Character, ':');
                    selectorCssTokens.push(previousToken);
                    continue;
                case $LBRACKET:
                    // if we are already inside an attribute selector then we can't
                    // jump into the mode again. Therefore this error will get picked
                    // up when the scan method is called below.
                    if (this._scanner.getMode() != CssLexerMode.ATTRIBUTE_SELECTOR) {
                        selectorCssTokens.push(this._consume(CssTokenType.Character, '['));
                        this._scanner.setMode(CssLexerMode.ATTRIBUTE_SELECTOR);
                        continue;
                    }
                    break;
                case $RBRACKET:
                    selectorCssTokens.push(this._consume(CssTokenType.Character, ']'));
                    this._scanner.setMode(CssLexerMode.SELECTOR);
                    continue;
            }
            var token = this._scan();
            // special case for the ":not(" selector since it
            // contains an inner selector that needs to be parsed
            // in isolation
            if (this._scanner.getMode() == CssLexerMode.PSEUDO_SELECTOR && isPresent(previousToken) &&
                previousToken.numValue == $COLON && token.strValue == "not" &&
                this._scanner.peek == $LPAREN) {
                selectorCssTokens.push(token);
                selectorCssTokens.push(this._consume(CssTokenType.Character, '('));
                // the inner selector inside of :not(...) can only be one
                // CSS selector (no commas allowed) therefore we parse only
                // one selector by calling the method below
                this._parseSelector(bitWiseOr([delimiters, RPAREN_DELIM]))
                    .tokens.forEach((innerSelectorToken) => { selectorCssTokens.push(innerSelectorToken); });
                selectorCssTokens.push(this._consume(CssTokenType.Character, ')'));
                continue;
            }
            previousToken = token;
            if (token.type == CssTokenType.Whitespace) {
                wsCssToken = token;
            }
            else {
                if (isPresent(wsCssToken)) {
                    selectorCssTokens.push(wsCssToken);
                    wsCssToken = null;
                    isComplex = true;
                }
                selectorCssTokens.push(token);
            }
        }
        if (this._scanner.getMode() == CssLexerMode.ATTRIBUTE_SELECTOR) {
            this._error(`Unbalanced CSS attribute selector at column ${previousToken.line}:${previousToken.column}`, previousToken);
        }
        else if (parenCount > 0) {
            this._error(`Unbalanced pseudo selector function value at column ${previousToken.line}:${previousToken.column}`, previousToken);
        }
        return new CssSelectorAST(selectorCssTokens, isComplex);
    }
    /** @internal */
    _parseValue(delimiters) {
        delimiters = bitWiseOr([delimiters, RBRACE_DELIM, SEMICOLON_DELIM, NEWLINE_DELIM]);
        this._scanner.setMode(CssLexerMode.STYLE_VALUE);
        var strValue = "";
        var tokens = [];
        var previous;
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            var token;
            if (isPresent(previous) && previous.type == CssTokenType.Identifier &&
                this._scanner.peek == $LPAREN) {
                token = this._consume(CssTokenType.Character, '(');
                tokens.push(token);
                strValue += token.strValue;
                this._scanner.setMode(CssLexerMode.STYLE_VALUE_FUNCTION);
                token = this._scan();
                tokens.push(token);
                strValue += token.strValue;
                this._scanner.setMode(CssLexerMode.STYLE_VALUE);
                token = this._consume(CssTokenType.Character, ')');
                tokens.push(token);
                strValue += token.strValue;
            }
            else {
                token = this._scan();
                if (token.type != CssTokenType.Whitespace) {
                    tokens.push(token);
                }
                strValue += token.strValue;
            }
            previous = token;
        }
        this._scanner.consumeWhitespace();
        var code = this._scanner.peek;
        if (code == $SEMICOLON) {
            this._consume(CssTokenType.Character, ';');
        }
        else if (code != $RBRACE) {
            this._error(generateErrorMessage(this._scanner.input, `The CSS key/value definition did not end with a semicolon`, previous.strValue, previous.index, previous.line, previous.column), previous);
        }
        return new CssStyleValueAST(tokens, strValue);
    }
    /** @internal */
    _collectUntilDelim(delimiters, assertType = null) {
        var tokens = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            var val = isPresent(assertType) ? this._consume(assertType) : this._scan();
            tokens.push(val);
        }
        return tokens;
    }
    /** @internal */
    _parseBlock(delimiters) {
        delimiters = bitWiseOr([delimiters, RBRACE_DELIM]);
        this._scanner.setMode(CssLexerMode.BLOCK);
        this._consume(CssTokenType.Character, '{');
        this._scanner.consumeEmptyStatements();
        var results = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            results.push(this._parseRule(delimiters));
        }
        this._consume(CssTokenType.Character, '}');
        this._scanner.setMode(CssLexerMode.BLOCK);
        this._scanner.consumeEmptyStatements();
        return new CssBlockAST(results);
    }
    /** @internal */
    _parseStyleBlock(delimiters) {
        delimiters = bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]);
        this._scanner.setMode(CssLexerMode.STYLE_BLOCK);
        this._consume(CssTokenType.Character, '{');
        this._scanner.consumeEmptyStatements();
        var definitions = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            definitions.push(this._parseDefinition(delimiters));
            this._scanner.consumeEmptyStatements();
        }
        this._consume(CssTokenType.Character, '}');
        this._scanner.setMode(CssLexerMode.STYLE_BLOCK);
        this._scanner.consumeEmptyStatements();
        return new CssBlockAST(definitions);
    }
    /** @internal */
    _parseDefinition(delimiters) {
        this._scanner.setMode(CssLexerMode.STYLE_BLOCK);
        var prop = this._consume(CssTokenType.Identifier);
        var parseValue, value = null;
        // the colon value separates the prop from the style.
        // there are a few cases as to what could happen if it
        // is missing
        switch (this._scanner.peek) {
            case $COLON:
                this._consume(CssTokenType.Character, ':');
                parseValue = true;
                break;
            case $SEMICOLON:
            case $RBRACE:
            case $EOF:
                parseValue = false;
                break;
            default:
                var propStr = [prop.strValue];
                if (this._scanner.peek != $COLON) {
                    // this will throw the error
                    var nextValue = this._consume(CssTokenType.Character, ':');
                    propStr.push(nextValue.strValue);
                    var remainingTokens = this._collectUntilDelim(bitWiseOr([delimiters, COLON_DELIM, SEMICOLON_DELIM]), CssTokenType.Identifier);
                    if (remainingTokens.length > 0) {
                        remainingTokens.forEach((token) => { propStr.push(token.strValue); });
                    }
                    prop = new CssToken(prop.index, prop.column, prop.line, prop.type, propStr.join(" "));
                }
                // this means we've reached the end of the definition and/or block
                if (this._scanner.peek == $COLON) {
                    this._consume(CssTokenType.Character, ':');
                    parseValue = true;
                }
                else {
                    parseValue = false;
                }
                break;
        }
        if (parseValue) {
            value = this._parseValue(delimiters);
        }
        else {
            this._error(generateErrorMessage(this._scanner.input, `The CSS property was not paired with a style value`, prop.strValue, prop.index, prop.line, prop.column), prop);
        }
        return new CssDefinitionAST(prop, value);
    }
    /** @internal */
    _assertCondition(status, errorMessage, problemToken) {
        if (!status) {
            this._error(errorMessage, problemToken);
            return true;
        }
        return false;
    }
    /** @internal */
    _error(message, problemToken) {
        var length = problemToken.strValue.length;
        var error = CssParseError.create(this._file, 0, problemToken.line, problemToken.column, length, message);
        this._errors.push(error);
    }
}
export class CssStyleValueAST extends CssAST {
    constructor(tokens, strValue) {
        super();
        this.tokens = tokens;
        this.strValue = strValue;
    }
    visit(visitor, context) { visitor.visitCssValue(this); }
}
export class CssRuleAST extends CssAST {
}
export class CssBlockRuleAST extends CssRuleAST {
    constructor(type, block, name = null) {
        super();
        this.type = type;
        this.block = block;
        this.name = name;
    }
    visit(visitor, context) { visitor.visitCssBlock(this.block, context); }
}
export class CssKeyframeRuleAST extends CssBlockRuleAST {
    constructor(name, block) {
        super(BlockType.Keyframes, block, name);
    }
    visit(visitor, context) { visitor.visitCssKeyframeRule(this, context); }
}
export class CssKeyframeDefinitionAST extends CssBlockRuleAST {
    constructor(_steps, block) {
        super(BlockType.Keyframes, block, mergeTokens(_steps, ","));
        this.steps = _steps;
    }
    visit(visitor, context) {
        visitor.visitCssKeyframeDefinition(this, context);
    }
}
export class CssBlockDefinitionRuleAST extends CssBlockRuleAST {
    constructor(type, query, block) {
        super(type, block);
        this.query = query;
        this.strValue = query.map(token => token.strValue).join("");
        var firstCssToken = query[0];
        this.name = new CssToken(firstCssToken.index, firstCssToken.column, firstCssToken.line, CssTokenType.Identifier, this.strValue);
    }
    visit(visitor, context) { visitor.visitCssBlock(this.block, context); }
}
export class CssMediaQueryRuleAST extends CssBlockDefinitionRuleAST {
    constructor(query, block) {
        super(BlockType.MediaQuery, query, block);
    }
    visit(visitor, context) { visitor.visitCssMediaQueryRule(this, context); }
}
export class CssInlineRuleAST extends CssRuleAST {
    constructor(type, value) {
        super();
        this.type = type;
        this.value = value;
    }
    visit(visitor, context) { visitor.visitInlineCssRule(this, context); }
}
export class CssSelectorRuleAST extends CssBlockRuleAST {
    constructor(selectors, block) {
        super(BlockType.Selector, block);
        this.selectors = selectors;
        this.strValue = selectors.map(selector => selector.strValue).join(",");
    }
    visit(visitor, context) { visitor.visitCssSelectorRule(this, context); }
}
export class CssDefinitionAST extends CssAST {
    constructor(property, value) {
        super();
        this.property = property;
        this.value = value;
    }
    visit(visitor, context) { visitor.visitCssDefinition(this, context); }
}
export class CssSelectorAST extends CssAST {
    constructor(tokens, isComplex = false) {
        super();
        this.tokens = tokens;
        this.isComplex = isComplex;
        this.strValue = tokens.map(token => token.strValue).join("");
    }
    visit(visitor, context) { visitor.visitCssSelector(this, context); }
}
export class CssBlockAST extends CssAST {
    constructor(entries) {
        super();
        this.entries = entries;
    }
    visit(visitor, context) { visitor.visitCssBlock(this, context); }
}
export class CssStyleSheetAST extends CssAST {
    constructor(rules) {
        super();
        this.rules = rules;
    }
    visit(visitor, context) { visitor.visitCssStyleSheet(this, context); }
}
export class CssParseError extends ParseError {
    constructor(span, message) {
        super(span, message);
    }
    static create(file, offset, line, col, length, errMsg) {
        var start = new ParseLocation(file, offset, line, col);
        var end = new ParseLocation(file, offset, line, col + length);
        var span = new ParseSourceSpan(start, end);
        return new CssParseError(span, "CSS Parse Error: " + errMsg);
    }
}
export class CssUnknownTokenListAST extends CssRuleAST {
    constructor(name, tokens) {
        super();
        this.name = name;
        this.tokens = tokens;
    }
    visit(visitor, context) { visitor.visitUnkownRule(this, context); }
}
