import {FIELD, int, isBlank} from 'facade/lang';
import {ListWrapper, List} from 'facade/collection';
import {Lexer, EOF, Token, $PERIOD, $COLON, $SEMICOLON} from './lexer';
import {ClosureMap} from './closure_map';
import {
  AST,
  ImplicitReceiver,
  FieldRead,
  LiteralPrimitive,
  Expression,
  Binary,
  PrefixNot,
  Conditional,
  Formatter
  } from './ast';

var _implicitReceiver = new ImplicitReceiver();

export class Parser {
  @FIELD('final _lexer:Lexer')
  @FIELD('final _closureMap:ClosureMap')
  constructor(lexer:Lexer, closureMap:ClosureMap){
    this._lexer = lexer;
    this._closureMap = closureMap;
  }

  parse(input:string):AST {
    var tokens = this._lexer.tokenize(input);
    return new _ParseAST(input, tokens, this._closureMap).parseChain();
  }
}

class _ParseAST {
  @FIELD('final input:String')
  @FIELD('final tokens:List<Token>')
  @FIELD('final closureMap:ClosureMap')
  @FIELD('index:int')
  constructor(input:string, tokens:List, closureMap:ClosureMap) {
    this.input = input;
    this.tokens = tokens;
    this.index = 0;
    this.closureMap = closureMap;
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

  optionalOperator(op:string):boolean {
    if (this.next.isOperator(op)) {
      this.advance();
      return true;
    } else {
      return false;
    }
  }

  parseChain():AST {
    var exprs = [];
    var isChain = false;
    while (this.index < this.tokens.length) {
      var expr = this.parseFormatter();
      ListWrapper.push(exprs, expr);

      while (this.optionalCharacter($SEMICOLON)) {
        isChain = true;
      }

      if (isChain && expr instanceof Formatter) {
        this.error('Cannot have a formatter in a chain');
      }
    }
    return ListWrapper.first(exprs);
  }

  parseFormatter() {
    var result = this.parseExpression();
    while (this.optionalOperator("|")) {
      var name = this.parseIdentifier();
      var args = ListWrapper.create();
      while (this.optionalCharacter($COLON)) {
        ListWrapper.push(args, this.parseExpression());
      }
      result = new Formatter(result, name, args);
    }
    return result;
  }

  parseExpression() {
    return this.parseConditional();
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
    // '*', '%', '/', '~/'
    var result = this.parsePrefix();
    while (true) {
      if (this.optionalOperator('*')) {
        result = new Binary('*', result, this.parsePrefix());
      } else if (this.optionalOperator('%')) {
        result = new Binary('%', result, this.parsePrefix());
      } else if (this.optionalOperator('/')) {
        result = new Binary('/', result, this.parsePrefix());
      // TODO(rado): This exists only in Dart, figure out whether to support it.
      // } else if (this.optionalOperator('~/')) {
      //   result = new BinaryTruncatingDivide(result, this.parsePrefix());
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
      return this.parseAccessOrCallMember();
    }
  }

  parseAccessOrCallMember() {
    var result = this.parsePrimary();
    // TODO: add missing cases.
    return result;
  }

  parsePrimary() {
    if (this.next.isKeywordNull() || this.next.isKeywordUndefined()) {
      this.advance();
      return new LiteralPrimitive(null);
    } else if (this.next.isKeywordTrue()) {
      this.advance();
      return new LiteralPrimitive(true);
    } else if (this.next.isKeywordFalse()) {
      this.advance();
      return new LiteralPrimitive(false);
    } else if (this.next.isIdentifier()) {
      return this.parseAccess();
    } else if (this.next.isNumber()) {
      var value = this.next.toNumber();
      this.advance();
      return new LiteralPrimitive(value);
    } else if (this.next.isString()) {
      var value = this.next.toString();
      this.advance();
      return new LiteralPrimitive(value);
    } else if (this.index >= this.tokens.length) {
      throw `Unexpected end of expression: ${this.input}`;
    } else {
      throw `Unexpected token ${this.next}`;
    }
  }

  parseAccess():AST {
    var result = this.parseFieldRead(_implicitReceiver);
    while(this.optionalCharacter($PERIOD)) {
      result = this.parseFieldRead(result);
    }
    return result;
  }

  parseFieldRead(receiver):AST {
    var id = this.parseIdentifier();
    return new FieldRead(receiver, id, this.closureMap.getter(id));
  }

  parseIdentifier():string {
    var n = this.next;
    if (!n.isIdentifier() && !n.isKeyword()) {
      this.error(`Unexpected token ${n}, expected identifier or keyword`)
    }
    this.advance();
    return n.toString();
  }

  error(message:string, index:int = null) {
    if (isBlank(index)) index = this.index;

    var location = (index < this.tokens.length)
      ? `at column ${this.tokens[index].index + 1} in`
      : `at the end of the expression`;

    throw new ParserError(`Parser Error: ${message} ${location} [${this.input}]`);
  }
}

class ParserError extends Error {
  constructor(message) {
    this.message = message;
  }

  toString() {
    return this.message;
  }
}