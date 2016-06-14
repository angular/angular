import {$AT, $COLON, $COMMA, $EOF, $GT, $LBRACE, $LBRACKET, $LPAREN, $PLUS, $RBRACE, $RBRACKET, $RPAREN, $SEMICOLON, $SLASH, $SPACE, $TAB, $TILDA, CssLexerMode, CssScanner, CssScannerError, CssToken, CssTokenType, generateErrorMessage, isNewline, isWhitespace} from '@angular/compiler/src/css/lexer';
import {ParseError, ParseLocation, ParseSourceFile, ParseSourceSpan} from '@angular/compiler/src/parse_util';

import {NumberWrapper, StringWrapper, bitWiseAnd, bitWiseNot, bitWiseOr, isPresent} from '../facade/lang';

const SPACE_OPERATOR = ' ';

export {CssToken} from '@angular/compiler/src/css/lexer';

export enum BlockType {
  Import,
  Charset,
  Namespace,
  Supports,
  Keyframes,
  MediaQuery,
  Selector,
  FontFace,
  Page,
  Document,
  Viewport,
  Unsupported
}

const EOF_DELIM = 1;
const RBRACE_DELIM = 2;
const LBRACE_DELIM = 4;
const COMMA_DELIM = 8;
const COLON_DELIM = 16;
const SEMICOLON_DELIM = 32;
const NEWLINE_DELIM = 64;
const RPAREN_DELIM = 128;
const LPAREN_DELIM = 256;
const SPACE_DELIM = 512;

function _pseudoSelectorSupportsInnerSelectors(name: string) {
  return ['not', 'host', 'host-context'].indexOf(name) >= 0;
}

function isSelectorOperatorCharacter(code: number): boolean {
  switch (code) {
    case $SLASH:
    case $TILDA:
    case $PLUS:
    case $GT:
      return true;
    default:
      return isWhitespace(code);
  }
}

function mergeTokens(tokens: CssToken[], separator: string = ''): CssToken {
  var mainToken = tokens[0];
  var str = mainToken.strValue;
  for (var i = 1; i < tokens.length; i++) {
    str += separator + tokens[i].strValue;
  }

  return new CssToken(mainToken.index, mainToken.column, mainToken.line, mainToken.type, str);
}

function getDelimFromToken(token: CssToken): number {
  return getDelimFromCharacter(token.numValue);
}

function getDelimFromCharacter(code: number): number {
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
    case $SPACE:
    case $TAB:
      return SPACE_DELIM;
    default:
      return isNewline(code) ? NEWLINE_DELIM : 0;
  }
}

function characterContainsDelimiter(code: number, delimiters: number): boolean {
  return bitWiseAnd([getDelimFromCharacter(code), delimiters]) > 0;
}

export abstract class CssAST {
  constructor(public start: number, public end: number) {}
  visit(visitor: CssASTVisitor, context?: any): any { return null; }
}

export interface CssASTVisitor {
  visitCssValue(ast: CssStyleValueAST, context?: any): any;
  visitInlineCssRule(ast: CssInlineRuleAST, context?: any): any;
  visitCssAtRulePredicate(ast: CssAtRulePredicateAST, context?: any): any;
  visitCssKeyframeRule(ast: CssKeyframeRuleAST, context?: any): any;
  visitCssKeyframeDefinition(ast: CssKeyframeDefinitionAST, context?: any): any;
  visitCssMediaQueryRule(ast: CssMediaQueryRuleAST, context?: any): any;
  visitCssSelectorRule(ast: CssSelectorRuleAST, context?: any): any;
  visitCssSelector(ast: CssSelectorAST, context?: any): any;
  visitCssSimpleSelector(ast: CssSimpleSelectorAST, context?: any): any;
  visitCssPseudoSelector(ast: CssPseudoSelectorAST, context?: any): any;
  visitCssDefinition(ast: CssDefinitionAST, context?: any): any;
  visitCssBlock(ast: CssBlockAST, context?: any): any;
  visitCssStylesBlock(ast: CssStylesBlockAST, context?: any): any;
  visitCssStyleSheet(ast: CssStyleSheetAST, context?: any): any;
  visitUnknownRule(ast: CssUnknownRuleAST, context?: any): any;
  visitUnknownTokenList(ast: CssUnknownTokenListAST, context?: any): any;
}

export class ParsedCssResult {
  constructor(public errors: CssParseError[], public ast: CssStyleSheetAST) {}
}

export class CssParser {
  private _errors: CssParseError[] = [];
  private _file: ParseSourceFile;

  constructor(private _scanner: CssScanner, private _fileName: string) {
    this._file = new ParseSourceFile(this._scanner.input, _fileName);
  }

  /** @internal */
  _resolveBlockType(token: CssToken): BlockType {
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

  parse(): ParsedCssResult {
    var delimiters: number = EOF_DELIM;
    var ast = this._parseStyleSheet(delimiters);

    var errors = this._errors;
    this._errors = [];

    return new ParsedCssResult(errors, ast);
  }

  /** @internal */
  _parseStyleSheet(delimiters: number): CssStyleSheetAST {
    var start = this._getScannerIndex();
    var results: any[] /** TODO #9100 */ = [];
    this._scanner.consumeEmptyStatements();
    while (this._scanner.peek != $EOF) {
      this._scanner.setMode(CssLexerMode.BLOCK);
      results.push(this._parseRule(delimiters));
    }
    var end = this._getScannerIndex() - 1;
    return new CssStyleSheetAST(start, end, results);
  }

  /** @internal */
  _parseRule(delimiters: number): CssRuleAST {
    if (this._scanner.peek == $AT) {
      return this._parseAtRule(delimiters);
    }
    return this._parseSelectorRule(delimiters);
  }

  /** @internal */
  _parseAtRule(delimiters: number): CssRuleAST {
    var start = this._getScannerIndex();
    var end: number;

    this._scanner.setMode(CssLexerMode.BLOCK);
    var token = this._scan();

    this._assertCondition(
        token.type == CssTokenType.AtKeyword,
        `The CSS Rule ${token.strValue} is not a valid [@] rule.`, token);

    var block: CssBlockAST;
    var type = this._resolveBlockType(token);
    switch (type) {
      case BlockType.Charset:
      case BlockType.Namespace:
      case BlockType.Import:
        var value = this._parseValue(delimiters);
        this._scanner.setMode(CssLexerMode.BLOCK);
        end = value.end;
        this._scanner.consumeEmptyStatements();
        return new CssInlineRuleAST(start, end, type, value);

      case BlockType.Viewport:
      case BlockType.FontFace:
        block = this._parseStyleBlock(delimiters);
        end = this._scanner.index - 1;
        return new CssBlockRuleAST(start, end, type, block);

      case BlockType.Keyframes:
        var tokens = this._collectUntilDelim(bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]));
        // keyframes only have one identifier name
        var name = tokens[0];
        end = this._scanner.index - 1;
        return new CssKeyframeRuleAST(start, end, name, this._parseKeyframeBlock(delimiters));

      case BlockType.MediaQuery:
        this._scanner.setMode(CssLexerMode.MEDIA_QUERY);
        var tokens = this._collectUntilDelim(bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]));
        end = this._scanner.index - 1;
        var strValue = this._scanner.input.substring(start, end);
        var query = new CssAtRulePredicateAST(start, end, strValue, tokens);
        block = this._parseBlock(delimiters);
        end = this._scanner.index - 1;
        strValue = this._scanner.input.substring(start, end);
        return new CssMediaQueryRuleAST(start, end, strValue, query, block);

      case BlockType.Document:
      case BlockType.Supports:
      case BlockType.Page:
        this._scanner.setMode(CssLexerMode.AT_RULE_QUERY);
        var tokens = this._collectUntilDelim(bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]));
        end = this._scanner.index - 1;
        var strValue = this._scanner.input.substring(start, end);
        var query = new CssAtRulePredicateAST(start, end, strValue, tokens);
        block = this._parseBlock(delimiters);
        end = this._scanner.index - 1;
        strValue = this._scanner.input.substring(start, end);
        return new CssBlockDefinitionRuleAST(start, end, strValue, type, query, block);

      // if a custom @rule { ... } is used it should still tokenize the insides
      default:
        var listOfTokens: CssToken[] = [];
        var tokenName = token.strValue;
        this._scanner.setMode(CssLexerMode.ALL);
        this._error(
            generateErrorMessage(
                this._scanner.input, `The CSS "at" rule "${tokenName}" is not allowed to used here`,
                token.strValue, token.index, token.line, token.column),
            token);

        this._collectUntilDelim(bitWiseOr([delimiters, LBRACE_DELIM, SEMICOLON_DELIM]))
            .forEach((token) => { listOfTokens.push(token); });
        if (this._scanner.peek == $LBRACE) {
          listOfTokens.push(this._consume(CssTokenType.Character, '{'));
          this._collectUntilDelim(bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]))
              .forEach((token) => { listOfTokens.push(token); });
          listOfTokens.push(this._consume(CssTokenType.Character, '}'));
        }
        end = this._scanner.index - 1;
        return new CssUnknownRuleAST(start, end, tokenName, listOfTokens);
    }
  }

  /** @internal */
  _parseSelectorRule(delimiters: number): CssRuleAST {
    var start = this._getScannerIndex();
    var selectors = this._parseSelectors(delimiters);
    var block = this._parseStyleBlock(delimiters);
    var end = this._getScannerIndex() - 1;
    var token: CssRuleAST;
    if (isPresent(block)) {
      token = new CssSelectorRuleAST(start, end, selectors, block);
    } else {
      var name = this._scanner.input.substring(start, end);
      var innerTokens: CssToken[] = [];
      selectors.forEach((selector: CssSelectorAST) => {
        selector.selectorParts.forEach((part: CssSimpleSelectorAST) => {
          part.tokens.forEach((token: CssToken) => { innerTokens.push(token); });
        });
      });
      token = new CssUnknownTokenListAST(start, end, name, innerTokens);
    }
    this._scanner.setMode(CssLexerMode.BLOCK);
    this._scanner.consumeEmptyStatements();
    return token;
  }

  /** @internal */
  _parseSelectors(delimiters: number): CssSelectorAST[] {
    delimiters = bitWiseOr([delimiters, LBRACE_DELIM, SEMICOLON_DELIM]);

    var selectors: any[] /** TODO #9100 */ = [];
    var isParsingSelectors = true;
    while (isParsingSelectors) {
      selectors.push(this._parseSelector(delimiters));

      isParsingSelectors = !characterContainsDelimiter(this._scanner.peek, delimiters);

      if (isParsingSelectors) {
        this._consume(CssTokenType.Character, ',');
        isParsingSelectors = !characterContainsDelimiter(this._scanner.peek, delimiters);
        if (isParsingSelectors) {
          this._scanner.consumeWhitespace();
        }
      }
    }

    return selectors;
  }

  /** @internal */
  _scan(): CssToken {
    var output = this._scanner.scan();
    var token = output.token;
    var error = output.error;
    if (isPresent(error)) {
      this._error(error.rawMessage, token);
    }
    return token;
  }

  /** @internal */
  _getScannerIndex(): number { return this._scanner.index; }

  /** @internal */
  _consume(type: CssTokenType, value: string = null): CssToken {
    var output = this._scanner.consume(type, value);
    var token = output.token;
    var error = output.error;
    if (isPresent(error)) {
      this._error(error.rawMessage, token);
    }
    return token;
  }

  /** @internal */
  _parseKeyframeBlock(delimiters: number): CssBlockAST {
    var start = this._getScannerIndex();

    delimiters = bitWiseOr([delimiters, RBRACE_DELIM]);
    this._scanner.setMode(CssLexerMode.KEYFRAME_BLOCK);

    this._consume(CssTokenType.Character, '{');

    var definitions: any[] /** TODO #9100 */ = [];
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      definitions.push(this._parseKeyframeDefinition(delimiters));
    }

    this._consume(CssTokenType.Character, '}');

    var end = this._getScannerIndex() - 1;
    return new CssBlockAST(start, end, definitions);
  }

  /** @internal */
  _parseKeyframeDefinition(delimiters: number): CssKeyframeDefinitionAST {
    var start = this._getScannerIndex();
    var stepTokens: any[] /** TODO #9100 */ = [];
    delimiters = bitWiseOr([delimiters, LBRACE_DELIM]);
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      stepTokens.push(this._parseKeyframeLabel(bitWiseOr([delimiters, COMMA_DELIM])));
      if (this._scanner.peek != $LBRACE) {
        this._consume(CssTokenType.Character, ',');
      }
    }
    var styles = this._parseStyleBlock(bitWiseOr([delimiters, RBRACE_DELIM]));
    this._scanner.setMode(CssLexerMode.BLOCK);
    var end = this._getScannerIndex() - 1;
    return new CssKeyframeDefinitionAST(start, end, stepTokens, styles);
  }

  /** @internal */
  _parseKeyframeLabel(delimiters: number): CssToken {
    this._scanner.setMode(CssLexerMode.KEYFRAME_BLOCK);
    return mergeTokens(this._collectUntilDelim(delimiters));
  }

  /** @internal */
  _parsePseudoSelector(delimiters: number): CssPseudoSelectorAST {
    var start = this._getScannerIndex();

    delimiters = bitWiseAnd([delimiters, bitWiseNot(COMMA_DELIM)]);

    // we keep the original value since we may use it to recurse when :not, :host are used
    var startingDelims = delimiters;

    var startToken = this._consume(CssTokenType.Character, ':');
    var strValue = startToken.strValue;
    var tokens = [startToken];

    var isPseudoElement = this._scanner.peek == $COLON;  // ::something
    if (isPseudoElement) {
      startToken = this._consume(CssTokenType.Character, ':');
      strValue += startToken.strValue;
      tokens.push(startToken);
    }

    var innerSelectors: CssSelectorAST[] = [];

    this._scanner.setMode(CssLexerMode.PSEUDO_SELECTOR);

    // host, host-context, lang, not, nth-child are all identifiers
    var pseudoSelectorToken = this._consume(CssTokenType.Identifier);
    var pseudoSelectorName = pseudoSelectorToken.strValue;
    tokens.push(pseudoSelectorToken);
    strValue += pseudoSelectorName;

    // host(), lang(), nth-child(), etc...
    if (this._scanner.peek == $LPAREN) {
      this._scanner.setMode(CssLexerMode.PSEUDO_SELECTOR_WITH_ARGUMENTS);

      var openParenToken = this._consume(CssTokenType.Character, '(');
      tokens.push(openParenToken);
      strValue += openParenToken.strValue;

      // :host(innerSelector(s)), :not(selector), etc...
      if (_pseudoSelectorSupportsInnerSelectors(pseudoSelectorName)) {
        var innerDelims = bitWiseOr([startingDelims, LPAREN_DELIM, RPAREN_DELIM]);
        if (pseudoSelectorName == 'not') {
          // the inner selector inside of :not(...) can only be one
          // CSS selector (no commas allowed) ... This is according
          // to the CSS specification
          innerDelims = bitWiseOr([innerDelims, COMMA_DELIM]);
        }

        // :host(a, b, c) {
        this._parseSelectors(innerDelims).forEach((selector, index) => {
          if (index > 0) {
            strValue += ', ';
          }
          strValue += selector.strValue;
          innerSelectors.push(selector);
        });
      } else {
        // this branch is for things like "en-us, 2k + 1, etc..."
        // which all end up in pseudoSelectors like :lang, :nth-child, etc..
        var innerValueDelims =
            bitWiseOr([delimiters, LBRACE_DELIM, COLON_DELIM, RPAREN_DELIM, LPAREN_DELIM]);
        while (!characterContainsDelimiter(this._scanner.peek, innerValueDelims)) {
          var token = this._scan();
          strValue += token.strValue;
          tokens.push(token);
        }
      }

      var closeParenToken = this._consume(CssTokenType.Character, ')');
      tokens.push(closeParenToken);
      strValue += closeParenToken.strValue;
    }

    var end = this._getScannerIndex() - 1;
    return new CssPseudoSelectorAST(
        start, end, strValue, pseudoSelectorName, isPseudoElement, tokens, innerSelectors);
  }

  /** @internal */
  _parseSimpleSelector(delimiters: number): CssSimpleSelectorAST {
    var start = this._getScannerIndex();

    delimiters = bitWiseOr([delimiters, COMMA_DELIM]);

    this._scanner.setMode(CssLexerMode.SELECTOR);
    var strValue = '';
    var selectorCssTokens: CssToken[] = [];
    var pseudoSelectors: CssPseudoSelectorAST[] = [];

    var previousToken: CssToken;

    var selectorPartDelimiters = bitWiseOr([delimiters, SPACE_DELIM]);
    var loopOverSelector = !characterContainsDelimiter(this._scanner.peek, selectorPartDelimiters);

    while (loopOverSelector) {
      var peek = this._scanner.peek;

      switch (peek) {
        case $COLON:
          var innerPseudo = this._parsePseudoSelector(delimiters);
          strValue += innerPseudo.strValue;
          pseudoSelectors.push(innerPseudo);
          this._scanner.setMode(CssLexerMode.SELECTOR);
          break;

        case $LBRACKET:
          // we set the mode after the scan because attribute mode does not
          // allow attribute [] values. And this also will catch any errors
          // if an extra "[" is used inside.
          strValue += '[';
          selectorCssTokens.push(this._scan());
          this._scanner.setMode(CssLexerMode.ATTRIBUTE_SELECTOR);
          break;

        case $RBRACKET:
          strValue += ']';
          // we set the mode early because attribute mode does not
          // allow attribute [] values
          this._scanner.setMode(CssLexerMode.SELECTOR);
          selectorCssTokens.push(this._scan());
          break;

        default:
          if (isSelectorOperatorCharacter(peek)) {
            loopOverSelector = false;
            continue;
          }

          var token = this._scan();
          strValue += token.strValue;
          previousToken = token;
          selectorCssTokens.push(token);
          break;
      }

      loopOverSelector = !characterContainsDelimiter(this._scanner.peek, selectorPartDelimiters);
    }

    if (this._scanner.getMode() == CssLexerMode.ATTRIBUTE_SELECTOR) {
      this._error(
          `Unbalanced CSS attribute selector at column ${previousToken.line}:${previousToken.column}`,
          previousToken);
    }

    var end = this._getScannerIndex() - 1;

    var operator: CssToken = null;
    var operatorScanCount = 0;
    var lastOperatorToken: CssToken = null;
    while (operator == null && !characterContainsDelimiter(this._scanner.peek, delimiters) &&
           isSelectorOperatorCharacter(this._scanner.peek)) {
      var token = this._scan();
      var tokenOperator = token.strValue;
      operatorScanCount++;
      lastOperatorToken = token;
      if (tokenOperator != SPACE_OPERATOR) {
        switch (tokenOperator) {
          case '/':
            // /deep/ operator
            let deepToken = this._consume(CssTokenType.Identifier);
            let deepSlash = this._consume(CssTokenType.Character);
            let index = lastOperatorToken.index;
            let line = lastOperatorToken.line;
            let column = lastOperatorToken.column;
            if (isPresent(deepToken) && deepToken.strValue.toLowerCase() == 'deep' &&
                deepSlash.strValue == '/') {
              token = new CssToken(
                  lastOperatorToken.index, lastOperatorToken.column, lastOperatorToken.line,
                  CssTokenType.Identifier, '/deep/');
            } else {
              let text = '/' + deepToken.strValue + deepSlash.strValue;
              this._error(
                  generateErrorMessage(
                      this._scanner.input, `${text} is an invalid CSS operator`, text, index, line,
                      column),
                  lastOperatorToken);
              token = new CssToken(index, column, line, CssTokenType.Invalid, text);
            }
            break;

          case '>':
            // >>> operator
            if (this._scanner.peek == $GT && this._scanner.peekPeek == $GT) {
              this._consume(CssTokenType.Character, '>');
              this._consume(CssTokenType.Character, '>');
              token = new CssToken(
                  lastOperatorToken.index, lastOperatorToken.column, lastOperatorToken.line,
                  CssTokenType.Identifier, '>>>');
            }
            break;
        }

        operator = token;
        tokenOperator = token.strValue;
        end = this._scanner.index - 1;
      }
      strValue += tokenOperator;
    }

    this._scanner.consumeWhitespace();

    // if we do come across one or more spaces inside of
    // the operators loop then an empty space is still a
    // valid operator to use if something else was not found
    if (operator == null && operatorScanCount > 0 && this._scanner.peek != $LBRACE) {
      operator = lastOperatorToken;
    }

    return new CssSimpleSelectorAST(
        start, end, selectorCssTokens, strValue.trim(), pseudoSelectors, operator);
  }

  /** @internal */
  _parseSelector(delimiters: number): CssSelectorAST {
    var start = this._getScannerIndex();

    delimiters = bitWiseOr([delimiters, COMMA_DELIM]);
    this._scanner.setMode(CssLexerMode.SELECTOR);

    var simpleSelectors: CssSimpleSelectorAST[] = [];
    var end = this._getScannerIndex() - 1;
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      simpleSelectors.push(this._parseSimpleSelector(delimiters));
      this._scanner.consumeWhitespace();
    }

    // we do this to avoid any trailing whitespace that is processed
    // in order to determine the final operator value
    var limit = simpleSelectors.length - 1;
    if (limit >= 0) {
      end = simpleSelectors[limit].end;
    }

    return new CssSelectorAST(start, end, simpleSelectors);
  }

  /** @internal */
  _parseValue(delimiters: number): CssStyleValueAST {
    delimiters = bitWiseOr([delimiters, RBRACE_DELIM, SEMICOLON_DELIM, NEWLINE_DELIM]);

    this._scanner.setMode(CssLexerMode.STYLE_VALUE);
    var start = this._getScannerIndex();

    var strValue = '';
    var tokens: CssToken[] = [];
    var wsStr = '';
    var previous: CssToken;
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      var token: CssToken;
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
      } else {
        token = this._scan();
        if (token.type == CssTokenType.Whitespace) {
          wsStr += token.strValue;
        } else {
          strValue += wsStr;
          strValue += token.strValue;
          wsStr = '';
          tokens.push(token);
        }
      }
      previous = token;
    }

    var end = this._getScannerIndex() - 1;
    this._scanner.consumeWhitespace();

    var code = this._scanner.peek;
    if (code == $SEMICOLON) {
      this._consume(CssTokenType.Character, ';');
    } else if (code != $RBRACE) {
      this._error(
          generateErrorMessage(
              this._scanner.input, `The CSS key/value definition did not end with a semicolon`,
              previous.strValue, previous.index, previous.line, previous.column),
          previous);
    }

    return new CssStyleValueAST(start, end, tokens, strValue);
  }

  /** @internal */
  _collectUntilDelim(delimiters: number, assertType: CssTokenType = null): CssToken[] {
    var tokens: any[] /** TODO #9100 */ = [];
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      var val = isPresent(assertType) ? this._consume(assertType) : this._scan();
      tokens.push(val);
    }
    return tokens;
  }

  /** @internal */
  _parseBlock(delimiters: number): CssBlockAST {
    var start = this._getScannerIndex();

    delimiters = bitWiseOr([delimiters, RBRACE_DELIM]);

    this._scanner.setMode(CssLexerMode.BLOCK);

    this._consume(CssTokenType.Character, '{');
    this._scanner.consumeEmptyStatements();

    var results: any[] /** TODO #9100 */ = [];
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      results.push(this._parseRule(delimiters));
    }

    this._consume(CssTokenType.Character, '}');

    this._scanner.setMode(CssLexerMode.BLOCK);
    this._scanner.consumeEmptyStatements();

    var end = this._getScannerIndex() - 1;
    return new CssBlockAST(start, end, results);
  }

  /** @internal */
  _parseStyleBlock(delimiters: number): CssStylesBlockAST {
    var start = this._getScannerIndex();

    delimiters = bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]);

    this._scanner.setMode(CssLexerMode.STYLE_BLOCK);

    var result = this._consume(CssTokenType.Character, '{');
    if (result.numValue != $LBRACE) {
      return null;
    }

    var definitions: CssDefinitionAST[] = [];
    this._scanner.consumeEmptyStatements();

    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      definitions.push(this._parseDefinition(delimiters));
      this._scanner.consumeEmptyStatements();
    }

    this._consume(CssTokenType.Character, '}');

    this._scanner.setMode(CssLexerMode.STYLE_BLOCK);
    this._scanner.consumeEmptyStatements();

    var end = this._getScannerIndex() - 1;
    return new CssStylesBlockAST(start, end, definitions);
  }

  /** @internal */
  _parseDefinition(delimiters: number): CssDefinitionAST {
    var start = this._getScannerIndex();
    this._scanner.setMode(CssLexerMode.STYLE_BLOCK);

    var prop = this._consume(CssTokenType.Identifier);
    var parseValue: any /** TODO #9100 */, value: any /** TODO #9100 */ = null;

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

          var remainingTokens = this._collectUntilDelim(
              bitWiseOr([delimiters, COLON_DELIM, SEMICOLON_DELIM]), CssTokenType.Identifier);
          if (remainingTokens.length > 0) {
            remainingTokens.forEach((token) => { propStr.push(token.strValue); });
          }

          prop = new CssToken(prop.index, prop.column, prop.line, prop.type, propStr.join(' '));
        }

        // this means we've reached the end of the definition and/or block
        if (this._scanner.peek == $COLON) {
          this._consume(CssTokenType.Character, ':');
          parseValue = true;
        } else {
          parseValue = false;
        }
        break;
    }

    if (parseValue) {
      value = this._parseValue(delimiters);
    } else {
      this._error(
          generateErrorMessage(
              this._scanner.input, `The CSS property was not paired with a style value`,
              prop.strValue, prop.index, prop.line, prop.column),
          prop);
    }

    var end = this._getScannerIndex() - 1;
    return new CssDefinitionAST(start, end, prop, value);
  }

  /** @internal */
  _assertCondition(status: boolean, errorMessage: string, problemToken: CssToken): boolean {
    if (!status) {
      this._error(errorMessage, problemToken);
      return true;
    }
    return false;
  }

  /** @internal */
  _error(message: string, problemToken: CssToken) {
    var length = problemToken.strValue.length;
    var error = CssParseError.create(
        this._file, 0, problemToken.line, problemToken.column, length, message);
    this._errors.push(error);
  }
}

export class CssStyleValueAST extends CssAST {
  constructor(start: number, end: number, public tokens: CssToken[], public strValue: string) {
    super(start, end);
  }
  visit(visitor: CssASTVisitor, context?: any): any { return visitor.visitCssValue(this); }
}

export class CssRuleAST extends CssAST {
  constructor(start: number, end: number) { super(start, end); }
}

export class CssBlockRuleAST extends CssRuleAST {
  constructor(
      start: number, end: number, public type: BlockType, public block: CssBlockAST,
      public name: CssToken = null) {
    super(start, end);
  }
  visit(visitor: CssASTVisitor, context?: any): any {
    return visitor.visitCssBlock(this.block, context);
  }
}

export class CssKeyframeRuleAST extends CssBlockRuleAST {
  constructor(start: number, end: number, name: CssToken, block: CssBlockAST) {
    super(start, end, BlockType.Keyframes, block, name);
  }
  visit(visitor: CssASTVisitor, context?: any): any {
    return visitor.visitCssKeyframeRule(this, context);
  }
}

export class CssKeyframeDefinitionAST extends CssBlockRuleAST {
  public steps: CssToken[];
  constructor(start: number, end: number, _steps: CssToken[], block: CssBlockAST) {
    super(start, end, BlockType.Keyframes, block, mergeTokens(_steps, ','));
    this.steps = _steps;
  }
  visit(visitor: CssASTVisitor, context?: any): any {
    return visitor.visitCssKeyframeDefinition(this, context);
  }
}

export class CssBlockDefinitionRuleAST extends CssBlockRuleAST {
  constructor(
      start: number, end: number, public strValue: string, type: BlockType,
      public query: CssAtRulePredicateAST, block: CssBlockAST) {
    super(start, end, type, block);
    var firstCssToken: CssToken = query.tokens[0];
    this.name = new CssToken(
        firstCssToken.index, firstCssToken.column, firstCssToken.line, CssTokenType.Identifier,
        this.strValue);
  }
  visit(visitor: CssASTVisitor, context?: any): any {
    return visitor.visitCssBlock(this.block, context);
  }
}

export class CssMediaQueryRuleAST extends CssBlockDefinitionRuleAST {
  constructor(
      start: number, end: number, strValue: string, query: CssAtRulePredicateAST,
      block: CssBlockAST) {
    super(start, end, strValue, BlockType.MediaQuery, query, block);
  }
  visit(visitor: CssASTVisitor, context?: any): any {
    return visitor.visitCssMediaQueryRule(this, context);
  }
}

export class CssAtRulePredicateAST extends CssAST {
  constructor(start: number, end: number, public strValue: string, public tokens: CssToken[]) {
    super(start, end);
  }
  visit(visitor: CssASTVisitor, context?: any): any {
    return visitor.visitCssAtRulePredicate(this, context);
  }
}

export class CssInlineRuleAST extends CssRuleAST {
  constructor(start: number, end: number, public type: BlockType, public value: CssStyleValueAST) {
    super(start, end);
  }
  visit(visitor: CssASTVisitor, context?: any): any {
    return visitor.visitInlineCssRule(this, context);
  }
}

export class CssSelectorRuleAST extends CssBlockRuleAST {
  public strValue: string;

  constructor(start: number, end: number, public selectors: CssSelectorAST[], block: CssBlockAST) {
    super(start, end, BlockType.Selector, block);
    this.strValue = selectors.map(selector => selector.strValue).join(',');
  }
  visit(visitor: CssASTVisitor, context?: any): any {
    return visitor.visitCssSelectorRule(this, context);
  }
}

export class CssDefinitionAST extends CssAST {
  constructor(
      start: number, end: number, public property: CssToken, public value: CssStyleValueAST) {
    super(start, end);
  }
  visit(visitor: CssASTVisitor, context?: any): any {
    return visitor.visitCssDefinition(this, context);
  }
}

export abstract class CssSelectorPartAST extends CssAST {
  constructor(start: number, end: number) { super(start, end); }
}

export class CssSelectorAST extends CssSelectorPartAST {
  public strValue: string;
  constructor(start: number, end: number, public selectorParts: CssSimpleSelectorAST[]) {
    super(start, end);
    this.strValue = selectorParts.map(part => part.strValue).join('');
  }
  visit(visitor: CssASTVisitor, context?: any): any {
    return visitor.visitCssSelector(this, context);
  }
}

export class CssSimpleSelectorAST extends CssSelectorPartAST {
  public selectorStrValue: string;

  constructor(
      start: number, end: number, public tokens: CssToken[], public strValue: string,
      public pseudoSelectors: CssPseudoSelectorAST[], public operator: CssToken) {
    super(start, end);
  }
  visit(visitor: CssASTVisitor, context?: any): any {
    return visitor.visitCssSimpleSelector(this, context);
  }
}

export class CssPseudoSelectorAST extends CssSelectorPartAST {
  constructor(
      start: number, end: number, public strValue: string, public name: string,
      public isPseudoElement: boolean, public tokens: CssToken[],
      public innerSelectors: CssSelectorAST[]) {
    super(start, end);
  }
  visit(visitor: CssASTVisitor, context?: any): any {
    return visitor.visitCssPseudoSelector(this, context);
  }
}

export class CssBlockAST extends CssAST {
  constructor(start: number, end: number, public entries: CssAST[]) { super(start, end); }
  visit(visitor: CssASTVisitor, context?: any): any { return visitor.visitCssBlock(this, context); }
}

export class CssStylesBlockAST extends CssBlockAST {
  constructor(start: number, end: number, public definitions: CssDefinitionAST[]) {
    super(start, end, definitions);
  }
  visit(visitor: CssASTVisitor, context?: any): any {
    return visitor.visitCssStylesBlock(this, context);
  }
}

export class CssStyleSheetAST extends CssAST {
  constructor(start: number, end: number, public rules: CssAST[]) { super(start, end); }
  visit(visitor: CssASTVisitor, context?: any): any {
    return visitor.visitCssStyleSheet(this, context);
  }
}

export class CssParseError extends ParseError {
  static create(
      file: ParseSourceFile, offset: number, line: number, col: number, length: number,
      errMsg: string): CssParseError {
    var start = new ParseLocation(file, offset, line, col);
    var end = new ParseLocation(file, offset, line, col + length);
    var span = new ParseSourceSpan(start, end);
    return new CssParseError(span, 'CSS Parse Error: ' + errMsg);
  }

  constructor(span: ParseSourceSpan, message: string) { super(span, message); }
}

export class CssUnknownRuleAST extends CssRuleAST {
  constructor(start: number, end: number, public ruleName: string, public tokens: CssToken[]) {
    super(start, end);
  }
  visit(visitor: CssASTVisitor, context?: any): any {
    return visitor.visitUnknownRule(this, context);
  }
}

export class CssUnknownTokenListAST extends CssRuleAST {
  constructor(start: number, end: number, public name: string, public tokens: CssToken[]) {
    super(start, end);
  }
  visit(visitor: CssASTVisitor, context?: any): any {
    return visitor.visitUnknownTokenList(this, context);
  }
}
