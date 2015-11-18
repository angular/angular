var ast_1 = require('angular2/src/core/change_detection/parser/ast');
var lang_1 = require('angular2/src/facade/lang');
var Unparser = (function () {
    function Unparser() {
    }
    Unparser.prototype.unparse = function (ast) {
        this._expression = '';
        this._visit(ast);
        return this._expression;
    };
    Unparser.prototype.visitPropertyRead = function (ast) {
        this._visit(ast.receiver);
        this._expression += ast.receiver instanceof ast_1.ImplicitReceiver ? "" + ast.name : "." + ast.name;
    };
    Unparser.prototype.visitPropertyWrite = function (ast) {
        this._visit(ast.receiver);
        this._expression +=
            ast.receiver instanceof ast_1.ImplicitReceiver ? ast.name + " = " : "." + ast.name + " = ";
        this._visit(ast.value);
    };
    Unparser.prototype.visitBinary = function (ast) {
        this._visit(ast.left);
        this._expression += " " + ast.operation + " ";
        this._visit(ast.right);
    };
    Unparser.prototype.visitChain = function (ast) {
        var len = ast.expressions.length;
        for (var i = 0; i < len; i++) {
            this._visit(ast.expressions[i]);
            this._expression += i == len - 1 ? ';' : '; ';
        }
    };
    Unparser.prototype.visitConditional = function (ast) {
        this._visit(ast.condition);
        this._expression += ' ? ';
        this._visit(ast.trueExp);
        this._expression += ' : ';
        this._visit(ast.falseExp);
    };
    Unparser.prototype.visitPipe = function (ast) {
        var _this = this;
        this._expression += '(';
        this._visit(ast.exp);
        this._expression += " | " + ast.name;
        ast.args.forEach(function (arg) {
            _this._expression += ':';
            _this._visit(arg);
        });
        this._expression += ')';
    };
    Unparser.prototype.visitFunctionCall = function (ast) {
        var _this = this;
        this._visit(ast.target);
        this._expression += '(';
        var isFirst = true;
        ast.args.forEach(function (arg) {
            if (!isFirst)
                _this._expression += ', ';
            isFirst = false;
            _this._visit(arg);
        });
        this._expression += ')';
    };
    Unparser.prototype.visitImplicitReceiver = function (ast) { };
    Unparser.prototype.visitInterpolation = function (ast) {
        for (var i = 0; i < ast.strings.length; i++) {
            this._expression += ast.strings[i];
            if (i < ast.expressions.length) {
                this._expression += '{{ ';
                this._visit(ast.expressions[i]);
                this._expression += ' }}';
            }
        }
    };
    Unparser.prototype.visitKeyedRead = function (ast) {
        this._visit(ast.obj);
        this._expression += '[';
        this._visit(ast.key);
        this._expression += ']';
    };
    Unparser.prototype.visitKeyedWrite = function (ast) {
        this._visit(ast.obj);
        this._expression += '[';
        this._visit(ast.key);
        this._expression += '] = ';
        this._visit(ast.value);
    };
    Unparser.prototype.visitLiteralArray = function (ast) {
        var _this = this;
        this._expression += '[';
        var isFirst = true;
        ast.expressions.forEach(function (expression) {
            if (!isFirst)
                _this._expression += ', ';
            isFirst = false;
            _this._visit(expression);
        });
        this._expression += ']';
    };
    Unparser.prototype.visitLiteralMap = function (ast) {
        this._expression += '{';
        var isFirst = true;
        for (var i = 0; i < ast.keys.length; i++) {
            if (!isFirst)
                this._expression += ', ';
            isFirst = false;
            this._expression += ast.keys[i] + ": ";
            this._visit(ast.values[i]);
        }
        this._expression += '}';
    };
    Unparser.prototype.visitLiteralPrimitive = function (ast) {
        if (lang_1.isString(ast.value)) {
            this._expression += "\"" + lang_1.StringWrapper.replaceAll(ast.value, Unparser._quoteRegExp, '\"') + "\"";
        }
        else {
            this._expression += "" + ast.value;
        }
    };
    Unparser.prototype.visitMethodCall = function (ast) {
        var _this = this;
        this._visit(ast.receiver);
        this._expression += ast.receiver instanceof ast_1.ImplicitReceiver ? ast.name + "(" : "." + ast.name + "(";
        var isFirst = true;
        ast.args.forEach(function (arg) {
            if (!isFirst)
                _this._expression += ', ';
            isFirst = false;
            _this._visit(arg);
        });
        this._expression += ')';
    };
    Unparser.prototype.visitPrefixNot = function (ast) {
        this._expression += '!';
        this._visit(ast.expression);
    };
    Unparser.prototype.visitSafePropertyRead = function (ast) {
        this._visit(ast.receiver);
        this._expression += "?." + ast.name;
    };
    Unparser.prototype.visitSafeMethodCall = function (ast) {
        var _this = this;
        this._visit(ast.receiver);
        this._expression += "?." + ast.name + "(";
        var isFirst = true;
        ast.args.forEach(function (arg) {
            if (!isFirst)
                _this._expression += ', ';
            isFirst = false;
            _this._visit(arg);
        });
        this._expression += ')';
    };
    Unparser.prototype._visit = function (ast) { ast.visit(this); };
    Unparser._quoteRegExp = /"/g;
    return Unparser;
})();
exports.Unparser = Unparser;
//# sourceMappingURL=unparser.js.map