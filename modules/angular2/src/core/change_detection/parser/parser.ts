import {Injectable} from 'angular2/src/core/di/decorators';
import {isBlank, isPresent, StringWrapper} from 'angular2/src/core/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';
import {ListWrapper} from 'angular2/src/core/facade/collection';
import {
  Lexer,
  EOF,
  Token,
  $PERIOD,
  $COLON,
  $SEMICOLON,
  $LBRACKET,
  $RBRACKET,
  $COMMA,
  $LBRACE,
  $RBRACE,
  $LPAREN,
  $RPAREN
} from './lexer';
import {reflector, Reflector} from 'angular2/src/core/reflection/reflection';
import {
  AST,
  EmptyExpr,
  ImplicitReceiver,
  PropertyRead,
  PropertyWrite,
  SafePropertyRead,
  LiteralPrimitive,
  Binary,
  PrefixNot,
  Conditional,
  If,
  BindingPipe,
  Chain,
  KeyedRead,
  KeyedWrite,
  LiteralArray,
  LiteralMap,
  Interpolation,
  MethodCall,
  SafeMethodCall,
  FunctionCall,
  TemplateBinding,
  ASTWithSource,
  AstVisitor
} from './ast';


var _implicitReceiver = new ImplicitReceiver();
// TODO(tbosch): Cannot make this const/final right now because of the transpiler...
var INTERPOLATION_REGEXP = /\{\{(.*?)\}\}/g;

class ParseException extends BaseException {
  constructor(message: string, input: string, errLocation: string, ctxLocation?: any) {
    super(`Parser Error: ${message} ${errLocation} [${input}] in ${ctxLocation}`);
  }
}

@Injectable()
export class Parser {
  /** @internal */
  _reflector: Reflector;

  constructor(/** @internal */
              public _lexer: Lexer, providedReflector: Reflector = null) {
    this._reflector = isPresent(providedReflector) ? providedReflector : reflector;
  }

  parseAction(input: string, location: any): ASTWithSource {
    this._checkNoInterpolation(input, location);
    var tokens = this._lexer.tokenize(input);
    var ast = new _ParseAST(input, location, tokens, this._reflector, true).parseChain();
    return new ASTWithSource(ast, input, location);
  }

  parseBinding(input: string, location: any): ASTWithSource {
    this._checkNoInterpolation(input, location);
    var tokens = this._lexer.tokenize(input);
    var ast = new _ParseAST(input, location, tokens, this._reflector, false).parseChain();
    return new ASTWithSource(ast, input, location);
  }

  parseSimpleBinding(input: string, location: string): ASTWithSource {
    this._checkNoInterpolation(input, location);
    var tokens = this._lexer.tokenize(input);
    var ast = new _ParseAST(input, location, tokens, this._reflector, false).parseSimpleBinding();
    return new ASTWithSource(ast, input, location);
  }

  parseTemplateBindings(input: string, location: any): TemplateBinding[] {
    var tokens = this._lexer.tokenize(input);
    return new _ParseAST(input, location, tokens, this._reflector, false).parseTemplateBindings();
  }

  parseInterpolation(input: string, location: any): ASTWithSource {
    var parts = StringWrapper.split(input, INTERPOLATION_REGEXP);
    if (parts.length <= 1) {
      return null;
    }
    var strings = [];
    var expressions = [];

    for (var i = 0; i < parts.length; i++) {
      var part: string = parts[i];
      if (i % 2 === 0) {
        // fixed string
        strings.push(part);
      } else if (part.trim().length > 0) {
        var tokens = this._lexer.tokenize(part);
        var ast = new _ParseAST(input, location, tokens, this._reflector, false).parseChain();
        expressions.push(ast);
      } else {
        throw new ParseException('Blank expressions are not allowed in interpolated strings', input,
                                 `at column ${this._findInterpolationErrorColumn(parts, i)} in`,
                                 location);
      }
    }
    return new ASTWithSource(new Interpolation(strings, expressions), input, location);
  }

  wrapLiteralPrimitive(input: string, location: any): ASTWithSource {
    return new ASTWithSource(new LiteralPrimitive(input), input, location);
  }

  private _checkNoInterpolation(input: string, location: any): void {
    var parts = StringWrapper.split(input, INTERPOLATION_REGEXP);
    if (parts.length > 1) {
      throw new ParseException('Got interpolation ({{}}) where expression was expected', input,
                               `at column ${this._findInterpolationErrorColumn(parts, 1)} in`,
                               location);
    }
  }

  private _findInterpolationErrorColumn(parts: string[], partInErrIdx: number): number {
    var errLocation = '';
    for (var j = 0; j < partInErrIdx; j++) {
      errLocation += j % 2 === 0 ? parts[j] : `{{${parts[j]}}}`;
    }

    return errLocation.length;
  }
}

export class _ParseAST {
  index: number = 0;
  constructor(public input: string, public location: any, public tokens: any[],
              public reflector: Reflector, public parseAction: boolean) {}

  peek(offset: number): Token {
    var i = this.index + offset;
    return i < this.tokens.length ? this.tokens[i] : EOF;
  }

  get next(): Token { return this.peek(0); }

  get inputIndex(): number {
    return (this.index < this.tokens.length) ? this.next.index : this.input.length;
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

  optionalKeywordVar(): boolean {
    if (this.peekKeywordVar()) {
      this.advance();
      return true;
    } else {
      return false;
    }
  }

  peekKeywordVar(): boolean { return this.next.isKeywordVar() || this.next.isOperator('#'); }

  expectCharacter(code: number) {
    if (this.optionalCharacter(code)) return;
    this.error(`Missing expected ${StringWrapper.fromCharCode(code)}`);
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
    var n = this.next;
    if (!n.isIdentifier() && !n.isKeyword()) {
      this.error(`Unexpected token ${n}, expected identifier or keyword`);
    }
    this.advance();
    return n.toString();
  }

  expectIdentifierOrKeywordOrString(): string {
    var n = this.next;
    if (!n.isIdentifier() && !n.isKeyword() && !n.isString()) {
      this.error(`Unexpected token ${n}, expected identifier, keyword, or string`);
    }
    this.advance();
    return n.toString();
  }

  parseChain(): AST {
    var exprs = [];
    while (this.index < this.tokens.length) {
      var expr = this.parsePipe();
      exprs.push(expr);

      if (this.optionalCharacter($SEMICOLON)) {
        if (!this.parseAction) {
          this.error("Binding expression cannot contain chained expression");
        }
        while (this.optionalCharacter($SEMICOLON)) {
        }  // read all semicolons
      } else if (this.index < this.tokens.length) {
        this.error(`Unexpected token '${this.next}'`);
      }
    }
    if (exprs.length == 0) return new EmptyExpr();
    if (exprs.length == 1) return exprs[0];
    return new Chain(exprs);
  }

  parseSimpleBinding(): AST {
    var ast = this.parseChain();
    if (!SimpleExpressionChecker.check(ast)) {
      this.error(`Simple binding expression can only contain field access and constants'`);
    }
    return ast;
  }

  parsePipe(): AST {
    var result = this.parseExpression();
    if (this.optionalOperator("|")) {
      if (this.parseAction) {
        this.error("Cannot have a pipe in an action expression");
      }

      do {
        var name = this.expectIdentifierOrKeyword();
        var args = [];
        while (this.optionalCharacter($COLON)) {
          args.push(this.parsePipe());
        }
        result = new BindingPipe(result, name, args);
      } while (this.optionalOperator("|"));
    }

    return result;
  }

  parseExpression(): AST { return this.parseConditional(); }

  parseConditional(): AST {
    var start = this.inputIndex;
    var result = this.parseLogicalOr();

    if (this.optionalOperator('?')) {
      var yes = this.parsePipe();
      if (!this.optionalCharacter($COLON)) {
        var end = this.inputIndex;
        var expression = this.input.substring(start, end);
        this.error(`Conditional expression ${expression} requires all 3 expressions`);
      }
      var no = this.parsePipe();
      return new Conditional(result, yes, no);
    } else {
      return result;
    }
  }

  parseLogicalOr(): AST {
    // '||'
    var result = this.parseLogicalAnd();
    while (this.optionalOperator('||')) {
      result = new Binary('||', result, this.parseLogicalAnd());
    }
    return result;
  }

  parseLogicalAnd(): AST {
    // '&&'
    var result = this.parseEquality();
    while (this.optionalOperator('&&')) {
      result = new Binary('&&', result, this.parseEquality());
    }
    return result;
  }

  parseEquality(): AST {
    // '==','!=','===','!=='
    var result = this.parseRelational();
    while (true) {
      if (this.optionalOperator('==')) {
        result = new Binary('==', result, this.parseRelational());
      } else if (this.optionalOperator('===')) {
        result = new Binary('===', result, this.parseRelational());
      } else if (this.optionalOperator('!=')) {
        result = new Binary('!=', result, this.parseRelational());
      } else if (this.optionalOperator('!==')) {
        result = new Binary('!==', result, this.parseRelational());
      } else {
        return result;
      }
    }
  }

  parseRelational(): AST {
    // '<', '>', '<=', '>='
    var result = this.parseAdditive();
    while (true) {
      if (this.optionalOperator('<')) {
        result = new Binary('<', result, this.parseAdditive());
      } else if (this.optionalOperator('>')) {
        result = new Binary('>', result, this.parseAdditive());
      } else if (this.optionalOperator('<=')) {
        result = new Binary('<=', result, this.parseAdditive());
      } else if (this.optionalOperator('>=')) {
        result = new Binary('>=', result, this.parseAdditive());
      } else {
        return result;
      }
    }
  }

  parseAdditive(): AST {
    // '+', '-'
    var result = this.parseMultiplicative();
    while (true) {
      if (this.optionalOperator('+')) {
        result = new Binary('+', result, this.parseMultiplicative());
      } else if (this.optionalOperator('-')) {
        result = new Binary('-', result, this.parseMultiplicative());
      } else {
        return result;
      }
    }
  }

  parseMultiplicative(): AST {
    // '*', '%', '/'
    var result = this.parsePrefix();
    while (true) {
      if (this.optionalOperator('*')) {
        result = new Binary('*', result, this.parsePrefix());
      } else if (this.optionalOperator('%')) {
        result = new Binary('%', result, this.parsePrefix());
      } else if (this.optionalOperator('/')) {
        result = new Binary('/', result, this.parsePrefix());
      } else {
        return result;
      }
    }
  }

  parsePrefix(): AST {
    if (this.optionalOperator('+')) {
      return this.parsePrefix();
    } else if (this.optionalOperator('-')) {
      return new Binary('-', new LiteralPrimitive(0), this.parsePrefix());
    } else if (this.optionalOperator('!')) {
      return new PrefixNot(this.parsePrefix());
    } else {
      return this.parseCallChain();
    }
  }

  parseCallChain(): AST {
    var result = this.parsePrimary();
    while (true) {
      if (this.optionalCharacter($PERIOD)) {
        result = this.parseAccessMemberOrMethodCall(result, false);

      } else if (this.optionalOperator('?.')) {
        result = this.parseAccessMemberOrMethodCall(result, true);

      } else if (this.optionalCharacter($LBRACKET)) {
        var key = this.parsePipe();
        this.expectCharacter($RBRACKET);
        if (this.optionalOperator("=")) {
          var value = this.parseConditional();
          result = new KeyedWrite(result, key, value);
        } else {
          result = new KeyedRead(result, key);
        }

      } else if (this.optionalCharacter($LPAREN)) {
        var args = this.parseCallArguments();
        this.expectCharacter($RPAREN);
        result = new FunctionCall(result, args);

      } else {
        return result;
      }
    }
  }

  parsePrimary(): AST {
    if (this.optionalCharacter($LPAREN)) {
      let result = this.parsePipe();
      this.expectCharacter($RPAREN);
      return result;
    } else if (this.next.isKeywordNull() || this.next.isKeywordUndefined()) {
      this.advance();
      return new LiteralPrimitive(null);

    } else if (this.next.isKeywordTrue()) {
      this.advance();
      return new LiteralPrimitive(true);

    } else if (this.next.isKeywordFalse()) {
      this.advance();
      return new LiteralPrimitive(false);

    } else if (this.parseAction && this.next.isKeywordIf()) {
      this.advance();
      this.expectCharacter($LPAREN);
      let condition = this.parseExpression();
      this.expectCharacter($RPAREN);
      let ifExp = this.parseExpressionOrBlock();
      let elseExp;
      if (this.next.isKeywordElse()) {
        this.advance();
        elseExp = this.parseExpressionOrBlock();
      }
      return new If(condition, ifExp, elseExp);

    } else if (this.optionalCharacter($LBRACKET)) {
      var elements = this.parseExpressionList($RBRACKET);
      this.expectCharacter($RBRACKET);
      return new LiteralArray(elements);

    } else if (this.next.isCharacter($LBRACE)) {
      return this.parseLiteralMap();

    } else if (this.next.isIdentifier()) {
      return this.parseAccessMemberOrMethodCall(_implicitReceiver, false);

    } else if (this.next.isNumber()) {
      var value = this.next.toNumber();
      this.advance();
      return new LiteralPrimitive(value);

    } else if (this.next.isString()) {
      var literalValue = this.next.toString();
      this.advance();
      return new LiteralPrimitive(literalValue);

    } else if (this.index >= this.tokens.length) {
      this.error(`Unexpected end of expression: ${this.input}`);

    } else {
      this.error(`Unexpected token ${this.next}`);
    }
    // error() throws, so we don't reach here.
    throw new BaseException("Fell through all cases in parsePrimary");
  }

  parseExpressionList(terminator: number): any[] {
    var result = [];
    if (!this.next.isCharacter(terminator)) {
      do {
        result.push(this.parsePipe());
      } while (this.optionalCharacter($COMMA));
    }
    return result;
  }

  parseLiteralMap(): LiteralMap {
    var keys = [];
    var values = [];
    this.expectCharacter($LBRACE);
    if (!this.optionalCharacter($RBRACE)) {
      do {
        var key = this.expectIdentifierOrKeywordOrString();
        keys.push(key);
        this.expectCharacter($COLON);
        values.push(this.parsePipe());
      } while (this.optionalCharacter($COMMA));
      this.expectCharacter($RBRACE);
    }
    return new LiteralMap(keys, values);
  }

  parseAccessMemberOrMethodCall(receiver: AST, isSafe: boolean = false): AST {
    let id = this.expectIdentifierOrKeyword();

    if (this.optionalCharacter($LPAREN)) {
      let args = this.parseCallArguments();
      this.expectCharacter($RPAREN);
      let fn = this.reflector.method(id);
      return isSafe ? new SafeMethodCall(receiver, id, fn, args) :
                      new MethodCall(receiver, id, fn, args);

    } else {
      if (isSafe) {
        if (this.optionalOperator("=")) {
          this.error("The '?.' operator cannot be used in the assignment");
        } else {
          return new SafePropertyRead(receiver, id, this.reflector.getter(id));
        }
      } else {
        if (this.optionalOperator("=")) {
          if (!this.parseAction) {
            this.error("Bindings cannot contain assignments");
          }

          let value = this.parseConditional();
          return new PropertyWrite(receiver, id, this.reflector.setter(id), value);
        } else {
          return new PropertyRead(receiver, id, this.reflector.getter(id));
        }
      }
    }

    return null;
  }

  parseCallArguments(): BindingPipe[] {
    if (this.next.isCharacter($RPAREN)) return [];
    var positionals = [];
    do {
      positionals.push(this.parsePipe());
    } while (this.optionalCharacter($COMMA));
    return positionals;
  }

  parseExpressionOrBlock(): AST {
    if (this.optionalCharacter($LBRACE)) {
      let block = this.parseBlockContent();
      this.expectCharacter($RBRACE);
      return block;
    }

    return this.parseExpression();
  }

  parseBlockContent(): AST {
    if (!this.parseAction) {
      this.error("Binding expression cannot contain chained expression");
    }
    var exprs = [];
    while (this.index < this.tokens.length && !this.next.isCharacter($RBRACE)) {
      var expr = this.parseExpression();
      exprs.push(expr);

      if (this.optionalCharacter($SEMICOLON)) {
        while (this.optionalCharacter($SEMICOLON)) {
        }  // read all semicolons
      }
    }
    if (exprs.length == 0) return new EmptyExpr();
    if (exprs.length == 1) return exprs[0];

    return new Chain(exprs);
  }


  /**
   * An identifier, a keyword, a string with an optional `-` inbetween.
   */
  expectTemplateBindingKey(): string {
    var result = '';
    var operatorFound = false;
    do {
      result += this.expectIdentifierOrKeywordOrString();
      operatorFound = this.optionalOperator('-');
      if (operatorFound) {
        result += '-';
      }
    } while (operatorFound);

    return result.toString();
  }

  parseTemplateBindings(): any[] {
    var bindings = [];
    var prefix = null;
    while (this.index < this.tokens.length) {
      var keyIsVar: boolean = this.optionalKeywordVar();
      var key = this.expectTemplateBindingKey();
      if (!keyIsVar) {
        if (prefix == null) {
          prefix = key;
        } else {
          key = prefix + '-' + key;
        }
      }
      this.optionalCharacter($COLON);
      var name = null;
      var expression = null;
      if (keyIsVar) {
        if (this.optionalOperator("=")) {
          name = this.expectTemplateBindingKey();
        } else {
          name = '\$implicit';
        }
      } else if (this.next !== EOF && !this.peekKeywordVar()) {
        var start = this.inputIndex;
        var ast = this.parsePipe();
        var source = this.input.substring(start, this.inputIndex);
        expression = new ASTWithSource(ast, source, this.location);
      }
      bindings.push(new TemplateBinding(key, keyIsVar, name, expression));
      if (!this.optionalCharacter($SEMICOLON)) {
        this.optionalCharacter($COMMA);
      }
    }
    return bindings;
  }

  error(message: string, index: number = null) {
    if (isBlank(index)) index = this.index;

    var location = (index < this.tokens.length) ? `at column ${this.tokens[index].index + 1} in` :
                                                  `at the end of the expression`;

    throw new ParseException(message, this.input, location, this.location);
  }
}

class SimpleExpressionChecker implements AstVisitor {
  static check(ast: AST): boolean {
    var s = new SimpleExpressionChecker();
    ast.visit(s);
    return s.simple;
  }

  simple = true;

  visitImplicitReceiver(ast: ImplicitReceiver) {}

  visitInterpolation(ast: Interpolation) { this.simple = false; }

  visitLiteralPrimitive(ast: LiteralPrimitive) {}

  visitPropertyRead(ast: PropertyRead) {}

  visitPropertyWrite(ast: PropertyWrite) { this.simple = false; }

  visitSafePropertyRead(ast: SafePropertyRead) { this.simple = false; }

  visitMethodCall(ast: MethodCall) { this.simple = false; }

  visitSafeMethodCall(ast: SafeMethodCall) { this.simple = false; }

  visitFunctionCall(ast: FunctionCall) { this.simple = false; }

  visitLiteralArray(ast: LiteralArray) { this.visitAll(ast.expressions); }

  visitLiteralMap(ast: LiteralMap) { this.visitAll(ast.values); }

  visitBinary(ast: Binary) { this.simple = false; }

  visitPrefixNot(ast: PrefixNot) { this.simple = false; }

  visitConditional(ast: Conditional) { this.simple = false; }

  visitPipe(ast: BindingPipe) { this.simple = false; }

  visitKeyedRead(ast: KeyedRead) { this.simple = false; }

  visitKeyedWrite(ast: KeyedWrite) { this.simple = false; }

  visitAll(asts: any[]): any[] {
    var res = ListWrapper.createFixedSize(asts.length);
    for (var i = 0; i < asts.length; ++i) {
      res[i] = asts[i].visit(this);
    }
    return res;
  }

  visitChain(ast: Chain) { this.simple = false; }

  visitIf(ast: If) { this.simple = false; }
}
