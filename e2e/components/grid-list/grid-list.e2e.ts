import {browser, by, element} from 'protractor';

describe('grid-list', () => {
  beforeEach(() => browser.get('/grid-list'));

  it('should render a grid list container', () => {
    expect(element(by.css('md-grid-list')).isPresent()).toBe(true);
  });

  it('should render list items inside the grid list container', () => {
    let container = element(by.css('md-grid-list'));
    expect(container.isElementPresent(by.css('md-grid-tile'))).toBe(true);
  });
});
