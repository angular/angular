var testing_internal_1 = require('angular2/testing_internal');
var core_1 = require('angular2/core');
var spies_1 = require('../spies');
var template_commands_1 = require('angular2/src/core/linker/template_commands');
var compiler_1 = require('angular2/src/core/linker/compiler');
var proto_view_factory_1 = require('angular2/src/core/linker/proto_view_factory');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var view_1 = require('angular2/src/core/linker/view');
var compiler_2 = require("angular2/src/core/linker/compiler");
function main() {
    testing_internal_1.describe('Compiler', function () {
        var compiler;
        var protoViewFactorySpy;
        var someProtoView;
        var cht;
        testing_internal_1.beforeEachBindings(function () {
            protoViewFactorySpy = new spies_1.SpyProtoViewFactory();
            someProtoView = new view_1.AppProtoView(null, null, null, null, null, null, null);
            protoViewFactorySpy.spy('createHost').andReturn(someProtoView);
            var factory = core_1.provide(proto_view_factory_1.ProtoViewFactory, { useValue: protoViewFactorySpy });
            var classProvider = core_1.provide(compiler_1.Compiler, { useClass: compiler_2.Compiler_ });
            var providers = [factory, classProvider];
            return providers;
        });
        testing_internal_1.beforeEach(testing_internal_1.inject([compiler_1.Compiler], function (_compiler) {
            compiler = _compiler;
            cht = new template_commands_1.CompiledHostTemplate(new template_commands_1.CompiledComponentTemplate('aCompId', null, null, null));
            reflection_1.reflector.registerType(SomeComponent, new reflection_1.ReflectionInfo([cht]));
        }));
        testing_internal_1.it('should read the template from an annotation', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            compiler.compileInHost(SomeComponent)
                .then(function (_) {
                testing_internal_1.expect(protoViewFactorySpy.spy('createHost')).toHaveBeenCalledWith(cht);
                async.done();
            });
        }));
        testing_internal_1.it('should clear the cache', function () {
            compiler.clearCache();
            testing_internal_1.expect(protoViewFactorySpy.spy('clearCache')).toHaveBeenCalled();
        });
    });
}
exports.main = main;
var SomeComponent = (function () {
    function SomeComponent() {
    }
    return SomeComponent;
})();
//# sourceMappingURL=compiler_spec.js.map