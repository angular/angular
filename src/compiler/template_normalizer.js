'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfbm9ybWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci90ZW1wbGF0ZV9ub3JtYWxpemVyLnRzIl0sIm5hbWVzIjpbIlRlbXBsYXRlTm9ybWFsaXplciIsIlRlbXBsYXRlTm9ybWFsaXplci5jb25zdHJ1Y3RvciIsIlRlbXBsYXRlTm9ybWFsaXplci5ub3JtYWxpemVUZW1wbGF0ZSIsIlRlbXBsYXRlTm9ybWFsaXplci5ub3JtYWxpemVMb2FkZWRUZW1wbGF0ZSIsIlRlbXBsYXRlUHJlcGFyc2VWaXNpdG9yIiwiVGVtcGxhdGVQcmVwYXJzZVZpc2l0b3IuY29uc3RydWN0b3IiLCJUZW1wbGF0ZVByZXBhcnNlVmlzaXRvci52aXNpdEVsZW1lbnQiLCJUZW1wbGF0ZVByZXBhcnNlVmlzaXRvci52aXNpdEF0dHIiLCJUZW1wbGF0ZVByZXBhcnNlVmlzaXRvci52aXNpdFRleHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1DQUlPLHNCQUFzQixDQUFDLENBQUE7QUFDOUIscUJBQWlDLDBCQUEwQixDQUFDLENBQUE7QUFDNUQsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0Qsc0JBQXNDLDJCQUEyQixDQUFDLENBQUE7QUFFbEUsb0JBQWtCLDJCQUEyQixDQUFDLENBQUE7QUFDOUMsNkJBQTBCLG9DQUFvQyxDQUFDLENBQUE7QUFDL0QsbUNBQXFELHNCQUFzQixDQUFDLENBQUE7QUFDNUUsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQscUJBQWdDLGlDQUFpQyxDQUFDLENBQUE7QUFHbEUseUJBT08sWUFBWSxDQUFDLENBQUE7QUFDcEIsNEJBQXlCLGVBQWUsQ0FBQyxDQUFBO0FBRXpDLG1DQUFzRSxzQkFBc0IsQ0FBQyxDQUFBO0FBRTdGO0lBRUVBLDRCQUFvQkEsSUFBU0EsRUFBVUEsWUFBeUJBLEVBQzVDQSxXQUF1QkE7UUFEdkJDLFNBQUlBLEdBQUpBLElBQUlBLENBQUtB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LEFBdENELElBc0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICBDb21waWxlVGVtcGxhdGVNZXRhZGF0YVxufSBmcm9tICcuL2RpcmVjdGl2ZV9tZXRhZGF0YSc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7UHJvbWlzZSwgUHJvbWlzZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5pbXBvcnQge1hIUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3hocic7XG5pbXBvcnQge1VybFJlc29sdmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvdXJsX3Jlc29sdmVyJztcbmltcG9ydCB7ZXh0cmFjdFN0eWxlVXJscywgaXNTdHlsZVVybFJlc29sdmFibGV9IGZyb20gJy4vc3R5bGVfdXJsX3Jlc29sdmVyJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvdmlldyc7XG5cblxuaW1wb3J0IHtcbiAgSHRtbEFzdFZpc2l0b3IsXG4gIEh0bWxFbGVtZW50QXN0LFxuICBIdG1sVGV4dEFzdCxcbiAgSHRtbEF0dHJBc3QsXG4gIEh0bWxBc3QsXG4gIGh0bWxWaXNpdEFsbFxufSBmcm9tICcuL2h0bWxfYXN0JztcbmltcG9ydCB7SHRtbFBhcnNlcn0gZnJvbSAnLi9odG1sX3BhcnNlcic7XG5cbmltcG9ydCB7cHJlcGFyc2VFbGVtZW50LCBQcmVwYXJzZWRFbGVtZW50LCBQcmVwYXJzZWRFbGVtZW50VHlwZX0gZnJvbSAnLi90ZW1wbGF0ZV9wcmVwYXJzZXInO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVOb3JtYWxpemVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfeGhyOiBYSFIsIHByaXZhdGUgX3VybFJlc29sdmVyOiBVcmxSZXNvbHZlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfaHRtbFBhcnNlcjogSHRtbFBhcnNlcikge31cblxuICBub3JtYWxpemVUZW1wbGF0ZShkaXJlY3RpdmVUeXBlOiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEpOiBQcm9taXNlPENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhPiB7XG4gICAgaWYgKGlzUHJlc2VudCh0ZW1wbGF0ZS50ZW1wbGF0ZSkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRoaXMubm9ybWFsaXplTG9hZGVkVGVtcGxhdGUoXG4gICAgICAgICAgZGlyZWN0aXZlVHlwZSwgdGVtcGxhdGUsIHRlbXBsYXRlLnRlbXBsYXRlLCBkaXJlY3RpdmVUeXBlLm1vZHVsZVVybCkpO1xuICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHRlbXBsYXRlLnRlbXBsYXRlVXJsKSkge1xuICAgICAgdmFyIHNvdXJjZUFic1VybCA9IHRoaXMuX3VybFJlc29sdmVyLnJlc29sdmUoZGlyZWN0aXZlVHlwZS5tb2R1bGVVcmwsIHRlbXBsYXRlLnRlbXBsYXRlVXJsKTtcbiAgICAgIHJldHVybiB0aGlzLl94aHIuZ2V0KHNvdXJjZUFic1VybClcbiAgICAgICAgICAudGhlbih0ZW1wbGF0ZUNvbnRlbnQgPT4gdGhpcy5ub3JtYWxpemVMb2FkZWRUZW1wbGF0ZShkaXJlY3RpdmVUeXBlLCB0ZW1wbGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZUNvbnRlbnQsIHNvdXJjZUFic1VybCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgTm8gdGVtcGxhdGUgc3BlY2lmaWVkIGZvciBjb21wb25lbnQgJHtkaXJlY3RpdmVUeXBlLm5hbWV9YCk7XG4gICAgfVxuICB9XG5cbiAgbm9ybWFsaXplTG9hZGVkVGVtcGxhdGUoZGlyZWN0aXZlVHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YSwgdGVtcGxhdGVNZXRhOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHN0cmluZywgdGVtcGxhdGVBYnNVcmw6IHN0cmluZyk6IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhIHtcbiAgICB2YXIgcm9vdE5vZGVzQW5kRXJyb3JzID0gdGhpcy5faHRtbFBhcnNlci5wYXJzZSh0ZW1wbGF0ZSwgZGlyZWN0aXZlVHlwZS5uYW1lKTtcbiAgICBpZiAocm9vdE5vZGVzQW5kRXJyb3JzLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgZXJyb3JTdHJpbmcgPSByb290Tm9kZXNBbmRFcnJvcnMuZXJyb3JzLmpvaW4oJ1xcbicpO1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFRlbXBsYXRlIHBhcnNlIGVycm9yczpcXG4ke2Vycm9yU3RyaW5nfWApO1xuICAgIH1cblxuICAgIHZhciB2aXNpdG9yID0gbmV3IFRlbXBsYXRlUHJlcGFyc2VWaXNpdG9yKCk7XG4gICAgaHRtbFZpc2l0QWxsKHZpc2l0b3IsIHJvb3ROb2Rlc0FuZEVycm9ycy5yb290Tm9kZXMpO1xuICAgIHZhciBhbGxTdHlsZXMgPSB0ZW1wbGF0ZU1ldGEuc3R5bGVzLmNvbmNhdCh2aXNpdG9yLnN0eWxlcyk7XG5cbiAgICB2YXIgYWxsU3R5bGVBYnNVcmxzID1cbiAgICAgICAgdmlzaXRvci5zdHlsZVVybHMuZmlsdGVyKGlzU3R5bGVVcmxSZXNvbHZhYmxlKVxuICAgICAgICAgICAgLm1hcCh1cmwgPT4gdGhpcy5fdXJsUmVzb2x2ZXIucmVzb2x2ZSh0ZW1wbGF0ZUFic1VybCwgdXJsKSlcbiAgICAgICAgICAgIC5jb25jYXQodGVtcGxhdGVNZXRhLnN0eWxlVXJscy5maWx0ZXIoaXNTdHlsZVVybFJlc29sdmFibGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKHVybCA9PiB0aGlzLl91cmxSZXNvbHZlci5yZXNvbHZlKGRpcmVjdGl2ZVR5cGUubW9kdWxlVXJsLCB1cmwpKSk7XG5cbiAgICB2YXIgYWxsUmVzb2x2ZWRTdHlsZXMgPSBhbGxTdHlsZXMubWFwKHN0eWxlID0+IHtcbiAgICAgIHZhciBzdHlsZVdpdGhJbXBvcnRzID0gZXh0cmFjdFN0eWxlVXJscyh0aGlzLl91cmxSZXNvbHZlciwgdGVtcGxhdGVBYnNVcmwsIHN0eWxlKTtcbiAgICAgIHN0eWxlV2l0aEltcG9ydHMuc3R5bGVVcmxzLmZvckVhY2goc3R5bGVVcmwgPT4gYWxsU3R5bGVBYnNVcmxzLnB1c2goc3R5bGVVcmwpKTtcbiAgICAgIHJldHVybiBzdHlsZVdpdGhJbXBvcnRzLnN0eWxlO1xuICAgIH0pO1xuXG4gICAgdmFyIGVuY2Fwc3VsYXRpb24gPSB0ZW1wbGF0ZU1ldGEuZW5jYXBzdWxhdGlvbjtcbiAgICBpZiAoZW5jYXBzdWxhdGlvbiA9PT0gVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQgJiYgYWxsUmVzb2x2ZWRTdHlsZXMubGVuZ3RoID09PSAwICYmXG4gICAgICAgIGFsbFN0eWxlQWJzVXJscy5sZW5ndGggPT09IDApIHtcbiAgICAgIGVuY2Fwc3VsYXRpb24gPSBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhKHtcbiAgICAgIGVuY2Fwc3VsYXRpb246IGVuY2Fwc3VsYXRpb24sXG4gICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXG4gICAgICB0ZW1wbGF0ZVVybDogdGVtcGxhdGVBYnNVcmwsXG4gICAgICBzdHlsZXM6IGFsbFJlc29sdmVkU3R5bGVzLFxuICAgICAgc3R5bGVVcmxzOiBhbGxTdHlsZUFic1VybHMsXG4gICAgICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHZpc2l0b3IubmdDb250ZW50U2VsZWN0b3JzXG4gICAgfSk7XG4gIH1cbn1cblxuY2xhc3MgVGVtcGxhdGVQcmVwYXJzZVZpc2l0b3IgaW1wbGVtZW50cyBIdG1sQXN0VmlzaXRvciB7XG4gIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10gPSBbXTtcbiAgc3R5bGVzOiBzdHJpbmdbXSA9IFtdO1xuICBzdHlsZVVybHM6IHN0cmluZ1tdID0gW107XG4gIG5nTm9uQmluZGFibGVTdGFja0NvdW50OiBudW1iZXIgPSAwO1xuXG4gIHZpc2l0RWxlbWVudChhc3Q6IEh0bWxFbGVtZW50QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHZhciBwcmVwYXJzZWRFbGVtZW50ID0gcHJlcGFyc2VFbGVtZW50KGFzdCk7XG4gICAgc3dpdGNoIChwcmVwYXJzZWRFbGVtZW50LnR5cGUpIHtcbiAgICAgIGNhc2UgUHJlcGFyc2VkRWxlbWVudFR5cGUuTkdfQ09OVEVOVDpcbiAgICAgICAgaWYgKHRoaXMubmdOb25CaW5kYWJsZVN0YWNrQ291bnQgPT09IDApIHtcbiAgICAgICAgICB0aGlzLm5nQ29udGVudFNlbGVjdG9ycy5wdXNoKHByZXBhcnNlZEVsZW1lbnQuc2VsZWN0QXR0cik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFOlxuICAgICAgICB2YXIgdGV4dENvbnRlbnQgPSAnJztcbiAgICAgICAgYXN0LmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIEh0bWxUZXh0QXN0KSB7XG4gICAgICAgICAgICB0ZXh0Q29udGVudCArPSAoPEh0bWxUZXh0QXN0PmNoaWxkKS52YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnN0eWxlcy5wdXNoKHRleHRDb250ZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFU0hFRVQ6XG4gICAgICAgIHRoaXMuc3R5bGVVcmxzLnB1c2gocHJlcGFyc2VkRWxlbWVudC5ocmVmQXR0cik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC5ub25CaW5kYWJsZSkge1xuICAgICAgdGhpcy5uZ05vbkJpbmRhYmxlU3RhY2tDb3VudCsrO1xuICAgIH1cbiAgICBodG1sVmlzaXRBbGwodGhpcywgYXN0LmNoaWxkcmVuKTtcbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC5ub25CaW5kYWJsZSkge1xuICAgICAgdGhpcy5uZ05vbkJpbmRhYmxlU3RhY2tDb3VudC0tO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdEF0dHIoYXN0OiBIdG1sQXR0ckFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXRUZXh0KGFzdDogSHRtbFRleHRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG59XG4iXX0=