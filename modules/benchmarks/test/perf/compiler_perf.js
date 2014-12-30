"use strict";
var util = require('../../../../tools/perf/util.js');

describe('ng2 compiler benchmark', function () {

  var URL = 'benchmarks/web/compiler/compiler_benchmark.html';

  afterEach(util.verifyNoErrors);

  it('should log withBindings stats', function() {
    browser.get(URL);
    util.runClickBenchmark({
      buttons: ['#compileWithBindings'],
      name: browser.params.lang+'.ng2.compile.withBindings'
    });
  });

  it('should log noBindings stats', function() {
    browser.get(URL);
    util.runClickBenchmark({
      buttons: ['#compileNoBindings'],
      name: browser.params.lang+'.ng2.compile.noBindings'
    });
  });

});
