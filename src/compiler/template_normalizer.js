'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var directive_metadata_1 = require('./directive_metadata');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var async_1 = require('angular2/src/facade/async');
var xhr_1 = require('angular2/src/compiler/xhr');
var url_resolver_1 = require('angular2/src/compiler/url_resolver');
var style_url_resolver_1 = require('./style_url_resolver');
var di_1 = require('angular2/src/core/di');
var view_1 = require('angular2/src/core/metadata/view');
var html_ast_1 = require('./html_ast');
var html_parser_1 = require('./html_parser');
var template_preparser_1 = require('./template_preparser');
var TemplateNormalizer = (function () {
    function TemplateNormalizer(_xhr, _urlResolver, _htmlParser) {
        this._xhr = _xhr;
        this._urlResolver = _urlResolver;
        this._htmlParser = _htmlParser;
    }
    TemplateNormalizer.prototype.normalizeTemplate = function (directiveType, template) {
        var _this = this;
        if (lang_1.isPresent(template.template)) {
            return async_1.PromiseWrapper.resolve(this.normalizeLoadedTemplate(directiveType, template, template.template, directiveType.moduleUrl));
        }
        else if (lang_1.isPresent(template.templateUrl)) {
            var sourceAbsUrl = this._urlResolver.resolve(directiveType.moduleUrl, template.templateUrl);
            return this._xhr.get(sourceAbsUrl)
                .then(function (templateContent) { return _this.normalizeLoadedTemplate(directiveType, template, templateContent, sourceAbsUrl); });
        }
        else {
            throw new exceptions_1.BaseException("No template specified for component " + directiveType.name);
        }
    };
    TemplateNormalizer.prototype.normalizeLoadedTemplate = function (directiveType, templateMeta, template, templateAbsUrl) {
        var _this = this;
        var rootNodesAndErrors = this._htmlParser.parse(template, directiveType.name);
        if (rootNodesAndErrors.errors.length > 0) {
            var errorString = rootNodesAndErrors.errors.join('\n');
            throw new exceptions_1.BaseException("Template parse errors:\n" + errorString);
        }
        var visitor = new TemplatePreparseVisitor();
        html_ast_1.htmlVisitAll(visitor, rootNodesAndErrors.rootNodes);
        var allStyles = templateMeta.styles.concat(visitor.styles);
        var allStyleAbsUrls = visitor.styleUrls.filter(style_url_resolver_1.isStyleUrlResolvable)
            .map(function (url) { return _this._urlResolver.resolve(templateAbsUrl, url); })
            .concat(templateMeta.styleUrls.filter(style_url_resolver_1.isStyleUrlResolvable)
            .map(function (url) { return _this._urlResolver.resolve(directiveType.moduleUrl, url); }));
        var allResolvedStyles = allStyles.map(function (style) {
            var styleWithImports = style_url_resolver_1.extractStyleUrls(_this._urlResolver, templateAbsUrl, style);
            styleWithImports.styleUrls.forEach(function (styleUrl) { return allStyleAbsUrls.push(styleUrl); });
            return styleWithImports.style;
        });
        var encapsulation = templateMeta.encapsulation;
        if (encapsulation === view_1.ViewEncapsulation.Emulated && allResolvedStyles.length === 0 &&
            allStyleAbsUrls.length === 0) {
            encapsulation = view_1.ViewEncapsulation.None;
        }
        return new directive_metadata_1.CompileTemplateMetadata({
            encapsulation: encapsulation,
            template: template,
            templateUrl: templateAbsUrl,
            styles: allResolvedStyles,
            styleUrls: allStyleAbsUrls,
            ngContentSelectors: visitor.ngContentSelectors
        });
    };
    TemplateNormalizer = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [xhr_1.XHR, url_resolver_1.UrlResolver, html_parser_1.HtmlParser])
    ], TemplateNormalizer);
    return TemplateNormalizer;
})();
exports.TemplateNormalizer = TemplateNormalizer;
var TemplatePreparseVisitor = (function () {
    function TemplatePreparseVisitor() {
        this.ngContentSelectors = [];
        this.styles = [];
        this.styleUrls = [];
        this.ngNonBindableStackCount = 0;
    }
    TemplatePreparseVisitor.prototype.visitElement = function (ast, context) {
        var preparsedElement = template_preparser_1.preparseElement(ast);
        switch (preparsedElement.type) {
            case template_preparser_1.PreparsedElementType.NG_CONTENT:
                if (this.ngNonBindableStackCount === 0) {
                    this.ngContentSelectors.push(preparsedElement.selectAttr);
                }
                break;
            case template_preparser_1.PreparsedElementType.STYLE:
                var textContent = '';
                ast.children.forEach(function (child) {
                    if (child instanceof html_ast_1.HtmlTextAst) {
                        textContent += child.value;
                    }
                });
                this.styles.push(textContent);
                break;
            case template_preparser_1.PreparsedElementType.STYLESHEET:
                this.styleUrls.push(preparsedElement.hrefAttr);
                break;
        }
        if (preparsedElement.nonBindable) {
            this.ngNonBindableStackCount++;
        }
        html_ast_1.htmlVisitAll(this, ast.children);
        if (preparsedElement.nonBindable) {
            this.ngNonBindableStackCount--;
        }
        return null;
    };
    TemplatePreparseVisitor.prototype.visitAttr = function (ast, context) { return null; };
    TemplatePreparseVisitor.prototype.visitText = function (ast, context) { return null; };
    return TemplatePreparseVisitor;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfbm9ybWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci90ZW1wbGF0ZV9ub3JtYWxpemVyLnRzIl0sIm5hbWVzIjpbIlRlbXBsYXRlTm9ybWFsaXplciIsIlRlbXBsYXRlTm9ybWFsaXplci5jb25zdHJ1Y3RvciIsIlRlbXBsYXRlTm9ybWFsaXplci5ub3JtYWxpemVUZW1wbGF0ZSIsIlRlbXBsYXRlTm9ybWFsaXplci5ub3JtYWxpemVMb2FkZWRUZW1wbGF0ZSIsIlRlbXBsYXRlUHJlcGFyc2VWaXNpdG9yIiwiVGVtcGxhdGVQcmVwYXJzZVZpc2l0b3IuY29uc3RydWN0b3IiLCJUZW1wbGF0ZVByZXBhcnNlVmlzaXRvci52aXNpdEVsZW1lbnQiLCJUZW1wbGF0ZVByZXBhcnNlVmlzaXRvci52aXNpdEF0dHIiLCJUZW1wbGF0ZVByZXBhcnNlVmlzaXRvci52aXNpdFRleHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsbUNBSU8sc0JBQXNCLENBQUMsQ0FBQTtBQUM5QixxQkFBaUMsMEJBQTBCLENBQUMsQ0FBQTtBQUM1RCwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCxzQkFBc0MsMkJBQTJCLENBQUMsQ0FBQTtBQUVsRSxvQkFBa0IsMkJBQTJCLENBQUMsQ0FBQTtBQUM5Qyw2QkFBMEIsb0NBQW9DLENBQUMsQ0FBQTtBQUMvRCxtQ0FBcUQsc0JBQXNCLENBQUMsQ0FBQTtBQUM1RSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCxxQkFBZ0MsaUNBQWlDLENBQUMsQ0FBQTtBQUdsRSx5QkFPTyxZQUFZLENBQUMsQ0FBQTtBQUNwQiw0QkFBeUIsZUFBZSxDQUFDLENBQUE7QUFFekMsbUNBQXNFLHNCQUFzQixDQUFDLENBQUE7QUFFN0Y7SUFFRUEsNEJBQW9CQSxJQUFTQSxFQUFVQSxZQUF5QkEsRUFDNUNBLFdBQXVCQTtRQUR2QkMsU0FBSUEsR0FBSkEsSUFBSUEsQ0FBS0E7UUFBVUEsaUJBQVlBLEdBQVpBLFlBQVlBLENBQWFBO1FBQzVDQSxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBWUE7SUFBR0EsQ0FBQ0E7SUFFL0NELDhDQUFpQkEsR0FBakJBLFVBQWtCQSxhQUFrQ0EsRUFDbENBLFFBQWlDQTtRQURuREUsaUJBYUNBO1FBWENBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqQ0EsTUFBTUEsQ0FBQ0Esc0JBQWNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLHVCQUF1QkEsQ0FDdERBLGFBQWFBLEVBQUVBLFFBQVFBLEVBQUVBLFFBQVFBLENBQUNBLFFBQVFBLEVBQUVBLGFBQWFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO1FBQzVFQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0NBLElBQUlBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE9BQU9BLENBQUNBLGFBQWFBLENBQUNBLFNBQVNBLEVBQUVBLFFBQVFBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQzVGQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxZQUFZQSxDQUFDQTtpQkFDN0JBLElBQUlBLENBQUNBLFVBQUFBLGVBQWVBLElBQUlBLE9BQUFBLEtBQUlBLENBQUNBLHVCQUF1QkEsQ0FBQ0EsYUFBYUEsRUFBRUEsUUFBUUEsRUFDdkJBLGVBQWVBLEVBQUVBLFlBQVlBLENBQUNBLEVBRDNEQSxDQUMyREEsQ0FBQ0EsQ0FBQ0E7UUFDNUZBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLE1BQU1BLElBQUlBLDBCQUFhQSxDQUFDQSx5Q0FBdUNBLGFBQWFBLENBQUNBLElBQU1BLENBQUNBLENBQUNBO1FBQ3ZGQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVERixvREFBdUJBLEdBQXZCQSxVQUF3QkEsYUFBa0NBLEVBQUVBLFlBQXFDQSxFQUN6RUEsUUFBZ0JBLEVBQUVBLGNBQXNCQTtRQURoRUcsaUJBcUNDQTtRQW5DQ0EsSUFBSUEsa0JBQWtCQSxHQUFHQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxFQUFFQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUM5RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN6Q0EsSUFBSUEsV0FBV0EsR0FBR0Esa0JBQWtCQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUN2REEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLDZCQUEyQkEsV0FBYUEsQ0FBQ0EsQ0FBQ0E7UUFDcEVBLENBQUNBO1FBRURBLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLHVCQUF1QkEsRUFBRUEsQ0FBQ0E7UUFDNUNBLHVCQUFZQSxDQUFDQSxPQUFPQSxFQUFFQSxrQkFBa0JBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQ3BEQSxJQUFJQSxTQUFTQSxHQUFHQSxZQUFZQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUUzREEsSUFBSUEsZUFBZUEsR0FDZkEsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EseUNBQW9CQSxDQUFDQTthQUN6Q0EsR0FBR0EsQ0FBQ0EsVUFBQUEsR0FBR0EsSUFBSUEsT0FBQUEsS0FBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsY0FBY0EsRUFBRUEsR0FBR0EsQ0FBQ0EsRUFBOUNBLENBQThDQSxDQUFDQTthQUMxREEsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EseUNBQW9CQSxDQUFDQTthQUM5Q0EsR0FBR0EsQ0FBQ0EsVUFBQUEsR0FBR0EsSUFBSUEsT0FBQUEsS0FBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsU0FBU0EsRUFBRUEsR0FBR0EsQ0FBQ0EsRUFBdkRBLENBQXVEQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUUxRkEsSUFBSUEsaUJBQWlCQSxHQUFHQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFBQSxLQUFLQTtZQUN6Q0EsSUFBSUEsZ0JBQWdCQSxHQUFHQSxxQ0FBZ0JBLENBQUNBLEtBQUlBLENBQUNBLFlBQVlBLEVBQUVBLGNBQWNBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1lBQ2xGQSxnQkFBZ0JBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLFVBQUFBLFFBQVFBLElBQUlBLE9BQUFBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEVBQTlCQSxDQUE4QkEsQ0FBQ0EsQ0FBQ0E7WUFDL0VBLE1BQU1BLENBQUNBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDaENBLENBQUNBLENBQUNBLENBQUNBO1FBRUhBLElBQUlBLGFBQWFBLEdBQUdBLFlBQVlBLENBQUNBLGFBQWFBLENBQUNBO1FBQy9DQSxFQUFFQSxDQUFDQSxDQUFDQSxhQUFhQSxLQUFLQSx3QkFBaUJBLENBQUNBLFFBQVFBLElBQUlBLGlCQUFpQkEsQ0FBQ0EsTUFBTUEsS0FBS0EsQ0FBQ0E7WUFDOUVBLGVBQWVBLENBQUNBLE1BQU1BLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSxhQUFhQSxHQUFHQSx3QkFBaUJBLENBQUNBLElBQUlBLENBQUNBO1FBQ3pDQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSw0Q0FBdUJBLENBQUNBO1lBQ2pDQSxhQUFhQSxFQUFFQSxhQUFhQTtZQUM1QkEsUUFBUUEsRUFBRUEsUUFBUUE7WUFDbEJBLFdBQVdBLEVBQUVBLGNBQWNBO1lBQzNCQSxNQUFNQSxFQUFFQSxpQkFBaUJBO1lBQ3pCQSxTQUFTQSxFQUFFQSxlQUFlQTtZQUMxQkEsa0JBQWtCQSxFQUFFQSxPQUFPQSxDQUFDQSxrQkFBa0JBO1NBQy9DQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtJQXpESEg7UUFBQ0EsZUFBVUEsRUFBRUE7OzJCQTBEWkE7SUFBREEseUJBQUNBO0FBQURBLENBQUNBLEFBMURELElBMERDO0FBekRZLDBCQUFrQixxQkF5RDlCLENBQUE7QUFFRDtJQUFBSTtRQUNFQyx1QkFBa0JBLEdBQWFBLEVBQUVBLENBQUNBO1FBQ2xDQSxXQUFNQSxHQUFhQSxFQUFFQSxDQUFDQTtRQUN0QkEsY0FBU0EsR0FBYUEsRUFBRUEsQ0FBQ0E7UUFDekJBLDRCQUF1QkEsR0FBV0EsQ0FBQ0EsQ0FBQ0E7SUFrQ3RDQSxDQUFDQTtJQWhDQ0QsOENBQVlBLEdBQVpBLFVBQWFBLEdBQW1CQSxFQUFFQSxPQUFZQTtRQUM1Q0UsSUFBSUEsZ0JBQWdCQSxHQUFHQSxvQ0FBZUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLE1BQU1BLENBQUNBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDOUJBLEtBQUtBLHlDQUFvQkEsQ0FBQ0EsVUFBVUE7Z0JBQ2xDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSx1QkFBdUJBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUN2Q0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO2dCQUM1REEsQ0FBQ0E7Z0JBQ0RBLEtBQUtBLENBQUNBO1lBQ1JBLEtBQUtBLHlDQUFvQkEsQ0FBQ0EsS0FBS0E7Z0JBQzdCQSxJQUFJQSxXQUFXQSxHQUFHQSxFQUFFQSxDQUFDQTtnQkFDckJBLEdBQUdBLENBQUNBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNBLFVBQUFBLEtBQUtBO29CQUN4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsWUFBWUEsc0JBQVdBLENBQUNBLENBQUNBLENBQUNBO3dCQUNqQ0EsV0FBV0EsSUFBa0JBLEtBQU1BLENBQUNBLEtBQUtBLENBQUNBO29CQUM1Q0EsQ0FBQ0E7Z0JBQ0hBLENBQUNBLENBQUNBLENBQUNBO2dCQUNIQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtnQkFDOUJBLEtBQUtBLENBQUNBO1lBQ1JBLEtBQUtBLHlDQUFvQkEsQ0FBQ0EsVUFBVUE7Z0JBQ2xDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO2dCQUMvQ0EsS0FBS0EsQ0FBQ0E7UUFDVkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsdUJBQXVCQSxFQUFFQSxDQUFDQTtRQUNqQ0EsQ0FBQ0E7UUFDREEsdUJBQVlBLENBQUNBLElBQUlBLEVBQUVBLEdBQUdBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1FBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSxJQUFJQSxDQUFDQSx1QkFBdUJBLEVBQUVBLENBQUNBO1FBQ2pDQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUNERiwyQ0FBU0EsR0FBVEEsVUFBVUEsR0FBZ0JBLEVBQUVBLE9BQVlBLElBQVNHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBQy9ESCwyQ0FBU0EsR0FBVEEsVUFBVUEsR0FBZ0JBLEVBQUVBLE9BQVlBLElBQVNJLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBQ2pFSiw4QkFBQ0E7QUFBREEsQ0FBQ0EsQUF0Q0QsSUFzQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21waWxlVHlwZU1ldGFkYXRhLFxuICBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gIENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhXG59IGZyb20gJy4vZGlyZWN0aXZlX21ldGFkYXRhJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtQcm9taXNlLCBQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbmltcG9ydCB7WEhSfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyJztcbmltcG9ydCB7VXJsUmVzb2x2ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci91cmxfcmVzb2x2ZXInO1xuaW1wb3J0IHtleHRyYWN0U3R5bGVVcmxzLCBpc1N0eWxlVXJsUmVzb2x2YWJsZX0gZnJvbSAnLi9zdHlsZV91cmxfcmVzb2x2ZXInO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS92aWV3JztcblxuXG5pbXBvcnQge1xuICBIdG1sQXN0VmlzaXRvcixcbiAgSHRtbEVsZW1lbnRBc3QsXG4gIEh0bWxUZXh0QXN0LFxuICBIdG1sQXR0ckFzdCxcbiAgSHRtbEFzdCxcbiAgaHRtbFZpc2l0QWxsXG59IGZyb20gJy4vaHRtbF9hc3QnO1xuaW1wb3J0IHtIdG1sUGFyc2VyfSBmcm9tICcuL2h0bWxfcGFyc2VyJztcblxuaW1wb3J0IHtwcmVwYXJzZUVsZW1lbnQsIFByZXBhcnNlZEVsZW1lbnQsIFByZXBhcnNlZEVsZW1lbnRUeXBlfSBmcm9tICcuL3RlbXBsYXRlX3ByZXBhcnNlcic7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZU5vcm1hbGl6ZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF94aHI6IFhIUiwgcHJpdmF0ZSBfdXJsUmVzb2x2ZXI6IFVybFJlc29sdmVyLFxuICAgICAgICAgICAgICBwcml2YXRlIF9odG1sUGFyc2VyOiBIdG1sUGFyc2VyKSB7fVxuXG4gIG5vcm1hbGl6ZVRlbXBsYXRlKGRpcmVjdGl2ZVR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSk6IFByb21pc2U8Q29tcGlsZVRlbXBsYXRlTWV0YWRhdGE+IHtcbiAgICBpZiAoaXNQcmVzZW50KHRlbXBsYXRlLnRlbXBsYXRlKSkge1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUodGhpcy5ub3JtYWxpemVMb2FkZWRUZW1wbGF0ZShcbiAgICAgICAgICBkaXJlY3RpdmVUeXBlLCB0ZW1wbGF0ZSwgdGVtcGxhdGUudGVtcGxhdGUsIGRpcmVjdGl2ZVR5cGUubW9kdWxlVXJsKSk7XG4gICAgfSBlbHNlIGlmIChpc1ByZXNlbnQodGVtcGxhdGUudGVtcGxhdGVVcmwpKSB7XG4gICAgICB2YXIgc291cmNlQWJzVXJsID0gdGhpcy5fdXJsUmVzb2x2ZXIucmVzb2x2ZShkaXJlY3RpdmVUeXBlLm1vZHVsZVVybCwgdGVtcGxhdGUudGVtcGxhdGVVcmwpO1xuICAgICAgcmV0dXJuIHRoaXMuX3hoci5nZXQoc291cmNlQWJzVXJsKVxuICAgICAgICAgIC50aGVuKHRlbXBsYXRlQ29udGVudCA9PiB0aGlzLm5vcm1hbGl6ZUxvYWRlZFRlbXBsYXRlKGRpcmVjdGl2ZVR5cGUsIHRlbXBsYXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlQ29udGVudCwgc291cmNlQWJzVXJsKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBObyB0ZW1wbGF0ZSBzcGVjaWZpZWQgZm9yIGNvbXBvbmVudCAke2RpcmVjdGl2ZVR5cGUubmFtZX1gKTtcbiAgICB9XG4gIH1cblxuICBub3JtYWxpemVMb2FkZWRUZW1wbGF0ZShkaXJlY3RpdmVUeXBlOiBDb21waWxlVHlwZU1ldGFkYXRhLCB0ZW1wbGF0ZU1ldGE6IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogc3RyaW5nLCB0ZW1wbGF0ZUFic1VybDogc3RyaW5nKTogQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEge1xuICAgIHZhciByb290Tm9kZXNBbmRFcnJvcnMgPSB0aGlzLl9odG1sUGFyc2VyLnBhcnNlKHRlbXBsYXRlLCBkaXJlY3RpdmVUeXBlLm5hbWUpO1xuICAgIGlmIChyb290Tm9kZXNBbmRFcnJvcnMuZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBlcnJvclN0cmluZyA9IHJvb3ROb2Rlc0FuZEVycm9ycy5lcnJvcnMuam9pbignXFxuJyk7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVGVtcGxhdGUgcGFyc2UgZXJyb3JzOlxcbiR7ZXJyb3JTdHJpbmd9YCk7XG4gICAgfVxuXG4gICAgdmFyIHZpc2l0b3IgPSBuZXcgVGVtcGxhdGVQcmVwYXJzZVZpc2l0b3IoKTtcbiAgICBodG1sVmlzaXRBbGwodmlzaXRvciwgcm9vdE5vZGVzQW5kRXJyb3JzLnJvb3ROb2Rlcyk7XG4gICAgdmFyIGFsbFN0eWxlcyA9IHRlbXBsYXRlTWV0YS5zdHlsZXMuY29uY2F0KHZpc2l0b3Iuc3R5bGVzKTtcblxuICAgIHZhciBhbGxTdHlsZUFic1VybHMgPVxuICAgICAgICB2aXNpdG9yLnN0eWxlVXJscy5maWx0ZXIoaXNTdHlsZVVybFJlc29sdmFibGUpXG4gICAgICAgICAgICAubWFwKHVybCA9PiB0aGlzLl91cmxSZXNvbHZlci5yZXNvbHZlKHRlbXBsYXRlQWJzVXJsLCB1cmwpKVxuICAgICAgICAgICAgLmNvbmNhdCh0ZW1wbGF0ZU1ldGEuc3R5bGVVcmxzLmZpbHRlcihpc1N0eWxlVXJsUmVzb2x2YWJsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAodXJsID0+IHRoaXMuX3VybFJlc29sdmVyLnJlc29sdmUoZGlyZWN0aXZlVHlwZS5tb2R1bGVVcmwsIHVybCkpKTtcblxuICAgIHZhciBhbGxSZXNvbHZlZFN0eWxlcyA9IGFsbFN0eWxlcy5tYXAoc3R5bGUgPT4ge1xuICAgICAgdmFyIHN0eWxlV2l0aEltcG9ydHMgPSBleHRyYWN0U3R5bGVVcmxzKHRoaXMuX3VybFJlc29sdmVyLCB0ZW1wbGF0ZUFic1VybCwgc3R5bGUpO1xuICAgICAgc3R5bGVXaXRoSW1wb3J0cy5zdHlsZVVybHMuZm9yRWFjaChzdHlsZVVybCA9PiBhbGxTdHlsZUFic1VybHMucHVzaChzdHlsZVVybCkpO1xuICAgICAgcmV0dXJuIHN0eWxlV2l0aEltcG9ydHMuc3R5bGU7XG4gICAgfSk7XG5cbiAgICB2YXIgZW5jYXBzdWxhdGlvbiA9IHRlbXBsYXRlTWV0YS5lbmNhcHN1bGF0aW9uO1xuICAgIGlmIChlbmNhcHN1bGF0aW9uID09PSBWaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZCAmJiBhbGxSZXNvbHZlZFN0eWxlcy5sZW5ndGggPT09IDAgJiZcbiAgICAgICAgYWxsU3R5bGVBYnNVcmxzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZW5jYXBzdWxhdGlvbiA9IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmU7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEoe1xuICAgICAgZW5jYXBzdWxhdGlvbjogZW5jYXBzdWxhdGlvbixcbiAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcbiAgICAgIHRlbXBsYXRlVXJsOiB0ZW1wbGF0ZUFic1VybCxcbiAgICAgIHN0eWxlczogYWxsUmVzb2x2ZWRTdHlsZXMsXG4gICAgICBzdHlsZVVybHM6IGFsbFN0eWxlQWJzVXJscyxcbiAgICAgIG5nQ29udGVudFNlbGVjdG9yczogdmlzaXRvci5uZ0NvbnRlbnRTZWxlY3RvcnNcbiAgICB9KTtcbiAgfVxufVxuXG5jbGFzcyBUZW1wbGF0ZVByZXBhcnNlVmlzaXRvciBpbXBsZW1lbnRzIEh0bWxBc3RWaXNpdG9yIHtcbiAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSA9IFtdO1xuICBzdHlsZXM6IHN0cmluZ1tdID0gW107XG4gIHN0eWxlVXJsczogc3RyaW5nW10gPSBbXTtcbiAgbmdOb25CaW5kYWJsZVN0YWNrQ291bnQ6IG51bWJlciA9IDA7XG5cbiAgdmlzaXRFbGVtZW50KGFzdDogSHRtbEVsZW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdmFyIHByZXBhcnNlZEVsZW1lbnQgPSBwcmVwYXJzZUVsZW1lbnQoYXN0KTtcbiAgICBzd2l0Y2ggKHByZXBhcnNlZEVsZW1lbnQudHlwZSkge1xuICAgICAgY2FzZSBQcmVwYXJzZWRFbGVtZW50VHlwZS5OR19DT05URU5UOlxuICAgICAgICBpZiAodGhpcy5uZ05vbkJpbmRhYmxlU3RhY2tDb3VudCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMubmdDb250ZW50U2VsZWN0b3JzLnB1c2gocHJlcGFyc2VkRWxlbWVudC5zZWxlY3RBdHRyKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEU6XG4gICAgICAgIHZhciB0ZXh0Q29udGVudCA9ICcnO1xuICAgICAgICBhc3QuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICAgICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgSHRtbFRleHRBc3QpIHtcbiAgICAgICAgICAgIHRleHRDb250ZW50ICs9ICg8SHRtbFRleHRBc3Q+Y2hpbGQpLnZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc3R5bGVzLnB1c2godGV4dENvbnRlbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEVTSEVFVDpcbiAgICAgICAgdGhpcy5zdHlsZVVybHMucHVzaChwcmVwYXJzZWRFbGVtZW50LmhyZWZBdHRyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50Lm5vbkJpbmRhYmxlKSB7XG4gICAgICB0aGlzLm5nTm9uQmluZGFibGVTdGFja0NvdW50Kys7XG4gICAgfVxuICAgIGh0bWxWaXNpdEFsbCh0aGlzLCBhc3QuY2hpbGRyZW4pO1xuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50Lm5vbkJpbmRhYmxlKSB7XG4gICAgICB0aGlzLm5nTm9uQmluZGFibGVTdGFja0NvdW50LS07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0QXR0cihhc3Q6IEh0bWxBdHRyQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdFRleHQoYXN0OiBIdG1sVGV4dEFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbn1cbiJdfQ==