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
var testing_internal_1 = require('angular2/testing_internal');
var lang_1 = require('angular2/src/facade/lang');
var runtime_metadata_1 = require('angular2/src/compiler/runtime_metadata');
var interfaces_1 = require('angular2/src/core/linker/interfaces');
var core_1 = require('angular2/core');
var test_bindings_1 = require('./test_bindings');
var util_1 = require('angular2/src/compiler/util');
var lang_2 = require('angular2/src/facade/lang');
var platform_directives_and_pipes_1 = require('angular2/src/core/platform_directives_and_pipes');
function main() {
    testing_internal_1.describe('RuntimeMetadataResolver', function () {
        testing_internal_1.beforeEachProviders(function () { return test_bindings_1.TEST_PROVIDERS; });
        testing_internal_1.describe('getMetadata', function () {
            testing_internal_1.it('should read metadata', testing_internal_1.inject([runtime_metadata_1.RuntimeMetadataResolver], function (resolver) {
                var meta = resolver.getMetadata(ComponentWithEverything);
                testing_internal_1.expect(meta.selector).toEqual('someSelector');
                testing_internal_1.expect(meta.exportAs).toEqual('someExportAs');
                testing_internal_1.expect(meta.isComponent).toBe(true);
                testing_internal_1.expect(meta.dynamicLoadable).toBe(true);
                testing_internal_1.expect(meta.type.runtime).toBe(ComponentWithEverything);
                testing_internal_1.expect(meta.type.name).toEqual(lang_1.stringify(ComponentWithEverything));
                testing_internal_1.expect(meta.type.moduleUrl).toEqual("package:someModuleId" + util_1.MODULE_SUFFIX);
                testing_internal_1.expect(meta.lifecycleHooks).toEqual(interfaces_1.LIFECYCLE_HOOKS_VALUES);
                testing_internal_1.expect(meta.changeDetection).toBe(core_1.ChangeDetectionStrategy.CheckAlways);
                testing_internal_1.expect(meta.inputs).toEqual({ 'someProp': 'someProp' });
                testing_internal_1.expect(meta.outputs).toEqual({ 'someEvent': 'someEvent' });
                testing_internal_1.expect(meta.hostListeners).toEqual({ 'someHostListener': 'someHostListenerExpr' });
                testing_internal_1.expect(meta.hostProperties).toEqual({ 'someHostProp': 'someHostPropExpr' });
                testing_internal_1.expect(meta.hostAttributes).toEqual({ 'someHostAttr': 'someHostAttrValue' });
                testing_internal_1.expect(meta.template.encapsulation).toBe(core_1.ViewEncapsulation.Emulated);
                testing_internal_1.expect(meta.template.styles).toEqual(['someStyle']);
                testing_internal_1.expect(meta.template.styleUrls).toEqual(['someStyleUrl']);
                testing_internal_1.expect(meta.template.template).toEqual('someTemplate');
                testing_internal_1.expect(meta.template.templateUrl).toEqual('someTemplateUrl');
            }));
            testing_internal_1.it('should use the moduleUrl from the reflector if none is given', testing_internal_1.inject([runtime_metadata_1.RuntimeMetadataResolver], function (resolver) {
                var value = resolver.getMetadata(DirectiveWithoutModuleId).type.moduleUrl;
                var expectedEndValue = lang_2.IS_DART ? 'base/dist/dart/angular2/test/compiler/runtime_metadata_spec.dart' : './';
                testing_internal_1.expect(value.endsWith(expectedEndValue)).toBe(true);
            }));
        });
        testing_internal_1.describe('getViewDirectivesMetadata', function () {
            testing_internal_1.it('should return the directive metadatas', testing_internal_1.inject([runtime_metadata_1.RuntimeMetadataResolver], function (resolver) {
                testing_internal_1.expect(resolver.getViewDirectivesMetadata(ComponentWithEverything))
                    .toEqual([resolver.getMetadata(DirectiveWithoutModuleId)]);
            }));
            testing_internal_1.describe("platform directives", function () {
                testing_internal_1.beforeEachProviders(function () { return [core_1.provide(platform_directives_and_pipes_1.PLATFORM_DIRECTIVES, { useValue: [ADirective] })]; });
                testing_internal_1.it('should include platform directives when available', testing_internal_1.inject([runtime_metadata_1.RuntimeMetadataResolver], function (resolver) {
                    testing_internal_1.expect(resolver.getViewDirectivesMetadata(ComponentWithEverything))
                        .toEqual([
                        resolver.getMetadata(ADirective),
                        resolver.getMetadata(DirectiveWithoutModuleId)
                    ]);
                }));
            });
        });
    });
}
exports.main = main;
var ADirective = (function () {
    function ADirective() {
    }
    ADirective = __decorate([
        core_1.Directive({ selector: 'a-directive' }), 
        __metadata('design:paramtypes', [])
    ], ADirective);
    return ADirective;
})();
var DirectiveWithoutModuleId = (function () {
    function DirectiveWithoutModuleId() {
    }
    DirectiveWithoutModuleId = __decorate([
        core_1.Directive({ selector: 'someSelector' }), 
        __metadata('design:paramtypes', [])
    ], DirectiveWithoutModuleId);
    return DirectiveWithoutModuleId;
})();
var ComponentWithEverything = (function () {
    function ComponentWithEverything() {
    }
    ComponentWithEverything.prototype.onChanges = function (changes) { };
    ComponentWithEverything.prototype.onInit = function () { };
    ComponentWithEverything.prototype.doCheck = function () { };
    ComponentWithEverything.prototype.onDestroy = function () { };
    ComponentWithEverything.prototype.afterContentInit = function () { };
    ComponentWithEverything.prototype.afterContentChecked = function () { };
    ComponentWithEverything.prototype.afterViewInit = function () { };
    ComponentWithEverything.prototype.afterViewChecked = function () { };
    ComponentWithEverything = __decorate([
        core_1.Component({
            selector: 'someSelector',
            inputs: ['someProp'],
            outputs: ['someEvent'],
            host: {
                '[someHostProp]': 'someHostPropExpr',
                '(someHostListener)': 'someHostListenerExpr',
                'someHostAttr': 'someHostAttrValue'
            },
            exportAs: 'someExportAs',
            moduleId: 'someModuleId',
            changeDetection: core_1.ChangeDetectionStrategy.CheckAlways
        }),
        core_1.View({
            template: 'someTemplate',
            templateUrl: 'someTemplateUrl',
            encapsulation: core_1.ViewEncapsulation.Emulated,
            styles: ['someStyle'],
            styleUrls: ['someStyleUrl'],
            directives: [DirectiveWithoutModuleId]
        }), 
        __metadata('design:paramtypes', [])
    ], ComponentWithEverything);
    return ComponentWithEverything;
})();
//# sourceMappingURL=runtime_metadata_spec.js.map