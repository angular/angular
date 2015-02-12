var testUtil = require('angular2/e2e_test/test_util');

describe('ng2 di benchmark', function () {

  var URL = 'benchmarks/src/di/di_benchmark.html';

  afterEach(testUtil.verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    testUtil.clickAll(['#getByToken', '#getByKey', '#getChild', '#instantiate']);
  });

});
