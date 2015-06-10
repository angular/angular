import {Injectable} from 'angular2/src/di/decorators';
import {
  isBlank,
  isPresent,
  BaseException,
  StringWrapper,
  RegExpWrapper
} from 'angular2/src/facade/lang';
import {ListWrapper, List} from 'angular2/src/facade/collection';
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
import {reflector, Reflector} from 'angular2/src/reflection/reflection';
import {
  AST,
  EmptyExpr,
  ImplicitReceiver,
  AccessMember,
  SafeAccessMember,
  LiteralPrimitive,
  Binary,
  PrefixNot,
  Conditional,
  If,
  Pipe,
  Assignment,
  Chain,
  KeyedAccess,
  LiteralArray,
  LiteralMap,
  Interpolation,
  MethodCall,
  SafeMethodCall,
  FunctionCall,
  TemplateBinding,
  ASTWithSource
} from './ast';


var _implicitReceiver = new ImplicitReceiver();
// TODO(tbosch): Cannot make this const/final right now because of the transpiler...
var INTERPOLATION_REGEXP = RegExpWrapper.create('\\{\\{(.*?)\\}\\}');

@Injectable()
export class Parser {
  _lexer: Lexer;
  _reflector: Reflector;
  constructor(lexer: Lexer, providedReflector: Reflector = null) {
    this._lexer = lexer;
    this._reflector = isPresent(providedReflector) ? providedReflector : reflector;
  }

  parseAction(input: string, location: any): ASTWithSource {
    var tokens = this._lexer.tokenize(input);
    var ast = new _ParseAST(input, location, tokens, this._reflector, true).parseChain();
    return new ASTWithSource(ast, input, location);
  }

  parseBinding(input: string, location: any): ASTWithSource {
    var tokens = this._lexer.tokenize(input);
    var ast = new _ParseAST(input, location, tokens, this._reflector, false).parseChain();
    return new ASTWithSource(ast, input, location);
  }

  addPipes(bindingAst: ASTWithSource, pipes: List<string>): ASTWithSource {
    if (ListWrapper.isEmpty(pipes)) return bindingAst;

    var res: AST = ListWrapper.reduce(
        pipes, (result, currentPipeName) => new Pipe(result, currentPipeName, [], false),
        bindingAst.ast);
    return new ASTWithSource(res, bindingAst.source, bindingAst.location);
  }

  parseTemplateBindings(input: string, location: any): List<TemplateBinding> {
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
      var part = parts[i];
      if (i % 2 === 0) {
        // fixed string
        ListWrapper.push(strings, part);
      } else {
        var tokens = this._lexer.tokenize(part);
        var ast = new _ParseAST(input, location, tokens, this._reflector, false).parseChain();
        ListWrapper.push(expressions, ast);
      }
    }
    return new ASTWithSource(new Interpolation(strings, expressions), input, location);
  }

  wrapLiteralPrimitive(input: string, location: any): ASTWithSource {
    return new ASTWithSource(new LiteralPrimitive(input), input, location);
  }
}

class _ParseAST {
  index: int;
  constructor(public input: string, public location: any, public tokens: List<any>,
              public reflector: Reflector, public parseAction: boolean) {
    this.index = 0;
  }

  peek(offset: int): Token {
    var i = this.index + offset;
    return i < this.tokens.length ? this.tokens[i] : EOF;
  }

  get next(): Token { return this.peek(0); }

  get inputIndex(): int {
    return (this.index < this.tokens.length) ? this.next.index : this.input.length;
  }

  advance() { this.index++; }

  optionalCharacter(code: int): boolean {
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

  expectCharacter(code: int) {
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
      this.error(`Unexpected token ${n}, expected identifier or keyword`)
    }
    this.advance();
    return n.toString();
  }

  expectIdentifierOrKeywordOrString(): string {
    var n = this.next;
    if (!n.isIdentifier() && !n.isKeyword() && !n.isString()) {
      this.error(`Unexpected token ${n}, expected identifier, keyword, or string`)
    }
    this.advance();
    return n.toString();
  }

  parseChain(): AST {
    var exprs = [];
    while (this.index < this.tokens.length) {
      var expr = this.parsePipe();
      ListWrapper.push(exprs, expr);

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

  parsePipe() {
    var result = this.parseExpression();
    if (this.optionalOperator("|")) {
      if (this.parseAction) {
        this.error("Cannot have a pipe in an action expression");
      }

      do {
        var name = this.expectIdentifierOrKeyword();
        var args = [];
        while (this.optionalCharacter($COLON)) {
          ListWrapper.push(args, this.parsePipe());
        }
        result = new Pipe(result, name, args, true);
      } while (this.optionalOperator("|"));
    }

    return result;
  }

  parseExpression() {
    var start = this.inputIndex;
    var result = this.parseConditional();

    while (this.next.isOperator('=')) {
      if (!result.isAssignable) {
        var end = this.inputIndex;
        var expression = this.input.substring(start, end);
        this.error(`Expression ${expression} is not assignable`);
      }

      if (!this.parseAction) {
        this.error("Binding expression cannot contain assignments");
      }

      this.expectOperator('=');
      result = new Assignment(result, this.parseConditional());
    }

    return result;
  }

  parseConditional() {
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

  parseLogicalOr() {
    // '||'
    var result = this.parseLogicalAnd();
    while (this.optionalOperator('||')) {
      result = new Binary('||', result, this.parseLogicalAnd());
    }
    return result;
  }

  parseLogicalAnd() {
    // '&&'
    var result = this.parseEquality();
    while (this.optionalOperator('&&')) {
      result = new Binary('&&', result, this.parseEquality());
    }
    return result;
  }

  parseEquality() {
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

  parseRelational() {
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

  parseAdditive() {
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

  parseMultiplicative() {
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

  parsePrefix() {
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
        result = new KeyedAccess(result, key);

      } else if (this.optionalCharacter($LPAREN)) {
        var args = this.parseCallArguments();
        this.expectCharacter($RPAREN);
        result = new FunctionCall(result, args);

      } else {
        return result;
      }
    }
  }

  parsePrimary() {
    if (this.optionalCharacter($LPAREN)) {
      let result = this.parsePipe();
      this.expectCharacter($RPAREN);
      return result

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
      return new If(condition, ifExp, elseExp)

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
  }

  parseExpressionList(terminator: int): List<any> {
    var result = [];
    if (!this.next.isCharacter(terminator)) {
      do {
        ListWrapper.push(result, this.parsePipe());
      } while (this.optionalCharacter($COMMA));
    }
    return result;
  }

  parseLiteralMap() {
    var keys = [];
    var values = [];
    this.expectCharacter($LBRACE);
    if (!this.optionalCharacter($RBRACE)) {
      do {
        var key = this.expectIdentifierOrKeywordOrString();
        ListWrapper.push(keys, key);
        this.expectCharacter($COLON);
        ListWrapper.push(values, this.parsePipe());
      } while (this.optionalCharacter($COMMA));
      this.expectCharacter($RBRACE);
    }
    return new LiteralMap(keys, values);
  }

  parseAccessMemberOrMethodCall(receiver, isSafe: boolean = false): AST {
    let id = this.expectIdentifierOrKeyword();

    if (this.optionalCharacter($LPAREN)) {
      let args = this.parseCallArguments();
      this.expectCharacter($RPAREN);
      let fn = this.reflector.method(id);
      return isSafe ? new SafeMethodCall(receiver, id, fn, args) :
                      new MethodCall(receiver, id, fn, args);

    } else {
      let getter = this.reflector.getter(id);
      let setter = this.reflector.setter(id);
      return isSafe ? new SafeAccessMember(receiver, id, getter, setter) :
                      new AccessMember(receiver, id, getter, setter);
    }
  }

  parseCallArguments() {
    if (this.next.isCharacter($RPAREN)) return [];
    var positionals = [];
    do {
      ListWrapper.push(positionals, this.parsePipe());
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
      ListWrapper.push(exprs, expr);

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
  expectTemplateBindingKey() {
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

  parseTemplateBindings() {
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
      ListWrapper.push(bindings, new TemplateBinding(key, keyIsVar, name, expression));
      if (!this.optionalCharacter($SEMICOLON)) {
        this.optionalCharacter($COMMA);
      }
    }
    return bindings;
  }

  error(message: string, index: int = null) {
    if (isBlank(index)) index = this.index;

    var location = (index < this.tokens.length) ? `at column ${this.tokens[index].index + 1} in` :
                                                  `at the end of the expression`;

    throw new BaseException(
        `Parser Error: ${message} ${location} [${this.input}] in ${this.location}`);
  }
}
