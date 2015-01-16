var perfUtil = require('../../e2e_test_lib/e2e_test/perf_util');

describe('ng2 selector benchmark', function () {

  var URL = 'benchmarks/web/compiler/selector_benchmark.html';

  afterEach(perfUtil.verifyNoBrowserErrors);

  it('should log parse stats', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#parse'],
      id: 'ng2.selector.parse',
      params: [{
        name: 'selectors', value: 10000, scale: 'linear'
      }]
    });
  });

  it('should log addSelectable stats', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#addSelectable'],
      id: 'ng2.selector.addSelectable',
      params: [{
        name: 'selectors', value: 10000, scale: 'linear'
      }]
    });
  });

  it('should log match stats', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#match'],
      id: 'ng2.selector.match',
      params: [{
        name: 'selectors', value: 10000, scale: 'linear'
      }]
    });
  });

});
