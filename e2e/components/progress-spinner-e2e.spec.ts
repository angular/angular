import {browser, by, element} from 'protractor';

describe('progress-spinner', () => {
  beforeEach(() => browser.get('/progress-spinner'));

  it('should render a determinate progress spinner', () => {
    expect(element(by.css('mat-progress-spinner')).isPresent()).toBe(true);
  });

  it('should render an indeterminate progress spinner', () => {
    expect(element(by.css('mat-progress-spinner[mode="indeterminate"]')).isPresent()).toBe(true);
  });

  it('should render a spinner', () => {
    expect(element(by.css('mat-spinner')).isPresent()).toBe(true);
  });
});
