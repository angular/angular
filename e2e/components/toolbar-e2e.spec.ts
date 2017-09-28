import {browser, by, element} from 'protractor';
import {screenshot} from '../screenshot';

describe('mat-toolbar', () => {

  beforeEach(() => browser.get('/toolbar'));

  it('should show a toolbar', async () => {
    expect(element(by.tagName('mat-toolbar'))).toBeDefined();

    screenshot('multiple toolbar components');
  });

});
