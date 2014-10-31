import {FIELD, toBool, autoConvertAdd} from "facade/lang";

export class AST {
  eval(context, formatters) {
  }

  visit(visitor) {
  }
}

export class ImplicitReceiver extends AST {
  eval(context, formatters) {
    return context;
  }

  visit(visitor) {
    visitor.visitImplicitReceiver(this);
  }
}

export class Expression extends AST {
  constructor() {
    this.isAssignable = false;
    this.isChain = false;
  }
}

export class FieldRead extends Expression {
  constructor(receiver:AST, name:string, getter:Function) {
    this.receiver = receiver;
    this.name = name;
    this.getter = getter;
  }

  eval(context, formatters) {
    return this.getter(this.receiver.eval(context, formatters));
  }

  visit(visitor) {
    visitor.visitFieldRead(this);
  }
}

export class LiteralPrimitive extends Expression {
  @FIELD('final value')
  constructor(value) {
    this.value = value;
  }
  eval(context, formatters) {
    return this.value;
  }
  visit(visitor) {
    visitor.visitLiteralPrimitive(this);
  }
}

export class Binary extends Expression {
  @FIELD('final operation:string')
  @FIELD('final left:Expression')
  @FIELD('final right:Expression')
  constructor(operation:string, left:Expression, right:Expression) {
    this.operation = operation;
    this.left = left;
    this.right = right;
  }

  visit(visitor) {
    visitor.visitBinary(this);
  }

  eval(context, formatters) {
    var left = this.left.eval(context, formatters);
    switch (this.operation) {
      case '&&': return toBool(left) && toBool(this.right.eval(context, formatters));
      case '||': return toBool(left) || toBool(this.right.eval(context, formatters));
    }
    var right = this.right.eval(context, formatters);

    // Null check for the operations.
    if (left == null || right == null) {
      switch (this.operation) {
        case '+':
          if (left != null) return left;
          if (right != null) return right;
          return 0;
        case '-':
          if (left != null) return left;
          if (right != null) return 0 - right;
          return 0;
      }
      return null;
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

export class PrefixNot extends Expression {
  @FIELD('final operation:string')
  @FIELD('final expression:Expression')
  constructor(expression:Expression) {
    this.expression = expression;
  }
  visit(visitor) { visitor.visitPrefixNot(this); }
  eval(context, formatters) {
    return !toBool(this.expression.eval(context, formatters));
  }
}

//INTERFACE
export class AstVisitor {
  visitImplicitReceiver(ast:ImplicitReceiver) {}
  visitFieldRead(ast:FieldRead) {}
  visitBinary(ast:Binary) {}
  visitPrefixNot(ast:PrefixNot) {}
  visitLiteralPrimitive(ast:LiteralPrimitive) {}
}
