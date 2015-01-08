var benchpress = require('../../../tools/benchpress/index.js');

describe('ng2 element injector benchmark', function () {

  var URL = 'benchmarks/web/element_injector/element_injector_benchmark.html';

  afterEach(benchpress.verifyNoBrowserErrors);

  it('should not throw errors', function() {
    browser.get(URL);
    clickAll(['#instantiate', '#instantiateDirectives']);
  });

});

function clickAll(buttonSelectors) {
  buttonSelectors.forEach(function(selector) {
    $(selector).click();
  });
}
