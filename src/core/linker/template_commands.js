'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var api_1 = require('angular2/src/core/render/api');
var metadata_1 = require('angular2/src/core/metadata');
// Export ViewEncapsulation so that compiled templates only need to depend
// on template_commands.
var metadata_2 = require('angular2/src/core/metadata');
exports.ViewEncapsulation = metadata_2.ViewEncapsulation;
/**
 * A compiled host template.
 *
 * This is const as we are storing it as annotation
 * for the compiled component type.
 */
var CompiledHostTemplate = (function () {
    function CompiledHostTemplate(template) {
        this.template = template;
    }
    CompiledHostTemplate = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [CompiledComponentTemplate])
    ], CompiledHostTemplate);
    return CompiledHostTemplate;
})();
exports.CompiledHostTemplate = CompiledHostTemplate;
/**
 * A compiled template.
 */
var CompiledComponentTemplate = (function () {
    function CompiledComponentTemplate(id, changeDetectorFactory, commands, styles) {
        this.id = id;
        this.changeDetectorFactory = changeDetectorFactory;
        this.commands = commands;
        this.styles = styles;
    }
    CompiledComponentTemplate = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String, Function, Array, Array])
    ], CompiledComponentTemplate);
    return CompiledComponentTemplate;
})();
exports.CompiledComponentTemplate = CompiledComponentTemplate;
var EMPTY_ARR = lang_1.CONST_EXPR([]);
var TextCmd = (function () {
    function TextCmd(value, isBound, ngContentIndex) {
        this.value = value;
        this.isBound = isBound;
        this.ngContentIndex = ngContentIndex;
    }
    TextCmd.prototype.visit = function (visitor, context) {
        return visitor.visitText(this, context);
    };
    TextCmd = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String, Boolean, Number])
    ], TextCmd);
    return TextCmd;
})();
exports.TextCmd = TextCmd;
var NgContentCmd = (function () {
    function NgContentCmd(index, ngContentIndex) {
        this.index = index;
        this.ngContentIndex = ngContentIndex;
        this.isBound = false;
    }
    NgContentCmd.prototype.visit = function (visitor, context) {
        return visitor.visitNgContent(this, context);
    };
    NgContentCmd = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Number, Number])
    ], NgContentCmd);
    return NgContentCmd;
})();
exports.NgContentCmd = NgContentCmd;
var IBeginElementCmd = (function (_super) {
    __extends(IBeginElementCmd, _super);
    function IBeginElementCmd() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(IBeginElementCmd.prototype, "variableNameAndValues", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IBeginElementCmd.prototype, "eventTargetAndNames", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IBeginElementCmd.prototype, "directives", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return IBeginElementCmd;
})(api_1.RenderBeginElementCmd);
exports.IBeginElementCmd = IBeginElementCmd;
var BeginElementCmd = (function () {
    function BeginElementCmd(name, attrNameAndValues, eventTargetAndNames, variableNameAndValues, directives, isBound, ngContentIndex) {
        this.name = name;
        this.attrNameAndValues = attrNameAndValues;
        this.eventTargetAndNames = eventTargetAndNames;
        this.variableNameAndValues = variableNameAndValues;
        this.directives = directives;
        this.isBound = isBound;
        this.ngContentIndex = ngContentIndex;
    }
    BeginElementCmd.prototype.visit = function (visitor, context) {
        return visitor.visitBeginElement(this, context);
    };
    BeginElementCmd = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String, Array, Array, Array, Array, Boolean, Number])
    ], BeginElementCmd);
    return BeginElementCmd;
})();
exports.BeginElementCmd = BeginElementCmd;
var EndElementCmd = (function () {
    function EndElementCmd() {
    }
    EndElementCmd.prototype.visit = function (visitor, context) {
        return visitor.visitEndElement(context);
    };
    EndElementCmd = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], EndElementCmd);
    return EndElementCmd;
})();
exports.EndElementCmd = EndElementCmd;
var BeginComponentCmd = (function () {
    function BeginComponentCmd(name, attrNameAndValues, eventTargetAndNames, variableNameAndValues, directives, encapsulation, ngContentIndex, 
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
    Object.defineProperty(BeginComponentCmd.prototype, "templateId", {
        get: function () { return this.templateGetter().id; },
        enumerable: true,
        configurable: true
    });
    BeginComponentCmd.prototype.visit = function (visitor, context) {
        return visitor.visitBeginComponent(this, context);
    };
    BeginComponentCmd = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String, Array, Array, Array, Array, Number, Number, Function])
    ], BeginComponentCmd);
    return BeginComponentCmd;
})();
exports.BeginComponentCmd = BeginComponentCmd;
var EndComponentCmd = (function () {
    function EndComponentCmd() {
    }
    EndComponentCmd.prototype.visit = function (visitor, context) {
        return visitor.visitEndComponent(context);
    };
    EndComponentCmd = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], EndComponentCmd);
    return EndComponentCmd;
})();
exports.EndComponentCmd = EndComponentCmd;
var EmbeddedTemplateCmd = (function () {
    function EmbeddedTemplateCmd(attrNameAndValues, variableNameAndValues, directives, isMerged, ngContentIndex, changeDetectorFactory, children) {
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
    EmbeddedTemplateCmd.prototype.visit = function (visitor, context) {
        return visitor.visitEmbeddedTemplate(this, context);
    };
    EmbeddedTemplateCmd = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Array, Array, Array, Boolean, Number, Function, Array])
    ], EmbeddedTemplateCmd);
    return EmbeddedTemplateCmd;
})();
exports.EmbeddedTemplateCmd = EmbeddedTemplateCmd;
function visitAllCommands(visitor, cmds, context) {
    if (context === void 0) { context = null; }
    for (var i = 0; i < cmds.length; i++) {
        cmds[i].visit(visitor, context);
    }
}
exports.visitAllCommands = visitAllCommands;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdGVtcGxhdGVfY29tbWFuZHMudHMiXSwibmFtZXMiOlsiQ29tcGlsZWRIb3N0VGVtcGxhdGUiLCJDb21waWxlZEhvc3RUZW1wbGF0ZS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVkQ29tcG9uZW50VGVtcGxhdGUiLCJDb21waWxlZENvbXBvbmVudFRlbXBsYXRlLmNvbnN0cnVjdG9yIiwiVGV4dENtZCIsIlRleHRDbWQuY29uc3RydWN0b3IiLCJUZXh0Q21kLnZpc2l0IiwiTmdDb250ZW50Q21kIiwiTmdDb250ZW50Q21kLmNvbnN0cnVjdG9yIiwiTmdDb250ZW50Q21kLnZpc2l0IiwiSUJlZ2luRWxlbWVudENtZCIsIklCZWdpbkVsZW1lbnRDbWQuY29uc3RydWN0b3IiLCJJQmVnaW5FbGVtZW50Q21kLnZhcmlhYmxlTmFtZUFuZFZhbHVlcyIsIklCZWdpbkVsZW1lbnRDbWQuZXZlbnRUYXJnZXRBbmROYW1lcyIsIklCZWdpbkVsZW1lbnRDbWQuZGlyZWN0aXZlcyIsIkJlZ2luRWxlbWVudENtZCIsIkJlZ2luRWxlbWVudENtZC5jb25zdHJ1Y3RvciIsIkJlZ2luRWxlbWVudENtZC52aXNpdCIsIkVuZEVsZW1lbnRDbWQiLCJFbmRFbGVtZW50Q21kLmNvbnN0cnVjdG9yIiwiRW5kRWxlbWVudENtZC52aXNpdCIsIkJlZ2luQ29tcG9uZW50Q21kIiwiQmVnaW5Db21wb25lbnRDbWQuY29uc3RydWN0b3IiLCJCZWdpbkNvbXBvbmVudENtZC50ZW1wbGF0ZUlkIiwiQmVnaW5Db21wb25lbnRDbWQudmlzaXQiLCJFbmRDb21wb25lbnRDbWQiLCJFbmRDb21wb25lbnRDbWQuY29uc3RydWN0b3IiLCJFbmRDb21wb25lbnRDbWQudmlzaXQiLCJFbWJlZGRlZFRlbXBsYXRlQ21kIiwiRW1iZWRkZWRUZW1wbGF0ZUNtZC5jb25zdHJ1Y3RvciIs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QW1CQTtJQUNsREEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7UUFDckNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0lBQ2xDQSxDQUFDQTtBQUNIQSxDQUFDQTtBQUxlLHdCQUFnQixtQkFLL0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7VHlwZSwgQ09OU1RfRVhQUiwgQ09OU1QsIGlzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7dW5pbXBsZW1lbnRlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7XG4gIFJlbmRlclRlbXBsYXRlQ21kLFxuICBSZW5kZXJDb21tYW5kVmlzaXRvcixcbiAgUmVuZGVyQmVnaW5FbGVtZW50Q21kLFxuICBSZW5kZXJUZXh0Q21kLFxuICBSZW5kZXJOZ0NvbnRlbnRDbWQsXG4gIFJlbmRlckJlZ2luQ29tcG9uZW50Q21kLFxuICBSZW5kZXJFbWJlZGRlZFRlbXBsYXRlQ21kXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGknO1xuaW1wb3J0IHtWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEnO1xuLy8gRXhwb3J0IFZpZXdFbmNhcHN1bGF0aW9uIHNvIHRoYXQgY29tcGlsZWQgdGVtcGxhdGVzIG9ubHkgbmVlZCB0byBkZXBlbmRcbi8vIG9uIHRlbXBsYXRlX2NvbW1hbmRzLlxuZXhwb3J0IHtWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEnO1xuXG4vKipcbiAqIEEgY29tcGlsZWQgaG9zdCB0ZW1wbGF0ZS5cbiAqXG4gKiBUaGlzIGlzIGNvbnN0IGFzIHdlIGFyZSBzdG9yaW5nIGl0IGFzIGFubm90YXRpb25cbiAqIGZvciB0aGUgY29tcGlsZWQgY29tcG9uZW50IHR5cGUuXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQ29tcGlsZWRIb3N0VGVtcGxhdGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdGVtcGxhdGU6IENvbXBpbGVkQ29tcG9uZW50VGVtcGxhdGUpIHt9XG59XG5cbi8qKlxuICogQSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBDb21waWxlZENvbXBvbmVudFRlbXBsYXRlIHtcbiAgY29uc3RydWN0b3IocHVibGljIGlkOiBzdHJpbmcsIHB1YmxpYyBjaGFuZ2VEZXRlY3RvckZhY3Rvcnk6IEZ1bmN0aW9uLFxuICAgICAgICAgICAgICBwdWJsaWMgY29tbWFuZHM6IFRlbXBsYXRlQ21kW10sIHB1YmxpYyBzdHlsZXM6IHN0cmluZ1tdKSB7fVxufVxuXG5jb25zdCBFTVBUWV9BUlIgPSBDT05TVF9FWFBSKFtdKTtcblxuZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZUNtZCBleHRlbmRzIFJlbmRlclRlbXBsYXRlQ21kIHtcbiAgdmlzaXQodmlzaXRvcjogUmVuZGVyQ29tbWFuZFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueTtcbn1cblxuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBUZXh0Q21kIGltcGxlbWVudHMgVGVtcGxhdGVDbWQsIFJlbmRlclRleHRDbWQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsdWU6IHN0cmluZywgcHVibGljIGlzQm91bmQ6IGJvb2xlYW4sIHB1YmxpYyBuZ0NvbnRlbnRJbmRleDogbnVtYmVyKSB7fVxuICB2aXNpdCh2aXNpdG9yOiBSZW5kZXJDb21tYW5kVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFRleHQodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBOZ0NvbnRlbnRDbWQgaW1wbGVtZW50cyBUZW1wbGF0ZUNtZCwgUmVuZGVyTmdDb250ZW50Q21kIHtcbiAgaXNCb3VuZDogYm9vbGVhbiA9IGZhbHNlO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5kZXg6IG51bWJlciwgcHVibGljIG5nQ29udGVudEluZGV4OiBudW1iZXIpIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFJlbmRlckNvbW1hbmRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0TmdDb250ZW50KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBJQmVnaW5FbGVtZW50Q21kIGV4dGVuZHMgUmVuZGVyQmVnaW5FbGVtZW50Q21kIGltcGxlbWVudHMgVGVtcGxhdGVDbWQge1xuICBnZXQgdmFyaWFibGVOYW1lQW5kVmFsdWVzKCk6IEFycmF5PHN0cmluZyB8IG51bWJlcj4geyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG4gIGdldCBldmVudFRhcmdldEFuZE5hbWVzKCk6IHN0cmluZ1tdIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxuICBnZXQgZGlyZWN0aXZlcygpOiBUeXBlW10geyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG4gIGFic3RyYWN0IHZpc2l0KHZpc2l0b3I6IFJlbmRlckNvbW1hbmRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnk7XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQmVnaW5FbGVtZW50Q21kIGltcGxlbWVudHMgVGVtcGxhdGVDbWQsIElCZWdpbkVsZW1lbnRDbWQsIFJlbmRlckJlZ2luRWxlbWVudENtZCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBhdHRyTmFtZUFuZFZhbHVlczogc3RyaW5nW10sXG4gICAgICAgICAgICAgIHB1YmxpYyBldmVudFRhcmdldEFuZE5hbWVzOiBzdHJpbmdbXSxcbiAgICAgICAgICAgICAgcHVibGljIHZhcmlhYmxlTmFtZUFuZFZhbHVlczogQXJyYXk8c3RyaW5nIHwgbnVtYmVyPiwgcHVibGljIGRpcmVjdGl2ZXM6IFR5cGVbXSxcbiAgICAgICAgICAgICAgcHVibGljIGlzQm91bmQ6IGJvb2xlYW4sIHB1YmxpYyBuZ0NvbnRlbnRJbmRleDogbnVtYmVyKSB7fVxuICB2aXNpdCh2aXNpdG9yOiBSZW5kZXJDb21tYW5kVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEJlZ2luRWxlbWVudCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgRW5kRWxlbWVudENtZCBpbXBsZW1lbnRzIFRlbXBsYXRlQ21kIHtcbiAgdmlzaXQodmlzaXRvcjogUmVuZGVyQ29tbWFuZFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRFbmRFbGVtZW50KGNvbnRleHQpO1xuICB9XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQmVnaW5Db21wb25lbnRDbWQgaW1wbGVtZW50cyBUZW1wbGF0ZUNtZCwgSUJlZ2luRWxlbWVudENtZCwgUmVuZGVyQmVnaW5Db21wb25lbnRDbWQge1xuICBpc0JvdW5kOiBib29sZWFuID0gdHJ1ZTtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIGF0dHJOYW1lQW5kVmFsdWVzOiBzdHJpbmdbXSxcbiAgICAgICAgICAgICAgcHVibGljIGV2ZW50VGFyZ2V0QW5kTmFtZXM6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICBwdWJsaWMgdmFyaWFibGVOYW1lQW5kVmFsdWVzOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+LCBwdWJsaWMgZGlyZWN0aXZlczogVHlwZVtdLFxuICAgICAgICAgICAgICBwdWJsaWMgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24sIHB1YmxpYyBuZ0NvbnRlbnRJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICAvLyBOb3RlOiB0aGUgdGVtcGxhdGUgbmVlZHMgdG8gYmUgc3RvcmVkIGFzIGEgZnVuY3Rpb25cbiAgICAgICAgICAgICAgLy8gc28gdGhhdCB3ZSBjYW4gcmVzb2x2ZSBjeWNsZXNcbiAgICAgICAgICAgICAgcHVibGljIHRlbXBsYXRlR2V0dGVyOiBGdW5jdGlvbiAvKigpID0+IENvbXBpbGVkQ29tcG9uZW50VGVtcGxhdGUqLykge31cblxuICBnZXQgdGVtcGxhdGVJZCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy50ZW1wbGF0ZUdldHRlcigpLmlkOyB9XG5cbiAgdmlzaXQodmlzaXRvcjogUmVuZGVyQ29tbWFuZFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRCZWdpbkNvbXBvbmVudCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEVuZENvbXBvbmVudENtZCBpbXBsZW1lbnRzIFRlbXBsYXRlQ21kIHtcbiAgdmlzaXQodmlzaXRvcjogUmVuZGVyQ29tbWFuZFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRFbmRDb21wb25lbnQoY29udGV4dCk7XG4gIH1cbn1cblxuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBFbWJlZGRlZFRlbXBsYXRlQ21kIGltcGxlbWVudHMgVGVtcGxhdGVDbWQsIElCZWdpbkVsZW1lbnRDbWQsXG4gICAgUmVuZGVyRW1iZWRkZWRUZW1wbGF0ZUNtZCB7XG4gIGlzQm91bmQ6IGJvb2xlYW4gPSB0cnVlO1xuICBuYW1lOiBzdHJpbmcgPSBudWxsO1xuICBldmVudFRhcmdldEFuZE5hbWVzOiBzdHJpbmdbXSA9IEVNUFRZX0FSUjtcbiAgY29uc3RydWN0b3IocHVibGljIGF0dHJOYW1lQW5kVmFsdWVzOiBzdHJpbmdbXSwgcHVibGljIHZhcmlhYmxlTmFtZUFuZFZhbHVlczogc3RyaW5nW10sXG4gICAgICAgICAgICAgIHB1YmxpYyBkaXJlY3RpdmVzOiBUeXBlW10sIHB1YmxpYyBpc01lcmdlZDogYm9vbGVhbiwgcHVibGljIG5nQ29udGVudEluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgIHB1YmxpYyBjaGFuZ2VEZXRlY3RvckZhY3Rvcnk6IEZ1bmN0aW9uLCBwdWJsaWMgY2hpbGRyZW46IFRlbXBsYXRlQ21kW10pIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFJlbmRlckNvbW1hbmRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RW1iZWRkZWRUZW1wbGF0ZSh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tbWFuZFZpc2l0b3IgZXh0ZW5kcyBSZW5kZXJDb21tYW5kVmlzaXRvciB7XG4gIHZpc2l0VGV4dChjbWQ6IFRleHRDbWQsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXROZ0NvbnRlbnQoY21kOiBOZ0NvbnRlbnRDbWQsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRCZWdpbkVsZW1lbnQoY21kOiBCZWdpbkVsZW1lbnRDbWQsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRFbmRFbGVtZW50KGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRCZWdpbkNvbXBvbmVudChjbWQ6IEJlZ2luQ29tcG9uZW50Q21kLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RW5kQ29tcG9uZW50KGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRFbWJlZGRlZFRlbXBsYXRlKGNtZDogRW1iZWRkZWRUZW1wbGF0ZUNtZCwgY29udGV4dDogYW55KTogYW55O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmlzaXRBbGxDb21tYW5kcyh2aXNpdG9yOiBDb21tYW5kVmlzaXRvciwgY21kczogVGVtcGxhdGVDbWRbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGFueSA9IG51bGwpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgY21kc1tpXS52aXNpdCh2aXNpdG9yLCBjb250ZXh0KTtcbiAgfVxufVxuIl19