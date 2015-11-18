var testing_internal_1 = require('angular2/testing_internal');
var source_module_1 = require('angular2/src/compiler/source_module');
function main() {
    testing_internal_1.describe('SourceModule', function () {
        testing_internal_1.describe('getSourceWithImports', function () {
            testing_internal_1.it('should generate named imports for modules', function () {
                var sourceWithImports = new source_module_1.SourceModule('package:some/moda', source_module_1.moduleRef('package:some/modb') + "A")
                    .getSourceWithImports();
                testing_internal_1.expect(sourceWithImports.source).toEqual('import0.A');
                testing_internal_1.expect(sourceWithImports.imports).toEqual([['package:some/modb', 'import0']]);
            });
            testing_internal_1.it('should dedupe imports', function () {
                var sourceWithImports = new source_module_1.SourceModule('package:some/moda', source_module_1.moduleRef('package:some/modb') + "A + " + source_module_1.moduleRef('package:some/modb') + "B")
                    .getSourceWithImports();
                testing_internal_1.expect(sourceWithImports.source).toEqual('import0.A + import0.B');
                testing_internal_1.expect(sourceWithImports.imports).toEqual([['package:some/modb', 'import0']]);
            });
            testing_internal_1.it('should not use an import for the moduleUrl of the SourceModule', function () {
                var sourceWithImports = new source_module_1.SourceModule('package:some/moda', source_module_1.moduleRef('package:some/moda') + "A")
                    .getSourceWithImports();
                testing_internal_1.expect(sourceWithImports.source).toEqual('A');
                testing_internal_1.expect(sourceWithImports.imports).toEqual([]);
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=source_module_spec.js.map