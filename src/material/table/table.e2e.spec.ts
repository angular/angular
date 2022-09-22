import {browser, by, element} from 'protractor';

describe('table', () => {
  beforeEach(async () => await browser.get('/table'));

  it('should show a table', async () => {
    expect(await element(by.tagName('table')).isPresent()).toBe(true);
  });
});
