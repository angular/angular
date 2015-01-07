"use strict";
var benchpress = require('../../../tools/benchpress/index.js');

describe('ng1.x tree benchmark', function () {

  var URL = 'benchmarks_external/web/tree/tree_benchmark.html';

  afterEach(benchpress.verifyNoBrowserErrors);

  it('should log the stats', function() {
    browser.get(URL);
    runClickBenchmark({
      buttons: ['#destroyDom', '#createDom'],
      logId: 'ng1.tree'
    });
  });

});

function runClickBenchmark(config) {
  var buttons = config.buttons.map(function(selector) {
    return $(selector);
  });
  var params = Object.create(browser.params.benchmark);
  params.logId = browser.params.lang+'.'+config.logId;
  benchpress.runBenchmark(params, function() {
    buttons.forEach(function(button) {
      button.click();
    });
  });
}
