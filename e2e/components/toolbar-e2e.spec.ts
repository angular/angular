import {browser, by, element} from 'protractor';

describe('mat-toolbar', () => {

  beforeEach(() => browser.get('/toolbar'));

  it('should show a toolbar', async () => {
    expect(element(by.tagName('mat-toolbar'))).toBeDefined();
  });

});
