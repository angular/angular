/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as chars from '../chars';
import {ParseError, ParseLocation, ParseSourceFile, ParseSourceSpan} from '../parse_util';

import {BlockType, CssAst, CssAtRulePredicateAst, CssBlockAst, CssBlockDefinitionRuleAst, CssBlockRuleAst, CssDefinitionAst, CssInlineRuleAst, CssKeyframeDefinitionAst, CssKeyframeRuleAst, CssMediaQueryRuleAst, CssPseudoSelectorAst, CssRuleAst, CssSelectorAst, CssSelectorRuleAst, CssSimpleSelectorAst, CssStyleSheetAst, CssStyleValueAst, CssStylesBlockAst, CssUnknownRuleAst, CssUnknownTokenListAst, mergeTokens} from './css_ast';
import {CssLexer, CssLexerMode, CssScanner, CssToken, CssTokenType, generateErrorMessage, getRawMessage, isNewline} from './css_lexer';

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
    const lexer = new CssLexer();
    this._file = new ParseSourceFile(css, url);
    this._scanner = lexer.scan(css, false);

    const ast = this._parseStyleSheet(EOF_DELIM_FLAG);

    const errors = this._errors;
    this._errors = [];

    const result = new ParsedCssResult(errors, ast);
    this._file = null as any;
    this._scanner = null as any;
    return result;
  }

  /** @internal */
  _parseStyleSheet(delimiters: number): CssStyleSheetAst {
    const results: CssRuleAst[] = [];
    this._scanner.consumeEmptyStatements();
    while (this._scanner.peek != chars.$EOF) {
      this._scanner.setMode(CssLexerMode.BLOCK);
      results.push(this._parseRule(delimiters));
    }
    let span: ParseSourceSpan|null = null;
    if (results.length > 0) {
      const firstRule = results[0];
      // we collect the last token like so incase there was an
      // EOF token that was emitted sometime during the lexing
      span = this._generateSourceSpan(firstRule, this._lastToken);
    }
    return new CssStyleSheetAst(span !, results);
  }

  /** @internal */
  _getSourceContent(): string { return this._scanner != null ? this._scanner.input : ''; }

  /** @internal */
  _extractSourceContent(start: number, end: number): string {
    return this._getSourceContent().substring(start, end + 1);
  }

  /** @internal */
  _generateSourceSpan(start: CssToken|CssAst, end: CssToken|CssAst|null = null): ParseSourceSpan {
    let startLoc: ParseLocation;
    if (start instanceof CssAst) {
      startLoc = start.location.start;
    } else {
      let token = start;
      if (token == null) {
        // the data here is invalid, however, if and when this does
        // occur, any other errors associated with this will be collected
        token = this._lastToken;
      }
      startLoc = new ParseLocation(this._file, token.index, token.line, token.column);
    }

    if (end == null) {
      end = this._lastToken;
    }

    let endLine: number = -1;
    let endColumn: number = -1;
    let endIndex: number = -1;
    if (end instanceof CssAst) {
      endLine = end.location.end.line !;
      endColumn = end.location.end.col !;
      endIndex = end.location.end.offset !;
    } else if (end instanceof CssToken) {
      endLine = end.line;
      endColumn = end.column;
      endIndex = end.index;
    }

    const endLoc = new ParseLocation(this._file, endIndex, endLine, endColumn);
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
    const token = this._scan();
    const startToken = token;

    this._assertCondition(
        token.type == CssTokenType.AtKeyword,
        `The CSS Rule ${token.strValue} is not a valid [@] rule.`, token);

    let block: CssBlockAst;
    const type = this._resolveBlockType(token);
    let span: ParseSourceSpan;
    let tokens: CssToken[];
    let endToken: CssToken;
    let end: number;
    let strValue: string;
    let query: CssAtRulePredicateAst;
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
        block = this._parseStyleBlock(delimiters) !;
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
        strValue = this._extractSourceContent(start, block.end.offset !);
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
    const selectors = this._parseSelectors(delimiters);
    const block = this._parseStyleBlock(delimiters);
    let ruleAst: CssRuleAst;
    let span: ParseSourceSpan;
    const startSelector = selectors[0];
    if (block != null) {
      span = this._generateSourceSpan(startSelector, block);
      ruleAst = new CssSelectorRuleAst(span, selectors, block);
    } else {
      const name = this._extractSourceContent(start, this._getScannerIndex() - 1);
      const innerTokens: CssToken[] = [];
      selectors.forEach((selector: CssSelectorAst) => {
        selector.selectorParts.forEach((part: CssSimpleSelectorAst) => {
          part.tokens.forEach((token: CssToken) => { innerTokens.push(token); });
        });
      });
      const endToken = innerTokens[innerTokens.length - 1];
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

    const selectors: CssSelectorAst[] = [];
    let isParsingSelectors = true;
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
    const output = this._scanner.scan() !;
    const token = output.token;
    const error = output.error;
    if (error != null) {
      this._error(getRawMessage(error), token);
    }
    this._lastToken = token;
    return token;
  }

  /** @internal */
  _getScannerIndex(): number { return this._scanner.index; }

  /** @internal */
  _consume(type: CssTokenType, value: string|null = null): CssToken {
    const output = this._scanner.consume(type, value);
    const token = output.token;
    const error = output.error;
    if (error != null) {
      this._error(getRawMessage(error), token);
    }
    this._lastToken = token;
    return token;
  }

  /** @internal */
  _parseKeyframeBlock(delimiters: number): CssBlockAst {
    delimiters |= RBRACE_DELIM_FLAG;
    this._scanner.setMode(CssLexerMode.KEYFRAME_BLOCK);

    const startToken = this._consume(CssTokenType.Character, '{');

    const definitions: CssKeyframeDefinitionAst[] = [];
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      definitions.push(this._parseKeyframeDefinition(delimiters));
    }

    const endToken = this._consume(CssTokenType.Character, '}');

    const span = this._generateSourceSpan(startToken, endToken);
    return new CssBlockAst(span, definitions);
  }

  /** @internal */
  _parseKeyframeDefinition(delimiters: number): CssKeyframeDefinitionAst {
    const start = this._getScannerIndex();
    const stepTokens: CssToken[] = [];
    delimiters |= LBRACE_DELIM_FLAG;
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      stepTokens.push(this._parseKeyframeLabel(delimiters | COMMA_DELIM_FLAG));
      if (this._scanner.peek != chars.$LBRACE) {
        this._consume(CssTokenType.Character, ',');
      }
    }
    const stylesBlock = this._parseStyleBlock(delimiters | RBRACE_DELIM_FLAG);
    const span = this._generateSourceSpan(stepTokens[0], stylesBlock);
    const ast = new CssKeyframeDefinitionAst(span, stepTokens, stylesBlock !);

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
    const startingDelims = delimiters;

    const startToken = this._consume(CssTokenType.Character, ':');
    const tokens = [startToken];

    if (this._scanner.peek == chars.$COLON) {  // ::something
      tokens.push(this._consume(CssTokenType.Character, ':'));
    }

    const innerSelectors: CssSelectorAst[] = [];

    this._scanner.setMode(CssLexerMode.PSEUDO_SELECTOR);

    // host, host-context, lang, not, nth-child are all identifiers
    const pseudoSelectorToken = this._consume(CssTokenType.Identifier);
    const pseudoSelectorName = pseudoSelectorToken.strValue;
    tokens.push(pseudoSelectorToken);

    // host(), lang(), nth-child(), etc...
    if (this._scanner.peek == chars.$LPAREN) {
      this._scanner.setMode(CssLexerMode.PSEUDO_SELECTOR_WITH_ARGUMENTS);

      const openParenToken = this._consume(CssTokenType.Character, '(');
      tokens.push(openParenToken);

      // :host(innerSelector(s)), :not(selector), etc...
      if (_pseudoSelectorSupportsInnerSelectors(pseudoSelectorName)) {
        let innerDelims = startingDelims | LPAREN_DELIM_FLAG | RPAREN_DELIM_FLAG;
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
        const innerValueDelims = delimiters | LBRACE_DELIM_FLAG | COLON_DELIM_FLAG |
            RPAREN_DELIM_FLAG | LPAREN_DELIM_FLAG;
        while (!characterContainsDelimiter(this._scanner.peek, innerValueDelims)) {
          const token = this._scan();
          tokens.push(token);
        }
      }

      const closeParenToken = this._consume(CssTokenType.Character, ')');
      tokens.push(closeParenToken);
    }

    const end = this._getScannerIndex() - 1;
    const strValue = this._extractSourceContent(start, end);

    const endToken = tokens[tokens.length - 1];
    const span = this._generateSourceSpan(startToken, endToken);
    return new CssPseudoSelectorAst(span, strValue, pseudoSelectorName, tokens, innerSelectors);
  }

  /** @internal */
  _parseSimpleSelector(delimiters: number): CssSimpleSelectorAst {
    const start = this._getScannerIndex();

    delimiters |= COMMA_DELIM_FLAG;

    this._scanner.setMode(CssLexerMode.SELECTOR);
    const selectorCssTokens: CssToken[] = [];
    const pseudoSelectors: CssPseudoSelectorAst[] = [];

    let previousToken: CssToken = undefined !;

    const selectorPartDelimiters = delimiters | SPACE_DELIM_FLAG;
    let loopOverSelector = !characterContainsDelimiter(this._scanner.peek, selectorPartDelimiters);

    let hasAttributeError = false;
    while (loopOverSelector) {
      const peek = this._scanner.peek;

      switch (peek) {
        case chars.$COLON:
          let innerPseudo = this._parsePseudoSelector(delimiters);
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

          let token = this._scan();
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

    let end = this._getScannerIndex() - 1;

    // this happens if the selector is not directly followed by
    // a comma or curly brace without a space in between
    let operator: CssToken|null = null;
    let operatorScanCount = 0;
    let lastOperatorToken: CssToken|null = null;
    if (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      while (operator == null && !characterContainsDelimiter(this._scanner.peek, delimiters) &&
             isSelectorOperatorCharacter(this._scanner.peek)) {
        let token = this._scan();
        const tokenOperator = token.strValue;
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
              if (deepToken != null && deepToken.strValue.toLowerCase() == 'deep' &&
                  deepSlash.strValue == SLASH_CHARACTER) {
                token = new CssToken(
                    lastOperatorToken.index, lastOperatorToken.column, lastOperatorToken.line,
                    CssTokenType.Identifier, DEEP_OPERATOR_STR);
              } else {
                const text = SLASH_CHARACTER + deepToken.strValue + deepSlash.strValue;
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
      if (operator != null) {
        end = operator.index;
      }
    }

    this._scanner.consumeWhitespace();

    const strValue = this._extractSourceContent(start, end);

    // if we do come across one or more spaces inside of
    // the operators loop then an empty space is still a
    // valid operator to use if something else was not found
    if (operator == null && operatorScanCount > 0 && this._scanner.peek != chars.$LBRACE) {
      operator = lastOperatorToken;
    }

    // please note that `endToken` is reassigned multiple times below
    // so please do not optimize the if statements into if/elseif
    let startTokenOrAst: CssToken|CssAst|null = null;
    let endTokenOrAst: CssToken|CssAst|null = null;
    if (selectorCssTokens.length > 0) {
      startTokenOrAst = startTokenOrAst || selectorCssTokens[0];
      endTokenOrAst = selectorCssTokens[selectorCssTokens.length - 1];
    }
    if (pseudoSelectors.length > 0) {
      startTokenOrAst = startTokenOrAst || pseudoSelectors[0];
      endTokenOrAst = pseudoSelectors[pseudoSelectors.length - 1];
    }
    if (operator != null) {
      startTokenOrAst = startTokenOrAst || operator;
      endTokenOrAst = operator;
    }

    const span = this._generateSourceSpan(startTokenOrAst !, endTokenOrAst);
    return new CssSimpleSelectorAst(span, selectorCssTokens, strValue, pseudoSelectors, operator !);
  }

  /** @internal */
  _parseSelector(delimiters: number): CssSelectorAst {
    delimiters |= COMMA_DELIM_FLAG;
    this._scanner.setMode(CssLexerMode.SELECTOR);

    const simpleSelectors: CssSimpleSelectorAst[] = [];
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      simpleSelectors.push(this._parseSimpleSelector(delimiters));
      this._scanner.consumeWhitespace();
    }

    const firstSelector = simpleSelectors[0];
    const lastSelector = simpleSelectors[simpleSelectors.length - 1];
    const span = this._generateSourceSpan(firstSelector, lastSelector);
    return new CssSelectorAst(span, simpleSelectors);
  }

  /** @internal */
  _parseValue(delimiters: number): CssStyleValueAst {
    delimiters |= RBRACE_DELIM_FLAG | SEMICOLON_DELIM_FLAG | NEWLINE_DELIM_FLAG;

    this._scanner.setMode(CssLexerMode.STYLE_VALUE);
    const start = this._getScannerIndex();

    const tokens: CssToken[] = [];
    let wsStr = '';
    let previous: CssToken = undefined !;
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      let token: CssToken;
      if (previous != null && previous.type == CssTokenType.Identifier &&
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

    const code = this._scanner.peek;
    if (code == chars.$SEMICOLON) {
      this._consume(CssTokenType.Character, ';');
    } else if (code != chars.$RBRACE) {
      this._error(
          generateErrorMessage(
              this._getSourceContent(), `The CSS key/value definition did not end with a semicolon`,
              previous.strValue, previous.index, previous.line, previous.column),
          previous);
    }

    const strValue = this._extractSourceContent(start, end);
    const startToken = tokens[0];
    const endToken = tokens[tokens.length - 1];
    const span = this._generateSourceSpan(startToken, endToken);
    return new CssStyleValueAst(span, tokens, strValue);
  }

  /** @internal */
  _collectUntilDelim(delimiters: number, assertType: CssTokenType|null = null): CssToken[] {
    const tokens: CssToken[] = [];
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      const val = assertType != null ? this._consume(assertType) : this._scan();
      tokens.push(val);
    }
    return tokens;
  }

  /** @internal */
  _parseBlock(delimiters: number): CssBlockAst {
    delimiters |= RBRACE_DELIM_FLAG;

    this._scanner.setMode(CssLexerMode.BLOCK);

    const startToken = this._consume(CssTokenType.Character, '{');
    this._scanner.consumeEmptyStatements();

    const results: CssRuleAst[] = [];
    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      results.push(this._parseRule(delimiters));
    }

    const endToken = this._consume(CssTokenType.Character, '}');

    this._scanner.setMode(CssLexerMode.BLOCK);
    this._scanner.consumeEmptyStatements();

    const span = this._generateSourceSpan(startToken, endToken);
    return new CssBlockAst(span, results);
  }

  /** @internal */
  _parseStyleBlock(delimiters: number): CssStylesBlockAst|null {
    delimiters |= RBRACE_DELIM_FLAG | LBRACE_DELIM_FLAG;

    this._scanner.setMode(CssLexerMode.STYLE_BLOCK);

    const startToken = this._consume(CssTokenType.Character, '{');
    if (startToken.numValue != chars.$LBRACE) {
      return null;
    }

    const definitions: CssDefinitionAst[] = [];
    this._scanner.consumeEmptyStatements();

    while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
      definitions.push(this._parseDefinition(delimiters));
      this._scanner.consumeEmptyStatements();
    }

    const endToken = this._consume(CssTokenType.Character, '}');

    this._scanner.setMode(CssLexerMode.STYLE_BLOCK);
    this._scanner.consumeEmptyStatements();

    const span = this._generateSourceSpan(startToken, endToken);
    return new CssStylesBlockAst(span, definitions);
  }

  /** @internal */
  _parseDefinition(delimiters: number): CssDefinitionAst {
    this._scanner.setMode(CssLexerMode.STYLE_BLOCK);

    let prop = this._consume(CssTokenType.Identifier);
    let parseValue: boolean = false;
    let value: CssStyleValueAst|null = null;
    let endToken: CssToken|CssStyleValueAst = prop;

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
        let propStr = [prop.strValue];
        if (this._scanner.peek != chars.$COLON) {
          // this will throw the error
          const nextValue = this._consume(CssTokenType.Character, ':');
          propStr.push(nextValue.strValue);

          const remainingTokens = this._collectUntilDelim(
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

    const span = this._generateSourceSpan(prop, endToken);
    return new CssDefinitionAst(span, prop, value !);
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
    const length = problemToken.strValue.length;
    const error = CssParseError.create(
        this._file, 0, problemToken.line, problemToken.column, length, message);
    this._errors.push(error);
  }
}

export class CssParseError extends ParseError {
  static create(
      file: ParseSourceFile, offset: number, line: number, col: number, length: number,
      errMsg: string): CssParseError {
    const start = new ParseLocation(file, offset, line, col);
    const end = new ParseLocation(file, offset, line, col + length);
    const span = new ParseSourceSpan(start, end);
    return new CssParseError(span, 'CSS Parse Error: ' + errMsg);
  }

  constructor(span: ParseSourceSpan, message: string) { super(span, message); }
}
