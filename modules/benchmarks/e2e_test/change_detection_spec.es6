var testUtil = require('../../angular2/e2e_test/test_util');

describe('ng2 change detection benchmark', function () {

  var URL = 'benchmarks/src/change_detection/change_detection_benchmark.html';

  afterEach(testUtil.verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    testUtil.clickAll(['#ng2ChangeDetectionDynamic', '#ng2ChangeDetectionJit', '#baselineChangeDetection']);
  });

});
