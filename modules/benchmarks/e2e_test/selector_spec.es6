var testUtil = require('angular2/e2e_test/test_util');

describe('ng2 selector benchmark', function () {

  var URL = 'benchmarks/src/compiler/selector_benchmark.html';

  afterEach(testUtil.verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    testUtil.clickAll(['#parse', '#addSelectable', '#match']);
  });

});
