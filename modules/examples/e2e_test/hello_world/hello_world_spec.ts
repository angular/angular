import {verifyNoBrowserErrors} from 'angular2/src/test_lib/e2e_util';

describe('hello world', function() {

  afterEach(verifyNoBrowserErrors);

  describe('static reflection', function() {
    var URL = 'examples/src/hello_world/index.html';

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

  describe('dynamic reflection', function() {
    var URL = 'examples/src/hello_world/index_dynamic.html';

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
