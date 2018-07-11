import {browser, by, element} from 'protractor';

describe('mat-card', () => {

  beforeEach(() => browser.get('/cards'));

  it('should show a card', async () => {
    const card = element(by.tagName('mat-card'));
    expect(card).toBeDefined();
  });

});
