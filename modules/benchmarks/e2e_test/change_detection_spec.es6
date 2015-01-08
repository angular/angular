var benchpress = require('../../../tools/benchpress/index.js');

describe('ng2 change detection benchmark', function () {

  var URL = 'benchmarks/web/change_detection/change_detection_benchmark.html';

  afterEach(benchpress.verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    clickAll(['#ng2DetectChanges', '#baselineDetectChanges']);
  });

});

function clickAll(buttonSelectors) {
  buttonSelectors.forEach(function(selector) {
    $(selector).click();
  });
}
