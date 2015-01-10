var testUtil = require('../../e2e_test_lib/e2e_test/test_util');

describe('ng2 di benchmark', function () {

  var URL = 'benchmarks/web/di/di_benchmark.html';

  afterEach(testUtil.verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    testUtil.clickAll(['#getByToken', '#getByKey', '#getChild', '#instantiate']);
  });

});
