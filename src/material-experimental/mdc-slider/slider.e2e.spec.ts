import {browser, by, element} from 'protractor';

describe('mat-slider', () => {

  beforeEach(async () => await browser.get('/mdc-slider'));

  it('should show a slider', async () => {
    expect(await element(by.tagName('mat-slider')).isPresent()).toBe(true);
  });

});
