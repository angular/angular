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
var source_module_1 = require('./source_module');
var view_1 = require('angular2/src/core/metadata/view');
var xhr_1 = require('angular2/src/compiler/xhr');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var shadow_css_1 = require('angular2/src/compiler/shadow_css');
var url_resolver_1 = require('angular2/src/compiler/url_resolver');
var style_url_resolver_1 = require('./style_url_resolver');
var util_1 = require('./util');
var di_1 = require('angular2/src/core/di');
var view_factory_1 = require('angular2/src/core/render/view_factory');
var StyleCompiler = (function () {
    function StyleCompiler(_xhr, _urlResolver) {
        this._xhr = _xhr;
        this._urlResolver = _urlResolver;
        this._styleCache = new Map();
        this._shadowCss = new shadow_css_1.ShadowCss();
    }
    StyleCompiler.prototype.compileComponentRuntime = function (template) {
        var styles = template.styles;
        var styleAbsUrls = template.styleUrls;
        return this._loadStyles(styles, styleAbsUrls, template.encapsulation === view_1.ViewEncapsulation.Emulated);
    };
    StyleCompiler.prototype.compileComponentCodeGen = function (template) {
        var shim = template.encapsulation === view_1.ViewEncapsulation.Emulated;
        return this._styleCodeGen(template.styles, template.styleUrls, shim);
    };
    StyleCompiler.prototype.compileStylesheetCodeGen = function (stylesheetUrl, cssText) {
        var styleWithImports = style_url_resolver_1.extractStyleUrls(this._urlResolver, stylesheetUrl, cssText);
        return [
            this._styleModule(stylesheetUrl, false, this._styleCodeGen([styleWithImports.style], styleWithImports.styleUrls, false)),
            this._styleModule(stylesheetUrl, true, this._styleCodeGen([styleWithImports.style], styleWithImports.styleUrls, true))
        ];
    };
    StyleCompiler.prototype.clearCache = function () { this._styleCache.clear(); };
    StyleCompiler.prototype._loadStyles = function (plainStyles, absUrls, encapsulate) {
        var _this = this;
        var promises = absUrls.map(function (absUrl) {
            var cacheKey = "" + absUrl + (encapsulate ? '.shim' : '');
            var result = _this._styleCache.get(cacheKey);
            if (lang_1.isBlank(result)) {
                result = _this._xhr.get(absUrl).then(function (style) {
                    var styleWithImports = style_url_resolver_1.extractStyleUrls(_this._urlResolver, absUrl, style);
                    return _this._loadStyles([styleWithImports.style], styleWithImports.styleUrls, encapsulate);
                });
                _this._styleCache.set(cacheKey, result);
            }
            return result;
        });
        return async_1.PromiseWrapper.all(promises).then(function (nestedStyles) {
            var result = plainStyles.map(function (plainStyle) { return _this._shimIfNeeded(plainStyle, encapsulate); });
            nestedStyles.forEach(function (styles) { return result.push(styles); });
            return result;
        });
    };
    StyleCompiler.prototype._styleCodeGen = function (plainStyles, absUrls, shim) {
        var _this = this;
        var arrayPrefix = lang_1.IS_DART ? "const" : '';
        var styleExpressions = plainStyles.map(function (plainStyle) { return util_1.escapeSingleQuoteString(_this._shimIfNeeded(plainStyle, shim)); });
        for (var i = 0; i < absUrls.length; i++) {
            var moduleUrl = this._createModuleUrl(absUrls[i], shim);
            styleExpressions.push(source_module_1.moduleRef(moduleUrl) + "STYLES");
        }
        var expressionSource = arrayPrefix + " [" + styleExpressions.join(',') + "]";
        return new source_module_1.SourceExpression([], expressionSource);
    };
    StyleCompiler.prototype._styleModule = function (stylesheetUrl, shim, expression) {
        var moduleSource = "\n      " + expression.declarations.join('\n') + "\n      " + util_1.codeGenExportVariable('STYLES') + expression.expression + ";\n    ";
        return new source_module_1.SourceModule(this._createModuleUrl(stylesheetUrl, shim), moduleSource);
    };
    StyleCompiler.prototype._shimIfNeeded = function (style, shim) {
        return shim ? this._shadowCss.shimCssText(style, view_factory_1.CONTENT_ATTR, view_factory_1.HOST_ATTR) : style;
    };
    StyleCompiler.prototype._createModuleUrl = function (stylesheetUrl, shim) {
        return shim ? stylesheetUrl + ".shim" + util_1.MODULE_SUFFIX : "" + stylesheetUrl + util_1.MODULE_SUFFIX;
    };
    StyleCompiler = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [xhr_1.XHR, url_resolver_1.UrlResolver])
    ], StyleCompiler);
    return StyleCompiler;
})();
exports.StyleCompiler = StyleCompiler;
//# sourceMappingURL=style_compiler.js.map