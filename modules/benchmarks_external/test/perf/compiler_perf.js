"use strict";
var util = require('../../../../tools/perf/util.js');

describe('ng1.x compiler benchmark', function () {

  var URL = 'benchmarks_external/web/compiler/compiler_benchmark.html';

  afterEach(util.verifyNoErrors);

  it('should log withBinding stats', function() {
    browser.get(URL);
    util.runClickBenchmark({
      buttons: ['#compileWithBindings'],
      name: browser.params.lang+'.ng1.compile.withBindings'
    });
  });

  it('should log noBindings stats', function() {
    util.runClickBenchmark({
      buttons: ['#compileNoBindings'],
      name: browser.params.lang+'.ng1.compile.noBindings'
    });
  });

});
