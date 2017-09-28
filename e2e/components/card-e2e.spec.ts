import {browser, by, element} from 'protractor';
import {screenshot} from '../screenshot';

describe('mat-card', () => {

  beforeEach(() => browser.get('/cards'));

  it('should show a card', async () => {
    const card = element(by.tagName('mat-card'));
    expect(card).toBeDefined();

    screenshot('fancy card example');
  });

});
