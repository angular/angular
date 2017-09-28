import {browser, by, element} from 'protractor';
import {screenshot} from '../screenshot';

describe('button-toggle', () => {

  beforeEach(() => browser.get('/button-toggle'));

  it('should show a button-toggle', async () => {
    expect(element(by.tagName('mat-button-toggle'))).toBeDefined();
    screenshot();
  });

});
