'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var cpl = require('./directive_metadata');
var md = require('angular2/src/core/metadata/directives');
var directive_resolver_1 = require('angular2/src/core/linker/directive_resolver');
var view_resolver_1 = require('angular2/src/core/linker/view_resolver');
var directive_lifecycle_reflector_1 = require('angular2/src/core/linker/directive_lifecycle_reflector');
var interfaces_1 = require('angular2/src/core/linker/interfaces');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var di_2 = require('angular2/src/core/di');
var platform_directives_and_pipes_1 = require('angular2/src/core/platform_directives_and_pipes');
var util_1 = require('./util');
var url_resolver_1 = require('angular2/src/compiler/url_resolver');
var RuntimeMetadataResolver = (function () {
    function RuntimeMetadataResolver(_directiveResolver, _viewResolver, _platformDirectives) {
        this._directiveResolver = _directiveResolver;
        this._viewResolver = _viewResolver;
        this._platformDirectives = _platformDirectives;
        this._cache = new Map();
    }
    RuntimeMetadataResolver.prototype.getMetadata = function (directiveType) {
        var meta = this._cache.get(directiveType);
        if (lang_1.isBlank(meta)) {
            var dirMeta = this._directiveResolver.resolve(directiveType);
            var moduleUrl = calcModuleUrl(directiveType, dirMeta);
            var templateMeta = null;
            var changeDetectionStrategy = null;
            if (dirMeta instanceof md.ComponentMetadata) {
                var cmpMeta = dirMeta;
                var viewMeta = this._viewResolver.resolve(directiveType);
                templateMeta = new cpl.CompileTemplateMetadata({
                    encapsulation: viewMeta.encapsulation,
                    template: viewMeta.template,
                    templateUrl: viewMeta.templateUrl,
                    styles: viewMeta.styles,
                    styleUrls: viewMeta.styleUrls
                });
                changeDetectionStrategy = cmpMeta.changeDetection;
            }
            meta = cpl.CompileDirectiveMetadata.create({
                selector: dirMeta.selector,
                exportAs: dirMeta.exportAs,
                isComponent: lang_1.isPresent(templateMeta),
                dynamicLoadable: true,
                type: new cpl.CompileTypeMetadata({ name: lang_1.stringify(directiveType), moduleUrl: moduleUrl, runtime: directiveType }),
                template: templateMeta,
                changeDetection: changeDetectionStrategy,
                inputs: dirMeta.inputs,
                outputs: dirMeta.outputs,
                host: dirMeta.host,
                lifecycleHooks: interfaces_1.LIFECYCLE_HOOKS_VALUES.filter(function (hook) { return directive_lifecycle_reflector_1.hasLifecycleHook(hook, directiveType); })
            });
            this._cache.set(directiveType, meta);
        }
        return meta;
    };
    RuntimeMetadataResolver.prototype.getViewDirectivesMetadata = function (component) {
        var _this = this;
        var view = this._viewResolver.resolve(component);
        var directives = flattenDirectives(view, this._platformDirectives);
        for (var i = 0; i < directives.length; i++) {
            if (!isValidDirective(directives[i])) {
                throw new exceptions_1.BaseException("Unexpected directive value '" + lang_1.stringify(directives[i]) + "' on the View of component '" + lang_1.stringify(component) + "'");
            }
        }
        return directives.map(function (type) { return _this.getMetadata(type); });
    };
    RuntimeMetadataResolver = __decorate([
        di_2.Injectable(),
        __param(2, di_2.Optional()),
        __param(2, di_2.Inject(platform_directives_and_pipes_1.PLATFORM_DIRECTIVES)), 
        __metadata('design:paramtypes', [directive_resolver_1.DirectiveResolver, view_resolver_1.ViewResolver, Array])
    ], RuntimeMetadataResolver);
    return RuntimeMetadataResolver;
})();
exports.RuntimeMetadataResolver = RuntimeMetadataResolver;
function flattenDirectives(view, platformDirectives) {
    var directives = [];
    if (lang_1.isPresent(platformDirectives)) {
        flattenArray(platformDirectives, directives);
    }
    if (lang_1.isPresent(view.directives)) {
        flattenArray(view.directives, directives);
    }
    return directives;
}
function flattenArray(tree, out) {
    for (var i = 0; i < tree.length; i++) {
        var item = di_1.resolveForwardRef(tree[i]);
        if (lang_1.isArray(item)) {
            flattenArray(item, out);
        }
        else {
            out.push(item);
        }
    }
}
function isValidDirective(value) {
    return lang_1.isPresent(value) && (value instanceof lang_1.Type);
}
function calcModuleUrl(type, dirMeta) {
    var moduleId = dirMeta.moduleId;
    if (lang_1.isPresent(moduleId)) {
        var scheme = url_resolver_1.getUrlScheme(moduleId);
        return lang_1.isPresent(scheme) && scheme.length > 0 ? moduleId :
            "package:" + moduleId + util_1.MODULE_SUFFIX;
    }
    else {
        return reflection_1.reflector.importUri(type);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZV9tZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9ydW50aW1lX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbIlJ1bnRpbWVNZXRhZGF0YVJlc29sdmVyIiwiUnVudGltZU1ldGFkYXRhUmVzb2x2ZXIuY29uc3RydWN0b3IiLCJSdW50aW1lTWV0YWRhdGFSZXNvbHZlci5nZXRNZXRhZGF0YSIsIlJ1bnRpbWVNZXRhZGF0YVJlc29sdmVyLmdldFZpZXdEaXJlY3RpdmVzTWV0YWRhdGEiLCJmbGF0dGVuRGlyZWN0aXZlcyIsImZsYXR0ZW5BcnJheSIsImlzVmFsaWREaXJlY3RpdmUiLCJjYWxjTW9kdWxlVXJsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQkFBZ0Msc0JBQXNCLENBQUMsQ0FBQTtBQUN2RCxxQkFPTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELElBQVksR0FBRyxXQUFNLHNCQUFzQixDQUFDLENBQUE7QUFDNUMsSUFBWSxFQUFFLFdBQU0sdUNBQXVDLENBQUMsQ0FBQTtBQUM1RCxtQ0FBZ0MsNkNBQTZDLENBQUMsQ0FBQTtBQUM5RSw4QkFBMkIsd0NBQXdDLENBQUMsQ0FBQTtBQUVwRSw4Q0FBK0Isd0RBQXdELENBQUMsQ0FBQTtBQUN4RiwyQkFBcUQscUNBQXFDLENBQUMsQ0FBQTtBQUMzRiwyQkFBd0IseUNBQXlDLENBQUMsQ0FBQTtBQUNsRSxtQkFBMkMsc0JBQXNCLENBQUMsQ0FBQTtBQUNsRSw4Q0FBa0MsaURBQWlELENBQUMsQ0FBQTtBQUNwRixxQkFBNEIsUUFBUSxDQUFDLENBQUE7QUFDckMsNkJBQTJCLG9DQUFvQyxDQUFDLENBQUE7QUFFaEU7SUFJRUEsaUNBQW9CQSxrQkFBcUNBLEVBQVVBLGFBQTJCQSxFQUNqQ0EsbUJBQTJCQTtRQURwRUMsdUJBQWtCQSxHQUFsQkEsa0JBQWtCQSxDQUFtQkE7UUFB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MEJBQTBCLEtBQVc7SUFDbkNDLE1BQU1BLENBQUNBLGdCQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxZQUFZQSxXQUFJQSxDQUFDQSxDQUFDQTtBQUNyREEsQ0FBQ0E7QUFFRCx1QkFBdUIsSUFBVSxFQUFFLE9BQTZCO0lBQzlEQyxJQUFJQSxRQUFRQSxHQUFHQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFDQTtJQUNoQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3hCQSxJQUFJQSxNQUFNQSxHQUFHQSwyQkFBWUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDcENBLE1BQU1BLENBQUNBLGdCQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxNQUFNQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxRQUFRQTtZQUNSQSxhQUFXQSxRQUFRQSxHQUFHQSxvQkFBZUEsQ0FBQ0E7SUFDeEZBLENBQUNBO0lBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ05BLE1BQU1BLENBQUNBLHNCQUFTQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUNuQ0EsQ0FBQ0E7QUFDSEEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1xuICBUeXBlLFxuICBpc0JsYW5rLFxuICBpc1ByZXNlbnQsXG4gIGlzQXJyYXksXG4gIHN0cmluZ2lmeSxcbiAgUmVnRXhwV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0ICogYXMgY3BsIGZyb20gJy4vZGlyZWN0aXZlX21ldGFkYXRhJztcbmltcG9ydCAqIGFzIG1kIGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL2RpcmVjdGl2ZXMnO1xuaW1wb3J0IHtEaXJlY3RpdmVSZXNvbHZlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2RpcmVjdGl2ZV9yZXNvbHZlcic7XG5pbXBvcnQge1ZpZXdSZXNvbHZlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfcmVzb2x2ZXInO1xuaW1wb3J0IHtWaWV3TWV0YWRhdGF9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcnO1xuaW1wb3J0IHtoYXNMaWZlY3ljbGVIb29rfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZGlyZWN0aXZlX2xpZmVjeWNsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtMaWZlY3ljbGVIb29rcywgTElGRUNZQ0xFX0hPT0tTX1ZBTFVFU30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdCwgT3B0aW9uYWx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7UExBVEZPUk1fRElSRUNUSVZFU30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcGxhdGZvcm1fZGlyZWN0aXZlc19hbmRfcGlwZXMnO1xuaW1wb3J0IHtNT0RVTEVfU1VGRklYfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtnZXRVcmxTY2hlbWV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci91cmxfcmVzb2x2ZXInO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUnVudGltZU1ldGFkYXRhUmVzb2x2ZXIge1xuICBwcml2YXRlIF9jYWNoZSA9IG5ldyBNYXA8VHlwZSwgY3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YT4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kaXJlY3RpdmVSZXNvbHZlcjogRGlyZWN0aXZlUmVzb2x2ZXIsIHByaXZhdGUgX3ZpZXdSZXNvbHZlcjogVmlld1Jlc29sdmVyLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFBMQVRGT1JNX0RJUkVDVElWRVMpIHByaXZhdGUgX3BsYXRmb3JtRGlyZWN0aXZlczogVHlwZVtdKSB7fVxuXG4gIGdldE1ldGFkYXRhKGRpcmVjdGl2ZVR5cGU6IFR5cGUpOiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICB2YXIgbWV0YSA9IHRoaXMuX2NhY2hlLmdldChkaXJlY3RpdmVUeXBlKTtcbiAgICBpZiAoaXNCbGFuayhtZXRhKSkge1xuICAgICAgdmFyIGRpck1ldGEgPSB0aGlzLl9kaXJlY3RpdmVSZXNvbHZlci5yZXNvbHZlKGRpcmVjdGl2ZVR5cGUpO1xuICAgICAgdmFyIG1vZHVsZVVybCA9IGNhbGNNb2R1bGVVcmwoZGlyZWN0aXZlVHlwZSwgZGlyTWV0YSk7XG4gICAgICB2YXIgdGVtcGxhdGVNZXRhID0gbnVsbDtcbiAgICAgIHZhciBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSA9IG51bGw7XG5cbiAgICAgIGlmIChkaXJNZXRhIGluc3RhbmNlb2YgbWQuQ29tcG9uZW50TWV0YWRhdGEpIHtcbiAgICAgICAgdmFyIGNtcE1ldGEgPSA8bWQuQ29tcG9uZW50TWV0YWRhdGE+ZGlyTWV0YTtcbiAgICAgICAgdmFyIHZpZXdNZXRhID0gdGhpcy5fdmlld1Jlc29sdmVyLnJlc29sdmUoZGlyZWN0aXZlVHlwZSk7XG4gICAgICAgIHRlbXBsYXRlTWV0YSA9IG5ldyBjcGwuQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEoe1xuICAgICAgICAgIGVuY2Fwc3VsYXRpb246IHZpZXdNZXRhLmVuY2Fwc3VsYXRpb24sXG4gICAgICAgICAgdGVtcGxhdGU6IHZpZXdNZXRhLnRlbXBsYXRlLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiB2aWV3TWV0YS50ZW1wbGF0ZVVybCxcbiAgICAgICAgICBzdHlsZXM6IHZpZXdNZXRhLnN0eWxlcyxcbiAgICAgICAgICBzdHlsZVVybHM6IHZpZXdNZXRhLnN0eWxlVXJsc1xuICAgICAgICB9KTtcbiAgICAgICAgY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgPSBjbXBNZXRhLmNoYW5nZURldGVjdGlvbjtcbiAgICAgIH1cbiAgICAgIG1ldGEgPSBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmNyZWF0ZSh7XG4gICAgICAgIHNlbGVjdG9yOiBkaXJNZXRhLnNlbGVjdG9yLFxuICAgICAgICBleHBvcnRBczogZGlyTWV0YS5leHBvcnRBcyxcbiAgICAgICAgaXNDb21wb25lbnQ6IGlzUHJlc2VudCh0ZW1wbGF0ZU1ldGEpLFxuICAgICAgICBkeW5hbWljTG9hZGFibGU6IHRydWUsXG4gICAgICAgIHR5cGU6IG5ldyBjcGwuQ29tcGlsZVR5cGVNZXRhZGF0YShcbiAgICAgICAgICAgIHtuYW1lOiBzdHJpbmdpZnkoZGlyZWN0aXZlVHlwZSksIG1vZHVsZVVybDogbW9kdWxlVXJsLCBydW50aW1lOiBkaXJlY3RpdmVUeXBlfSksXG4gICAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZU1ldGEsXG4gICAgICAgIGNoYW5nZURldGVjdGlvbjogY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgICAgIGlucHV0czogZGlyTWV0YS5pbnB1dHMsXG4gICAgICAgIG91dHB1dHM6IGRpck1ldGEub3V0cHV0cyxcbiAgICAgICAgaG9zdDogZGlyTWV0YS5ob3N0LFxuICAgICAgICBsaWZlY3ljbGVIb29rczogTElGRUNZQ0xFX0hPT0tTX1ZBTFVFUy5maWx0ZXIoaG9vayA9PiBoYXNMaWZlY3ljbGVIb29rKGhvb2ssIGRpcmVjdGl2ZVR5cGUpKVxuICAgICAgfSk7XG4gICAgICB0aGlzLl9jYWNoZS5zZXQoZGlyZWN0aXZlVHlwZSwgbWV0YSk7XG4gICAgfVxuICAgIHJldHVybiBtZXRhO1xuICB9XG5cbiAgZ2V0Vmlld0RpcmVjdGl2ZXNNZXRhZGF0YShjb21wb25lbnQ6IFR5cGUpOiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10ge1xuICAgIHZhciB2aWV3ID0gdGhpcy5fdmlld1Jlc29sdmVyLnJlc29sdmUoY29tcG9uZW50KTtcbiAgICB2YXIgZGlyZWN0aXZlcyA9IGZsYXR0ZW5EaXJlY3RpdmVzKHZpZXcsIHRoaXMuX3BsYXRmb3JtRGlyZWN0aXZlcyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaXJlY3RpdmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIWlzVmFsaWREaXJlY3RpdmUoZGlyZWN0aXZlc1tpXSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICBgVW5leHBlY3RlZCBkaXJlY3RpdmUgdmFsdWUgJyR7c3RyaW5naWZ5KGRpcmVjdGl2ZXNbaV0pfScgb24gdGhlIFZpZXcgb2YgY29tcG9uZW50ICcke3N0cmluZ2lmeShjb21wb25lbnQpfSdgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGlyZWN0aXZlcy5tYXAodHlwZSA9PiB0aGlzLmdldE1ldGFkYXRhKHR5cGUpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmbGF0dGVuRGlyZWN0aXZlcyh2aWV3OiBWaWV3TWV0YWRhdGEsIHBsYXRmb3JtRGlyZWN0aXZlczogYW55W10pOiBUeXBlW10ge1xuICBsZXQgZGlyZWN0aXZlcyA9IFtdO1xuICBpZiAoaXNQcmVzZW50KHBsYXRmb3JtRGlyZWN0aXZlcykpIHtcbiAgICBmbGF0dGVuQXJyYXkocGxhdGZvcm1EaXJlY3RpdmVzLCBkaXJlY3RpdmVzKTtcbiAgfVxuICBpZiAoaXNQcmVzZW50KHZpZXcuZGlyZWN0aXZlcykpIHtcbiAgICBmbGF0dGVuQXJyYXkodmlldy5kaXJlY3RpdmVzLCBkaXJlY3RpdmVzKTtcbiAgfVxuICByZXR1cm4gZGlyZWN0aXZlcztcbn1cblxuZnVuY3Rpb24gZmxhdHRlbkFycmF5KHRyZWU6IGFueVtdLCBvdXQ6IEFycmF5PFR5cGUgfCBhbnlbXT4pOiB2b2lkIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmVlLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSByZXNvbHZlRm9yd2FyZFJlZih0cmVlW2ldKTtcbiAgICBpZiAoaXNBcnJheShpdGVtKSkge1xuICAgICAgZmxhdHRlbkFycmF5KGl0ZW0sIG91dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkRGlyZWN0aXZlKHZhbHVlOiBUeXBlKTogYm9vbGVhbiB7XG4gIHJldHVybiBpc1ByZXNlbnQodmFsdWUpICYmICh2YWx1ZSBpbnN0YW5jZW9mIFR5cGUpO1xufVxuXG5mdW5jdGlvbiBjYWxjTW9kdWxlVXJsKHR5cGU6IFR5cGUsIGRpck1ldGE6IG1kLkRpcmVjdGl2ZU1ldGFkYXRhKTogc3RyaW5nIHtcbiAgdmFyIG1vZHVsZUlkID0gZGlyTWV0YS5tb2R1bGVJZDtcbiAgaWYgKGlzUHJlc2VudChtb2R1bGVJZCkpIHtcbiAgICB2YXIgc2NoZW1lID0gZ2V0VXJsU2NoZW1lKG1vZHVsZUlkKTtcbiAgICByZXR1cm4gaXNQcmVzZW50KHNjaGVtZSkgJiYgc2NoZW1lLmxlbmd0aCA+IDAgPyBtb2R1bGVJZCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYHBhY2thZ2U6JHttb2R1bGVJZH0ke01PRFVMRV9TVUZGSVh9YDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcmVmbGVjdG9yLmltcG9ydFVyaSh0eXBlKTtcbiAgfVxufVxuIl19