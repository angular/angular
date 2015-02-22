var testUtil = require('angular2/e2e_test/test_util');
describe('hello world', function () {

  afterEach(testUtil.verifyNoBrowserErrors);

  describe('static reflection', function() {
    var URL = 'examples/src/hello_world/index_static.html';

    it('should greet', function() {
      browser.get(URL);

      expect(getComponentText('hello-app', '.greeting')).toBe('hello world!');
    });

    it('should change greeting', function() {
      browser.get(URL);

      clickComponentButton('hello-app', '.changeButton');
      expect(getComponentText('hello-app', '.greeting')).toBe('howdy world!');
    });
  });

  describe('dynamic reflection', function() {
    var URL = 'examples/src/hello_world/index.html';

    it('should greet', function() {
      browser.get(URL);

      expect(getComponentText('hello-app', '.greeting')).toBe('hello world!');
    });

    it('should change greeting', function() {
      browser.get(URL);

      clickComponentButton('hello-app', '.changeButton');
      expect(getComponentText('hello-app', '.greeting')).toBe('howdy world!');
    });
  });

});

function getComponentText(selector, innerSelector) {
  return browser.executeScript('return document.querySelector("'+selector+'").shadowRoot.querySelector("'+innerSelector+'").textContent');
}

function clickComponentButton(selector, innerSelector) {
  return browser.executeScript('return document.querySelector("'+selector+'").shadowRoot.querySelector("'+innerSelector+'").click()');
}
