import {verifyNoBrowserErrors} from 'angular2/src/testing/e2e_util';

describe('jsonp', function() {

  afterEach(verifyNoBrowserErrors);

  describe('fetching', function() {
    var URL = 'playground/src/jsonp/index.html';

    it('should fetch and display people', function() {
      browser.get(URL);
      expect(getComponentText('jsonp-app', '.people')).toEqual('hello, caitp');
    });
  });
});

function getComponentText(selector, innerSelector) {
  return browser.executeScript('return document.querySelector("' + selector + '").querySelector("' +
                               innerSelector + '").textContent.trim()');
}
