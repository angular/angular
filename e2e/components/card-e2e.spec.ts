import {browser, by, element} from 'protractor';
import {screenshot} from '../screenshot';

describe('md-card', () => {
  describe('card-fancy', () => {
    beforeEach(() => browser.get('/card-fancy'));

    it('should show a card', async () => {
      const card = element(by.tagName('md-card'));
      expect(card).toBeDefined();

      screenshot('fancy card example');
    });
  });
});
