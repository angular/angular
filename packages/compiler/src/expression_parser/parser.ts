/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as chars from '../chars';
import {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from '../ml_parser/interpolation_config';
import {escapeRegExp} from '../util';

import {AST, ASTWithSource, AbsoluteSourceSpan, AstVisitor, Binary, BindingPipe, Chain, Conditional, EmptyExpr, FunctionCall, ImplicitReceiver, Interpolation, KeyedRead, KeyedWrite, LiteralArray, LiteralMap, LiteralMapKey, LiteralPrimitive, MethodCall, NonNullAssert, ParseSpan, ParserError, PrefixNot, PropertyRead, PropertyWrite, Quote, SafeMethodCall, SafePropertyRead, TemplateBinding} from './ast';
import {EOF, Lexer, Token, TokenType, isIdentifier, isQuote} from './lexer';

export class SplitInterpolation {
  constructor(public strings: string[], public expressions: string[], public offsets: number[]) {}
}

export class TemplateBindingParseResult {
  constructor(
      public templateBindings: TemplateBinding[], public warnings: string[],
      public errors: ParserError[]) {}
}

const defaultInterpolateRegExp = _createInterpolateRegExp(DEFAULT_INTERPOLATION_CONFIG);
function _getInterpolateRegExp(config: InterpolationConfig): RegExp {
  if (config === DEFAULT_INTERPOLATION_CONFIG) {
    return defaultInterpolateRegExp;
  } else {
    return _createInterpolateRegExp(config);
  }
}

function _createInterpolateRegExp(config: InterpolationConfig): RegExp {
  const pattern = escapeRegExp(config.start) + '([\\s\\S]*?)' + escapeRegExp(config.end);
  return new RegExp(pattern, 'g');
}

export class Parser {
  private errors: ParserError[] = [];

  constructor(private _lexer: Lexer) {}

  simpleExpressionChecker = SimpleExpressionChecker;

  parseAction(
      input: string, location: any, absoluteOffset: number,
      interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG): ASTWithSource {
    this._checkNoInterpolation(input, location, interpolationConfig);
    const sourceToLex = this._stripComments(input);
    const tokens = this._lexer.tokenize(this._stripComments(input));
    const ast = new _ParseAST(
                    input, location, absoluteOffset, tokens, sourceToLex.length, true, this.errors,
                    input.length - sourceToLex.length)
                    .parseChain();
    return new ASTWithSource(ast, input, location, absoluteOffset, this.errors);
  }

  parseBinding(
      input: string, location: any, absoluteOffset: number,
      interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG): ASTWithSource {
    const ast = this._parseBindingAst(input, location, absoluteOffset, interpolationConfig);
    return new ASTWithSource(ast, input, location, absoluteOffset, this.errors);
  }

  private checkSimpleExpression(ast: AST): string[] {
    const checker = new this.simpleExpressionChecker();
    ast.visit(checker);
    return checker.errors;
  }

  parseSimpleBinding(
      input: string, location: string, absoluteOffset: number,
      interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG): ASTWithSource {
    const ast = this._parseBindingAst(input, location, absoluteOffset, interpolationConfig);
    const errors = this.checkSimpleExpression(ast);
    if (errors.length > 0) {
      this._reportError(
          `Host binding expression cannot contain ${errors.join(' ')}`, input, location);
    }
    return new ASTWithSource(ast, input, location, absoluteOffset, this.errors);
  }

  private _reportError(message: string, input: string, errLocation: string, ctxLocation?: any) {
    this.errors.push(new ParserError(message, input, errLocation, ctxLocation));
  }

  private _parseBindingAst(
      input: string, location: string, absoluteOffset: number,
      interpolationConfig: InterpolationConfig): AST {
    // Quotes expressions use 3rd-party expression language. We don't want to use
    // our lexer or parser for that, so we check for that ahead of time.
    const quote = this._parseQuote(input, location, absoluteOffset);

    if (quote != null) {
      return quote;
    }

    this._checkNoInterpolation(input, location, interpolationConfig);
    const sourceToLex = this._stripComments(input);
    const tokens = this._lexer.tokenize(sourceToLex);
    return new _ParseAST(
               input, location, absoluteOffset, tokens, sourceToLex.length, false, this.errors,
               input.length - sourceToLex.length)
        .parseChain();
  }

  private _parseQuote(input: string|null, location: any, absoluteOffset: number): AST|null {
    if (input == null) return null;
    const prefixSeparatorIndex = input.indexOf(':');
    if (prefixSeparatorIndex == -1) return null;
    const prefix = input.substring(0, prefixSeparatorIndex).trim();
    if (!isIdentifier(prefix)) return null;
    const uninterpretedExpression = input.substring(prefixSeparatorIndex + 1);
    const span = new ParseSpan(0, input.length);
    return new Quote(
        span, span.toAbsolute(absoluteOffset), prefix, uninterpretedExpression, location);
  }

  /**
   * Parse microsyntax template expression and return a list of bindings or
   * parsing errors in case the given expression is invalid.
   *
   * For example,
   * ```
   *   <div *ngFor="let item of items">
   *                ^ `absoluteOffset` for `tplValue`
   * ```
   * contains three bindings:
   * 1. ngFor -> null
   * 2. item -> NgForOfContext.$implicit
   * 3. ngForOf -> items
   *
   * This is apparent from the de-sugared template:
   * ```
   *   <ng-template ngFor let-item [ngForOf]="items">
   * ```
   *
   * @param templateKey name of directive, without the * prefix. For example: ngIf, ngFor
   * @param templateValue RHS of the microsyntax attribute
   * @param templateUrl template filename if it's external, component filename if it's inline
   * @param absoluteOffset absolute offset of the `tplValue`
   */
  parseTemplateBindings(
      templateKey: string, templateValue: string, templateUrl: string,
      absoluteOffset: number): TemplateBindingParseResult {
    const tokens = this._lexer.tokenize(templateValue);
    return new _ParseAST(
               templateValue, templateUrl, absoluteOffset, tokens, templateValue.length,
               false /* parseAction */, this.errors, 0 /* relative offset */)
        .parseTemplateBindings(templateKey);
  }

  parseInterpolation(
      input: string, location: any, absoluteOffset: number,
      interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG): ASTWithSource|null {
    const split = this.splitInterpolation(input, location, interpolationConfig);
    if (split == null) return null;

    const expressions: AST[] = [];

    for (let i = 0; i < split.expressions.length; ++i) {
      const expressionText = split.expressions[i];
      const sourceToLex = this._stripComments(expressionText);
      const tokens = this._lexer.tokenize(sourceToLex);
      const ast = new _ParseAST(
                      input, location, absoluteOffset, tokens, sourceToLex.length, false,
                      this.errors, split.offsets[i] + (expressionText.length - sourceToLex.length))
                      .parseChain();
      expressions.push(ast);
    }

    const span = new ParseSpan(0, input == null ? 0 : input.length);
    return new ASTWithSource(
        new Interpolation(span, span.toAbsolute(absoluteOffset), split.strings, expressions), input,
        location, absoluteOffset, this.errors);
  }

  splitInterpolation(
      input: string, location: string,
      interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG): SplitInterpolation
      |null {
    const regexp = _getInterpolateRegExp(interpolationConfig);
    const parts = input.split(regexp);
    if (parts.length <= 1) {
      return null;
    }
    const strings: string[] = [];
    const expressions: string[] = [];
    const offsets: number[] = [];
    let offset = 0;
    for (let i = 0; i < parts.length; i++) {
      const part: string = parts[i];
      if (i % 2 === 0) {
        // fixed string
        strings.push(part);
        offset += part.length;
      } else if (part.trim().length > 0) {
        offset += interpolationConfig.start.length;
        expressions.push(part);
        offsets.push(offset);
        offset += part.length + interpolationConfig.end.length;
      } else {
        this._reportError(
            'Blank expressions are not allowed in interpolated strings', input,
            `at column ${this._findInterpolationErrorColumn(parts, i, interpolationConfig)} in`,
            location);
        expressions.push('$implicit');
        offsets.push(offset);
      }
    }
    return new SplitInterpolation(strings, expressions, offsets);
  }

  wrapLiteralPrimitive(input: string|null, location: any, absoluteOffset: number): ASTWithSource {
    const span = new ParseSpan(0, input == null ? 0 : input.length);
    return new ASTWithSource(
        new LiteralPrimitive(span, span.toAbsolute(absoluteOffset), input), input, location,
        absoluteOffset, this.errors);
  }

  private _stripComments(input: string): string {
    const i = this._commentStart(input);
    return i != null ? input.substring(0, i).trim() : input;
  }

  private _commentStart(input: string): number|null {
    let outerQuote: number|null = null;
    for (let i = 0; i < input.length - 1; i++) {
      const char = input.charCodeAt(i);
      const nextChar = input.charCodeAt(i + 1);

      if (char === chars.$SLASH && nextChar == chars.$SLASH && outerQuote == null) return i;

      if (outerQuote === char) {
        outerQuote = null;
      } else if (outerQuote == null && isQuote(char)) {
        outerQuote = char;
      }
    }
    return null;
  }

  private _checkNoInterpolation(
      input: string, location: any, interpolationConfig: InterpolationConfig): void {
    const regexp = _getInterpolateRegExp(interpolationConfig);
    const parts = input.split(regexp);
    if (parts.length > 1) {
      this._reportError(
          `Got interpolation (${interpolationConfig.start}${interpolationConfig.end}) where expression was expected`,
          input,
          `at column ${this._findInterpolationErrorColumn(parts, 1, interpolationConfig)} in`,
          location);
    }
  }

  private _findInterpolationErrorColumn(
      parts: string[], partInErrIdx: number, interpolationConfig: InterpolationConfig): number {
    let errLocation = '';
    for (let j = 0; j < partInErrIdx; j++) {
      errLocation += j % 2 === 0 ?
          parts[j] :
          `${interpolationConfig.start}${parts[j]}${interpolationConfig.end}`;
    }

    return errLocation.length;
  }
}

export class IvyParser extends Parser {
  simpleExpressionChecker = IvySimpleExpressionChecker;  //
}

export class _ParseAST {
  private rparensExpected = 0;
  private rbracketsExpected = 0;
  private rbracesExpected = 0;

  // Cache of expression start and input indeces to the absolute source span they map to, used to
  // prevent creating superfluous source spans in `sourceSpan`.
  // A serial of the expression start and input index is used for mapping because both are stateful
  // and may change for subsequent expressions visited by the parser.
  private sourceSpanCache = new Map<string, AbsoluteSourceSpan>();

  index: number = 0;

  constructor(
      public input: string, public location: any, public absoluteOffset: number,
      public tokens: Token[], public inputLength: number, public parseAction: boolean,
      private errors: ParserError[], private offset: number) {}

  peek(offset: number): Token {
    const i = this.index + offset;
    return i < this.tokens.length ? this.tokens[i] : EOF;
  }

  get next(): Token { return this.peek(0); }

  get inputIndex(): number {
    return (this.index < this.tokens.length) ? this.next.index + this.offset :
                                               this.inputLength + this.offset;
  }

  span(start: number) { return new ParseSpan(start, this.inputIndex); }

  sourceSpan(start: number): AbsoluteSourceSpan {
    const serial = `${start}@${this.inputIndex}`;
    if (!this.sourceSpanCache.has(serial)) {
      this.sourceSpanCache.set(serial, this.span(start).toAbsolute(this.absoluteOffset));
    }
    return this.sourceSpanCache.get(serial) !;
  }

  advance() { this.index++; }

  optionalCharacter(code: number): boolean {
    if (this.next.isCharacter(code)) {
      this.advance();
      return true;
    } else {
      return false;
    }
  }

  peekKeywordLet(): boolean { return this.next.isKeywordLet(); }
  peekKeywordAs(): boolean { return this.next.isKeywordAs(); }

  expectCharacter(code: number) {
    if (this.optionalCharacter(code)) return;
    this.error(`Missing expected ${String.fromCharCode(code)}`);
  }

  optionalOperator(op: string): boolean {
    if (this.next.isOperator(op)) {
      this.advance();
      return true;
    } else {
      return false;
    }
  }

  expectOperator(operator: string) {
    if (this.optionalOperator(operator)) return;
    this.error(`Missing expected operator ${operator}`);
  }

  expectIdentifierOrKeyword(): string {
    const n = this.next;
    if (!n.isIdentifier() && !n.isKeyword()) {
      this.error(`Unexpected token ${n}, expected identifier or keyword`);
      return '';
    }
    this.advance();
    return n.toString() as string;
  }

  expectIdentifierOrKeywordOrString(): string {
    const n = this.next;
    if (!n.isIdentifier() && !n.isKeyword() && !n.isString()) {
      this.error(`Unexpected token ${n}, expected identifier, keyword, or string`);
      return '';
    }
    this.advance();
    return n.toString() as string;
  }

  parseChain(): AST {
    const exprs: AST[] = [];
    const start = this.inputIndex;
    while (this.index < this.tokens.length) {
      const expr = this.parsePipe();
      exprs.push(expr);

      if (this.optionalCharacter(chars.$SEMICOLON)) {
        if (!this.parseAction) {
          this.error('Binding expression cannot contain chained expression');
        }
        while (this.optionalCharacter(chars.$SEMICOLON)) {
        }  // read all semicolons
      } else if (this.index < this.tokens.length) {
        this.error(`Unexpected token '${this.next}'`);
      }
    }
    if (exprs.length == 0) return new EmptyExpr(this.span(start), this.sourceSpan(start));
    if (exprs.length == 1) return exprs[0];
    return new Chain(this.span(start), this.sourceSpan(start), exprs);
  }

  parsePipe(): AST {
    let result = this.parseExpression();
    if (this.optionalOperator('|')) {
      if (this.parseAction) {
        this.error('Cannot have a pipe in an action expression');
      }

      do {
        const nameStart = this.inputIndex;
        const name = this.expectIdentifierOrKeyword();
        const nameSpan = this.sourceSpan(nameStart);
        const args: AST[] = [];
        while (this.optionalCharacter(chars.$COLON)) {
          args.push(this.parseExpression());
        }
        const {start} = result.span;
        result =
            new BindingPipe(this.span(start), this.sourceSpan(start), result, name, args, nameSpan);
      } while (this.optionalOperator('|'));
    }

    return result;
  }

  parseExpression(): AST { return this.parseConditional(); }

  parseConditional(): AST {
    const start = this.inputIndex;
    const result = this.parseLogicalOr();

    if (this.optionalOperator('?')) {
      const yes = this.parsePipe();
      let no: AST;
      if (!this.optionalCharacter(chars.$COLON)) {
        const end = this.inputIndex;
        const expression = this.input.substring(start, end);
        this.error(`Conditional expression ${expression} requires all 3 expressions`);
        no = new EmptyExpr(this.span(start), this.sourceSpan(start));
      } else {
        no = this.parsePipe();
      }
      return new Conditional(this.span(start), this.sourceSpan(start), result, yes, no);
    } else {
      return result;
    }
  }

  parseLogicalOr(): AST {
    // '||'
    let result = this.parseLogicalAnd();
    while (this.optionalOperator('||')) {
      const right = this.parseLogicalAnd();
      const {start} = result.span;
      result = new Binary(this.span(start), this.sourceSpan(start), '||', result, right);
    }
    return result;
  }

  parseLogicalAnd(): AST {
    // '&&'
    let result = this.parseEquality();
    while (this.optionalOperator('&&')) {
      const right = this.parseEquality();
      const {start} = result.span;
      result = new Binary(this.span(start), this.sourceSpan(start), '&&', result, right);
    }
    return result;
  }

  parseEquality(): AST {
    // '==','!=','===','!=='
    let result = this.parseRelational();
    while (this.next.type == TokenType.Operator) {
      const operator = this.next.strValue;
      switch (operator) {
        case '==':
        case '===':
        case '!=':
        case '!==':
          this.advance();
          const right = this.parseRelational();
          const {start} = result.span;
          result = new Binary(this.span(start), this.sourceSpan(start), operator, result, right);
          continue;
      }
      break;
    }
    return result;
  }

  parseRelational(): AST {
    // '<', '>', '<=', '>='
    let result = this.parseAdditive();
    while (this.next.type == TokenType.Operator) {
      const operator = this.next.strValue;
      switch (operator) {
        case '<':
        case '>':
        case '<=':
        case '>=':
          this.advance();
          const right = this.parseAdditive();
          const {start} = result.span;
          result = new Binary(this.span(start), this.sourceSpan(start), operator, result, right);
          continue;
      }
      break;
    }
    return result;
  }

  parseAdditive(): AST {
    // '+', '-'
    let result = this.parseMultiplicative();
    while (this.next.type == TokenType.Operator) {
      const operator = this.next.strValue;
      switch (operator) {
        case '+':
        case '-':
          this.advance();
          let right = this.parseMultiplicative();
          const {start} = result.span;
          result = new Binary(this.span(start), this.sourceSpan(start), operator, result, right);
          continue;
      }
      break;
    }
    return result;
  }

  parseMultiplicative(): AST {
    // '*', '%', '/'
    let result = this.parsePrefix();
    while (this.next.type == TokenType.Operator) {
      const operator = this.next.strValue;
      switch (operator) {
        case '*':
        case '%':
        case '/':
          this.advance();
          let right = this.parsePrefix();
          const {start} = result.span;
          result = new Binary(this.span(start), this.sourceSpan(start), operator, result, right);
          continue;
      }
      break;
    }
    return result;
  }

  parsePrefix(): AST {
    if (this.next.type == TokenType.Operator) {
      const start = this.inputIndex;
      const operator = this.next.strValue;
      const literalSpan = new ParseSpan(start, start);
      const literalSourceSpan = literalSpan.toAbsolute(this.absoluteOffset);
      let result: AST;
      switch (operator) {
        case '+':
          this.advance();
          result = this.parsePrefix();
          return new Binary(
              this.span(start), this.sourceSpan(start), '-', result,
              new LiteralPrimitive(literalSpan, literalSourceSpan, 0));
        case '-':
          this.advance();
          result = this.parsePrefix();
          return new Binary(
              this.span(start), this.sourceSpan(start), operator,
              new LiteralPrimitive(literalSpan, literalSourceSpan, 0), result);
        case '!':
          this.advance();
          result = this.parsePrefix();
          return new PrefixNot(this.span(start), this.sourceSpan(start), result);
      }
    }
    return this.parseCallChain();
  }

  parseCallChain(): AST {
    let result = this.parsePrimary();
    const resultStart = result.span.start;
    while (true) {
      if (this.optionalCharacter(chars.$PERIOD)) {
        result = this.parseAccessMemberOrMethodCall(result, false);

      } else if (this.optionalOperator('?.')) {
        result = this.parseAccessMemberOrMethodCall(result, true);

      } else if (this.optionalCharacter(chars.$LBRACKET)) {
        this.rbracketsExpected++;
        const key = this.parsePipe();
        this.rbracketsExpected--;
        this.expectCharacter(chars.$RBRACKET);
        if (this.optionalOperator('=')) {
          const value = this.parseConditional();
          result = new KeyedWrite(
              this.span(resultStart), this.sourceSpan(resultStart), result, key, value);
        } else {
          result = new KeyedRead(this.span(resultStart), this.sourceSpan(resultStart), result, key);
        }

      } else if (this.optionalCharacter(chars.$LPAREN)) {
        this.rparensExpected++;
        const args = this.parseCallArguments();
        this.rparensExpected--;
        this.expectCharacter(chars.$RPAREN);
        result =
            new FunctionCall(this.span(resultStart), this.sourceSpan(resultStart), result, args);

      } else if (this.optionalOperator('!')) {
        result = new NonNullAssert(this.span(resultStart), this.sourceSpan(resultStart), result);

      } else {
        return result;
      }
    }
  }

  parsePrimary(): AST {
    const start = this.inputIndex;
    if (this.optionalCharacter(chars.$LPAREN)) {
      this.rparensExpected++;
      const result = this.parsePipe();
      this.rparensExpected--;
      this.expectCharacter(chars.$RPAREN);
      return result;

    } else if (this.next.isKeywordNull()) {
      this.advance();
      return new LiteralPrimitive(this.span(start), this.sourceSpan(start), null);

    } else if (this.next.isKeywordUndefined()) {
      this.advance();
      return new LiteralPrimitive(this.span(start), this.sourceSpan(start), void 0);

    } else if (this.next.isKeywordTrue()) {
      this.advance();
      return new LiteralPrimitive(this.span(start), this.sourceSpan(start), true);

    } else if (this.next.isKeywordFalse()) {
      this.advance();
      return new LiteralPrimitive(this.span(start), this.sourceSpan(start), false);

    } else if (this.next.isKeywordThis()) {
      this.advance();
      return new ImplicitReceiver(this.span(start), this.sourceSpan(start));

    } else if (this.optionalCharacter(chars.$LBRACKET)) {
      this.rbracketsExpected++;
      const elements = this.parseExpressionList(chars.$RBRACKET);
      this.rbracketsExpected--;
      this.expectCharacter(chars.$RBRACKET);
      return new LiteralArray(this.span(start), this.sourceSpan(start), elements);

    } else if (this.next.isCharacter(chars.$LBRACE)) {
      return this.parseLiteralMap();

    } else if (this.next.isIdentifier()) {
      return this.parseAccessMemberOrMethodCall(
          new ImplicitReceiver(this.span(start), this.sourceSpan(start)), false);

    } else if (this.next.isNumber()) {
      const value = this.next.toNumber();
      this.advance();
      return new LiteralPrimitive(this.span(start), this.sourceSpan(start), value);

    } else if (this.next.isString()) {
      const literalValue = this.next.toString();
      this.advance();
      return new LiteralPrimitive(this.span(start), this.sourceSpan(start), literalValue);

    } else if (this.index >= this.tokens.length) {
      this.error(`Unexpected end of expression: ${this.input}`);
      return new EmptyExpr(this.span(start), this.sourceSpan(start));
    } else {
      this.error(`Unexpected token ${this.next}`);
      return new EmptyExpr(this.span(start), this.sourceSpan(start));
    }
  }

  parseExpressionList(terminator: number): AST[] {
    const result: AST[] = [];
    if (!this.next.isCharacter(terminator)) {
      do {
        result.push(this.parsePipe());
      } while (this.optionalCharacter(chars.$COMMA));
    }
    return result;
  }

  parseLiteralMap(): LiteralMap {
    const keys: LiteralMapKey[] = [];
    const values: AST[] = [];
    const start = this.inputIndex;
    this.expectCharacter(chars.$LBRACE);
    if (!this.optionalCharacter(chars.$RBRACE)) {
      this.rbracesExpected++;
      do {
        const quoted = this.next.isString();
        const key = this.expectIdentifierOrKeywordOrString();
        keys.push({key, quoted});
        this.expectCharacter(chars.$COLON);
        values.push(this.parsePipe());
      } while (this.optionalCharacter(chars.$COMMA));
      this.rbracesExpected--;
      this.expectCharacter(chars.$RBRACE);
    }
    return new LiteralMap(this.span(start), this.sourceSpan(start), keys, values);
  }

  parseAccessMemberOrMethodCall(receiver: AST, isSafe: boolean = false): AST {
    const start = receiver.span.start;
    const id = this.expectIdentifierOrKeyword();

    if (this.optionalCharacter(chars.$LPAREN)) {
      this.rparensExpected++;
      const args = this.parseCallArguments();
      this.expectCharacter(chars.$RPAREN);
      this.rparensExpected--;
      const span = this.span(start);
      const sourceSpan = this.sourceSpan(start);
      return isSafe ? new SafeMethodCall(span, sourceSpan, receiver, id, args) :
                      new MethodCall(span, sourceSpan, receiver, id, args);

    } else {
      if (isSafe) {
        if (this.optionalOperator('=')) {
          this.error('The \'?.\' operator cannot be used in the assignment');
          return new EmptyExpr(this.span(start), this.sourceSpan(start));
        } else {
          return new SafePropertyRead(this.span(start), this.sourceSpan(start), receiver, id);
        }
      } else {
        if (this.optionalOperator('=')) {
          if (!this.parseAction) {
            this.error('Bindings cannot contain assignments');
            return new EmptyExpr(this.span(start), this.sourceSpan(start));
          }

          const value = this.parseConditional();
          return new PropertyWrite(this.span(start), this.sourceSpan(start), receiver, id, value);
        } else {
          const span = this.span(start);
          return new PropertyRead(this.span(start), this.sourceSpan(start), receiver, id);
        }
      }
    }
  }

  parseCallArguments(): BindingPipe[] {
    if (this.next.isCharacter(chars.$RPAREN)) return [];
    const positionals: AST[] = [];
    do {
      positionals.push(this.parsePipe());
    } while (this.optionalCharacter(chars.$COMMA));
    return positionals as BindingPipe[];
  }

  /**
   * Parses an identifier, a keyword, a string with an optional `-` in between.
   */
  expectTemplateBindingKey(): {key: string, keySpan: ParseSpan} {
    let result = '';
    let operatorFound = false;
    const start = this.inputIndex;
    do {
      result += this.expectIdentifierOrKeywordOrString();
      operatorFound = this.optionalOperator('-');
      if (operatorFound) {
        result += '-';
      }
    } while (operatorFound);
    return {
      key: result,
      keySpan: new ParseSpan(start, start + result.length),
    };
  }

  /**
   * Parse microsyntax template expression and return a list of bindings or
   * parsing errors in case the given expression is invalid.
   *
   * For example,
   * ```
   *   <div *ngFor="let item of items; index as i; trackBy: func">
   * ```
   * contains five bindings:
   * 1. ngFor -> null
   * 2. item -> NgForOfContext.$implicit
   * 3. ngForOf -> items
   * 4. i -> NgForOfContext.index
   * 5. ngForTrackBy -> func
   *
   * For a full description of the microsyntax grammar, see
   * https://gist.github.com/mhevery/d3530294cff2e4a1b3fe15ff75d08855
   *
   * @param templateKey name of the microsyntax directive, like ngIf, ngFor, without the *
   */
  parseTemplateBindings(templateKey: string): TemplateBindingParseResult {
    const bindings: TemplateBinding[] = [];

    // The first binding is for the template key itself
    // In *ngFor="let item of items", key = "ngFor", value = null
    // In *ngIf="cond | pipe", key = "ngIf", value = "cond | pipe"
    bindings.push(...this.parseDirectiveKeywordBindings(
        templateKey, new ParseSpan(0, templateKey.length), this.absoluteOffset));

    while (this.index < this.tokens.length) {
      // If it starts with 'let', then this must be variable declaration
      const letBinding = this.parseLetBinding();
      if (letBinding) {
        bindings.push(letBinding);
      } else {
        // Two possible cases here, either `value "as" key` or
        // "directive-keyword expression". We don't know which case, but both
        // "value" and "directive-keyword" are template binding key, so consume
        // the key first.
        const {key, keySpan} = this.expectTemplateBindingKey();
        // Peek at the next token, if it is "as" then this must be variable
        // declaration.
        const binding = this.parseAsBinding(key, keySpan, this.absoluteOffset);
        if (binding) {
          bindings.push(binding);
        } else {
          // Otherwise the key must be a directive keyword, like "of". Transform
          // the key to actual key. Eg. of -> ngForOf, trackBy -> ngForTrackBy
          const actualKey = templateKey + key[0].toUpperCase() + key.substring(1);
          bindings.push(
              ...this.parseDirectiveKeywordBindings(actualKey, keySpan, this.absoluteOffset));
        }
      }
      this.consumeStatementTerminator();
    }

    return new TemplateBindingParseResult(bindings, [] /* warnings */, this.errors);
  }

  /**
   * Parse a directive keyword, followed by a mandatory expression.
   * For example, "of items", "trackBy: func".
   * The bindings are: ngForOf -> items, ngForTrackBy -> func
   * There could be an optional "as" binding that follows the expression.
   * For example,
   * ```
   * *ngFor="let item of items | slice:0:1 as collection".`
   *                  ^^ ^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^
   *             keyword    bound target   optional 'as' binding
   * ```
   *
   * @param key binding key, for example, ngFor, ngIf, ngForOf
   * @param keySpan span of the key in the expression. keySpan might be different
   * from `key.length`. For example, the span for key "ngForOf" is "of".
   * @param absoluteOffset absolute offset of the attribute value
   */
  private parseDirectiveKeywordBindings(key: string, keySpan: ParseSpan, absoluteOffset: number):
      TemplateBinding[] {
    const bindings: TemplateBinding[] = [];
    this.optionalCharacter(chars.$COLON);  // trackBy: trackByFunction
    const valueExpr = this.getDirectiveBoundTarget();
    const span = new ParseSpan(keySpan.start, this.inputIndex);
    bindings.push(new TemplateBinding(
        span, span.toAbsolute(absoluteOffset), key, false /* keyIsVar */, valueExpr?.source || '', valueExpr));
    // The binding could optionally be followed by "as". For example,
    // *ngIf="cond | pipe as x". In this case, the key in the "as" binding
    // is "x" and the value is the template key itself ("ngIf"). Note that the
    // 'key' in the current context now becomes the "value" in the next binding.
    const asBinding = this.parseAsBinding(key, keySpan, absoluteOffset);
    if (asBinding) {
      bindings.push(asBinding);
    }
    this.consumeStatementTerminator();
    return bindings;
  }

  /**
   * Return the expression AST for the bound target of a directive keyword
   * binding. For example,
   * ```
   * *ngIf="condition | pipe".
   *        ^^^^^^^^^^^^^^^^ bound target for "ngIf"
   * *ngFor="let item of items"
   *                     ^^^^^ bound target for "ngForOf"
   * ```
   */
  private getDirectiveBoundTarget(): ASTWithSource|null {
    if (this.next === EOF || this.peekKeywordAs() || this.peekKeywordLet()) {
      return null;
    }
    const ast = this.parsePipe();  // example: "condition | async"
    const {start, end} = ast.span;
    const value = this.input.substring(start, end);
    return new ASTWithSource(ast, value, this.location, this.absoluteOffset + start, this.errors);
  }

  /**
   * Return the binding for a variable declared using `as`. Note that the order
   * of the key-value pair in this declaration is reversed. For example,
   * ```
   * *ngFor="let item of items; index as i"
   *                            ^^^^^    ^
   *                            value    key
   * ```
   *
   * @param value name of the value in the declaration, "ngIf" in the example above
   * @param valueSpan span of the value in the declaration
   * @param absoluteOffset absolute offset of `value`
   */
  private parseAsBinding(value: string, valueSpan: ParseSpan, absoluteOffset: number):
      TemplateBinding|null {
    if (!this.peekKeywordAs()) {
      return null;
    }
    this.advance();  // consume the 'as' keyword
    const {key} = this.expectTemplateBindingKey();
    const valueAst = new AST(valueSpan, valueSpan.toAbsolute(absoluteOffset));
    const valueExpr = new ASTWithSource(
        valueAst, value, this.location, absoluteOffset + valueSpan.start, this.errors);
    const span = new ParseSpan(valueSpan.start, this.inputIndex);
    return new TemplateBinding(
        span, span.toAbsolute(absoluteOffset), key, true /* keyIsVar */, value, valueExpr);
  }

  /**
   * Return the binding for a variable declared using `let`. For example,
   * ```
   * *ngFor="let item of items; let i=index;"
   *         ^^^^^^^^           ^^^^^^^^^^^
   * ```
   * In the first binding, `item` is bound to `NgForOfContext.$implicit`.
   * In the second binding, `i` is bound to `NgForOfContext.index`.
   */
  private parseLetBinding(): TemplateBinding|null {
    if (!this.peekKeywordLet()) {
      return null;
    }
    const spanStart = this.inputIndex;
    this.advance();  // consume the 'let' keyword
    const {key} = this.expectTemplateBindingKey();
    let valueExpr: ASTWithSource|null = null;
    if (this.optionalOperator('=')) {
      const {key: value, keySpan: valueSpan} = this.expectTemplateBindingKey();
      const ast = new AST(valueSpan, valueSpan.toAbsolute(this.absoluteOffset));
      valueExpr = new ASTWithSource(
          ast, value, this.location, this.absoluteOffset + valueSpan.start, this.errors);
    }
    const spanEnd = this.inputIndex;
    const span = new ParseSpan(spanStart, spanEnd);
    return new TemplateBinding(
        span, span.toAbsolute(this.absoluteOffset), key, true /* keyIsVar */, valueExpr?.source || '$implicit', valueExpr);
  }

  /**
   * Consume the optional statement terminator: semicolon or comma.
   */
  private consumeStatementTerminator() {
    this.optionalCharacter(chars.$SEMICOLON) || this.optionalCharacter(chars.$COMMA);
  }

  error(message: string, index: number|null = null) {
    this.errors.push(new ParserError(message, this.input, this.locationText(index), this.location));
    this.skip();
  }

  private locationText(index: number|null = null) {
    if (index == null) index = this.index;
    return (index < this.tokens.length) ? `at column ${this.tokens[index].index + 1} in` :
                                          `at the end of the expression`;
  }

  // Error recovery should skip tokens until it encounters a recovery point. skip() treats
  // the end of input and a ';' as unconditionally a recovery point. It also treats ')',
  // '}' and ']' as conditional recovery points if one of calling productions is expecting
  // one of these symbols. This allows skip() to recover from errors such as '(a.) + 1' allowing
  // more of the AST to be retained (it doesn't skip any tokens as the ')' is retained because
  // of the '(' begins an '(' <expr> ')' production). The recovery points of grouping symbols
  // must be conditional as they must be skipped if none of the calling productions are not
  // expecting the closing token else we will never make progress in the case of an
  // extraneous group closing symbol (such as a stray ')'). This is not the case for ';' because
  // parseChain() is always the root production and it expects a ';'.

  // If a production expects one of these token it increments the corresponding nesting count,
  // and then decrements it just prior to checking if the token is in the input.
  private skip() {
    let n = this.next;
    while (this.index < this.tokens.length && !n.isCharacter(chars.$SEMICOLON) &&
           (this.rparensExpected <= 0 || !n.isCharacter(chars.$RPAREN)) &&
           (this.rbracesExpected <= 0 || !n.isCharacter(chars.$RBRACE)) &&
           (this.rbracketsExpected <= 0 || !n.isCharacter(chars.$RBRACKET))) {
      if (this.next.isError()) {
        this.errors.push(new ParserError(
            this.next.toString() !, this.input, this.locationText(), this.location));
      }
      this.advance();
      n = this.next;
    }
  }
}

class SimpleExpressionChecker implements AstVisitor {
  errors: string[] = [];

  visitImplicitReceiver(ast: ImplicitReceiver, context: any) {}

  visitInterpolation(ast: Interpolation, context: any) {}

  visitLiteralPrimitive(ast: LiteralPrimitive, context: any) {}

  visitPropertyRead(ast: PropertyRead, context: any) {}

  visitPropertyWrite(ast: PropertyWrite, context: any) {}

  visitSafePropertyRead(ast: SafePropertyRead, context: any) {}

  visitMethodCall(ast: MethodCall, context: any) {}

  visitSafeMethodCall(ast: SafeMethodCall, context: any) {}

  visitFunctionCall(ast: FunctionCall, context: any) {}

  visitLiteralArray(ast: LiteralArray, context: any) { this.visitAll(ast.expressions); }

  visitLiteralMap(ast: LiteralMap, context: any) { this.visitAll(ast.values); }

  visitBinary(ast: Binary, context: any) {}

  visitPrefixNot(ast: PrefixNot, context: any) {}

  visitNonNullAssert(ast: NonNullAssert, context: any) {}

  visitConditional(ast: Conditional, context: any) {}

  visitPipe(ast: BindingPipe, context: any) { this.errors.push('pipes'); }

  visitKeyedRead(ast: KeyedRead, context: any) {}

  visitKeyedWrite(ast: KeyedWrite, context: any) {}

  visitAll(asts: any[]): any[] { return asts.map(node => node.visit(this)); }

  visitChain(ast: Chain, context: any) {}

  visitQuote(ast: Quote, context: any) {}
}

/**
 * This class extends SimpleExpressionChecker used in View Engine and performs more strict checks to
 * make sure host bindings do not contain pipes. In View Engine, having pipes in host bindings is
 * not supported as well, but in some cases (like `!(value | async)`) the error is not triggered at
 * compile time. In order to preserve View Engine behavior, more strict checks are introduced for
 * Ivy mode only.
 */
class IvySimpleExpressionChecker extends SimpleExpressionChecker {
  visitBinary(ast: Binary, context: any) {
    ast.left.visit(this);
    ast.right.visit(this);
  }

  visitPrefixNot(ast: PrefixNot, context: any) { ast.expression.visit(this); }
}
