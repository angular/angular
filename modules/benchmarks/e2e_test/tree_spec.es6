var benchpress = require('../../../tools/benchpress/index.js');

describe('ng2 tree benchmark', function () {

  var URL = 'benchmarks/web/tree/tree_benchmark.html';

  afterEach(benchpress.verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    clickAll(['#ng2CreateDom', '#ng2DestroyDom', '#baselineCreateDom', '#baselineDestroyDom']);
  });

});

function clickAll(buttonSelectors) {
  buttonSelectors.forEach(function(selector) {
    $(selector).click();
  });
}
