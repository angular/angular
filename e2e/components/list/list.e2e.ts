import {browser, by, element} from 'protractor';

describe('list', () => {
  beforeEach(() => browser.get('/list'));

  it('should render a list container', () => {
    expect(element(by.css('md-list')).isPresent()).toBe(true);
  });

  it('should render list items inside the list container', () => {
    let container = element(by.css('md-list'));
    expect(container.isElementPresent(by.css('md-list-item'))).toBe(true);
  });
});
