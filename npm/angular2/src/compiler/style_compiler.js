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
var o = require('./output/output_ast');
var view_1 = require('angular2/src/core/metadata/view');
var shadow_css_1 = require('angular2/src/compiler/shadow_css');
var url_resolver_1 = require('angular2/src/compiler/url_resolver');
var style_url_resolver_1 = require('./style_url_resolver');
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var COMPONENT_VARIABLE = '%COMP%';
var HOST_ATTR = "_nghost-" + COMPONENT_VARIABLE;
var CONTENT_ATTR = "_ngcontent-" + COMPONENT_VARIABLE;
var StylesCompileDependency = (function () {
    function StylesCompileDependency(sourceUrl, isShimmed, valuePlaceholder) {
        this.sourceUrl = sourceUrl;
        this.isShimmed = isShimmed;
        this.valuePlaceholder = valuePlaceholder;
    }
    return StylesCompileDependency;
}());
exports.StylesCompileDependency = StylesCompileDependency;
var StylesCompileResult = (function () {
    function StylesCompileResult(statements, stylesVar, dependencies) {
        this.statements = statements;
        this.stylesVar = stylesVar;
        this.dependencies = dependencies;
    }
    return StylesCompileResult;
}());
exports.StylesCompileResult = StylesCompileResult;
var StyleCompiler = (function () {
    function StyleCompiler(_urlResolver) {
        this._urlResolver = _urlResolver;
        this._shadowCss = new shadow_css_1.ShadowCss();
    }
    StyleCompiler.prototype.compileComponent = function (comp) {
        var shim = comp.template.encapsulation === view_1.ViewEncapsulation.Emulated;
        return this._compileStyles(getStylesVarName(comp), comp.template.styles, comp.template.styleUrls, shim);
    };
    StyleCompiler.prototype.compileStylesheet = function (stylesheetUrl, cssText, isShimmed) {
        var styleWithImports = style_url_resolver_1.extractStyleUrls(this._urlResolver, stylesheetUrl, cssText);
        return this._compileStyles(getStylesVarName(null), [styleWithImports.style], styleWithImports.styleUrls, isShimmed);
    };
    StyleCompiler.prototype._compileStyles = function (stylesVar, plainStyles, absUrls, shim) {
        var _this = this;
        var styleExpressions = plainStyles.map(function (plainStyle) { return o.literal(_this._shimIfNeeded(plainStyle, shim)); });
        var dependencies = [];
        for (var i = 0; i < absUrls.length; i++) {
            var identifier = new compile_metadata_1.CompileIdentifierMetadata({ name: getStylesVarName(null) });
            dependencies.push(new StylesCompileDependency(absUrls[i], shim, identifier));
            styleExpressions.push(new o.ExternalExpr(identifier));
        }
        // styles variable contains plain strings and arrays of other styles arrays (recursive),
        // so we set its type to dynamic.
        var stmt = o.variable(stylesVar)
            .set(o.literalArr(styleExpressions, new o.ArrayType(o.DYNAMIC_TYPE, [o.TypeModifier.Const])))
            .toDeclStmt(null, [o.StmtModifier.Final]);
        return new StylesCompileResult([stmt], stylesVar, dependencies);
    };
    StyleCompiler.prototype._shimIfNeeded = function (style, shim) {
        return shim ? this._shadowCss.shimCssText(style, CONTENT_ATTR, HOST_ATTR) : style;
    };
    StyleCompiler = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [url_resolver_1.UrlResolver])
    ], StyleCompiler);
    return StyleCompiler;
}());
exports.StyleCompiler = StyleCompiler;
function getStylesVarName(component) {
    var result = "styles";
    if (lang_1.isPresent(component)) {
        result += "_" + component.type.name;
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVfY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvc3R5bGVfY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLGlDQUlPLG9CQUFvQixDQUFDLENBQUE7QUFDNUIsSUFBWSxDQUFDLFdBQU0scUJBQXFCLENBQUMsQ0FBQTtBQUN6QyxxQkFBZ0MsaUNBQWlDLENBQUMsQ0FBQTtBQUNsRSwyQkFBd0Isa0NBQWtDLENBQUMsQ0FBQTtBQUMzRCw2QkFBMEIsb0NBQW9DLENBQUMsQ0FBQTtBQUMvRCxtQ0FBK0Isc0JBQXNCLENBQUMsQ0FBQTtBQUN0RCxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCxxQkFBd0IsMEJBQTBCLENBQUMsQ0FBQTtBQUVuRCxJQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQztBQUNwQyxJQUFNLFNBQVMsR0FBc0IsYUFBVyxrQkFBb0IsQ0FBQztBQUNyRSxJQUFNLFlBQVksR0FBc0IsZ0JBQWMsa0JBQW9CLENBQUM7QUFFM0U7SUFDRSxpQ0FBbUIsU0FBaUIsRUFBUyxTQUFrQixFQUM1QyxnQkFBMkM7UUFEM0MsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUFTLGNBQVMsR0FBVCxTQUFTLENBQVM7UUFDNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUEyQjtJQUFHLENBQUM7SUFDcEUsOEJBQUM7QUFBRCxDQUFDLEFBSEQsSUFHQztBQUhZLCtCQUF1QiwwQkFHbkMsQ0FBQTtBQUVEO0lBQ0UsNkJBQW1CLFVBQXlCLEVBQVMsU0FBaUIsRUFDbkQsWUFBdUM7UUFEdkMsZUFBVSxHQUFWLFVBQVUsQ0FBZTtRQUFTLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFDbkQsaUJBQVksR0FBWixZQUFZLENBQTJCO0lBQUcsQ0FBQztJQUNoRSwwQkFBQztBQUFELENB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SyxDQUFDO0lBQ3BGLENBQUM7SUF4Q0g7UUFBQyxlQUFVLEVBQUU7O3FCQUFBO0lBeUNiLG9CQUFDO0FBQUQsQ0FBQyxBQXhDRCxJQXdDQztBQXhDWSxxQkFBYSxnQkF3Q3pCLENBQUE7QUFFRCwwQkFBMEIsU0FBbUM7SUFDM0QsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDO0lBQ3RCLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sSUFBSSxNQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBTSxDQUFDO0lBQ3RDLENBQUM7SUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSxcbiAgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSxcbiAgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhXG59IGZyb20gJy4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge1NoYWRvd0Nzc30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NoYWRvd19jc3MnO1xuaW1wb3J0IHtVcmxSZXNvbHZlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3VybF9yZXNvbHZlcic7XG5pbXBvcnQge2V4dHJhY3RTdHlsZVVybHN9IGZyb20gJy4vc3R5bGVfdXJsX3Jlc29sdmVyJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmNvbnN0IENPTVBPTkVOVF9WQVJJQUJMRSA9ICclQ09NUCUnO1xuY29uc3QgSE9TVF9BVFRSID0gLypAdHMyZGFydF9jb25zdCovIGBfbmdob3N0LSR7Q09NUE9ORU5UX1ZBUklBQkxFfWA7XG5jb25zdCBDT05URU5UX0FUVFIgPSAvKkB0czJkYXJ0X2NvbnN0Ki8gYF9uZ2NvbnRlbnQtJHtDT01QT05FTlRfVkFSSUFCTEV9YDtcblxuZXhwb3J0IGNsYXNzIFN0eWxlc0NvbXBpbGVEZXBlbmRlbmN5IHtcbiAgY29uc3RydWN0b3IocHVibGljIHNvdXJjZVVybDogc3RyaW5nLCBwdWJsaWMgaXNTaGltbWVkOiBib29sZWFuLFxuICAgICAgICAgICAgICBwdWJsaWMgdmFsdWVQbGFjZWhvbGRlcjogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSkge31cbn1cblxuZXhwb3J0IGNsYXNzIFN0eWxlc0NvbXBpbGVSZXN1bHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSwgcHVibGljIHN0eWxlc1Zhcjogc3RyaW5nLFxuICAgICAgICAgICAgICBwdWJsaWMgZGVwZW5kZW5jaWVzOiBTdHlsZXNDb21waWxlRGVwZW5kZW5jeVtdKSB7fVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU3R5bGVDb21waWxlciB7XG4gIHByaXZhdGUgX3NoYWRvd0NzczogU2hhZG93Q3NzID0gbmV3IFNoYWRvd0NzcygpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3VybFJlc29sdmVyOiBVcmxSZXNvbHZlcikge31cblxuICBjb21waWxlQ29tcG9uZW50KGNvbXA6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSk6IFN0eWxlc0NvbXBpbGVSZXN1bHQge1xuICAgIHZhciBzaGltID0gY29tcC50ZW1wbGF0ZS5lbmNhcHN1bGF0aW9uID09PSBWaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZDtcbiAgICByZXR1cm4gdGhpcy5fY29tcGlsZVN0eWxlcyhnZXRTdHlsZXNWYXJOYW1lKGNvbXApLCBjb21wLnRlbXBsYXRlLnN0eWxlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wLnRlbXBsYXRlLnN0eWxlVXJscywgc2hpbSk7XG4gIH1cblxuICBjb21waWxlU3R5bGVzaGVldChzdHlsZXNoZWV0VXJsOiBzdHJpbmcsIGNzc1RleHQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgaXNTaGltbWVkOiBib29sZWFuKTogU3R5bGVzQ29tcGlsZVJlc3VsdCB7XG4gICAgdmFyIHN0eWxlV2l0aEltcG9ydHMgPSBleHRyYWN0U3R5bGVVcmxzKHRoaXMuX3VybFJlc29sdmVyLCBzdHlsZXNoZWV0VXJsLCBjc3NUZXh0KTtcbiAgICByZXR1cm4gdGhpcy5fY29tcGlsZVN0eWxlcyhnZXRTdHlsZXNWYXJOYW1lKG51bGwpLCBbc3R5bGVXaXRoSW1wb3J0cy5zdHlsZV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVXaXRoSW1wb3J0cy5zdHlsZVVybHMsIGlzU2hpbW1lZCk7XG4gIH1cblxuICBwcml2YXRlIF9jb21waWxlU3R5bGVzKHN0eWxlc1Zhcjogc3RyaW5nLCBwbGFpblN0eWxlczogc3RyaW5nW10sIGFic1VybHM6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHNoaW06IGJvb2xlYW4pOiBTdHlsZXNDb21waWxlUmVzdWx0IHtcbiAgICB2YXIgc3R5bGVFeHByZXNzaW9ucyA9XG4gICAgICAgIHBsYWluU3R5bGVzLm1hcChwbGFpblN0eWxlID0+IG8ubGl0ZXJhbCh0aGlzLl9zaGltSWZOZWVkZWQocGxhaW5TdHlsZSwgc2hpbSkpKTtcbiAgICB2YXIgZGVwZW5kZW5jaWVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhYnNVcmxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKHtuYW1lOiBnZXRTdHlsZXNWYXJOYW1lKG51bGwpfSk7XG4gICAgICBkZXBlbmRlbmNpZXMucHVzaChuZXcgU3R5bGVzQ29tcGlsZURlcGVuZGVuY3koYWJzVXJsc1tpXSwgc2hpbSwgaWRlbnRpZmllcikpO1xuICAgICAgc3R5bGVFeHByZXNzaW9ucy5wdXNoKG5ldyBvLkV4dGVybmFsRXhwcihpZGVudGlmaWVyKSk7XG4gICAgfVxuICAgIC8vIHN0eWxlcyB2YXJpYWJsZSBjb250YWlucyBwbGFpbiBzdHJpbmdzIGFuZCBhcnJheXMgb2Ygb3RoZXIgc3R5bGVzIGFycmF5cyAocmVjdXJzaXZlKSxcbiAgICAvLyBzbyB3ZSBzZXQgaXRzIHR5cGUgdG8gZHluYW1pYy5cbiAgICB2YXIgc3RtdCA9IG8udmFyaWFibGUoc3R5bGVzVmFyKVxuICAgICAgICAgICAgICAgICAgIC5zZXQoby5saXRlcmFsQXJyKHN0eWxlRXhwcmVzc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IG8uQXJyYXlUeXBlKG8uRFlOQU1JQ19UWVBFLCBbby5UeXBlTW9kaWZpZXIuQ29uc3RdKSkpXG4gICAgICAgICAgICAgICAgICAgLnRvRGVjbFN0bXQobnVsbCwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSk7XG4gICAgcmV0dXJuIG5ldyBTdHlsZXNDb21waWxlUmVzdWx0KFtzdG10XSwgc3R5bGVzVmFyLCBkZXBlbmRlbmNpZXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2hpbUlmTmVlZGVkKHN0eWxlOiBzdHJpbmcsIHNoaW06IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgIHJldHVybiBzaGltID8gdGhpcy5fc2hhZG93Q3NzLnNoaW1Dc3NUZXh0KHN0eWxlLCBDT05URU5UX0FUVFIsIEhPU1RfQVRUUikgOiBzdHlsZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRTdHlsZXNWYXJOYW1lKGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKTogc3RyaW5nIHtcbiAgdmFyIHJlc3VsdCA9IGBzdHlsZXNgO1xuICBpZiAoaXNQcmVzZW50KGNvbXBvbmVudCkpIHtcbiAgICByZXN1bHQgKz0gYF8ke2NvbXBvbmVudC50eXBlLm5hbWV9YDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufSJdfQ==