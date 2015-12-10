'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdGVtcGxhdGVfY29tbWFuZHMudHMiXSwibmFtZXMiOlsiQ29tcGlsZWRIb3N0VGVtcGxhdGUiLCJDb21waWxlZEhvc3RUZW1wbGF0ZS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVkQ29tcG9uZW50VGVtcGxhdGUiLCJDb21waWxlZENvbXBvbmVudFRlbXBsYXRlLmNvbnN0cnVjdG9yIiwiVGV4dENtZCIsIlRleHRDbWQuY29uc3RydWN0b3IiLCJUZXh0Q21kLnZpc2l0IiwiTmdDb250ZW50Q21kIiwiTmdDb250ZW50Q21kLmNvbnN0cnVjdG9yIiwiTmdDb250ZW50Q21kLnZpc2l0IiwiSUJlZ2luRWxlbWVudENtZCIsIklCZWdpbkVsZW1lbnRDbWQuY29uc3RydWN0b3IiLCJJQmVnaW5FbGVtZW50Q21kLnZhcmlhYmxlTmFtZUFuZFZhbHVlcyIsIklCZWdpbkVsZW1lbnRDbWQuZXZlbnRUYXJnZXRBbmROYW1lcyIsIklCZWdpbkVsZW1lbnRDbWQuZGlyZWN0aXZlcyIsIkJlZ2luRWxlbWVudENtZCIsIkJlZ2luRWxlbWVudENtZC5jb25zdHJ1Y3RvciIsIkJlZ2luRWxlbWVudENtZC52aXNpdCIsIkVuZEVsZW1lbnRDbWQiLCJFbmRFbGVtZW50Q21kLmNvbnN0cnVjdG9yIiwiRW5kRWxlbWVudENtZC52aXNpdCIsIkJlZ2luQ29tcG9uZW50Q21kIiwiQmVnaW5Db21wb25lbnRDbWQuY29uc3RydWN0b3IiLCJCZWdpbkNvbXBvbmVudENtZC50ZW1wbGF0ZUlkIiwiQmVnaW5Db21wb25lbnRDbWQudmlzaXQiLCJFbmRDb21wb25lbnRDbWQiLCJFbmRDb21wb25lbnRDbWQuY29uc3RydWN0b3IiLCJFbmRDb21wb25lbnRDbWQudmlzaXQiLCJFbWJlZGRlZFRlbXBsYXRlQ21kIiwiRW1iZWRkZWRUZW1wbGF0ZUNtZC5jb25zdHJ1Y3RvciIs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QkE7SUFDbERBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO1FBQ3JDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxPQUFPQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUNsQ0EsQ0FBQ0E7QUFDSEEsQ0FBQ0E7QUFMZSx3QkFBZ0IsbUJBSy9CLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1R5cGUsIENPTlNUX0VYUFIsIENPTlNULCBpc1ByZXNlbnQsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1xuICBSZW5kZXJUZW1wbGF0ZUNtZCxcbiAgUmVuZGVyQ29tbWFuZFZpc2l0b3IsXG4gIFJlbmRlckJlZ2luRWxlbWVudENtZCxcbiAgUmVuZGVyVGV4dENtZCxcbiAgUmVuZGVyTmdDb250ZW50Q21kLFxuICBSZW5kZXJCZWdpbkNvbXBvbmVudENtZCxcbiAgUmVuZGVyRW1iZWRkZWRUZW1wbGF0ZUNtZFxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhJztcbi8vIEV4cG9ydCBWaWV3RW5jYXBzdWxhdGlvbiBzbyB0aGF0IGNvbXBpbGVkIHRlbXBsYXRlcyBvbmx5IG5lZWQgdG8gZGVwZW5kXG4vLyBvbiB0ZW1wbGF0ZV9jb21tYW5kcy5cbmV4cG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhJztcblxuLyoqXG4gKiBBIGNvbXBpbGVkIGhvc3QgdGVtcGxhdGUuXG4gKlxuICogVGhpcyBpcyBjb25zdCBhcyB3ZSBhcmUgc3RvcmluZyBpdCBhcyBhbm5vdGF0aW9uXG4gKiBmb3IgdGhlIGNvbXBpbGVkIGNvbXBvbmVudCB0eXBlLlxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIENvbXBpbGVkSG9zdFRlbXBsYXRlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHRlbXBsYXRlOiBDb21waWxlZENvbXBvbmVudFRlbXBsYXRlKSB7fVxufVxuXG4vKipcbiAqIEEgY29tcGlsZWQgdGVtcGxhdGUuXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQ29tcGlsZWRDb21wb25lbnRUZW1wbGF0ZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpZDogc3RyaW5nLCBwdWJsaWMgY2hhbmdlRGV0ZWN0b3JGYWN0b3J5OiBGdW5jdGlvbixcbiAgICAgICAgICAgICAgcHVibGljIGNvbW1hbmRzOiBUZW1wbGF0ZUNtZFtdLCBwdWJsaWMgc3R5bGVzOiBzdHJpbmdbXSkge31cbn1cblxuY29uc3QgRU1QVFlfQVJSID0gQ09OU1RfRVhQUihbXSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVDbWQgZXh0ZW5kcyBSZW5kZXJUZW1wbGF0ZUNtZCB7XG4gIHZpc2l0KHZpc2l0b3I6IFJlbmRlckNvbW1hbmRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnk7XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgVGV4dENtZCBpbXBsZW1lbnRzIFRlbXBsYXRlQ21kLCBSZW5kZXJUZXh0Q21kIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBzdHJpbmcsIHB1YmxpYyBpc0JvdW5kOiBib29sZWFuLCBwdWJsaWMgbmdDb250ZW50SW5kZXg6IG51bWJlcikge31cbiAgdmlzaXQodmlzaXRvcjogUmVuZGVyQ29tbWFuZFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRUZXh0KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgTmdDb250ZW50Q21kIGltcGxlbWVudHMgVGVtcGxhdGVDbWQsIFJlbmRlck5nQ29udGVudENtZCB7XG4gIGlzQm91bmQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgY29uc3RydWN0b3IocHVibGljIGluZGV4OiBudW1iZXIsIHB1YmxpYyBuZ0NvbnRlbnRJbmRleDogbnVtYmVyKSB7fVxuICB2aXNpdCh2aXNpdG9yOiBSZW5kZXJDb21tYW5kVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdE5nQ29udGVudCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSUJlZ2luRWxlbWVudENtZCBleHRlbmRzIFJlbmRlckJlZ2luRWxlbWVudENtZCBpbXBsZW1lbnRzIFRlbXBsYXRlQ21kIHtcbiAgZ2V0IHZhcmlhYmxlTmFtZUFuZFZhbHVlcygpOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+IHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxuICBnZXQgZXZlbnRUYXJnZXRBbmROYW1lcygpOiBzdHJpbmdbXSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbiAgZ2V0IGRpcmVjdGl2ZXMoKTogVHlwZVtdIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxuICBhYnN0cmFjdCB2aXNpdCh2aXNpdG9yOiBSZW5kZXJDb21tYW5kVmlzaXRvciwgY29udGV4dDogYW55KTogYW55O1xufVxuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEJlZ2luRWxlbWVudENtZCBpbXBsZW1lbnRzIFRlbXBsYXRlQ21kLCBJQmVnaW5FbGVtZW50Q21kLCBSZW5kZXJCZWdpbkVsZW1lbnRDbWQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgYXR0ck5hbWVBbmRWYWx1ZXM6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICBwdWJsaWMgZXZlbnRUYXJnZXRBbmROYW1lczogc3RyaW5nW10sXG4gICAgICAgICAgICAgIHB1YmxpYyB2YXJpYWJsZU5hbWVBbmRWYWx1ZXM6IEFycmF5PHN0cmluZyB8IG51bWJlcj4sIHB1YmxpYyBkaXJlY3RpdmVzOiBUeXBlW10sXG4gICAgICAgICAgICAgIHB1YmxpYyBpc0JvdW5kOiBib29sZWFuLCBwdWJsaWMgbmdDb250ZW50SW5kZXg6IG51bWJlcikge31cbiAgdmlzaXQodmlzaXRvcjogUmVuZGVyQ29tbWFuZFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRCZWdpbkVsZW1lbnQodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEVuZEVsZW1lbnRDbWQgaW1wbGVtZW50cyBUZW1wbGF0ZUNtZCB7XG4gIHZpc2l0KHZpc2l0b3I6IFJlbmRlckNvbW1hbmRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RW5kRWxlbWVudChjb250ZXh0KTtcbiAgfVxufVxuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEJlZ2luQ29tcG9uZW50Q21kIGltcGxlbWVudHMgVGVtcGxhdGVDbWQsIElCZWdpbkVsZW1lbnRDbWQsIFJlbmRlckJlZ2luQ29tcG9uZW50Q21kIHtcbiAgaXNCb3VuZDogYm9vbGVhbiA9IHRydWU7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBhdHRyTmFtZUFuZFZhbHVlczogc3RyaW5nW10sXG4gICAgICAgICAgICAgIHB1YmxpYyBldmVudFRhcmdldEFuZE5hbWVzOiBzdHJpbmdbXSxcbiAgICAgICAgICAgICAgcHVibGljIHZhcmlhYmxlTmFtZUFuZFZhbHVlczogQXJyYXk8c3RyaW5nIHwgbnVtYmVyPiwgcHVibGljIGRpcmVjdGl2ZXM6IFR5cGVbXSxcbiAgICAgICAgICAgICAgcHVibGljIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLCBwdWJsaWMgbmdDb250ZW50SW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgLy8gTm90ZTogdGhlIHRlbXBsYXRlIG5lZWRzIHRvIGJlIHN0b3JlZCBhcyBhIGZ1bmN0aW9uXG4gICAgICAgICAgICAgIC8vIHNvIHRoYXQgd2UgY2FuIHJlc29sdmUgY3ljbGVzXG4gICAgICAgICAgICAgIHB1YmxpYyB0ZW1wbGF0ZUdldHRlcjogRnVuY3Rpb24gLyooKSA9PiBDb21waWxlZENvbXBvbmVudFRlbXBsYXRlKi8pIHt9XG5cbiAgZ2V0IHRlbXBsYXRlSWQoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMudGVtcGxhdGVHZXR0ZXIoKS5pZDsgfVxuXG4gIHZpc2l0KHZpc2l0b3I6IFJlbmRlckNvbW1hbmRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QmVnaW5Db21wb25lbnQodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBFbmRDb21wb25lbnRDbWQgaW1wbGVtZW50cyBUZW1wbGF0ZUNtZCB7XG4gIHZpc2l0KHZpc2l0b3I6IFJlbmRlckNvbW1hbmRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RW5kQ29tcG9uZW50KGNvbnRleHQpO1xuICB9XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgRW1iZWRkZWRUZW1wbGF0ZUNtZCBpbXBsZW1lbnRzIFRlbXBsYXRlQ21kLCBJQmVnaW5FbGVtZW50Q21kLFxuICAgIFJlbmRlckVtYmVkZGVkVGVtcGxhdGVDbWQge1xuICBpc0JvdW5kOiBib29sZWFuID0gdHJ1ZTtcbiAgbmFtZTogc3RyaW5nID0gbnVsbDtcbiAgZXZlbnRUYXJnZXRBbmROYW1lczogc3RyaW5nW10gPSBFTVBUWV9BUlI7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBhdHRyTmFtZUFuZFZhbHVlczogc3RyaW5nW10sIHB1YmxpYyB2YXJpYWJsZU5hbWVBbmRWYWx1ZXM6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICBwdWJsaWMgZGlyZWN0aXZlczogVHlwZVtdLCBwdWJsaWMgaXNNZXJnZWQ6IGJvb2xlYW4sIHB1YmxpYyBuZ0NvbnRlbnRJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgY2hhbmdlRGV0ZWN0b3JGYWN0b3J5OiBGdW5jdGlvbiwgcHVibGljIGNoaWxkcmVuOiBUZW1wbGF0ZUNtZFtdKSB7fVxuICB2aXNpdCh2aXNpdG9yOiBSZW5kZXJDb21tYW5kVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEVtYmVkZGVkVGVtcGxhdGUodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuXG5leHBvcnQgaW50ZXJmYWNlIENvbW1hbmRWaXNpdG9yIGV4dGVuZHMgUmVuZGVyQ29tbWFuZFZpc2l0b3Ige1xuICB2aXNpdFRleHQoY21kOiBUZXh0Q21kLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0TmdDb250ZW50KGNtZDogTmdDb250ZW50Q21kLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0QmVnaW5FbGVtZW50KGNtZDogQmVnaW5FbGVtZW50Q21kLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RW5kRWxlbWVudChjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0QmVnaW5Db21wb25lbnQoY21kOiBCZWdpbkNvbXBvbmVudENtZCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEVuZENvbXBvbmVudChjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RW1iZWRkZWRUZW1wbGF0ZShjbWQ6IEVtYmVkZGVkVGVtcGxhdGVDbWQsIGNvbnRleHQ6IGFueSk6IGFueTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0QWxsQ29tbWFuZHModmlzaXRvcjogQ29tbWFuZFZpc2l0b3IsIGNtZHM6IFRlbXBsYXRlQ21kW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBhbnkgPSBudWxsKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY21kcy5sZW5ndGg7IGkrKykge1xuICAgIGNtZHNbaV0udmlzaXQodmlzaXRvciwgY29udGV4dCk7XG4gIH1cbn1cbiJdfQ==