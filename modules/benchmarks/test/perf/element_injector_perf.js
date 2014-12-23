"use strict";
var util = require('../../../../tools/perf/util.js');

describe('ng2 element injector benchmark', function () {

  var URL = 'benchmarks/web/element_injector/element_injector_benchmark.html';

  afterEach(util.verifyNoErrors);

  it('should log the stats for instantiate', function() {
    util.runSimpleBenchmark({
      url: URL,
      buttons: ['#instantiate'],
      name: browser.params.lang+'.ng2.elementInjector.instantiate'
    });
  });

  it('should log the stats for instantiateDirectives', function() {
    util.runSimpleBenchmark({
      url: URL,
      buttons: ['#instantiateDirectives'],
      name: browser.params.lang+'.ng2.elementInjector.instantiateDirectives'
    });
  });

});
