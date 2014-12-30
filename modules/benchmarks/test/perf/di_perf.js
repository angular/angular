"use strict";
var util = require('../../../../tools/perf/util.js');

describe('ng2 di benchmark', function () {

  var URL = 'benchmarks/web/di/di_benchmark.html';

  afterEach(util.verifyNoErrors);

  it('should log the stats for getByToken', function() {
    browser.get(URL);
    util.runClickBenchmark({
      buttons: ['#getByToken'],
      name: browser.params.lang+'.ng2.di.getByToken'
    });
  });

  it('should log the stats for getByKey', function() {
    browser.get(URL);
    util.runClickBenchmark({
      buttons: ['#getByKey'],
      name: browser.params.lang+'.ng2.di.getByKey'
    });
  });

  it('should log the stats for getChild', function() {
    browser.get(URL);
    util.runClickBenchmark({
      buttons: ['#getChild'],
      name: browser.params.lang+'.ng2.di.getChild'
    });
  });

  it('should log the stats for instantiate', function() {
    browser.get(URL);
    util.runClickBenchmark({
      buttons: ['#instantiate'],
      name: browser.params.lang+'.ng2.di.instantiate'
    });
  });

});
