import {verifyNoBrowserErrors} from 'angular2/src/testing/e2e_util';

describe('hello world', function() {

  afterEach(verifyNoBrowserErrors);

  describe('hello world app', function() {
    var URL = 'playground/src/hello_world_custom_interpolation/index.html';

    it('should greet', function() {
      browser.get(URL);

      expect(getComponentText('hello-app', '.greeting')).toEqual('hello world!');
    });

    it('should change greeting', function() {
      browser.get(URL);

      clickComponentButton('hello-app', '.changeButton');
      expect(getComponentText('hello-app', '.greeting')).toEqual('howdy world!');
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
