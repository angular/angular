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
import { isPresent, StringWrapper } from 'angular2/src/facade/lang';
import { DOM } from 'angular2/src/core/dom/dom_adapter';
import { HtmlAttrAst, HtmlTextAst, HtmlElementAst, htmlVisitAll } from './html_ast';
import { escapeDoubleQuoteString } from './util';
import { Injectable } from 'angular2/src/core/di';
export let HtmlParser = class {
    parse(template, sourceInfo) {
        var root = DOM.createTemplate(template);
        return parseChildNodes(root, sourceInfo);
    }
    unparse(nodes) {
        var visitor = new UnparseVisitor();
        var parts = [];
        htmlVisitAll(visitor, nodes, parts);
        return parts.join('');
    }
};
HtmlParser = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], HtmlParser);
function parseText(text, indexInParent, parentSourceInfo) {
    // TODO(tbosch): add source row/column source info from parse5 / package:html
    var value = DOM.getText(text);
    return new HtmlTextAst(value, `${parentSourceInfo} > #text(${value}):nth-child(${indexInParent})`);
}
function parseAttr(element, parentSourceInfo, attrName, attrValue) {
    // TODO(tbosch): add source row/column source info from parse5 / package:html
    return new HtmlAttrAst(attrName, attrValue, `${parentSourceInfo}[${attrName}=${attrValue}]`);
}
function parseElement(element, indexInParent, parentSourceInfo) {
    // normalize nodename always as lower case so that following build steps
    // can rely on this
    var nodeName = DOM.nodeName(element).toLowerCase();
    // TODO(tbosch): add source row/column source info from parse5 / package:html
    var sourceInfo = `${parentSourceInfo} > ${nodeName}:nth-child(${indexInParent})`;
    var attrs = parseAttrs(element, sourceInfo);
    var childNodes = parseChildNodes(element, sourceInfo);
    return new HtmlElementAst(nodeName, attrs, childNodes, sourceInfo);
}
function parseAttrs(element, elementSourceInfo) {
    // Note: sort the attributes early in the pipeline to get
    // consistent results throughout the pipeline, as attribute order is not defined
    // in DOM parsers!
    var attrMap = DOM.attributeMap(element);
    var attrList = [];
    attrMap.forEach((value, name) => attrList.push([name, value]));
    attrList.sort((entry1, entry2) => StringWrapper.compare(entry1[0], entry2[0]));
    return attrList.map(entry => parseAttr(element, elementSourceInfo, entry[0], entry[1]));
}
function parseChildNodes(element, parentSourceInfo) {
    var root = DOM.templateAwareRoot(element);
    var childNodes = DOM.childNodesAsList(root);
    var result = [];
    var index = 0;
    childNodes.forEach(childNode => {
        var childResult = null;
        if (DOM.isTextNode(childNode)) {
            var text = childNode;
            childResult = parseText(text, index, parentSourceInfo);
        }
        else if (DOM.isElementNode(childNode)) {
            var el = childNode;
            childResult = parseElement(el, index, parentSourceInfo);
        }
        if (isPresent(childResult)) {
            // Won't have a childResult for e.g. comment nodes
            result.push(childResult);
        }
        index++;
    });
    return result;
}
class UnparseVisitor {
    visitElement(ast, parts) {
        parts.push(`<${ast.name}`);
        var attrs = [];
        htmlVisitAll(this, ast.attrs, attrs);
        if (ast.attrs.length > 0) {
            parts.push(' ');
            parts.push(attrs.join(' '));
        }
        parts.push(`>`);
        htmlVisitAll(this, ast.children, parts);
        parts.push(`</${ast.name}>`);
        return null;
    }
    visitAttr(ast, parts) {
        parts.push(`${ast.name}=${escapeDoubleQuoteString(ast.value)}`);
        return null;
    }
    visitText(ast, parts) {
        parts.push(ast.value);
        return null;
    }
}
//# sourceMappingURL=html_parser.js.map