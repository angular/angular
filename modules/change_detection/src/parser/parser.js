import {FIELD, int} from 'facade/lang';
import {ListWrapper, List} from 'facade/collection';
import {Lexer, EOF, Token, $PERIOD} from './lexer';
import {ClosureMap} from './closure_map';
import {AST, ImplicitReceiver, FieldRead} from './ast';

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
    return new _ParseAST(tokens, this._closureMap).parseChain();
  }
}

class _ParseAST {
  @FIELD('final tokens:List<Token>')
  @FIELD('final closureMap:ClosureMap')
  @FIELD('index:int')
  constructor(tokens:List, closureMap:ClosureMap) {
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

  parseChain():AST {
    var exprs = [];
    while (this.index < this.tokens.length) {
      ListWrapper.push(exprs, this.parseAccess());
    }
    return ListWrapper.first(exprs);
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
    this.advance();
    return n.toString();
  }
}