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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdGVtcGxhdGVfY29tbWFuZHMudHMiXSwibmFtZXMiOlsiQ29tcGlsZWRIb3N0VGVtcGxhdGUiLCJDb21waWxlZEhvc3RUZW1wbGF0ZS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVkQ29tcG9uZW50VGVtcGxhdGUiLCJDb21waWxlZENvbXBvbmVudFRlbXBsYXRlLmNvbnN0cnVjdG9yIiwiVGV4dENtZCIsIlRleHRDbWQuY29uc3RydWN0b3IiLCJUZXh0Q21kLnZpc2l0IiwiTmdDb250ZW50Q21kIiwiTmdDb250ZW50Q21kLmNvbnN0cnVjdG9yIiwiTmdDb250ZW50Q21kLnZpc2l0IiwiSUJlZ2luRWxlbWVudENtZCIsIklCZWdpbkVsZW1lbnRDbWQudmFyaWFibGVOYW1lQW5kVmFsdWVzIiwiSUJlZ2luRWxlbWVudENtZC5ldmVudFRhcmdldEFuZE5hbWVzIiwiSUJlZ2luRWxlbWVudENtZC5kaXJlY3RpdmVzIiwiQmVnaW5FbGVtZW50Q21kIiwiQmVnaW5FbGVtZW50Q21kLmNvbnN0cnVjdG9yIiwiQmVnaW5FbGVtZW50Q21kLnZpc2l0IiwiRW5kRWxlbWVudENtZCIsIkVuZEVsZW1lbnRDbWQudmlzaXQiLCJCZWdpbkNvbXBvbmVudENtZCIsIkJlZ2luQ29tcG9uZW50Q21kLmNvbnN0cnVjdG9yIiwiQmVnaW5Db21wb25lbnRDbWQudGVtcGxhdGVJZCIsIkJlZ2luQ29tcG9uZW50Q21kLnZpc2l0IiwiRW5kQ29tcG9uZW50Q21kIiwiRW5kQ29tcG9uZW50Q21kLnZpc2l0IiwiRW1iZWRkZWRUZW1wbGF0ZUNtZCIsIkVtYmVkZGVkVGVtcGxhdGVDbWQuY29uc3RydWN0b3IiLCJFbWJlZGRlZFRlbXBsYXRlQ21kLnZpc2l0IiwidmlzaXRBbGxDb21tYW5kcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBTyxVQUFVLEVBQUUs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QUFDQTtBQUNIRixDQUFDQTtBQVpEO0lBQUMsS0FBSyxFQUFFOzt3QkFZUDtBQWFELGlDQUFpQyxPQUF1QixFQUFFLElBQW1CLEVBQzVDLE9BQU8sR0FBUSxJQUFJO0lBQ2xERyxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtRQUNyQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsT0FBT0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDbENBLENBQUNBO0FBQ0hBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtUeXBlLCBDT05TVF9FWFBSLCBDT05TVCwgaXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHt1bmltcGxlbWVudGVkfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtcbiAgUmVuZGVyVGVtcGxhdGVDbWQsXG4gIFJlbmRlckNvbW1hbmRWaXNpdG9yLFxuICBSZW5kZXJCZWdpbkVsZW1lbnRDbWQsXG4gIFJlbmRlclRleHRDbWQsXG4gIFJlbmRlck5nQ29udGVudENtZCxcbiAgUmVuZGVyQmVnaW5Db21wb25lbnRDbWQsXG4gIFJlbmRlckVtYmVkZGVkVGVtcGxhdGVDbWRcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaSc7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YSc7XG4vLyBFeHBvcnQgVmlld0VuY2Fwc3VsYXRpb24gc28gdGhhdCBjb21waWxlZCB0ZW1wbGF0ZXMgb25seSBuZWVkIHRvIGRlcGVuZFxuLy8gb24gdGVtcGxhdGVfY29tbWFuZHMuXG5leHBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YSc7XG5cbi8qKlxuICogQSBjb21waWxlZCBob3N0IHRlbXBsYXRlLlxuICpcbiAqIFRoaXMgaXMgY29uc3QgYXMgd2UgYXJlIHN0b3JpbmcgaXQgYXMgYW5ub3RhdGlvblxuICogZm9yIHRoZSBjb21waWxlZCBjb21wb25lbnQgdHlwZS5cbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBDb21waWxlZEhvc3RUZW1wbGF0ZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0ZW1wbGF0ZTogQ29tcGlsZWRDb21wb25lbnRUZW1wbGF0ZSkge31cbn1cblxuLyoqXG4gKiBBIGNvbXBpbGVkIHRlbXBsYXRlLlxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIENvbXBpbGVkQ29tcG9uZW50VGVtcGxhdGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaWQ6IHN0cmluZywgcHVibGljIGNoYW5nZURldGVjdG9yRmFjdG9yeTogRnVuY3Rpb24sXG4gICAgICAgICAgICAgIHB1YmxpYyBjb21tYW5kczogVGVtcGxhdGVDbWRbXSwgcHVibGljIHN0eWxlczogc3RyaW5nW10pIHt9XG59XG5cbmNvbnN0IEVNUFRZX0FSUiA9IENPTlNUX0VYUFIoW10pO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlQ21kIGV4dGVuZHMgUmVuZGVyVGVtcGxhdGVDbWQge1xuICB2aXNpdCh2aXNpdG9yOiBSZW5kZXJDb21tYW5kVmlzaXRvciwgY29udGV4dDogYW55KTogYW55O1xufVxuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFRleHRDbWQgaW1wbGVtZW50cyBUZW1wbGF0ZUNtZCwgUmVuZGVyVGV4dENtZCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogc3RyaW5nLCBwdWJsaWMgaXNCb3VuZDogYm9vbGVhbiwgcHVibGljIG5nQ29udGVudEluZGV4OiBudW1iZXIpIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFJlbmRlckNvbW1hbmRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0VGV4dCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIE5nQ29udGVudENtZCBpbXBsZW1lbnRzIFRlbXBsYXRlQ21kLCBSZW5kZXJOZ0NvbnRlbnRDbWQge1xuICBpc0JvdW5kOiBib29sZWFuID0gZmFsc2U7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgbmdDb250ZW50SW5kZXg6IG51bWJlcikge31cbiAgdmlzaXQodmlzaXRvcjogUmVuZGVyQ29tbWFuZFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXROZ0NvbnRlbnQodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIElCZWdpbkVsZW1lbnRDbWQgZXh0ZW5kcyBSZW5kZXJCZWdpbkVsZW1lbnRDbWQgaW1wbGVtZW50cyBUZW1wbGF0ZUNtZCB7XG4gIGdldCB2YXJpYWJsZU5hbWVBbmRWYWx1ZXMoKTogQXJyYXk8c3RyaW5nIHwgbnVtYmVyPiB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbiAgZ2V0IGV2ZW50VGFyZ2V0QW5kTmFtZXMoKTogc3RyaW5nW10geyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG4gIGdldCBkaXJlY3RpdmVzKCk6IFR5cGVbXSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbiAgYWJzdHJhY3QgdmlzaXQodmlzaXRvcjogUmVuZGVyQ29tbWFuZFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueTtcbn1cblxuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBCZWdpbkVsZW1lbnRDbWQgaW1wbGVtZW50cyBUZW1wbGF0ZUNtZCwgSUJlZ2luRWxlbWVudENtZCwgUmVuZGVyQmVnaW5FbGVtZW50Q21kIHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIGF0dHJOYW1lQW5kVmFsdWVzOiBzdHJpbmdbXSxcbiAgICAgICAgICAgICAgcHVibGljIGV2ZW50VGFyZ2V0QW5kTmFtZXM6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICBwdWJsaWMgdmFyaWFibGVOYW1lQW5kVmFsdWVzOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+LCBwdWJsaWMgZGlyZWN0aXZlczogVHlwZVtdLFxuICAgICAgICAgICAgICBwdWJsaWMgaXNCb3VuZDogYm9vbGVhbiwgcHVibGljIG5nQ29udGVudEluZGV4OiBudW1iZXIpIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFJlbmRlckNvbW1hbmRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QmVnaW5FbGVtZW50KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBFbmRFbGVtZW50Q21kIGltcGxlbWVudHMgVGVtcGxhdGVDbWQge1xuICB2aXNpdCh2aXNpdG9yOiBSZW5kZXJDb21tYW5kVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEVuZEVsZW1lbnQoY29udGV4dCk7XG4gIH1cbn1cblxuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBCZWdpbkNvbXBvbmVudENtZCBpbXBsZW1lbnRzIFRlbXBsYXRlQ21kLCBJQmVnaW5FbGVtZW50Q21kLCBSZW5kZXJCZWdpbkNvbXBvbmVudENtZCB7XG4gIGlzQm91bmQ6IGJvb2xlYW4gPSB0cnVlO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgYXR0ck5hbWVBbmRWYWx1ZXM6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICBwdWJsaWMgZXZlbnRUYXJnZXRBbmROYW1lczogc3RyaW5nW10sXG4gICAgICAgICAgICAgIHB1YmxpYyB2YXJpYWJsZU5hbWVBbmRWYWx1ZXM6IEFycmF5PHN0cmluZyB8IG51bWJlcj4sIHB1YmxpYyBkaXJlY3RpdmVzOiBUeXBlW10sXG4gICAgICAgICAgICAgIHB1YmxpYyBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbiwgcHVibGljIG5nQ29udGVudEluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgIC8vIE5vdGU6IHRoZSB0ZW1wbGF0ZSBuZWVkcyB0byBiZSBzdG9yZWQgYXMgYSBmdW5jdGlvblxuICAgICAgICAgICAgICAvLyBzbyB0aGF0IHdlIGNhbiByZXNvbHZlIGN5Y2xlc1xuICAgICAgICAgICAgICBwdWJsaWMgdGVtcGxhdGVHZXR0ZXI6IEZ1bmN0aW9uIC8qKCkgPT4gQ29tcGlsZWRDb21wb25lbnRUZW1wbGF0ZSovKSB7fVxuXG4gIGdldCB0ZW1wbGF0ZUlkKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLnRlbXBsYXRlR2V0dGVyKCkuaWQ7IH1cblxuICB2aXNpdCh2aXNpdG9yOiBSZW5kZXJDb21tYW5kVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEJlZ2luQ29tcG9uZW50KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgRW5kQ29tcG9uZW50Q21kIGltcGxlbWVudHMgVGVtcGxhdGVDbWQge1xuICB2aXNpdCh2aXNpdG9yOiBSZW5kZXJDb21tYW5kVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEVuZENvbXBvbmVudChjb250ZXh0KTtcbiAgfVxufVxuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEVtYmVkZGVkVGVtcGxhdGVDbWQgaW1wbGVtZW50cyBUZW1wbGF0ZUNtZCwgSUJlZ2luRWxlbWVudENtZCxcbiAgICBSZW5kZXJFbWJlZGRlZFRlbXBsYXRlQ21kIHtcbiAgaXNCb3VuZDogYm9vbGVhbiA9IHRydWU7XG4gIG5hbWU6IHN0cmluZyA9IG51bGw7XG4gIGV2ZW50VGFyZ2V0QW5kTmFtZXM6IHN0cmluZ1tdID0gRU1QVFlfQVJSO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgYXR0ck5hbWVBbmRWYWx1ZXM6IHN0cmluZ1tdLCBwdWJsaWMgdmFyaWFibGVOYW1lQW5kVmFsdWVzOiBzdHJpbmdbXSxcbiAgICAgICAgICAgICAgcHVibGljIGRpcmVjdGl2ZXM6IFR5cGVbXSwgcHVibGljIGlzTWVyZ2VkOiBib29sZWFuLCBwdWJsaWMgbmdDb250ZW50SW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgcHVibGljIGNoYW5nZURldGVjdG9yRmFjdG9yeTogRnVuY3Rpb24sIHB1YmxpYyBjaGlsZHJlbjogVGVtcGxhdGVDbWRbXSkge31cbiAgdmlzaXQodmlzaXRvcjogUmVuZGVyQ29tbWFuZFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRFbWJlZGRlZFRlbXBsYXRlKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGludGVyZmFjZSBDb21tYW5kVmlzaXRvciBleHRlbmRzIFJlbmRlckNvbW1hbmRWaXNpdG9yIHtcbiAgdmlzaXRUZXh0KGNtZDogVGV4dENtZCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdE5nQ29udGVudChjbWQ6IE5nQ29udGVudENtZCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEJlZ2luRWxlbWVudChjbWQ6IEJlZ2luRWxlbWVudENtZCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEVuZEVsZW1lbnQoY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEJlZ2luQ29tcG9uZW50KGNtZDogQmVnaW5Db21wb25lbnRDbWQsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRFbmRDb21wb25lbnQoY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEVtYmVkZGVkVGVtcGxhdGUoY21kOiBFbWJlZGRlZFRlbXBsYXRlQ21kLCBjb250ZXh0OiBhbnkpOiBhbnk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2aXNpdEFsbENvbW1hbmRzKHZpc2l0b3I6IENvbW1hbmRWaXNpdG9yLCBjbWRzOiBUZW1wbGF0ZUNtZFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogYW55ID0gbnVsbCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNtZHMubGVuZ3RoOyBpKyspIHtcbiAgICBjbWRzW2ldLnZpc2l0KHZpc2l0b3IsIGNvbnRleHQpO1xuICB9XG59XG4iXX0=