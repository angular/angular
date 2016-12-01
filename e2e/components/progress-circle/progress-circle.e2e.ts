describe('progress-circle', () => {
  beforeEach(() => browser.get('/progress-circle'));

  it('should render a determinate progress circle', () => {
    expect(element(by.css('md-progress-circle')).isPresent()).toBe(true);
  });

  it('should render an indeterminate progress circle', () => {
    expect(element(by.css('md-progress-circle[mode="indeterminate"]')).isPresent()).toBe(true);
  });

  it('should render a spinner', () => {
    expect(element(by.css('md-spinner')).isPresent()).toBe(true);
  });
});
