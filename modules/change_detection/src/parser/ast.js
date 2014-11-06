import {FIELD, autoConvertAdd, isBlank, isPresent, FunctionWrapper, BaseException} from "facade/lang";
import {List, Map, ListWrapper, MapWrapper} from "facade/collection";
import {ClosureMap} from "./closure_map";

export class AST {
  eval(context) {
    throw new BaseException("Not supported");
  }

  get isAssignable() {
    return false;
  }

  assign(context, value) {
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

/**
 * Multiple expressions separated by a semicolon.
 */
export class Chain extends AST {
  @FIELD('final expressions:List')
  constructor(expressions:List) {
    this.expressions = expressions;
  }

  eval(context) {
    var result;
    for (var i = 0; i < this.expressions.length; i++) {
      var last = this.expressions[i].eval(context);
      if (isPresent(last)) result = last;
    }
    return result;
  }

  visit(visitor) {
    visitor.visitChain(this);
  }
}

export class Conditional extends AST {
  @FIELD('final condition:AST')
  @FIELD('final trueExp:AST')
  @FIELD('final falseExp:AST')
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

  visit(visitor) {
    visitor.visitConditional(this);
  }
}

export class AccessMember extends AST {
  @FIELD('final receiver:AST')
  @FIELD('final name:string')
  @FIELD('final getter:Function')
  @FIELD('final setter:Function')
  constructor(receiver:AST, name:string, getter:Function, setter:Function) {
    this.receiver = receiver;
    this.name = name;
    this.getter = getter;
    this.setter = setter;
  }

  eval(context) {
    return this.getter(this.receiver.eval(context));
  }

  get isAssignable() {
    return true;
  }

  assign(context, value) {
    return this.setter(this.receiver.eval(context), value);
  }

  visit(visitor) {
    visitor.visitAccessMember(this);
  }
}

export class KeyedAccess extends AST {
  @FIELD('final obj:AST')
  @FIELD('final key:AST')
  constructor(obj:AST, key:AST) {
    this.obj = obj;
    this.key = key;
  }
  
  eval(context) {
    var obj = this.obj.eval(context);
    var key = this.key.eval(context);

    if (obj instanceof Map) {
      return MapWrapper.get(obj, key);
    } else if (obj instanceof List) {
      return ListWrapper.get(obj, key);
    } else {
      return obj[key];
    }
  }

  get isAssignable() {
    return true;
  }

  assign(context, value) {
    var obj = this.obj.eval(context);
    var key = this.key.eval(context);

    if (obj instanceof Map) {
      MapWrapper.set(obj, key, value);
    } else if (obj instanceof List) {
      ListWrapper.set(obj, key, value);
    } else {
      obj[key] = value;
    }
    return value;
  }

  visit(visitor) {
    visitor.visitKeyedAccess(this);
  }
}

export class Formatter extends AST {
  @FIELD('final exp:AST')
  @FIELD('final name:string')
  @FIELD('final args:List<AST>')
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

export class LiteralArray extends AST {
  @FIELD('final expressions:List')
  constructor(expressions:List) {
    this.expressions = expressions;
  }
  
  eval(context) {
    return ListWrapper.map(this.expressions, (e) => e.eval(context));
  }
  
  visit(visitor) {
    visitor.visitLiteralArray(this);
  }
}

export class LiteralMap extends AST {
  @FIELD('final keys:List')
  @FIELD('final values:List')
  constructor(keys:List, values:List) {
    this.keys = keys;
    this.values = values;
  }

  eval(context) {
    var res = MapWrapper.create();
    for(var i = 0; i < this.keys.length; ++i) {
      MapWrapper.set(res, this.keys[i], this.values[i].eval(context));
    }
    return res;
  }

  visit(visitor) {
    visitor.visitLiteralMap(this);
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

  eval(context) {
    var left = this.left.eval(context);
    switch (this.operation) {
      case '&&': return left && this.right.eval(context);
      case '||': return left || this.right.eval(context);
    }
    var right = this.right.eval(context);

    // Null check for the operations.
    if (isBlank(left)|| isBlank(right)) {
      throw new BaseException("One of the operands is not defined");
    }

    switch (this.operation) {
      case '+'  : return autoConvertAdd(left, right);
      case '-'  : return left - right;
      case '*'  : return left * right;
      case '/'  : return left / right;
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

  visit(visitor) {
    visitor.visitBinary(this);
  }
}

export class PrefixNot extends AST {
  @FIELD('final operation:string')
  @FIELD('final expression:AST')
  constructor(expression:AST) {
    this.expression = expression;
  }

  eval(context) {
    return !this.expression.eval(context);
  }

  visit(visitor) { 
    visitor.visitPrefixNot(this); 
  }
}

export class Assignment extends AST {
  @FIELD('final target:AST')
  @FIELD('final value:AST')
  constructor(target:AST, value:AST) {
    this.target = target;
    this.value = value;
  }

  eval(context) {
    return this.target.assign(context, this.value.eval(context));
  }
  
  visit(visitor) {
    visitor.visitAssignment(this); 
  }
}

export class MethodCall extends AST {
  @FIELD('final receiver:AST')
  @FIELD('final fn:Function')
  @FIELD('final args:List')
  constructor(receiver:AST, fn:Function, args:List) {
    this.receiver = receiver;
    this.fn = fn;
    this.args = args;
  }

  eval(context) {
    var obj = this.receiver.eval(context);
    return this.fn(obj, evalList(context, this.args));
  }

  visit(visitor) {
    visitor.visitMethodCall(this);
  }
}

export class FunctionCall extends AST {
  @FIELD('final receiver:AST')
  @FIELD('final closureMap:ClosureMap')
  @FIELD('final args:List')
  constructor(target:AST, closureMap:ClosureMap, args:List) {
    this.target = target;
    this.closureMap = closureMap;
    this.args = args;
  }

  eval(context) {
    var obj = this.target.eval(context);
    if (! (obj instanceof Function)) {
      throw new BaseException(`${obj} is not a function`);
    }
    return FunctionWrapper.apply(obj, evalList(context, this.args));
  }

  visit(visitor) {
    visitor.visitFunctionCall(this);
  }
}

//INTERFACE
export class AstVisitor {
  visitChain(ast:Chain){}
  visitImplicitReceiver(ast:ImplicitReceiver) {}
  visitConditional(ast:Conditional) {}
  visitAccessMember(ast:AccessMember) {}
  visitKeyedAccess(ast:KeyedAccess) {}
  visitBinary(ast:Binary) {}
  visitPrefixNot(ast:PrefixNot) {}
  visitLiteralPrimitive(ast:LiteralPrimitive) {}
  visitFormatter(ast:Formatter) {}
  visitAssignment(ast:Assignment) {}
  visitLiteralArray(ast:LiteralArray) {}
  visitLiteralMap(ast:LiteralMap) {}
  visitMethodCall(ast:MethodCall) {}
  visitFunctionCall(ast:FunctionCall) {}
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