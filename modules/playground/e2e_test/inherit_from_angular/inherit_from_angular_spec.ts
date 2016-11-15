import {verifyNoBrowserErrors} from '@angular/platform-browser/testing_e2e';

describe('inherit from angular', function() {

  afterEach(verifyNoBrowserErrors);

  describe('inherit from angular app', function() {
    var URL = 'all/playground/src/inherit_from_angular/index.html';

    it('should display that the service was injected properly', function() {
      browser.get(URL);

      expect(getComponentText('my-app', '.service')).toEqual('Your service is present');
    });
  });

});

function getComponentText(selector, innerSelector) {
  return browser.executeScript('return document.querySelector("' + selector + '").querySelector("' +
                               innerSelector + '").textContent');
}
