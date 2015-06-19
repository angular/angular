var testUtil = require('angular2/src/test_lib/e2e_util');

describe('md-tabs', function () {
  var url = 'examples/src/material/tabs/index.html';

  beforeEach(() => { browser.get(url); });
  afterEach(testUtil.verifyNoBrowserErrors);

  it('should switch between tabs', function() {
    var tabs = element.all(by.css('.md-tab'));
    var tabContent = element(by.css('.md-tab-content'));

    var firstTab = tabs.first();
    var lastTab = tabs.last();

    firstTab.click();
    expect(tabContent.getText()).toBe('Carrots, beets');

    lastTab.click();
    expect(tabContent.getText()).toBe('Cotton candy');
  });
});

