describe('progress-bar', () => {
  beforeEach(() => browser.get('/progress-bar'));

  it('should render a determinate progress bar', () => {
    shouldExist('md-progress-bar[mode="determinate"]');
  });

  it('should render a buffer progress bar', () => {
    shouldExist('md-progress-bar[mode="buffer"]');
  });

  it('should render a query progress bar', () => {
    shouldExist('md-progress-bar[mode="query"]');
  });

  it('should render a indeterminate progress bar', () => {
    shouldExist('md-progress-bar[mode="indeterminate"]');
  });

  function shouldExist(selector: string): void {
    expect(element(by.css(selector)).isPresent()).toBe(true);
  }
});
