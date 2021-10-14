import {browser, by, element} from 'protractor';

describe('mat-table', () => {
  beforeEach(async () => await browser.get('/mdc-table'));

  it('should show a table', async () => {
    expect(await element(by.tagName('table')).isPresent()).toBe(true);
  });
});
