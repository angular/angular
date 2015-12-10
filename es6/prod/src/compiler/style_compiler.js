var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { SourceModule, SourceExpression, moduleRef } from './source_module';
import { ViewEncapsulation } from 'angular2/src/core/metadata/view';
import { XHR } from 'angular2/src/compiler/xhr';
import { IS_DART, isBlank } from 'angular2/src/facade/lang';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { ShadowCss } from 'angular2/src/compiler/shadow_css';
import { UrlResolver } from 'angular2/src/compiler/url_resolver';
import { extractStyleUrls } from './style_url_resolver';
import { escapeSingleQuoteString, codeGenExportVariable, MODULE_SUFFIX } from './util';
import { Injectable } from 'angular2/src/core/di';
import { HOST_ATTR, CONTENT_ATTR } from 'angular2/src/core/render/view_factory';
export let StyleCompiler = class {
    constructor(_xhr, _urlResolver) {
        this._xhr = _xhr;
        this._urlResolver = _urlResolver;
        this._styleCache = new Map();
        this._shadowCss = new ShadowCss();
    }
    compileComponentRuntime(template) {
        var styles = template.styles;
        var styleAbsUrls = template.styleUrls;
        return this._loadStyles(styles, styleAbsUrls, template.encapsulation === ViewEncapsulation.Emulated);
    }
    compileComponentCodeGen(template) {
        var shim = template.encapsulation === ViewEncapsulation.Emulated;
        return this._styleCodeGen(template.styles, template.styleUrls, shim);
    }
    compileStylesheetCodeGen(stylesheetUrl, cssText) {
        var styleWithImports = extractStyleUrls(this._urlResolver, stylesheetUrl, cssText);
        return [
            this._styleModule(stylesheetUrl, false, this._styleCodeGen([styleWithImports.style], styleWithImports.styleUrls, false)),
            this._styleModule(stylesheetUrl, true, this._styleCodeGen([styleWithImports.style], styleWithImports.styleUrls, true))
        ];
    }
    clearCache() { this._styleCache.clear(); }
    _loadStyles(plainStyles, absUrls, encapsulate) {
        var promises = absUrls.map((absUrl) => {
            var cacheKey = `${absUrl}${encapsulate ? '.shim' : ''}`;
            var result = this._styleCache.get(cacheKey);
            if (isBlank(result)) {
                result = this._xhr.get(absUrl).then((style) => {
                    var styleWithImports = extractStyleUrls(this._urlResolver, absUrl, style);
                    return this._loadStyles([styleWithImports.style], styleWithImports.styleUrls, encapsulate);
                });
                this._styleCache.set(cacheKey, result);
            }
            return result;
        });
        return PromiseWrapper.all(promises).then((nestedStyles) => {
            var result = plainStyles.map(plainStyle => this._shimIfNeeded(plainStyle, encapsulate));
            nestedStyles.forEach(styles => result.push(styles));
            return result;
        });
    }
    _styleCodeGen(plainStyles, absUrls, shim) {
        var arrayPrefix = IS_DART ? `const` : '';
        var styleExpressions = plainStyles.map(plainStyle => escapeSingleQuoteString(this._shimIfNeeded(plainStyle, shim)));
        for (var i = 0; i < absUrls.length; i++) {
            var moduleUrl = this._createModuleUrl(absUrls[i], shim);
            styleExpressions.push(`${moduleRef(moduleUrl)}STYLES`);
        }
        var expressionSource = `${arrayPrefix} [${styleExpressions.join(',')}]`;
        return new SourceExpression([], expressionSource);
    }
    _styleModule(stylesheetUrl, shim, expression) {
        var moduleSource = `
      ${expression.declarations.join('\n')}
      ${codeGenExportVariable('STYLES')}${expression.expression};
    `;
        return new SourceModule(this._createModuleUrl(stylesheetUrl, shim), moduleSource);
    }
    _shimIfNeeded(style, shim) {
        return shim ? this._shadowCss.shimCssText(style, CONTENT_ATTR, HOST_ATTR) : style;
    }
    _createModuleUrl(stylesheetUrl, shim) {
        return shim ? `${stylesheetUrl}.shim${MODULE_SUFFIX}` : `${stylesheetUrl}${MODULE_SUFFIX}`;
    }
};
StyleCompiler = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [XHR, UrlResolver])
], StyleCompiler);
