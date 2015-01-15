var perfUtil = require('../../e2e_test_lib/e2e_test/perf_util');

describe('ng2 di benchmark', function () {

  var URL = 'benchmarks/web/di/di_benchmark.html';

  afterEach(perfUtil.verifyNoBrowserErrors);

  it('should log the stats for getByToken', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#getByToken'],
      id: 'ng2.di.getByToken',
      params: [{
        name: 'iterations', value: 20000, scale: 'linear'
      }]
    });
  });

  it('should log the stats for getByKey', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#getByKey'],
      id: 'ng2.di.getByKey',
      params: [{
        name: 'iterations', value: 20000, scale: 'linear'
      }]
    });
  });

  it('should log the stats for getChild', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#getChild'],
      id: 'ng2.di.getChild',
      params: [{
        name: 'iterations', value: 20000, scale: 'linear'
      }]
    });
  });

  it('should log the stats for instantiate', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#instantiate'],
      id: 'ng2.di.instantiate',
      params: [{
        name: 'iterations', value: 10000, scale: 'linear'
      }]
    });
  });

});
