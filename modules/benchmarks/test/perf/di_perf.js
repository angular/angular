"use strict";
var util = require('../../../../tools/perf/util.js');

describe('ng2 di benchmark', function () {

  var URL = 'benchmarks/web/di/di_benchmark.html';

  afterEach(util.verifyNoErrors);

  it('should log the stats for getByToken', function() {
    util.runSimpleBenchmark({
      url: URL,
      buttons: ['#getByToken'],
      name: browser.params.lang+'.ng2.di.getByToken'
    });
  });

  it('should log the stats for getByKey', function() {
    util.runSimpleBenchmark({
      url: URL,
      buttons: ['#getByKey'],
      name: browser.params.lang+'.ng2.di.getByKey'
    });
  });

  it('should log the stats for getChild', function() {
    util.runSimpleBenchmark({
      url: URL,
      buttons: ['#getChild'],
      name: browser.params.lang+'.ng2.di.getChild'
    });
  });

  it('should log the stats for instantiate', function() {
    util.runSimpleBenchmark({
      url: URL,
      buttons: ['#instantiate'],
      name: browser.params.lang+'.ng2.di.instantiate'
    });
  });

});
