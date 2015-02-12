var testUtil = require('angular2/e2e_test/test_util');

describe('ng2 naive infinite scroll benchmark', function () {

  var URL = 'benchmarks/src/naive_infinite_scroll/index.html';

  afterEach(testUtil.verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    browser.executeScript(
        'document.querySelector("scroll-app /deep/ #reset-btn").click()');
    browser.executeScript(
        'document.querySelector("scroll-app /deep/ #run-btn").click()');
    browser.wait(() => {
      return $('#done').getText().then(
        function() { return true; },
        function() { return false; });
      }, 10000);
  });

});
