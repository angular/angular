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
} from 'angular2/testing_internal';
import {IS_DART} from '../../platform';

import {evalModule} from './eval_module';

// This export is used by this test code
// when evaling the test module!
export var TEST_VALUE = 23;

const THIS_MODULE_URL =
    `package:angular2/test/core/compiler/eval_module_spec${IS_DART?'.dart':'.js'}`;

export function main() {
  describe('evalModule', () => {
    it('should call the "run" function and allow to use imports',
       inject([AsyncTestCompleter], (async) => {
         var moduleSource = IS_DART ? testDartModule : testJsModule;
         evalModule(moduleSource, [[THIS_MODULE_URL, 'tst']], [1])
             .then((value) => {
               expect(value).toEqual([1, 23]);
               async.done();
             });
       }));
  });
}

var testDartModule = `
  run(data) {
	  data.add(tst.TEST_VALUE);
		return data;
	}
`;

var testJsModule = `
  exports.run = function(data) {
	  data.push(tst.TEST_VALUE);
		return data;
	}
`;
