import { isPresent } from 'angular2/src/facade/lang';
export class TextAst {
    constructor(value, ngContentIndex, sourceInfo) {
        this.value = value;
        this.ngContentIndex = ngContentIndex;
        this.sourceInfo = sourceInfo;
    }
    visit(visitor, context) { return visitor.visitText(this, context); }
}
export class BoundTextAst {
    constructor(value, ngContentIndex, sourceInfo) {
        this.value = value;
        this.ngContentIndex = ngContentIndex;
        this.sourceInfo = sourceInfo;
    }
    visit(visitor, context) {
        return visitor.visitBoundText(this, context);
    }
}
export class AttrAst {
    constructor(name, value, sourceInfo) {
        this.name = name;
        this.value = value;
        this.sourceInfo = sourceInfo;
    }
    visit(visitor, context) { return visitor.visitAttr(this, context); }
}
export class BoundElementPropertyAst {
    constructor(name, type, value, unit, sourceInfo) {
        this.name = name;
        this.type = type;
        this.value = value;
        this.unit = unit;
        this.sourceInfo = sourceInfo;
    }
    visit(visitor, context) {
        return visitor.visitElementProperty(this, context);
    }
}
export class BoundEventAst {
    constructor(name, target, handler, sourceInfo) {
        this.name = name;
        this.target = target;
        this.handler = handler;
        this.sourceInfo = sourceInfo;
    }
    visit(visitor, context) {
        return visitor.visitEvent(this, context);
    }
    get fullName() {
        if (isPresent(this.target)) {
            return `${this.target}:${this.name}`;
        }
        else {
            return this.name;
        }
    }
}
export class VariableAst {
    constructor(name, value, sourceInfo) {
        this.name = name;
        this.value = value;
        this.sourceInfo = sourceInfo;
    }
    visit(visitor, context) {
        return visitor.visitVariable(this, context);
    }
}
export class ElementAst {
    constructor(name, attrs, inputs, outputs, exportAsVars, directives, children, ngContentIndex, sourceInfo) {
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
    visit(visitor, context) {
        return visitor.visitElement(this, context);
    }
    isBound() {
        return (this.inputs.length > 0 || this.outputs.length > 0 || this.exportAsVars.length > 0 ||
            this.directives.length > 0);
    }
    getComponent() {
        return this.directives.length > 0 && this.directives[0].directive.isComponent ?
            this.directives[0].directive :
            null;
    }
}
export class EmbeddedTemplateAst {
    constructor(attrs, outputs, vars, directives, children, ngContentIndex, sourceInfo) {
        this.attrs = attrs;
        this.outputs = outputs;
        this.vars = vars;
        this.directives = directives;
        this.children = children;
        this.ngContentIndex = ngContentIndex;
        this.sourceInfo = sourceInfo;
    }
    visit(visitor, context) {
        return visitor.visitEmbeddedTemplate(this, context);
    }
}
export class BoundDirectivePropertyAst {
    constructor(directiveName, templateName, value, sourceInfo) {
        this.directiveName = directiveName;
        this.templateName = templateName;
        this.value = value;
        this.sourceInfo = sourceInfo;
    }
    visit(visitor, context) {
        return visitor.visitDirectiveProperty(this, context);
    }
}
export class DirectiveAst {
    constructor(directive, inputs, hostProperties, hostEvents, exportAsVars, sourceInfo) {
        this.directive = directive;
        this.inputs = inputs;
        this.hostProperties = hostProperties;
        this.hostEvents = hostEvents;
        this.exportAsVars = exportAsVars;
        this.sourceInfo = sourceInfo;
    }
    visit(visitor, context) {
        return visitor.visitDirective(this, context);
    }
}
export class NgContentAst {
    constructor(index, ngContentIndex, sourceInfo) {
        this.index = index;
        this.ngContentIndex = ngContentIndex;
        this.sourceInfo = sourceInfo;
    }
    visit(visitor, context) {
        return visitor.visitNgContent(this, context);
    }
}
export var PropertyBindingType;
(function (PropertyBindingType) {
    PropertyBindingType[PropertyBindingType["Property"] = 0] = "Property";
    PropertyBindingType[PropertyBindingType["Attribute"] = 1] = "Attribute";
    PropertyBindingType[PropertyBindingType["Class"] = 2] = "Class";
    PropertyBindingType[PropertyBindingType["Style"] = 3] = "Style";
})(PropertyBindingType || (PropertyBindingType = {}));
export function templateVisitAll(visitor, asts, context = null) {
    var result = [];
    asts.forEach(ast => {
        var astResult = ast.visit(visitor, context);
        if (isPresent(astResult)) {
            result.push(astResult);
        }
    });
    return result;
}
//# sourceMappingURL=template_ast.js.map