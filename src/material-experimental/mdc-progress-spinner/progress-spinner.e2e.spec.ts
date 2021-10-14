import {browser, by, element} from 'protractor';

describe('MDC-based progress-spinner', () => {
  beforeEach(async () => await browser.get('/mdc-progress-spinner'));

  it('should render a determinate progress spinner', async () => {
    expect(await element(by.css('mat-progress-spinner')).isPresent()).toBe(true);
  });

  it('should render an indeterminate progress spinner', async () => {
    expect(await element(by.css('mat-progress-spinner[mode="indeterminate"]')).isPresent()).toBe(
      true,
    );
  });

  it('should render a spinner', async () => {
    expect(await element(by.css('mat-spinner')).isPresent()).toBe(true);
  });
});
