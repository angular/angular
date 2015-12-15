'use strict';var lang_1 = require('angular2/src/facade/lang');
/**
 * A segment of text within the template.
 */
var TextAst = (function () {
    function TextAst(value, ngContentIndex, sourceSpan) {
        this.value = value;
        this.ngContentIndex = ngContentIndex;
        this.sourceSpan = sourceSpan;
    }
    TextAst.prototype.visit = function (visitor, context) { return visitor.visitText(this, context); };
    return TextAst;
})();
exports.TextAst = TextAst;
/**
 * A bound expression within the text of a template.
 */
var BoundTextAst = (function () {
    function BoundTextAst(value, ngContentIndex, sourceSpan) {
        this.value = value;
        this.ngContentIndex = ngContentIndex;
        this.sourceSpan = sourceSpan;
    }
    BoundTextAst.prototype.visit = function (visitor, context) {
        return visitor.visitBoundText(this, context);
    };
    return BoundTextAst;
})();
exports.BoundTextAst = BoundTextAst;
/**
 * A plain attribute on an element.
 */
var AttrAst = (function () {
    function AttrAst(name, value, sourceSpan) {
        this.name = name;
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
    AttrAst.prototype.visit = function (visitor, context) { return visitor.visitAttr(this, context); };
    return AttrAst;
})();
exports.AttrAst = AttrAst;
/**
 * A binding for an element property (e.g. `[property]="expression"`).
 */
var BoundElementPropertyAst = (function () {
    function BoundElementPropertyAst(name, type, value, unit, sourceSpan) {
        this.name = name;
        this.type = type;
        this.value = value;
        this.unit = unit;
        this.sourceSpan = sourceSpan;
    }
    BoundElementPropertyAst.prototype.visit = function (visitor, context) {
        return visitor.visitElementProperty(this, context);
    };
    return BoundElementPropertyAst;
})();
exports.BoundElementPropertyAst = BoundElementPropertyAst;
/**
 * A binding for an element event (e.g. `(event)="handler()"`).
 */
var BoundEventAst = (function () {
    function BoundEventAst(name, target, handler, sourceSpan) {
        this.name = name;
        this.target = target;
        this.handler = handler;
        this.sourceSpan = sourceSpan;
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
/**
 * A variable declaration on an element (e.g. `#var="expression"`).
 */
var VariableAst = (function () {
    function VariableAst(name, value, sourceSpan) {
        this.name = name;
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
    VariableAst.prototype.visit = function (visitor, context) {
        return visitor.visitVariable(this, context);
    };
    return VariableAst;
})();
exports.VariableAst = VariableAst;
/**
 * An element declaration in a template.
 */
var ElementAst = (function () {
    function ElementAst(name, attrs, inputs, outputs, exportAsVars, directives, children, ngContentIndex, sourceSpan) {
        this.name = name;
        this.attrs = attrs;
        this.inputs = inputs;
        this.outputs = outputs;
        this.exportAsVars = exportAsVars;
        this.directives = directives;
        this.children = children;
        this.ngContentIndex = ngContentIndex;
        this.sourceSpan = sourceSpan;
    }
    ElementAst.prototype.visit = function (visitor, context) {
        return visitor.visitElement(this, context);
    };
    /**
     * Whether the element has any active bindings (inputs, outputs, vars, or directives).
     */
    ElementAst.prototype.isBound = function () {
        return (this.inputs.length > 0 || this.outputs.length > 0 || this.exportAsVars.length > 0 ||
            this.directives.length > 0);
    };
    /**
     * Get the component associated with this element, if any.
     */
    ElementAst.prototype.getComponent = function () {
        return this.directives.length > 0 && this.directives[0].directive.isComponent ?
            this.directives[0].directive :
            null;
    };
    return ElementAst;
})();
exports.ElementAst = ElementAst;
/**
 * A `<template>` element included in an Angular template.
 */
var EmbeddedTemplateAst = (function () {
    function EmbeddedTemplateAst(attrs, outputs, vars, directives, children, ngContentIndex, sourceSpan) {
        this.attrs = attrs;
        this.outputs = outputs;
        this.vars = vars;
        this.directives = directives;
        this.children = children;
        this.ngContentIndex = ngContentIndex;
        this.sourceSpan = sourceSpan;
    }
    EmbeddedTemplateAst.prototype.visit = function (visitor, context) {
        return visitor.visitEmbeddedTemplate(this, context);
    };
    return EmbeddedTemplateAst;
})();
exports.EmbeddedTemplateAst = EmbeddedTemplateAst;
/**
 * A directive property with a bound value (e.g. `*ngIf="condition").
 */
var BoundDirectivePropertyAst = (function () {
    function BoundDirectivePropertyAst(directiveName, templateName, value, sourceSpan) {
        this.directiveName = directiveName;
        this.templateName = templateName;
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
    BoundDirectivePropertyAst.prototype.visit = function (visitor, context) {
        return visitor.visitDirectiveProperty(this, context);
    };
    return BoundDirectivePropertyAst;
})();
exports.BoundDirectivePropertyAst = BoundDirectivePropertyAst;
/**
 * A directive declared on an element.
 */
var DirectiveAst = (function () {
    function DirectiveAst(directive, inputs, hostProperties, hostEvents, exportAsVars, sourceSpan) {
        this.directive = directive;
        this.inputs = inputs;
        this.hostProperties = hostProperties;
        this.hostEvents = hostEvents;
        this.exportAsVars = exportAsVars;
        this.sourceSpan = sourceSpan;
    }
    DirectiveAst.prototype.visit = function (visitor, context) {
        return visitor.visitDirective(this, context);
    };
    return DirectiveAst;
})();
exports.DirectiveAst = DirectiveAst;
/**
 * Position where content is to be projected (instance of `<ng-content>` in a template).
 */
var NgContentAst = (function () {
    function NgContentAst(index, ngContentIndex, sourceSpan) {
        this.index = index;
        this.ngContentIndex = ngContentIndex;
        this.sourceSpan = sourceSpan;
    }
    NgContentAst.prototype.visit = function (visitor, context) {
        return visitor.visitNgContent(this, context);
    };
    return NgContentAst;
})();
exports.NgContentAst = NgContentAst;
/**
 * Enumeration of types of property bindings.
 */
(function (PropertyBindingType) {
    /**
     * A normal binding to a property (e.g. `[property]="expression"`).
     */
    PropertyBindingType[PropertyBindingType["Property"] = 0] = "Property";
    /**
     * A binding to an element attribute (e.g. `[attr.name]="expression"`).
     */
    PropertyBindingType[PropertyBindingType["Attribute"] = 1] = "Attribute";
    /**
     * A binding to a CSS class (e.g. `[class.name]="condition"`).
     */
    PropertyBindingType[PropertyBindingType["Class"] = 2] = "Class";
    /**
     * A binding to a style rule (e.g. `[style.rule]="expression"`).
     */
    PropertyBindingType[PropertyBindingType["Style"] = 3] = "Style";
})(exports.PropertyBindingType || (exports.PropertyBindingType = {}));
var PropertyBindingType = exports.PropertyBindingType;
/**
 * Visit every node in a list of {@link TemplateAst}s with the given {@link TemplateAstVisitor}.
 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3RlbXBsYXRlX2FzdC50cyJdLCJuYW1lcyI6WyJUZXh0QXN0IiwiVGV4dEFzdC5jb25zdHJ1Y3RvciIsIlRleHRBc3QudmlzaXQiLCJCb3VuZFRleHRBc3QiLCJCb3VuZFRleHRBc3QuY29uc3RydWN0b3IiLCJCb3VuZFRleHRBc3QudmlzaXQiLCJBdHRyQXN0IiwiQXR0ckFzdC5jb25zdHJ1Y3RvciIsIkF0dHJBc3QudmlzaXQiLCJCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCIsIkJvdW5kRWxlbWVudFByb3BlcnR5QXN0LmNvbnN0cnVjdG9yIiwiQm91bmRFbGVtZW50UHJvcGVydHlBc3QudmlzaXQiLCJCb3VuZEV2ZW50QXN0IiwiQm91bmRFdmVudEFzdC5jb25zdHJ1Y3RvciIsIkJvdW5kRXZlbnRBc3QudmlzaXQiLCJCb3VuZEV2ZW50QXN0LmZ1bGxOYW1lIiwiVmFyaWFibGVBc3QiLCJWYXJpYWJsZUFzdC5jb25zdHJ1Y3RvciIsIlZhcmlhYmxlQXN0LnZpc2l0IiwiRWxlbWVudEFzdCIsIkVsZW1lbnRBc3QuY29uc3RydWN0b3IiLCJFbGVtZW50QXN0LnZpc2l0IiwiRWxlbWVudEFzdC5pc0JvdW5kIiwiRWxlbWVudEFzdC5nZXRDb21wb25lbnQiLCJFbWJlZGRlZFRlbXBsYXRlQXN0IiwiRW1iZWRkZWRUZW1wbGF0ZUFzdC5jb25zdHJ1Y3RvciIsIkVtYmVkZGVkVGVtcGxhdGVBc3QudmlzaXQiLCJCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0IiwiQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdC5jb25zdHJ1Y3RvciIsIkJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QudmlzaXQiLCJEaXJlY3RpdmVBc3QiLCJEaXJlY3RpdmVBc3QuY29uc3RydWN0b3IiLCJEaXJlY3RpdmVBc3QudmlzaXQiLCJOZ0NvbnRlbnRBc3QiLCJOZ0NvbnRlbnRBc3QuY29uc3RydWN0b3IiLCJOZ0NvbnRlbnRBc3QudmlzaXQiLCJQcm9wZXJ0eUJpbmRpbmdUeXBlIiwidGVtcGxhdGVWaXNpdEFsbCJdLCJtYXBwaW5ncyI6IkFBQ0EscUJBQXdCLDBCQUEwQixDQUFDLENBQUE7QUFtQm5EOztHQUVHO0FBQ0g7SUFDRUEsaUJBQW1CQSxLQUFhQSxFQUFTQSxjQUFzQkEsRUFDNUNBLFVBQTJCQTtRQUQzQkMsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBUUE7UUFBU0EsbUJBQWNBLEdBQWRBLGNBQWNBLENBQVFBO1FBQzVDQSxlQUFVQSxHQUFWQSxVQUFVQSxDQUFpQkE7SUFBR0EsQ0FBQ0E7SUFDbERELHVCQUFLQSxHQUFMQSxVQUFNQSxPQUEyQkEsRUFBRUEsT0FBWUEsSUFBU0UsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDcEdGLGNBQUNBO0FBQURBLENBQUNBLEFBSkQsSUFJQztBQUpZLGVBQU8sVUFJbkIsQ0FBQTtBQUVEOztHQUVHO0FBQ0g7SUFDRUcsc0JBQW1CQSxLQUFVQSxFQUFTQSxjQUFzQkEsRUFDekNBLFVBQTJCQTtRQUQzQkMsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBS0E7UUFBU0EsbUJBQWNBLEdBQWRBLGNBQWNBLENBQVFBO1FBQ3pDQSxlQUFVQSxHQUFWQSxVQUFVQSxDQUFpQkE7SUFBR0EsQ0FBQ0E7SUFDbERELDRCQUFLQSxHQUFMQSxVQUFNQSxPQUEyQkEsRUFBRUEsT0FBWUE7UUFDN0NFLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0lBQy9DQSxDQUFDQTtJQUNIRixtQkFBQ0E7QUFBREEsQ0FBQ0EsQUFORCxJQU1DO0FBTlksb0JBQVksZUFNeEIsQ0FBQTtBQUVEOztHQUVHO0FBQ0g7SUFDRUcsaUJBQW1CQSxJQUFZQSxFQUFTQSxLQUFhQSxFQUFTQSxVQUEyQkE7UUFBdEVD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QSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QVNUfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb24nO1xuaW1wb3J0IHtpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0NvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YX0gZnJvbSAnLi9kaXJlY3RpdmVfbWV0YWRhdGEnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4vcGFyc2VfdXRpbCc7XG5cbi8qKlxuICogQW4gQWJzdHJhY3QgU3ludGF4IFRyZWUgbm9kZSByZXByZXNlbnRpbmcgcGFydCBvZiBhIHBhcnNlZCBBbmd1bGFyIHRlbXBsYXRlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlQXN0IHtcbiAgLyoqXG4gICAqIFRoZSBzb3VyY2Ugc3BhbiBmcm9tIHdoaWNoIHRoaXMgbm9kZSB3YXMgcGFyc2VkLlxuICAgKi9cbiAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuO1xuXG4gIC8qKlxuICAgKiBWaXNpdCB0aGlzIG5vZGUgYW5kIHBvc3NpYmx5IHRyYW5zZm9ybSBpdC5cbiAgICovXG4gIHZpc2l0KHZpc2l0b3I6IFRlbXBsYXRlQXN0VmlzaXRvciwgY29udGV4dDogYW55KTogYW55O1xufVxuXG4vKipcbiAqIEEgc2VnbWVudCBvZiB0ZXh0IHdpdGhpbiB0aGUgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBUZXh0QXN0IGltcGxlbWVudHMgVGVtcGxhdGVBc3Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsdWU6IHN0cmluZywgcHVibGljIG5nQ29udGVudEluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFRlbXBsYXRlQXN0VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRUZXh0KHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbi8qKlxuICogQSBib3VuZCBleHByZXNzaW9uIHdpdGhpbiB0aGUgdGV4dCBvZiBhIHRlbXBsYXRlLlxuICovXG5leHBvcnQgY2xhc3MgQm91bmRUZXh0QXN0IGltcGxlbWVudHMgVGVtcGxhdGVBc3Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsdWU6IEFTVCwgcHVibGljIG5nQ29udGVudEluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFRlbXBsYXRlQXN0VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEJvdW5kVGV4dCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIEEgcGxhaW4gYXR0cmlidXRlIG9uIGFuIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBBdHRyQXN0IGltcGxlbWVudHMgVGVtcGxhdGVBc3Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdmFsdWU6IHN0cmluZywgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbiAgdmlzaXQodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdEF0dHIodGhpcywgY29udGV4dCk7IH1cbn1cblxuLyoqXG4gKiBBIGJpbmRpbmcgZm9yIGFuIGVsZW1lbnQgcHJvcGVydHkgKGUuZy4gYFtwcm9wZXJ0eV09XCJleHByZXNzaW9uXCJgKS5cbiAqL1xuZXhwb3J0IGNsYXNzIEJvdW5kRWxlbWVudFByb3BlcnR5QXN0IGltcGxlbWVudHMgVGVtcGxhdGVBc3Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdHlwZTogUHJvcGVydHlCaW5kaW5nVHlwZSwgcHVibGljIHZhbHVlOiBBU1QsXG4gICAgICAgICAgICAgIHB1YmxpYyB1bml0OiBzdHJpbmcsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFRlbXBsYXRlQXN0VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEVsZW1lbnRQcm9wZXJ0eSh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIEEgYmluZGluZyBmb3IgYW4gZWxlbWVudCBldmVudCAoZS5nLiBgKGV2ZW50KT1cImhhbmRsZXIoKVwiYCkuXG4gKi9cbmV4cG9ydCBjbGFzcyBCb3VuZEV2ZW50QXN0IGltcGxlbWVudHMgVGVtcGxhdGVBc3Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdGFyZ2V0OiBzdHJpbmcsIHB1YmxpYyBoYW5kbGVyOiBBU1QsXG4gICAgICAgICAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFRlbXBsYXRlQXN0VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEV2ZW50KHRoaXMsIGNvbnRleHQpO1xuICB9XG4gIGdldCBmdWxsTmFtZSgpIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMudGFyZ2V0KSkge1xuICAgICAgcmV0dXJuIGAke3RoaXMudGFyZ2V0fToke3RoaXMubmFtZX1gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5uYW1lO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEEgdmFyaWFibGUgZGVjbGFyYXRpb24gb24gYW4gZWxlbWVudCAoZS5nLiBgI3Zhcj1cImV4cHJlc3Npb25cImApLlxuICovXG5leHBvcnQgY2xhc3MgVmFyaWFibGVBc3QgaW1wbGVtZW50cyBUZW1wbGF0ZUFzdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB2YWx1ZTogc3RyaW5nLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxuICB2aXNpdCh2aXNpdG9yOiBUZW1wbGF0ZUFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRWYXJpYWJsZSh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGVsZW1lbnQgZGVjbGFyYXRpb24gaW4gYSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEVsZW1lbnRBc3QgaW1wbGVtZW50cyBUZW1wbGF0ZUFzdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBhdHRyczogQXR0ckFzdFtdLFxuICAgICAgICAgICAgICBwdWJsaWMgaW5wdXRzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdLCBwdWJsaWMgb3V0cHV0czogQm91bmRFdmVudEFzdFtdLFxuICAgICAgICAgICAgICBwdWJsaWMgZXhwb3J0QXNWYXJzOiBWYXJpYWJsZUFzdFtdLCBwdWJsaWMgZGlyZWN0aXZlczogRGlyZWN0aXZlQXN0W10sXG4gICAgICAgICAgICAgIHB1YmxpYyBjaGlsZHJlbjogVGVtcGxhdGVBc3RbXSwgcHVibGljIG5nQ29udGVudEluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFRlbXBsYXRlQXN0VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEVsZW1lbnQodGhpcywgY29udGV4dCk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgZWxlbWVudCBoYXMgYW55IGFjdGl2ZSBiaW5kaW5ncyAoaW5wdXRzLCBvdXRwdXRzLCB2YXJzLCBvciBkaXJlY3RpdmVzKS5cbiAgICovXG4gIGlzQm91bmQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICh0aGlzLmlucHV0cy5sZW5ndGggPiAwIHx8IHRoaXMub3V0cHV0cy5sZW5ndGggPiAwIHx8IHRoaXMuZXhwb3J0QXNWYXJzLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcy5sZW5ndGggPiAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGNvbXBvbmVudCBhc3NvY2lhdGVkIHdpdGggdGhpcyBlbGVtZW50LCBpZiBhbnkuXG4gICAqL1xuICBnZXRDb21wb25lbnQoKTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3RpdmVzLmxlbmd0aCA+IDAgJiYgdGhpcy5kaXJlY3RpdmVzWzBdLmRpcmVjdGl2ZS5pc0NvbXBvbmVudCA/XG4gICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXNbMF0uZGlyZWN0aXZlIDpcbiAgICAgICAgICAgICAgIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGA8dGVtcGxhdGU+YCBlbGVtZW50IGluY2x1ZGVkIGluIGFuIEFuZ3VsYXIgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBFbWJlZGRlZFRlbXBsYXRlQXN0IGltcGxlbWVudHMgVGVtcGxhdGVBc3Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgYXR0cnM6IEF0dHJBc3RbXSwgcHVibGljIG91dHB1dHM6IEJvdW5kRXZlbnRBc3RbXSwgcHVibGljIHZhcnM6IFZhcmlhYmxlQXN0W10sXG4gICAgICAgICAgICAgIHB1YmxpYyBkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSwgcHVibGljIGNoaWxkcmVuOiBUZW1wbGF0ZUFzdFtdLFxuICAgICAgICAgICAgICBwdWJsaWMgbmdDb250ZW50SW5kZXg6IG51bWJlciwgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbiAgdmlzaXQodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RW1iZWRkZWRUZW1wbGF0ZSh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHByb3BlcnR5IHdpdGggYSBib3VuZCB2YWx1ZSAoZS5nLiBgKm5nSWY9XCJjb25kaXRpb25cIikuXG4gKi9cbmV4cG9ydCBjbGFzcyBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0IGltcGxlbWVudHMgVGVtcGxhdGVBc3Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZGlyZWN0aXZlTmFtZTogc3RyaW5nLCBwdWJsaWMgdGVtcGxhdGVOYW1lOiBzdHJpbmcsIHB1YmxpYyB2YWx1ZTogQVNULFxuICAgICAgICAgICAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxuICB2aXNpdCh2aXNpdG9yOiBUZW1wbGF0ZUFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXREaXJlY3RpdmVQcm9wZXJ0eSh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIEEgZGlyZWN0aXZlIGRlY2xhcmVkIG9uIGFuIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBEaXJlY3RpdmVBc3QgaW1wbGVtZW50cyBUZW1wbGF0ZUFzdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBkaXJlY3RpdmU6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgcHVibGljIGlucHV0czogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdFtdLFxuICAgICAgICAgICAgICBwdWJsaWMgaG9zdFByb3BlcnRpZXM6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0W10sIHB1YmxpYyBob3N0RXZlbnRzOiBCb3VuZEV2ZW50QXN0W10sXG4gICAgICAgICAgICAgIHB1YmxpYyBleHBvcnRBc1ZhcnM6IFZhcmlhYmxlQXN0W10sIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFRlbXBsYXRlQXN0VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdERpcmVjdGl2ZSh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIFBvc2l0aW9uIHdoZXJlIGNvbnRlbnQgaXMgdG8gYmUgcHJvamVjdGVkIChpbnN0YW5jZSBvZiBgPG5nLWNvbnRlbnQ+YCBpbiBhIHRlbXBsYXRlKS5cbiAqL1xuZXhwb3J0IGNsYXNzIE5nQ29udGVudEFzdCBpbXBsZW1lbnRzIFRlbXBsYXRlQXN0IHtcbiAgY29uc3RydWN0b3IocHVibGljIGluZGV4OiBudW1iZXIsIHB1YmxpYyBuZ0NvbnRlbnRJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxuICB2aXNpdCh2aXNpdG9yOiBUZW1wbGF0ZUFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXROZ0NvbnRlbnQodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuLyoqXG4gKiBFbnVtZXJhdGlvbiBvZiB0eXBlcyBvZiBwcm9wZXJ0eSBiaW5kaW5ncy5cbiAqL1xuZXhwb3J0IGVudW0gUHJvcGVydHlCaW5kaW5nVHlwZSB7XG5cbiAgLyoqXG4gICAqIEEgbm9ybWFsIGJpbmRpbmcgdG8gYSBwcm9wZXJ0eSAoZS5nLiBgW3Byb3BlcnR5XT1cImV4cHJlc3Npb25cImApLlxuICAgKi9cbiAgUHJvcGVydHksXG5cbiAgLyoqXG4gICAqIEEgYmluZGluZyB0byBhbiBlbGVtZW50IGF0dHJpYnV0ZSAoZS5nLiBgW2F0dHIubmFtZV09XCJleHByZXNzaW9uXCJgKS5cbiAgICovXG4gIEF0dHJpYnV0ZSxcblxuICAvKipcbiAgICogQSBiaW5kaW5nIHRvIGEgQ1NTIGNsYXNzIChlLmcuIGBbY2xhc3MubmFtZV09XCJjb25kaXRpb25cImApLlxuICAgKi9cbiAgQ2xhc3MsXG5cbiAgLyoqXG4gICAqIEEgYmluZGluZyB0byBhIHN0eWxlIHJ1bGUgKGUuZy4gYFtzdHlsZS5ydWxlXT1cImV4cHJlc3Npb25cImApLlxuICAgKi9cbiAgU3R5bGVcbn1cblxuLyoqXG4gKiBBIHZpc2l0b3IgZm9yIHtAbGluayBUZW1wbGF0ZUFzdH0gdHJlZXMgdGhhdCB3aWxsIHByb2Nlc3MgZWFjaCBub2RlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlQXN0VmlzaXRvciB7XG4gIHZpc2l0TmdDb250ZW50KGFzdDogTmdDb250ZW50QXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RW1iZWRkZWRUZW1wbGF0ZShhc3Q6IEVtYmVkZGVkVGVtcGxhdGVBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRFbGVtZW50KGFzdDogRWxlbWVudEFzdCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFZhcmlhYmxlKGFzdDogVmFyaWFibGVBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRFdmVudChhc3Q6IEJvdW5kRXZlbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRFbGVtZW50UHJvcGVydHkoYXN0OiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEF0dHIoYXN0OiBBdHRyQXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0Qm91bmRUZXh0KGFzdDogQm91bmRUZXh0QXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0VGV4dChhc3Q6IFRleHRBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXREaXJlY3RpdmUoYXN0OiBEaXJlY3RpdmVBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXREaXJlY3RpdmVQcm9wZXJ0eShhc3Q6IEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbn1cblxuLyoqXG4gKiBWaXNpdCBldmVyeSBub2RlIGluIGEgbGlzdCBvZiB7QGxpbmsgVGVtcGxhdGVBc3R9cyB3aXRoIHRoZSBnaXZlbiB7QGxpbmsgVGVtcGxhdGVBc3RWaXNpdG9yfS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRlbXBsYXRlVmlzaXRBbGwodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBhc3RzOiBUZW1wbGF0ZUFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogYW55ID0gbnVsbCk6IGFueVtdIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBhc3RzLmZvckVhY2goYXN0ID0+IHtcbiAgICB2YXIgYXN0UmVzdWx0ID0gYXN0LnZpc2l0KHZpc2l0b3IsIGNvbnRleHQpO1xuICAgIGlmIChpc1ByZXNlbnQoYXN0UmVzdWx0KSkge1xuICAgICAgcmVzdWx0LnB1c2goYXN0UmVzdWx0KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuIl19