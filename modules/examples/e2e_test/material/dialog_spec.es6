var testUtil = require('angular2/src/test_lib/e2e_util');

describe('md-dialog', function () {
  var url = 'examples/src/material/dialog/index.html';

  beforeEach(() => { browser.get(url); });
  afterEach(testUtil.verifyNoBrowserErrors);

  it('should open a dialog', function() {
    var openButton = element(by.id('open'));
    openButton.click();
    expect(element(by.css('.md-dialog')).isPresent()).toBe(true);

    var dialog = element(by.css('.md-dialog'));
    dialog.sendKeys(protractor.Key.ESCAPE);

    expect(element(by.css('.md-dialog')).isPresent()).toBe(false);
  });
});
