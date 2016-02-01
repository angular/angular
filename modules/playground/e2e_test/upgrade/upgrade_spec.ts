import {verifyNoBrowserErrors} from '../../../angular2/src/testing/e2e_util';

describe('hello world', function() {

  afterEach(verifyNoBrowserErrors);

  describe('upgrade app', function() {
    var URL = 'examples/src/upgrade/index.html';

    it('should greet', function() {
      browser.get(URL);

      expect(getComponentText('user', '.greeting')).toEqual('Greetings from World!');
    });

    it('should reset', function() {
      browser.get(URL);

      clickComponentButton('user', 'button');
      expect(getComponentText('hello-app', '.greeting')).toEqual('Greetings from !');
    });
  });

});

function getComponentText(selector, innerSelector) {
  return browser.executeScript('return document.querySelector("' + selector + '").querySelector("' +
                               innerSelector + '").textContent');
}

function clickComponentButton(selector, innerSelector) {
  return browser.executeScript('return document.querySelector("' + selector + '").querySelector("' +
                               innerSelector + '").click()');
}
