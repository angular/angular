"use strict";
var benchpress = require('../../../tools/benchpress/index.js');

describe('ng2 element injector benchmark', function () {

  var URL = 'benchmarks/web/element_injector/element_injector_benchmark.html';

  afterEach(benchpress.verifyNoBrowserErrors);

  it('should log the stats for instantiate', function() {
    browser.get(URL);
    runClickBenchmark({
      buttons: ['#instantiate'],
      logId: 'ng2.elementInjector.instantiate'
    });
  });

  it('should log the stats for instantiateDirectives', function() {
    browser.get(URL);
    runClickBenchmark({
      buttons: ['#instantiateDirectives'],
      logId: 'ng2.elementInjector.instantiateDirectives'
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
