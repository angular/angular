var benchpress = require('../../../tools/benchpress/index.js');

describe('ng2 di benchmark', function () {

  var URL = 'benchmarks/web/di/di_benchmark.html';

  afterEach(benchpress.verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    clickAll(['#getByToken', '#getByKey', '#getChild', '#instantiate']);
  });

});

function clickAll(buttonSelectors) {
  buttonSelectors.forEach(function(selector) {
    $(selector).click();
  });
}
