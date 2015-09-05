import {
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
  inject
} from 'angular2/test_lib';
import {IS_DART} from '../platform';

import {evalModule} from './eval_module';

// This export is used by this test code
// when evaling the test module!
export var TEST_VALUE = 23;

export function main() {
  describe('evalModule', () => {
    it('should call the "run" function and allow to use imports',
       inject([AsyncTestCompleter], (async) => {
         var moduleSource = IS_DART ? testDartModule : testJsModule;
         var imports = [['angular2/test/compiler/eval_module_spec', 'testMod']];

         evalModule(moduleSource, imports, [1])
             .then((value) => {
               expect(value).toEqual([1, 23]);
               async.done();
             });
       }));
  });
}

var testDartModule = `
  run(data) { 
	  data.add(testMod.TEST_VALUE);
		return data;
	}
`;

var testJsModule = `
  exports.run = function(data) {
	  data.push(testMod.TEST_VALUE);
		return data;
	}
`;