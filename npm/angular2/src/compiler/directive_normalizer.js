'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var compile_metadata_1 = require('./compile_metadata');
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
var DirectiveNormalizer = (function () {
    function DirectiveNormalizer(_xhr, _urlResolver, _htmlParser) {
        this._xhr = _xhr;
        this._urlResolver = _urlResolver;
        this._htmlParser = _htmlParser;
    }
    DirectiveNormalizer.prototype.normalizeDirective = function (directive) {
        if (!directive.isComponent) {
            // For non components there is nothing to be normalized yet.
            return async_1.PromiseWrapper.resolve(directive);
        }
        return this.normalizeTemplate(directive.type, directive.template)
            .then(function (normalizedTemplate) { return new compile_metadata_1.CompileDirectiveMetadata({
            type: directive.type,
            isComponent: directive.isComponent,
            selector: directive.selector,
            exportAs: directive.exportAs,
            changeDetection: directive.changeDetection,
            inputs: directive.inputs,
            outputs: directive.outputs,
            hostListeners: directive.hostListeners,
            hostProperties: directive.hostProperties,
            hostAttributes: directive.hostAttributes,
            lifecycleHooks: directive.lifecycleHooks,
            providers: directive.providers,
            viewProviders: directive.viewProviders,
            queries: directive.queries,
            viewQueries: directive.viewQueries,
            template: normalizedTemplate
        }); });
    };
    DirectiveNormalizer.prototype.normalizeTemplate = function (directiveType, template) {
        var _this = this;
        if (lang_1.isPresent(template.template)) {
            return async_1.PromiseWrapper.resolve(this.normalizeLoadedTemplate(directiveType, template, template.template, template.baseUrl));
        }
        else if (lang_1.isPresent(template.templateUrl)) {
            var sourceAbsUrl = this._urlResolver.resolve(template.baseUrl, template.templateUrl);
            return this._xhr.get(sourceAbsUrl)
                .then(function (templateContent) { return _this.normalizeLoadedTemplate(directiveType, template, templateContent, sourceAbsUrl); });
        }
        else {
            throw new exceptions_1.BaseException("No template specified for component " + directiveType.name);
        }
    };
    DirectiveNormalizer.prototype.normalizeLoadedTemplate = function (directiveType, templateMeta, template, templateAbsUrl) {
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
            .map(function (url) { return _this._urlResolver.resolve(templateMeta.baseUrl, url); }));
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
        return new compile_metadata_1.CompileTemplateMetadata({
            encapsulation: encapsulation,
            template: template,
            templateUrl: templateAbsUrl,
            styles: allResolvedStyles,
            styleUrls: allStyleAbsUrls,
            ngContentSelectors: visitor.ngContentSelectors
        });
    };
    DirectiveNormalizer = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [xhr_1.XHR, url_resolver_1.UrlResolver, html_parser_1.HtmlParser])
    ], DirectiveNormalizer);
    return DirectiveNormalizer;
}());
exports.DirectiveNormalizer = DirectiveNormalizer;
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
            default:
                // DDC reports this as error. See:
                // https://github.com/dart-lang/dev_compiler/issues/428
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
    TemplatePreparseVisitor.prototype.visitComment = function (ast, context) { return null; };
    TemplatePreparseVisitor.prototype.visitAttr = function (ast, context) { return null; };
    TemplatePreparseVisitor.prototype.visitText = function (ast, context) { return null; };
    TemplatePreparseVisitor.prototype.visitExpansion = function (ast, context) { return null; };
    TemplatePreparseVisitor.prototype.visitExpansionCase = function (ast, context) { return null; };
    return TemplatePreparseVisitor;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlX25vcm1hbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvZGlyZWN0aXZlX25vcm1hbGl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLGlDQU1PLG9CQUFvQixDQUFDLENBQUE7QUFDNUIscUJBQTBDLDBCQUEwQixDQUFDLENBQUE7QUFDckUsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0Qsc0JBQTZCLDJCQUEyQixDQUFDLENBQUE7QUFFekQsb0JBQWtCLDJCQUEyQixDQUFDLENBQUE7QUFDOUMsNkJBQTBCLG9DQUFvQyxDQUFDLENBQUE7QUFDL0QsbUNBQXFELHNCQUFzQixDQUFDLENBQUE7QUFDNUUsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQscUJBQWdDLGlDQUFpQyxDQUFDLENBQUE7QUFHbEUseUJBVU8sWUFBWSxDQUFDLENBQUE7QUFDcEIsNEJBQXlCLGVBQWUsQ0FBQyxDQUFBO0FBRXpDLG1DQUFzRSxzQkFBc0IsQ0FBQyxDQUFBO0FBRzdGO0lBQ0UsNkJBQW9CLElBQVMsRUFBVSxZQUF5QixFQUM1QyxXQUF1QjtRQUR2QixTQUFJLEdBQUosSUFBSSxDQUFLO1FBQVUsaUJBQVksR0FBWixZQUFZLENBQWE7UUFDNUMsZ0JBQVcsR0FBWCxXQUFXLENBQVk7SUFBRyxDQUFDO0lBRS9DLGdEQUFrQixHQUFsQixVQUFtQixTQUFtQztRQUNwRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQzNCLDREQUE0RDtZQUM1RCxNQUFNLENBQUMsc0JBQWMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFD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LElBQUksQ0FBQyxDQUFDLENBQUM7SUFFekUsb0RBQWtCLEdBQWxCLFVBQW1CLEdBQXlCLEVBQUUsT0FBWSxJQUFTLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25GLDhCQUFDO0FBQUQsQ0FBQyxBQTlDRCxJQThDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gIENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEsXG4gIENvbXBpbGVQcm92aWRlck1ldGFkYXRhLFxuICBDb21waWxlVG9rZW5NZXRhZGF0YVxufSBmcm9tICcuL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIGlzQXJyYXl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuaW1wb3J0IHtYSFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci94aHInO1xuaW1wb3J0IHtVcmxSZXNvbHZlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3VybF9yZXNvbHZlcic7XG5pbXBvcnQge2V4dHJhY3RTdHlsZVVybHMsIGlzU3R5bGVVcmxSZXNvbHZhYmxlfSBmcm9tICcuL3N0eWxlX3VybF9yZXNvbHZlcic7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcnO1xuXG5cbmltcG9ydCB7XG4gIEh0bWxBc3RWaXNpdG9yLFxuICBIdG1sRWxlbWVudEFzdCxcbiAgSHRtbFRleHRBc3QsXG4gIEh0bWxBdHRyQXN0LFxuICBIdG1sQXN0LFxuICBIdG1sQ29tbWVudEFzdCxcbiAgSHRtbEV4cGFuc2lvbkFzdCxcbiAgSHRtbEV4cGFuc2lvbkNhc2VBc3QsXG4gIGh0bWxWaXNpdEFsbFxufSBmcm9tICcuL2h0bWxfYXN0JztcbmltcG9ydCB7SHRtbFBhcnNlcn0gZnJvbSAnLi9odG1sX3BhcnNlcic7XG5cbmltcG9ydCB7cHJlcGFyc2VFbGVtZW50LCBQcmVwYXJzZWRFbGVtZW50LCBQcmVwYXJzZWRFbGVtZW50VHlwZX0gZnJvbSAnLi90ZW1wbGF0ZV9wcmVwYXJzZXInO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRGlyZWN0aXZlTm9ybWFsaXplciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3hocjogWEhSLCBwcml2YXRlIF91cmxSZXNvbHZlcjogVXJsUmVzb2x2ZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2h0bWxQYXJzZXI6IEh0bWxQYXJzZXIpIHt9XG5cbiAgbm9ybWFsaXplRGlyZWN0aXZlKGRpcmVjdGl2ZTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKTogUHJvbWlzZTxDb21waWxlRGlyZWN0aXZlTWV0YWRhdGE+IHtcbiAgICBpZiAoIWRpcmVjdGl2ZS5pc0NvbXBvbmVudCkge1xuICAgICAgLy8gRm9yIG5vbiBjb21wb25lbnRzIHRoZXJlIGlzIG5vdGhpbmcgdG8gYmUgbm9ybWFsaXplZCB5ZXQuXG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShkaXJlY3RpdmUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemVUZW1wbGF0ZShkaXJlY3RpdmUudHlwZSwgZGlyZWN0aXZlLnRlbXBsYXRlKVxuICAgICAgICAudGhlbigobm9ybWFsaXplZFRlbXBsYXRlOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSkgPT4gbmV3IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSh7XG4gICAgICAgICAgICAgICAgdHlwZTogZGlyZWN0aXZlLnR5cGUsXG4gICAgICAgICAgICAgICAgaXNDb21wb25lbnQ6IGRpcmVjdGl2ZS5pc0NvbXBvbmVudCxcbiAgICAgICAgICAgICAgICBzZWxlY3RvcjogZGlyZWN0aXZlLnNlbGVjdG9yLFxuICAgICAgICAgICAgICAgIGV4cG9ydEFzOiBkaXJlY3RpdmUuZXhwb3J0QXMsXG4gICAgICAgICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBkaXJlY3RpdmUuY2hhbmdlRGV0ZWN0aW9uLFxuICAgICAgICAgICAgICAgIGlucHV0czogZGlyZWN0aXZlLmlucHV0cyxcbiAgICAgICAgICAgICAgICBvdXRwdXRzOiBkaXJlY3RpdmUub3V0cHV0cyxcbiAgICAgICAgICAgICAgICBob3N0TGlzdGVuZXJzOiBkaXJlY3RpdmUuaG9zdExpc3RlbmVycyxcbiAgICAgICAgICAgICAgICBob3N0UHJvcGVydGllczogZGlyZWN0aXZlLmhvc3RQcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgIGhvc3RBdHRyaWJ1dGVzOiBkaXJlY3RpdmUuaG9zdEF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgbGlmZWN5Y2xlSG9va3M6IGRpcmVjdGl2ZS5saWZlY3ljbGVIb29rcyxcbiAgICAgICAgICAgICAgICBwcm92aWRlcnM6IGRpcmVjdGl2ZS5wcm92aWRlcnMsXG4gICAgICAgICAgICAgICAgdmlld1Byb3ZpZGVyczogZGlyZWN0aXZlLnZpZXdQcm92aWRlcnMsXG4gICAgICAgICAgICAgICAgcXVlcmllczogZGlyZWN0aXZlLnF1ZXJpZXMsXG4gICAgICAgICAgICAgICAgdmlld1F1ZXJpZXM6IGRpcmVjdGl2ZS52aWV3UXVlcmllcyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogbm9ybWFsaXplZFRlbXBsYXRlXG4gICAgICAgICAgICAgIH0pKTtcbiAgfVxuXG4gIG5vcm1hbGl6ZVRlbXBsYXRlKGRpcmVjdGl2ZVR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSk6IFByb21pc2U8Q29tcGlsZVRlbXBsYXRlTWV0YWRhdGE+IHtcbiAgICBpZiAoaXNQcmVzZW50KHRlbXBsYXRlLnRlbXBsYXRlKSkge1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUodGhpcy5ub3JtYWxpemVMb2FkZWRUZW1wbGF0ZShcbiAgICAgICAgICBkaXJlY3RpdmVUeXBlLCB0ZW1wbGF0ZSwgdGVtcGxhdGUudGVtcGxhdGUsIHRlbXBsYXRlLmJhc2VVcmwpKTtcbiAgICB9IGVsc2UgaWYgKGlzUHJlc2VudCh0ZW1wbGF0ZS50ZW1wbGF0ZVVybCkpIHtcbiAgICAgIHZhciBzb3VyY2VBYnNVcmwgPSB0aGlzLl91cmxSZXNvbHZlci5yZXNvbHZlKHRlbXBsYXRlLmJhc2VVcmwsIHRlbXBsYXRlLnRlbXBsYXRlVXJsKTtcbiAgICAgIHJldHVybiB0aGlzLl94aHIuZ2V0KHNvdXJjZUFic1VybClcbiAgICAgICAgICAudGhlbih0ZW1wbGF0ZUNvbnRlbnQgPT4gdGhpcy5ub3JtYWxpemVMb2FkZWRUZW1wbGF0ZShkaXJlY3RpdmVUeXBlLCB0ZW1wbGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZUNvbnRlbnQsIHNvdXJjZUFic1VybCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgTm8gdGVtcGxhdGUgc3BlY2lmaWVkIGZvciBjb21wb25lbnQgJHtkaXJlY3RpdmVUeXBlLm5hbWV9YCk7XG4gICAgfVxuICB9XG5cbiAgbm9ybWFsaXplTG9hZGVkVGVtcGxhdGUoZGlyZWN0aXZlVHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YSwgdGVtcGxhdGVNZXRhOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHN0cmluZywgdGVtcGxhdGVBYnNVcmw6IHN0cmluZyk6IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhIHtcbiAgICB2YXIgcm9vdE5vZGVzQW5kRXJyb3JzID0gdGhpcy5faHRtbFBhcnNlci5wYXJzZSh0ZW1wbGF0ZSwgZGlyZWN0aXZlVHlwZS5uYW1lKTtcbiAgICBpZiAocm9vdE5vZGVzQW5kRXJyb3JzLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgZXJyb3JTdHJpbmcgPSByb290Tm9kZXNBbmRFcnJvcnMuZXJyb3JzLmpvaW4oJ1xcbicpO1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFRlbXBsYXRlIHBhcnNlIGVycm9yczpcXG4ke2Vycm9yU3RyaW5nfWApO1xuICAgIH1cblxuICAgIHZhciB2aXNpdG9yID0gbmV3IFRlbXBsYXRlUHJlcGFyc2VWaXNpdG9yKCk7XG4gICAgaHRtbFZpc2l0QWxsKHZpc2l0b3IsIHJvb3ROb2Rlc0FuZEVycm9ycy5yb290Tm9kZXMpO1xuICAgIHZhciBhbGxTdHlsZXMgPSB0ZW1wbGF0ZU1ldGEuc3R5bGVzLmNvbmNhdCh2aXNpdG9yLnN0eWxlcyk7XG5cbiAgICB2YXIgYWxsU3R5bGVBYnNVcmxzID1cbiAgICAgICAgdmlzaXRvci5zdHlsZVVybHMuZmlsdGVyKGlzU3R5bGVVcmxSZXNvbHZhYmxlKVxuICAgICAgICAgICAgLm1hcCh1cmwgPT4gdGhpcy5fdXJsUmVzb2x2ZXIucmVzb2x2ZSh0ZW1wbGF0ZUFic1VybCwgdXJsKSlcbiAgICAgICAgICAgIC5jb25jYXQodGVtcGxhdGVNZXRhLnN0eWxlVXJscy5maWx0ZXIoaXNTdHlsZVVybFJlc29sdmFibGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKHVybCA9PiB0aGlzLl91cmxSZXNvbHZlci5yZXNvbHZlKHRlbXBsYXRlTWV0YS5iYXNlVXJsLCB1cmwpKSk7XG5cbiAgICB2YXIgYWxsUmVzb2x2ZWRTdHlsZXMgPSBhbGxTdHlsZXMubWFwKHN0eWxlID0+IHtcbiAgICAgIHZhciBzdHlsZVdpdGhJbXBvcnRzID0gZXh0cmFjdFN0eWxlVXJscyh0aGlzLl91cmxSZXNvbHZlciwgdGVtcGxhdGVBYnNVcmwsIHN0eWxlKTtcbiAgICAgIHN0eWxlV2l0aEltcG9ydHMuc3R5bGVVcmxzLmZvckVhY2goc3R5bGVVcmwgPT4gYWxsU3R5bGVBYnNVcmxzLnB1c2goc3R5bGVVcmwpKTtcbiAgICAgIHJldHVybiBzdHlsZVdpdGhJbXBvcnRzLnN0eWxlO1xuICAgIH0pO1xuXG4gICAgdmFyIGVuY2Fwc3VsYXRpb24gPSB0ZW1wbGF0ZU1ldGEuZW5jYXBzdWxhdGlvbjtcbiAgICBpZiAoZW5jYXBzdWxhdGlvbiA9PT0gVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQgJiYgYWxsUmVzb2x2ZWRTdHlsZXMubGVuZ3RoID09PSAwICYmXG4gICAgICAgIGFsbFN0eWxlQWJzVXJscy5sZW5ndGggPT09IDApIHtcbiAgICAgIGVuY2Fwc3VsYXRpb24gPSBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhKHtcbiAgICAgIGVuY2Fwc3VsYXRpb246IGVuY2Fwc3VsYXRpb24sXG4gICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXG4gICAgICB0ZW1wbGF0ZVVybDogdGVtcGxhdGVBYnNVcmwsXG4gICAgICBzdHlsZXM6IGFsbFJlc29sdmVkU3R5bGVzLFxuICAgICAgc3R5bGVVcmxzOiBhbGxTdHlsZUFic1VybHMsXG4gICAgICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHZpc2l0b3IubmdDb250ZW50U2VsZWN0b3JzXG4gICAgfSk7XG4gIH1cbn1cblxuY2xhc3MgVGVtcGxhdGVQcmVwYXJzZVZpc2l0b3IgaW1wbGVtZW50cyBIdG1sQXN0VmlzaXRvciB7XG4gIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10gPSBbXTtcbiAgc3R5bGVzOiBzdHJpbmdbXSA9IFtdO1xuICBzdHlsZVVybHM6IHN0cmluZ1tdID0gW107XG4gIG5nTm9uQmluZGFibGVTdGFja0NvdW50OiBudW1iZXIgPSAwO1xuXG4gIHZpc2l0RWxlbWVudChhc3Q6IEh0bWxFbGVtZW50QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHZhciBwcmVwYXJzZWRFbGVtZW50ID0gcHJlcGFyc2VFbGVtZW50KGFzdCk7XG4gICAgc3dpdGNoIChwcmVwYXJzZWRFbGVtZW50LnR5cGUpIHtcbiAgICAgIGNhc2UgUHJlcGFyc2VkRWxlbWVudFR5cGUuTkdfQ09OVEVOVDpcbiAgICAgICAgaWYgKHRoaXMubmdOb25CaW5kYWJsZVN0YWNrQ291bnQgPT09IDApIHtcbiAgICAgICAgICB0aGlzLm5nQ29udGVudFNlbGVjdG9ycy5wdXNoKHByZXBhcnNlZEVsZW1lbnQuc2VsZWN0QXR0cik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFOlxuICAgICAgICB2YXIgdGV4dENvbnRlbnQgPSAnJztcbiAgICAgICAgYXN0LmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIEh0bWxUZXh0QXN0KSB7XG4gICAgICAgICAgICB0ZXh0Q29udGVudCArPSAoPEh0bWxUZXh0QXN0PmNoaWxkKS52YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnN0eWxlcy5wdXNoKHRleHRDb250ZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFU0hFRVQ6XG4gICAgICAgIHRoaXMuc3R5bGVVcmxzLnB1c2gocHJlcGFyc2VkRWxlbWVudC5ocmVmQXR0cik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gRERDIHJlcG9ydHMgdGhpcyBhcyBlcnJvci4gU2VlOlxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZGFydC1sYW5nL2Rldl9jb21waWxlci9pc3N1ZXMvNDI4XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC5ub25CaW5kYWJsZSkge1xuICAgICAgdGhpcy5uZ05vbkJpbmRhYmxlU3RhY2tDb3VudCsrO1xuICAgIH1cbiAgICBodG1sVmlzaXRBbGwodGhpcywgYXN0LmNoaWxkcmVuKTtcbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC5ub25CaW5kYWJsZSkge1xuICAgICAgdGhpcy5uZ05vbkJpbmRhYmxlU3RhY2tDb3VudC0tO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdENvbW1lbnQoYXN0OiBIdG1sQ29tbWVudEFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXRBdHRyKGFzdDogSHRtbEF0dHJBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0VGV4dChhc3Q6IEh0bWxUZXh0QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdEV4cGFuc2lvbihhc3Q6IEh0bWxFeHBhbnNpb25Bc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG5cbiAgdmlzaXRFeHBhbnNpb25DYXNlKGFzdDogSHRtbEV4cGFuc2lvbkNhc2VBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG59XG4iXX0=