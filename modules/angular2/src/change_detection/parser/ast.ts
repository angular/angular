import {isBlank, isPresent, FunctionWrapper, BaseException} from "angular2/src/facade/lang";
import {List, Map, ListWrapper, StringMapWrapper} from "angular2/src/facade/collection";

export class AST {
  eval(context: any, locals: any): any {
    throw new BaseException("Not supported");
  }

  get isAssignable (): boolean {
    return false;
  }

  assign(context:any, locals:any, value:any) {
    throw new BaseException("Not supported");
  }

  visit(visitor: AstVisitor): any {
    return null;
  }

  toString():string {
    return "AST";
  }
}

export class EmptyExpr extends AST {
  eval(context: any, locals: any): any {
    return null;
  }

  visit(visitor: AstVisitor): any {
    //do nothing
    return null;
  }
}

export class ImplicitReceiver extends AST {
  eval(context: any, locals: any): any {
    return context;
  }

  visit(visitor: AstVisitor): any {
    return visitor.visitImplicitReceiver(this);
  }
}

/**
 * Multiple expressions separated by a semicolon.
 */
export class Chain extends AST {
  expressions:List<AST>;
  constructor(expressions:List<AST>) {
    super();
    this.expressions = expressions;
  }

  eval(context: any, locals: any): any {
    var result;
    for (var i = 0; i < this.expressions.length; i++) {
      var last = this.expressions[i].eval(context, locals);
      if (isPresent(last)) result = last;
    }
    return result;
  }

  visit(visitor: AstVisitor): any {
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

  eval(context:any, locals:any):any {
    if(this.condition.eval(context, locals)) {
      return this.trueExp.eval(context, locals);
    } else {
      return this.falseExp.eval(context, locals);
    }
  }

  visit(visitor: AstVisitor):any {
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

  eval(context:any, locals:any):any {
    if (this.receiver instanceof ImplicitReceiver &&
      isPresent(locals) && locals.contains(this.name)) {
      return locals.get(this.name);
    } else {
      var evaluatedReceiver = this.receiver.eval(context, locals);
      return this.getter(evaluatedReceiver);
    }
  }

  get isAssignable():boolean {
    return true;
  }

  assign(context:any, locals:any, value:any) {
    var evaluatedContext = this.receiver.eval(context, locals);

    if (this.receiver instanceof ImplicitReceiver &&
      isPresent(locals) && locals.contains(this.name)) {
      throw new BaseException(`Cannot reassign a variable binding ${this.name}`);
    } else {
      return this.setter(evaluatedContext, value);
    }
  }

  visit(visitor: AstVisitor):any {
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

  eval(context:any, locals:any):any {
    var obj = this.obj.eval(context, locals);
    var key = this.key.eval(context, locals);
    return obj[key];
  }

  get isAssignable():boolean {
    return true;
  }

  assign(context:any, locals:any, value:any) {
    var obj = this.obj.eval(context, locals);
    var key = this.key.eval(context, locals);
    obj[key] = value;
    return value;
  }

  visit(visitor: AstVisitor):any {
    return visitor.visitKeyedAccess(this);
  }
}

export class Pipe extends AST {
  exp:AST;
  name:string;
  args:List<AST>;
  inBinding:boolean;
  constructor(exp:AST, name:string, args:List<AST>, inBinding:boolean) {
    super();
    this.exp = exp;
    this.name = name;
    this.args = args;
    this.inBinding = inBinding;
  }

  visit(visitor: AstVisitor):any {
    return visitor.visitPipe(this);
  }
}

export class LiteralPrimitive extends AST {
  value:any;
  constructor(value:any) {
    super();
    this.value = value;
  }

  eval(context:any, locals:any):any {
    return this.value;
  }

  visit(visitor: AstVisitor):any {
    return visitor.visitLiteralPrimitive(this);
  }
}

export class LiteralArray extends AST {
  expressions:List<AST>;
  constructor(expressions:List<AST>) {
    super();
    this.expressions = expressions;
  }

  eval(context:any, locals:any):any {
    return ListWrapper.map(this.expressions, (e) => e.eval(context, locals));
  }

  visit(visitor: AstVisitor):any {
    return visitor.visitLiteralArray(this);
  }
}

export class LiteralMap extends AST {
  keys:List<string>;
  values:List<AST>;
  constructor(keys:List<string>, values:List<AST>) {
    super();
    this.keys = keys;
    this.values = values;
  }

  eval(context:any, locals:any):any {
    var res = StringMapWrapper.create();
    for(var i = 0; i < this.keys.length; ++i) {
      StringMapWrapper.set(res, this.keys[i], this.values[i].eval(context, locals));
    }
    return res;
  }

  visit(visitor: AstVisitor):any {
    return visitor.visitLiteralMap(this);
  }
}

export class Interpolation extends AST {
  strings:List<string>;
  expressions:List<AST>;
  constructor(strings:List<string>, expressions:List<AST>) {
    super();
    this.strings = strings;
    this.expressions = expressions;
  }

  eval(context:any, locals:any):any {
    throw new BaseException("evaluating an Interpolation is not supported");
  }

  visit(visitor: AstVisitor): any {
    return visitor.visitInterpolation(this);
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

  eval(context:any, locals:any):any {
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

  visit(visitor: AstVisitor): any {
    return visitor.visitBinary(this);
  }
}

export class PrefixNot extends AST {
  expression:AST;
  constructor(expression:AST) {
    super();
    this.expression = expression;
  }

  eval(context:any, locals:any):any {
    return !this.expression.eval(context, locals);
  }

  visit(visitor: AstVisitor):any {
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

  eval(context:any, locals:any):any {
    return this.target.assign(context, locals, this.value.eval(context, locals));
  }

  visit(visitor: AstVisitor):any {
    return visitor.visitAssignment(this);
  }
}

export class MethodCall extends AST {
  receiver:AST;
  fn:Function;
  args:List<AST>;
  name:string;
  constructor(receiver:AST, name:string, fn:Function, args:List<AST>) {
    super();
    this.receiver = receiver;
    this.fn = fn;
    this.args = args;
    this.name = name;
  }

  eval(context:any, locals:any):any {
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

  visit(visitor: AstVisitor):any {
    return visitor.visitMethodCall(this);
  }
}

export class FunctionCall extends AST {
  target:AST;
  args:List<AST>;
  constructor(target:AST, args:List<AST>) {
    super();
    this.target = target;
    this.args = args;
  }

  eval(context:any, locals:any):any {
    var obj = this.target.eval(context, locals);
    if (! (obj instanceof Function)) {
      throw new BaseException(`${obj} is not a function`);
    }
    return FunctionWrapper.apply(obj, evalList(context, locals, this.args));
  }

  visit(visitor: AstVisitor):any {
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

  eval(context:any, locals:any):any {
    return this.ast.eval(context, locals);
  }

  get isAssignable():boolean {
    return this.ast.isAssignable;
  }

  assign(context:any, locals:any, value:any) {
    return this.ast.assign(context, locals, value);
  }

  visit(visitor: AstVisitor):any {
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
export interface AstVisitor {
  visitAccessMember(ast:AccessMember): any;
  visitAssignment(ast:Assignment): any;
  visitBinary(ast:Binary): any;
  visitChain(ast:Chain): any;
  visitConditional(ast:Conditional): any;
  visitPipe(ast:Pipe): any;
  visitFunctionCall(ast:FunctionCall): any;
  visitImplicitReceiver(ast:ImplicitReceiver): any;
  visitKeyedAccess(ast:KeyedAccess): any;
  visitLiteralArray(ast:LiteralArray): any;
  visitLiteralMap(ast:LiteralMap): any;
  visitLiteralPrimitive(ast:LiteralPrimitive): any;
  visitMethodCall(ast:MethodCall): any;
  visitPrefixNot(ast:PrefixNot): any;
  visitInterpolation(ast: Interpolation): any;
}

export class AstTransformer implements AstVisitor {
  visitAssignment(ast:Assignment): any {
    return new Assignment(ast.target, ast.value);
  }

  visitImplicitReceiver(ast:ImplicitReceiver): any {
    return new ImplicitReceiver();
  }

  visitInterpolation(ast:Interpolation): any {
    return new Interpolation(ast.strings, this.visitAll(ast.expressions));
  }

  visitLiteralPrimitive(ast:LiteralPrimitive): any {
    return new LiteralPrimitive(ast.value);
  }

  visitAccessMember(ast:AccessMember): any {
    return new AccessMember(ast.receiver.visit(this), ast.name, ast.getter, ast.setter);
  }

  visitMethodCall(ast:MethodCall): any {
    return new MethodCall(ast.receiver.visit(this), ast.name, ast.fn, this.visitAll(ast.args));
  }

  visitFunctionCall(ast:FunctionCall): any {
    return new FunctionCall(ast.target.visit(this), this.visitAll(ast.args));
  }

  visitLiteralArray(ast:LiteralArray): any {
    return new LiteralArray(this.visitAll(ast.expressions));
  }

  visitLiteralMap(ast:LiteralMap): any {
    return new LiteralMap(ast.keys, this.visitAll(ast.values));
  }

  visitBinary(ast:Binary): any {
    return new Binary(ast.operation, ast.left.visit(this), ast.right.visit(this));
  }

  visitChain(ast:Chain): any {
    return new Chain(ast.expressions);
  }

  visitPrefixNot(ast:PrefixNot): any {
    return new PrefixNot(ast.expression.visit(this));
  }

  visitConditional(ast:Conditional): any {
    return new Conditional(
      ast.condition.visit(this),
      ast.trueExp.visit(this),
      ast.falseExp.visit(this)
    );
  }

  visitPipe(ast:Pipe): any {
    return new Pipe(ast.exp.visit(this), ast.name, this.visitAll(ast.args), ast.inBinding);
  }

  visitKeyedAccess(ast:KeyedAccess): any {
    return new KeyedAccess(ast.obj.visit(this), ast.key.visit(this));
  }

  visitAll(asts:List<AST>): List<any> {
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

function evalList(context:any, locals:any, exps:List<AST>):any {
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
