/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as chars from '../chars';
import {isPresent} from '../facade/lang';
import {ParseError, ParseLocation, ParseSourceFile, ParseSourceSpan} from '../parse_util';

import {BlockType, CssAst, CssAtRulePredicateAst, CssBlockAst, CssBlockDefinitionRuleAst, CssBlockRuleAst, CssDefinitionAst, CssInlineRuleAst, CssKeyframeDefinitionAst, CssKeyframeRuleAst, CssMediaQueryRuleAst, CssPseudoSelectorAst, CssRuleAst, CssSelectorAst, CssSelectorRuleAst, CssSimpleSelectorAst, CssStyleSheetAst, CssStyleValueAst, CssStylesBlockAst, CssUnknownRuleAst, CssUnknownTokenListAst, mergeTokens} from './css_ast';
import {CssLexer, CssLexerMode, CssScanner, CssToken, CssTokenType, generateErrorMessage, isNewline} from './css_lexer';

const SPACE_OPERATOR = ' ';

export {CssToken} from './css_lexer';
export {BlockType} from './css_ast';

const SLASH_CHARACTER = '/';
const GT_CHARACTER = '>';
const TRIPLE_GT_OPERATOR_STR = '>>>';
const DEEP_OPERATOR_STR = '/deep/';

const EOF_DELIM_FLAG = 1;
const RBRACE_DELIM_FLAG = 2;
const LBRACE_DELIM_FLAG = 4;
const COMMA_DELIM_FLAG = 8;
const COLON_DELIM_FLAG = 16;
const SEMICOLON_DELIM_FLAG = 32;
const NEWLINE_DELIM_FLAG = 64;
const RPAREN_DELIM_FLAG = 128;
const LPAREN_DELIM_FLAG = 256;
const SPACE_DELIM_FLAG = 512;

function _pseudoSelectorSupportsInnerSelectors(name: string): boolean {
  return ['not', 'host', 'host-context'].indexOf(name) >= 0;
}

function isSelectorOperatorCharacter(code: number): boolean {
  switch (code) {
    case chars.$SLASH:
    case chars.$TILDA:
    case chars.$PLUS:
    case chars.$GT:
      return true;
    default:
      return chars.isWhitespace(code);
  }
}

function getDelimFromCharacter(code: number): number {
  switch (code) {
    case chars.$EOF:
      return EOF_DELIM_FLAG;
    case chars.$COMMA:
      return COMMA_DELIM_FLAG;
    case chars.$COLON:
      return COLON_DELIM_FLAG;
    case chars.$SEMICOLON:
      return SEMICOLON_DELIM_FLAG;
    case chars.$RBRACE:
      return RBRACE_DELIM_FLAG;
    case chars.$LBRACE:
      return LBRACE_DELIM_FLAG;
    case chars.$RPAREN:
      return RPAREN_DELIM_FLAG;
    case chars.$SPACE:
    case chars.$TAB:
      return SPACE_DELIM_FLAG;
    default:
      return isNewline(code) ? NEWLINE_DELIM_FLAG : 0;
  }
}

function characterContainsDelimiter(code: number, delimiters: number): boolean {
  return (getDelimFromCharacter(code) & delimiters) > 0;
}

export class ParsedCssResult {
  constructor(public errors: CssParseError[], public ast: CssStyleSheetAst) {}
}

export class CssParser {
  private _errors: CssParseError[] = [];
  private _file: ParseSourceFile;
  private _scanner: CssScanner;
  private _lastToken: CssToken;

  /**
   * @param css the CSS code that will be parsed
   * @param url the name of the CSS file containing the CSS source code
   */
  parse(css: string, url: string): ParsedCssResult {
    var lexer = new CssLexer();
    this._file = new ParseSourceFile(css, url);
    this._scanner = lexer.scan(css, false);

    var ast = this._parseStyleSheet(EOF_DELIM_FLAG);

    var errors = this._errors;
    this._errors = [];

    var result = new ParsedCssResult(errors, ast);
    this._file = null;
    this._scanner = null;
    return result;
  }

  /** @internal */
  _parseStyleSheet(delimiters: number): CssStyleSheetAst {
    var results: CssRuleAst[] = [];
    this._scanner.consumeEmptyStatements();
    while (this._scanner.peek != chars.$EOF) {
      this._scanner.setMode(CssLexerMode.BLOCK);
      results.push(this._parseRule(delimiters));
    }
    var span: ParseSourceSpan = null;
    if (results.length > 0) {
      var firstRule = results[0];
      // we collect the last token like so incase there was an
      // EOF token that was emitted sometime during the lexing
      span = this._generateSourceSpan(firstRule, this._lastToken);
    }
    return new CssStyleSheetAst(span, results);
  }

  /** @internal */
  _getSourceContent(): string { return isPresent(this._scanner) ? this._scanner.input : ''; }

  /** @internal */
  _extractSourceContent(start: number, end: number): string {
    return this._getSourceContent().substring(start, end + 1);
  }

  /** @internal */
  _generateSourceSpan(start: CssToken|CssAst, end: CssToken|CssAst = null): ParseSourceSpan {
    var startLoc: ParseLocation;
    if (start instanceof CssAst) {
      startLoc = start.location.start;
    } else {
      var token = start;
      if (!isPresent(token)) {
        // the data here is invalid, however, if and when this does
        // occur, any other errors associated with this will be collected
        token = this._lastToken;
      }
      startLoc = new ParseLocation(this._file, token.index, token.line, token.column);
    }

    if (!isPresent(end)) {
      end = this._lastToken;
    }

    var endLine: number;
    var endColumn: number;
    var endIndex: number;
    if (end instanceof CssAst) {
      endLine = end.location.end.line;
      endColumn = end.location.end.col;
      endIndex = end.location.end.offset;
    } else if (end instanceof CssToken) {
      endLine = end.line;
      endColumn = end.column;
      endIndex = end.index;
    }

    var endLoc = new ParseLocation(this._file, endIndex, endLine, endColumn);
    return new ParseSourceSpan(startLoc, endLoc);
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

  /** @internal */
  _parseRule(delimiters: number): CssRuleAst {
    if (this._scanner.peek == chars.$AT) {
      return this._parseAtRule(delimiters);
    }
    return this._parseSelectorRule(delimiters);
  }

  /** @internal */
  _parseAtRule(delimiters: number): CssRuleAst {
    const start = this._getScannerIndex();

    this._scanner.setMode(CssLexerMode.BLOCK);
    var token = this._scan();
    var startToken = token;

    this._assertCondition(
        token.type == CssTokenType.AtKeyword,
        `The CSS Rule ${token.strValue} is not a valid [@] rule.`, token);

    var block: CssBlockAst;
    var type = this._resolveBlockType(token);
    var span: ParseSourceSpan;
    var tokens: CssToken[];
    var endToken: CssToken;
    var end: number;
    var strValue: string;
    var query: CssAtRulePredicateAst;
    switch (type) {
      case BlockType.Charset:
      case BlockType.Namespace:
      case BlockType.Import:
        let value = this._parseValue(delimiters);
        this._scanner.setMode(CssLexerMode.BLOCK);
        this._scanner.consumeEmptyStatements();
        span = this._generateSourceSpan(startToken, value);
        return new CssInlineRuleAst(span, type, value);

      case BlockType.Viewport:
      case BlockType.FontFace:
        block = this._parseStyleBlock(delimiters);
        span = this._generateSourceSpan(startToken, block);
        return new CssBlockRuleAst(span, type, block);

      case BlockType.Keyframes:
        tokens = this._collectUntilDelim(delimiters | RBRACE_DELIM_FLAG | LBRACE_DELIM_FLAG);
        // keyframes only have one identifier name
        let name = tokens[0];
        block = this._parseKeyframeBlock(delimiters);
        span = this._generateSourceSpan(startToken, block);
        return new CssKeyframeRuleAst(span, name, block);

      case BlockType.MediaQuery:
        this._scanner.setMode(CssLexerMode.MEDIA_QUERY);
        tokens = this._collectUntilDelim(delimiters | RBRACE_DELIM_FLAG | LBRACE_DELIM_FLAG);
        endToken = tokens[tokens.length - 1];
        // we do not track the whitespace after the mediaQuery predicate ends
        // so we have to calculate the end string value on our own
        end = endToken.index + endToken.strValue.length - 1;
        strValue = this._extractSourceContent(start, end);
        span = this._generateSourceSpan(startToken, endToken);
        query = new CssAtRulePredicateAst(span, strValue, tokens);
        block = this._parseBlock(delimiters);
        strValue = this._extractSourceContent(start, this._getScannerIndex() - 1);
        span = this._generateSourceSpan(startToken, block);
        return new CssMediaQueryRuleAst(span, strValue, query, block);

      case BlockType.Document:
      case BlockType.Supports:
      case BlockType.Page:
        this._scanner.setMode(CssLexerMode.AT_RULE_QUERY);
        tokens = this._collectUntilDelim(delimiters | RBRACE_DELIM_FLAG | LBRACE_DELIM_FLAG);
        endToken = tokens[tokens.length - 1];
        // we do not track the whitespace after this block rule predicate ends
        // so we have to calculate the end string value on our own
        end = endToken.index + endToken.strValue.length - 1;
        strValue = this._extractSourceContent(start, end);
        span = this._generateSourceSpan(startToken, tokens[tokens.length - 1]);
        query = new CssAtRulePredicateAst(span, strValue, tokens);
        block = this._parseBlock(delimiters);
        strValue = this._extractSourceContent(start, block.end.offset);
        span = this._generateSourceSpan(startToken, block);
        return new CssBlockDefinitionRuleAst(span, strValue, type, query, block);

      // if a custom @rule { ... } is used it should still tokenize the insides
      default:
        let listOfTokens: CssToken[] = [];
        let tokenName = token.strValue;
        this._scanner.setMode(CssLexerMode.ALL);
        this._error(
            generateErrorMessage(
                this._getSourceContent(),
                `The CSS "at" rule "${tokenName}" is not allowed to used here`, token.strValue,
                token.index, token.line, token.column),
            token);

        this._collectUntilDelim(delimiters | LBRACE_DELIM_FLAG | SEMICOLON_DELIM_FLAG)
            .forEach((token) => { listOfTokens.push(token); });
        if (this._scanner.peek == chars.$LBRACE) {
          listOfTokens.push(this._consume(CssTokenType.Character, '{'));
          this._collectUntilDelim(delimiters | RBRACE_DELIM_FLAG | LBRACE_DELIM_FLAG)
              .forEach((token) => { listOfTokens.push(token); });
          listOfTokens.push(this._consume(CssTokenType.Character, '}'));
        }
        endToken = listOfTokens[listOfTokens.length - 1];
        span = this._generateSourceSpan(startToken, endToken);
        return new CssUnknownRuleAst(span, tokenName, listOfTokens);
    }
  }

  /** @internal */
  _parseSelectorRule(delimiters: number): CssRuleAst {
    const start = this._getScannerIndex();
    var selectors = this._parseSelectors(delimiters);
    var block = this._parseStyleBlock(delimiters);
    var ruleAst: CssRuleAst;
    var span: ParseSourceSpan;
    var startSelector = selectors[0];
    if (isPresent(block)) {
      var span = this._generateSourceSpan(startSelector, block);
      ruleAst = new CssSelectorRuleAst(span, selectors, block);
    } else {
      var name = this._extractSourceContent(start, this._getScannerIndex() - 1);
      var innerTokens: CssToken[] = [];
      selectors.forEach((selector: CssSelectorAst) => {
        selector.selectorParts.forEach((part: CssSimpleSelectorAst) => {
          part.tokens.forEach((token: CssToken) => { innerTokens.push(token); });
        });
      });
      var endToken = innerTokens[innerTokens.length - 1];
      span = this._generateSourceSpan(startSelector, endToken);
      ruleAst = new CssUnknownTokenListAst(span, name, innerTokens);
    }
    this._scanner.setMode(CssLexerMode.BLOCK);
    this._scanner.consumeEmptyStatements();
    return ruleAst;
  }

  /** @internal */
  _parseSelectors(delimiters: number): CssSelectorAst[] {
    delimiters |= LBRACE_DELIM_FLAG | SEMICOLON_DELIM_FLAG;

    var selectors: CssSelectorAst[] = [];
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
    this._lastToken = token;
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
    this._lastToken = token;
    return token;
  }

  /** @internal */
  _parseKeyframeBlock(delimiters: number): CssBlockAst {
    delimiters |= RBRACE_DELIM_FLAG;
    this._scanner.setMode(CssLexerMode.KEYFRAME_BLOCK);

    var startToken = this._consume(CssTokenType.Character, '{');

    var definitions: CssKeyframeDefinitionAst[] = [];
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      definitions.push(this._parseKeyframeDefinition(delimiters));
    }

    var endToken = this._consume(CssTokenType.Character, '}');

    var span = this._generateSourceSpan(startToken, endToken);
    return new CssBlockAst(span, definitions);
  }

  /** @internal */
  _parseKeyframeDefinition(delimiters: number): CssKeyframeDefinitionAst {
    const start = this._getScannerIndex();
    var stepTokens: CssToken[] = [];
    delimiters |= LBRACE_DELIM_FLAG;
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      stepTokens.push(this._parseKeyframeLabel(delimiters | COMMA_DELIM_FLAG));
      if (this._scanner.peek != chars.$LBRACE) {
        this._consume(CssTokenType.Character, ',');
      }
    }
    var stylesBlock = this._parseStyleBlock(delimiters | RBRACE_DELIM_FLAG);
    var span = this._generateSourceSpan(stepTokens[0], stylesBlock);
    var ast = new CssKeyframeDefinitionAst(span, stepTokens, stylesBlock);

    this._scanner.setMode(CssLexerMode.BLOCK);
    return ast;
  }

  /** @internal */
  _parseKeyframeLabel(delimiters: number): CssToken {
    this._scanner.setMode(CssLexerMode.KEYFRAME_BLOCK);
    return mergeTokens(this._collectUntilDelim(delimiters));
  }

  /** @internal */
  _parsePseudoSelector(delimiters: number): CssPseudoSelectorAst {
    const start = this._getScannerIndex();

    delimiters &= ~COMMA_DELIM_FLAG;

    // we keep the original value since we may use it to recurse when :not, :host are used
    var startingDelims = delimiters;

    var startToken = this._consume(CssTokenType.Character, ':');
    var tokens = [startToken];

    if (this._scanner.peek == chars.$COLON) {  // ::something
      tokens.push(this._consume(CssTokenType.Character, ':'));
    }

    var innerSelectors: CssSelectorAst[] = [];

    this._scanner.setMode(CssLexerMode.PSEUDO_SELECTOR);

    // host, host-context, lang, not, nth-child are all identifiers
    var pseudoSelectorToken = this._consume(CssTokenType.Identifier);
    var pseudoSelectorName = pseudoSelectorToken.strValue;
    tokens.push(pseudoSelectorToken);

    // host(), lang(), nth-child(), etc...
    if (this._scanner.peek == chars.$LPAREN) {
      this._scanner.setMode(CssLexerMode.PSEUDO_SELECTOR_WITH_ARGUMENTS);

      var openParenToken = this._consume(CssTokenType.Character, '(');
      tokens.push(openParenToken);

      // :host(innerSelector(s)), :not(selector), etc...
      if (_pseudoSelectorSupportsInnerSelectors(pseudoSelectorName)) {
        var innerDelims = startingDelims | LPAREN_DELIM_FLAG | RPAREN_DELIM_FLAG;
        if (pseudoSelectorName == 'not') {
          // the inner selector inside of :not(...) can only be one
          // CSS selector (no commas allowed) ... This is according
          // to the CSS specification
          innerDelims |= COMMA_DELIM_FLAG;
        }

        // :host(a, b, c) {
        this._parseSelectors(innerDelims).forEach((selector, index) => {
          innerSelectors.push(selector);
        });
      } else {
        // this branch is for things like "en-us, 2k + 1, etc..."
        // which all end up in pseudoSelectors like :lang, :nth-child, etc..
        var innerValueDelims = delimiters | LBRACE_DELIM_FLAG | COLON_DELIM_FLAG |
            RPAREN_DELIM_FLAG | LPAREN_DELIM_FLAG;
        while (!characterContainsDelimiter(this._scanner.peek, innerValueDelims)) {
          var token = this._scan();
          tokens.push(token);
        }
      }

      var closeParenToken = this._consume(CssTokenType.Character, ')');
      tokens.push(closeParenToken);
    }

    const end = this._getScannerIndex() - 1;
    var strValue = this._extractSourceContent(start, end);

    var endToken = tokens[tokens.length - 1];
    var span = this._generateSourceSpan(startToken, endToken);
    return new CssPseudoSelectorAst(span, strValue, pseudoSelectorName, tokens, innerSelectors);
  }

  /** @internal */
  _parseSimpleSelector(delimiters: number): CssSimpleSelectorAst {
    const start = this._getScannerIndex();

    delimiters |= COMMA_DELIM_FLAG;

    this._scanner.setMode(CssLexerMode.SELECTOR);
    var selectorCssTokens: CssToken[] = [];
    var pseudoSelectors: CssPseudoSelectorAst[] = [];

    var previousToken: CssToken;

    var selectorPartDelimiters = delimiters | SPACE_DELIM_FLAG;
    var loopOverSelector = !characterContainsDelimiter(this._scanner.peek, selectorPartDelimiters);

    var hasAttributeError = false;
    while (loopOverSelector) {
      var peek = this._scanner.peek;

      switch (peek) {
        case chars.$COLON:
          var innerPseudo = this._parsePseudoSelector(delimiters);
          pseudoSelectors.push(innerPseudo);
          this._scanner.setMode(CssLexerMode.SELECTOR);
          break;

        case chars.$LBRACKET:
          // we set the mode after the scan because attribute mode does not
          // allow attribute [] values. And this also will catch any errors
          // if an extra "[" is used inside.
          selectorCssTokens.push(this._scan());
          this._scanner.setMode(CssLexerMode.ATTRIBUTE_SELECTOR);
          break;

        case chars.$RBRACKET:
          if (this._scanner.getMode() != CssLexerMode.ATTRIBUTE_SELECTOR) {
            hasAttributeError = true;
          }
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
          previousToken = token;
          selectorCssTokens.push(token);
          break;
      }

      loopOverSelector = !characterContainsDelimiter(this._scanner.peek, selectorPartDelimiters);
    }

    hasAttributeError =
        hasAttributeError || this._scanner.getMode() == CssLexerMode.ATTRIBUTE_SELECTOR;
    if (hasAttributeError) {
      this._error(
          `Unbalanced CSS attribute selector at column ${previousToken.line}:${previousToken.column}`,
          previousToken);
    }

    var end = this._getScannerIndex() - 1;

    // this happens if the selector is not directly followed by
    // a comma or curly brace without a space in between
    if (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
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
            case SLASH_CHARACTER:
              // /deep/ operator
              let deepToken = this._consume(CssTokenType.Identifier);
              let deepSlash = this._consume(CssTokenType.Character);
              let index = lastOperatorToken.index;
              let line = lastOperatorToken.line;
              let column = lastOperatorToken.column;
              if (isPresent(deepToken) && deepToken.strValue.toLowerCase() == 'deep' &&
                  deepSlash.strValue == SLASH_CHARACTER) {
                token = new CssToken(
                    lastOperatorToken.index, lastOperatorToken.column, lastOperatorToken.line,
                    CssTokenType.Identifier, DEEP_OPERATOR_STR);
              } else {
                let text = SLASH_CHARACTER + deepToken.strValue + deepSlash.strValue;
                this._error(
                    generateErrorMessage(
                        this._getSourceContent(), `${text} is an invalid CSS operator`, text, index,
                        line, column),
                    lastOperatorToken);
                token = new CssToken(index, column, line, CssTokenType.Invalid, text);
              }
              break;

            case GT_CHARACTER:
              // >>> operator
              if (this._scanner.peek == chars.$GT && this._scanner.peekPeek == chars.$GT) {
                this._consume(CssTokenType.Character, GT_CHARACTER);
                this._consume(CssTokenType.Character, GT_CHARACTER);
                token = new CssToken(
                    lastOperatorToken.index, lastOperatorToken.column, lastOperatorToken.line,
                    CssTokenType.Identifier, TRIPLE_GT_OPERATOR_STR);
              }
              break;
          }

          operator = token;
        }
      }

      // so long as there is an operator then we can have an
      // ending value that is beyond the selector value ...
      // otherwise it's just a bunch of trailing whitespace
      if (isPresent(operator)) {
        end = operator.index;
      }
    }

    this._scanner.consumeWhitespace();

    var strValue = this._extractSourceContent(start, end);

    // if we do come across one or more spaces inside of
    // the operators loop then an empty space is still a
    // valid operator to use if something else was not found
    if (operator == null && operatorScanCount > 0 && this._scanner.peek != chars.$LBRACE) {
      operator = lastOperatorToken;
    }

    // please note that `endToken` is reassigned multiple times below
    // so please do not optimize the if statements into if/elseif
    var startTokenOrAst: CssToken|CssAst = null;
    var endTokenOrAst: CssToken|CssAst = null;
    if (selectorCssTokens.length > 0) {
      startTokenOrAst = startTokenOrAst || selectorCssTokens[0];
      endTokenOrAst = selectorCssTokens[selectorCssTokens.length - 1];
    }
    if (pseudoSelectors.length > 0) {
      startTokenOrAst = startTokenOrAst || pseudoSelectors[0];
      endTokenOrAst = pseudoSelectors[pseudoSelectors.length - 1];
    }
    if (isPresent(operator)) {
      startTokenOrAst = startTokenOrAst || operator;
      endTokenOrAst = operator;
    }

    var span = this._generateSourceSpan(startTokenOrAst, endTokenOrAst);
    return new CssSimpleSelectorAst(span, selectorCssTokens, strValue, pseudoSelectors, operator);
  }

  /** @internal */
  _parseSelector(delimiters: number): CssSelectorAst {
    delimiters |= COMMA_DELIM_FLAG;
    this._scanner.setMode(CssLexerMode.SELECTOR);

    var simpleSelectors: CssSimpleSelectorAst[] = [];
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      simpleSelectors.push(this._parseSimpleSelector(delimiters));
      this._scanner.consumeWhitespace();
    }

    var firstSelector = simpleSelectors[0];
    var lastSelector = simpleSelectors[simpleSelectors.length - 1];
    var span = this._generateSourceSpan(firstSelector, lastSelector);
    return new CssSelectorAst(span, simpleSelectors);
  }

  /** @internal */
  _parseValue(delimiters: number): CssStyleValueAst {
    delimiters |= RBRACE_DELIM_FLAG | SEMICOLON_DELIM_FLAG | NEWLINE_DELIM_FLAG;

    this._scanner.setMode(CssLexerMode.STYLE_VALUE);
    const start = this._getScannerIndex();

    var tokens: CssToken[] = [];
    var wsStr = '';
    var previous: CssToken;
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      var token: CssToken;
      if (isPresent(previous) && previous.type == CssTokenType.Identifier &&
          this._scanner.peek == chars.$LPAREN) {
        token = this._consume(CssTokenType.Character, '(');
        tokens.push(token);

        this._scanner.setMode(CssLexerMode.STYLE_VALUE_FUNCTION);

        token = this._scan();
        tokens.push(token);

        this._scanner.setMode(CssLexerMode.STYLE_VALUE);

        token = this._consume(CssTokenType.Character, ')');
        tokens.push(token);
      } else {
        token = this._scan();
        if (token.type == CssTokenType.Whitespace) {
          wsStr += token.strValue;
        } else {
          wsStr = '';
          tokens.push(token);
        }
      }
      previous = token;
    }

    const end = this._getScannerIndex() - 1;
    this._scanner.consumeWhitespace();

    var code = this._scanner.peek;
    if (code == chars.$SEMICOLON) {
      this._consume(CssTokenType.Character, ';');
    } else if (code != chars.$RBRACE) {
      this._error(
          generateErrorMessage(
              this._getSourceContent(), `The CSS key/value definition did not end with a semicolon`,
              previous.strValue, previous.index, previous.line, previous.column),
          previous);
    }

    var strValue = this._extractSourceContent(start, end);
    var startToken = tokens[0];
    var endToken = tokens[tokens.length - 1];
    var span = this._generateSourceSpan(startToken, endToken);
    return new CssStyleValueAst(span, tokens, strValue);
  }

  /** @internal */
  _collectUntilDelim(delimiters: number, assertType: CssTokenType = null): CssToken[] {
    var tokens: CssToken[] = [];
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      var val = isPresent(assertType) ? this._consume(assertType) : this._scan();
      tokens.push(val);
    }
    return tokens;
  }

  /** @internal */
  _parseBlock(delimiters: number): CssBlockAst {
    delimiters |= RBRACE_DELIM_FLAG;

    this._scanner.setMode(CssLexerMode.BLOCK);

    var startToken = this._consume(CssTokenType.Character, '{');
    this._scanner.consumeEmptyStatements();

    var results: CssRuleAst[] = [];
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      results.push(this._parseRule(delimiters));
    }

    var endToken = this._consume(CssTokenType.Character, '}');

    this._scanner.setMode(CssLexerMode.BLOCK);
    this._scanner.consumeEmptyStatements();

    var span = this._generateSourceSpan(startToken, endToken);
    return new CssBlockAst(span, results);
  }

  /** @internal */
  _parseStyleBlock(delimiters: number): CssStylesBlockAst {
    delimiters |= RBRACE_DELIM_FLAG | LBRACE_DELIM_FLAG;

    this._scanner.setMode(CssLexerMode.STYLE_BLOCK);

    var startToken = this._consume(CssTokenType.Character, '{');
    if (startToken.numValue != chars.$LBRACE) {
      return null;
    }

    var definitions: CssDefinitionAst[] = [];
    this._scanner.consumeEmptyStatements();

    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      definitions.push(this._parseDefinition(delimiters));
      this._scanner.consumeEmptyStatements();
    }

    var endToken = this._consume(CssTokenType.Character, '}');

    this._scanner.setMode(CssLexerMode.STYLE_BLOCK);
    this._scanner.consumeEmptyStatements();

    var span = this._generateSourceSpan(startToken, endToken);
    return new CssStylesBlockAst(span, definitions);
  }

  /** @internal */
  _parseDefinition(delimiters: number): CssDefinitionAst {
    this._scanner.setMode(CssLexerMode.STYLE_BLOCK);

    var prop = this._consume(CssTokenType.Identifier);
    var parseValue: boolean = false;
    var value: CssStyleValueAst = null;
    var endToken: CssToken|CssStyleValueAst = prop;

    // the colon value separates the prop from the style.
    // there are a few cases as to what could happen if it
    // is missing
    switch (this._scanner.peek) {
      case chars.$SEMICOLON:
      case chars.$RBRACE:
      case chars.$EOF:
        parseValue = false;
        break;

      default:
        var propStr = [prop.strValue];
        if (this._scanner.peek != chars.$COLON) {
          // this will throw the error
          var nextValue = this._consume(CssTokenType.Character, ':');
          propStr.push(nextValue.strValue);

          var remainingTokens = this._collectUntilDelim(
              delimiters | COLON_DELIM_FLAG | SEMICOLON_DELIM_FLAG, CssTokenType.Identifier);
          if (remainingTokens.length > 0) {
            remainingTokens.forEach((token) => { propStr.push(token.strValue); });
          }

          endToken = prop =
              new CssToken(prop.index, prop.column, prop.line, prop.type, propStr.join(' '));
        }

        // this means we've reached the end of the definition and/or block
        if (this._scanner.peek == chars.$COLON) {
          this._consume(CssTokenType.Character, ':');
          parseValue = true;
        }
        break;
    }

    if (parseValue) {
      value = this._parseValue(delimiters);
      endToken = value;
    } else {
      this._error(
          generateErrorMessage(
              this._getSourceContent(), `The CSS property was not paired with a style value`,
              prop.strValue, prop.index, prop.line, prop.column),
          prop);
    }

    var span = this._generateSourceSpan(prop, endToken);
    return new CssDefinitionAst(span, prop, value);
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
