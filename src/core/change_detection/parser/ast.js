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
    Interpolation.prototype.visit = function (visitor) { visitor.visitInterpolation(this); };
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
    AstTransformer.prototype.visitLiteralPrimitive = function (ast) {
        return new LiteralPrimitive(ast.value);
    };
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
    return AstTransformer;
})();
exports.AstTransformer = AstTransformer;
//# sourceMappingURL=ast.js.map