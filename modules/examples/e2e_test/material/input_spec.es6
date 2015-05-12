var testUtil = require('angular2/src/test_lib/e2e_util');

describe('md-input', function () {
  var url = 'examples/src/material/input/index.html';

  beforeEach(() => { browser.get(url); });
  afterEach(testUtil.verifyNoBrowserErrors);

  it('should enter a value to the input', () => {
    var input = element.all(by.css('md-input-container input')).first();

    input.sendKeys('Hello');

    expect(input.getAttribute('value')).toBe('Hello');
  });
});

