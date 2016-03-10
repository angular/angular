const screenshot = require('./_screenshot.js');

describe('hello, protractor', function () {
  describe('index', function () {
    browser.get('/');
    it('should have a title', function () {
      expect(browser.getTitle()).toBe('Material2');
      screenshot('initial state');
    });
  });
});

