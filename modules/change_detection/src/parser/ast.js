export class AST {
  eval(context) {
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

//INTERFACE
export class AstVisitor {
  visitImplicitReceiver(ast:ImplicitReceiver) {}
  visitFieldRead(ast:FieldRead) {}
}