var testUtil = require('../../e2e_test_lib/e2e_test/test_util');

describe('ng2 tree benchmark', function () {

  var URL = 'benchmarks/src/tree/tree_benchmark.html';

  afterEach(testUtil.verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    testUtil.clickAll(['#ng2CreateDom', '#ng2DestroyDom', '#baselineCreateDom', '#baselineDestroyDom']);
  });

});
