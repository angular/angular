import {autoConvertAdd, isBlank, isPresent, FunctionWrapper, BaseException} from "angular2/src/facade/lang";
import {List, Map, ListWrapper, StringMapWrapper} from "angular2/src/facade/collection";

export class AST {
  eval(context, locals) {
    throw new BaseException("Not supported");
  }

  get isAssignable() {
    return false;
  }

  assign(context, locals, value) {
    throw new BaseException("Not supported");
  }

  visit(visitor) {
  }

  toString():string {
    return "AST";
  }
}

export class EmptyExpr extends AST {
  eval(context, locals) {
    return null;
  }

  visit(visitor) {
    //do nothing
  }
}

export class ImplicitReceiver extends AST {
  eval(context, locals) {
    return context;
  }

  visit(visitor) {
    return visitor.visitImplicitReceiver(this);
  }
}

/**
 * Multiple expressions separated by a semicolon.
 */
export class Chain extends AST {
  expressions:List;
  constructor(expressions:List) {
    super();
    this.expressions = expressions;
  }

  eval(context, locals) {
    var result;
    for (var i = 0; i < this.expressions.length; i++) {
      var last = this.expressions[i].eval(context, locals);
      if (isPresent(last)) result = last;
    }
    return result;
  }

  visit(visitor) {
    return visitor.visitChain(this);
  }
}

export class Conditional extends AST {
  condition:AST;
  trueExp:AST;
  falseExp:AST;
  constructor(condition:AST, trueExp:AST, falseExp:AST){
    super();
    this.condition = condition;
    this.trueExp = trueExp;
    this.falseExp = falseExp;
  }

  eval(context, locals) {
    if(this.condition.eval(context, locals)) {
      return this.trueExp.eval(context, locals);
    } else {
      return this.falseExp.eval(context, locals);
    }
  }

  visit(visitor) {
    return visitor.visitConditional(this);
  }
}

export class AccessMember extends AST {
  receiver:AST;
  name:string;
  getter:Function;
  setter:Function;
  constructor(receiver:AST, name:string, getter:Function, setter:Function) {
    super();
    this.receiver = receiver;
    this.name = name;
    this.getter = getter;
    this.setter = setter;
  }

  eval(context, locals) {
    if (this.receiver instanceof ImplicitReceiver &&
      isPresent(locals) && locals.contains(this.name)) {
      return locals.get(this.name);
    } else {
      var evaluatedReceiver = this.receiver.eval(context, locals);
      return this.getter(evaluatedReceiver);
    }
  }

  get isAssignable() {
    return true;
  }

  assign(context, locals, value) {
    var evaluatedContext = this.receiver.eval(context, locals);

    if (this.receiver instanceof ImplicitReceiver &&
      isPresent(locals) && locals.contains(this.name)) {
      throw new BaseException(`Cannot reassign a variable binding ${this.name}`);
    } else {
      return this.setter(evaluatedContext, value);
    }
  }

  visit(visitor) {
    return visitor.visitAccessMember(this);
  }
}

export class KeyedAccess extends AST {
  obj:AST;
  key:AST;
  constructor(obj:AST, key:AST) {
    super();
    this.obj = obj;
    this.key = key;
  }

  eval(context, locals) {
    var obj = this.obj.eval(context, locals);
    var key = this.key.eval(context, locals);
    return obj[key];
  }

  get isAssignable() {
    return true;
  }

  assign(context, locals, value) {
    var obj = this.obj.eval(context, locals);
    var key = this.key.eval(context, locals);
    obj[key] = value;
    return value;
  }

  visit(visitor) {
    return visitor.visitKeyedAccess(this);
  }
}

export class Pipe extends AST {
  exp:AST;
  name:string;
  args:List<AST>;
  inBinding:boolean;
  constructor(exp:AST, name:string, args:List, inBinding:boolean) {
    super();
    this.exp = exp;
    this.name = name;
    this.args = args;
    this.inBinding = inBinding;
  }

  visit(visitor) {
    return visitor.visitPipe(this);
  }
}

export class LiteralPrimitive extends AST {
  value;
  constructor(value) {
    super();
    this.value = value;
  }

  eval(context, locals) {
    return this.value;
  }

  visit(visitor) {
    return visitor.visitLiteralPrimitive(this);
  }
}

export class LiteralArray extends AST {
  expressions:List;
  constructor(expressions:List) {
    super();
    this.expressions = expressions;
  }

  eval(context, locals) {
    return ListWrapper.map(this.expressions, (e) => e.eval(context, locals));
  }

  visit(visitor) {
    return visitor.visitLiteralArray(this);
  }
}

export class LiteralMap extends AST {
  keys:List;
  values:List;
  constructor(keys:List, values:List) {
    super();
    this.keys = keys;
    this.values = values;
  }

  eval(context, locals) {
    var res = StringMapWrapper.create();
    for(var i = 0; i < this.keys.length; ++i) {
      StringMapWrapper.set(res, this.keys[i], this.values[i].eval(context, locals));
    }
    return res;
  }

  visit(visitor) {
    return visitor.visitLiteralMap(this);
  }
}

export class Interpolation extends AST {
  strings:List;
  expressions:List;
  constructor(strings:List, expressions:List) {
    super();
    this.strings = strings;
    this.expressions = expressions;
  }

  eval(context, locals) {
    throw new BaseException("evaluating an Interpolation is not supported");
  }

  visit(visitor) {
    visitor.visitInterpolation(this);
  }
}

export class Binary extends AST {
  operation:string;
  left:AST;
  right:AST;
  constructor(operation:string, left:AST, right:AST) {
    super();
    this.operation = operation;
    this.left = left;
    this.right = right;
  }

  eval(context, locals) {
    var left = this.left.eval(context, locals);
    switch (this.operation) {
      case '&&': return left && this.right.eval(context, locals);
      case '||': return left || this.right.eval(context, locals);
    }
    var right = this.right.eval(context, locals);

    switch (this.operation) {
      case '+'  : return left + right;
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
    return visitor.visitBinary(this);
  }
}

export class PrefixNot extends AST {
  expression:AST;
  constructor(expression:AST) {
    super();
    this.expression = expression;
  }

  eval(context, locals) {
    return !this.expression.eval(context, locals);
  }

  visit(visitor) {
    return visitor.visitPrefixNot(this);
  }
}

export class Assignment extends AST {
  target:AST;
  value:AST;
  constructor(target:AST, value:AST) {
    super();
    this.target = target;
    this.value = value;
  }

  eval(context, locals) {
    return this.target.assign(context, locals, this.value.eval(context, locals));
  }

  visit(visitor) {
    return visitor.visitAssignment(this);
  }
}

export class MethodCall extends AST {
  receiver:AST;
  fn:Function;
  args:List;
  name:string;
  constructor(receiver:AST, name:string, fn:Function, args:List) {
    super();
    this.receiver = receiver;
    this.fn = fn;
    this.args = args;
    this.name = name;
  }

  eval(context, locals) {
    var evaluatedArgs = evalList(context, locals, this.args);
    if (this.receiver instanceof ImplicitReceiver &&
      isPresent(locals) && locals.contains(this.name)) {
      var fn = locals.get(this.name);
      return FunctionWrapper.apply(fn, evaluatedArgs);
    } else {
      var evaluatedReceiver = this.receiver.eval(context, locals);
      return this.fn(evaluatedReceiver, evaluatedArgs);
    }
  }

  visit(visitor) {
    return visitor.visitMethodCall(this);
  }
}

export class FunctionCall extends AST {
  target:AST;
  args:List;
  constructor(target:AST, args:List) {
    super();
    this.target = target;
    this.args = args;
  }

  eval(context, locals) {
    var obj = this.target.eval(context, locals);
    if (! (obj instanceof Function)) {
      throw new BaseException(`${obj} is not a function`);
    }
    return FunctionWrapper.apply(obj, evalList(context, locals, this.args));
  }

  visit(visitor) {
    return visitor.visitFunctionCall(this);
  }
}

export class ASTWithSource extends AST {
  ast:AST;
  source:string;
  location:string;
  constructor(ast:AST, source:string, location:string) {
    super();
    this.source = source;
    this.location = location;
    this.ast = ast;
  }

  eval(context, locals) {
    return this.ast.eval(context, locals);
  }

  get isAssignable() {
    return this.ast.isAssignable;
  }

  assign(context, locals, value) {
    return this.ast.assign(context, locals, value);
  }

  visit(visitor) {
    return this.ast.visit(visitor);
  }

  toString():string {
    return `${this.source} in ${this.location}`;
  }
}

export class TemplateBinding {
  key:string;
  keyIsVar:boolean;
  name:string;
  expression:ASTWithSource;
  constructor(key:string, keyIsVar:boolean, name:string, expression:ASTWithSource) {
    this.key = key;
    this.keyIsVar = keyIsVar;
    // only either name or expression will be filled.
    this.name = name;
    this.expression = expression;
  }
}

//INTERFACE
export class AstVisitor {
  visitAccessMember(ast:AccessMember) {}
  visitAssignment(ast:Assignment) {}
  visitBinary(ast:Binary) {}
  visitChain(ast:Chain){}
  visitConditional(ast:Conditional) {}
  visitPipe(ast:Pipe) {}
  visitFunctionCall(ast:FunctionCall) {}
  visitImplicitReceiver(ast:ImplicitReceiver) {}
  visitKeyedAccess(ast:KeyedAccess) {}
  visitLiteralArray(ast:LiteralArray) {}
  visitLiteralMap(ast:LiteralMap) {}
  visitLiteralPrimitive(ast:LiteralPrimitive) {}
  visitMethodCall(ast:MethodCall) {}
  visitPrefixNot(ast:PrefixNot) {}
}

export class AstTransformer {
  visitImplicitReceiver(ast:ImplicitReceiver) {
    return new ImplicitReceiver();
  }

  visitInterpolation(ast:Interpolation) {
    return new Interpolation(ast.strings, this.visitAll(ast.expressions));
  }

  visitLiteralPrimitive(ast:LiteralPrimitive) {
    return new LiteralPrimitive(ast.value);
  }

  visitAccessMember(ast:AccessMember) {
    return new AccessMember(ast.receiver.visit(this), ast.name, ast.getter, ast.setter);
  }

  visitMethodCall(ast:MethodCall) {
    return new MethodCall(ast.receiver.visit(this), ast.name, ast.fn, this.visitAll(ast.args));
  }

  visitFunctionCall(ast:FunctionCall) {
    return new FunctionCall(ast.target.visit(this), this.visitAll(ast.args));
  }

  visitLiteralArray(ast:LiteralArray) {
    return new LiteralArray(this.visitAll(ast.expressions));
  }

  visitLiteralMap(ast:LiteralMap) {
    return new LiteralMap(ast.keys, this.visitAll(ast.values));
  }

  visitBinary(ast:Binary) {
    return new Binary(ast.operation, ast.left.visit(this), ast.right.visit(this));
  }

  visitPrefixNot(ast:PrefixNot) {
    return new PrefixNot(ast.expression.visit(this));
  }

  visitConditional(ast:Conditional) {
    return new Conditional(
      ast.condition.visit(this),
      ast.trueExp.visit(this),
      ast.falseExp.visit(this)
    );
  }

  visitPipe(ast:Pipe) {
    return new Pipe(ast.exp.visit(this), ast.name, this.visitAll(ast.args), ast.inBinding);
  }

  visitKeyedAccess(ast:KeyedAccess) {
    return new KeyedAccess(ast.obj.visit(this), ast.key.visit(this));
  }

  visitAll(asts:List) {
    var res = ListWrapper.createFixedSize(asts.length);
    for (var i = 0; i < asts.length; ++i) {
      res[i] = asts[i].visit(this);
    }
    return res;
  }
}

var _evalListCache = [[],[0],[0,0],[0,0,0],[0,0,0,0],[0,0,0,0,0],
  [0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0]];

function evalList(context, locals, exps:List){
  var length = exps.length;
  if (length > 10) {
    throw new BaseException("Cannot have more than 10 argument");
  }

  var result = _evalListCache[length];
  for (var i = 0; i < length; i++) {
    result[i] = exps[i].eval(context, locals);
  }
  return result;
}
