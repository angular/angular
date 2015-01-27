var testUtil = require('../../e2e_test_lib/e2e_test/test_util');

describe('ng-dart1.x naive infinite scroll benchmark', function () {

  var URL = 'benchmarks_external/web/naive_infinite_scroll/index.html';

  afterEach(testUtil.verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    browser.executeScript(
        'document.querySelector("scroll-app /deep/ #reset-btn").click()');
    browser.executeScript(
        'document.querySelector("scroll-app /deep/ #run-btn").click()');
    browser.sleep(1000);
  });

});
