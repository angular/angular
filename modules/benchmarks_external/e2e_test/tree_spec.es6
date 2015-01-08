var benchpress = require('../../../tools/benchpress/index.js');

describe('ng1.x tree benchmark', function () {

  var URL = 'benchmarks_external/web/tree/tree_benchmark.html';

  afterEach(benchpress.verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    clickAll(['#createDom', '#destroyDom']);
  });

});

function clickAll(buttonSelectors) {
  buttonSelectors.forEach(function(selector) {
    $(selector).click();
  });
}
