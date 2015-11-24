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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdGVtcGxhdGVfY29tbWFuZHMudHMiXSwibmFtZXMiOlsiQ29tcGlsZWRIb3N0VGVtcGxhdGUiLCJDb21waWxlZEhvc3RUZW1wbGF0ZS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVkQ29tcG9uZW50VGVtcGxhdGUiLCJDb21waWxlZENvbXBvbmVudFRlbXBsYXRlLmNvbnN0cnVjdG9yIiwiVGV4dENtZCIsIlRleHRDbWQuY29uc3RydWN0b3IiLCJUZXh0Q21kLnZpc2l0IiwiTmdDb250ZW50Q21kIiwiTmdDb250ZW50Q21kLmNvbnN0cnVjdG9yIiwiTmdDb250ZW50Q21kLnZpc2l0IiwiSUJlZ2luRWxlbWVudENtZCIsIklCZWdpbkVsZW1lbnRDbWQudmFyaWFibGVOYW1lQW5kVmFsdWVzIiwiSUJlZ2luRWxlbWVudENtZC5ldmVudFRhcmdldEFuZE5hbWVzIiwiSUJlZ2luRWxlbWVudENtZC5kaXJlY3RpdmVzIiwiQmVnaW5FbGVtZW50Q21kIiwiQmVnaW5FbGVtZW50Q21kLmNvbnN0cnVjdG9yIiwiQmVnaW5FbGVtZW50Q21kLnZpc2l0IiwiRW5kRWxlbWVudENtZCIsIkVuZEVsZW1lbnRDbWQudmlzaXQiLCJCZWdpbkNvbXBvbmVudENtZCIsIkJlZ2luQ29tcG9uZW50Q21kLmNvbnN0cnVjdG9yIiwiQmVnaW5Db21wb25lbnRDbWQudGVtcGxhdGVJZCIsIkJlZ2luQ29tcG9uZW50Q21kLnZpc2l0IiwiRW5kQ29tcG9uZW50Q21kIiwiRW5kQ29tcG9uZW50Q21kLnZpc2l0IiwiRW1iZWRkZWRUZW1wbGF0ZUNtZCIsIkVtYmVkZGVkVGVtcGxhdGVDbWQuY29uc3RydWN0b3IiLCJFbWJlZGRlZFRlbXBsYXRlQ21kLnZpc2l0IiwidmlzaXRBbGxDb21tYW5kcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFPLFVBQVUsRUFB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LENBQUNBO0FBQ0hGLENBQUNBO0FBWkQ7SUFBQyxLQUFLLEVBQUU7O3dCQVlQO0FBYUQsaUNBQWlDLE9BQXVCLEVBQUUsSUFBbUIsRUFDNUMsT0FBTyxHQUFRLElBQUk7SUFDbERHLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO1FBQ3JDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxPQUFPQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUNsQ0EsQ0FBQ0E7QUFDSEEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1R5cGUsIENPTlNUX0VYUFIsIENPTlNULCBpc1ByZXNlbnQsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1xuICBSZW5kZXJUZW1wbGF0ZUNtZCxcbiAgUmVuZGVyQ29tbWFuZFZpc2l0b3IsXG4gIFJlbmRlckJlZ2luRWxlbWVudENtZCxcbiAgUmVuZGVyVGV4dENtZCxcbiAgUmVuZGVyTmdDb250ZW50Q21kLFxuICBSZW5kZXJCZWdpbkNvbXBvbmVudENtZCxcbiAgUmVuZGVyRW1iZWRkZWRUZW1wbGF0ZUNtZFxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhJztcbi8vIEV4cG9ydCBWaWV3RW5jYXBzdWxhdGlvbiBzbyB0aGF0IGNvbXBpbGVkIHRlbXBsYXRlcyBvbmx5IG5lZWQgdG8gZGVwZW5kXG4vLyBvbiB0ZW1wbGF0ZV9jb21tYW5kcy5cbmV4cG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhJztcblxuLyoqXG4gKiBBIGNvbXBpbGVkIGhvc3QgdGVtcGxhdGUuXG4gKlxuICogVGhpcyBpcyBjb25zdCBhcyB3ZSBhcmUgc3RvcmluZyBpdCBhcyBhbm5vdGF0aW9uXG4gKiBmb3IgdGhlIGNvbXBpbGVkIGNvbXBvbmVudCB0eXBlLlxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIENvbXBpbGVkSG9zdFRlbXBsYXRlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHRlbXBsYXRlOiBDb21waWxlZENvbXBvbmVudFRlbXBsYXRlKSB7fVxufVxuXG4vKipcbiAqIEEgY29tcGlsZWQgdGVtcGxhdGUuXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQ29tcGlsZWRDb21wb25lbnRUZW1wbGF0ZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpZDogc3RyaW5nLCBwdWJsaWMgY2hhbmdlRGV0ZWN0b3JGYWN0b3J5OiBGdW5jdGlvbixcbiAgICAgICAgICAgICAgcHVibGljIGNvbW1hbmRzOiBUZW1wbGF0ZUNtZFtdLCBwdWJsaWMgc3R5bGVzOiBzdHJpbmdbXSkge31cbn1cblxuY29uc3QgRU1QVFlfQVJSID0gQ09OU1RfRVhQUihbXSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVDbWQgZXh0ZW5kcyBSZW5kZXJUZW1wbGF0ZUNtZCB7XG4gIHZpc2l0KHZpc2l0b3I6IFJlbmRlckNvbW1hbmRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnk7XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgVGV4dENtZCBpbXBsZW1lbnRzIFRlbXBsYXRlQ21kLCBSZW5kZXJUZXh0Q21kIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBzdHJpbmcsIHB1YmxpYyBpc0JvdW5kOiBib29sZWFuLCBwdWJsaWMgbmdDb250ZW50SW5kZXg6IG51bWJlcikge31cbiAgdmlzaXQodmlzaXRvcjogUmVuZGVyQ29tbWFuZFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRUZXh0KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgTmdDb250ZW50Q21kIGltcGxlbWVudHMgVGVtcGxhdGVDbWQsIFJlbmRlck5nQ29udGVudENtZCB7XG4gIGlzQm91bmQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgY29uc3RydWN0b3IocHVibGljIGluZGV4OiBudW1iZXIsIHB1YmxpYyBuZ0NvbnRlbnRJbmRleDogbnVtYmVyKSB7fVxuICB2aXNpdCh2aXNpdG9yOiBSZW5kZXJDb21tYW5kVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdE5nQ29udGVudCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSUJlZ2luRWxlbWVudENtZCBleHRlbmRzIFJlbmRlckJlZ2luRWxlbWVudENtZCBpbXBsZW1lbnRzIFRlbXBsYXRlQ21kIHtcbiAgZ2V0IHZhcmlhYmxlTmFtZUFuZFZhbHVlcygpOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+IHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxuICBnZXQgZXZlbnRUYXJnZXRBbmROYW1lcygpOiBzdHJpbmdbXSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbiAgZ2V0IGRpcmVjdGl2ZXMoKTogVHlwZVtdIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxuICBhYnN0cmFjdCB2aXNpdCh2aXNpdG9yOiBSZW5kZXJDb21tYW5kVmlzaXRvciwgY29udGV4dDogYW55KTogYW55O1xufVxuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEJlZ2luRWxlbWVudENtZCBpbXBsZW1lbnRzIFRlbXBsYXRlQ21kLCBJQmVnaW5FbGVtZW50Q21kLCBSZW5kZXJCZWdpbkVsZW1lbnRDbWQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgYXR0ck5hbWVBbmRWYWx1ZXM6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICBwdWJsaWMgZXZlbnRUYXJnZXRBbmROYW1lczogc3RyaW5nW10sXG4gICAgICAgICAgICAgIHB1YmxpYyB2YXJpYWJsZU5hbWVBbmRWYWx1ZXM6IEFycmF5PHN0cmluZyB8IG51bWJlcj4sIHB1YmxpYyBkaXJlY3RpdmVzOiBUeXBlW10sXG4gICAgICAgICAgICAgIHB1YmxpYyBpc0JvdW5kOiBib29sZWFuLCBwdWJsaWMgbmdDb250ZW50SW5kZXg6IG51bWJlcikge31cbiAgdmlzaXQodmlzaXRvcjogUmVuZGVyQ29tbWFuZFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRCZWdpbkVsZW1lbnQodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEVuZEVsZW1lbnRDbWQgaW1wbGVtZW50cyBUZW1wbGF0ZUNtZCB7XG4gIHZpc2l0KHZpc2l0b3I6IFJlbmRlckNvbW1hbmRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RW5kRWxlbWVudChjb250ZXh0KTtcbiAgfVxufVxuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEJlZ2luQ29tcG9uZW50Q21kIGltcGxlbWVudHMgVGVtcGxhdGVDbWQsIElCZWdpbkVsZW1lbnRDbWQsIFJlbmRlckJlZ2luQ29tcG9uZW50Q21kIHtcbiAgaXNCb3VuZDogYm9vbGVhbiA9IHRydWU7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBhdHRyTmFtZUFuZFZhbHVlczogc3RyaW5nW10sXG4gICAgICAgICAgICAgIHB1YmxpYyBldmVudFRhcmdldEFuZE5hbWVzOiBzdHJpbmdbXSxcbiAgICAgICAgICAgICAgcHVibGljIHZhcmlhYmxlTmFtZUFuZFZhbHVlczogQXJyYXk8c3RyaW5nIHwgbnVtYmVyPiwgcHVibGljIGRpcmVjdGl2ZXM6IFR5cGVbXSxcbiAgICAgICAgICAgICAgcHVibGljIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLCBwdWJsaWMgbmdDb250ZW50SW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgLy8gTm90ZTogdGhlIHRlbXBsYXRlIG5lZWRzIHRvIGJlIHN0b3JlZCBhcyBhIGZ1bmN0aW9uXG4gICAgICAgICAgICAgIC8vIHNvIHRoYXQgd2UgY2FuIHJlc29sdmUgY3ljbGVzXG4gICAgICAgICAgICAgIHB1YmxpYyB0ZW1wbGF0ZUdldHRlcjogRnVuY3Rpb24gLyooKSA9PiBDb21waWxlZENvbXBvbmVudFRlbXBsYXRlKi8pIHt9XG5cbiAgZ2V0IHRlbXBsYXRlSWQoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMudGVtcGxhdGVHZXR0ZXIoKS5pZDsgfVxuXG4gIHZpc2l0KHZpc2l0b3I6IFJlbmRlckNvbW1hbmRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QmVnaW5Db21wb25lbnQodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBFbmRDb21wb25lbnRDbWQgaW1wbGVtZW50cyBUZW1wbGF0ZUNtZCB7XG4gIHZpc2l0KHZpc2l0b3I6IFJlbmRlckNvbW1hbmRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RW5kQ29tcG9uZW50KGNvbnRleHQpO1xuICB9XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgRW1iZWRkZWRUZW1wbGF0ZUNtZCBpbXBsZW1lbnRzIFRlbXBsYXRlQ21kLCBJQmVnaW5FbGVtZW50Q21kLFxuICAgIFJlbmRlckVtYmVkZGVkVGVtcGxhdGVDbWQge1xuICBpc0JvdW5kOiBib29sZWFuID0gdHJ1ZTtcbiAgbmFtZTogc3RyaW5nID0gbnVsbDtcbiAgZXZlbnRUYXJnZXRBbmROYW1lczogc3RyaW5nW10gPSBFTVBUWV9BUlI7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBhdHRyTmFtZUFuZFZhbHVlczogc3RyaW5nW10sIHB1YmxpYyB2YXJpYWJsZU5hbWVBbmRWYWx1ZXM6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICBwdWJsaWMgZGlyZWN0aXZlczogVHlwZVtdLCBwdWJsaWMgaXNNZXJnZWQ6IGJvb2xlYW4sIHB1YmxpYyBuZ0NvbnRlbnRJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgY2hhbmdlRGV0ZWN0b3JGYWN0b3J5OiBGdW5jdGlvbiwgcHVibGljIGNoaWxkcmVuOiBUZW1wbGF0ZUNtZFtdKSB7fVxuICB2aXNpdCh2aXNpdG9yOiBSZW5kZXJDb21tYW5kVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEVtYmVkZGVkVGVtcGxhdGUodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuXG5leHBvcnQgaW50ZXJmYWNlIENvbW1hbmRWaXNpdG9yIGV4dGVuZHMgUmVuZGVyQ29tbWFuZFZpc2l0b3Ige1xuICB2aXNpdFRleHQoY21kOiBUZXh0Q21kLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0TmdDb250ZW50KGNtZDogTmdDb250ZW50Q21kLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0QmVnaW5FbGVtZW50KGNtZDogQmVnaW5FbGVtZW50Q21kLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RW5kRWxlbWVudChjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0QmVnaW5Db21wb25lbnQoY21kOiBCZWdpbkNvbXBvbmVudENtZCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEVuZENvbXBvbmVudChjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RW1iZWRkZWRUZW1wbGF0ZShjbWQ6IEVtYmVkZGVkVGVtcGxhdGVDbWQsIGNvbnRleHQ6IGFueSk6IGFueTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0QWxsQ29tbWFuZHModmlzaXRvcjogQ29tbWFuZFZpc2l0b3IsIGNtZHM6IFRlbXBsYXRlQ21kW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBhbnkgPSBudWxsKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY21kcy5sZW5ndGg7IGkrKykge1xuICAgIGNtZHNbaV0udmlzaXQodmlzaXRvciwgY29udGV4dCk7XG4gIH1cbn1cbiJdfQ==