"use strict";
var benchpress = require('../../../tools/benchpress/index.js');

describe('ng2 tree benchmark', function () {

  var URL = 'benchmarks/web/tree/tree_benchmark.html';

  afterEach(benchpress.verifyNoBrowserErrors);

  it('should log the ng stats', function() {
    browser.get(URL);
    runClickBenchmark({
      buttons: ['#ng2DestroyDom', '#ng2CreateDom'],
      logId: 'ng2.tree'
    });
  });

  it('should log the baseline stats', function() {
    browser.get(URL);
    runClickBenchmark({
      buttons: ['#baselineDestroyDom', '#baselineCreateDom'],
      logId: 'baseline.tree'
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
