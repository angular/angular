import {browser} from 'protractor';

describe('hello, protractor', () => {
  describe('index', () => {

    beforeAll(async () => browser.get('/'));

    it('should have a title', async () => {
      expect(await browser.getTitle()).toBe('Angular Material');
    });
  });
});
