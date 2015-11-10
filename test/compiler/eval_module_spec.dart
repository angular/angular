library angular2.test.compiler.eval_module_spec;

import "package:angular2/testing_internal.dart"
    show
        ddescribe,
        describe,
        xdescribe,
        it,
        iit,
        xit,
        expect,
        beforeEach,
        afterEach,
        AsyncTestCompleter,
        inject;
import "package:angular2/src/facade/lang.dart" show IS_DART;
import "eval_module.dart" show evalModule;
// This export is used by this test code

// when evaling the test module!
var TEST_VALUE = 23;
const THIS_MODULE_URL =
    '''package:angular2/test/compiler/eval_module_spec${ IS_DART ? ".dart" : ".js"}''';
main() {
  describe("evalModule", () {
    it(
        "should call the \"run\" function and allow to use imports",
        inject([AsyncTestCompleter], (async) {
          var moduleSource = IS_DART ? testDartModule : testJsModule;
          evalModule(moduleSource, [
            [THIS_MODULE_URL, "tst"]
          ], [
            1
          ]).then((value) {
            expect(value).toEqual([1, 23]);
            async.done();
          });
        }));
  });
}

var testDartModule = '''
  run(data) {
	  data.add(tst.TEST_VALUE);
		return data;
	}
''';
var testJsModule = '''
  exports.run = function(data) {
	  data.push(tst.TEST_VALUE);
		return data;
	}
''';
