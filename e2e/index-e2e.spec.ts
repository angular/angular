import {browser} from 'protractor';

describe('hello, protractor', () => {
  describe('index', () => {
    browser.get('/');
    it('should have a title', () => {
      expect(browser.getTitle()).toBe('Angular Material');
    });
  });
});
