var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { StringWrapper, RegExpWrapper, CONST_EXPR, isPresent } from 'angular2/src/facade/lang';
import { HtmlAttrAst, HtmlElementAst } from './html_ast';
import { HtmlParser, HtmlParseTreeResult } from './html_parser';
import { dashCaseToCamelCase } from './util';
var LONG_SYNTAX_REGEXP = /^(?:on-(.*)|bindon-(.*)|bind-(.*)|var-(.*))$/ig;
var SHORT_SYNTAX_REGEXP = /^(?:\((.*)\)|\[\((.*)\)\]|\[(.*)\]|#(.*))$/ig;
var VARIABLE_TPL_BINDING_REGEXP = /(\bvar\s+|#)(\S+)/ig;
var TEMPLATE_SELECTOR_REGEXP = /^(\S+)/g;
var SPECIAL_PREFIXES_REGEXP = /^(class|style|attr)\./ig;
var INTERPOLATION_REGEXP = /\{\{.*?\}\}/g;
const SPECIAL_CASES = CONST_EXPR([
    'ng-non-bindable',
    'ng-default-control',
    'ng-no-form',
]);
/**
 * Convert templates to the case sensitive syntax
 *
 * @internal
 */
export class LegacyHtmlAstTransformer {
    constructor(dashCaseSelectors) {
        this.dashCaseSelectors = dashCaseSelectors;
        this.rewrittenAst = [];
        this.visitingTemplateEl = false;
    }
    visitElement(ast, context) {
        this.visitingTemplateEl = ast.name.toLowerCase() == 'template';
        let attrs = ast.attrs.map(attr => attr.visit(this, null));
        let children = ast.children.map(child => child.visit(this, null));
        return new HtmlElementAst(ast.name, attrs, children, ast.sourceSpan);
    }
    visitAttr(originalAst, context) {
        let ast = originalAst;
        if (this.visitingTemplateEl) {
            if (isPresent(RegExpWrapper.firstMatch(LONG_SYNTAX_REGEXP, ast.name))) {
                // preserve the "-" in the prefix for the long syntax
                ast = this._rewriteLongSyntax(ast);
            }
            else {
                // rewrite any other attribute
                let name = dashCaseToCamelCase(ast.name);
                ast = name == ast.name ? ast : new HtmlAttrAst(name, ast.value, ast.sourceSpan);
            }
        }
        else {
            ast = this._rewriteTemplateAttribute(ast);
            ast = this._rewriteLongSyntax(ast);
            ast = this._rewriteShortSyntax(ast);
            ast = this._rewriteStar(ast);
            ast = this._rewriteInterpolation(ast);
            ast = this._rewriteSpecialCases(ast);
        }
        if (ast !== originalAst) {
            this.rewrittenAst.push(ast);
        }
        return ast;
    }
    visitText(ast, context) { return ast; }
    _rewriteLongSyntax(ast) {
        let m = RegExpWrapper.firstMatch(LONG_SYNTAX_REGEXP, ast.name);
        let attrName = ast.name;
        let attrValue = ast.value;
        if (isPresent(m)) {
            if (isPresent(m[1])) {
                attrName = `on-${dashCaseToCamelCase(m[1])}`;
            }
            else if (isPresent(m[2])) {
                attrName = `bindon-${dashCaseToCamelCase(m[2])}`;
            }
            else if (isPresent(m[3])) {
                attrName = `bind-${dashCaseToCamelCase(m[3])}`;
            }
            else if (isPresent(m[4])) {
                attrName = `var-${dashCaseToCamelCase(m[4])}`;
                attrValue = dashCaseToCamelCase(attrValue);
            }
        }
        return attrName == ast.name && attrValue == ast.value ?
            ast :
            new HtmlAttrAst(attrName, attrValue, ast.sourceSpan);
    }
    _rewriteTemplateAttribute(ast) {
        let name = ast.name;
        let value = ast.value;
        if (name.toLowerCase() == 'template') {
            name = 'template';
            // rewrite the directive selector
            value = StringWrapper.replaceAllMapped(value, TEMPLATE_SELECTOR_REGEXP, (m) => { return dashCaseToCamelCase(m[1]); });
            // rewrite the var declarations
            value = StringWrapper.replaceAllMapped(value, VARIABLE_TPL_BINDING_REGEXP, m => {
                return `${m[1].toLowerCase()}${dashCaseToCamelCase(m[2])}`;
            });
        }
        if (name == ast.name && value == ast.value) {
            return ast;
        }
        return new HtmlAttrAst(name, value, ast.sourceSpan);
    }
    _rewriteShortSyntax(ast) {
        let m = RegExpWrapper.firstMatch(SHORT_SYNTAX_REGEXP, ast.name);
        let attrName = ast.name;
        let attrValue = ast.value;
        if (isPresent(m)) {
            if (isPresent(m[1])) {
                attrName = `(${dashCaseToCamelCase(m[1])})`;
            }
            else if (isPresent(m[2])) {
                attrName = `[(${dashCaseToCamelCase(m[2])})]`;
            }
            else if (isPresent(m[3])) {
                let prop = StringWrapper.replaceAllMapped(m[3], SPECIAL_PREFIXES_REGEXP, (m) => { return m[1].toLowerCase() + '.'; });
                if (prop.startsWith('class.') || prop.startsWith('attr.') || prop.startsWith('style.')) {
                    attrName = `[${prop}]`;
                }
                else {
                    attrName = `[${dashCaseToCamelCase(prop)}]`;
                }
            }
            else if (isPresent(m[4])) {
                attrName = `#${dashCaseToCamelCase(m[4])}`;
                attrValue = dashCaseToCamelCase(attrValue);
            }
        }
        return attrName == ast.name && attrValue == ast.value ?
            ast :
            new HtmlAttrAst(attrName, attrValue, ast.sourceSpan);
    }
    _rewriteStar(ast) {
        let attrName = ast.name;
        let attrValue = ast.value;
        if (attrName[0] == '*') {
            attrName = dashCaseToCamelCase(attrName);
            // rewrite the var declarations
            attrValue = StringWrapper.replaceAllMapped(attrValue, VARIABLE_TPL_BINDING_REGEXP, m => {
                return `${m[1].toLowerCase()}${dashCaseToCamelCase(m[2])}`;
            });
        }
        return attrName == ast.name && attrValue == ast.value ?
            ast :
            new HtmlAttrAst(attrName, attrValue, ast.sourceSpan);
    }
    _rewriteInterpolation(ast) {
        let hasInterpolation = RegExpWrapper.test(INTERPOLATION_REGEXP, ast.value);
        if (!hasInterpolation) {
            return ast;
        }
        let name = ast.name;
        if (!(name.startsWith('attr.') || name.startsWith('class.') || name.startsWith('style.'))) {
            name = dashCaseToCamelCase(ast.name);
        }
        return name == ast.name ? ast : new HtmlAttrAst(name, ast.value, ast.sourceSpan);
    }
    _rewriteSpecialCases(ast) {
        let attrName = ast.name;
        if (SPECIAL_CASES.indexOf(attrName) > -1) {
            return new HtmlAttrAst(dashCaseToCamelCase(attrName), ast.value, ast.sourceSpan);
        }
        if (isPresent(this.dashCaseSelectors) && this.dashCaseSelectors.indexOf(attrName) > -1) {
            return new HtmlAttrAst(dashCaseToCamelCase(attrName), ast.value, ast.sourceSpan);
        }
        return ast;
    }
}
export let LegacyHtmlParser = class extends HtmlParser {
    parse(sourceContent, sourceUrl) {
        let transformer = new LegacyHtmlAstTransformer();
        let htmlParseTreeResult = super.parse(sourceContent, sourceUrl);
        let rootNodes = htmlParseTreeResult.rootNodes.map(node => node.visit(transformer, null));
        return transformer.rewrittenAst.length > 0 ?
            new HtmlParseTreeResult(rootNodes, htmlParseTreeResult.errors) :
            htmlParseTreeResult;
    }
};
LegacyHtmlParser = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], LegacyHtmlParser);
