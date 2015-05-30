/// <reference path="../../angular2/typings/node/node.d.ts" />
import {afterEach, describe, it} from 'angular2/test_lib';

var perfUtil = require('angular2/src/test_lib/perf_util');

describe('ng2 cost benchmark', function() {

  var URL = 'benchmarks/src/costs/index.html';

  // Number of components to create in a single iteration
  var benchmarkSize = 200;

  afterEach(perfUtil.verifyNoBrowserErrors);

  it('should log stats for baseline (plain components)', function(done) {
    perfUtil.runClickBenchmark({
              url: URL,
              buttons: ['#reset', '#createPlainComponents'],
              id: 'ng2.costs.baseline',
              params: [{name: 'size', value: benchmarkSize, scale: 'linear'}]
            })
        .then(done, done.fail);
  });

  it('should log stats for components with decorators', function(done) {
    perfUtil.runClickBenchmark({
              url: URL,
              buttons: ['#reset', '#createComponentsWithDirectives'],
              id: 'ng2.costs.decorators',
              params: [{name: 'size', value: benchmarkSize, scale: 'linear'}]
            })
        .then(done, done.fail);
  });

  it('should log stats for dynamic components', function(done) {
    perfUtil.runClickBenchmark({
              url: URL,
              buttons: ['#reset', '#createDynamicComponents'],
              id: 'ng2.costs.dynamic',
              params: [{name: 'size', value: benchmarkSize, scale: 'linear'}]
            })
        .then(done, done.fail);
  });
});
