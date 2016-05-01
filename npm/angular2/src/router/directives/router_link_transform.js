'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var compiler_1 = require('angular2/compiler');
var ast_1 = require('angular2/src/compiler/expression_parser/ast');
var exceptions_1 = require('angular2/src/facade/exceptions');
var core_1 = require('angular2/core');
var parser_1 = require('angular2/src/compiler/expression_parser/parser');
/**
 * e.g., './User', 'Modal' in ./User[Modal(param: value)]
 */
var FixedPart = (function () {
    function FixedPart(value) {
        this.value = value;
    }
    return FixedPart;
}());
/**
 * The square bracket
 */
var AuxiliaryStart = (function () {
    function AuxiliaryStart() {
    }
    return AuxiliaryStart;
}());
/**
 * The square bracket
 */
var AuxiliaryEnd = (function () {
    function AuxiliaryEnd() {
    }
    return AuxiliaryEnd;
}());
/**
 * e.g., param:value in ./User[Modal(param: value)]
 */
var Params = (function () {
    function Params(ast) {
        this.ast = ast;
    }
    return Params;
}());
var RouterLinkLexer = (function () {
    function RouterLinkLexer(parser, exp) {
        this.parser = parser;
        this.exp = exp;
        this.index = 0;
    }
    RouterLinkLexer.prototype.tokenize = function () {
        var tokens = [];
        while (this.index < this.exp.length) {
            tokens.push(this._parseToken());
        }
        return tokens;
    };
    RouterLinkLexer.prototype._parseToken = function () {
        var c = this.exp[this.index];
        if (c == '[') {
            this.index++;
            return new AuxiliaryStart();
        }
        else if (c == ']') {
            this.index++;
            return new AuxiliaryEnd();
        }
        else if (c == '(') {
            return this._parseParams();
        }
        else if (c == '/' && this.index !== 0) {
            this.index++;
            return this._parseFixedPart();
        }
        else {
            return this._parseFixedPart();
        }
    };
    RouterLinkLexer.prototype._parseParams = function () {
        var start = this.index;
        for (; this.index < this.exp.length; ++this.index) {
            var c = this.exp[this.index];
            if (c == ')') {
                var paramsContent = this.exp.substring(start + 1, this.index);
                this.index++;
                return new Params(this.parser.parseBinding("{" + paramsContent + "}", null).ast);
            }
        }
        throw new exceptions_1.BaseException("Cannot find ')'");
    };
    RouterLinkLexer.prototype._parseFixedPart = function () {
        var start = this.index;
        var sawNonSlash = false;
        for (; this.index < this.exp.length; ++this.index) {
            var c = this.exp[this.index];
            if (c == '(' || c == '[' || c == ']' || (c == '/' && sawNonSlash)) {
                break;
            }
            if (c != '.' && c != '/') {
                sawNonSlash = true;
            }
        }
        var fixed = this.exp.substring(start, this.index);
        if (start === this.index || !sawNonSlash || fixed.startsWith('//')) {
            throw new exceptions_1.BaseException("Invalid router link");
        }
        return new FixedPart(fixed);
    };
    return RouterLinkLexer;
}());
var RouterLinkAstGenerator = (function () {
    function RouterLinkAstGenerator(tokens) {
        this.tokens = tokens;
        this.index = 0;
    }
    RouterLinkAstGenerator.prototype.generate = function () { return this._genAuxiliary(); };
    RouterLinkAstGenerator.prototype._genAuxiliary = function () {
        var arr = [];
        for (; this.index < this.tokens.length; this.index++) {
            var r = this.tokens[this.index];
            if (r instanceof FixedPart) {
                arr.push(new ast_1.LiteralPrimitive(r.value));
            }
            else if (r instanceof Params) {
                arr.push(r.ast);
            }
            else if (r instanceof AuxiliaryEnd) {
                break;
            }
            else if (r instanceof AuxiliaryStart) {
                this.index++;
                arr.push(this._genAuxiliary());
            }
        }
        return new ast_1.LiteralArray(arr);
    };
    return RouterLinkAstGenerator;
}());
var RouterLinkAstTransformer = (function (_super) {
    __extends(RouterLinkAstTransformer, _super);
    function RouterLinkAstTransformer(parser) {
        _super.call(this);
        this.parser = parser;
    }
    RouterLinkAstTransformer.prototype.visitQuote = function (ast, context) {
        if (ast.prefix == "route") {
            return parseRouterLinkExpression(this.parser, ast.uninterpretedExpression);
        }
        else {
            return _super.prototype.visitQuote.call(this, ast, context);
        }
    };
    return RouterLinkAstTransformer;
}(ast_1.AstTransformer));
function parseRouterLinkExpression(parser, exp) {
    var tokens = new RouterLinkLexer(parser, exp.trim()).tokenize();
    return new RouterLinkAstGenerator(tokens).generate();
}
exports.parseRouterLinkExpression = parseRouterLinkExpression;
/**
 * A compiler plugin that implements the router link DSL.
 */
var RouterLinkTransform = (function () {
    function RouterLinkTransform(parser) {
        this.astTransformer = new RouterLinkAstTransformer(parser);
    }
    RouterLinkTransform.prototype.visitNgContent = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitEmbeddedTemplate = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitElement = function (ast, context) {
        var _this = this;
        var updatedChildren = ast.children.map(function (c) { return c.visit(_this, context); });
        var updatedInputs = ast.inputs.map(function (c) { return c.visit(_this, context); });
        var updatedDirectives = ast.directives.map(function (c) { return c.visit(_this, context); });
        return new compiler_1.ElementAst(ast.name, ast.attrs, updatedInputs, ast.outputs, ast.references, updatedDirectives, ast.providers, ast.hasViewContainer, updatedChildren, ast.ngContentIndex, ast.sourceSpan);
    };
    RouterLinkTransform.prototype.visitReference = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitVariable = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitEvent = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitElementProperty = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitAttr = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitBoundText = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitText = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitDirective = function (ast, context) {
        var _this = this;
        var updatedInputs = ast.inputs.map(function (c) { return c.visit(_this, context); });
        return new compiler_1.DirectiveAst(ast.directive, updatedInputs, ast.hostProperties, ast.hostEvents, ast.sourceSpan);
    };
    RouterLinkTransform.prototype.visitDirectiveProperty = function (ast, context) {
        var transformedValue = ast.value.visit(this.astTransformer);
        return new compiler_1.BoundDirectivePropertyAst(ast.directiveName, ast.templateName, transformedValue, ast.sourceSpan);
    };
    RouterLinkTransform = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [parser_1.Parser])
    ], RouterLinkTransform);
    return RouterLinkTransform;
}());
exports.RouterLinkTransform = RouterLinkTransform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmtfdHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL3JvdXRlci9kaXJlY3RpdmVzL3JvdXRlcl9saW5rX3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5QkFNTyxtQkFBbUIsQ0FBQyxDQUFBO0FBQzNCLG9CQVFPLDZDQUE2QyxDQUFDLENBQUE7QUFDckQsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0QscUJBQXlCLGVBQWUsQ0FBQyxDQUFBO0FBQ3pDLHVCQUFxQixnREFBZ0QsQ0FBQyxDQUFBO0FBRXRFOztHQUVHO0FBQ0g7SUFDRSxtQkFBbUIsS0FBYTtRQUFiLFVBQUssR0FBTCxLQUFLLENBQVE7SUFBRyxDQUFDO0lBQ3RDLGdCQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFFRDs7R0FFRztBQUNIO0lBQ0U7SUFBZSxDQUFDO0lBQ2xCLHFCQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFFRDs7R0FFRztBQUNIO0lBQ0U7SUFBZSxDQUFDO0lBQ2xCLG1CQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFFRDs7R0FFRztBQUNIO0lBQ0UsZ0JBQW1CLEdBQVE7UUFBUixRQUFHLEdBQUgsR0FBRyxDQUFLO0lBQUcsQ0FBQztJQUNqQyxhQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFFRDtJQUdFLHlCQUFvQixNQUFjLEVBQVUsR0FBVztRQUFuQyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQVUsUUFBRyxHQUFILEdBQUcsQ0FBUTtRQUZ2RCxVQUFLLEdBQVcsQ0FBQyxDQUFDO0lBRXdDLENBQUM7SUFFM0Qsa0NBQVEsR0FBUjtRQUNFLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNoQixPQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdB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QUE5QyxpQkFJQztRQUhDLElBQUksYUFBYSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFJLEVBQUUsT0FBTyxDQUFDLEVBQXRCLENBQXNCLENBQUMsQ0FBQztRQUNoRSxNQUFNLENBQUMsSUFBSSx1QkFBWSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFLEdBQUcsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLFVBQVUsRUFDaEUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxvREFBc0IsR0FBdEIsVUFBdUIsR0FBOEIsRUFBRSxPQUFZO1FBQ2pFLElBQUksZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzVELE1BQU0sQ0FBQyxJQUFJLG9DQUF5QixDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFDckQsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUEzQ0g7UUFBQyxpQkFBVSxFQUFFOzsyQkFBQTtJQTRDYiwwQkFBQztBQUFELENBQUMsQUEzQ0QsSUEyQ0M7QUEzQ1ksMkJBQW1CLHNCQTJDL0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFRlbXBsYXRlQXN0VmlzaXRvcixcbiAgRWxlbWVudEFzdCxcbiAgQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCxcbiAgRGlyZWN0aXZlQXN0LFxuICBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFxufSBmcm9tICdhbmd1bGFyMi9jb21waWxlcic7XG5pbXBvcnQge1xuICBBc3RUcmFuc2Zvcm1lcixcbiAgUXVvdGUsXG4gIEFTVCxcbiAgRW1wdHlFeHByLFxuICBMaXRlcmFsQXJyYXksXG4gIExpdGVyYWxQcmltaXRpdmUsXG4gIEFTVFdpdGhTb3VyY2Vcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2V4cHJlc3Npb25fcGFyc2VyL2FzdCc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtQYXJzZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9leHByZXNzaW9uX3BhcnNlci9wYXJzZXInO1xuXG4vKipcbiAqIGUuZy4sICcuL1VzZXInLCAnTW9kYWwnIGluIC4vVXNlcltNb2RhbChwYXJhbTogdmFsdWUpXVxuICovXG5jbGFzcyBGaXhlZFBhcnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsdWU6IHN0cmluZykge31cbn1cblxuLyoqXG4gKiBUaGUgc3F1YXJlIGJyYWNrZXRcbiAqL1xuY2xhc3MgQXV4aWxpYXJ5U3RhcnQge1xuICBjb25zdHJ1Y3RvcigpIHt9XG59XG5cbi8qKlxuICogVGhlIHNxdWFyZSBicmFja2V0XG4gKi9cbmNsYXNzIEF1eGlsaWFyeUVuZCB7XG4gIGNvbnN0cnVjdG9yKCkge31cbn1cblxuLyoqXG4gKiBlLmcuLCBwYXJhbTp2YWx1ZSBpbiAuL1VzZXJbTW9kYWwocGFyYW06IHZhbHVlKV1cbiAqL1xuY2xhc3MgUGFyYW1zIHtcbiAgY29uc3RydWN0b3IocHVibGljIGFzdDogQVNUKSB7fVxufVxuXG5jbGFzcyBSb3V0ZXJMaW5rTGV4ZXIge1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBhcnNlcjogUGFyc2VyLCBwcml2YXRlIGV4cDogc3RyaW5nKSB7fVxuXG4gIHRva2VuaXplKCk6IEFycmF5PEZpeGVkUGFydCB8IEF1eGlsaWFyeVN0YXJ0IHwgQXV4aWxpYXJ5RW5kIHwgUGFyYW1zPiB7XG4gICAgbGV0IHRva2VucyA9IFtdO1xuICAgIHdoaWxlICh0aGlzLmluZGV4IDwgdGhpcy5leHAubGVuZ3RoKSB7XG4gICAgICB0b2tlbnMucHVzaCh0aGlzLl9wYXJzZVRva2VuKCkpO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VUb2tlbigpIHtcbiAgICBsZXQgYyA9IHRoaXMuZXhwW3RoaXMuaW5kZXhdO1xuICAgIGlmIChjID09ICdbJykge1xuICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgcmV0dXJuIG5ldyBBdXhpbGlhcnlTdGFydCgpO1xuXG4gICAgfSBlbHNlIGlmIChjID09ICddJykge1xuICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgcmV0dXJuIG5ldyBBdXhpbGlhcnlFbmQoKTtcblxuICAgIH0gZWxzZSBpZiAoYyA9PSAnKCcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wYXJzZVBhcmFtcygpO1xuXG4gICAgfSBlbHNlIGlmIChjID09ICcvJyAmJiB0aGlzLmluZGV4ICE9PSAwKSB7XG4gICAgICB0aGlzLmluZGV4Kys7XG4gICAgICByZXR1cm4gdGhpcy5fcGFyc2VGaXhlZFBhcnQoKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGFyc2VGaXhlZFBhcnQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVBhcmFtcygpIHtcbiAgICBsZXQgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIGZvciAoOyB0aGlzLmluZGV4IDwgdGhpcy5leHAubGVuZ3RoOyArK3RoaXMuaW5kZXgpIHtcbiAgICAgIGxldCBjID0gdGhpcy5leHBbdGhpcy5pbmRleF07XG4gICAgICBpZiAoYyA9PSAnKScpIHtcbiAgICAgICAgbGV0IHBhcmFtc0NvbnRlbnQgPSB0aGlzLmV4cC5zdWJzdHJpbmcoc3RhcnQgKyAxLCB0aGlzLmluZGV4KTtcbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgICByZXR1cm4gbmV3IFBhcmFtcyh0aGlzLnBhcnNlci5wYXJzZUJpbmRpbmcoYHske3BhcmFtc0NvbnRlbnR9fWAsIG51bGwpLmFzdCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwiQ2Fubm90IGZpbmQgJyknXCIpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VGaXhlZFBhcnQoKSB7XG4gICAgbGV0IHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICBsZXQgc2F3Tm9uU2xhc2ggPSBmYWxzZTtcblxuXG4gICAgZm9yICg7IHRoaXMuaW5kZXggPCB0aGlzLmV4cC5sZW5ndGg7ICsrdGhpcy5pbmRleCkge1xuICAgICAgbGV0IGMgPSB0aGlzLmV4cFt0aGlzLmluZGV4XTtcblxuICAgICAgaWYgKGMgPT0gJygnIHx8IGMgPT0gJ1snIHx8IGMgPT0gJ10nIHx8IChjID09ICcvJyAmJiBzYXdOb25TbGFzaCkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGlmIChjICE9ICcuJyAmJiBjICE9ICcvJykge1xuICAgICAgICBzYXdOb25TbGFzaCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGZpeGVkID0gdGhpcy5leHAuc3Vic3RyaW5nKHN0YXJ0LCB0aGlzLmluZGV4KTtcblxuICAgIGlmIChzdGFydCA9PT0gdGhpcy5pbmRleCB8fCAhc2F3Tm9uU2xhc2ggfHwgZml4ZWQuc3RhcnRzV2l0aCgnLy8nKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJJbnZhbGlkIHJvdXRlciBsaW5rXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgRml4ZWRQYXJ0KGZpeGVkKTtcbiAgfVxufVxuXG5jbGFzcyBSb3V0ZXJMaW5rQXN0R2VuZXJhdG9yIHtcbiAgaW5kZXg6IG51bWJlciA9IDA7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgdG9rZW5zOiBhbnlbXSkge31cblxuICBnZW5lcmF0ZSgpOiBBU1QgeyByZXR1cm4gdGhpcy5fZ2VuQXV4aWxpYXJ5KCk7IH1cblxuICBwcml2YXRlIF9nZW5BdXhpbGlhcnkoKTogQVNUIHtcbiAgICBsZXQgYXJyID0gW107XG4gICAgZm9yICg7IHRoaXMuaW5kZXggPCB0aGlzLnRva2Vucy5sZW5ndGg7IHRoaXMuaW5kZXgrKykge1xuICAgICAgbGV0IHIgPSB0aGlzLnRva2Vuc1t0aGlzLmluZGV4XTtcblxuICAgICAgaWYgKHIgaW5zdGFuY2VvZiBGaXhlZFBhcnQpIHtcbiAgICAgICAgYXJyLnB1c2gobmV3IExpdGVyYWxQcmltaXRpdmUoci52YWx1ZSkpO1xuXG4gICAgICB9IGVsc2UgaWYgKHIgaW5zdGFuY2VvZiBQYXJhbXMpIHtcbiAgICAgICAgYXJyLnB1c2goci5hc3QpO1xuXG4gICAgICB9IGVsc2UgaWYgKHIgaW5zdGFuY2VvZiBBdXhpbGlhcnlFbmQpIHtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIH0gZWxzZSBpZiAociBpbnN0YW5jZW9mIEF1eGlsaWFyeVN0YXJ0KSB7XG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgYXJyLnB1c2godGhpcy5fZ2VuQXV4aWxpYXJ5KCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgTGl0ZXJhbEFycmF5KGFycik7XG4gIH1cbn1cblxuY2xhc3MgUm91dGVyTGlua0FzdFRyYW5zZm9ybWVyIGV4dGVuZHMgQXN0VHJhbnNmb3JtZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBhcnNlcjogUGFyc2VyKSB7IHN1cGVyKCk7IH1cblxuICB2aXNpdFF1b3RlKGFzdDogUXVvdGUsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgaWYgKGFzdC5wcmVmaXggPT0gXCJyb3V0ZVwiKSB7XG4gICAgICByZXR1cm4gcGFyc2VSb3V0ZXJMaW5rRXhwcmVzc2lvbih0aGlzLnBhcnNlciwgYXN0LnVuaW50ZXJwcmV0ZWRFeHByZXNzaW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN1cGVyLnZpc2l0UXVvdGUoYXN0LCBjb250ZXh0KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUm91dGVyTGlua0V4cHJlc3Npb24ocGFyc2VyOiBQYXJzZXIsIGV4cDogc3RyaW5nKTogQVNUIHtcbiAgbGV0IHRva2VucyA9IG5ldyBSb3V0ZXJMaW5rTGV4ZXIocGFyc2VyLCBleHAudHJpbSgpKS50b2tlbml6ZSgpO1xuICByZXR1cm4gbmV3IFJvdXRlckxpbmtBc3RHZW5lcmF0b3IodG9rZW5zKS5nZW5lcmF0ZSgpO1xufVxuXG4vKipcbiAqIEEgY29tcGlsZXIgcGx1Z2luIHRoYXQgaW1wbGVtZW50cyB0aGUgcm91dGVyIGxpbmsgRFNMLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm91dGVyTGlua1RyYW5zZm9ybSBpbXBsZW1lbnRzIFRlbXBsYXRlQXN0VmlzaXRvciB7XG4gIHByaXZhdGUgYXN0VHJhbnNmb3JtZXI7XG5cbiAgY29uc3RydWN0b3IocGFyc2VyOiBQYXJzZXIpIHsgdGhpcy5hc3RUcmFuc2Zvcm1lciA9IG5ldyBSb3V0ZXJMaW5rQXN0VHJhbnNmb3JtZXIocGFyc2VyKTsgfVxuXG4gIHZpc2l0TmdDb250ZW50KGFzdDogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gYXN0OyB9XG5cbiAgdmlzaXRFbWJlZGRlZFRlbXBsYXRlKGFzdDogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gYXN0OyB9XG5cbiAgdmlzaXRFbGVtZW50KGFzdDogRWxlbWVudEFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBsZXQgdXBkYXRlZENoaWxkcmVuID0gYXN0LmNoaWxkcmVuLm1hcChjID0+IGMudmlzaXQodGhpcywgY29udGV4dCkpO1xuICAgIGxldCB1cGRhdGVkSW5wdXRzID0gYXN0LmlucHV0cy5tYXAoYyA9PiBjLnZpc2l0KHRoaXMsIGNvbnRleHQpKTtcbiAgICBsZXQgdXBkYXRlZERpcmVjdGl2ZXMgPSBhc3QuZGlyZWN0aXZlcy5tYXAoYyA9PiBjLnZpc2l0KHRoaXMsIGNvbnRleHQpKTtcbiAgICByZXR1cm4gbmV3IEVsZW1lbnRBc3QoYXN0Lm5hbWUsIGFzdC5hdHRycywgdXBkYXRlZElucHV0cywgYXN0Lm91dHB1dHMsIGFzdC5yZWZlcmVuY2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkRGlyZWN0aXZlcywgYXN0LnByb3ZpZGVycywgYXN0Lmhhc1ZpZXdDb250YWluZXIsIHVwZGF0ZWRDaGlsZHJlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0Lm5nQ29udGVudEluZGV4LCBhc3Quc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdFJlZmVyZW5jZShhc3Q6IGFueSwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuXG4gIHZpc2l0VmFyaWFibGUoYXN0OiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdEV2ZW50KGFzdDogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gYXN0OyB9XG5cbiAgdmlzaXRFbGVtZW50UHJvcGVydHkoYXN0OiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdEF0dHIoYXN0OiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdEJvdW5kVGV4dChhc3Q6IGFueSwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuXG4gIHZpc2l0VGV4dChhc3Q6IGFueSwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuXG4gIHZpc2l0RGlyZWN0aXZlKGFzdDogRGlyZWN0aXZlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGxldCB1cGRhdGVkSW5wdXRzID0gYXN0LmlucHV0cy5tYXAoYyA9PiBjLnZpc2l0KHRoaXMsIGNvbnRleHQpKTtcbiAgICByZXR1cm4gbmV3IERpcmVjdGl2ZUFzdChhc3QuZGlyZWN0aXZlLCB1cGRhdGVkSW5wdXRzLCBhc3QuaG9zdFByb3BlcnRpZXMsIGFzdC5ob3N0RXZlbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0RGlyZWN0aXZlUHJvcGVydHkoYXN0OiBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGxldCB0cmFuc2Zvcm1lZFZhbHVlID0gYXN0LnZhbHVlLnZpc2l0KHRoaXMuYXN0VHJhbnNmb3JtZXIpO1xuICAgIHJldHVybiBuZXcgQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdChhc3QuZGlyZWN0aXZlTmFtZSwgYXN0LnRlbXBsYXRlTmFtZSwgdHJhbnNmb3JtZWRWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG59Il19