import {browser, by, element} from 'protractor';

describe('mat-toolbar', () => {

  beforeEach(async () => await browser.get('/toolbar'));

  it('should show a toolbar', async () => {
    expect(await element(by.tagName('mat-toolbar'))).toBeDefined();
  });

});
