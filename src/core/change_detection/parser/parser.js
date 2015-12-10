'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var decorators_1 = require('angular2/src/core/di/decorators');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var lexer_1 = require('./lexer');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var ast_1 = require('./ast');
var _implicitReceiver = new ast_1.ImplicitReceiver();
// TODO(tbosch): Cannot make this const/final right now because of the transpiler...
var INTERPOLATION_REGEXP = /\{\{(.*?)\}\}/g;
var ParseException = (function (_super) {
    __extends(ParseException, _super);
    function ParseException(message, input, errLocation, ctxLocation) {
        _super.call(this, "Parser Error: " + message + " " + errLocation + " [" + input + "] in " + ctxLocation);
    }
    return ParseException;
})(exceptions_1.BaseException);
var Parser = (function () {
    function Parser(/** @internal */ _lexer, providedReflector) {
        if (providedReflector === void 0) { providedReflector = null; }
        this._lexer = _lexer;
        this._reflector = lang_1.isPresent(providedReflector) ? providedReflector : reflection_1.reflector;
    }
    Parser.prototype.parseAction = function (input, location) {
        this._checkNoInterpolation(input, location);
        var tokens = this._lexer.tokenize(input);
        var ast = new _ParseAST(input, location, tokens, this._reflector, true).parseChain();
        return new ast_1.ASTWithSource(ast, input, location);
    };
    Parser.prototype.parseBinding = function (input, location) {
        var ast = this._parseBindingAst(input, location);
        return new ast_1.ASTWithSource(ast, input, location);
    };
    Parser.prototype.parseSimpleBinding = function (input, location) {
        var ast = this._parseBindingAst(input, location);
        if (!SimpleExpressionChecker.check(ast)) {
            throw new ParseException('Host binding expression can only contain field access and constants', input, location);
        }
        return new ast_1.ASTWithSource(ast, input, location);
    };
    Parser.prototype._parseBindingAst = function (input, location) {
        // Quotes expressions use 3rd-party expression language. We don't want to use
        // our lexer or parser for that, so we check for that ahead of time.
        var quote = this._parseQuote(input, location);
        if (lang_1.isPresent(quote)) {
            return quote;
        }
        this._checkNoInterpolation(input, location);
        var tokens = this._lexer.tokenize(input);
        return new _ParseAST(input, location, tokens, this._reflector, false).parseChain();
    };
    Parser.prototype._parseQuote = function (input, location) {
        if (lang_1.isBlank(input))
            return null;
        var prefixSeparatorIndex = input.indexOf(':');
        if (prefixSeparatorIndex == -1)
            return null;
        var prefix = input.substring(0, prefixSeparatorIndex).trim();
        if (!lexer_1.isIdentifier(prefix))
            return null;
        var uninterpretedExpression = input.substring(prefixSeparatorIndex + 1);
        return new ast_1.Quote(prefix, uninterpretedExpression, location);
    };
    Parser.prototype.parseTemplateBindings = function (input, location) {
        var tokens = this._lexer.tokenize(input);
        return new _ParseAST(input, location, tokens, this._reflector, false).parseTemplateBindings();
    };
    Parser.prototype.parseInterpolation = function (input, location) {
        var parts = lang_1.StringWrapper.split(input, INTERPOLATION_REGEXP);
        if (parts.length <= 1) {
            return null;
        }
        var strings = [];
        var expressions = [];
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (i % 2 === 0) {
                // fixed string
                strings.push(part);
            }
            else if (part.trim().length > 0) {
                var tokens = this._lexer.tokenize(part);
                var ast = new _ParseAST(input, location, tokens, this._reflector, false).parseChain();
                expressions.push(ast);
            }
            else {
                throw new ParseException('Blank expressions are not allowed in interpolated strings', input, "at column " + this._findInterpolationErrorColumn(parts, i) + " in", location);
            }
        }
        return new ast_1.ASTWithSource(new ast_1.Interpolation(strings, expressions), input, location);
    };
    Parser.prototype.wrapLiteralPrimitive = function (input, location) {
        return new ast_1.ASTWithSource(new ast_1.LiteralPrimitive(input), input, location);
    };
    Parser.prototype._checkNoInterpolation = function (input, location) {
        var parts = lang_1.StringWrapper.split(input, INTERPOLATION_REGEXP);
        if (parts.length > 1) {
            throw new ParseException('Got interpolation ({{}}) where expression was expected', input, "at column " + this._findInterpolationErrorColumn(parts, 1) + " in", location);
        }
    };
    Parser.prototype._findInterpolationErrorColumn = function (parts, partInErrIdx) {
        var errLocation = '';
        for (var j = 0; j < partInErrIdx; j++) {
            errLocation += j % 2 === 0 ? parts[j] : "{{" + parts[j] + "}}";
        }
        return errLocation.length;
    };
    Parser = __decorate([
        decorators_1.Injectable(), 
        __metadata('design:paramtypes', [lexer_1.Lexer, reflection_1.Reflector])
    ], Parser);
    return Parser;
})();
exports.Parser = Parser;
var _ParseAST = (function () {
    function _ParseAST(input, location, tokens, reflector, parseAction) {
        this.input = input;
        this.location = location;
        this.tokens = tokens;
        this.reflector = reflector;
        this.parseAction = parseAction;
        this.index = 0;
    }
    _ParseAST.prototype.peek = function (offset) {
        var i = this.index + offset;
        return i < this.tokens.length ? this.tokens[i] : lexer_1.EOF;
    };
    Object.defineProperty(_ParseAST.prototype, "next", {
        get: function () { return this.peek(0); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(_ParseAST.prototype, "inputIndex", {
        get: function () {
            return (this.index < this.tokens.length) ? this.next.index : this.input.length;
        },
        enumerable: true,
        configurable: true
    });
    _ParseAST.prototype.advance = function () { this.index++; };
    _ParseAST.prototype.optionalCharacter = function (code) {
        if (this.next.isCharacter(code)) {
            this.advance();
            return true;
        }
        else {
            return false;
        }
    };
    _ParseAST.prototype.optionalKeywordVar = function () {
        if (this.peekKeywordVar()) {
            this.advance();
            return true;
        }
        else {
            return false;
        }
    };
    _ParseAST.prototype.peekKeywordVar = function () { return this.next.isKeywordVar() || this.next.isOperator('#'); };
    _ParseAST.prototype.expectCharacter = function (code) {
        if (this.optionalCharacter(code))
            return;
        this.error("Missing expected " + lang_1.StringWrapper.fromCharCode(code));
    };
    _ParseAST.prototype.optionalOperator = function (op) {
        if (this.next.isOperator(op)) {
            this.advance();
            return true;
        }
        else {
            return false;
        }
    };
    _ParseAST.prototype.expectOperator = function (operator) {
        if (this.optionalOperator(operator))
            return;
        this.error("Missing expected operator " + operator);
    };
    _ParseAST.prototype.expectIdentifierOrKeyword = function () {
        var n = this.next;
        if (!n.isIdentifier() && !n.isKeyword()) {
            this.error("Unexpected token " + n + ", expected identifier or keyword");
        }
        this.advance();
        return n.toString();
    };
    _ParseAST.prototype.expectIdentifierOrKeywordOrString = function () {
        var n = this.next;
        if (!n.isIdentifier() && !n.isKeyword() && !n.isString()) {
            this.error("Unexpected token " + n + ", expected identifier, keyword, or string");
        }
        this.advance();
        return n.toString();
    };
    _ParseAST.prototype.parseChain = function () {
        var exprs = [];
        while (this.index < this.tokens.length) {
            var expr = this.parsePipe();
            exprs.push(expr);
            if (this.optionalCharacter(lexer_1.$SEMICOLON)) {
                if (!this.parseAction) {
                    this.error("Binding expression cannot contain chained expression");
                }
                while (this.optionalCharacter(lexer_1.$SEMICOLON)) {
                } // read all semicolons
            }
            else if (this.index < this.tokens.length) {
                this.error("Unexpected token '" + this.next + "'");
            }
        }
        if (exprs.length == 0)
            return new ast_1.EmptyExpr();
        if (exprs.length == 1)
            return exprs[0];
        return new ast_1.Chain(exprs);
    };
    _ParseAST.prototype.parsePipe = function () {
        var result = this.parseExpression();
        if (this.optionalOperator("|")) {
            if (this.parseAction) {
                this.error("Cannot have a pipe in an action expression");
            }
            do {
                var name = this.expectIdentifierOrKeyword();
                var args = [];
                while (this.optionalCharacter(lexer_1.$COLON)) {
                    args.push(this.parseExpression());
                }
                result = new ast_1.BindingPipe(result, name, args);
            } while (this.optionalOperator("|"));
        }
        return result;
    };
    _ParseAST.prototype.parseExpression = function () { return this.parseConditional(); };
    _ParseAST.prototype.parseConditional = function () {
        var start = this.inputIndex;
        var result = this.parseLogicalOr();
        if (this.optionalOperator('?')) {
            var yes = this.parsePipe();
            if (!this.optionalCharacter(lexer_1.$COLON)) {
                var end = this.inputIndex;
                var expression = this.input.substring(start, end);
                this.error("Conditional expression " + expression + " requires all 3 expressions");
            }
            var no = this.parsePipe();
            return new ast_1.Conditional(result, yes, no);
        }
        else {
            return result;
        }
    };
    _ParseAST.prototype.parseLogicalOr = function () {
        // '||'
        var result = this.parseLogicalAnd();
        while (this.optionalOperator('||')) {
            result = new ast_1.Binary('||', result, this.parseLogicalAnd());
        }
        return result;
    };
    _ParseAST.prototype.parseLogicalAnd = function () {
        // '&&'
        var result = this.parseEquality();
        while (this.optionalOperator('&&')) {
            result = new ast_1.Binary('&&', result, this.parseEquality());
        }
        return result;
    };
    _ParseAST.prototype.parseEquality = function () {
        // '==','!=','===','!=='
        var result = this.parseRelational();
        while (true) {
            if (this.optionalOperator('==')) {
                result = new ast_1.Binary('==', result, this.parseRelational());
            }
            else if (this.optionalOperator('===')) {
                result = new ast_1.Binary('===', result, this.parseRelational());
            }
            else if (this.optionalOperator('!=')) {
                result = new ast_1.Binary('!=', result, this.parseRelational());
            }
            else if (this.optionalOperator('!==')) {
                result = new ast_1.Binary('!==', result, this.parseRelational());
            }
            else {
                return result;
            }
        }
    };
    _ParseAST.prototype.parseRelational = function () {
        // '<', '>', '<=', '>='
        var result = this.parseAdditive();
        while (true) {
            if (this.optionalOperator('<')) {
                result = new ast_1.Binary('<', result, this.parseAdditive());
            }
            else if (this.optionalOperator('>')) {
                result = new ast_1.Binary('>', result, this.parseAdditive());
            }
            else if (this.optionalOperator('<=')) {
                result = new ast_1.Binary('<=', result, this.parseAdditive());
            }
            else if (this.optionalOperator('>=')) {
                result = new ast_1.Binary('>=', result, this.parseAdditive());
            }
            else {
                return result;
            }
        }
    };
    _ParseAST.prototype.parseAdditive = function () {
        // '+', '-'
        var result = this.parseMultiplicative();
        while (true) {
            if (this.optionalOperator('+')) {
                result = new ast_1.Binary('+', result, this.parseMultiplicative());
            }
            else if (this.optionalOperator('-')) {
                result = new ast_1.Binary('-', result, this.parseMultiplicative());
            }
            else {
                return result;
            }
        }
    };
    _ParseAST.prototype.parseMultiplicative = function () {
        // '*', '%', '/'
        var result = this.parsePrefix();
        while (true) {
            if (this.optionalOperator('*')) {
                result = new ast_1.Binary('*', result, this.parsePrefix());
            }
            else if (this.optionalOperator('%')) {
                result = new ast_1.Binary('%', result, this.parsePrefix());
            }
            else if (this.optionalOperator('/')) {
                result = new ast_1.Binary('/', result, this.parsePrefix());
            }
            else {
                return result;
            }
        }
    };
    _ParseAST.prototype.parsePrefix = function () {
        if (this.optionalOperator('+')) {
            return this.parsePrefix();
        }
        else if (this.optionalOperator('-')) {
            return new ast_1.Binary('-', new ast_1.LiteralPrimitive(0), this.parsePrefix());
        }
        else if (this.optionalOperator('!')) {
            return new ast_1.PrefixNot(this.parsePrefix());
        }
        else {
            return this.parseCallChain();
        }
    };
    _ParseAST.prototype.parseCallChain = function () {
        var result = this.parsePrimary();
        while (true) {
            if (this.optionalCharacter(lexer_1.$PERIOD)) {
                result = this.parseAccessMemberOrMethodCall(result, false);
            }
            else if (this.optionalOperator('?.')) {
                result = this.parseAccessMemberOrMethodCall(result, true);
            }
            else if (this.optionalCharacter(lexer_1.$LBRACKET)) {
                var key = this.parsePipe();
                this.expectCharacter(lexer_1.$RBRACKET);
                if (this.optionalOperator("=")) {
                    var value = this.parseConditional();
                    result = new ast_1.KeyedWrite(result, key, value);
                }
                else {
                    result = new ast_1.KeyedRead(result, key);
                }
            }
            else if (this.optionalCharacter(lexer_1.$LPAREN)) {
                var args = this.parseCallArguments();
                this.expectCharacter(lexer_1.$RPAREN);
                result = new ast_1.FunctionCall(result, args);
            }
            else {
                return result;
            }
        }
    };
    _ParseAST.prototype.parsePrimary = function () {
        if (this.optionalCharacter(lexer_1.$LPAREN)) {
            var result = this.parsePipe();
            this.expectCharacter(lexer_1.$RPAREN);
            return result;
        }
        else if (this.next.isKeywordNull() || this.next.isKeywordUndefined()) {
            this.advance();
            return new ast_1.LiteralPrimitive(null);
        }
        else if (this.next.isKeywordTrue()) {
            this.advance();
            return new ast_1.LiteralPrimitive(true);
        }
        else if (this.next.isKeywordFalse()) {
            this.advance();
            return new ast_1.LiteralPrimitive(false);
        }
        else if (this.optionalCharacter(lexer_1.$LBRACKET)) {
            var elements = this.parseExpressionList(lexer_1.$RBRACKET);
            this.expectCharacter(lexer_1.$RBRACKET);
            return new ast_1.LiteralArray(elements);
        }
        else if (this.next.isCharacter(lexer_1.$LBRACE)) {
            return this.parseLiteralMap();
        }
        else if (this.next.isIdentifier()) {
            return this.parseAccessMemberOrMethodCall(_implicitReceiver, false);
        }
        else if (this.next.isNumber()) {
            var value = this.next.toNumber();
            this.advance();
            return new ast_1.LiteralPrimitive(value);
        }
        else if (this.next.isString()) {
            var literalValue = this.next.toString();
            this.advance();
            return new ast_1.LiteralPrimitive(literalValue);
        }
        else if (this.index >= this.tokens.length) {
            this.error("Unexpected end of expression: " + this.input);
        }
        else {
            this.error("Unexpected token " + this.next);
        }
        // error() throws, so we don't reach here.
        throw new exceptions_1.BaseException("Fell through all cases in parsePrimary");
    };
    _ParseAST.prototype.parseExpressionList = function (terminator) {
        var result = [];
        if (!this.next.isCharacter(terminator)) {
            do {
                result.push(this.parsePipe());
            } while (this.optionalCharacter(lexer_1.$COMMA));
        }
        return result;
    };
    _ParseAST.prototype.parseLiteralMap = function () {
        var keys = [];
        var values = [];
        this.expectCharacter(lexer_1.$LBRACE);
        if (!this.optionalCharacter(lexer_1.$RBRACE)) {
            do {
                var key = this.expectIdentifierOrKeywordOrString();
                keys.push(key);
                this.expectCharacter(lexer_1.$COLON);
                values.push(this.parsePipe());
            } while (this.optionalCharacter(lexer_1.$COMMA));
            this.expectCharacter(lexer_1.$RBRACE);
        }
        return new ast_1.LiteralMap(keys, values);
    };
    _ParseAST.prototype.parseAccessMemberOrMethodCall = function (receiver, isSafe) {
        if (isSafe === void 0) { isSafe = false; }
        var id = this.expectIdentifierOrKeyword();
        if (this.optionalCharacter(lexer_1.$LPAREN)) {
            var args = this.parseCallArguments();
            this.expectCharacter(lexer_1.$RPAREN);
            var fn = this.reflector.method(id);
            return isSafe ? new ast_1.SafeMethodCall(receiver, id, fn, args) :
                new ast_1.MethodCall(receiver, id, fn, args);
        }
        else {
            if (isSafe) {
                if (this.optionalOperator("=")) {
                    this.error("The '?.' operator cannot be used in the assignment");
                }
                else {
                    return new ast_1.SafePropertyRead(receiver, id, this.reflector.getter(id));
                }
            }
            else {
                if (this.optionalOperator("=")) {
                    if (!this.parseAction) {
                        this.error("Bindings cannot contain assignments");
                    }
                    var value = this.parseConditional();
                    return new ast_1.PropertyWrite(receiver, id, this.reflector.setter(id), value);
                }
                else {
                    return new ast_1.PropertyRead(receiver, id, this.reflector.getter(id));
                }
            }
        }
        return null;
    };
    _ParseAST.prototype.parseCallArguments = function () {
        if (this.next.isCharacter(lexer_1.$RPAREN))
            return [];
        var positionals = [];
        do {
            positionals.push(this.parsePipe());
        } while (this.optionalCharacter(lexer_1.$COMMA));
        return positionals;
    };
    _ParseAST.prototype.parseBlockContent = function () {
        if (!this.parseAction) {
            this.error("Binding expression cannot contain chained expression");
        }
        var exprs = [];
        while (this.index < this.tokens.length && !this.next.isCharacter(lexer_1.$RBRACE)) {
            var expr = this.parseExpression();
            exprs.push(expr);
            if (this.optionalCharacter(lexer_1.$SEMICOLON)) {
                while (this.optionalCharacter(lexer_1.$SEMICOLON)) {
                } // read all semicolons
            }
        }
        if (exprs.length == 0)
            return new ast_1.EmptyExpr();
        if (exprs.length == 1)
            return exprs[0];
        return new ast_1.Chain(exprs);
    };
    /**
     * An identifier, a keyword, a string with an optional `-` inbetween.
     */
    _ParseAST.prototype.expectTemplateBindingKey = function () {
        var result = '';
        var operatorFound = false;
        do {
            result += this.expectIdentifierOrKeywordOrString();
            operatorFound = this.optionalOperator('-');
            if (operatorFound) {
                result += '-';
            }
        } while (operatorFound);
        return result.toString();
    };
    _ParseAST.prototype.parseTemplateBindings = function () {
        var bindings = [];
        var prefix = null;
        while (this.index < this.tokens.length) {
            var keyIsVar = this.optionalKeywordVar();
            var key = this.expectTemplateBindingKey();
            if (!keyIsVar) {
                if (prefix == null) {
                    prefix = key;
                }
                else {
                    key = prefix + '-' + key;
                }
            }
            this.optionalCharacter(lexer_1.$COLON);
            var name = null;
            var expression = null;
            if (keyIsVar) {
                if (this.optionalOperator("=")) {
                    name = this.expectTemplateBindingKey();
                }
                else {
                    name = '\$implicit';
                }
            }
            else if (this.next !== lexer_1.EOF && !this.peekKeywordVar()) {
                var start = this.inputIndex;
                var ast = this.parsePipe();
                var source = this.input.substring(start, this.inputIndex);
                expression = new ast_1.ASTWithSource(ast, source, this.location);
            }
            bindings.push(new ast_1.TemplateBinding(key, keyIsVar, name, expression));
            if (!this.optionalCharacter(lexer_1.$SEMICOLON)) {
                this.optionalCharacter(lexer_1.$COMMA);
            }
        }
        return bindings;
    };
    _ParseAST.prototype.error = function (message, index) {
        if (index === void 0) { index = null; }
        if (lang_1.isBlank(index))
            index = this.index;
        var location = (index < this.tokens.length) ? "at column " + (this.tokens[index].index + 1) + " in" :
            "at the end of the expression";
        throw new ParseException(message, this.input, location, this.location);
    };
    return _ParseAST;
})();
exports._ParseAST = _ParseAST;
var SimpleExpressionChecker = (function () {
    function SimpleExpressionChecker() {
        this.simple = true;
    }
    SimpleExpressionChecker.check = function (ast) {
        var s = new SimpleExpressionChecker();
        ast.visit(s);
        return s.simple;
    };
    SimpleExpressionChecker.prototype.visitImplicitReceiver = function (ast) { };
    SimpleExpressionChecker.prototype.visitInterpolation = function (ast) { this.simple = false; };
    SimpleExpressionChecker.prototype.visitLiteralPrimitive = function (ast) { };
    SimpleExpressionChecker.prototype.visitPropertyRead = function (ast) { };
    SimpleExpressionChecker.prototype.visitPropertyWrite = function (ast) { this.simple = false; };
    SimpleExpressionChecker.prototype.visitSafePropertyRead = function (ast) { this.simple = false; };
    SimpleExpressionChecker.prototype.visitMethodCall = function (ast) { this.simple = false; };
    SimpleExpressionChecker.prototype.visitSafeMethodCall = function (ast) { this.simple = false; };
    SimpleExpressionChecker.prototype.visitFunctionCall = function (ast) { this.simple = false; };
    SimpleExpressionChecker.prototype.visitLiteralArray = function (ast) { this.visitAll(ast.expressions); };
    SimpleExpressionChecker.prototype.visitLiteralMap = function (ast) { this.visitAll(ast.values); };
    SimpleExpressionChecker.prototype.visitBinary = function (ast) { this.simple = false; };
    SimpleExpressionChecker.prototype.visitPrefixNot = function (ast) { this.simple = false; };
    SimpleExpressionChecker.prototype.visitConditional = function (ast) { this.simple = false; };
    SimpleExpressionChecker.prototype.visitPipe = function (ast) { this.simple = false; };
    SimpleExpressionChecker.prototype.visitKeyedRead = function (ast) { this.simple = false; };
    SimpleExpressionChecker.prototype.visitKeyedWrite = function (ast) { this.simple = false; };
    SimpleExpressionChecker.prototype.visitAll = function (asts) {
        var res = collection_1.ListWrapper.createFixedSize(asts.length);
        for (var i = 0; i < asts.length; ++i) {
            res[i] = asts[i].visit(this);
        }
        return res;
    };
    SimpleExpressionChecker.prototype.visitChain = function (ast) { this.simple = false; };
    SimpleExpressionChecker.prototype.visitQuote = function (ast) { this.simple = false; };
    return SimpleExpressionChecker;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9wYXJzZXIvcGFyc2VyLnRzIl0sIm5hbWVzIjpbIlBhcnNlRXhjZXB0aW9uIiwiUGFyc2VFeGNlcHRpb24uY29uc3RydWN0b3IiLCJQYXJzZXIiLCJQYXJzZXIuY29uc3RydWN0b3IiLCJQYXJzZXIucGFyc2VBY3Rpb24iLCJQYXJzZXIucGFyc2VCaW5kaW5nIiwiUGFyc2VyLnBhcnNlU2ltcGxlQmluZGluZyIsIlBhcnNlci5fcGFyc2VCaW5kaW5nQXN0IiwiUGFyc2VyLl9wYXJzZVF1b3RlIiwiUGFyc2VyLnBhcnNlVGVtcGxhdGVCaW5kaW5ncyIsIlBhcnNlci5wYXJzZUludGVycG9sYXRpb24iLCJQYXJzZXIud3JhcExpdGVyYWxQcmltaXRpdmUiLCJQYXJzZXIuX2NoZWNrTm9JbnRlcnBvbGF0aW9uIiwiUGFyc2VyLl9maW5kSW50ZXJwb2xhdGlvbkVycm9yQ29sdW1uIiwiX1BhcnNlQVNUIiwiX1BhcnNlQVNULmNvbnN0cnVjdG9yIiwiX1BhcnNlQVNULnBlZWsiLCJfUGFyc2VBU1QubmV4dCIsIl9QYXJzZUFTVC5pbnB1dEluZGV4IiwiX1BhcnNlQVNULmFkdmFuY2UiLCJfUGFyc2VBU1Qub3B0aW9uYWxDaGFyYWN0ZXIiLCJfUGFyc2VBU1Qub3B0aW9uYWxLZXl3b3JkVmFyIiwiX1BhcnNlQVNULnBlZWtLZXl3b3JkVmFyIiwiX1BhcnNlQVNULmV4cGVjdENoYXJhY3RlciIsIl9QYXJzZUFTVC5vcHRpb25hbE9wZXJhdG9yIiwiX1BhcnNlQVNULmV4cGVjdE9wZXJhdG9yIiwiX1BhcnNlQVNULmV4cGVjdElkZW50aWZpZXJPcktleXdvcmQiLCJfUGFyc2VBU1QuZXhwZWN0SWRlbnRpZmllck9yS2V5d29yZE9yU3RyaW5nIiwiX1BhcnNlQVNULnBhcnNlQ2hhaW4iLCJfUGFyc2VBU1QucGFyc2VQaXBlIiwiX1BhcnNlQVNULnBhcnNlRXhwcmVzc2lvbiIsIl9QYXJzZUFTVC5wYXJzZUNvbmRpdGlvbmFsIiwiX1BhcnNlQVNULnBhcnNlTG9naWNhbE9yIiwiX1BhcnNlQVNULnBhcnNlTG9naWNhbEFuZCIsIl9QYXJzZUFTVC5wYXJzZUVxdWFsaXR5IiwiX1BhcnNlQVNULnBhcnNlUmVsYXRpb25hbCIsIl9QYXJzZUFTVC5wYXJzZUFkZGl0aXZlIiwiX1BhcnNlQVNULnBhcnNlTXVsdGlwbGljYXRpdmUiLCJfUGFyc2VBU1QucGFyc2VQcmVmaXgiLCJfUGFyc2VBU1QucGFyc2VDYWxsQ2hhaW4iLCJfUGFyc2VBU1QucGFyc2VQcmltYXJ5IiwiX1BhcnNlQVNULnBhcnNlRXhwcmVzc2lvbkxpc3QiLCJfUGFyc2VBU1QucGFyc2VMaXRlcmFsTWFwIiwiX1BhcnNlQVNULnBhcnNlQWNjZXNzTWVtYmVyT3JNZXRob2RDYWxsIiwiX1BhcnNlQVNULnBhcnNlQ2FsbEFyZ3VtZW50cyIsIl9QYXJzZUFTVC5wYXJzZUJsb2NrQ29udGVudCIsIl9QYXJzZUFTVC5leHBlY3RUZW1wbGF0ZUJpbmRpbmdLZXkiLCJfUGFyc2VBU1QucGFyc2VUZW1wbGF0ZUJpbmRpbmdzIiwiX1BhcnNlQVNULmVycm9yIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIiLCJTaW1wbGVFeHByZXNzaW9uQ2hlY2tlci5jb25zdHJ1Y3RvciIsIlNpbXBsZUV4cHJlc3Npb25DaGVja2VyLmNoZWNrIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRJbXBsaWNpdFJlY2VpdmVyIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRJbnRlcnBvbGF0aW9uIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRMaXRlcmFsUHJpbWl0aXZlIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRQcm9wZXJ0eVJlYWQiLCJTaW1wbGVFeHByZXNzaW9uQ2hlY2tlci52aXNpdFByb3BlcnR5V3JpdGUiLCJTaW1wbGVFeHByZXNzaW9uQ2hlY2tlci52aXNpdFNhZmVQcm9wZXJ0eVJlYWQiLCJTaW1wbGVFeHByZXNzaW9uQ2hlY2tlci52aXNpdE1ldGhvZENhbGwiLCJTaW1wbGVFeHByZXNzaW9uQ2hlY2tlci52aXNpdFNhZmVNZXRob2RDYWxsIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRGdW5jdGlvbkNhbGwiLCJTaW1wbGVFeHByZXNzaW9uQ2hlY2tlci52aXNpdExpdGVyYWxBcnJheSIsIlNpbXBsZUV4cHJlc3Npb25DaGVja2VyLnZpc2l0TGl0ZXJhbE1hcCIsIlNpbXBsZUV4cHJlc3Npb25DaGVja2VyLnZpc2l0QmluYXJ5IiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRQcmVmaXhOb3QiLCJTaW1wbGVFeHByZXNzaW9uQ2hlY2tlci52aXNpdENvbmRpdGlvbmFsIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRQaXBlIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRLZXllZFJlYWQiLCJTaW1wbGVFeHByZXNzaW9uQ2hlY2tlci52aXNpdEtleWVkV3JpdGUiLCJTaW1wbGVFeHByZXNzaW9uQ2hlY2tlci52aXNpdEFsbCIsIlNpbXBsZUV4cHJlc3Npb25DaGVja2VyLnZpc2l0Q2hhaW4iLCJTaW1wbGVFeHByZXNzaW9uQ2hlY2tlci52aXNpdFF1b3RlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkJBQXlCLGlDQUFpQyxDQUFDLENBQUE7QUFDM0QscUJBQWdELDBCQUEwQixDQUFDLENBQUE7QUFDM0UsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0Qsc0JBZU8sU0FBUyxDQUFDLENBQUE7QUFDakIsMkJBQW1DLHlDQUF5QyxDQUFDLENBQUE7QUFDN0Usb0JBeUJPLE9BQU8sQ0FBQyxDQUFBO0FBR2YsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLHNCQUFnQixFQUFFLENBQUM7QUFDL0Msb0ZBQW9GO0FBQ3BGLElBQUksb0JBQW9CLEdBQUcsZ0JB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WUFDWkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDaENBLE1BQU1BLEdBQUdBLElBQUlBLFlBQU1BLENBQUNBLElBQUlBLEVBQUVBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLGVBQWVBLEVBQUVBLENBQUNBLENBQUNBO1lBQzVEQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUN4Q0EsTUFBTUEsR0FBR0EsSUFBSUEsWUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsZUFBZUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7WUFDN0RBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZDQSxNQUFNQSxHQUFHQSxJQUFJQSxZQUFNQSxDQUFDQSxJQUFJQSxFQUFFQSxNQUFNQSxFQUFFQSxJQUFJQSxDQUFDQSxlQUFlQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUM1REEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDeENBLE1BQU1BLEdBQUdBLElBQUlBLFlBQU1BLENBQUNBLEtBQUtBLEVBQUVBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLGVBQWVBLEVBQUVBLENBQUNBLENBQUNBO1lBQzdEQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7WUFDaEJBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURwQixt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Q0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQy9CQSxNQUFNQSxHQUFHQSxJQUFJQSxZQUFNQSxDQUFDQSxHQUFHQSxFQUFFQSxNQUFNQSxFQUFFQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUN2REEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdENBLE1BQU1BLEdBQUdBLElBQUlBLFlBQU1BLENBQUNBLEdBQUdBLEVBQUVBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBLENBQUNBO1lBQ3ZEQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0Q0EsTUFBTUEsR0FBR0EsSUFBSUEsWUFBTUEsQ0FBQ0EsR0FBR0EsRUFBRUEsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7WUFDdkRBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNOQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtZQUNoQkEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFRHZCLCtCQUFXQSxHQUFYQTtRQUNFd0IsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMvQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDNUJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdENBLE1BQU1BLENBQUNB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QU1BLENBQUNBLENBQUNBO1FBQ25EQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUNyQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDL0JBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBO0lBQ2JBLENBQUNBO0lBRURwQiw0Q0FBVUEsR0FBVkEsVUFBV0EsR0FBVUEsSUFBSXFCLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO0lBRS9DckIsNENBQVVBLEdBQVZBLFVBQVdBLEdBQVVBLElBQUlzQixJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNqRHRCLDhCQUFDQTtBQUFEQSxDQUFDQSxBQXRERCxJQXNEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvZGVjb3JhdG9ycyc7XG5pbXBvcnQge2lzQmxhbmssIGlzUHJlc2VudCwgU3RyaW5nV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1xuICBMZXhlcixcbiAgRU9GLFxuICBpc0lkZW50aWZpZXIsXG4gIFRva2VuLFxuICAkUEVSSU9ELFxuICAkQ09MT04sXG4gICRTRU1JQ09MT04sXG4gICRMQlJBQ0tFVCxcbiAgJFJCUkFDS0VULFxuICAkQ09NTUEsXG4gICRMQlJBQ0UsXG4gICRSQlJBQ0UsXG4gICRMUEFSRU4sXG4gICRSUEFSRU5cbn0gZnJvbSAnLi9sZXhlcic7XG5pbXBvcnQge3JlZmxlY3RvciwgUmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtcbiAgQVNULFxuICBFbXB0eUV4cHIsXG4gIEltcGxpY2l0UmVjZWl2ZXIsXG4gIFByb3BlcnR5UmVhZCxcbiAgUHJvcGVydHlXcml0ZSxcbiAgU2FmZVByb3BlcnR5UmVhZCxcbiAgTGl0ZXJhbFByaW1pdGl2ZSxcbiAgQmluYXJ5LFxuICBQcmVmaXhOb3QsXG4gIENvbmRpdGlvbmFsLFxuICBCaW5kaW5nUGlwZSxcbiAgQ2hhaW4sXG4gIEtleWVkUmVhZCxcbiAgS2V5ZWRXcml0ZSxcbiAgTGl0ZXJhbEFycmF5LFxuICBMaXRlcmFsTWFwLFxuICBJbnRlcnBvbGF0aW9uLFxuICBNZXRob2RDYWxsLFxuICBTYWZlTWV0aG9kQ2FsbCxcbiAgRnVuY3Rpb25DYWxsLFxuICBUZW1wbGF0ZUJpbmRpbmcsXG4gIEFTVFdpdGhTb3VyY2UsXG4gIEFzdFZpc2l0b3IsXG4gIFF1b3RlXG59IGZyb20gJy4vYXN0JztcblxuXG52YXIgX2ltcGxpY2l0UmVjZWl2ZXIgPSBuZXcgSW1wbGljaXRSZWNlaXZlcigpO1xuLy8gVE9ETyh0Ym9zY2gpOiBDYW5ub3QgbWFrZSB0aGlzIGNvbnN0L2ZpbmFsIHJpZ2h0IG5vdyBiZWNhdXNlIG9mIHRoZSB0cmFuc3BpbGVyLi4uXG52YXIgSU5URVJQT0xBVElPTl9SRUdFWFAgPSAvXFx7XFx7KC4qPylcXH1cXH0vZztcblxuY2xhc3MgUGFyc2VFeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBpbnB1dDogc3RyaW5nLCBlcnJMb2NhdGlvbjogc3RyaW5nLCBjdHhMb2NhdGlvbj86IGFueSkge1xuICAgIHN1cGVyKGBQYXJzZXIgRXJyb3I6ICR7bWVzc2FnZX0gJHtlcnJMb2NhdGlvbn0gWyR7aW5wdXR9XSBpbiAke2N0eExvY2F0aW9ufWApO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQYXJzZXIge1xuICAvKiogQGludGVybmFsICovXG4gIF9yZWZsZWN0b3I6IFJlZmxlY3RvcjtcblxuICBjb25zdHJ1Y3RvcigvKiogQGludGVybmFsICovXG4gICAgICAgICAgICAgIHB1YmxpYyBfbGV4ZXI6IExleGVyLCBwcm92aWRlZFJlZmxlY3RvcjogUmVmbGVjdG9yID0gbnVsbCkge1xuICAgIHRoaXMuX3JlZmxlY3RvciA9IGlzUHJlc2VudChwcm92aWRlZFJlZmxlY3RvcikgPyBwcm92aWRlZFJlZmxlY3RvciA6IHJlZmxlY3RvcjtcbiAgfVxuXG4gIHBhcnNlQWN0aW9uKGlucHV0OiBzdHJpbmcsIGxvY2F0aW9uOiBhbnkpOiBBU1RXaXRoU291cmNlIHtcbiAgICB0aGlzLl9jaGVja05vSW50ZXJwb2xhdGlvbihpbnB1dCwgbG9jYXRpb24pO1xuICAgIHZhciB0b2tlbnMgPSB0aGlzLl9sZXhlci50b2tlbml6ZShpbnB1dCk7XG4gICAgdmFyIGFzdCA9IG5ldyBfUGFyc2VBU1QoaW5wdXQsIGxvY2F0aW9uLCB0b2tlbnMsIHRoaXMuX3JlZmxlY3RvciwgdHJ1ZSkucGFyc2VDaGFpbigpO1xuICAgIHJldHVybiBuZXcgQVNUV2l0aFNvdXJjZShhc3QsIGlucHV0LCBsb2NhdGlvbik7XG4gIH1cblxuICBwYXJzZUJpbmRpbmcoaW5wdXQ6IHN0cmluZywgbG9jYXRpb246IGFueSk6IEFTVFdpdGhTb3VyY2Uge1xuICAgIHZhciBhc3QgPSB0aGlzLl9wYXJzZUJpbmRpbmdBc3QoaW5wdXQsIGxvY2F0aW9uKTtcbiAgICByZXR1cm4gbmV3IEFTVFdpdGhTb3VyY2UoYXN0LCBpbnB1dCwgbG9jYXRpb24pO1xuICB9XG5cbiAgcGFyc2VTaW1wbGVCaW5kaW5nKGlucHV0OiBzdHJpbmcsIGxvY2F0aW9uOiBzdHJpbmcpOiBBU1RXaXRoU291cmNlIHtcbiAgICB2YXIgYXN0ID0gdGhpcy5fcGFyc2VCaW5kaW5nQXN0KGlucHV0LCBsb2NhdGlvbik7XG4gICAgaWYgKCFTaW1wbGVFeHByZXNzaW9uQ2hlY2tlci5jaGVjayhhc3QpKSB7XG4gICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24oXG4gICAgICAgICAgJ0hvc3QgYmluZGluZyBleHByZXNzaW9uIGNhbiBvbmx5IGNvbnRhaW4gZmllbGQgYWNjZXNzIGFuZCBjb25zdGFudHMnLCBpbnB1dCwgbG9jYXRpb24pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEFTVFdpdGhTb3VyY2UoYXN0LCBpbnB1dCwgbG9jYXRpb24pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VCaW5kaW5nQXN0KGlucHV0OiBzdHJpbmcsIGxvY2F0aW9uOiBzdHJpbmcpOiBBU1Qge1xuICAgIC8vIFF1b3RlcyBleHByZXNzaW9ucyB1c2UgM3JkLXBhcnR5IGV4cHJlc3Npb24gbGFuZ3VhZ2UuIFdlIGRvbid0IHdhbnQgdG8gdXNlXG4gICAgLy8gb3VyIGxleGVyIG9yIHBhcnNlciBmb3IgdGhhdCwgc28gd2UgY2hlY2sgZm9yIHRoYXQgYWhlYWQgb2YgdGltZS5cbiAgICB2YXIgcXVvdGUgPSB0aGlzLl9wYXJzZVF1b3RlKGlucHV0LCBsb2NhdGlvbik7XG5cbiAgICBpZiAoaXNQcmVzZW50KHF1b3RlKSkge1xuICAgICAgcmV0dXJuIHF1b3RlO1xuICAgIH1cblxuICAgIHRoaXMuX2NoZWNrTm9JbnRlcnBvbGF0aW9uKGlucHV0LCBsb2NhdGlvbik7XG4gICAgdmFyIHRva2VucyA9IHRoaXMuX2xleGVyLnRva2VuaXplKGlucHV0KTtcbiAgICByZXR1cm4gbmV3IF9QYXJzZUFTVChpbnB1dCwgbG9jYXRpb24sIHRva2VucywgdGhpcy5fcmVmbGVjdG9yLCBmYWxzZSkucGFyc2VDaGFpbigpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VRdW90ZShpbnB1dDogc3RyaW5nLCBsb2NhdGlvbjogYW55KTogQVNUIHtcbiAgICBpZiAoaXNCbGFuayhpbnB1dCkpIHJldHVybiBudWxsO1xuICAgIHZhciBwcmVmaXhTZXBhcmF0b3JJbmRleCA9IGlucHV0LmluZGV4T2YoJzonKTtcbiAgICBpZiAocHJlZml4U2VwYXJhdG9ySW5kZXggPT0gLTEpIHJldHVybiBudWxsO1xuICAgIHZhciBwcmVmaXggPSBpbnB1dC5zdWJzdHJpbmcoMCwgcHJlZml4U2VwYXJhdG9ySW5kZXgpLnRyaW0oKTtcbiAgICBpZiAoIWlzSWRlbnRpZmllcihwcmVmaXgpKSByZXR1cm4gbnVsbDtcbiAgICB2YXIgdW5pbnRlcnByZXRlZEV4cHJlc3Npb24gPSBpbnB1dC5zdWJzdHJpbmcocHJlZml4U2VwYXJhdG9ySW5kZXggKyAxKTtcbiAgICByZXR1cm4gbmV3IFF1b3RlKHByZWZpeCwgdW5pbnRlcnByZXRlZEV4cHJlc3Npb24sIGxvY2F0aW9uKTtcbiAgfVxuXG4gIHBhcnNlVGVtcGxhdGVCaW5kaW5ncyhpbnB1dDogc3RyaW5nLCBsb2NhdGlvbjogYW55KTogVGVtcGxhdGVCaW5kaW5nW10ge1xuICAgIHZhciB0b2tlbnMgPSB0aGlzLl9sZXhlci50b2tlbml6ZShpbnB1dCk7XG4gICAgcmV0dXJuIG5ldyBfUGFyc2VBU1QoaW5wdXQsIGxvY2F0aW9uLCB0b2tlbnMsIHRoaXMuX3JlZmxlY3RvciwgZmFsc2UpLnBhcnNlVGVtcGxhdGVCaW5kaW5ncygpO1xuICB9XG5cbiAgcGFyc2VJbnRlcnBvbGF0aW9uKGlucHV0OiBzdHJpbmcsIGxvY2F0aW9uOiBhbnkpOiBBU1RXaXRoU291cmNlIHtcbiAgICB2YXIgcGFydHMgPSBTdHJpbmdXcmFwcGVyLnNwbGl0KGlucHV0LCBJTlRFUlBPTEFUSU9OX1JFR0VYUCk7XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA8PSAxKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIHN0cmluZ3MgPSBbXTtcbiAgICB2YXIgZXhwcmVzc2lvbnMgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwYXJ0OiBzdHJpbmcgPSBwYXJ0c1tpXTtcbiAgICAgIGlmIChpICUgMiA9PT0gMCkge1xuICAgICAgICAvLyBmaXhlZCBzdHJpbmdcbiAgICAgICAgc3RyaW5ncy5wdXNoKHBhcnQpO1xuICAgICAgfSBlbHNlIGlmIChwYXJ0LnRyaW0oKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciB0b2tlbnMgPSB0aGlzLl9sZXhlci50b2tlbml6ZShwYXJ0KTtcbiAgICAgICAgdmFyIGFzdCA9IG5ldyBfUGFyc2VBU1QoaW5wdXQsIGxvY2F0aW9uLCB0b2tlbnMsIHRoaXMuX3JlZmxlY3RvciwgZmFsc2UpLnBhcnNlQ2hhaW4oKTtcbiAgICAgICAgZXhwcmVzc2lvbnMucHVzaChhc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uKCdCbGFuayBleHByZXNzaW9ucyBhcmUgbm90IGFsbG93ZWQgaW4gaW50ZXJwb2xhdGVkIHN0cmluZ3MnLCBpbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBhdCBjb2x1bW4gJHt0aGlzLl9maW5kSW50ZXJwb2xhdGlvbkVycm9yQ29sdW1uKHBhcnRzLCBpKX0gaW5gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IEFTVFdpdGhTb3VyY2UobmV3IEludGVycG9sYXRpb24oc3RyaW5ncywgZXhwcmVzc2lvbnMpLCBpbnB1dCwgbG9jYXRpb24pO1xuICB9XG5cbiAgd3JhcExpdGVyYWxQcmltaXRpdmUoaW5wdXQ6IHN0cmluZywgbG9jYXRpb246IGFueSk6IEFTVFdpdGhTb3VyY2Uge1xuICAgIHJldHVybiBuZXcgQVNUV2l0aFNvdXJjZShuZXcgTGl0ZXJhbFByaW1pdGl2ZShpbnB1dCksIGlucHV0LCBsb2NhdGlvbik7XG4gIH1cblxuICBwcml2YXRlIF9jaGVja05vSW50ZXJwb2xhdGlvbihpbnB1dDogc3RyaW5nLCBsb2NhdGlvbjogYW55KTogdm9pZCB7XG4gICAgdmFyIHBhcnRzID0gU3RyaW5nV3JhcHBlci5zcGxpdChpbnB1dCwgSU5URVJQT0xBVElPTl9SRUdFWFApO1xuICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24oJ0dvdCBpbnRlcnBvbGF0aW9uICh7e319KSB3aGVyZSBleHByZXNzaW9uIHdhcyBleHBlY3RlZCcsIGlucHV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBhdCBjb2x1bW4gJHt0aGlzLl9maW5kSW50ZXJwb2xhdGlvbkVycm9yQ29sdW1uKHBhcnRzLCAxKX0gaW5gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9maW5kSW50ZXJwb2xhdGlvbkVycm9yQ29sdW1uKHBhcnRzOiBzdHJpbmdbXSwgcGFydEluRXJySWR4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIHZhciBlcnJMb2NhdGlvbiA9ICcnO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgcGFydEluRXJySWR4OyBqKyspIHtcbiAgICAgIGVyckxvY2F0aW9uICs9IGogJSAyID09PSAwID8gcGFydHNbal0gOiBge3ske3BhcnRzW2pdfX19YDtcbiAgICB9XG5cbiAgICByZXR1cm4gZXJyTG9jYXRpb24ubGVuZ3RoO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBfUGFyc2VBU1Qge1xuICBpbmRleDogbnVtYmVyID0gMDtcbiAgY29uc3RydWN0b3IocHVibGljIGlucHV0OiBzdHJpbmcsIHB1YmxpYyBsb2NhdGlvbjogYW55LCBwdWJsaWMgdG9rZW5zOiBhbnlbXSxcbiAgICAgICAgICAgICAgcHVibGljIHJlZmxlY3RvcjogUmVmbGVjdG9yLCBwdWJsaWMgcGFyc2VBY3Rpb246IGJvb2xlYW4pIHt9XG5cbiAgcGVlayhvZmZzZXQ6IG51bWJlcik6IFRva2VuIHtcbiAgICB2YXIgaSA9IHRoaXMuaW5kZXggKyBvZmZzZXQ7XG4gICAgcmV0dXJuIGkgPCB0aGlzLnRva2Vucy5sZW5ndGggPyB0aGlzLnRva2Vuc1tpXSA6IEVPRjtcbiAgfVxuXG4gIGdldCBuZXh0KCk6IFRva2VuIHsgcmV0dXJuIHRoaXMucGVlaygwKTsgfVxuXG4gIGdldCBpbnB1dEluZGV4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuICh0aGlzLmluZGV4IDwgdGhpcy50b2tlbnMubGVuZ3RoKSA/IHRoaXMubmV4dC5pbmRleCA6IHRoaXMuaW5wdXQubGVuZ3RoO1xuICB9XG5cbiAgYWR2YW5jZSgpIHsgdGhpcy5pbmRleCsrOyB9XG5cbiAgb3B0aW9uYWxDaGFyYWN0ZXIoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMubmV4dC5pc0NoYXJhY3Rlcihjb2RlKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIG9wdGlvbmFsS2V5d29yZFZhcigpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5wZWVrS2V5d29yZFZhcigpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcGVla0tleXdvcmRWYXIoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLm5leHQuaXNLZXl3b3JkVmFyKCkgfHwgdGhpcy5uZXh0LmlzT3BlcmF0b3IoJyMnKTsgfVxuXG4gIGV4cGVjdENoYXJhY3Rlcihjb2RlOiBudW1iZXIpIHtcbiAgICBpZiAodGhpcy5vcHRpb25hbENoYXJhY3Rlcihjb2RlKSkgcmV0dXJuO1xuICAgIHRoaXMuZXJyb3IoYE1pc3NpbmcgZXhwZWN0ZWQgJHtTdHJpbmdXcmFwcGVyLmZyb21DaGFyQ29kZShjb2RlKX1gKTtcbiAgfVxuXG5cbiAgb3B0aW9uYWxPcGVyYXRvcihvcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMubmV4dC5pc09wZXJhdG9yKG9wKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGV4cGVjdE9wZXJhdG9yKG9wZXJhdG9yOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5vcHRpb25hbE9wZXJhdG9yKG9wZXJhdG9yKSkgcmV0dXJuO1xuICAgIHRoaXMuZXJyb3IoYE1pc3NpbmcgZXhwZWN0ZWQgb3BlcmF0b3IgJHtvcGVyYXRvcn1gKTtcbiAgfVxuXG4gIGV4cGVjdElkZW50aWZpZXJPcktleXdvcmQoKTogc3RyaW5nIHtcbiAgICB2YXIgbiA9IHRoaXMubmV4dDtcbiAgICBpZiAoIW4uaXNJZGVudGlmaWVyKCkgJiYgIW4uaXNLZXl3b3JkKCkpIHtcbiAgICAgIHRoaXMuZXJyb3IoYFVuZXhwZWN0ZWQgdG9rZW4gJHtufSwgZXhwZWN0ZWQgaWRlbnRpZmllciBvciBrZXl3b3JkYCk7XG4gICAgfVxuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIHJldHVybiBuLnRvU3RyaW5nKCk7XG4gIH1cblxuICBleHBlY3RJZGVudGlmaWVyT3JLZXl3b3JkT3JTdHJpbmcoKTogc3RyaW5nIHtcbiAgICB2YXIgbiA9IHRoaXMubmV4dDtcbiAgICBpZiAoIW4uaXNJZGVudGlmaWVyKCkgJiYgIW4uaXNLZXl3b3JkKCkgJiYgIW4uaXNTdHJpbmcoKSkge1xuICAgICAgdGhpcy5lcnJvcihgVW5leHBlY3RlZCB0b2tlbiAke259LCBleHBlY3RlZCBpZGVudGlmaWVyLCBrZXl3b3JkLCBvciBzdHJpbmdgKTtcbiAgICB9XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIG4udG9TdHJpbmcoKTtcbiAgfVxuXG4gIHBhcnNlQ2hhaW4oKTogQVNUIHtcbiAgICB2YXIgZXhwcnMgPSBbXTtcbiAgICB3aGlsZSAodGhpcy5pbmRleCA8IHRoaXMudG9rZW5zLmxlbmd0aCkge1xuICAgICAgdmFyIGV4cHIgPSB0aGlzLnBhcnNlUGlwZSgpO1xuICAgICAgZXhwcnMucHVzaChleHByKTtcblxuICAgICAgaWYgKHRoaXMub3B0aW9uYWxDaGFyYWN0ZXIoJFNFTUlDT0xPTikpIHtcbiAgICAgICAgaWYgKCF0aGlzLnBhcnNlQWN0aW9uKSB7XG4gICAgICAgICAgdGhpcy5lcnJvcihcIkJpbmRpbmcgZXhwcmVzc2lvbiBjYW5ub3QgY29udGFpbiBjaGFpbmVkIGV4cHJlc3Npb25cIik7XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKHRoaXMub3B0aW9uYWxDaGFyYWN0ZXIoJFNFTUlDT0xPTikpIHtcbiAgICAgICAgfSAgLy8gcmVhZCBhbGwgc2VtaWNvbG9uc1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmluZGV4IDwgdGhpcy50b2tlbnMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuZXJyb3IoYFVuZXhwZWN0ZWQgdG9rZW4gJyR7dGhpcy5uZXh0fSdgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGV4cHJzLmxlbmd0aCA9PSAwKSByZXR1cm4gbmV3IEVtcHR5RXhwcigpO1xuICAgIGlmIChleHBycy5sZW5ndGggPT0gMSkgcmV0dXJuIGV4cHJzWzBdO1xuICAgIHJldHVybiBuZXcgQ2hhaW4oZXhwcnMpO1xuICB9XG5cbiAgcGFyc2VQaXBlKCk6IEFTVCB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcihcInxcIikpIHtcbiAgICAgIGlmICh0aGlzLnBhcnNlQWN0aW9uKSB7XG4gICAgICAgIHRoaXMuZXJyb3IoXCJDYW5ub3QgaGF2ZSBhIHBpcGUgaW4gYW4gYWN0aW9uIGV4cHJlc3Npb25cIik7XG4gICAgICB9XG5cbiAgICAgIGRvIHtcbiAgICAgICAgdmFyIG5hbWUgPSB0aGlzLmV4cGVjdElkZW50aWZpZXJPcktleXdvcmQoKTtcbiAgICAgICAgdmFyIGFyZ3MgPSBbXTtcbiAgICAgICAgd2hpbGUgKHRoaXMub3B0aW9uYWxDaGFyYWN0ZXIoJENPTE9OKSkge1xuICAgICAgICAgIGFyZ3MucHVzaCh0aGlzLnBhcnNlRXhwcmVzc2lvbigpKTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBuZXcgQmluZGluZ1BpcGUocmVzdWx0LCBuYW1lLCBhcmdzKTtcbiAgICAgIH0gd2hpbGUgKHRoaXMub3B0aW9uYWxPcGVyYXRvcihcInxcIikpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwYXJzZUV4cHJlc3Npb24oKTogQVNUIHsgcmV0dXJuIHRoaXMucGFyc2VDb25kaXRpb25hbCgpOyB9XG5cbiAgcGFyc2VDb25kaXRpb25hbCgpOiBBU1Qge1xuICAgIHZhciBzdGFydCA9IHRoaXMuaW5wdXRJbmRleDtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5wYXJzZUxvZ2ljYWxPcigpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcignPycpKSB7XG4gICAgICB2YXIgeWVzID0gdGhpcy5wYXJzZVBpcGUoKTtcbiAgICAgIGlmICghdGhpcy5vcHRpb25hbENoYXJhY3RlcigkQ09MT04pKSB7XG4gICAgICAgIHZhciBlbmQgPSB0aGlzLmlucHV0SW5kZXg7XG4gICAgICAgIHZhciBleHByZXNzaW9uID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIGVuZCk7XG4gICAgICAgIHRoaXMuZXJyb3IoYENvbmRpdGlvbmFsIGV4cHJlc3Npb24gJHtleHByZXNzaW9ufSByZXF1aXJlcyBhbGwgMyBleHByZXNzaW9uc2ApO1xuICAgICAgfVxuICAgICAgdmFyIG5vID0gdGhpcy5wYXJzZVBpcGUoKTtcbiAgICAgIHJldHVybiBuZXcgQ29uZGl0aW9uYWwocmVzdWx0LCB5ZXMsIG5vKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cblxuICBwYXJzZUxvZ2ljYWxPcigpOiBBU1Qge1xuICAgIC8vICd8fCdcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5wYXJzZUxvZ2ljYWxBbmQoKTtcbiAgICB3aGlsZSAodGhpcy5vcHRpb25hbE9wZXJhdG9yKCd8fCcpKSB7XG4gICAgICByZXN1bHQgPSBuZXcgQmluYXJ5KCd8fCcsIHJlc3VsdCwgdGhpcy5wYXJzZUxvZ2ljYWxBbmQoKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwYXJzZUxvZ2ljYWxBbmQoKTogQVNUIHtcbiAgICAvLyAnJiYnXG4gICAgdmFyIHJlc3VsdCA9IHRoaXMucGFyc2VFcXVhbGl0eSgpO1xuICAgIHdoaWxlICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoJyYmJykpIHtcbiAgICAgIHJlc3VsdCA9IG5ldyBCaW5hcnkoJyYmJywgcmVzdWx0LCB0aGlzLnBhcnNlRXF1YWxpdHkoKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwYXJzZUVxdWFsaXR5KCk6IEFTVCB7XG4gICAgLy8gJz09JywnIT0nLCc9PT0nLCchPT0nXG4gICAgdmFyIHJlc3VsdCA9IHRoaXMucGFyc2VSZWxhdGlvbmFsKCk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoJz09JykpIHtcbiAgICAgICAgcmVzdWx0ID0gbmV3IEJpbmFyeSgnPT0nLCByZXN1bHQsIHRoaXMucGFyc2VSZWxhdGlvbmFsKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoJz09PScpKSB7XG4gICAgICAgIHJlc3VsdCA9IG5ldyBCaW5hcnkoJz09PScsIHJlc3VsdCwgdGhpcy5wYXJzZVJlbGF0aW9uYWwoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcignIT0nKSkge1xuICAgICAgICByZXN1bHQgPSBuZXcgQmluYXJ5KCchPScsIHJlc3VsdCwgdGhpcy5wYXJzZVJlbGF0aW9uYWwoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcignIT09JykpIHtcbiAgICAgICAgcmVzdWx0ID0gbmV3IEJpbmFyeSgnIT09JywgcmVzdWx0LCB0aGlzLnBhcnNlUmVsYXRpb25hbCgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcGFyc2VSZWxhdGlvbmFsKCk6IEFTVCB7XG4gICAgLy8gJzwnLCAnPicsICc8PScsICc+PSdcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5wYXJzZUFkZGl0aXZlKCk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoJzwnKSkge1xuICAgICAgICByZXN1bHQgPSBuZXcgQmluYXJ5KCc8JywgcmVzdWx0LCB0aGlzLnBhcnNlQWRkaXRpdmUoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcignPicpKSB7XG4gICAgICAgIHJlc3VsdCA9IG5ldyBCaW5hcnkoJz4nLCByZXN1bHQsIHRoaXMucGFyc2VBZGRpdGl2ZSgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25hbE9wZXJhdG9yKCc8PScpKSB7XG4gICAgICAgIHJlc3VsdCA9IG5ldyBCaW5hcnkoJzw9JywgcmVzdWx0LCB0aGlzLnBhcnNlQWRkaXRpdmUoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcignPj0nKSkge1xuICAgICAgICByZXN1bHQgPSBuZXcgQmluYXJ5KCc+PScsIHJlc3VsdCwgdGhpcy5wYXJzZUFkZGl0aXZlKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwYXJzZUFkZGl0aXZlKCk6IEFTVCB7XG4gICAgLy8gJysnLCAnLSdcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5wYXJzZU11bHRpcGxpY2F0aXZlKCk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoJysnKSkge1xuICAgICAgICByZXN1bHQgPSBuZXcgQmluYXJ5KCcrJywgcmVzdWx0LCB0aGlzLnBhcnNlTXVsdGlwbGljYXRpdmUoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcignLScpKSB7XG4gICAgICAgIHJlc3VsdCA9IG5ldyBCaW5hcnkoJy0nLCByZXN1bHQsIHRoaXMucGFyc2VNdWx0aXBsaWNhdGl2ZSgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcGFyc2VNdWx0aXBsaWNhdGl2ZSgpOiBBU1Qge1xuICAgIC8vICcqJywgJyUnLCAnLydcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5wYXJzZVByZWZpeCgpO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25hbE9wZXJhdG9yKCcqJykpIHtcbiAgICAgICAgcmVzdWx0ID0gbmV3IEJpbmFyeSgnKicsIHJlc3VsdCwgdGhpcy5wYXJzZVByZWZpeCgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25hbE9wZXJhdG9yKCclJykpIHtcbiAgICAgICAgcmVzdWx0ID0gbmV3IEJpbmFyeSgnJScsIHJlc3VsdCwgdGhpcy5wYXJzZVByZWZpeCgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25hbE9wZXJhdG9yKCcvJykpIHtcbiAgICAgICAgcmVzdWx0ID0gbmV3IEJpbmFyeSgnLycsIHJlc3VsdCwgdGhpcy5wYXJzZVByZWZpeCgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcGFyc2VQcmVmaXgoKTogQVNUIHtcbiAgICBpZiAodGhpcy5vcHRpb25hbE9wZXJhdG9yKCcrJykpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlUHJlZml4KCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoJy0nKSkge1xuICAgICAgcmV0dXJuIG5ldyBCaW5hcnkoJy0nLCBuZXcgTGl0ZXJhbFByaW1pdGl2ZSgwKSwgdGhpcy5wYXJzZVByZWZpeCgpKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcignIScpKSB7XG4gICAgICByZXR1cm4gbmV3IFByZWZpeE5vdCh0aGlzLnBhcnNlUHJlZml4KCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZUNhbGxDaGFpbigpO1xuICAgIH1cbiAgfVxuXG4gIHBhcnNlQ2FsbENoYWluKCk6IEFTVCB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMucGFyc2VQcmltYXJ5KCk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRQRVJJT0QpKSB7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMucGFyc2VBY2Nlc3NNZW1iZXJPck1ldGhvZENhbGwocmVzdWx0LCBmYWxzZSk7XG5cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25hbE9wZXJhdG9yKCc/LicpKSB7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMucGFyc2VBY2Nlc3NNZW1iZXJPck1ldGhvZENhbGwocmVzdWx0LCB0cnVlKTtcblxuICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRMQlJBQ0tFVCkpIHtcbiAgICAgICAgdmFyIGtleSA9IHRoaXMucGFyc2VQaXBlKCk7XG4gICAgICAgIHRoaXMuZXhwZWN0Q2hhcmFjdGVyKCRSQlJBQ0tFVCk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoXCI9XCIpKSB7XG4gICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5wYXJzZUNvbmRpdGlvbmFsKCk7XG4gICAgICAgICAgcmVzdWx0ID0gbmV3IEtleWVkV3JpdGUocmVzdWx0LCBrZXksIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQgPSBuZXcgS2V5ZWRSZWFkKHJlc3VsdCwga2V5KTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9uYWxDaGFyYWN0ZXIoJExQQVJFTikpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSB0aGlzLnBhcnNlQ2FsbEFyZ3VtZW50cygpO1xuICAgICAgICB0aGlzLmV4cGVjdENoYXJhY3RlcigkUlBBUkVOKTtcbiAgICAgICAgcmVzdWx0ID0gbmV3IEZ1bmN0aW9uQ2FsbChyZXN1bHQsIGFyZ3MpO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHBhcnNlUHJpbWFyeSgpOiBBU1Qge1xuICAgIGlmICh0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRMUEFSRU4pKSB7XG4gICAgICBsZXQgcmVzdWx0ID0gdGhpcy5wYXJzZVBpcGUoKTtcbiAgICAgIHRoaXMuZXhwZWN0Q2hhcmFjdGVyKCRSUEFSRU4pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGVsc2UgaWYgKHRoaXMubmV4dC5pc0tleXdvcmROdWxsKCkgfHwgdGhpcy5uZXh0LmlzS2V5d29yZFVuZGVmaW5lZCgpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgTGl0ZXJhbFByaW1pdGl2ZShudWxsKTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5uZXh0LmlzS2V5d29yZFRydWUoKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IExpdGVyYWxQcmltaXRpdmUodHJ1ZSk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMubmV4dC5pc0tleXdvcmRGYWxzZSgpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgTGl0ZXJhbFByaW1pdGl2ZShmYWxzZSk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9uYWxDaGFyYWN0ZXIoJExCUkFDS0VUKSkge1xuICAgICAgdmFyIGVsZW1lbnRzID0gdGhpcy5wYXJzZUV4cHJlc3Npb25MaXN0KCRSQlJBQ0tFVCk7XG4gICAgICB0aGlzLmV4cGVjdENoYXJhY3RlcigkUkJSQUNLRVQpO1xuICAgICAgcmV0dXJuIG5ldyBMaXRlcmFsQXJyYXkoZWxlbWVudHMpO1xuXG4gICAgfSBlbHNlIGlmICh0aGlzLm5leHQuaXNDaGFyYWN0ZXIoJExCUkFDRSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlTGl0ZXJhbE1hcCgpO1xuXG4gICAgfSBlbHNlIGlmICh0aGlzLm5leHQuaXNJZGVudGlmaWVyKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlQWNjZXNzTWVtYmVyT3JNZXRob2RDYWxsKF9pbXBsaWNpdFJlY2VpdmVyLCBmYWxzZSk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMubmV4dC5pc051bWJlcigpKSB7XG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLm5leHQudG9OdW1iZXIoKTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBMaXRlcmFsUHJpbWl0aXZlKHZhbHVlKTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5uZXh0LmlzU3RyaW5nKCkpIHtcbiAgICAgIHZhciBsaXRlcmFsVmFsdWUgPSB0aGlzLm5leHQudG9TdHJpbmcoKTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBMaXRlcmFsUHJpbWl0aXZlKGxpdGVyYWxWYWx1ZSk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMuaW5kZXggPj0gdGhpcy50b2tlbnMubGVuZ3RoKSB7XG4gICAgICB0aGlzLmVycm9yKGBVbmV4cGVjdGVkIGVuZCBvZiBleHByZXNzaW9uOiAke3RoaXMuaW5wdXR9YCk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lcnJvcihgVW5leHBlY3RlZCB0b2tlbiAke3RoaXMubmV4dH1gKTtcbiAgICB9XG4gICAgLy8gZXJyb3IoKSB0aHJvd3MsIHNvIHdlIGRvbid0IHJlYWNoIGhlcmUuXG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJGZWxsIHRocm91Z2ggYWxsIGNhc2VzIGluIHBhcnNlUHJpbWFyeVwiKTtcbiAgfVxuXG4gIHBhcnNlRXhwcmVzc2lvbkxpc3QodGVybWluYXRvcjogbnVtYmVyKTogYW55W10ge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICBpZiAoIXRoaXMubmV4dC5pc0NoYXJhY3Rlcih0ZXJtaW5hdG9yKSkge1xuICAgICAgZG8ge1xuICAgICAgICByZXN1bHQucHVzaCh0aGlzLnBhcnNlUGlwZSgpKTtcbiAgICAgIH0gd2hpbGUgKHRoaXMub3B0aW9uYWxDaGFyYWN0ZXIoJENPTU1BKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwYXJzZUxpdGVyYWxNYXAoKTogTGl0ZXJhbE1hcCB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgdGhpcy5leHBlY3RDaGFyYWN0ZXIoJExCUkFDRSk7XG4gICAgaWYgKCF0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRSQlJBQ0UpKSB7XG4gICAgICBkbyB7XG4gICAgICAgIHZhciBrZXkgPSB0aGlzLmV4cGVjdElkZW50aWZpZXJPcktleXdvcmRPclN0cmluZygpO1xuICAgICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICAgICAgdGhpcy5leHBlY3RDaGFyYWN0ZXIoJENPTE9OKTtcbiAgICAgICAgdmFsdWVzLnB1c2godGhpcy5wYXJzZVBpcGUoKSk7XG4gICAgICB9IHdoaWxlICh0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRDT01NQSkpO1xuICAgICAgdGhpcy5leHBlY3RDaGFyYWN0ZXIoJFJCUkFDRSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTGl0ZXJhbE1hcChrZXlzLCB2YWx1ZXMpO1xuICB9XG5cbiAgcGFyc2VBY2Nlc3NNZW1iZXJPck1ldGhvZENhbGwocmVjZWl2ZXI6IEFTVCwgaXNTYWZlOiBib29sZWFuID0gZmFsc2UpOiBBU1Qge1xuICAgIGxldCBpZCA9IHRoaXMuZXhwZWN0SWRlbnRpZmllck9yS2V5d29yZCgpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9uYWxDaGFyYWN0ZXIoJExQQVJFTikpIHtcbiAgICAgIGxldCBhcmdzID0gdGhpcy5wYXJzZUNhbGxBcmd1bWVudHMoKTtcbiAgICAgIHRoaXMuZXhwZWN0Q2hhcmFjdGVyKCRSUEFSRU4pO1xuICAgICAgbGV0IGZuID0gdGhpcy5yZWZsZWN0b3IubWV0aG9kKGlkKTtcbiAgICAgIHJldHVybiBpc1NhZmUgPyBuZXcgU2FmZU1ldGhvZENhbGwocmVjZWl2ZXIsIGlkLCBmbiwgYXJncykgOlxuICAgICAgICAgICAgICAgICAgICAgIG5ldyBNZXRob2RDYWxsKHJlY2VpdmVyLCBpZCwgZm4sIGFyZ3MpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpc1NhZmUpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcihcIj1cIikpIHtcbiAgICAgICAgICB0aGlzLmVycm9yKFwiVGhlICc/Licgb3BlcmF0b3IgY2Fubm90IGJlIHVzZWQgaW4gdGhlIGFzc2lnbm1lbnRcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBTYWZlUHJvcGVydHlSZWFkKHJlY2VpdmVyLCBpZCwgdGhpcy5yZWZsZWN0b3IuZ2V0dGVyKGlkKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoXCI9XCIpKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLnBhcnNlQWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9yKFwiQmluZGluZ3MgY2Fubm90IGNvbnRhaW4gYXNzaWdubWVudHNcIik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5wYXJzZUNvbmRpdGlvbmFsKCk7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVdyaXRlKHJlY2VpdmVyLCBpZCwgdGhpcy5yZWZsZWN0b3Iuc2V0dGVyKGlkKSwgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvcGVydHlSZWFkKHJlY2VpdmVyLCBpZCwgdGhpcy5yZWZsZWN0b3IuZ2V0dGVyKGlkKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHBhcnNlQ2FsbEFyZ3VtZW50cygpOiBCaW5kaW5nUGlwZVtdIHtcbiAgICBpZiAodGhpcy5uZXh0LmlzQ2hhcmFjdGVyKCRSUEFSRU4pKSByZXR1cm4gW107XG4gICAgdmFyIHBvc2l0aW9uYWxzID0gW107XG4gICAgZG8ge1xuICAgICAgcG9zaXRpb25hbHMucHVzaCh0aGlzLnBhcnNlUGlwZSgpKTtcbiAgICB9IHdoaWxlICh0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRDT01NQSkpO1xuICAgIHJldHVybiBwb3NpdGlvbmFscztcbiAgfVxuXG4gIHBhcnNlQmxvY2tDb250ZW50KCk6IEFTVCB7XG4gICAgaWYgKCF0aGlzLnBhcnNlQWN0aW9uKSB7XG4gICAgICB0aGlzLmVycm9yKFwiQmluZGluZyBleHByZXNzaW9uIGNhbm5vdCBjb250YWluIGNoYWluZWQgZXhwcmVzc2lvblwiKTtcbiAgICB9XG4gICAgdmFyIGV4cHJzID0gW107XG4gICAgd2hpbGUgKHRoaXMuaW5kZXggPCB0aGlzLnRva2Vucy5sZW5ndGggJiYgIXRoaXMubmV4dC5pc0NoYXJhY3RlcigkUkJSQUNFKSkge1xuICAgICAgdmFyIGV4cHIgPSB0aGlzLnBhcnNlRXhwcmVzc2lvbigpO1xuICAgICAgZXhwcnMucHVzaChleHByKTtcblxuICAgICAgaWYgKHRoaXMub3B0aW9uYWxDaGFyYWN0ZXIoJFNFTUlDT0xPTikpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMub3B0aW9uYWxDaGFyYWN0ZXIoJFNFTUlDT0xPTikpIHtcbiAgICAgICAgfSAgLy8gcmVhZCBhbGwgc2VtaWNvbG9uc1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZXhwcnMubGVuZ3RoID09IDApIHJldHVybiBuZXcgRW1wdHlFeHByKCk7XG4gICAgaWYgKGV4cHJzLmxlbmd0aCA9PSAxKSByZXR1cm4gZXhwcnNbMF07XG5cbiAgICByZXR1cm4gbmV3IENoYWluKGV4cHJzKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEFuIGlkZW50aWZpZXIsIGEga2V5d29yZCwgYSBzdHJpbmcgd2l0aCBhbiBvcHRpb25hbCBgLWAgaW5iZXR3ZWVuLlxuICAgKi9cbiAgZXhwZWN0VGVtcGxhdGVCaW5kaW5nS2V5KCk6IHN0cmluZyB7XG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIHZhciBvcGVyYXRvckZvdW5kID0gZmFsc2U7XG4gICAgZG8ge1xuICAgICAgcmVzdWx0ICs9IHRoaXMuZXhwZWN0SWRlbnRpZmllck9yS2V5d29yZE9yU3RyaW5nKCk7XG4gICAgICBvcGVyYXRvckZvdW5kID0gdGhpcy5vcHRpb25hbE9wZXJhdG9yKCctJyk7XG4gICAgICBpZiAob3BlcmF0b3JGb3VuZCkge1xuICAgICAgICByZXN1bHQgKz0gJy0nO1xuICAgICAgfVxuICAgIH0gd2hpbGUgKG9wZXJhdG9yRm91bmQpO1xuXG4gICAgcmV0dXJuIHJlc3VsdC50b1N0cmluZygpO1xuICB9XG5cbiAgcGFyc2VUZW1wbGF0ZUJpbmRpbmdzKCk6IGFueVtdIHtcbiAgICB2YXIgYmluZGluZ3MgPSBbXTtcbiAgICB2YXIgcHJlZml4ID0gbnVsbDtcbiAgICB3aGlsZSAodGhpcy5pbmRleCA8IHRoaXMudG9rZW5zLmxlbmd0aCkge1xuICAgICAgdmFyIGtleUlzVmFyOiBib29sZWFuID0gdGhpcy5vcHRpb25hbEtleXdvcmRWYXIoKTtcbiAgICAgIHZhciBrZXkgPSB0aGlzLmV4cGVjdFRlbXBsYXRlQmluZGluZ0tleSgpO1xuICAgICAgaWYgKCFrZXlJc1Zhcikge1xuICAgICAgICBpZiAocHJlZml4ID09IG51bGwpIHtcbiAgICAgICAgICBwcmVmaXggPSBrZXk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAga2V5ID0gcHJlZml4ICsgJy0nICsga2V5O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRDT0xPTik7XG4gICAgICB2YXIgbmFtZSA9IG51bGw7XG4gICAgICB2YXIgZXhwcmVzc2lvbiA9IG51bGw7XG4gICAgICBpZiAoa2V5SXNWYXIpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcihcIj1cIikpIHtcbiAgICAgICAgICBuYW1lID0gdGhpcy5leHBlY3RUZW1wbGF0ZUJpbmRpbmdLZXkoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuYW1lID0gJ1xcJGltcGxpY2l0JztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0aGlzLm5leHQgIT09IEVPRiAmJiAhdGhpcy5wZWVrS2V5d29yZFZhcigpKSB7XG4gICAgICAgIHZhciBzdGFydCA9IHRoaXMuaW5wdXRJbmRleDtcbiAgICAgICAgdmFyIGFzdCA9IHRoaXMucGFyc2VQaXBlKCk7XG4gICAgICAgIHZhciBzb3VyY2UgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhzdGFydCwgdGhpcy5pbnB1dEluZGV4KTtcbiAgICAgICAgZXhwcmVzc2lvbiA9IG5ldyBBU1RXaXRoU291cmNlKGFzdCwgc291cmNlLCB0aGlzLmxvY2F0aW9uKTtcbiAgICAgIH1cbiAgICAgIGJpbmRpbmdzLnB1c2gobmV3IFRlbXBsYXRlQmluZGluZyhrZXksIGtleUlzVmFyLCBuYW1lLCBleHByZXNzaW9uKSk7XG4gICAgICBpZiAoIXRoaXMub3B0aW9uYWxDaGFyYWN0ZXIoJFNFTUlDT0xPTikpIHtcbiAgICAgICAgdGhpcy5vcHRpb25hbENoYXJhY3RlcigkQ09NTUEpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYmluZGluZ3M7XG4gIH1cblxuICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIGluZGV4OiBudW1iZXIgPSBudWxsKSB7XG4gICAgaWYgKGlzQmxhbmsoaW5kZXgpKSBpbmRleCA9IHRoaXMuaW5kZXg7XG5cbiAgICB2YXIgbG9jYXRpb24gPSAoaW5kZXggPCB0aGlzLnRva2Vucy5sZW5ndGgpID8gYGF0IGNvbHVtbiAke3RoaXMudG9rZW5zW2luZGV4XS5pbmRleCArIDF9IGluYCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBhdCB0aGUgZW5kIG9mIHRoZSBleHByZXNzaW9uYDtcblxuICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbihtZXNzYWdlLCB0aGlzLmlucHV0LCBsb2NhdGlvbiwgdGhpcy5sb2NhdGlvbik7XG4gIH1cbn1cblxuY2xhc3MgU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIgaW1wbGVtZW50cyBBc3RWaXNpdG9yIHtcbiAgc3RhdGljIGNoZWNrKGFzdDogQVNUKTogYm9vbGVhbiB7XG4gICAgdmFyIHMgPSBuZXcgU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIoKTtcbiAgICBhc3QudmlzaXQocyk7XG4gICAgcmV0dXJuIHMuc2ltcGxlO1xuICB9XG5cbiAgc2ltcGxlID0gdHJ1ZTtcblxuICB2aXNpdEltcGxpY2l0UmVjZWl2ZXIoYXN0OiBJbXBsaWNpdFJlY2VpdmVyKSB7fVxuXG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IEludGVycG9sYXRpb24pIHsgdGhpcy5zaW1wbGUgPSBmYWxzZTsgfVxuXG4gIHZpc2l0TGl0ZXJhbFByaW1pdGl2ZShhc3Q6IExpdGVyYWxQcmltaXRpdmUpIHt9XG5cbiAgdmlzaXRQcm9wZXJ0eVJlYWQoYXN0OiBQcm9wZXJ0eVJlYWQpIHt9XG5cbiAgdmlzaXRQcm9wZXJ0eVdyaXRlKGFzdDogUHJvcGVydHlXcml0ZSkgeyB0aGlzLnNpbXBsZSA9IGZhbHNlOyB9XG5cbiAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdDogU2FmZVByb3BlcnR5UmVhZCkgeyB0aGlzLnNpbXBsZSA9IGZhbHNlOyB9XG5cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCkgeyB0aGlzLnNpbXBsZSA9IGZhbHNlOyB9XG5cbiAgdmlzaXRTYWZlTWV0aG9kQ2FsbChhc3Q6IFNhZmVNZXRob2RDYWxsKSB7IHRoaXMuc2ltcGxlID0gZmFsc2U7IH1cblxuICB2aXNpdEZ1bmN0aW9uQ2FsbChhc3Q6IEZ1bmN0aW9uQ2FsbCkgeyB0aGlzLnNpbXBsZSA9IGZhbHNlOyB9XG5cbiAgdmlzaXRMaXRlcmFsQXJyYXkoYXN0OiBMaXRlcmFsQXJyYXkpIHsgdGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMpOyB9XG5cbiAgdmlzaXRMaXRlcmFsTWFwKGFzdDogTGl0ZXJhbE1hcCkgeyB0aGlzLnZpc2l0QWxsKGFzdC52YWx1ZXMpOyB9XG5cbiAgdmlzaXRCaW5hcnkoYXN0OiBCaW5hcnkpIHsgdGhpcy5zaW1wbGUgPSBmYWxzZTsgfVxuXG4gIHZpc2l0UHJlZml4Tm90KGFzdDogUHJlZml4Tm90KSB7IHRoaXMuc2ltcGxlID0gZmFsc2U7IH1cblxuICB2aXNpdENvbmRpdGlvbmFsKGFzdDogQ29uZGl0aW9uYWwpIHsgdGhpcy5zaW1wbGUgPSBmYWxzZTsgfVxuXG4gIHZpc2l0UGlwZShhc3Q6IEJpbmRpbmdQaXBlKSB7IHRoaXMuc2ltcGxlID0gZmFsc2U7IH1cblxuICB2aXNpdEtleWVkUmVhZChhc3Q6IEtleWVkUmVhZCkgeyB0aGlzLnNpbXBsZSA9IGZhbHNlOyB9XG5cbiAgdmlzaXRLZXllZFdyaXRlKGFzdDogS2V5ZWRXcml0ZSkgeyB0aGlzLnNpbXBsZSA9IGZhbHNlOyB9XG5cbiAgdmlzaXRBbGwoYXN0czogYW55W10pOiBhbnlbXSB7XG4gICAgdmFyIHJlcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShhc3RzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhc3RzLmxlbmd0aDsgKytpKSB7XG4gICAgICByZXNbaV0gPSBhc3RzW2ldLnZpc2l0KHRoaXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgdmlzaXRDaGFpbihhc3Q6IENoYWluKSB7IHRoaXMuc2ltcGxlID0gZmFsc2U7IH1cblxuICB2aXNpdFF1b3RlKGFzdDogUXVvdGUpIHsgdGhpcy5zaW1wbGUgPSBmYWxzZTsgfVxufVxuIl19