'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require("angular2/src/facade/collection");
var AST = (function () {
    function AST() {
    }
    AST.prototype.visit = function (visitor) { return null; };
    AST.prototype.toString = function () { return "AST"; };
    return AST;
})();
exports.AST = AST;
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
var Quote = (function (_super) {
    __extends(Quote, _super);
    function Quote(prefix, uninterpretedExpression, location) {
        _super.call(this);
        this.prefix = prefix;
        this.uninterpretedExpression = uninterpretedExpression;
        this.location = location;
    }
    Quote.prototype.visit = function (visitor) { return visitor.visitQuote(this); };
    Quote.prototype.toString = function () { return "Quote"; };
    return Quote;
})(AST);
exports.Quote = Quote;
var EmptyExpr = (function (_super) {
    __extends(EmptyExpr, _super);
    function EmptyExpr() {
        _super.apply(this, arguments);
    }
    EmptyExpr.prototype.visit = function (visitor) {
        // do nothing
    };
    return EmptyExpr;
})(AST);
exports.EmptyExpr = EmptyExpr;
var ImplicitReceiver = (function (_super) {
    __extends(ImplicitReceiver, _super);
    function ImplicitReceiver() {
        _super.apply(this, arguments);
    }
    ImplicitReceiver.prototype.visit = function (visitor) { return visitor.visitImplicitReceiver(this); };
    return ImplicitReceiver;
})(AST);
exports.ImplicitReceiver = ImplicitReceiver;
/**
 * Multiple expressions separated by a semicolon.
 */
var Chain = (function (_super) {
    __extends(Chain, _super);
    function Chain(expressions) {
        _super.call(this);
        this.expressions = expressions;
    }
    Chain.prototype.visit = function (visitor) { return visitor.visitChain(this); };
    return Chain;
})(AST);
exports.Chain = Chain;
var Conditional = (function (_super) {
    __extends(Conditional, _super);
    function Conditional(condition, trueExp, falseExp) {
        _super.call(this);
        this.condition = condition;
        this.trueExp = trueExp;
        this.falseExp = falseExp;
    }
    Conditional.prototype.visit = function (visitor) { return visitor.visitConditional(this); };
    return Conditional;
})(AST);
exports.Conditional = Conditional;
var PropertyRead = (function (_super) {
    __extends(PropertyRead, _super);
    function PropertyRead(receiver, name, getter) {
        _super.call(this);
        this.receiver = receiver;
        this.name = name;
        this.getter = getter;
    }
    PropertyRead.prototype.visit = function (visitor) { return visitor.visitPropertyRead(this); };
    return PropertyRead;
})(AST);
exports.PropertyRead = PropertyRead;
var PropertyWrite = (function (_super) {
    __extends(PropertyWrite, _super);
    function PropertyWrite(receiver, name, setter, value) {
        _super.call(this);
        this.receiver = receiver;
        this.name = name;
        this.setter = setter;
        this.value = value;
    }
    PropertyWrite.prototype.visit = function (visitor) { return visitor.visitPropertyWrite(this); };
    return PropertyWrite;
})(AST);
exports.PropertyWrite = PropertyWrite;
var SafePropertyRead = (function (_super) {
    __extends(SafePropertyRead, _super);
    function SafePropertyRead(receiver, name, getter) {
        _super.call(this);
        this.receiver = receiver;
        this.name = name;
        this.getter = getter;
    }
    SafePropertyRead.prototype.visit = function (visitor) { return visitor.visitSafePropertyRead(this); };
    return SafePropertyRead;
})(AST);
exports.SafePropertyRead = SafePropertyRead;
var KeyedRead = (function (_super) {
    __extends(KeyedRead, _super);
    function KeyedRead(obj, key) {
        _super.call(this);
        this.obj = obj;
        this.key = key;
    }
    KeyedRead.prototype.visit = function (visitor) { return visitor.visitKeyedRead(this); };
    return KeyedRead;
})(AST);
exports.KeyedRead = KeyedRead;
var KeyedWrite = (function (_super) {
    __extends(KeyedWrite, _super);
    function KeyedWrite(obj, key, value) {
        _super.call(this);
        this.obj = obj;
        this.key = key;
        this.value = value;
    }
    KeyedWrite.prototype.visit = function (visitor) { return visitor.visitKeyedWrite(this); };
    return KeyedWrite;
})(AST);
exports.KeyedWrite = KeyedWrite;
var BindingPipe = (function (_super) {
    __extends(BindingPipe, _super);
    function BindingPipe(exp, name, args) {
        _super.call(this);
        this.exp = exp;
        this.name = name;
        this.args = args;
    }
    BindingPipe.prototype.visit = function (visitor) { return visitor.visitPipe(this); };
    return BindingPipe;
})(AST);
exports.BindingPipe = BindingPipe;
var LiteralPrimitive = (function (_super) {
    __extends(LiteralPrimitive, _super);
    function LiteralPrimitive(value) {
        _super.call(this);
        this.value = value;
    }
    LiteralPrimitive.prototype.visit = function (visitor) { return visitor.visitLiteralPrimitive(this); };
    return LiteralPrimitive;
})(AST);
exports.LiteralPrimitive = LiteralPrimitive;
var LiteralArray = (function (_super) {
    __extends(LiteralArray, _super);
    function LiteralArray(expressions) {
        _super.call(this);
        this.expressions = expressions;
    }
    LiteralArray.prototype.visit = function (visitor) { return visitor.visitLiteralArray(this); };
    return LiteralArray;
})(AST);
exports.LiteralArray = LiteralArray;
var LiteralMap = (function (_super) {
    __extends(LiteralMap, _super);
    function LiteralMap(keys, values) {
        _super.call(this);
        this.keys = keys;
        this.values = values;
    }
    LiteralMap.prototype.visit = function (visitor) { return visitor.visitLiteralMap(this); };
    return LiteralMap;
})(AST);
exports.LiteralMap = LiteralMap;
var Interpolation = (function (_super) {
    __extends(Interpolation, _super);
    function Interpolation(strings, expressions) {
        _super.call(this);
        this.strings = strings;
        this.expressions = expressions;
    }
    Interpolation.prototype.visit = function (visitor) { return visitor.visitInterpolation(this); };
    return Interpolation;
})(AST);
exports.Interpolation = Interpolation;
var Binary = (function (_super) {
    __extends(Binary, _super);
    function Binary(operation, left, right) {
        _super.call(this);
        this.operation = operation;
        this.left = left;
        this.right = right;
    }
    Binary.prototype.visit = function (visitor) { return visitor.visitBinary(this); };
    return Binary;
})(AST);
exports.Binary = Binary;
var PrefixNot = (function (_super) {
    __extends(PrefixNot, _super);
    function PrefixNot(expression) {
        _super.call(this);
        this.expression = expression;
    }
    PrefixNot.prototype.visit = function (visitor) { return visitor.visitPrefixNot(this); };
    return PrefixNot;
})(AST);
exports.PrefixNot = PrefixNot;
var MethodCall = (function (_super) {
    __extends(MethodCall, _super);
    function MethodCall(receiver, name, fn, args) {
        _super.call(this);
        this.receiver = receiver;
        this.name = name;
        this.fn = fn;
        this.args = args;
    }
    MethodCall.prototype.visit = function (visitor) { return visitor.visitMethodCall(this); };
    return MethodCall;
})(AST);
exports.MethodCall = MethodCall;
var SafeMethodCall = (function (_super) {
    __extends(SafeMethodCall, _super);
    function SafeMethodCall(receiver, name, fn, args) {
        _super.call(this);
        this.receiver = receiver;
        this.name = name;
        this.fn = fn;
        this.args = args;
    }
    SafeMethodCall.prototype.visit = function (visitor) { return visitor.visitSafeMethodCall(this); };
    return SafeMethodCall;
})(AST);
exports.SafeMethodCall = SafeMethodCall;
var FunctionCall = (function (_super) {
    __extends(FunctionCall, _super);
    function FunctionCall(target, args) {
        _super.call(this);
        this.target = target;
        this.args = args;
    }
    FunctionCall.prototype.visit = function (visitor) { return visitor.visitFunctionCall(this); };
    return FunctionCall;
})(AST);
exports.FunctionCall = FunctionCall;
var ASTWithSource = (function (_super) {
    __extends(ASTWithSource, _super);
    function ASTWithSource(ast, source, location) {
        _super.call(this);
        this.ast = ast;
        this.source = source;
        this.location = location;
    }
    ASTWithSource.prototype.visit = function (visitor) { return this.ast.visit(visitor); };
    ASTWithSource.prototype.toString = function () { return this.source + " in " + this.location; };
    return ASTWithSource;
})(AST);
exports.ASTWithSource = ASTWithSource;
var TemplateBinding = (function () {
    function TemplateBinding(key, keyIsVar, name, expression) {
        this.key = key;
        this.keyIsVar = keyIsVar;
        this.name = name;
        this.expression = expression;
    }
    return TemplateBinding;
})();
exports.TemplateBinding = TemplateBinding;
var RecursiveAstVisitor = (function () {
    function RecursiveAstVisitor() {
    }
    RecursiveAstVisitor.prototype.visitBinary = function (ast) {
        ast.left.visit(this);
        ast.right.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitChain = function (ast) { return this.visitAll(ast.expressions); };
    RecursiveAstVisitor.prototype.visitConditional = function (ast) {
        ast.condition.visit(this);
        ast.trueExp.visit(this);
        ast.falseExp.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitPipe = function (ast) {
        ast.exp.visit(this);
        this.visitAll(ast.args);
        return null;
    };
    RecursiveAstVisitor.prototype.visitFunctionCall = function (ast) {
        ast.target.visit(this);
        this.visitAll(ast.args);
        return null;
    };
    RecursiveAstVisitor.prototype.visitImplicitReceiver = function (ast) { return null; };
    RecursiveAstVisitor.prototype.visitInterpolation = function (ast) { return this.visitAll(ast.expressions); };
    RecursiveAstVisitor.prototype.visitKeyedRead = function (ast) {
        ast.obj.visit(this);
        ast.key.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitKeyedWrite = function (ast) {
        ast.obj.visit(this);
        ast.key.visit(this);
        ast.value.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitLiteralArray = function (ast) { return this.visitAll(ast.expressions); };
    RecursiveAstVisitor.prototype.visitLiteralMap = function (ast) { return this.visitAll(ast.values); };
    RecursiveAstVisitor.prototype.visitLiteralPrimitive = function (ast) { return null; };
    RecursiveAstVisitor.prototype.visitMethodCall = function (ast) {
        ast.receiver.visit(this);
        return this.visitAll(ast.args);
    };
    RecursiveAstVisitor.prototype.visitPrefixNot = function (ast) {
        ast.expression.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitPropertyRead = function (ast) {
        ast.receiver.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitPropertyWrite = function (ast) {
        ast.receiver.visit(this);
        ast.value.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitSafePropertyRead = function (ast) {
        ast.receiver.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitSafeMethodCall = function (ast) {
        ast.receiver.visit(this);
        return this.visitAll(ast.args);
    };
    RecursiveAstVisitor.prototype.visitAll = function (asts) {
        var _this = this;
        asts.forEach(function (ast) { return ast.visit(_this); });
        return null;
    };
    RecursiveAstVisitor.prototype.visitQuote = function (ast) { return null; };
    return RecursiveAstVisitor;
})();
exports.RecursiveAstVisitor = RecursiveAstVisitor;
var AstTransformer = (function () {
    function AstTransformer() {
    }
    AstTransformer.prototype.visitImplicitReceiver = function (ast) { return ast; };
    AstTransformer.prototype.visitInterpolation = function (ast) {
        return new Interpolation(ast.strings, this.visitAll(ast.expressions));
    };
    AstTransformer.prototype.visitLiteralPrimitive = function (ast) { return new LiteralPrimitive(ast.value); };
    AstTransformer.prototype.visitPropertyRead = function (ast) {
        return new PropertyRead(ast.receiver.visit(this), ast.name, ast.getter);
    };
    AstTransformer.prototype.visitPropertyWrite = function (ast) {
        return new PropertyWrite(ast.receiver.visit(this), ast.name, ast.setter, ast.value);
    };
    AstTransformer.prototype.visitSafePropertyRead = function (ast) {
        return new SafePropertyRead(ast.receiver.visit(this), ast.name, ast.getter);
    };
    AstTransformer.prototype.visitMethodCall = function (ast) {
        return new MethodCall(ast.receiver.visit(this), ast.name, ast.fn, this.visitAll(ast.args));
    };
    AstTransformer.prototype.visitSafeMethodCall = function (ast) {
        return new SafeMethodCall(ast.receiver.visit(this), ast.name, ast.fn, this.visitAll(ast.args));
    };
    AstTransformer.prototype.visitFunctionCall = function (ast) {
        return new FunctionCall(ast.target.visit(this), this.visitAll(ast.args));
    };
    AstTransformer.prototype.visitLiteralArray = function (ast) {
        return new LiteralArray(this.visitAll(ast.expressions));
    };
    AstTransformer.prototype.visitLiteralMap = function (ast) {
        return new LiteralMap(ast.keys, this.visitAll(ast.values));
    };
    AstTransformer.prototype.visitBinary = function (ast) {
        return new Binary(ast.operation, ast.left.visit(this), ast.right.visit(this));
    };
    AstTransformer.prototype.visitPrefixNot = function (ast) { return new PrefixNot(ast.expression.visit(this)); };
    AstTransformer.prototype.visitConditional = function (ast) {
        return new Conditional(ast.condition.visit(this), ast.trueExp.visit(this), ast.falseExp.visit(this));
    };
    AstTransformer.prototype.visitPipe = function (ast) {
        return new BindingPipe(ast.exp.visit(this), ast.name, this.visitAll(ast.args));
    };
    AstTransformer.prototype.visitKeyedRead = function (ast) {
        return new KeyedRead(ast.obj.visit(this), ast.key.visit(this));
    };
    AstTransformer.prototype.visitKeyedWrite = function (ast) {
        return new KeyedWrite(ast.obj.visit(this), ast.key.visit(this), ast.value.visit(this));
    };
    AstTransformer.prototype.visitAll = function (asts) {
        var res = collection_1.ListWrapper.createFixedSize(asts.length);
        for (var i = 0; i < asts.length; ++i) {
            res[i] = asts[i].visit(this);
        }
        return res;
    };
    AstTransformer.prototype.visitChain = function (ast) { return new Chain(this.visitAll(ast.expressions)); };
    AstTransformer.prototype.visitQuote = function (ast) {
        return new Quote(ast.prefix, ast.uninterpretedExpression, ast.location);
    };
    return AstTransformer;
})();
exports.AstTransformer = AstTransformer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9wYXJzZXIvYXN0LnRzIl0sIm5hbWVzIjpbIkFTVCIsIkFTVC5jb25zdHJ1Y3RvciIsIkFTVC52aXNpdCIsIkFTVC50b1N0cmluZyIsIlF1b3RlIiwiUXVvdGUuY29uc3RydWN0b3IiLCJRdW90ZS52aXNpdCIsIlF1b3RlLnRvU3RyaW5nIiwiRW1wdHlFeHByIiwiRW1wdHlFeHByLmNvbnN0cnVjdG9yIiwiRW1wdHlFeHByLnZpc2l0IiwiSW1wbGljaXRSZWNlaXZlciIsIkltcGxpY2l0UmVjZWl2ZXIuY29uc3RydWN0b3IiLCJJbXBsaWNpdFJlY2VpdmVyLnZpc2l0IiwiQ2hhaW4iLCJDaGFpbi5jb25zdHJ1Y3RvciIsIkNoYWluLnZpc2l0IiwiQ29uZGl0aW9uYWwiLCJDb25kaXRpb25hbC5jb25zdHJ1Y3RvciIsIkNvbmRpdGlvbmFsLnZpc2l0IiwiUHJvcGVydHlSZWFkIiwiUHJvcGVydHlSZWFkLmNvbnN0cnVjdG9yIiwiUHJvcGVydHlSZWFkLnZpc2l0IiwiUHJvcGVydHlXcml0ZSIsIlByb3BlcnR5V3JpdGUuY29uc3RydWN0b3IiLCJQcm9wZXJ0eVdyaXRlLnZpc2l0IiwiU2FmZVByb3BlcnR5UmVhZCIsIlNhZmVQcm9wZXJ0eVJlYWQuY29uc3RydWN0b3IiLCJTYWZlUHJvcGVydHlSZWFkLnZpc2l0IiwiS2V5ZWRSZWFkIiwiS2V5ZWRSZWFkLmNvbnN0cnVjdG9yIiwiS2V5ZWRSZWFkLnZpc2l0IiwiS2V5ZWRXcml0ZSIsIktleWVkV3JpdGUuY29uc3RydWN0b3IiLCJLZXllZFdyaXRlLnZpc2l0IiwiQmluZGluZ1BpcGUiLCJCaW5kaW5nUGlwZS5jb25zdHJ1Y3RvciIsIkJpbmRpbmdQaXBlLnZpc2l0IiwiTGl0ZXJhbFByaW1pdGl2ZSIsIkxpdGVyYWxQcmltaXRpdmUuY29uc3RydWN0b3IiLCJMaXRlcmFsUHJpbWl0aXZlLnZpc2l0IiwiTGl0ZXJhbEFycmF5IiwiTGl0ZXJhbEFycmF5LmNvbnN0cnVjdG9yIiwiTGl0ZXJhbEFycmF5LnZpc2l0IiwiTGl0ZXJhbE1hcCIsIkxpdGVyYWxNYXAuY29uc3RydWN0b3IiLCJMaXRlcmFsTWFwLnZpc2l0IiwiSW50ZXJwb2xhdGlvbiIsIkludGVycG9sYXRpb24uY29uc3RydWN0b3IiLCJJbnRlcnBvbGF0aW9uLnZpc2l0IiwiQmluYXJ5IiwiQmluYXJ5LmNvbnN0cnVjdG9yIiwiQmluYXJ5LnZpc2l0IiwiUHJlZml4Tm90IiwiUHJlZml4Tm90LmNvbnN0cnVjdG9yIiwiUHJlZml4Tm90LnZpc2l0IiwiTWV0aG9kQ2FsbCIsIk1ldGhvZENhbGwuY29uc3RydWN0b3IiLCJNZXRob2RDYWxsLnZpc2l0IiwiU2FmZU1ldGhvZENhbGwiLCJTYWZlTWV0aG9kQ2FsbC5jb25zdHJ1Y3RvciIsIlNhZmVNZXRob2RDYWxsLnZpc2l0IiwiRnVuY3Rpb25DYWxsIiwiRnVuY3Rpb25DYWxsLmNvbnN0cnVjdG9yIiwiRnVuY3Rpb25DYWxsLnZpc2l0IiwiQVNUV2l0aFNvdXJjZSIsIkFTVFdpdGhTb3VyY2UuY29uc3RydWN0b3IiLCJBU1RXaXRoU291cmNlLnZpc2l0IiwiQVNUV2l0aFNvdXJjZS50b1N0cmluZyIsIlRlbXBsYXRlQmluZGluZyIsIlRlbXBsYXRlQmluZGluZy5jb25zdHJ1Y3RvciIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IiLCJSZWN1cnNpdmVBc3RWaXNpdG9yLmNvbnN0cnVjdG9yIiwiUmVjdXJzaXZlQXN0VmlzaXRvci52aXNpdEJpbmFyeSIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IudmlzaXRDaGFpbiIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IudmlzaXRDb25kaXRpb25hbCIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IudmlzaXRQaXBlIiwiUmVjdXJzaXZlQXN0VmlzaXRvci52aXNpdEZ1bmN0aW9uQ2FsbCIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IudmlzaXRJbXBsaWNpdFJlY2VpdmVyIiwiUmVjdXJzaXZlQXN0VmlzaXRvci52aXNpdEludGVycG9sYXRpb24iLCJSZWN1cnNpdmVBc3RWaXNpdG9yLnZpc2l0S2V5ZWRSZWFkIiwiUmVjdXJzaXZlQXN0VmlzaXRvci52aXNpdEtleWVkV3JpdGUiLCJSZWN1cnNpdmVBc3RWaXNpdG9yLnZpc2l0TGl0ZXJhbEFycmF5IiwiUmVjdXJzaXZlQXN0VmlzaXRvci52aXNpdExpdGVyYWxNYXAiLCJSZWN1cnNpdmVBc3RWaXNpdG9yLnZpc2l0TGl0ZXJhbFByaW1pdGl2ZSIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IudmlzaXRNZXRob2RDYWxsIiwiUmVjdXJzaXZlQXN0VmlzaXRvci52aXNpdFByZWZpeE5vdCIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IudmlzaXRQcm9wZXJ0eVJlYWQiLCJSZWN1cnNpdmVBc3RWaXNpdG9yLnZpc2l0UHJvcGVydHlXcml0ZSIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IudmlzaXRTYWZlUHJvcGVydHlSZWFkIiwiUmVjdXJzaXZlQXN0VmlzaXRvci52aXNpdFNhZmVNZXRob2RDYWxsIiwiUmVjdXJzaXZlQXN0VmlzaXRvci52aXNpdEFsbCIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IudmlzaXRRdW90ZSIsIkFzdFRyYW5zZm9ybWVyIiwiQXN0VHJhbnNmb3JtZXIuY29uc3RydWN0b3IiLCJBc3RUcmFuc2Zvcm1lci52aXNpdEltcGxpY2l0UmVjZWl2ZXIiLCJBc3RUcmFuc2Zvcm1lci52aXNpdEludGVycG9sYXRpb24iLCJBc3RUcmFuc2Zvcm1lci52aXNpdExpdGVyYWxQcmltaXRpdmUiLCJBc3RUcmFuc2Zvcm1lci52aXNpdFByb3BlcnR5UmVhZCIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0UHJvcGVydHlXcml0ZSIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0U2FmZVByb3BlcnR5UmVhZCIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0TWV0aG9kQ2FsbCIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0U2FmZU1ldGhvZENhbGwiLCJBc3RUcmFuc2Zvcm1lci52aXNpdEZ1bmN0aW9uQ2FsbCIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0TGl0ZXJhbEFycmF5IiwiQXN0VHJhbnNmb3JtZXIudmlzaXRMaXRlcmFsTWFwIiwiQXN0VHJhbnNmb3JtZXIudmlzaXRCaW5hcnkiLCJBc3RUcmFuc2Zvcm1lci52aXNpdFByZWZpeE5vdCIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0Q29uZGl0aW9uYWwiLCJBc3RUcmFuc2Zvcm1lci52aXNpdFBpcGUiLCJBc3RUcmFuc2Zvcm1lci52aXNpdEtleWVkUmVhZCIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0S2V5ZWRXcml0ZSIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0QWxsIiwiQXN0VHJhbnNmb3JtZXIudmlzaXRDaGFpbiIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0UXVvdGUiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFFM0Q7SUFBQUE7SUFHQUMsQ0FBQ0E7SUFGQ0QsbUJBQUtBLEdBQUxBLFVBQU1BLE9BQW1CQSxJQUFTRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNoREYsc0JBQVFBLEdBQVJBLGNBQXFCRyxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN0Q0gsVUFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxJQUdDO0FBSFksV0FBRyxNQUdmLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSDtJQUEyQkkseUJBQUdBO0lBQzVCQSxlQUFtQkEsTUFBY0EsRUFBU0EsdUJBQStCQSxFQUFTQSxRQUFhQTtRQUM3RkMsaUJBQU9BLENBQUNBO1FBRFNBLFdBQU1BLEdBQU5BLE1BQU1BLENBQVFBO1FBQVNBLDRCQUF1QkEsR0FBdkJBLHVCQUF1QkEsQ0FBUUE7UUFBU0EsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBS0E7SUFFL0ZBLENBQUNBO0lBQ0RELHFCQUFLQSxHQUFMQSxVQUFNQSxPQUFtQkEsSUFBU0UsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBVUEs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QSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxJQUFJQSxFQUFFQSxHQUFHQSxDQUFDQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNqR0EsQ0FBQ0E7SUFFRFQsMENBQWlCQSxHQUFqQkEsVUFBa0JBLEdBQWlCQTtRQUNqQ1UsTUFBTUEsQ0FBQ0EsSUFBSUEsWUFBWUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDM0VBLENBQUNBO0lBRURWLDBDQUFpQkEsR0FBakJBLFVBQWtCQSxHQUFpQkE7UUFDakNXLE1BQU1BLENBQUNBLElBQUlBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO0lBQzFEQSxDQUFDQTtJQUVEWCx3Q0FBZUEsR0FBZkEsVUFBZ0JBLEdBQWVBO1FBQzdCWSxNQUFNQSxDQUFDQSxJQUFJQSxVQUFVQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM3REEsQ0FBQ0E7SUFFRFosb0NBQVdBLEdBQVhBLFVBQVlBLEdBQVdBO1FBQ3JCYSxNQUFNQSxDQUFDQSxJQUFJQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxFQUFFQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJ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QTZFQztBQTdFWSxzQkFBYyxpQkE2RTFCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBBU1Qge1xuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yKTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIFwiQVNUXCI7IH1cbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgcXVvdGVkIGV4cHJlc3Npb24gb2YgdGhlIGZvcm06XG4gKlxuICogcXVvdGUgPSBwcmVmaXggYDpgIHVuaW50ZXJwcmV0ZWRFeHByZXNzaW9uXG4gKiBwcmVmaXggPSBpZGVudGlmaWVyXG4gKiB1bmludGVycHJldGVkRXhwcmVzc2lvbiA9IGFyYml0cmFyeSBzdHJpbmdcbiAqXG4gKiBBIHF1b3RlZCBleHByZXNzaW9uIGlzIG1lYW50IHRvIGJlIHByZS1wcm9jZXNzZWQgYnkgYW4gQVNUIHRyYW5zZm9ybWVyIHRoYXRcbiAqIGNvbnZlcnRzIGl0IGludG8gYW5vdGhlciBBU1QgdGhhdCBubyBsb25nZXIgY29udGFpbnMgcXVvdGVkIGV4cHJlc3Npb25zLlxuICogSXQgaXMgbWVhbnQgdG8gYWxsb3cgdGhpcmQtcGFydHkgZGV2ZWxvcGVycyB0byBleHRlbmQgQW5ndWxhciB0ZW1wbGF0ZVxuICogZXhwcmVzc2lvbiBsYW5ndWFnZS4gVGhlIGB1bmludGVycHJldGVkRXhwcmVzc2lvbmAgcGFydCBvZiB0aGUgcXVvdGUgaXNcbiAqIHRoZXJlZm9yZSBub3QgaW50ZXJwcmV0ZWQgYnkgdGhlIEFuZ3VsYXIncyBvd24gZXhwcmVzc2lvbiBwYXJzZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBRdW90ZSBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwcmVmaXg6IHN0cmluZywgcHVibGljIHVuaW50ZXJwcmV0ZWRFeHByZXNzaW9uOiBzdHJpbmcsIHB1YmxpYyBsb2NhdGlvbjogYW55KSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yKTogYW55IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRRdW90ZSh0aGlzKTsgfVxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gXCJRdW90ZVwiOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBFbXB0eUV4cHIgZXh0ZW5kcyBBU1Qge1xuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yKSB7XG4gICAgLy8gZG8gbm90aGluZ1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbXBsaWNpdFJlY2VpdmVyIGV4dGVuZHMgQVNUIHtcbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvcik6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0SW1wbGljaXRSZWNlaXZlcih0aGlzKTsgfVxufVxuXG4vKipcbiAqIE11bHRpcGxlIGV4cHJlc3Npb25zIHNlcGFyYXRlZCBieSBhIHNlbWljb2xvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIENoYWluIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIGV4cHJlc3Npb25zOiBhbnlbXSkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdENoYWluKHRoaXMpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb25kaXRpb25hbCBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb25kaXRpb246IEFTVCwgcHVibGljIHRydWVFeHA6IEFTVCwgcHVibGljIGZhbHNlRXhwOiBBU1QpIHsgc3VwZXIoKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yKTogYW55IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRDb25kaXRpb25hbCh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJvcGVydHlSZWFkIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlY2VpdmVyOiBBU1QsIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBnZXR0ZXI6IEZ1bmN0aW9uKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvcik6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0UHJvcGVydHlSZWFkKHRoaXMpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eVdyaXRlIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlY2VpdmVyOiBBU1QsIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBzZXR0ZXI6IEZ1bmN0aW9uLFxuICAgICAgICAgICAgICBwdWJsaWMgdmFsdWU6IEFTVCkge1xuICAgIHN1cGVyKCk7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvcik6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0UHJvcGVydHlXcml0ZSh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgU2FmZVByb3BlcnR5UmVhZCBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWNlaXZlcjogQVNULCBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgZ2V0dGVyOiBGdW5jdGlvbikgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdFNhZmVQcm9wZXJ0eVJlYWQodGhpcyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIEtleWVkUmVhZCBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBvYmo6IEFTVCwgcHVibGljIGtleTogQVNUKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvcik6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0S2V5ZWRSZWFkKHRoaXMpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBLZXllZFdyaXRlIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIG9iajogQVNULCBwdWJsaWMga2V5OiBBU1QsIHB1YmxpYyB2YWx1ZTogQVNUKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvcik6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0S2V5ZWRXcml0ZSh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQmluZGluZ1BpcGUgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXhwOiBBU1QsIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBhcmdzOiBhbnlbXSkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdFBpcGUodGhpcyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIExpdGVyYWxQcmltaXRpdmUgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsdWUpIHsgc3VwZXIoKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yKTogYW55IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRMaXRlcmFsUHJpbWl0aXZlKHRoaXMpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBMaXRlcmFsQXJyYXkgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXhwcmVzc2lvbnM6IGFueVtdKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvcik6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0TGl0ZXJhbEFycmF5KHRoaXMpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBMaXRlcmFsTWFwIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIGtleXM6IGFueVtdLCBwdWJsaWMgdmFsdWVzOiBhbnlbXSkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdExpdGVyYWxNYXAodGhpcyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIEludGVycG9sYXRpb24gZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc3RyaW5nczogYW55W10sIHB1YmxpYyBleHByZXNzaW9uczogYW55W10pIHsgc3VwZXIoKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yKTogYW55IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRJbnRlcnBvbGF0aW9uKHRoaXMpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBCaW5hcnkgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgb3BlcmF0aW9uOiBzdHJpbmcsIHB1YmxpYyBsZWZ0OiBBU1QsIHB1YmxpYyByaWdodDogQVNUKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvcik6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0QmluYXJ5KHRoaXMpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBQcmVmaXhOb3QgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXhwcmVzc2lvbjogQVNUKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvcik6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0UHJlZml4Tm90KHRoaXMpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBNZXRob2RDYWxsIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlY2VpdmVyOiBBU1QsIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBmbjogRnVuY3Rpb24sIHB1YmxpYyBhcmdzOiBhbnlbXSkge1xuICAgIHN1cGVyKCk7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvcik6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0TWV0aG9kQ2FsbCh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgU2FmZU1ldGhvZENhbGwgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVjZWl2ZXI6IEFTVCwgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIGZuOiBGdW5jdGlvbiwgcHVibGljIGFyZ3M6IGFueVtdKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yKTogYW55IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRTYWZlTWV0aG9kQ2FsbCh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgRnVuY3Rpb25DYWxsIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHRhcmdldDogQVNULCBwdWJsaWMgYXJnczogYW55W10pIHsgc3VwZXIoKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yKTogYW55IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRGdW5jdGlvbkNhbGwodGhpcyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIEFTVFdpdGhTb3VyY2UgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgYXN0OiBBU1QsIHB1YmxpYyBzb3VyY2U6IHN0cmluZywgcHVibGljIGxvY2F0aW9uOiBzdHJpbmcpIHsgc3VwZXIoKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yKTogYW55IHsgcmV0dXJuIHRoaXMuYXN0LnZpc2l0KHZpc2l0b3IpOyB9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgJHt0aGlzLnNvdXJjZX0gaW4gJHt0aGlzLmxvY2F0aW9ufWA7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlQmluZGluZyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBrZXk6IHN0cmluZywgcHVibGljIGtleUlzVmFyOiBib29sZWFuLCBwdWJsaWMgbmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICBwdWJsaWMgZXhwcmVzc2lvbjogQVNUV2l0aFNvdXJjZSkge31cbn1cblxuZXhwb3J0IGludGVyZmFjZSBBc3RWaXNpdG9yIHtcbiAgdmlzaXRCaW5hcnkoYXN0OiBCaW5hcnkpOiBhbnk7XG4gIHZpc2l0Q2hhaW4oYXN0OiBDaGFpbik6IGFueTtcbiAgdmlzaXRDb25kaXRpb25hbChhc3Q6IENvbmRpdGlvbmFsKTogYW55O1xuICB2aXNpdEZ1bmN0aW9uQ2FsbChhc3Q6IEZ1bmN0aW9uQ2FsbCk6IGFueTtcbiAgdmlzaXRJbXBsaWNpdFJlY2VpdmVyKGFzdDogSW1wbGljaXRSZWNlaXZlcik6IGFueTtcbiAgdmlzaXRJbnRlcnBvbGF0aW9uKGFzdDogSW50ZXJwb2xhdGlvbik6IGFueTtcbiAgdmlzaXRLZXllZFJlYWQoYXN0OiBLZXllZFJlYWQpOiBhbnk7XG4gIHZpc2l0S2V5ZWRXcml0ZShhc3Q6IEtleWVkV3JpdGUpOiBhbnk7XG4gIHZpc2l0TGl0ZXJhbEFycmF5KGFzdDogTGl0ZXJhbEFycmF5KTogYW55O1xuICB2aXNpdExpdGVyYWxNYXAoYXN0OiBMaXRlcmFsTWFwKTogYW55O1xuICB2aXNpdExpdGVyYWxQcmltaXRpdmUoYXN0OiBMaXRlcmFsUHJpbWl0aXZlKTogYW55O1xuICB2aXNpdE1ldGhvZENhbGwoYXN0OiBNZXRob2RDYWxsKTogYW55O1xuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSk6IGFueTtcbiAgdmlzaXRQcmVmaXhOb3QoYXN0OiBQcmVmaXhOb3QpOiBhbnk7XG4gIHZpc2l0UHJvcGVydHlSZWFkKGFzdDogUHJvcGVydHlSZWFkKTogYW55O1xuICB2aXNpdFByb3BlcnR5V3JpdGUoYXN0OiBQcm9wZXJ0eVdyaXRlKTogYW55O1xuICB2aXNpdFF1b3RlKGFzdDogUXVvdGUpOiBhbnk7XG4gIHZpc2l0U2FmZU1ldGhvZENhbGwoYXN0OiBTYWZlTWV0aG9kQ2FsbCk6IGFueTtcbiAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdDogU2FmZVByb3BlcnR5UmVhZCk6IGFueTtcbn1cblxuZXhwb3J0IGNsYXNzIFJlY3Vyc2l2ZUFzdFZpc2l0b3IgaW1wbGVtZW50cyBBc3RWaXNpdG9yIHtcbiAgdmlzaXRCaW5hcnkoYXN0OiBCaW5hcnkpOiBhbnkge1xuICAgIGFzdC5sZWZ0LnZpc2l0KHRoaXMpO1xuICAgIGFzdC5yaWdodC52aXNpdCh0aGlzKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdENoYWluKGFzdDogQ2hhaW4pOiBhbnkgeyByZXR1cm4gdGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMpOyB9XG4gIHZpc2l0Q29uZGl0aW9uYWwoYXN0OiBDb25kaXRpb25hbCk6IGFueSB7XG4gICAgYXN0LmNvbmRpdGlvbi52aXNpdCh0aGlzKTtcbiAgICBhc3QudHJ1ZUV4cC52aXNpdCh0aGlzKTtcbiAgICBhc3QuZmFsc2VFeHAudmlzaXQodGhpcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRQaXBlKGFzdDogQmluZGluZ1BpcGUpOiBhbnkge1xuICAgIGFzdC5leHAudmlzaXQodGhpcyk7XG4gICAgdGhpcy52aXNpdEFsbChhc3QuYXJncyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRGdW5jdGlvbkNhbGwoYXN0OiBGdW5jdGlvbkNhbGwpOiBhbnkge1xuICAgIGFzdC50YXJnZXQudmlzaXQodGhpcyk7XG4gICAgdGhpcy52aXNpdEFsbChhc3QuYXJncyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRJbXBsaWNpdFJlY2VpdmVyKGFzdDogSW1wbGljaXRSZWNlaXZlcik6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IEludGVycG9sYXRpb24pOiBhbnkgeyByZXR1cm4gdGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMpOyB9XG4gIHZpc2l0S2V5ZWRSZWFkKGFzdDogS2V5ZWRSZWFkKTogYW55IHtcbiAgICBhc3Qub2JqLnZpc2l0KHRoaXMpO1xuICAgIGFzdC5rZXkudmlzaXQodGhpcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRLZXllZFdyaXRlKGFzdDogS2V5ZWRXcml0ZSk6IGFueSB7XG4gICAgYXN0Lm9iai52aXNpdCh0aGlzKTtcbiAgICBhc3Qua2V5LnZpc2l0KHRoaXMpO1xuICAgIGFzdC52YWx1ZS52aXNpdCh0aGlzKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdExpdGVyYWxBcnJheShhc3Q6IExpdGVyYWxBcnJheSk6IGFueSB7IHJldHVybiB0aGlzLnZpc2l0QWxsKGFzdC5leHByZXNzaW9ucyk7IH1cbiAgdmlzaXRMaXRlcmFsTWFwKGFzdDogTGl0ZXJhbE1hcCk6IGFueSB7IHJldHVybiB0aGlzLnZpc2l0QWxsKGFzdC52YWx1ZXMpOyB9XG4gIHZpc2l0TGl0ZXJhbFByaW1pdGl2ZShhc3Q6IExpdGVyYWxQcmltaXRpdmUpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdE1ldGhvZENhbGwoYXN0OiBNZXRob2RDYWxsKTogYW55IHtcbiAgICBhc3QucmVjZWl2ZXIudmlzaXQodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRBbGwoYXN0LmFyZ3MpO1xuICB9XG4gIHZpc2l0UHJlZml4Tm90KGFzdDogUHJlZml4Tm90KTogYW55IHtcbiAgICBhc3QuZXhwcmVzc2lvbi52aXNpdCh0aGlzKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IFByb3BlcnR5UmVhZCk6IGFueSB7XG4gICAgYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0UHJvcGVydHlXcml0ZShhc3Q6IFByb3BlcnR5V3JpdGUpOiBhbnkge1xuICAgIGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKTtcbiAgICBhc3QudmFsdWUudmlzaXQodGhpcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdDogU2FmZVByb3BlcnR5UmVhZCk6IGFueSB7XG4gICAgYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0U2FmZU1ldGhvZENhbGwoYXN0OiBTYWZlTWV0aG9kQ2FsbCk6IGFueSB7XG4gICAgYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpO1xuICAgIHJldHVybiB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzKTtcbiAgfVxuICB2aXNpdEFsbChhc3RzOiBBU1RbXSk6IGFueSB7XG4gICAgYXN0cy5mb3JFYWNoKGFzdCA9PiBhc3QudmlzaXQodGhpcykpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0UXVvdGUoYXN0OiBRdW90ZSk6IGFueSB7IHJldHVybiBudWxsOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBBc3RUcmFuc2Zvcm1lciBpbXBsZW1lbnRzIEFzdFZpc2l0b3Ige1xuICB2aXNpdEltcGxpY2l0UmVjZWl2ZXIoYXN0OiBJbXBsaWNpdFJlY2VpdmVyKTogQVNUIHsgcmV0dXJuIGFzdDsgfVxuXG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IEludGVycG9sYXRpb24pOiBBU1Qge1xuICAgIHJldHVybiBuZXcgSW50ZXJwb2xhdGlvbihhc3Quc3RyaW5ncywgdGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMpKTtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbFByaW1pdGl2ZShhc3Q6IExpdGVyYWxQcmltaXRpdmUpOiBBU1QgeyByZXR1cm4gbmV3IExpdGVyYWxQcmltaXRpdmUoYXN0LnZhbHVlKTsgfVxuXG4gIHZpc2l0UHJvcGVydHlSZWFkKGFzdDogUHJvcGVydHlSZWFkKTogQVNUIHtcbiAgICByZXR1cm4gbmV3IFByb3BlcnR5UmVhZChhc3QucmVjZWl2ZXIudmlzaXQodGhpcyksIGFzdC5uYW1lLCBhc3QuZ2V0dGVyKTtcbiAgfVxuXG4gIHZpc2l0UHJvcGVydHlXcml0ZShhc3Q6IFByb3BlcnR5V3JpdGUpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgUHJvcGVydHlXcml0ZShhc3QucmVjZWl2ZXIudmlzaXQodGhpcyksIGFzdC5uYW1lLCBhc3Quc2V0dGVyLCBhc3QudmFsdWUpO1xuICB9XG5cbiAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdDogU2FmZVByb3BlcnR5UmVhZCk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBTYWZlUHJvcGVydHlSZWFkKGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKSwgYXN0Lm5hbWUsIGFzdC5nZXR0ZXIpO1xuICB9XG5cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBNZXRob2RDYWxsKGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKSwgYXN0Lm5hbWUsIGFzdC5mbiwgdGhpcy52aXNpdEFsbChhc3QuYXJncykpO1xuICB9XG5cbiAgdmlzaXRTYWZlTWV0aG9kQ2FsbChhc3Q6IFNhZmVNZXRob2RDYWxsKTogQVNUIHtcbiAgICByZXR1cm4gbmV3IFNhZmVNZXRob2RDYWxsKGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKSwgYXN0Lm5hbWUsIGFzdC5mbiwgdGhpcy52aXNpdEFsbChhc3QuYXJncykpO1xuICB9XG5cbiAgdmlzaXRGdW5jdGlvbkNhbGwoYXN0OiBGdW5jdGlvbkNhbGwpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgRnVuY3Rpb25DYWxsKGFzdC50YXJnZXQudmlzaXQodGhpcyksIHRoaXMudmlzaXRBbGwoYXN0LmFyZ3MpKTtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbEFycmF5KGFzdDogTGl0ZXJhbEFycmF5KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IExpdGVyYWxBcnJheSh0aGlzLnZpc2l0QWxsKGFzdC5leHByZXNzaW9ucykpO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsTWFwKGFzdDogTGl0ZXJhbE1hcCk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBMaXRlcmFsTWFwKGFzdC5rZXlzLCB0aGlzLnZpc2l0QWxsKGFzdC52YWx1ZXMpKTtcbiAgfVxuXG4gIHZpc2l0QmluYXJ5KGFzdDogQmluYXJ5KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEJpbmFyeShhc3Qub3BlcmF0aW9uLCBhc3QubGVmdC52aXNpdCh0aGlzKSwgYXN0LnJpZ2h0LnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHZpc2l0UHJlZml4Tm90KGFzdDogUHJlZml4Tm90KTogQVNUIHsgcmV0dXJuIG5ldyBQcmVmaXhOb3QoYXN0LmV4cHJlc3Npb24udmlzaXQodGhpcykpOyB9XG5cbiAgdmlzaXRDb25kaXRpb25hbChhc3Q6IENvbmRpdGlvbmFsKTogQVNUIHtcbiAgICByZXR1cm4gbmV3IENvbmRpdGlvbmFsKGFzdC5jb25kaXRpb24udmlzaXQodGhpcyksIGFzdC50cnVlRXhwLnZpc2l0KHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0LmZhbHNlRXhwLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHZpc2l0UGlwZShhc3Q6IEJpbmRpbmdQaXBlKTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEJpbmRpbmdQaXBlKGFzdC5leHAudmlzaXQodGhpcyksIGFzdC5uYW1lLCB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzKSk7XG4gIH1cblxuICB2aXNpdEtleWVkUmVhZChhc3Q6IEtleWVkUmVhZCk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBLZXllZFJlYWQoYXN0Lm9iai52aXNpdCh0aGlzKSwgYXN0LmtleS52aXNpdCh0aGlzKSk7XG4gIH1cblxuICB2aXNpdEtleWVkV3JpdGUoYXN0OiBLZXllZFdyaXRlKTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEtleWVkV3JpdGUoYXN0Lm9iai52aXNpdCh0aGlzKSwgYXN0LmtleS52aXNpdCh0aGlzKSwgYXN0LnZhbHVlLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHZpc2l0QWxsKGFzdHM6IGFueVtdKTogYW55W10ge1xuICAgIHZhciByZXMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUoYXN0cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXN0cy5sZW5ndGg7ICsraSkge1xuICAgICAgcmVzW2ldID0gYXN0c1tpXS52aXNpdCh0aGlzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIHZpc2l0Q2hhaW4oYXN0OiBDaGFpbik6IEFTVCB7IHJldHVybiBuZXcgQ2hhaW4odGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMpKTsgfVxuXG4gIHZpc2l0UXVvdGUoYXN0OiBRdW90ZSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBRdW90ZShhc3QucHJlZml4LCBhc3QudW5pbnRlcnByZXRlZEV4cHJlc3Npb24sIGFzdC5sb2NhdGlvbik7XG4gIH1cbn1cbiJdfQ==