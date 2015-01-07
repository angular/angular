"use strict";
var benchpress = require('../../../tools/benchpress/index.js');

describe('ng1.x compiler benchmark', function () {

  var URL = 'benchmarks_external/web/compiler/compiler_benchmark.html';

  afterEach(benchpress.verifyNoBrowserErrors);

  it('should log withBinding stats', function() {
    browser.get(URL);
    runClickBenchmark({
      buttons: ['#compileWithBindings'],
      logId: 'ng1.compile.withBindings'
    });
  });

  it('should log noBindings stats', function() {
    browser.get(URL);
    runClickBenchmark({
      buttons: ['#compileNoBindings'],
      logId: 'ng1.compile.noBindings'
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
