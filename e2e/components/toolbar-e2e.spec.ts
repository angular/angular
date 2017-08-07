import {browser, by, element} from 'protractor';
import {screenshot} from '../screenshot';

describe('md-toolbar', () => {

  beforeEach(() => browser.get('/toolbar'));

  it('should show a toolbar', async () => {
    expect(element(by.tagName('md-toolbar'))).toBeDefined();

    screenshot('multiple toolbar components');
  });

});
