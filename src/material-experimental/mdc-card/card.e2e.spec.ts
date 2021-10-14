import {browser, by, element} from 'protractor';

describe('mat-card', () => {
  beforeEach(async () => await browser.get('/mdc-card'));

  it('should show a card', async () => {
    expect(await element(by.tagName('mat-card')).isPresent()).toBe(true);
  });
});
