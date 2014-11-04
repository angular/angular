import {FIELD, toBool, autoConvertAdd, isBlank, FunctionWrapper, BaseException} from "facade/lang";
import {List, ListWrapper} from "facade/collection";

export class AST {
  eval(context) {
    throw new BaseException("Not supported");
  }

  visit(visitor) {
  }
}

export class ImplicitReceiver extends AST {
  eval(context) {
    return context;
  }

  visit(visitor) {
    visitor.visitImplicitReceiver(this);
  }
}

export class Conditional extends AST {
  constructor(condition:AST, trueExp:AST, falseExp:AST){
    this.condition = condition;
    this.trueExp = trueExp;
    this.falseExp = falseExp;
  }

  eval(context) {
    if(this.condition.eval(context)) {
      return this.trueExp.eval(context);
    } else {
      return this.falseExp.eval(context);
    }
  }
}

export class FieldRead extends AST {
  constructor(receiver:AST, name:string, getter:Function) {
    this.receiver = receiver;
    this.name = name;
    this.getter = getter;
  }

  eval(context) {
    return this.getter(this.receiver.eval(context));
  }

  visit(visitor) {
    visitor.visitFieldRead(this);
  }
}

export class Formatter extends AST {
  constructor(exp:AST, name:string, args:List) {
    this.exp = exp;
    this.name = name;
    this.args = args;
    this.allArgs = ListWrapper.concat([exp], args);
  }

  visit(visitor) {
    visitor.visitFormatter(this);
  }
}

export class LiteralPrimitive extends AST {
  @FIELD('final value')
  constructor(value) {
    this.value = value;
  }
  eval(context) {
    return this.value;
  }
  visit(visitor) {
    visitor.visitLiteralPrimitive(this);
  }
}

export class Binary extends AST {
  @FIELD('final operation:string')
  @FIELD('final left:AST')
  @FIELD('final right:AST')
  constructor(operation:string, left:AST, right:AST) {
    this.operation = operation;
    this.left = left;
    this.right = right;
  }

  visit(visitor) {
    visitor.visitBinary(this);
  }

  eval(context) {
    var left = this.left.eval(context);
    switch (this.operation) {
      case '&&': return toBool(left) && toBool(this.right.eval(context));
      case '||': return toBool(left) || toBool(this.right.eval(context));
    }
    var right = this.right.eval(context);

    // Null check for the operations.
    if (left == null || right == null) {
      throw new BaseException("One of the operands is null");
    }

    switch (this.operation) {
      case '+'  : return autoConvertAdd(left, right);
      case '-'  : return left - right;
      case '*'  : return left * right;
      case '/'  : return left / right;
      // This exists only in Dart, TODO(rado) figure out whether to support it.
      // case '~/' : return left ~/ right;
      case '%'  : return left % right;
      case '==' : return left == right;
      case '!=' : return left != right;
      case '<'  : return left < right;
      case '>'  : return left > right;
      case '<=' : return left <= right;
      case '>=' : return left >= right;
      case '^'  : return left ^ right;
      case '&'  : return left & right;
    }
    throw 'Internal error [$operation] not handled';
  }
}

export class PrefixNot extends AST {
  @FIELD('final operation:string')
  @FIELD('final expression:AST')
  constructor(expression:AST) {
    this.expression = expression;
  }
  visit(visitor) { visitor.visitPrefixNot(this); }
  eval(context) {
    return !toBool(this.expression.eval(context));
  }
}

//INTERFACE
export class AstVisitor {
  visitImplicitReceiver(ast:ImplicitReceiver) {}
  visitFieldRead(ast:FieldRead) {}
  visitBinary(ast:Binary) {}
  visitPrefixNot(ast:PrefixNot) {}
  visitLiteralPrimitive(ast:LiteralPrimitive) {}
  visitFormatter(ast:Formatter) {}
}

var _evalListCache = [[],[0],[0,0],[0,0,0],[0,0,0,0],[0,0,0,0,0]];
function evalList(context, exps:List){
  var length = exps.length;
  var result = _evalListCache[length];
  for (var i = 0; i < length; i++) {
    result[i] = exps[i].eval(context);
  }
  return result;
}