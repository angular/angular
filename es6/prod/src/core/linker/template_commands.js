var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CONST_EXPR, CONST } from 'angular2/src/facade/lang';
import { unimplemented } from 'angular2/src/facade/exceptions';
import { RenderBeginElementCmd } from 'angular2/src/core/render/api';
import { ViewEncapsulation } from 'angular2/src/core/metadata';
// Export ViewEncapsulation so that compiled templates only need to depend
// on template_commands.
export { ViewEncapsulation } from 'angular2/src/core/metadata';
/**
 * A compiled host template.
 *
 * This is const as we are storing it as annotation
 * for the compiled component type.
 */
export let CompiledHostTemplate = class {
    constructor(template) {
        this.template = template;
    }
};
CompiledHostTemplate = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [CompiledComponentTemplate])
], CompiledHostTemplate);
/**
 * A compiled template.
 */
export let CompiledComponentTemplate = class {
    constructor(id, changeDetectorFactory, commands, styles) {
        this.id = id;
        this.changeDetectorFactory = changeDetectorFactory;
        this.commands = commands;
        this.styles = styles;
    }
};
CompiledComponentTemplate = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String, Function, Array, Array])
], CompiledComponentTemplate);
const EMPTY_ARR = CONST_EXPR([]);
export let TextCmd = class {
    constructor(value, isBound, ngContentIndex) {
        this.value = value;
        this.isBound = isBound;
        this.ngContentIndex = ngContentIndex;
    }
    visit(visitor, context) {
        return visitor.visitText(this, context);
    }
};
TextCmd = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String, Boolean, Number])
], TextCmd);
export let NgContentCmd = class {
    constructor(index, ngContentIndex) {
        this.index = index;
        this.ngContentIndex = ngContentIndex;
        this.isBound = false;
    }
    visit(visitor, context) {
        return visitor.visitNgContent(this, context);
    }
};
NgContentCmd = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Number, Number])
], NgContentCmd);
export class IBeginElementCmd extends RenderBeginElementCmd {
    get variableNameAndValues() { return unimplemented(); }
    get eventTargetAndNames() { return unimplemented(); }
    get directives() { return unimplemented(); }
}
export let BeginElementCmd = class {
    constructor(name, attrNameAndValues, eventTargetAndNames, variableNameAndValues, directives, isBound, ngContentIndex) {
        this.name = name;
        this.attrNameAndValues = attrNameAndValues;
        this.eventTargetAndNames = eventTargetAndNames;
        this.variableNameAndValues = variableNameAndValues;
        this.directives = directives;
        this.isBound = isBound;
        this.ngContentIndex = ngContentIndex;
    }
    visit(visitor, context) {
        return visitor.visitBeginElement(this, context);
    }
};
BeginElementCmd = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String, Array, Array, Array, Array, Boolean, Number])
], BeginElementCmd);
export let EndElementCmd = class {
    visit(visitor, context) {
        return visitor.visitEndElement(context);
    }
};
EndElementCmd = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [])
], EndElementCmd);
export let BeginComponentCmd = class {
    constructor(name, attrNameAndValues, eventTargetAndNames, variableNameAndValues, directives, encapsulation, ngContentIndex, 
        // Note: the template needs to be stored as a function
        // so that we can resolve cycles
        templateGetter /*() => CompiledComponentTemplate*/) {
        this.name = name;
        this.attrNameAndValues = attrNameAndValues;
        this.eventTargetAndNames = eventTargetAndNames;
        this.variableNameAndValues = variableNameAndValues;
        this.directives = directives;
        this.encapsulation = encapsulation;
        this.ngContentIndex = ngContentIndex;
        this.templateGetter = templateGetter;
        this.isBound = true;
    }
    get templateId() { return this.templateGetter().id; }
    visit(visitor, context) {
        return visitor.visitBeginComponent(this, context);
    }
};
BeginComponentCmd = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String, Array, Array, Array, Array, Number, Number, Function])
], BeginComponentCmd);
export let EndComponentCmd = class {
    visit(visitor, context) {
        return visitor.visitEndComponent(context);
    }
};
EndComponentCmd = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [])
], EndComponentCmd);
export let EmbeddedTemplateCmd = class {
    constructor(attrNameAndValues, variableNameAndValues, directives, isMerged, ngContentIndex, changeDetectorFactory, children) {
        this.attrNameAndValues = attrNameAndValues;
        this.variableNameAndValues = variableNameAndValues;
        this.directives = directives;
        this.isMerged = isMerged;
        this.ngContentIndex = ngContentIndex;
        this.changeDetectorFactory = changeDetectorFactory;
        this.children = children;
        this.isBound = true;
        this.name = null;
        this.eventTargetAndNames = EMPTY_ARR;
    }
    visit(visitor, context) {
        return visitor.visitEmbeddedTemplate(this, context);
    }
};
EmbeddedTemplateCmd = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Array, Array, Array, Boolean, Number, Function, Array])
], EmbeddedTemplateCmd);
export function visitAllCommands(visitor, cmds, context = null) {
    for (var i = 0; i < cmds.length; i++) {
        cmds[i].visit(visitor, context);
    }
}
