var testing_internal_1 = require('angular2/testing_internal');
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var change_detector_compiler_1 = require('angular2/src/compiler/change_detector_compiler');
var directive_metadata_1 = require('angular2/src/compiler/directive_metadata');
var source_module_1 = require('angular2/src/compiler/source_module');
var template_parser_1 = require('angular2/src/compiler/template_parser');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var eval_module_1 = require('./eval_module');
var test_bindings_1 = require('./test_bindings');
var change_detector_mocks_1 = require('./change_detector_mocks');
var util_1 = require('angular2/src/compiler/util');
// Attention: These module names have to correspond to real modules!
var THIS_MODULE_ID = 'angular2/test/compiler/change_detector_compiler_spec';
var THIS_MODULE_URL = "package:" + THIS_MODULE_ID + util_1.MODULE_SUFFIX;
var THIS_MODULE_REF = source_module_1.moduleRef(THIS_MODULE_URL);
function main() {
    testing_internal_1.describe('ChangeDetectorCompiler', function () {
        testing_internal_1.beforeEachBindings(function () { return test_bindings_1.TEST_PROVIDERS; });
        var parser;
        var compiler;
        testing_internal_1.beforeEach(testing_internal_1.inject([template_parser_1.TemplateParser, change_detector_compiler_1.ChangeDetectionCompiler], function (_parser, _compiler) {
            parser = _parser;
            compiler = _compiler;
        }));
        testing_internal_1.describe('compileComponentRuntime', function () {
            function detectChanges(compiler, template, directives) {
                if (directives === void 0) { directives = lang_1.CONST_EXPR([]); }
                var type = new directive_metadata_1.CompileTypeMetadata({ name: lang_1.stringify(SomeComponent), moduleUrl: THIS_MODULE_URL });
                var parsedTemplate = parser.parse(template, directives, 'TestComp');
                var factories = compiler.compileComponentRuntime(type, change_detection_1.ChangeDetectionStrategy.Default, parsedTemplate);
                return testChangeDetector(factories[0]);
            }
            testing_internal_1.describe('no jit', function () {
                testing_internal_1.beforeEachBindings(function () { return [
                    di_1.provide(change_detection_1.ChangeDetectorGenConfig, { useValue: new change_detection_1.ChangeDetectorGenConfig(true, false, false) })
                ]; });
                testing_internal_1.it('should watch element properties', function () {
                    testing_internal_1.expect(detectChanges(compiler, '<div [el-prop]="someProp">'))
                        .toEqual(['elementProperty(elProp)=someValue']);
                });
            });
            testing_internal_1.describe('jit', function () {
                testing_internal_1.beforeEachBindings(function () { return [
                    di_1.provide(change_detection_1.ChangeDetectorGenConfig, { useValue: new change_detection_1.ChangeDetectorGenConfig(true, false, true) })
                ]; });
                testing_internal_1.it('should watch element properties', function () {
                    testing_internal_1.expect(detectChanges(compiler, '<div [el-prop]="someProp">'))
                        .toEqual(['elementProperty(elProp)=someValue']);
                });
            });
        });
        testing_internal_1.describe('compileComponentCodeGen', function () {
            function detectChanges(compiler, template, directives) {
                if (directives === void 0) { directives = lang_1.CONST_EXPR([]); }
                var type = new directive_metadata_1.CompileTypeMetadata({ name: lang_1.stringify(SomeComponent), moduleUrl: THIS_MODULE_URL });
                var parsedTemplate = parser.parse(template, directives, 'TestComp');
                var sourceExpressions = compiler.compileComponentCodeGen(type, change_detection_1.ChangeDetectionStrategy.Default, parsedTemplate);
                var testableModule = createTestableModule(sourceExpressions, 0).getSourceWithImports();
                return eval_module_1.evalModule(testableModule.source, testableModule.imports, null);
            }
            testing_internal_1.it('should watch element properties', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                detectChanges(compiler, '<div [el-prop]="someProp">')
                    .then(function (value) {
                    testing_internal_1.expect(value).toEqual(['elementProperty(elProp)=someValue']);
                    async.done();
                });
            }));
        });
    });
}
exports.main = main;
function createTestableModule(source, changeDetectorIndex) {
    var resultExpression = THIS_MODULE_REF + "testChangeDetector(([" + source.expressions.join(',') + "])[" + changeDetectorIndex + "])";
    var testableSource = source.declarations.join('\n') + "\n  " + util_1.codeGenValueFn(['_'], resultExpression, '_run') + ";\n  " + util_1.codeGenExportVariable('run') + "_run;";
    return new source_module_1.SourceModule(null, testableSource);
}
function testChangeDetector(changeDetectorFactory) {
    var dispatcher = new change_detector_mocks_1.TestDispatcher([], []);
    var cd = changeDetectorFactory(dispatcher);
    var ctx = new SomeComponent();
    ctx.someProp = 'someValue';
    var locals = new change_detection_1.Locals(null, collection_1.MapWrapper.createFromStringMap({ 'someVar': null }));
    cd.hydrate(ctx, locals, dispatcher, new change_detector_mocks_1.TestPipes());
    cd.detectChanges();
    return dispatcher.log;
}
exports.testChangeDetector = testChangeDetector;
var SomeComponent = (function () {
    function SomeComponent() {
    }
    return SomeComponent;
})();
//# sourceMappingURL=change_detector_compiler_spec.js.map