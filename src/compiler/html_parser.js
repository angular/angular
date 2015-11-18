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
var lang_1 = require('angular2/src/facade/lang');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var html_ast_1 = require('./html_ast');
var util_1 = require('./util');
var di_1 = require('angular2/src/core/di');
var HtmlParser = (function () {
    function HtmlParser() {
    }
    HtmlParser.prototype.parse = function (template, sourceInfo) {
        var root = dom_adapter_1.DOM.createTemplate(template);
        return parseChildNodes(root, sourceInfo);
    };
    HtmlParser.prototype.unparse = function (nodes) {
        var visitor = new UnparseVisitor();
        var parts = [];
        html_ast_1.htmlVisitAll(visitor, nodes, parts);
        return parts.join('');
    };
    HtmlParser = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], HtmlParser);
    return HtmlParser;
})();
exports.HtmlParser = HtmlParser;
function parseText(text, indexInParent, parentSourceInfo) {
    // TODO(tbosch): add source row/column source info from parse5 / package:html
    var value = dom_adapter_1.DOM.getText(text);
    return new html_ast_1.HtmlTextAst(value, parentSourceInfo + " > #text(" + value + "):nth-child(" + indexInParent + ")");
}
function parseAttr(element, parentSourceInfo, attrName, attrValue) {
    // TODO(tbosch): add source row/column source info from parse5 / package:html
    return new html_ast_1.HtmlAttrAst(attrName, attrValue, parentSourceInfo + "[" + attrName + "=" + attrValue + "]");
}
function parseElement(element, indexInParent, parentSourceInfo) {
    // normalize nodename always as lower case so that following build steps
    // can rely on this
    var nodeName = dom_adapter_1.DOM.nodeName(element).toLowerCase();
    // TODO(tbosch): add source row/column source info from parse5 / package:html
    var sourceInfo = parentSourceInfo + " > " + nodeName + ":nth-child(" + indexInParent + ")";
    var attrs = parseAttrs(element, sourceInfo);
    var childNodes = parseChildNodes(element, sourceInfo);
    return new html_ast_1.HtmlElementAst(nodeName, attrs, childNodes, sourceInfo);
}
function parseAttrs(element, elementSourceInfo) {
    // Note: sort the attributes early in the pipeline to get
    // consistent results throughout the pipeline, as attribute order is not defined
    // in DOM parsers!
    var attrMap = dom_adapter_1.DOM.attributeMap(element);
    var attrList = [];
    attrMap.forEach(function (value, name) { return attrList.push([name, value]); });
    attrList.sort(function (entry1, entry2) { return lang_1.StringWrapper.compare(entry1[0], entry2[0]); });
    return attrList.map(function (entry) { return parseAttr(element, elementSourceInfo, entry[0], entry[1]); });
}
function parseChildNodes(element, parentSourceInfo) {
    var root = dom_adapter_1.DOM.templateAwareRoot(element);
    var childNodes = dom_adapter_1.DOM.childNodesAsList(root);
    var result = [];
    var index = 0;
    childNodes.forEach(function (childNode) {
        var childResult = null;
        if (dom_adapter_1.DOM.isTextNode(childNode)) {
            var text = childNode;
            childResult = parseText(text, index, parentSourceInfo);
        }
        else if (dom_adapter_1.DOM.isElementNode(childNode)) {
            var el = childNode;
            childResult = parseElement(el, index, parentSourceInfo);
        }
        if (lang_1.isPresent(childResult)) {
            // Won't have a childResult for e.g. comment nodes
            result.push(childResult);
        }
        index++;
    });
    return result;
}
var UnparseVisitor = (function () {
    function UnparseVisitor() {
    }
    UnparseVisitor.prototype.visitElement = function (ast, parts) {
        parts.push("<" + ast.name);
        var attrs = [];
        html_ast_1.htmlVisitAll(this, ast.attrs, attrs);
        if (ast.attrs.length > 0) {
            parts.push(' ');
            parts.push(attrs.join(' '));
        }
        parts.push(">");
        html_ast_1.htmlVisitAll(this, ast.children, parts);
        parts.push("</" + ast.name + ">");
        return null;
    };
    UnparseVisitor.prototype.visitAttr = function (ast, parts) {
        parts.push(ast.name + "=" + util_1.escapeDoubleQuoteString(ast.value));
        return null;
    };
    UnparseVisitor.prototype.visitText = function (ast, parts) {
        parts.push(ast.value);
        return null;
    };
    return UnparseVisitor;
})();
//# sourceMappingURL=html_parser.js.map