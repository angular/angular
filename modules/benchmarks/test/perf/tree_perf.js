"use strict";
var util = require('../../../../tools/perf/util.js');

describe('ng2 tree benchmark', function () {

  var URL = 'benchmarks/web/tree/tree_benchmark.html';

  afterEach(util.verifyNoErrors);

  it('should log the ng stats', function() {
    util.runSimpleBenchmark({
      url: URL,
      buttons: ['#ng2DestroyDom', '#ng2CreateDom'],
      name: browser.params.lang+'.ng2.tree'
    });
  });

  it('should log the baseline stats', function() {
    util.runSimpleBenchmark({
      url: URL,
      buttons: ['#baselineDestroyDom', '#baselineCreateDom'],
      name: browser.params.lang+'.baseline.tree'
    });
  });

});
