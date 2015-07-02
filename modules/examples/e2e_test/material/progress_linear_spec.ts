import {verifyNoBrowserErrors} from 'angular2/src/test_lib/e2e_util';

describe('md-progress-linear', function() {
  var url = 'examples/src/material/progress-linear/index.html';

  beforeEach(() => { browser.get(url); });
  afterEach(verifyNoBrowserErrors);

  it('should increment and decrement progress', function() {
    var progressBar = element.all(by.css('md-progress-linear')).first();
    var incrementButton = element(by.id('increment'));
    var decrementButton = element(by.id('decrement'));

    var initialValue = progressBar.getAttribute('aria-valuenow');

    incrementButton.click();
    expect(progressBar.getAttribute('aria-valuenow')).toBeGreaterThan(initialValue);

    decrementButton.click();
    decrementButton.click();
    expect(progressBar.getAttribute('aria-valuenow')).toBeLessThan(initialValue);
  });
});
