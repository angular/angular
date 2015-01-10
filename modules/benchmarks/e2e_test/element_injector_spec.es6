var testUtil = require('../../e2e_test_lib/e2e_test/test_util');

describe('ng2 element injector benchmark', function () {

  var URL = 'benchmarks/web/element_injector/element_injector_benchmark.html';

  afterEach(testUtil.verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    testUtil.clickAll(['#instantiate', '#instantiateDirectives']);
  });

});
