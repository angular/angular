import { ListWrapper } from "angular2/src/facade/collection";
export class AST {
    visit(visitor) { return null; }
    toString() { return "AST"; }
}
/**
 * Represents a quoted expression of the form:
 *
 * quote = prefix `:` uninterpretedExpression
 * prefix = identifier
 * uninterpretedExpression = arbitrary string
 *
 * A quoted expression is meant to be pre-processed by an AST transformer that
 * converts it into another AST that no longer contains quoted expressions.
 * It is meant to allow third-party developers to extend Angular template
 * expression language. The `uninterpretedExpression` part of the quote is
 * therefore not interpreted by the Angular's own expression parser.
 */
export class Quote extends AST {
    constructor(prefix, uninterpretedExpression, location) {
        super();
        this.prefix = prefix;
        this.uninterpretedExpression = uninterpretedExpression;
        this.location = location;
    }
    visit(visitor) { return visitor.visitQuote(this); }
    toString() { return "Quote"; }
}
export class EmptyExpr extends AST {
    visit(visitor) {
        // do nothing
    }
}
export class ImplicitReceiver extends AST {
    visit(visitor) { return visitor.visitImplicitReceiver(this); }
}
/**
 * Multiple expressions separated by a semicolon.
 */
export class Chain extends AST {
    constructor(expressions) {
        super();
        this.expressions = expressions;
    }
    visit(visitor) { return visitor.visitChain(this); }
}
export class Conditional extends AST {
    constructor(condition, trueExp, falseExp) {
        super();
        this.condition = condition;
        this.trueExp = trueExp;
        this.falseExp = falseExp;
    }
    visit(visitor) { return visitor.visitConditional(this); }
}
export class PropertyRead extends AST {
    constructor(receiver, name, getter) {
        super();
        this.receiver = receiver;
        this.name = name;
        this.getter = getter;
    }
    visit(visitor) { return visitor.visitPropertyRead(this); }
}
export class PropertyWrite extends AST {
    constructor(receiver, name, setter, value) {
        super();
        this.receiver = receiver;
        this.name = name;
        this.setter = setter;
        this.value = value;
    }
    visit(visitor) { return visitor.visitPropertyWrite(this); }
}
export class SafePropertyRead extends AST {
    constructor(receiver, name, getter) {
        super();
        this.receiver = receiver;
        this.name = name;
        this.getter = getter;
    }
    visit(visitor) { return visitor.visitSafePropertyRead(this); }
}
export class KeyedRead extends AST {
    constructor(obj, key) {
        super();
        this.obj = obj;
        this.key = key;
    }
    visit(visitor) { return visitor.visitKeyedRead(this); }
}
export class KeyedWrite extends AST {
    constructor(obj, key, value) {
        super();
        this.obj = obj;
        this.key = key;
        this.value = value;
    }
    visit(visitor) { return visitor.visitKeyedWrite(this); }
}
export class BindingPipe extends AST {
    constructor(exp, name, args) {
        super();
        this.exp = exp;
        this.name = name;
        this.args = args;
    }
    visit(visitor) { return visitor.visitPipe(this); }
}
export class LiteralPrimitive extends AST {
    constructor(value) {
        super();
        this.value = value;
    }
    visit(visitor) { return visitor.visitLiteralPrimitive(this); }
}
export class LiteralArray extends AST {
    constructor(expressions) {
        super();
        this.expressions = expressions;
    }
    visit(visitor) { return visitor.visitLiteralArray(this); }
}
export class LiteralMap extends AST {
    constructor(keys, values) {
        super();
        this.keys = keys;
        this.values = values;
    }
    visit(visitor) { return visitor.visitLiteralMap(this); }
}
export class Interpolation extends AST {
    constructor(strings, expressions) {
        super();
        this.strings = strings;
        this.expressions = expressions;
    }
    visit(visitor) { return visitor.visitInterpolation(this); }
}
export class Binary extends AST {
    constructor(operation, left, right) {
        super();
        this.operation = operation;
        this.left = left;
        this.right = right;
    }
    visit(visitor) { return visitor.visitBinary(this); }
}
export class PrefixNot extends AST {
    constructor(expression) {
        super();
        this.expression = expression;
    }
    visit(visitor) { return visitor.visitPrefixNot(this); }
}
export class MethodCall extends AST {
    constructor(receiver, name, fn, args) {
        super();
        this.receiver = receiver;
        this.name = name;
        this.fn = fn;
        this.args = args;
    }
    visit(visitor) { return visitor.visitMethodCall(this); }
}
export class SafeMethodCall extends AST {
    constructor(receiver, name, fn, args) {
        super();
        this.receiver = receiver;
        this.name = name;
        this.fn = fn;
        this.args = args;
    }
    visit(visitor) { return visitor.visitSafeMethodCall(this); }
}
export class FunctionCall extends AST {
    constructor(target, args) {
        super();
        this.target = target;
        this.args = args;
    }
    visit(visitor) { return visitor.visitFunctionCall(this); }
}
export class ASTWithSource extends AST {
    constructor(ast, source, location) {
        super();
        this.ast = ast;
        this.source = source;
        this.location = location;
    }
    visit(visitor) { return this.ast.visit(visitor); }
    toString() { return `${this.source} in ${this.location}`; }
}
export class TemplateBinding {
    constructor(key, keyIsVar, name, expression) {
        this.key = key;
        this.keyIsVar = keyIsVar;
        this.name = name;
        this.expression = expression;
    }
}
export class RecursiveAstVisitor {
    visitBinary(ast) {
        ast.left.visit(this);
        ast.right.visit(this);
        return null;
    }
    visitChain(ast) { return this.visitAll(ast.expressions); }
    visitConditional(ast) {
        ast.condition.visit(this);
        ast.trueExp.visit(this);
        ast.falseExp.visit(this);
        return null;
    }
    visitPipe(ast) {
        ast.exp.visit(this);
        this.visitAll(ast.args);
        return null;
    }
    visitFunctionCall(ast) {
        ast.target.visit(this);
        this.visitAll(ast.args);
        return null;
    }
    visitImplicitReceiver(ast) { return null; }
    visitInterpolation(ast) { return this.visitAll(ast.expressions); }
    visitKeyedRead(ast) {
        ast.obj.visit(this);
        ast.key.visit(this);
        return null;
    }
    visitKeyedWrite(ast) {
        ast.obj.visit(this);
        ast.key.visit(this);
        ast.value.visit(this);
        return null;
    }
    visitLiteralArray(ast) { return this.visitAll(ast.expressions); }
    visitLiteralMap(ast) { return this.visitAll(ast.values); }
    visitLiteralPrimitive(ast) { return null; }
    visitMethodCall(ast) {
        ast.receiver.visit(this);
        return this.visitAll(ast.args);
    }
    visitPrefixNot(ast) {
        ast.expression.visit(this);
        return null;
    }
    visitPropertyRead(ast) {
        ast.receiver.visit(this);
        return null;
    }
    visitPropertyWrite(ast) {
        ast.receiver.visit(this);
        ast.value.visit(this);
        return null;
    }
    visitSafePropertyRead(ast) {
        ast.receiver.visit(this);
        return null;
    }
    visitSafeMethodCall(ast) {
        ast.receiver.visit(this);
        return this.visitAll(ast.args);
    }
    visitAll(asts) {
        asts.forEach(ast => ast.visit(this));
        return null;
    }
    visitQuote(ast) { return null; }
}
export class AstTransformer {
    visitImplicitReceiver(ast) { return ast; }
    visitInterpolation(ast) {
        return new Interpolation(ast.strings, this.visitAll(ast.expressions));
    }
    visitLiteralPrimitive(ast) { return new LiteralPrimitive(ast.value); }
    visitPropertyRead(ast) {
        return new PropertyRead(ast.receiver.visit(this), ast.name, ast.getter);
    }
    visitPropertyWrite(ast) {
        return new PropertyWrite(ast.receiver.visit(this), ast.name, ast.setter, ast.value);
    }
    visitSafePropertyRead(ast) {
        return new SafePropertyRead(ast.receiver.visit(this), ast.name, ast.getter);
    }
    visitMethodCall(ast) {
        return new MethodCall(ast.receiver.visit(this), ast.name, ast.fn, this.visitAll(ast.args));
    }
    visitSafeMethodCall(ast) {
        return new SafeMethodCall(ast.receiver.visit(this), ast.name, ast.fn, this.visitAll(ast.args));
    }
    visitFunctionCall(ast) {
        return new FunctionCall(ast.target.visit(this), this.visitAll(ast.args));
    }
    visitLiteralArray(ast) {
        return new LiteralArray(this.visitAll(ast.expressions));
    }
    visitLiteralMap(ast) {
        return new LiteralMap(ast.keys, this.visitAll(ast.values));
    }
    visitBinary(ast) {
        return new Binary(ast.operation, ast.left.visit(this), ast.right.visit(this));
    }
    visitPrefixNot(ast) { return new PrefixNot(ast.expression.visit(this)); }
    visitConditional(ast) {
        return new Conditional(ast.condition.visit(this), ast.trueExp.visit(this), ast.falseExp.visit(this));
    }
    visitPipe(ast) {
        return new BindingPipe(ast.exp.visit(this), ast.name, this.visitAll(ast.args));
    }
    visitKeyedRead(ast) {
        return new KeyedRead(ast.obj.visit(this), ast.key.visit(this));
    }
    visitKeyedWrite(ast) {
        return new KeyedWrite(ast.obj.visit(this), ast.key.visit(this), ast.value.visit(this));
    }
    visitAll(asts) {
        var res = ListWrapper.createFixedSize(asts.length);
        for (var i = 0; i < asts.length; ++i) {
            res[i] = asts[i].visit(this);
        }
        return res;
    }
    visitChain(ast) { return new Chain(this.visitAll(ast.expressions)); }
    visitQuote(ast) {
        return new Quote(ast.prefix, ast.uninterpretedExpression, ast.location);
    }
}
