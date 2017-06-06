import { ListWrapper } from "angular2/src/facade/collection";
export class AST {
    visit(visitor, context = null) { return null; }
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
    visit(visitor, context = null) { return visitor.visitQuote(this, context); }
    toString() { return "Quote"; }
}
export class EmptyExpr extends AST {
    visit(visitor, context = null) {
        // do nothing
    }
}
export class ImplicitReceiver extends AST {
    visit(visitor, context = null) {
        return visitor.visitImplicitReceiver(this, context);
    }
}
/**
 * Multiple expressions separated by a semicolon.
 */
export class Chain extends AST {
    constructor(expressions) {
        super();
        this.expressions = expressions;
    }
    visit(visitor, context = null) { return visitor.visitChain(this, context); }
}
export class Conditional extends AST {
    constructor(condition, trueExp, falseExp) {
        super();
        this.condition = condition;
        this.trueExp = trueExp;
        this.falseExp = falseExp;
    }
    visit(visitor, context = null) {
        return visitor.visitConditional(this, context);
    }
}
export class PropertyRead extends AST {
    constructor(receiver, name) {
        super();
        this.receiver = receiver;
        this.name = name;
    }
    visit(visitor, context = null) {
        return visitor.visitPropertyRead(this, context);
    }
}
export class PropertyWrite extends AST {
    constructor(receiver, name, value) {
        super();
        this.receiver = receiver;
        this.name = name;
        this.value = value;
    }
    visit(visitor, context = null) {
        return visitor.visitPropertyWrite(this, context);
    }
}
export class SafePropertyRead extends AST {
    constructor(receiver, name) {
        super();
        this.receiver = receiver;
        this.name = name;
    }
    visit(visitor, context = null) {
        return visitor.visitSafePropertyRead(this, context);
    }
}
export class KeyedRead extends AST {
    constructor(obj, key) {
        super();
        this.obj = obj;
        this.key = key;
    }
    visit(visitor, context = null) {
        return visitor.visitKeyedRead(this, context);
    }
}
export class KeyedWrite extends AST {
    constructor(obj, key, value) {
        super();
        this.obj = obj;
        this.key = key;
        this.value = value;
    }
    visit(visitor, context = null) {
        return visitor.visitKeyedWrite(this, context);
    }
}
export class BindingPipe extends AST {
    constructor(exp, name, args) {
        super();
        this.exp = exp;
        this.name = name;
        this.args = args;
    }
    visit(visitor, context = null) { return visitor.visitPipe(this, context); }
}
export class LiteralPrimitive extends AST {
    constructor(value) {
        super();
        this.value = value;
    }
    visit(visitor, context = null) {
        return visitor.visitLiteralPrimitive(this, context);
    }
}
export class LiteralArray extends AST {
    constructor(expressions) {
        super();
        this.expressions = expressions;
    }
    visit(visitor, context = null) {
        return visitor.visitLiteralArray(this, context);
    }
}
export class LiteralMap extends AST {
    constructor(keys, values) {
        super();
        this.keys = keys;
        this.values = values;
    }
    visit(visitor, context = null) {
        return visitor.visitLiteralMap(this, context);
    }
}
export class Interpolation extends AST {
    constructor(strings, expressions) {
        super();
        this.strings = strings;
        this.expressions = expressions;
    }
    visit(visitor, context = null) {
        return visitor.visitInterpolation(this, context);
    }
}
export class Binary extends AST {
    constructor(operation, left, right) {
        super();
        this.operation = operation;
        this.left = left;
        this.right = right;
    }
    visit(visitor, context = null) {
        return visitor.visitBinary(this, context);
    }
}
export class PrefixNot extends AST {
    constructor(expression) {
        super();
        this.expression = expression;
    }
    visit(visitor, context = null) {
        return visitor.visitPrefixNot(this, context);
    }
}
export class MethodCall extends AST {
    constructor(receiver, name, args) {
        super();
        this.receiver = receiver;
        this.name = name;
        this.args = args;
    }
    visit(visitor, context = null) {
        return visitor.visitMethodCall(this, context);
    }
}
export class SafeMethodCall extends AST {
    constructor(receiver, name, args) {
        super();
        this.receiver = receiver;
        this.name = name;
        this.args = args;
    }
    visit(visitor, context = null) {
        return visitor.visitSafeMethodCall(this, context);
    }
}
export class FunctionCall extends AST {
    constructor(target, args) {
        super();
        this.target = target;
        this.args = args;
    }
    visit(visitor, context = null) {
        return visitor.visitFunctionCall(this, context);
    }
}
export class ASTWithSource extends AST {
    constructor(ast, source, location) {
        super();
        this.ast = ast;
        this.source = source;
        this.location = location;
    }
    visit(visitor, context = null) { return this.ast.visit(visitor, context); }
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
    visitBinary(ast, context) {
        ast.left.visit(this);
        ast.right.visit(this);
        return null;
    }
    visitChain(ast, context) { return this.visitAll(ast.expressions, context); }
    visitConditional(ast, context) {
        ast.condition.visit(this);
        ast.trueExp.visit(this);
        ast.falseExp.visit(this);
        return null;
    }
    visitPipe(ast, context) {
        ast.exp.visit(this);
        this.visitAll(ast.args, context);
        return null;
    }
    visitFunctionCall(ast, context) {
        ast.target.visit(this);
        this.visitAll(ast.args, context);
        return null;
    }
    visitImplicitReceiver(ast, context) { return null; }
    visitInterpolation(ast, context) {
        return this.visitAll(ast.expressions, context);
    }
    visitKeyedRead(ast, context) {
        ast.obj.visit(this);
        ast.key.visit(this);
        return null;
    }
    visitKeyedWrite(ast, context) {
        ast.obj.visit(this);
        ast.key.visit(this);
        ast.value.visit(this);
        return null;
    }
    visitLiteralArray(ast, context) {
        return this.visitAll(ast.expressions, context);
    }
    visitLiteralMap(ast, context) { return this.visitAll(ast.values, context); }
    visitLiteralPrimitive(ast, context) { return null; }
    visitMethodCall(ast, context) {
        ast.receiver.visit(this);
        return this.visitAll(ast.args, context);
    }
    visitPrefixNot(ast, context) {
        ast.expression.visit(this);
        return null;
    }
    visitPropertyRead(ast, context) {
        ast.receiver.visit(this);
        return null;
    }
    visitPropertyWrite(ast, context) {
        ast.receiver.visit(this);
        ast.value.visit(this);
        return null;
    }
    visitSafePropertyRead(ast, context) {
        ast.receiver.visit(this);
        return null;
    }
    visitSafeMethodCall(ast, context) {
        ast.receiver.visit(this);
        return this.visitAll(ast.args, context);
    }
    visitAll(asts, context) {
        asts.forEach(ast => ast.visit(this, context));
        return null;
    }
    visitQuote(ast, context) { return null; }
}
export class AstTransformer {
    visitImplicitReceiver(ast, context) { return ast; }
    visitInterpolation(ast, context) {
        return new Interpolation(ast.strings, this.visitAll(ast.expressions));
    }
    visitLiteralPrimitive(ast, context) {
        return new LiteralPrimitive(ast.value);
    }
    visitPropertyRead(ast, context) {
        return new PropertyRead(ast.receiver.visit(this), ast.name);
    }
    visitPropertyWrite(ast, context) {
        return new PropertyWrite(ast.receiver.visit(this), ast.name, ast.value);
    }
    visitSafePropertyRead(ast, context) {
        return new SafePropertyRead(ast.receiver.visit(this), ast.name);
    }
    visitMethodCall(ast, context) {
        return new MethodCall(ast.receiver.visit(this), ast.name, this.visitAll(ast.args));
    }
    visitSafeMethodCall(ast, context) {
        return new SafeMethodCall(ast.receiver.visit(this), ast.name, this.visitAll(ast.args));
    }
    visitFunctionCall(ast, context) {
        return new FunctionCall(ast.target.visit(this), this.visitAll(ast.args));
    }
    visitLiteralArray(ast, context) {
        return new LiteralArray(this.visitAll(ast.expressions));
    }
    visitLiteralMap(ast, context) {
        return new LiteralMap(ast.keys, this.visitAll(ast.values));
    }
    visitBinary(ast, context) {
        return new Binary(ast.operation, ast.left.visit(this), ast.right.visit(this));
    }
    visitPrefixNot(ast, context) {
        return new PrefixNot(ast.expression.visit(this));
    }
    visitConditional(ast, context) {
        return new Conditional(ast.condition.visit(this), ast.trueExp.visit(this), ast.falseExp.visit(this));
    }
    visitPipe(ast, context) {
        return new BindingPipe(ast.exp.visit(this), ast.name, this.visitAll(ast.args));
    }
    visitKeyedRead(ast, context) {
        return new KeyedRead(ast.obj.visit(this), ast.key.visit(this));
    }
    visitKeyedWrite(ast, context) {
        return new KeyedWrite(ast.obj.visit(this), ast.key.visit(this), ast.value.visit(this));
    }
    visitAll(asts) {
        var res = ListWrapper.createFixedSize(asts.length);
        for (var i = 0; i < asts.length; ++i) {
            res[i] = asts[i].visit(this);
        }
        return res;
    }
    visitChain(ast, context) { return new Chain(this.visitAll(ast.expressions)); }
    visitQuote(ast, context) {
        return new Quote(ast.prefix, ast.uninterpretedExpression, ast.location);
    }
}
