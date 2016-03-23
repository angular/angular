import {verifyNoBrowserErrors} from 'angular2/src/testing/e2e_util';

describe('Upgrade', function() {
  var URL = 'playground/src/upgrade/index.html';

  beforeEach(() => browser.rootEl = 'body');  // Force Protractor to NG1 mode
  afterEach(() => browser.rootEl = null);

  it('should work', () => {
    browser.get(URL);
    verifyNoBrowserErrors();

    expect(element(by.css('.greeting')).getText()).toEqual('Greetings from World!');
    expect(element(by.css('.title')).getText()).toEqual('Title: World');
  });

});
