/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as chars from '../chars';
import {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from '../ml_parser/defaults';
import {
  InterpolatedAttributeToken,
  InterpolatedTextToken,
  TokenType as MlParserTokenType,
} from '../ml_parser/tokens';

import {
  AbsoluteSourceSpan,
  AST,
  ASTWithSource,
  Binary,
  BindingPipe,
  BindingPipeType,
  Call,
  Chain,
  Conditional,
  EmptyExpr,
  ExpressionBinding,
  ImplicitReceiver,
  Interpolation,
  KeyedRead,
  LiteralArray,
  LiteralMap,
  LiteralMapKey,
  LiteralPrimitive,
  NonNullAssert,
  ParenthesizedExpression,
  ParserError,
  ParseSpan,
  PrefixNot,
  PropertyRead,
  RecursiveAstVisitor,
  SafeCall,
  SafeKeyedRead,
  SafePropertyRead,
  TaggedTemplateLiteral,
  TemplateBinding,
  TemplateBindingIdentifier,
  TemplateLiteral,
  TemplateLiteralElement,
  ThisReceiver,
  TypeofExpression,
  Unary,
  VariableBinding,
  VoidExpression,
} from './ast';
import {EOF, Lexer, StringTokenKind, Token, TokenType} from './lexer';
export interface InterpolationPiece {
  text: string;
  start: number;
  end: number;
}
export class SplitInterpolation {
  constructor(
    public strings: InterpolationPiece[],
    public expressions: InterpolationPiece[],
    public offsets: number[],
  ) {}
}

export class TemplateBindingParseResult {
  constructor(
    public templateBindings: TemplateBinding[],
    public warnings: string[],
    public errors: ParserError[],
  ) {}
}

/**
 * Represents the possible parse modes to be used as a bitmask.
 */
export const enum ParseFlags {
  None = 0,

  /**
   * Whether an output binding is being parsed.
   */
  Action = 1 << 0,
}

export class Parser {
  constructor(
    private readonly _lexer: Lexer,
    private readonly _supportsDirectPipeReferences = false,
  ) {}

  parseAction(
    input: string,
    location: string,
    absoluteOffset: number,
    interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG,
  ): ASTWithSource {
    const errors: ParserError[] = [];
    this._checkNoInterpolation(errors, input, location, interpolationConfig);
    const sourceToLex = this._stripComments(input);
    const tokens = this._lexer.tokenize(sourceToLex);
    const ast = new _ParseAST(
      input,
      location,
      absoluteOffset,
      tokens,
      ParseFlags.Action,
      errors,
      0,
      this._supportsDirectPipeReferences,
    ).parseChain();

    return new ASTWithSource(ast, input, location, absoluteOffset, errors);
  }

  parseBinding(
    input: string,
    location: string,
    absoluteOffset: number,
    interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG,
  ): ASTWithSource {
    const errors: ParserError[] = [];
    const ast = this._parseBindingAst(input, location, absoluteOffset, interpolationConfig, errors);
    return new ASTWithSource(ast, input, location, absoluteOffset, errors);
  }

  private checkSimpleExpression(ast: AST): string[] {
    const checker = new SimpleExpressionChecker();
    ast.visit(checker);
    return checker.errors;
  }

  // Host bindings parsed here
  parseSimpleBinding(
    input: string,
    location: string,
    absoluteOffset: number,
    interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG,
  ): ASTWithSource {
    const errors: ParserError[] = [];
    const ast = this._parseBindingAst(input, location, absoluteOffset, interpolationConfig, errors);
    const simplExpressionErrors = this.checkSimpleExpression(ast);

    if (simplExpressionErrors.length > 0) {
      errors.push(
        new ParserError(
          `Host binding expression cannot contain ${simplExpressionErrors.join(' ')}`,
          input,
          location,
        ),
      );
    }
    return new ASTWithSource(ast, input, location, absoluteOffset, errors);
  }

  private _parseBindingAst(
    input: string,
    location: string,
    absoluteOffset: number,
    interpolationConfig: InterpolationConfig,
    errors: ParserError[],
  ): AST {
    this._checkNoInterpolation(errors, input, location, interpolationConfig);
    const sourceToLex = this._stripComments(input);
    const tokens = this._lexer.tokenize(sourceToLex);
    return new _ParseAST(
      input,
      location,
      absoluteOffset,
      tokens,
      ParseFlags.None,
      errors,
      0,
      this._supportsDirectPipeReferences,
    ).parseChain();
  }

  /**
   * Parse microsyntax template expression and return a list of bindings or
   * parsing errors in case the given expression is invalid.
   *
   * For example,
   * ```html
   *   <div *ngFor="let item of items">
   *         ^      ^ absoluteValueOffset for `templateValue`
   *         absoluteKeyOffset for `templateKey`
   * ```
   * contains three bindings:
   * 1. ngFor -> null
   * 2. item -> NgForOfContext.$implicit
   * 3. ngForOf -> items
   *
   * This is apparent from the de-sugared template:
   * ```html
   *   <ng-template ngFor let-item [ngForOf]="items">
   * ```
   *
   * @param templateKey name of directive, without the * prefix. For example: ngIf, ngFor
   * @param templateValue RHS of the microsyntax attribute
   * @param templateUrl template filename if it's external, component filename if it's inline
   * @param absoluteKeyOffset start of the `templateKey`
   * @param absoluteValueOffset start of the `templateValue`
   */
  parseTemplateBindings(
    templateKey: string,
    templateValue: string,
    templateUrl: string,
    absoluteKeyOffset: number,
    absoluteValueOffset: number,
  ): TemplateBindingParseResult {
    const tokens = this._lexer.tokenize(templateValue);
    const errors: ParserError[] = [];
    const parser = new _ParseAST(
      templateValue,
      templateUrl,
      absoluteValueOffset,
      tokens,
      ParseFlags.None,
      errors,
      0 /* relative offset */,
      this._supportsDirectPipeReferences,
    );
    return parser.parseTemplateBindings({
      source: templateKey,
      span: new AbsoluteSourceSpan(absoluteKeyOffset, absoluteKeyOffset + templateKey.length),
    });
  }

  parseInterpolation(
    input: string,
    location: string,
    absoluteOffset: number,
    interpolatedTokens: InterpolatedAttributeToken[] | InterpolatedTextToken[] | null,
    interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG,
  ): ASTWithSource | null {
    const errors: ParserError[] = [];
    const {strings, expressions, offsets} = this.splitInterpolation(
      input,
      location,
      errors,
      interpolatedTokens,
      interpolationConfig,
    );
    if (expressions.length === 0) return null;

    const expressionNodes: AST[] = [];

    for (let i = 0; i < expressions.length; ++i) {
      const expressionText = expressions[i].text;
      const sourceToLex = this._stripComments(expressionText);
      const tokens = this._lexer.tokenize(sourceToLex);
      const ast = new _ParseAST(
        input,
        location,
        absoluteOffset,
        tokens,
        ParseFlags.None,
        errors,
        offsets[i],
        this._supportsDirectPipeReferences,
      ).parseChain();
      expressionNodes.push(ast);
    }

    return this.createInterpolationAst(
      strings.map((s) => s.text),
      expressionNodes,
      input,
      location,
      absoluteOffset,
      errors,
    );
  }

  /**
   * Similar to `parseInterpolation`, but treats the provided string as a single expression
   * element that would normally appear within the interpolation prefix and suffix (`{{` and `}}`).
   * This is used for parsing the switch expression in ICUs.
   */
  parseInterpolationExpression(
    expression: string,
    location: string,
    absoluteOffset: number,
  ): ASTWithSource {
    const sourceToLex = this._stripComments(expression);
    const tokens = this._lexer.tokenize(sourceToLex);
    const errors: ParserError[] = [];
    const ast = new _ParseAST(
      expression,
      location,
      absoluteOffset,
      tokens,
      ParseFlags.None,
      errors,
      0,
      this._supportsDirectPipeReferences,
    ).parseChain();
    const strings = ['', '']; // The prefix and suffix strings are both empty
    return this.createInterpolationAst(
      strings,
      [ast],
      expression,
      location,
      absoluteOffset,
      errors,
    );
  }

  private createInterpolationAst(
    strings: string[],
    expressions: AST[],
    input: string,
    location: string,
    absoluteOffset: number,
    errors: ParserError[],
  ): ASTWithSource {
    const span = new ParseSpan(0, input.length);
    const interpolation = new Interpolation(
      span,
      span.toAbsolute(absoluteOffset),
      strings,
      expressions,
    );
    return new ASTWithSource(interpolation, input, location, absoluteOffset, errors);
  }

  /**
   * Splits a string of text into "raw" text segments and expressions present in interpolations in
   * the string.
   * Returns `null` if there are no interpolations, otherwise a
   * `SplitInterpolation` with splits that look like
   *   <raw text> <expression> <raw text> ... <raw text> <expression> <raw text>
   */
  splitInterpolation(
    input: string,
    location: string,
    errors: ParserError[],
    interpolatedTokens: InterpolatedAttributeToken[] | InterpolatedTextToken[] | null,
    interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG,
  ): SplitInterpolation {
    const strings: InterpolationPiece[] = [];
    const expressions: InterpolationPiece[] = [];
    const offsets: number[] = [];
    const inputToTemplateIndexMap = interpolatedTokens
      ? getIndexMapForOriginalTemplate(interpolatedTokens)
      : null;
    let i = 0;
    let atInterpolation = false;
    let extendLastString = false;
    let {start: interpStart, end: interpEnd} = interpolationConfig;
    while (i < input.length) {
      if (!atInterpolation) {
        // parse until starting {{
        const start = i;
        i = input.indexOf(interpStart, i);
        if (i === -1) {
          i = input.length;
        }
        const text = input.substring(start, i);
        strings.push({text, start, end: i});

        atInterpolation = true;
      } else {
        // parse from starting {{ to ending }} while ignoring content inside quotes.
        const fullStart = i;
        const exprStart = fullStart + interpStart.length;
        const exprEnd = this._getInterpolationEndIndex(input, interpEnd, exprStart);
        if (exprEnd === -1) {
          // Could not find the end of the interpolation; do not parse an expression.
          // Instead we should extend the content on the last raw string.
          atInterpolation = false;
          extendLastString = true;
          break;
        }
        const fullEnd = exprEnd + interpEnd.length;

        const text = input.substring(exprStart, exprEnd);
        if (text.trim().length === 0) {
          errors.push(
            new ParserError(
              'Blank expressions are not allowed in interpolated strings',
              input,
              `at column ${i} in`,
              location,
            ),
          );
        }
        expressions.push({text, start: fullStart, end: fullEnd});
        const startInOriginalTemplate = inputToTemplateIndexMap?.get(fullStart) ?? fullStart;
        const offset = startInOriginalTemplate + interpStart.length;
        offsets.push(offset);

        i = fullEnd;
        atInterpolation = false;
      }
    }
    if (!atInterpolation) {
      // If we are now at a text section, add the remaining content as a raw string.
      if (extendLastString) {
        const piece = strings[strings.length - 1];
        piece.text += input.substring(i);
        piece.end = input.length;
      } else {
        strings.push({text: input.substring(i), start: i, end: input.length});
      }
    }
    return new SplitInterpolation(strings, expressions, offsets);
  }

  wrapLiteralPrimitive(
    input: string | null,
    location: string,
    absoluteOffset: number,
  ): ASTWithSource {
    const span = new ParseSpan(0, input == null ? 0 : input.length);
    return new ASTWithSource(
      new LiteralPrimitive(span, span.toAbsolute(absoluteOffset), input),
      input,
      location,
      absoluteOffset,
      [],
    );
  }

  private _stripComments(input: string): string {
    const i = this._commentStart(input);
    return i != null ? input.substring(0, i) : input;
  }

  private _commentStart(input: string): number | null {
    let outerQuote: number | null = null;
    for (let i = 0; i < input.length - 1; i++) {
      const char = input.charCodeAt(i);
      const nextChar = input.charCodeAt(i + 1);

      if (char === chars.$SLASH && nextChar == chars.$SLASH && outerQuote == null) return i;

      if (outerQuote === char) {
        outerQuote = null;
      } else if (outerQuote == null && chars.isQuote(char)) {
        outerQuote = char;
      }
    }
    return null;
  }

  private _checkNoInterpolation(
    errors: ParserError[],
    input: string,
    location: string,
    {start, end}: InterpolationConfig,
  ): void {
    let startIndex = -1;
    let endIndex = -1;

    for (const charIndex of this._forEachUnquotedChar(input, 0)) {
      if (startIndex === -1) {
        if (input.startsWith(start)) {
          startIndex = charIndex;
        }
      } else {
        endIndex = this._getInterpolationEndIndex(input, end, charIndex);
        if (endIndex > -1) {
          break;
        }
      }
    }

    if (startIndex > -1 && endIndex > -1) {
      errors.push(
        new ParserError(
          `Got interpolation (${start}${end}) where expression was expected`,
          input,
          `at column ${startIndex} in`,
          location,
        ),
      );
    }
  }

  /**
   * Finds the index of the end of an interpolation expression
   * while ignoring comments and quoted content.
   */
  private _getInterpolationEndIndex(input: string, expressionEnd: string, start: number): number {
    for (const charIndex of this._forEachUnquotedChar(input, start)) {
      if (input.startsWith(expressionEnd, charIndex)) {
        return charIndex;
      }

      // Nothing else in the expression matters after we've
      // hit a comment so look directly for the end token.
      if (input.startsWith('//', charIndex)) {
        return input.indexOf(expressionEnd, charIndex);
      }
    }

    return -1;
  }

  /**
   * Generator used to iterate over the character indexes of a string that are outside of quotes.
   * @param input String to loop through.
   * @param start Index within the string at which to start.
   */
  private *_forEachUnquotedChar(input: string, start: number) {
    let currentQuote: string | null = null;
    let escapeCount = 0;
    for (let i = start; i < input.length; i++) {
      const char = input[i];
      // Skip the characters inside quotes. Note that we only care about the outer-most
      // quotes matching up and we need to account for escape characters.
      if (
        chars.isQuote(input.charCodeAt(i)) &&
        (currentQuote === null || currentQuote === char) &&
        escapeCount % 2 === 0
      ) {
        currentQuote = currentQuote === null ? char : null;
      } else if (currentQuote === null) {
        yield i;
      }
      escapeCount = char === '\\' ? escapeCount + 1 : 0;
    }
  }
}

/** Describes a stateful context an expression parser is in. */
enum ParseContextFlags {
  None = 0,
  /**
   * A Writable context is one in which a value may be written to an lvalue.
   * For example, after we see a property access, we may expect a write to the
   * property via the "=" operator.
   *   prop
   *        ^ possible "=" after
   */
  Writable = 1,
}

class _ParseAST {
  private rparensExpected = 0;
  private rbracketsExpected = 0;
  private rbracesExpected = 0;
  private context = ParseContextFlags.None;

  // Cache of expression start and input indeces to the absolute source span they map to, used to
  // prevent creating superfluous source spans in `sourceSpan`.
  // A serial of the expression start and input index is used for mapping because both are stateful
  // and may change for subsequent expressions visited by the parser.
  private sourceSpanCache = new Map<string, AbsoluteSourceSpan>();

  private index: number = 0;

  constructor(
    private input: string,
    private location: string,
    private absoluteOffset: number,
    private tokens: Token[],
    private parseFlags: ParseFlags,
    private errors: ParserError[],
    private offset: number,
    private supportsDirectPipeReferences: boolean,
  ) {}

  private peek(offset: number): Token {
    const i = this.index + offset;
    return i < this.tokens.length ? this.tokens[i] : EOF;
  }

  private get next(): Token {
    return this.peek(0);
  }

  /** Whether all the parser input has been processed. */
  private get atEOF(): boolean {
    return this.index >= this.tokens.length;
  }

  /**
   * Index of the next token to be processed, or the end of the last token if all have been
   * processed.
   */
  private get inputIndex(): number {
    return this.atEOF ? this.currentEndIndex : this.next.index + this.offset;
  }

  /**
   * End index of the last processed token, or the start of the first token if none have been
   * processed.
   */
  private get currentEndIndex(): number {
    if (this.index > 0) {
      const curToken = this.peek(-1);
      return curToken.end + this.offset;
    }
    // No tokens have been processed yet; return the next token's start or the length of the input
    // if there is no token.
    if (this.tokens.length === 0) {
      return this.input.length + this.offset;
    }
    return this.next.index + this.offset;
  }

  /**
   * Returns the absolute offset of the start of the current token.
   */
  private get currentAbsoluteOffset(): number {
    return this.absoluteOffset + this.inputIndex;
  }

  /**
   * Retrieve a `ParseSpan` from `start` to the current position (or to `artificialEndIndex` if
   * provided).
   *
   * @param start Position from which the `ParseSpan` will start.
   * @param artificialEndIndex Optional ending index to be used if provided (and if greater than the
   *     natural ending index)
   */
  private span(start: number, artificialEndIndex?: number): ParseSpan {
    let endIndex = this.currentEndIndex;
    if (artificialEndIndex !== undefined && artificialEndIndex > this.currentEndIndex) {
      endIndex = artificialEndIndex;
    }

    // In some unusual parsing scenarios (like when certain tokens are missing and an `EmptyExpr` is
    // being created), the current token may already be advanced beyond the `currentEndIndex`. This
    // appears to be a deep-seated parser bug.
    //
    // As a workaround for now, swap the start and end indices to ensure a valid `ParseSpan`.
    // TODO(alxhub): fix the bug upstream in the parser state, and remove this workaround.
    if (start > endIndex) {
      const tmp = endIndex;
      endIndex = start;
      start = tmp;
    }

    return new ParseSpan(start, endIndex);
  }

  private sourceSpan(start: number, artificialEndIndex?: number): AbsoluteSourceSpan {
    const serial = `${start}@${this.inputIndex}:${artificialEndIndex}`;
    if (!this.sourceSpanCache.has(serial)) {
      this.sourceSpanCache.set(
        serial,
        this.span(start, artificialEndIndex).toAbsolute(this.absoluteOffset),
      );
    }
    return this.sourceSpanCache.get(serial)!;
  }

  private advance() {
    this.index++;
  }

  /**
   * Executes a callback in the provided context.
   */
  private withContext<T>(context: ParseContextFlags, cb: () => T): T {
    this.context |= context;
    const ret = cb();
    this.context ^= context;
    return ret;
  }

  private consumeOptionalCharacter(code: number): boolean {
    if (this.next.isCharacter(code)) {
      this.advance();
      return true;
    } else {
      return false;
    }
  }

  private peekKeywordLet(): boolean {
    return this.next.isKeywordLet();
  }

  private peekKeywordAs(): boolean {
    return this.next.isKeywordAs();
  }

  /**
   * Consumes an expected character, otherwise emits an error about the missing expected character
   * and skips over the token stream until reaching a recoverable point.
   *
   * See `this.error` and `this.skip` for more details.
   */
  private expectCharacter(code: number) {
    if (this.consumeOptionalCharacter(code)) return;
    this.error(`Missing expected ${String.fromCharCode(code)}`);
  }

  private consumeOptionalOperator(op: string): boolean {
    if (this.next.isOperator(op)) {
      this.advance();
      return true;
    } else {
      return false;
    }
  }

  private isAssignmentOperator(token: Token): boolean {
    return token.type === TokenType.Operator && Binary.isAssignmentOperation(token.strValue);
  }

  private expectOperator(operator: string) {
    if (this.consumeOptionalOperator(operator)) return;
    this.error(`Missing expected operator ${operator}`);
  }

  private prettyPrintToken(tok: Token): string {
    return tok === EOF ? 'end of input' : `token ${tok}`;
  }

  private expectIdentifierOrKeyword(): string | null {
    const n = this.next;
    if (!n.isIdentifier() && !n.isKeyword()) {
      if (n.isPrivateIdentifier()) {
        this._reportErrorForPrivateIdentifier(n, 'expected identifier or keyword');
      } else {
        this.error(`Unexpected ${this.prettyPrintToken(n)}, expected identifier or keyword`);
      }
      return null;
    }
    this.advance();
    return n.toString() as string;
  }

  private expectIdentifierOrKeywordOrString(): string {
    const n = this.next;
    if (!n.isIdentifier() && !n.isKeyword() && !n.isString()) {
      if (n.isPrivateIdentifier()) {
        this._reportErrorForPrivateIdentifier(n, 'expected identifier, keyword or string');
      } else {
        this.error(
          `Unexpected ${this.prettyPrintToken(n)}, expected identifier, keyword, or string`,
        );
      }
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

      if (this.consumeOptionalCharacter(chars.$SEMICOLON)) {
        if (!(this.parseFlags & ParseFlags.Action)) {
          this.error('Binding expression cannot contain chained expression');
        }
        while (this.consumeOptionalCharacter(chars.$SEMICOLON)) {} // read all semicolons
      } else if (this.index < this.tokens.length) {
        const errorIndex = this.index;
        this.error(`Unexpected token '${this.next}'`);
        // The `error` call above will skip ahead to the next recovery point in an attempt to
        // recover part of the expression, but that might be the token we started from which will
        // lead to an infinite loop. If that's the case, break the loop assuming that we can't
        // parse further.
        if (this.index === errorIndex) {
          break;
        }
      }
    }
    if (exprs.length === 0) {
      // We have no expressions so create an empty expression that spans the entire input length
      const artificialStart = this.offset;
      const artificialEnd = this.offset + this.input.length;
      return new EmptyExpr(
        this.span(artificialStart, artificialEnd),
        this.sourceSpan(artificialStart, artificialEnd),
      );
    }
    if (exprs.length == 1) return exprs[0];
    return new Chain(this.span(start), this.sourceSpan(start), exprs);
  }

  private parsePipe(): AST {
    const start = this.inputIndex;
    let result = this.parseExpression();
    if (this.consumeOptionalOperator('|')) {
      if (this.parseFlags & ParseFlags.Action) {
        this.error(`Cannot have a pipe in an action expression`);
      }

      do {
        const nameStart = this.inputIndex;
        let nameId = this.expectIdentifierOrKeyword();
        let nameSpan: AbsoluteSourceSpan;
        let fullSpanEnd: number | undefined = undefined;
        if (nameId !== null) {
          nameSpan = this.sourceSpan(nameStart);
        } else {
          // No valid identifier was found, so we'll assume an empty pipe name ('').
          nameId = '';

          // However, there may have been whitespace present between the pipe character and the next
          // token in the sequence (or the end of input). We want to track this whitespace so that
          // the `BindingPipe` we produce covers not just the pipe character, but any trailing
          // whitespace beyond it. Another way of thinking about this is that the zero-length name
          // is assumed to be at the end of any whitespace beyond the pipe character.
          //
          // Therefore, we push the end of the `ParseSpan` for this pipe all the way up to the
          // beginning of the next token, or until the end of input if the next token is EOF.
          fullSpanEnd = this.next.index !== -1 ? this.next.index : this.input.length + this.offset;

          // The `nameSpan` for an empty pipe name is zero-length at the end of any whitespace
          // beyond the pipe character.
          nameSpan = new ParseSpan(fullSpanEnd, fullSpanEnd).toAbsolute(this.absoluteOffset);
        }

        const args: AST[] = [];
        while (this.consumeOptionalCharacter(chars.$COLON)) {
          args.push(this.parseExpression());

          // If there are additional expressions beyond the name, then the artificial end for the
          // name is no longer relevant.
        }
        let type: BindingPipeType;
        if (this.supportsDirectPipeReferences) {
          const charCode = nameId.charCodeAt(0);
          type =
            charCode === chars.$_ || (charCode >= chars.$A && charCode <= chars.$Z)
              ? BindingPipeType.ReferencedDirectly
              : BindingPipeType.ReferencedByName;
        } else {
          type = BindingPipeType.ReferencedByName;
        }

        result = new BindingPipe(
          this.span(start),
          this.sourceSpan(start, fullSpanEnd),
          result,
          nameId,
          args,
          type,
          nameSpan,
        );
      } while (this.consumeOptionalOperator('|'));
    }

    return result;
  }

  private parseExpression(): AST {
    return this.parseConditional();
  }

  private parseConditional(): AST {
    const start = this.inputIndex;
    const result = this.parseLogicalOr();

    if (this.consumeOptionalOperator('?')) {
      const yes = this.parsePipe();
      let no: AST;
      if (!this.consumeOptionalCharacter(chars.$COLON)) {
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

  private parseLogicalOr(): AST {
    // '||'
    const start = this.inputIndex;
    let result = this.parseLogicalAnd();
    while (this.consumeOptionalOperator('||')) {
      const right = this.parseLogicalAnd();
      result = new Binary(this.span(start), this.sourceSpan(start), '||', result, right);
    }
    return result;
  }

  private parseLogicalAnd(): AST {
    // '&&'
    const start = this.inputIndex;
    let result = this.parseNullishCoalescing();
    while (this.consumeOptionalOperator('&&')) {
      const right = this.parseNullishCoalescing();
      result = new Binary(this.span(start), this.sourceSpan(start), '&&', result, right);
    }
    return result;
  }

  private parseNullishCoalescing(): AST {
    // '??'
    const start = this.inputIndex;
    let result = this.parseEquality();
    while (this.consumeOptionalOperator('??')) {
      const right = this.parseEquality();
      result = new Binary(this.span(start), this.sourceSpan(start), '??', result, right);
    }
    return result;
  }

  private parseEquality(): AST {
    // '==','!=','===','!=='
    const start = this.inputIndex;
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
          result = new Binary(this.span(start), this.sourceSpan(start), operator, result, right);
          continue;
      }
      break;
    }
    return result;
  }

  private parseRelational(): AST {
    // '<', '>', '<=', '>=', 'in'
    const start = this.inputIndex;
    let result = this.parseAdditive();
    while (this.next.type == TokenType.Operator || this.next.isKeywordIn) {
      const operator = this.next.strValue;
      switch (operator) {
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'in':
          this.advance();
          const right = this.parseAdditive();
          result = new Binary(this.span(start), this.sourceSpan(start), operator, result, right);
          continue;
      }
      break;
    }
    return result;
  }

  private parseAdditive(): AST {
    // '+', '-'
    const start = this.inputIndex;
    let result = this.parseMultiplicative();
    while (this.next.type == TokenType.Operator) {
      const operator = this.next.strValue;
      switch (operator) {
        case '+':
        case '-':
          this.advance();
          let right = this.parseMultiplicative();
          result = new Binary(this.span(start), this.sourceSpan(start), operator, result, right);
          continue;
      }
      break;
    }
    return result;
  }

  private parseMultiplicative(): AST {
    // '*', '%', '/'
    const start = this.inputIndex;
    let result = this.parseExponentiation();
    while (this.next.type == TokenType.Operator) {
      const operator = this.next.strValue;
      switch (operator) {
        case '*':
        case '%':
        case '/':
          this.advance();
          const right = this.parseExponentiation();
          result = new Binary(this.span(start), this.sourceSpan(start), operator, result, right);
          continue;
      }
      break;
    }
    return result;
  }

  private parseExponentiation(): AST {
    // '**'
    const start = this.inputIndex;
    let result = this.parsePrefix();
    while (this.next.type == TokenType.Operator && this.next.strValue === '**') {
      // This aligns with Javascript semantics which require any unary operator preceeding the
      // exponentiation operation to be explicitly grouped as either applying to the base or result
      // of the exponentiation operation.
      if (
        result instanceof Unary ||
        result instanceof PrefixNot ||
        result instanceof TypeofExpression ||
        result instanceof VoidExpression
      ) {
        this.error(
          'Unary operator used immediately before exponentiation expression. Parenthesis must be used to disambiguate operator precedence',
        );
      }
      this.advance();
      const right = this.parseExponentiation();
      result = new Binary(this.span(start), this.sourceSpan(start), '**', result, right);
    }
    return result;
  }

  private parsePrefix(): AST {
    if (this.next.type == TokenType.Operator) {
      const start = this.inputIndex;
      const operator = this.next.strValue;
      let result: AST;
      switch (operator) {
        case '+':
          this.advance();
          result = this.parsePrefix();
          return Unary.createPlus(this.span(start), this.sourceSpan(start), result);
        case '-':
          this.advance();
          result = this.parsePrefix();
          return Unary.createMinus(this.span(start), this.sourceSpan(start), result);
        case '!':
          this.advance();
          result = this.parsePrefix();
          return new PrefixNot(this.span(start), this.sourceSpan(start), result);
      }
    } else if (this.next.isKeywordTypeof()) {
      this.advance();
      const start = this.inputIndex;
      let result = this.parsePrefix();
      return new TypeofExpression(this.span(start), this.sourceSpan(start), result);
    } else if (this.next.isKeywordVoid()) {
      this.advance();
      const start = this.inputIndex;
      let result = this.parsePrefix();
      return new VoidExpression(this.span(start), this.sourceSpan(start), result);
    }
    return this.parseCallChain();
  }

  private parseCallChain(): AST {
    const start = this.inputIndex;
    let result = this.parsePrimary();
    while (true) {
      if (this.consumeOptionalCharacter(chars.$PERIOD)) {
        result = this.parseAccessMember(result, start, false);
      } else if (this.consumeOptionalOperator('?.')) {
        if (this.consumeOptionalCharacter(chars.$LPAREN)) {
          result = this.parseCall(result, start, true);
        } else {
          result = this.consumeOptionalCharacter(chars.$LBRACKET)
            ? this.parseKeyedReadOrWrite(result, start, true)
            : this.parseAccessMember(result, start, true);
        }
      } else if (this.consumeOptionalCharacter(chars.$LBRACKET)) {
        result = this.parseKeyedReadOrWrite(result, start, false);
      } else if (this.consumeOptionalCharacter(chars.$LPAREN)) {
        result = this.parseCall(result, start, false);
      } else if (this.consumeOptionalOperator('!')) {
        result = new NonNullAssert(this.span(start), this.sourceSpan(start), result);
      } else if (this.next.isTemplateLiteralEnd()) {
        result = this.parseNoInterpolationTaggedTemplateLiteral(result, start);
      } else if (this.next.isTemplateLiteralPart()) {
        result = this.parseTaggedTemplateLiteral(result, start);
      } else {
        return result;
      }
    }
  }

  private parsePrimary(): AST {
    const start = this.inputIndex;
    if (this.consumeOptionalCharacter(chars.$LPAREN)) {
      this.rparensExpected++;
      const result = this.parsePipe();
      if (!this.consumeOptionalCharacter(chars.$RPAREN)) {
        this.error('Missing closing parentheses');
        // Calling into `error` above will attempt to recover up until the next closing paren.
        // If that's the case, consume it so we can partially recover the expression.
        this.consumeOptionalCharacter(chars.$RPAREN);
      }
      this.rparensExpected--;
      return new ParenthesizedExpression(this.span(start), this.sourceSpan(start), result);
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
    } else if (this.next.isKeywordIn()) {
      this.advance();
      return new LiteralPrimitive(this.span(start), this.sourceSpan(start), 'in');
    } else if (this.next.isKeywordThis()) {
      this.advance();
      return new ThisReceiver(this.span(start), this.sourceSpan(start));
    } else if (this.consumeOptionalCharacter(chars.$LBRACKET)) {
      this.rbracketsExpected++;
      const elements = this.parseExpressionList(chars.$RBRACKET);
      this.rbracketsExpected--;
      this.expectCharacter(chars.$RBRACKET);
      return new LiteralArray(this.span(start), this.sourceSpan(start), elements);
    } else if (this.next.isCharacter(chars.$LBRACE)) {
      return this.parseLiteralMap();
    } else if (this.next.isIdentifier()) {
      return this.parseAccessMember(
        new ImplicitReceiver(this.span(start), this.sourceSpan(start)),
        start,
        false,
      );
    } else if (this.next.isNumber()) {
      const value = this.next.toNumber();
      this.advance();
      return new LiteralPrimitive(this.span(start), this.sourceSpan(start), value);
    } else if (this.next.isTemplateLiteralEnd()) {
      return this.parseNoInterpolationTemplateLiteral();
    } else if (this.next.isTemplateLiteralPart()) {
      return this.parseTemplateLiteral();
    } else if (this.next.isString() && this.next.kind === StringTokenKind.Plain) {
      const literalValue = this.next.toString();
      this.advance();
      return new LiteralPrimitive(this.span(start), this.sourceSpan(start), literalValue);
    } else if (this.next.isPrivateIdentifier()) {
      this._reportErrorForPrivateIdentifier(this.next, null);
      return new EmptyExpr(this.span(start), this.sourceSpan(start));
    } else if (this.index >= this.tokens.length) {
      this.error(`Unexpected end of expression: ${this.input}`);
      return new EmptyExpr(this.span(start), this.sourceSpan(start));
    } else {
      this.error(`Unexpected token ${this.next}`);
      return new EmptyExpr(this.span(start), this.sourceSpan(start));
    }
  }

  private parseExpressionList(terminator: number): AST[] {
    const result: AST[] = [];

    do {
      if (!this.next.isCharacter(terminator)) {
        result.push(this.parsePipe());
      } else {
        break;
      }
    } while (this.consumeOptionalCharacter(chars.$COMMA));
    return result;
  }

  private parseLiteralMap(): LiteralMap {
    const keys: LiteralMapKey[] = [];
    const values: AST[] = [];
    const start = this.inputIndex;
    this.expectCharacter(chars.$LBRACE);
    if (!this.consumeOptionalCharacter(chars.$RBRACE)) {
      this.rbracesExpected++;
      do {
        const keyStart = this.inputIndex;
        const quoted = this.next.isString();
        const key = this.expectIdentifierOrKeywordOrString();
        const literalMapKey: LiteralMapKey = {key, quoted};
        keys.push(literalMapKey);

        // Properties with quoted keys can't use the shorthand syntax.
        if (quoted) {
          this.expectCharacter(chars.$COLON);
          values.push(this.parsePipe());
        } else if (this.consumeOptionalCharacter(chars.$COLON)) {
          values.push(this.parsePipe());
        } else {
          literalMapKey.isShorthandInitialized = true;

          const span = this.span(keyStart);
          const sourceSpan = this.sourceSpan(keyStart);
          values.push(
            new PropertyRead(
              span,
              sourceSpan,
              sourceSpan,
              new ImplicitReceiver(span, sourceSpan),
              key,
            ),
          );
        }
      } while (
        this.consumeOptionalCharacter(chars.$COMMA) &&
        !this.next.isCharacter(chars.$RBRACE)
      );
      this.rbracesExpected--;
      this.expectCharacter(chars.$RBRACE);
    }
    return new LiteralMap(this.span(start), this.sourceSpan(start), keys, values);
  }

  private parseAccessMember(readReceiver: AST, start: number, isSafe: boolean): AST {
    const nameStart = this.inputIndex;
    const id = this.withContext(ParseContextFlags.Writable, () => {
      const id = this.expectIdentifierOrKeyword() ?? '';
      if (id.length === 0) {
        this.error(`Expected identifier for property access`, readReceiver.span.end);
      }
      return id;
    });
    const nameSpan = this.sourceSpan(nameStart);

    if (isSafe) {
      if (this.isAssignmentOperator(this.next)) {
        this.advance();
        this.error("The '?.' operator cannot be used in the assignment");
        return new EmptyExpr(this.span(start), this.sourceSpan(start));
      } else {
        return new SafePropertyRead(
          this.span(start),
          this.sourceSpan(start),
          nameSpan,
          readReceiver,
          id,
        );
      }
    } else {
      if (this.isAssignmentOperator(this.next)) {
        const operation = this.next.strValue;
        this.advance();

        if (!(this.parseFlags & ParseFlags.Action)) {
          this.error('Bindings cannot contain assignments');
          return new EmptyExpr(this.span(start), this.sourceSpan(start));
        }
        const receiver = new PropertyRead(
          this.span(start),
          this.sourceSpan(start),
          nameSpan,
          readReceiver,
          id,
        );
        const value = this.parseConditional();
        return new Binary(this.span(start), this.sourceSpan(start), operation, receiver, value);
      } else {
        return new PropertyRead(
          this.span(start),
          this.sourceSpan(start),
          nameSpan,
          readReceiver,
          id,
        );
      }
    }
  }

  private parseCall(receiver: AST, start: number, isSafe: boolean): AST {
    const argumentStart = this.inputIndex;
    this.rparensExpected++;
    const args = this.parseCallArguments();
    const argumentSpan = this.span(argumentStart, this.inputIndex).toAbsolute(this.absoluteOffset);
    this.expectCharacter(chars.$RPAREN);
    this.rparensExpected--;
    const span = this.span(start);
    const sourceSpan = this.sourceSpan(start);
    return isSafe
      ? new SafeCall(span, sourceSpan, receiver, args, argumentSpan)
      : new Call(span, sourceSpan, receiver, args, argumentSpan);
  }

  private parseCallArguments(): BindingPipe[] {
    if (this.next.isCharacter(chars.$RPAREN)) return [];
    const positionals: AST[] = [];
    do {
      positionals.push(this.parsePipe());
    } while (this.consumeOptionalCharacter(chars.$COMMA));
    return positionals as BindingPipe[];
  }

  /**
   * Parses an identifier, a keyword, a string with an optional `-` in between,
   * and returns the string along with its absolute source span.
   */
  private expectTemplateBindingKey(): TemplateBindingIdentifier {
    let result = '';
    let operatorFound = false;
    const start = this.currentAbsoluteOffset;
    do {
      result += this.expectIdentifierOrKeywordOrString();
      operatorFound = this.consumeOptionalOperator('-');
      if (operatorFound) {
        result += '-';
      }
    } while (operatorFound);
    return {
      source: result,
      span: new AbsoluteSourceSpan(start, start + result.length),
    };
  }

  /**
   * Parse microsyntax template expression and return a list of bindings or
   * parsing errors in case the given expression is invalid.
   *
   * For example,
   * ```html
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
   * @param templateKey name of the microsyntax directive, like ngIf, ngFor,
   * without the *, along with its absolute span.
   */
  parseTemplateBindings(templateKey: TemplateBindingIdentifier): TemplateBindingParseResult {
    const bindings: TemplateBinding[] = [];

    // The first binding is for the template key itself
    // In *ngFor="let item of items", key = "ngFor", value = null
    // In *ngIf="cond | pipe", key = "ngIf", value = "cond | pipe"
    bindings.push(...this.parseDirectiveKeywordBindings(templateKey));

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
        const key = this.expectTemplateBindingKey();
        // Peek at the next token, if it is "as" then this must be variable
        // declaration.
        const binding = this.parseAsBinding(key);
        if (binding) {
          bindings.push(binding);
        } else {
          // Otherwise the key must be a directive keyword, like "of". Transform
          // the key to actual key. Eg. of -> ngForOf, trackBy -> ngForTrackBy
          key.source =
            templateKey.source + key.source.charAt(0).toUpperCase() + key.source.substring(1);
          bindings.push(...this.parseDirectiveKeywordBindings(key));
        }
      }
      this.consumeStatementTerminator();
    }

    return new TemplateBindingParseResult(bindings, [] /* warnings */, this.errors);
  }

  private parseKeyedReadOrWrite(receiver: AST, start: number, isSafe: boolean): AST {
    return this.withContext(ParseContextFlags.Writable, () => {
      this.rbracketsExpected++;
      const key = this.parsePipe();
      if (key instanceof EmptyExpr) {
        this.error(`Key access cannot be empty`);
      }
      this.rbracketsExpected--;
      this.expectCharacter(chars.$RBRACKET);
      if (this.isAssignmentOperator(this.next)) {
        const operation = this.next.strValue;
        this.advance();

        if (isSafe) {
          this.error("The '?.' operator cannot be used in the assignment");
        } else {
          const binaryReceiver = new KeyedRead(
            this.span(start),
            this.sourceSpan(start),
            receiver,
            key,
          );
          const value = this.parseConditional();
          return new Binary(
            this.span(start),
            this.sourceSpan(start),
            operation,
            binaryReceiver,
            value,
          );
        }
      } else {
        return isSafe
          ? new SafeKeyedRead(this.span(start), this.sourceSpan(start), receiver, key)
          : new KeyedRead(this.span(start), this.sourceSpan(start), receiver, key);
      }

      return new EmptyExpr(this.span(start), this.sourceSpan(start));
    });
  }

  /**
   * Parse a directive keyword, followed by a mandatory expression.
   * For example, "of items", "trackBy: func".
   * The bindings are: ngForOf -> items, ngForTrackBy -> func
   * There could be an optional "as" binding that follows the expression.
   * For example,
   * ```
   *   *ngFor="let item of items | slice:0:1 as collection".
   *                    ^^ ^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^
   *               keyword    bound target   optional 'as' binding
   * ```
   *
   * @param key binding key, for example, ngFor, ngIf, ngForOf, along with its
   * absolute span.
   */
  private parseDirectiveKeywordBindings(key: TemplateBindingIdentifier): TemplateBinding[] {
    const bindings: TemplateBinding[] = [];
    this.consumeOptionalCharacter(chars.$COLON); // trackBy: trackByFunction
    const value = this.getDirectiveBoundTarget();
    let spanEnd = this.currentAbsoluteOffset;
    // The binding could optionally be followed by "as". For example,
    // *ngIf="cond | pipe as x". In this case, the key in the "as" binding
    // is "x" and the value is the template key itself ("ngIf"). Note that the
    // 'key' in the current context now becomes the "value" in the next binding.
    const asBinding = this.parseAsBinding(key);
    if (!asBinding) {
      this.consumeStatementTerminator();
      spanEnd = this.currentAbsoluteOffset;
    }
    const sourceSpan = new AbsoluteSourceSpan(key.span.start, spanEnd);
    bindings.push(new ExpressionBinding(sourceSpan, key, value));
    if (asBinding) {
      bindings.push(asBinding);
    }
    return bindings;
  }

  /**
   * Return the expression AST for the bound target of a directive keyword
   * binding. For example,
   * ```
   *   *ngIf="condition | pipe"
   *          ^^^^^^^^^^^^^^^^ bound target for "ngIf"
   *   *ngFor="let item of items"
   *                       ^^^^^ bound target for "ngForOf"
   * ```
   */
  private getDirectiveBoundTarget(): ASTWithSource | null {
    if (this.next === EOF || this.peekKeywordAs() || this.peekKeywordLet()) {
      return null;
    }
    const ast = this.parsePipe(); // example: "condition | async"
    const {start, end} = ast.span;
    const value = this.input.substring(start, end);
    return new ASTWithSource(ast, value, this.location, this.absoluteOffset + start, this.errors);
  }

  /**
   * Return the binding for a variable declared using `as`. Note that the order
   * of the key-value pair in this declaration is reversed. For example,
   * ```
   *   *ngFor="let item of items; index as i"
   *                              ^^^^^    ^
   *                              value    key
   * ```
   *
   * @param value name of the value in the declaration, "ngIf" in the example
   * above, along with its absolute span.
   */
  private parseAsBinding(value: TemplateBindingIdentifier): TemplateBinding | null {
    if (!this.peekKeywordAs()) {
      return null;
    }
    this.advance(); // consume the 'as' keyword
    const key = this.expectTemplateBindingKey();
    this.consumeStatementTerminator();
    const sourceSpan = new AbsoluteSourceSpan(value.span.start, this.currentAbsoluteOffset);
    return new VariableBinding(sourceSpan, key, value);
  }

  /**
   * Return the binding for a variable declared using `let`. For example,
   * ```
   *   *ngFor="let item of items; let i=index;"
   *           ^^^^^^^^           ^^^^^^^^^^^
   * ```
   * In the first binding, `item` is bound to `NgForOfContext.$implicit`.
   * In the second binding, `i` is bound to `NgForOfContext.index`.
   */
  private parseLetBinding(): TemplateBinding | null {
    if (!this.peekKeywordLet()) {
      return null;
    }
    const spanStart = this.currentAbsoluteOffset;
    this.advance(); // consume the 'let' keyword
    const key = this.expectTemplateBindingKey();
    let value: TemplateBindingIdentifier | null = null;
    if (this.consumeOptionalOperator('=')) {
      value = this.expectTemplateBindingKey();
    }
    this.consumeStatementTerminator();
    const sourceSpan = new AbsoluteSourceSpan(spanStart, this.currentAbsoluteOffset);
    return new VariableBinding(sourceSpan, key, value);
  }

  private parseNoInterpolationTaggedTemplateLiteral(tag: AST, start: number) {
    const template = this.parseNoInterpolationTemplateLiteral();
    return new TaggedTemplateLiteral(this.span(start), this.sourceSpan(start), tag, template);
  }

  private parseNoInterpolationTemplateLiteral(): TemplateLiteral {
    const text = this.next.strValue;
    const start = this.inputIndex;
    this.advance();
    const span = this.span(start);
    const sourceSpan = this.sourceSpan(start);
    return new TemplateLiteral(
      span,
      sourceSpan,
      [new TemplateLiteralElement(span, sourceSpan, text)],
      [],
    );
  }

  private parseTaggedTemplateLiteral(tag: AST, start: number): AST {
    const template = this.parseTemplateLiteral();
    return new TaggedTemplateLiteral(this.span(start), this.sourceSpan(start), tag, template);
  }

  private parseTemplateLiteral(): TemplateLiteral {
    const elements: TemplateLiteralElement[] = [];
    const expressions: AST[] = [];
    const start = this.inputIndex;

    while (this.next !== EOF) {
      const token = this.next;

      if (token.isTemplateLiteralPart() || token.isTemplateLiteralEnd()) {
        const partStart = this.inputIndex;
        this.advance();
        elements.push(
          new TemplateLiteralElement(
            this.span(partStart),
            this.sourceSpan(partStart),
            token.strValue,
          ),
        );
        if (token.isTemplateLiteralEnd()) {
          break;
        }
      } else if (token.isTemplateLiteralInterpolationStart()) {
        this.advance();
        const expression = this.parsePipe();
        if (expression instanceof EmptyExpr) {
          this.error('Template literal interpolation cannot be empty');
        } else {
          expressions.push(expression);
        }
      } else {
        this.advance();
      }
    }

    return new TemplateLiteral(this.span(start), this.sourceSpan(start), elements, expressions);
  }

  /**
   * Consume the optional statement terminator: semicolon or comma.
   */
  private consumeStatementTerminator() {
    this.consumeOptionalCharacter(chars.$SEMICOLON) || this.consumeOptionalCharacter(chars.$COMMA);
  }

  /**
   * Records an error and skips over the token stream until reaching a recoverable point. See
   * `this.skip` for more details on token skipping.
   */
  private error(message: string, index: number | null = null) {
    this.errors.push(new ParserError(message, this.input, this.locationText(index), this.location));
    this.skip();
  }

  private locationText(index: number | null = null) {
    if (index == null) index = this.index;
    return index < this.tokens.length
      ? `at column ${this.tokens[index].index + 1} in`
      : `at the end of the expression`;
  }

  /**
   * Records an error for an unexpected private identifier being discovered.
   * @param token Token representing a private identifier.
   * @param extraMessage Optional additional message being appended to the error.
   */
  private _reportErrorForPrivateIdentifier(token: Token, extraMessage: string | null) {
    let errorMessage = `Private identifiers are not supported. Unexpected private identifier: ${token}`;
    if (extraMessage !== null) {
      errorMessage += `, ${extraMessage}`;
    }
    this.error(errorMessage);
  }

  /**
   * Error recovery should skip tokens until it encounters a recovery point.
   *
   * The following are treated as unconditional recovery points:
   *   - end of input
   *   - ';' (parseChain() is always the root production, and it expects a ';')
   *   - '|' (since pipes may be chained and each pipe expression may be treated independently)
   *
   * The following are conditional recovery points:
   *   - ')', '}', ']' if one of calling productions is expecting one of these symbols
   *     - This allows skip() to recover from errors such as '(a.) + 1' allowing more of the AST to
   *       be retained (it doesn't skip any tokens as the ')' is retained because of the '(' begins
   *       an '(' <expr> ')' production).
   *       The recovery points of grouping symbols must be conditional as they must be skipped if
   *       none of the calling productions are not expecting the closing token else we will never
   *       make progress in the case of an extraneous group closing symbol (such as a stray ')').
   *       That is, we skip a closing symbol if we are not in a grouping production.
   *   - Assignment in a `Writable` context
   *     - In this context, we are able to recover after seeing the `=` operator, which
   *       signals the presence of an independent rvalue expression following the `=` operator.
   *
   * If a production expects one of these token it increments the corresponding nesting count,
   * and then decrements it just prior to checking if the token is in the input.
   */
  private skip() {
    let n = this.next;
    while (
      this.index < this.tokens.length &&
      !n.isCharacter(chars.$SEMICOLON) &&
      !n.isOperator('|') &&
      (this.rparensExpected <= 0 || !n.isCharacter(chars.$RPAREN)) &&
      (this.rbracesExpected <= 0 || !n.isCharacter(chars.$RBRACE)) &&
      (this.rbracketsExpected <= 0 || !n.isCharacter(chars.$RBRACKET)) &&
      (!(this.context & ParseContextFlags.Writable) || !this.isAssignmentOperator(n))
    ) {
      if (this.next.isError()) {
        this.errors.push(
          new ParserError(this.next.toString()!, this.input, this.locationText(), this.location),
        );
      }
      this.advance();
      n = this.next;
    }
  }
}

class SimpleExpressionChecker extends RecursiveAstVisitor {
  errors: string[] = [];

  override visitPipe() {
    this.errors.push('pipes');
  }
}
/**
 * Computes the real offset in the original template for indexes in an interpolation.
 *
 * Because templates can have encoded HTML entities and the input passed to the parser at this stage
 * of the compiler is the _decoded_ value, we need to compute the real offset using the original
 * encoded values in the interpolated tokens. Note that this is only a special case handling for
 * `MlParserTokenType.ENCODED_ENTITY` token types. All other interpolated tokens are expected to
 * have parts which exactly match the input string for parsing the interpolation.
 *
 * @param interpolatedTokens The tokens for the interpolated value.
 *
 * @returns A map of index locations in the decoded template to indexes in the original template
 */
function getIndexMapForOriginalTemplate(
  interpolatedTokens: InterpolatedAttributeToken[] | InterpolatedTextToken[],
): Map<number, number> {
  let offsetMap = new Map<number, number>();
  let consumedInOriginalTemplate = 0;
  let consumedInInput = 0;
  let tokenIndex = 0;
  while (tokenIndex < interpolatedTokens.length) {
    const currentToken = interpolatedTokens[tokenIndex];
    if (currentToken.type === MlParserTokenType.ENCODED_ENTITY) {
      const [decoded, encoded] = currentToken.parts;
      consumedInOriginalTemplate += encoded.length;
      consumedInInput += decoded.length;
    } else {
      const lengthOfParts = currentToken.parts.reduce((sum, current) => sum + current.length, 0);
      consumedInInput += lengthOfParts;
      consumedInOriginalTemplate += lengthOfParts;
    }
    offsetMap.set(consumedInInput, consumedInOriginalTemplate);
    tokenIndex++;
  }
  return offsetMap;
}
