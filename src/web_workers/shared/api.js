'use strict';var lang_1 = require("angular2/src/facade/lang");
var di_1 = require("angular2/src/core/di");
exports.ON_WEB_WORKER = lang_1.CONST_EXPR(new di_1.OpaqueToken('WebWorker.onWebWorker'));
var WebWorkerElementRef = (function () {
    function WebWorkerElementRef(renderView, boundElementIndex) {
        this.renderView = renderView;
        this.boundElementIndex = boundElementIndex;
    }
    return WebWorkerElementRef;
})();
exports.WebWorkerElementRef = WebWorkerElementRef;
var WebWorkerTemplateCmd = (function () {
    function WebWorkerTemplateCmd() {
    }
    WebWorkerTemplateCmd.prototype.visit = function (visitor, context) { return null; };
    return WebWorkerTemplateCmd;
})();
exports.WebWorkerTemplateCmd = WebWorkerTemplateCmd;
var WebWorkerTextCmd = (function () {
    function WebWorkerTextCmd(isBound, ngContentIndex, value) {
        this.isBound = isBound;
        this.ngContentIndex = ngContentIndex;
        this.value = value;
    }
    WebWorkerTextCmd.prototype.visit = function (visitor, context) {
        return visitor.visitText(this, context);
    };
    return WebWorkerTextCmd;
})();
exports.WebWorkerTextCmd = WebWorkerTextCmd;
var WebWorkerNgContentCmd = (function () {
    function WebWorkerNgContentCmd(index, ngContentIndex) {
        this.index = index;
        this.ngContentIndex = ngContentIndex;
    }
    WebWorkerNgContentCmd.prototype.visit = function (visitor, context) {
        return visitor.visitNgContent(this, context);
    };
    return WebWorkerNgContentCmd;
})();
exports.WebWorkerNgContentCmd = WebWorkerNgContentCmd;
var WebWorkerBeginElementCmd = (function () {
    function WebWorkerBeginElementCmd(isBound, ngContentIndex, name, attrNameAndValues, eventTargetAndNames) {
        this.isBound = isBound;
        this.ngContentIndex = ngContentIndex;
        this.name = name;
        this.attrNameAndValues = attrNameAndValues;
        this.eventTargetAndNames = eventTargetAndNames;
    }
    WebWorkerBeginElementCmd.prototype.visit = function (visitor, context) {
        return visitor.visitBeginElement(this, context);
    };
    return WebWorkerBeginElementCmd;
})();
exports.WebWorkerBeginElementCmd = WebWorkerBeginElementCmd;
var WebWorkerEndElementCmd = (function () {
    function WebWorkerEndElementCmd() {
    }
    WebWorkerEndElementCmd.prototype.visit = function (visitor, context) {
        return visitor.visitEndElement(context);
    };
    return WebWorkerEndElementCmd;
})();
exports.WebWorkerEndElementCmd = WebWorkerEndElementCmd;
var WebWorkerBeginComponentCmd = (function () {
    function WebWorkerBeginComponentCmd(isBound, ngContentIndex, name, attrNameAndValues, eventTargetAndNames, templateId) {
        this.isBound = isBound;
        this.ngContentIndex = ngContentIndex;
        this.name = name;
        this.attrNameAndValues = attrNameAndValues;
        this.eventTargetAndNames = eventTargetAndNames;
        this.templateId = templateId;
    }
    WebWorkerBeginComponentCmd.prototype.visit = function (visitor, context) {
        return visitor.visitBeginComponent(this, context);
    };
    return WebWorkerBeginComponentCmd;
})();
exports.WebWorkerBeginComponentCmd = WebWorkerBeginComponentCmd;
var WebWorkerEndComponentCmd = (function () {
    function WebWorkerEndComponentCmd() {
    }
    WebWorkerEndComponentCmd.prototype.visit = function (visitor, context) {
        return visitor.visitEndComponent(context);
    };
    return WebWorkerEndComponentCmd;
})();
exports.WebWorkerEndComponentCmd = WebWorkerEndComponentCmd;
var WebWorkerEmbeddedTemplateCmd = (function () {
    function WebWorkerEmbeddedTemplateCmd(isBound, ngContentIndex, name, attrNameAndValues, eventTargetAndNames, isMerged, children) {
        this.isBound = isBound;
        this.ngContentIndex = ngContentIndex;
        this.name = name;
        this.attrNameAndValues = attrNameAndValues;
        this.eventTargetAndNames = eventTargetAndNames;
        this.isMerged = isMerged;
        this.children = children;
    }
    WebWorkerEmbeddedTemplateCmd.prototype.visit = function (visitor, context) {
        return visitor.visitEmbeddedTemplate(this, context);
    };
    return WebWorkerEmbeddedTemplateCmd;
})();
exports.WebWorkerEmbeddedTemplateCmd = WebWorkerEmbeddedTemplateCmd;
//# sourceMappingURL=api.js.map