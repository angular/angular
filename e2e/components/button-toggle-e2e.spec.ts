import {browser, by, element} from 'protractor';

describe('button-toggle', () => {

  beforeEach(() => browser.get('/button-toggle'));

  it('should show a button-toggle', async () => {
    expect(element(by.tagName('mat-button-toggle'))).toBeDefined();
  });

});
