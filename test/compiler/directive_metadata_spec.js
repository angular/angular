var testing_internal_1 = require('angular2/testing_internal');
var directive_metadata_1 = require('angular2/src/compiler/directive_metadata');
var view_1 = require('angular2/src/core/metadata/view');
var change_detection_1 = require('angular2/src/core/change_detection');
var interfaces_1 = require('angular2/src/core/linker/interfaces');
function main() {
    testing_internal_1.describe('DirectiveMetadata', function () {
        var fullTypeMeta;
        var fullTemplateMeta;
        var fullDirectiveMeta;
        testing_internal_1.beforeEach(function () {
            fullTypeMeta =
                new directive_metadata_1.CompileTypeMetadata({ name: 'SomeType', moduleUrl: 'someUrl', isHost: true });
            fullTemplateMeta = new directive_metadata_1.CompileTemplateMetadata({
                encapsulation: view_1.ViewEncapsulation.Emulated,
                template: '<a></a>',
                templateUrl: 'someTemplateUrl',
                styles: ['someStyle'],
                styleUrls: ['someStyleUrl'],
                ngContentSelectors: ['*']
            });
            fullDirectiveMeta = directive_metadata_1.CompileDirectiveMetadata.create({
                selector: 'someSelector',
                isComponent: true,
                dynamicLoadable: true,
                type: fullTypeMeta,
                template: fullTemplateMeta,
                changeDetection: change_detection_1.ChangeDetectionStrategy.Default,
                inputs: ['someProp'],
                outputs: ['someEvent'],
                host: { '(event1)': 'handler1', '[prop1]': 'expr1', 'attr1': 'attrValue2' },
                lifecycleHooks: [interfaces_1.LifecycleHooks.OnChanges]
            });
        });
        testing_internal_1.describe('DirectiveMetadata', function () {
            testing_internal_1.it('should serialize with full data', function () {
                testing_internal_1.expect(directive_metadata_1.CompileDirectiveMetadata.fromJson(fullDirectiveMeta.toJson()))
                    .toEqual(fullDirectiveMeta);
            });
            testing_internal_1.it('should serialize with no data', function () {
                var empty = directive_metadata_1.CompileDirectiveMetadata.create();
                testing_internal_1.expect(directive_metadata_1.CompileDirectiveMetadata.fromJson(empty.toJson())).toEqual(empty);
            });
        });
        testing_internal_1.describe('TypeMetadata', function () {
            testing_internal_1.it('should serialize with full data', function () {
                testing_internal_1.expect(directive_metadata_1.CompileTypeMetadata.fromJson(fullTypeMeta.toJson())).toEqual(fullTypeMeta);
            });
            testing_internal_1.it('should serialize with no data', function () {
                var empty = new directive_metadata_1.CompileTypeMetadata();
                testing_internal_1.expect(directive_metadata_1.CompileTypeMetadata.fromJson(empty.toJson())).toEqual(empty);
            });
        });
        testing_internal_1.describe('TemplateMetadata', function () {
            testing_internal_1.it('should use ViewEncapsulation.Emulated by default', function () {
                testing_internal_1.expect(new directive_metadata_1.CompileTemplateMetadata({ encapsulation: null }).encapsulation)
                    .toBe(view_1.ViewEncapsulation.Emulated);
            });
            testing_internal_1.it('should serialize with full data', function () {
                testing_internal_1.expect(directive_metadata_1.CompileTemplateMetadata.fromJson(fullTemplateMeta.toJson()))
                    .toEqual(fullTemplateMeta);
            });
            testing_internal_1.it('should serialize with no data', function () {
                var empty = new directive_metadata_1.CompileTemplateMetadata();
                testing_internal_1.expect(directive_metadata_1.CompileTemplateMetadata.fromJson(empty.toJson())).toEqual(empty);
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=directive_metadata_spec.js.map