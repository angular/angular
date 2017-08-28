import {browser, by, element} from 'protractor';
import {screenshot} from '../screenshot';

describe('md-card', () => {

  beforeEach(() => browser.get('/cards'));

  it('should show a card', async () => {
    const card = element(by.tagName('md-card'));
    expect(card).toBeDefined();

    screenshot('fancy card example');
  });

});
