'use strict';var lang_1 = require('angular2/src/facade/lang');
var TextAst = (function () {
    function TextAst(value, ngContentIndex, sourceInfo) {
        this.value = value;
        this.ngContentIndex = ngContentIndex;
        this.sourceInfo = sourceInfo;
    }
    TextAst.prototype.visit = function (visitor, context) { return visitor.visitText(this, context); };
    return TextAst;
})();
exports.TextAst = TextAst;
var BoundTextAst = (function () {
    function BoundTextAst(value, ngContentIndex, sourceInfo) {
        this.value = value;
        this.ngContentIndex = ngContentIndex;
        this.sourceInfo = sourceInfo;
    }
    BoundTextAst.prototype.visit = function (visitor, context) {
        return visitor.visitBoundText(this, context);
    };
    return BoundTextAst;
})();
exports.BoundTextAst = BoundTextAst;
var AttrAst = (function () {
    function AttrAst(name, value, sourceInfo) {
        this.name = name;
        this.value = value;
        this.sourceInfo = sourceInfo;
    }
    AttrAst.prototype.visit = function (visitor, context) { return visitor.visitAttr(this, context); };
    return AttrAst;
})();
exports.AttrAst = AttrAst;
var BoundElementPropertyAst = (function () {
    function BoundElementPropertyAst(name, type, value, unit, sourceInfo) {
        this.name = name;
        this.type = type;
        this.value = value;
        this.unit = unit;
        this.sourceInfo = sourceInfo;
    }
    BoundElementPropertyAst.prototype.visit = function (visitor, context) {
        return visitor.visitElementProperty(this, context);
    };
    return BoundElementPropertyAst;
})();
exports.BoundElementPropertyAst = BoundElementPropertyAst;
var BoundEventAst = (function () {
    function BoundEventAst(name, target, handler, sourceInfo) {
        this.name = name;
        this.target = target;
        this.handler = handler;
        this.sourceInfo = sourceInfo;
    }
    BoundEventAst.prototype.visit = function (visitor, context) {
        return visitor.visitEvent(this, context);
    };
    Object.defineProperty(BoundEventAst.prototype, "fullName", {
        get: function () {
            if (lang_1.isPresent(this.target)) {
                return this.target + ":" + this.name;
            }
            else {
                return this.name;
            }
        },
        enumerable: true,
        configurable: true
    });
    return BoundEventAst;
})();
exports.BoundEventAst = BoundEventAst;
var VariableAst = (function () {
    function VariableAst(name, value, sourceInfo) {
        this.name = name;
        this.value = value;
        this.sourceInfo = sourceInfo;
    }
    VariableAst.prototype.visit = function (visitor, context) {
        return visitor.visitVariable(this, context);
    };
    return VariableAst;
})();
exports.VariableAst = VariableAst;
var ElementAst = (function () {
    function ElementAst(name, attrs, inputs, outputs, exportAsVars, directives, children, ngContentIndex, sourceInfo) {
        this.name = name;
        this.attrs = attrs;
        this.inputs = inputs;
        this.outputs = outputs;
        this.exportAsVars = exportAsVars;
        this.directives = directives;
        this.children = children;
        this.ngContentIndex = ngContentIndex;
        this.sourceInfo = sourceInfo;
    }
    ElementAst.prototype.visit = function (visitor, context) {
        return visitor.visitElement(this, context);
    };
    ElementAst.prototype.isBound = function () {
        return (this.inputs.length > 0 || this.outputs.length > 0 || this.exportAsVars.length > 0 ||
            this.directives.length > 0);
    };
    ElementAst.prototype.getComponent = function () {
        return this.directives.length > 0 && this.directives[0].directive.isComponent ?
            this.directives[0].directive :
            null;
    };
    return ElementAst;
})();
exports.ElementAst = ElementAst;
var EmbeddedTemplateAst = (function () {
    function EmbeddedTemplateAst(attrs, outputs, vars, directives, children, ngContentIndex, sourceInfo) {
        this.attrs = attrs;
        this.outputs = outputs;
        this.vars = vars;
        this.directives = directives;
        this.children = children;
        this.ngContentIndex = ngContentIndex;
        this.sourceInfo = sourceInfo;
    }
    EmbeddedTemplateAst.prototype.visit = function (visitor, context) {
        return visitor.visitEmbeddedTemplate(this, context);
    };
    return EmbeddedTemplateAst;
})();
exports.EmbeddedTemplateAst = EmbeddedTemplateAst;
var BoundDirectivePropertyAst = (function () {
    function BoundDirectivePropertyAst(directiveName, templateName, value, sourceInfo) {
        this.directiveName = directiveName;
        this.templateName = templateName;
        this.value = value;
        this.sourceInfo = sourceInfo;
    }
    BoundDirectivePropertyAst.prototype.visit = function (visitor, context) {
        return visitor.visitDirectiveProperty(this, context);
    };
    return BoundDirectivePropertyAst;
})();
exports.BoundDirectivePropertyAst = BoundDirectivePropertyAst;
var DirectiveAst = (function () {
    function DirectiveAst(directive, inputs, hostProperties, hostEvents, exportAsVars, sourceInfo) {
        this.directive = directive;
        this.inputs = inputs;
        this.hostProperties = hostProperties;
        this.hostEvents = hostEvents;
        this.exportAsVars = exportAsVars;
        this.sourceInfo = sourceInfo;
    }
    DirectiveAst.prototype.visit = function (visitor, context) {
        return visitor.visitDirective(this, context);
    };
    return DirectiveAst;
})();
exports.DirectiveAst = DirectiveAst;
var NgContentAst = (function () {
    function NgContentAst(index, ngContentIndex, sourceInfo) {
        this.index = index;
        this.ngContentIndex = ngContentIndex;
        this.sourceInfo = sourceInfo;
    }
    NgContentAst.prototype.visit = function (visitor, context) {
        return visitor.visitNgContent(this, context);
    };
    return NgContentAst;
})();
exports.NgContentAst = NgContentAst;
(function (PropertyBindingType) {
    PropertyBindingType[PropertyBindingType["Property"] = 0] = "Property";
    PropertyBindingType[PropertyBindingType["Attribute"] = 1] = "Attribute";
    PropertyBindingType[PropertyBindingType["Class"] = 2] = "Class";
    PropertyBindingType[PropertyBindingType["Style"] = 3] = "Style";
})(exports.PropertyBindingType || (exports.PropertyBindingType = {}));
var PropertyBindingType = exports.PropertyBindingType;
function templateVisitAll(visitor, asts, context) {
    if (context === void 0) { context = null; }
    var result = [];
    asts.forEach(function (ast) {
        var astResult = ast.visit(visitor, context);
        if (lang_1.isPresent(astResult)) {
            result.push(astResult);
        }
    });
    return result;
}
exports.templateVisitAll = templateVisitAll;
//# sourceMappingURL=template_ast.js.map