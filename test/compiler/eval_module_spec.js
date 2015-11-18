var testing_internal_1 = require('angular2/testing_internal');
var lang_1 = require('angular2/src/facade/lang');
var eval_module_1 = require('./eval_module');
// This export is used by this test code
// when evaling the test module!
exports.TEST_VALUE = 23;
var THIS_MODULE_URL = "package:angular2/test/compiler/eval_module_spec" + (lang_1.IS_DART ? '.dart' : '.js');
function main() {
    testing_internal_1.describe('evalModule', function () {
        testing_internal_1.it('should call the "run" function and allow to use imports', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var moduleSource = lang_1.IS_DART ? testDartModule : testJsModule;
            eval_module_1.evalModule(moduleSource, [[THIS_MODULE_URL, 'tst']], [1])
                .then(function (value) {
                testing_internal_1.expect(value).toEqual([1, 23]);
                async.done();
            });
        }));
    });
}
exports.main = main;
var testDartModule = "\n  run(data) {\n\t  data.add(tst.TEST_VALUE);\n\t\treturn data;\n\t}\n";
var testJsModule = "\n  exports.run = function(data) {\n\t  data.push(tst.TEST_VALUE);\n\t\treturn data;\n\t}\n";
//# sourceMappingURL=eval_module_spec.js.map