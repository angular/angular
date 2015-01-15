var testUtil = require('../../e2e_test_lib/e2e_test/test_util');

describe('ng1.x largetable benchmark', function () {
  var URL = 'benchmarks_external/web/largetable/largetable_benchmark.html';

  afterEach(testUtil.verifyNoBrowserErrors);

  [
    'baselineBinding',
    'baselineInterpolation',
    'ngBind',
    'ngBindOnce',
    'interpolation',
    'interpolationAttr',
    'ngBindFn',
    'interpolationFn',
    'ngBindFilter',
    'interpolationFilter'
  ].forEach(function(benchmarkType) {
    it('should log the stats with: ' + benchmarkType, function() {
      browser.get(URL + '?benchmarkType='+benchmarkType);
      testUtil.clickAll(['#createDom', '#destroyDom']);
    });
  });
});
