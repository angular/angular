var benchpress = require('../../../tools/benchpress/index.js');

describe('ng1.x compiler benchmark', function () {

  var URL = 'benchmarks_external/web/compiler/compiler_benchmark.html';

  afterEach(benchpress.verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    clickAll(['#compileWithBindings', '#compileNoBindings']);
  });

});

function clickAll(buttonSelectors) {
  buttonSelectors.forEach(function(selector) {
    $(selector).click();
  });
}
