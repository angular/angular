"use strict";
var util = require('../../../../tools/perf/util.js');

describe('ng1.x tree benchmark', function () {

  var URL = 'benchmarks_external/web/tree/tree_benchmark.html';

  afterEach(util.verifyNoErrors);

  it('should log the stats', function() {
    util.runSimpleBenchmark({
      url: URL,
      buttons: ['#destroyDom', '#createDom'],
      name: browser.params.lang+'.ng1.tree'
    });
  });

});
