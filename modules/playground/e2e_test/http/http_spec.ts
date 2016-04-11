import {verifyNoBrowserErrors} from 'angular2/src/testing/e2e_util';

describe('http', function() {

  afterEach(verifyNoBrowserErrors);

  describe('fetching', function() {
    var URL = 'playground/src/http/index.html';

    it('should fetch and display people', function() {
      browser.get(URL);
      expect(getComponentText('http-app', '.people')).toEqual('hello, Jeff');
    });
  });
});

function getComponentText(selector, innerSelector) {
  return browser.executeScript('return document.querySelector("' + selector + '").querySelector("' +
                               innerSelector + '").textContent.trim()');
}
