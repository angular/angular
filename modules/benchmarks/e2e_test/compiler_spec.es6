var testUtil = require('../../e2e_test_lib/e2e_test/test_util');

describe('ng2 compiler benchmark', function () {

  var URL = 'benchmarks/src/compiler/compiler_benchmark.html';

  afterEach(testUtil.verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    testUtil.clickAll(['#compileWithBindings', '#compileNoBindings']);
  });

});
