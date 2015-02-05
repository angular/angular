var testUtil = require('../../angular2/e2e_test/test_util');

describe('ng1.x compiler benchmark', function () {

  var URL = 'benchmarks_external/src/compiler/compiler_benchmark.html';

  afterEach(testUtil.verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    testUtil.clickAll(['#compileWithBindings', '#compileNoBindings']);
  });

});
