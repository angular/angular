import {FIELD, int, isBlank,  BaseException, StringWrapper} from 'facade/lang';
import {ListWrapper, List} from 'facade/collection';
import {Lexer, EOF, Token, $PERIOD, $COLON, $SEMICOLON, $LBRACKET, $RBRACKET,
  $COMMA, $LBRACE, $RBRACE, $LPAREN, $RPAREN} from './lexer';
import {ClosureMap} from './closure_map';
import {
  AST,
  ImplicitReceiver,
  AccessMember,
  LiteralPrimitive,
  Expression,
  Binary,
  PrefixNot,
  Conditional,
  Formatter,
  Assignment,
  Chain,
  KeyedAccess,
  LiteralArray,
  LiteralMap,
  MethodCall,
  FunctionCall,
  TemplateBindings,
  TemplateBinding,
  ASTWithSource
  } from './ast';

var _implicitReceiver = new ImplicitReceiver();

export class Parser {
  @FIELD('final _lexer:Lexer')
  @FIELD('final _closureMap:ClosureMap')
  constructor(lexer:Lexer, closureMap:ClosureMap){
    this._lexer = lexer;
    this._closureMap = closureMap;
  }

  parseAction(input:string):ASTWithSource {
    var tokens = this._lexer.tokenize(input);
    var ast = new _ParseAST(input, tokens, this._closureMap, true).parseChain();
    return new ASTWithSource(ast, input);
  }

  parseBinding(input:string):ASTWithSource {
    var tokens = this._lexer.tokenize(input);
    var ast = new _ParseAST(input, tokens, this._closureMap, false).parseChain();
    return new ASTWithSource(ast, input);
  }

  parseTemplateBindings(input:string):List<TemplateBinding> {
    var tokens = this._lexer.tokenize(input);
    return new _ParseAST(input, tokens, this._closureMap, false).parseTemplateBindings();
  }
}

class _ParseAST {
  @FIELD('final input:string')
  @FIELD('final tokens:List<Token>')
  @FIELD('final closureMap:ClosureMap')
  @FIELD('final parseAction:boolean')
  @FIELD('index:int')
  constructor(input:string, tokens:List, closureMap:ClosureMap, parseAction:boolean) {
    this.input = input;
    this.tokens = tokens;
    this.index = 0;
    this.closureMap = closureMap;
    this.parseAction = parseAction;
  }

  peek(offset:int):Token {
    var i = this.index + offset;
    return i < this.tokens.length ? this.tokens[i] : EOF;
  }

  get next():Token {
    return this.peek(0);
  }

  get inputIndex():int {
    return (this.index < this.tokens.length) ? this.next.index : this.input.length;
  }

  advance() {
    this.index ++;
  }

  optionalCharacter(code:int):boolean {
    if (this.next.isCharacter(code)) {
      this.advance();
      return true;
    } else {
      return false;
    }
  }

  expectCharacter(code:int) {
    if (this.optionalCharacter(code)) return;
    this.error(`Missing expected ${StringWrapper.fromCharCode(code)}`);
  }


  optionalOperator(op:string):boolean {
    if (this.next.isOperator(op)) {
      this.advance();
      return true;
    } else {
      return false;
    }
  }

  expectOperator(operator:string) {
    if (this.optionalOperator(operator)) return;
    this.error(`Missing expected operator ${operator}`);
  }

  expectIdentifierOrKeyword():string {
    var n = this.next;
    if (!n.isIdentifier() && !n.isKeyword()) {
      this.error(`Unexpected token ${n}, expected identifier or keyword`)
    }
    this.advance();
    return n.toString();
  }

  expectIdentifierOrKeywordOrString():string {
    var n = this.next;
    if (!n.isIdentifier() && !n.isKeyword() && !n.isString()) {
      this.error(`Unexpected token ${n}, expected identifier, keyword, or string`)
    }
    this.advance();
    return n.toString();
  }

  parseChain():AST {
    var exprs = [];
    while (this.index < this.tokens.length) {
      var expr = this.parseFormatter();
      ListWrapper.push(exprs, expr);

      if (this.optionalCharacter($SEMICOLON)) {
        if (! this.parseAction) {
          this.error("Binding expression cannot contain chained expression");
        }
        while (this.optionalCharacter($SEMICOLON)){} //read all semicolons
      } else if (this.index < this.tokens.length) {
        this.error(`Unexpected token '${this.next}'`);
      }
    }
    return exprs.length == 1 ? exprs[0] : new Chain(exprs);
  }

  parseFormatter() {
    var result = this.parseExpression();
    while (this.optionalOperator("|")) {
      if (this.parseAction) {
        this.error("Cannot have a formatter in an action expression");
      }
      var name = this.expectIdentifierOrKeyword();
      var args = ListWrapper.create();
      while (this.optionalCharacter($COLON)) {
        ListWrapper.push(args, this.parseExpression());
      }
      result = new Formatter(result, name, args);
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
      var yes = this.parseExpression();
      if (!this.optionalCharacter($COLON)) {
        var end = this.inputIndex;
        var expression = this.input.substring(start, end);
        this.error(`Conditional expression ${expression} requires all 3 expressions`);
      }
      var no = this.parseExpression();
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
    // '==','!='
    var result = this.parseRelational();
    while (true) {
      if (this.optionalOperator('==')) {
        result = new Binary('==', result, this.parseRelational());
      } else if (this.optionalOperator('!=')) {
        result = new Binary('!=', result, this.parseRelational());
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

  parseCallChain():AST {
    var result = this.parsePrimary();
    while (true) {
      if (this.optionalCharacter($PERIOD)) {
        result = this.parseAccessMemberOrMethodCall(result);

      } else if (this.optionalCharacter($LBRACKET)) {
        var key = this.parseExpression();
        this.expectCharacter($RBRACKET);
        result = new KeyedAccess(result, key);

      } else if (this.optionalCharacter($LPAREN)) {
        var args = this.parseCallArguments();
        this.expectCharacter($RPAREN);
        result = new FunctionCall(result, this.closureMap, args);

      } else {
        return result;
      }
    }
  }

  parsePrimary() {
    if (this.optionalCharacter($LPAREN)) {
      var result = this.parseFormatter();
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

    } else if (this.optionalCharacter($LBRACKET)) {
      var elements = this.parseExpressionList($RBRACKET);
      this.expectCharacter($RBRACKET);
      return new LiteralArray(elements);

    } else if (this.next.isCharacter($LBRACE)) {
      return this.parseLiteralMap();

    } else if (this.next.isIdentifier()) {
      return this.parseAccessMemberOrMethodCall(_implicitReceiver);

    } else if (this.next.isNumber()) {
      var value = this.next.toNumber();
      this.advance();
      return new LiteralPrimitive(value);

    } else if (this.next.isString()) {
      var value = this.next.toString();
      this.advance();
      return new LiteralPrimitive(value);

    } else if (this.index >= this.tokens.length) {
      this.error(`Unexpected end of expression: ${this.input}`);

    } else {
      this.error(`Unexpected token ${this.next}`);
    }
  }

  parseExpressionList(terminator:int):List {
    var result = [];
    if (!this.next.isCharacter(terminator)) {
      do {
        ListWrapper.push(result, this.parseExpression());
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
        ListWrapper.push(values, this.parseExpression());
      } while (this.optionalCharacter($COMMA));
      this.expectCharacter($RBRACE);
    }
    return new LiteralMap(keys, values);
  }

  parseAccessMemberOrMethodCall(receiver):AST {
    var id = this.expectIdentifierOrKeyword();

    if (this.optionalCharacter($LPAREN)) {
      var args = this.parseCallArguments();
      this.expectCharacter($RPAREN);
      var fn = this.closureMap.fn(id);
      return new MethodCall(receiver, fn, args);

    } else {
      var getter = this.closureMap.getter(id);
      var setter = this.closureMap.setter(id);
      return new AccessMember(receiver, id, getter, setter);
    }
  }

  parseCallArguments() {
    if (this.next.isCharacter($RPAREN)) return [];
    var positionals = [];
    do {
      ListWrapper.push(positionals, this.parseExpression());
    } while (this.optionalCharacter($COMMA))
    return positionals;
  }

  parseTemplateBindings() {
    var bindings = [];
    while (this.index < this.tokens.length) {
      var key = this.expectIdentifierOrKeywordOrString();
      this.optionalCharacter($COLON);
      var name = null;
      var expression = null;
      if (this.optionalOperator("#")) {
        name = this.expectIdentifierOrKeyword();
      } else {
        var start = this.inputIndex;
        var ast = this.parseExpression();
        var source = this.input.substring(start, this.inputIndex);
        expression = new ASTWithSource(ast, source);
      }
      ListWrapper.push(bindings, new TemplateBinding(key, name, expression));
      if (!this.optionalCharacter($SEMICOLON)) {
        this.optionalCharacter($COMMA);
      };
    }
    return bindings;
  }

  error(message:string, index:int = null) {
    if (isBlank(index)) index = this.index;

    var location = (index < this.tokens.length)
      ? `at column ${this.tokens[index].index + 1} in`
      : `at the end of the expression`;

    throw new BaseException(`Parser Error: ${message} ${location} [${this.input}]`);
  }
}
